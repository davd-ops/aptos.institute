import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  VStack,
  Text,
  IconButton,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useWallet } from "@/app/context/WalletContext";
import useWalletConnect from "@/app/hooks/walletConnect"; // Import the wallet connect hook

interface Course {
  _id: string;
  courseId: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
}

const FeaturedCourses = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const {
    isOpen: isLoginDialogOpen,
    onOpen: openLoginDialog,
    onClose: closeLoginDialog,
  } = useDisclosure();
  const {
    isOpen: isPurchaseDialogOpen,
    onOpen: openPurchaseDialog,
    onClose: closePurchaseDialog,
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const { isLoggedIn, connectWallet, fetchUserProfile, address, userProgress } =
    useWallet();
  const { sendTransaction } = useWalletConnect(); // Use the sendTransaction function from the wallet connect hook

  const [pendingCourse, setPendingCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [userBalance, setUserBalance] = useState<number | null>(null); // State to store fetched balance
  const toast = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/fetchCourses");
        const data = await response.json();
        const topCourses = data.courses.slice(0, 3);
        setFeaturedCourses(topCourses);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching featured courses:", error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch user's token balance
  const fetchUserBalance = async (userAddress: string) => {
    try {
      const response = await fetch("/api/getTokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: userAddress }),
      });

      const data = await response.json();
      if (data.success) {
        setUserBalance(data.balance); // Set the fetched balance
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error fetching token balance:", error);
    }
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredCourses.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? featuredCourses.length - 1 : prevIndex - 1
    );
  };

  const handleStartCourse = async (course: Course) => {
    if (!isLoggedIn) {
      setPendingCourse(course);
      openLoginDialog();
      return;
    }

    // Fetch user balance before starting the course
    if (address) {
      await fetchUserBalance(address);
    }

    if (userProgress[course.courseId]?.unlocked) {
      router.push(`/course/${course.courseId}`);
    } else {
      setPendingCourse(course);
      openPurchaseDialog();
    }
  };

  const handleBuyCourse = async () => {
    if (pendingCourse && userBalance !== null) {
      if (userBalance >= pendingCourse.price) {
        try {
          const tokenAmount = pendingCourse.price * Math.pow(10, 7); // Convert to the correct token unit

          // Send the transaction using the sendTransaction function
          const tx = await sendTransaction(
            [tokenAmount],
            "0xd230d19a81aa24f6c8a3ff72b309186a331d2d62821a2b903d8870bda851cf5b::quest_token::burn",
            "entry_function_payload",
            []
          );

          // Check if the transaction was successful
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
              closePurchaseDialog();
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
        await fetchUserBalance(address); // Fetch the balance on login
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

  const { title, description } = featuredCourses[currentIndex];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <Box position="relative" w="100%" h="400px" overflow="hidden" py={16}>
      <IconButton
        aria-label="Previous Course"
        icon={<ChevronLeftIcon />}
        position="absolute"
        top="50%"
        left="60px"
        transform="translateY(-50%)"
        zIndex={1}
        onClick={handlePrev}
        colorScheme="aptosBlueMedium"
        size="lg"
        fontSize="40px"
        p={4}
      />
      <IconButton
        aria-label="Next Course"
        icon={<ChevronRightIcon />}
        position="absolute"
        top="50%"
        right="60px"
        transform="translateY(-50%)"
        zIndex={1}
        onClick={handleNext}
        colorScheme="aptosBlueMedium"
        size="lg"
        fontSize="40px"
        p={4}
      />

      <motion.div
        key={currentIndex}
        custom={direction}
        initial="enter"
        animate="center"
        exit="exit"
        variants={variants}
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
        style={{ height: "100%", width: "100%" }}
      >
        <Flex
          direction="column"
          h="100%"
          align="center"
          justify="center"
          textAlign="center"
          p={8}
          mx="auto"
          maxW="1200px"
        >
          <VStack
            spacing={4}
            align="start"
            flex={1}
            maxW={{ base: "100%", md: "80%" }}
            px={{ base: 0, md: 10 }}
            color="white"
            textAlign={{ base: "center", md: "left" }}
          >
            {/* Title */}
            <Heading as="h3" size="xl" mb={4} fontWeight="bold">
              {title}
            </Heading>

            {/* Description */}
            <Text fontSize="lg" mb={4}>
              {description}
            </Text>

            {/* Start Now Button */}
            <Button
              bg="teal.400"
              color="white"
              _hover={{ bg: "teal.300" }}
              size="lg"
              alignSelf={{ base: "center", md: "start" }}
              onClick={() => handleStartCourse(featuredCourses[currentIndex])}
            >
              Start Now
            </Button>
          </VStack>
        </Flex>
      </motion.div>

      {/* Pagination Dots */}
      <HStack
        spacing={2}
        justify="center"
        mt={4}
        position="absolute"
        bottom="20px"
        left="50%"
        transform="translateX(-50%)"
      >
        {featuredCourses.map((_, index) => (
          <Box
            key={index}
            w="12px"
            h="12px"
            bg={index === currentIndex ? "aptosBlue" : "gray.500"}
            borderRadius="full"
            cursor="pointer"
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
          />
        ))}
      </HStack>

      {/* Alert Dialogs */}
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

      <AlertDialog
        isOpen={isPurchaseDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={closePurchaseDialog}
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
              <Button ref={cancelRef} onClick={closePurchaseDialog}>
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

export default FeaturedCourses;
