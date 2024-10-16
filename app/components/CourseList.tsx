"use client";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Wrap,
  WrapItem,
  Progress,
  Spinner,
  Tooltip,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/app/context/WalletContext";
import useWalletConnect from "@/app/hooks/walletConnect";

interface Course {
  _id: string;
  courseId: string;
  title: string;
  description: string;
  tags: string[];
  price: number;
  rewards: number;
  imageUrl: string;
}

const filters = [
  "Aptos",
  "Move",
  "Beginner",
  "Intermediate",
  "Advanced",
  "Blockchain",
  "Fungible Assets",
  "Digital Assets",
  "dApps",
  "Security",
  "Cross-Chain",
];

const CourseList = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [challengesCount, setChallengesCount] = useState<
    Record<string, number>
  >({});
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingCourse, setPendingCourse] = useState<Course | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0); // Store user balance here

  const { sendTransaction } = useWalletConnect();
  const { isLoggedIn, address, connectWallet, fetchUserProfile, userProgress } =
    useWallet();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  const {
    isOpen: isLoginDialogOpen,
    onOpen: openLoginDialog,
    onClose: closeLoginDialog,
  } = useDisclosure();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/fetchCourses");
        const data = await response.json();
        setCourses(data.courses);

        await Promise.all(
          data.courses.map(async (course: Course) => {
            const response = await fetch(
              `/api/fetchChallengesByCourse?courseId=${course.courseId}`,
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              }
            );
            const challengeData = await response.json();
            setChallengesCount((prev) => ({
              ...prev,
              [course.courseId]: challengeData.challenges.length,
            }));
          })
        );

        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (isLoggedIn && address) {
      fetchUserProfile();
      fetchUserBalance(); // Fetch balance when logged in
    }
  }, [isLoggedIn, address]);

  // Fetch user balance from the API
  const fetchUserBalance = async () => {
    try {
      const response = await fetch("/api/getTokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await response.json();

      setUserBalance(data.balance);
    } catch (error) {
      console.error("Error fetching user balance:", error);
    }
  };

  const handleFilterClick = (filter: string) => {
    setActiveFilters((prevFilters) =>
      prevFilters.includes(filter)
        ? prevFilters.filter((f) => f !== filter)
        : [...prevFilters, filter]
    );
  };

  const filteredCourses = activeFilters.length
    ? courses.filter((course) =>
        course.tags.some((tag) => activeFilters.includes(tag))
      )
    : courses;

  const handleStartCourse = async (course: Course) => {
    try {
      const sessionResponse = await fetch("/api/session", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const sessionData = await sessionResponse.json();

      if (!sessionData.loggedIn) {
        setPendingCourse(course);
        openLoginDialog();
        return;
      }

      if (userProgress[course.courseId]?.unlocked) {
        router.push(`/course/${course.courseId}`);
      } else {
        setPendingCourse(course);
        onOpen();
      }
    } catch (error) {
      console.error("Error checking session or starting course:", error);
    }
  };

  // Updated handleBuyCourse to fetch balance and proceed with transaction and unlocking course
  const handleBuyCourse = async () => {
    if (pendingCourse) {
      if (userBalance >= pendingCourse.price) {
        try {
          const tokenAmount = pendingCourse.price * Math.pow(10, 7);

          // Send the transaction using the sendTransaction function
          const tx = await sendTransaction(
            [tokenAmount],
            "0xd230d19a81aa24f6c8a3ff72b309186a331d2d62821a2b903d8870bda851cf5b::quest_token::burn",
            "entry_function_payload",
            []
          );

          // Check if the token burn transaction was successful
          if (tx.success) {
            toast({
              title: "Tokens Burned",
              description: `Successfully burned ${pendingCourse.price} tokens.`,
              status: "success",
              duration: 3000,
              isClosable: true,
              position: "top-right",
            });

            // Unlock the course after the burn transaction is successful
            const unlockResponse = await fetch("/api/unlockCourse", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                courseId: pendingCourse.courseId,
                price: pendingCourse.price,
              }),
            });

            const unlockData = await unlockResponse.json();

            // Check if the course unlock was successful
            if (unlockData.success) {
              toast({
                title: "Course Unlocked",
                description: `You have successfully unlocked the course "${pendingCourse.title}".`,
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top-right",
              });

              // Navigate to the course page
              onClose();
              router.push(`/course/${pendingCourse.courseId}`);
            } else {
              throw new Error(unlockData.message);
            }
          } else {
            throw new Error("Transaction failed.");
          }
        } catch (error) {
          toast({
            title: "Purchase Error",
            description:
              error instanceof Error
                ? error.message
                : "Failed to complete the purchase.",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
        }
      } else {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough tokens to purchase this course.",
          status: "warning",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      }
    }
  };

  const handleLogin = async () => {
    try {
      await connectWallet();
      closeLoginDialog();
      if (isLoggedIn && address) {
        fetchUserProfile();
        if (pendingCourse) {
          handleStartCourse(pendingCourse);
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" color="teal.500" />
      </Flex>
    );
  }

  return (
    <Box p={8} w="100%" maxW="1200px" mx="auto">
      <Heading as="h2" size="2xl" mb={6} color="white">
        Courses
      </Heading>
      <Wrap spacing={4} mb={8}>
        {filters.map((filter) => (
          <WrapItem key={filter}>
            <Button
              variant={activeFilters.includes(filter) ? "solid" : "outline"}
              colorScheme={
                activeFilters.includes(filter) ? "whiteAlpha" : "whiteAlpha"
              }
              onClick={() => handleFilterClick(filter)}
            >
              {filter}
            </Button>
          </WrapItem>
        ))}
      </Wrap>

      <Flex direction="column" gap={8}>
        {filteredCourses.map((course) => {
          const completedChallenges =
            userProgress[course.courseId]?.completedChallenges || 0;
          const totalChallenges = challengesCount[course.courseId] || 0;

          const progressPercentage =
            totalChallenges > 0
              ? (completedChallenges / totalChallenges) * 100
              : 0;

          return (
            <Flex
              key={course._id}
              direction="column"
              bg="gray.900"
              p={8}
              borderRadius="xl"
              justify="space-between"
              align="start"
              w="100%"
            >
              {/* Course Title, Description, and Tags */}
              <VStack align="start" flex={1} color="white" spacing={6} w="100%">
                {/* Title */}
                <Heading as="h3" size="lg">
                  {course.title}
                </Heading>

                {/* Description */}
                <Text fontSize="md" color="gray.300">
                  {course.description}
                </Text>

                {/* Tags */}
                <HStack wrap="wrap" spacing={4}>
                  {course.tags.map((tag) => (
                    <Text key={tag} fontSize="sm" color="gray.500">
                      {tag}
                    </Text>
                  ))}
                </HStack>

                {/* Price, Rewards, and Challenges Info */}
                <Flex
                  direction={{ base: "column", md: "row" }}
                  align="start"
                  gap={6}
                  w="100%"
                >
                  {/* Price */}
                  <Tooltip
                    label="Price of the course"
                    aria-label="Price Tooltip"
                  >
                    <HStack align="center" spacing={2}>
                      <Box
                        bg="teal.500"
                        p={2}
                        borderRadius="full"
                        boxSize="32px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        💰
                      </Box>
                      <Text fontWeight="bold" fontSize="lg">
                        {course.price === 0 ? "FREE" : `${course.price} Tokens`}
                      </Text>
                    </HStack>
                  </Tooltip>

                  {/* Rewards */}
                  <Tooltip
                    label="A reward for completing the course"
                    aria-label="Rewards Tooltip"
                  >
                    <HStack align="center" spacing={2}>
                      <Box
                        bg="yellow.500"
                        p={2}
                        borderRadius="full"
                        boxSize="32px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        🎁
                      </Box>
                      <Text fontWeight="bold" fontSize="lg">
                        {course.rewards} Tokens
                      </Text>
                    </HStack>
                  </Tooltip>

                  {/* Total Challenges */}
                  <HStack align="center" spacing={2}>
                    <Box
                      bg="blue.500"
                      p={2}
                      borderRadius="full"
                      boxSize="32px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      📋
                    </Box>
                    <Text fontWeight="bold" fontSize="lg">
                      {totalChallenges} Challenges
                    </Text>
                  </HStack>
                </Flex>

                {/* Progress Bar */}
                {isLoggedIn && (
                  <Box w="100%">
                    <Progress
                      value={progressPercentage}
                      colorScheme="teal"
                      size="sm"
                      width="100%"
                    />
                    <Text color="white" fontSize="sm" mt={2}>
                      {Math.round(progressPercentage)}% Completed
                    </Text>
                  </Box>
                )}

                {/* Start Course Button */}
                <Button
                  colorScheme="teal"
                  size="md"
                  w="50%"
                  onClick={() => handleStartCourse(course)}
                >
                  Start Now
                </Button>
              </VStack>
            </Flex>
          );
        })}
      </Flex>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Purchase Course
            </AlertDialogHeader>
            <AlertDialogBody>
              {pendingCourse && (
                <>
                  <Text>
                    You need to unlock the course{" "}
                    <strong>{pendingCourse.title}</strong> for{" "}
                    <strong>{pendingCourse.price} Tokens</strong> before
                    starting.
                  </Text>
                  <Text mt={2}>
                    Your current balance is{" "}
                    <strong>{userBalance} Tokens</strong>.
                  </Text>
                </>
              )}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="teal" onClick={handleBuyCourse} ml={3}>
                Buy
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog
        isOpen={isLoginDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeLoginDialog}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Login Required
            </AlertDialogHeader>

            <AlertDialogBody>
              You need to log in to your wallet to start this course.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeLoginDialog}>
                Cancel
              </Button>
              <Button colorScheme="teal" onClick={handleLogin} ml={3}>
                Login
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default CourseList;
