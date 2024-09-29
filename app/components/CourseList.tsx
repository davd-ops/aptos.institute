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
import walletConnect from "@/app/hooks/walletConnect";

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
  "Smart Contracts",
  "Scalability",
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
  const [userProgress, setUserProgress] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingCourse, setPendingCourse] = useState<Course | null>(null); // Store course details for pending unlock
  const { isLoggedIn, address, connectWallet, verificationStatus } =
    walletConnect();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast(); // For notifications
  const [userBalance, setUserBalance] = useState(0); // Store user's token balance

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
      const fetchUserProgressAndBalance = async () => {
        try {
          const progressMap: Record<string, any> = {};
          const userResponse = await fetch(`/api/profile`);
          const userData = await userResponse.json();

          if (userData) {
            setUserBalance(userData.balance);
            userData.coursesUnlocked.forEach((unlockedCourseId: string) => {
              progressMap[unlockedCourseId] = { unlocked: true };
            });
          }

          setUserProgress(progressMap);
        } catch (error) {
          console.error("Error fetching user progress or balance:", error);
        }
      };
      fetchUserProgressAndBalance();
    }
  }, [isLoggedIn, address, courses]);

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
        router.push("/login"); // Redirect to login if not logged in
        return;
      }

      // Check if course is unlocked
      if (userProgress[course.courseId]?.unlocked) {
        router.push(`/course/${course.courseId}`); // Redirect if course is already unlocked
      } else {
        // Course not unlocked, show dialog to purchase
        setPendingCourse(course);
        onOpen(); // Open the purchase dialog
      }
    } catch (error) {
      console.error("Error checking session or starting course:", error);
    }
  };

  const handleBuyCourse = async () => {
    if (pendingCourse) {
      if (userBalance >= pendingCourse.price) {
        try {
          const response = await fetch("/api/unlockCourse", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              courseId: pendingCourse.courseId,
              price: pendingCourse.price,
            }),
          });

          const data = await response.json();

          if (data.success) {
            setUserBalance((prevBalance) => prevBalance - pendingCourse.price);
            toast({
              title: "Course Unlocked",
              description: `You have successfully unlocked the course "${pendingCourse.title}".`,
              status: "success",
              duration: 3000,
              isClosable: true,
              position: "top-right",
            });

            // After successful unlock, proceed to course
            onClose();
            router.push(`/course/${pendingCourse.courseId}`); // Redirect after unlocking
          } else {
            throw new Error(data.message);
          }
        } catch (error) {
          toast({
            title: "Purchase Error",
            description:
              error instanceof Error
                ? error.message
                : "Failed to unlock the course.",
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
          const completedChallenges = Array.isArray(
            userProgress[course.courseId]
          )
            ? userProgress[course.courseId].filter(
                (progress: any) => progress.completed
              ).length
            : 0;

          const totalChallenges = challengesCount[course.courseId] || 0;
          const progressPercentage =
            totalChallenges > 0
              ? (completedChallenges / totalChallenges) * 100
              : 0;

          return (
            <Flex
              key={course._id}
              direction={{ base: "column", md: "row" }}
              bg="gray.900"
              p={8}
              borderRadius="xl"
              justify="space-between"
              align="center"
            >
              <VStack
                align="start"
                flex={1}
                color="white"
                spacing={6}
                maxW={{ base: "100%", md: "60%" }}
              >
                <Heading as="h3" size="lg">
                  {course.title}
                </Heading>
                <Text fontSize="md">{course.description}</Text>
                <HStack wrap="wrap" spacing={4}>
                  {course.tags.map((tag) => (
                    <Text key={tag} fontSize="sm" color="gray.500">
                      {tag}
                    </Text>
                  ))}
                </HStack>
                <Flex
                  direction={{ base: "column", md: "row" }}
                  align="start"
                  gap={6}
                >
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
                <Button
                  colorScheme="teal"
                  size="md"
                  onClick={() => handleStartCourse(course)}
                >
                  Start Now
                </Button>
              </VStack>

              <Box flex={1} textAlign="center" maxW="200px" p={4}>
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  style={{ maxHeight: "150px", objectFit: "cover" }}
                />
              </Box>
            </Flex>
          );
        })}
      </Flex>

      {/* AlertDialog for course purchase */}
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
    </Box>
  );
};

export default CourseList;
