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
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import walletConnect from "@/app/hooks/walletConnect";

const featuredCourses = [
  {
    title: "Aptos: Introduction to Blockchain Development",
    description:
      "Learn the fundamentals of Aptos and its blockchain ecosystem.",
    buttonText: "Start Now",
    imageUrl: "/images/aptos.png",
    courseId: "course_1",
  },
  {
    title: "Move: Writing Secure Smart Contracts",
    description:
      "Master the Move programming language and write secure smart contracts.",
    buttonText: "Start Now",
    imageUrl: "/images/aptos.png",
    courseId: "course_2",
  },
  {
    title: "Aptos Advanced: Scalable Blockchain Solutions",
    description:
      "Dive deeper into Aptos' advanced features and scalability solutions.",
    buttonText: "Start Now",
    imageUrl: "/images/aptos.png",
    courseId: "course_3",
  },
];

const FeaturedCourses = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { isLoggedIn, connectWallet } = walletConnect();
  const [pendingCourse, setPendingCourse] = useState<string | null>(null);

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

  const handleStartCourse = async (courseId: string) => {
    try {
      const sessionResponse = await fetch("/api/session", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const sessionData = await sessionResponse.json();

      if (sessionData.loggedIn) {
        router.push(`/course/${courseId}`);
      } else {
        setPendingCourse(courseId);
        onOpen();
      }
    } catch (error) {
      console.error("Error checking session or redirecting:", error);
    }
  };

  const { title, description, buttonText, imageUrl, courseId } =
    featuredCourses[currentIndex];

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
    <Box position="relative" w="100%" h="600px" overflow="hidden" py={16}>
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
          direction={{ base: "column", md: "row" }}
          h="100%"
          align="center"
          justify="center"
          textAlign="center"
          p={8}
          bg="gray.800"
          mx="auto"
          maxW="1200px"
        >
          <VStack
            spacing={4}
            align="start"
            flex={1}
            maxW={{ base: "100%", md: "50%" }}
            px={{ base: 0, md: 10 }}
            color="white"
          >
            <Heading
              as="h3"
              size="xl"
              mb={4}
              fontWeight="bold"
              textAlign="left"
            >
              {title}
            </Heading>
            <Text fontSize="lg" mb={4} textAlign="left">
              {description}
            </Text>
            <Button
              colorScheme="teal"
              size="lg"
              onClick={() => handleStartCourse(courseId)}
            >
              {buttonText}
            </Button>
          </VStack>

          <Box flex={1} textAlign="center" p={4}>
            <img
              src={imageUrl}
              alt={title}
              style={{
                maxHeight: "250px",
                maxWidth: "100%",
                objectFit: "cover",
                margin: "0 auto",
              }}
            />
          </Box>
        </Flex>
      </motion.div>

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
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
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
              <Button ref={cancelRef} onClick={onClose}>
                Okay
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default FeaturedCourses;
