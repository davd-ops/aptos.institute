"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tooltip,
  VStack,
  IconButton,
  Divider,
  HStack,
  useToast,
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { LockIcon, UnlockIcon, EditIcon } from "@chakra-ui/icons";
import { FaGithub, FaGlobe } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

interface Challenge {
  challengeId: string;
  courseId: string;
  name: string;
  attempts: number;
  hintsUsed: number;
  completed: boolean;
}

interface Course {
  courseId: string;
  title: string;
  description: string;
  price: number;
  rewards: number;
  unlocked: boolean;
  challenges: Challenge[];
}

interface ProfileProps {
  address: string;
  userName: string;
  balance: number;
  coursesUnlocked: string[];
  coursesCompleted: string[];
  twitter?: string;
  github?: string;
  website?: string;
}

interface Progress {
  challengeId: string;
  courseId: string;
  address: string;
  attempts: number;
  hintsUsed: number;
  completed: boolean;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileProps | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCourse, setPendingCourse] = useState<Course | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [userName, setUserName] = useState<string>("");
  const [twitter, setTwitter] = useState<string>("");
  const [github, setGithub] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const toast = useToast();
  const router = useRouter();

  const onClose = () => setIsOpen(false);
  const onEditProfileClose = () => setEditProfileOpen(false);
  const onEditProfileOpen = () => setEditProfileOpen(true);

  const onOpen = (course: Course) => {
    setPendingCourse(course);
    setIsOpen(true);
  };

  const handleBuyCourse = async () => {
    if (pendingCourse && profile) {
      if (profile.balance >= pendingCourse.price) {
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
            toast({
              title: "Course Unlocked",
              description: `You have successfully unlocked the course "${pendingCourse.title}".`,
              status: "success",
              duration: 3000,
              isClosable: true,
              position: "top-right",
            });

            onClose();
            router.push(`/course/${pendingCourse.courseId}`);
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

  const handleUpdateProfile = async () => {
    if (profile) {
      try {
        const response = await fetch("/api/updateUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: profile.address,
            name: userName,
            twitter,
            github,
            website,
          }),
        });

        if (response.ok) {
          setProfile((prev) => ({
            ...prev!,
            userName,
            twitter,
            github,
            website,
          }));
          onEditProfileClose();
          toast({
            title: "Profile Updated",
            description: "Your profile was updated successfully.",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
        } else {
          throw new Error("Profile update failed");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update your profile.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      }
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        const profileData = await response.json();
        setProfile(profileData);
        setUserName(profileData.userName);
        setTwitter(profileData.twitter || "");
        setGithub(profileData.github || "");
        setWebsite(profileData.website || "");
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.address) {
      const fetchCoursesAndChallenges = async () => {
        try {
          const response = await fetch("/api/fetchCourses");
          const coursesData = await response.json();
          const coursesArray = coursesData.courses;

          const coursePromises = coursesArray.map(async (course: Course) => {
            const challengesResponse = await fetch(
              `/api/fetchChallengesByCourse?courseId=${course.courseId}`
            );
            const challengesData = await challengesResponse.json();

            const progressResponse = await fetch(
              `/api/getUserProgress?address=${profile.address}&courseId=${course.courseId}`
            );
            const progressData = await progressResponse.json();

            const challengesWithProgress = challengesData.challenges.map(
              (challenge: Challenge) => {
                const progress: Progress | undefined =
                  progressData.progress.find(
                    (p: Progress) => p.challengeId === challenge.challengeId
                  );

                return {
                  ...challenge,
                  attempts: progress?.attempts || 0,
                  hintsUsed: progress?.hintsUsed || 0,
                  completed: progress?.completed || false,
                };
              }
            );

            return {
              ...course,
              unlocked: profile?.coursesUnlocked.includes(course.courseId),
              challenges: challengesWithProgress,
            };
          });

          const detailedCourses = await Promise.all(coursePromises);
          setCourses(detailedCourses);
        } catch (error) {
          console.error("Error fetching courses and challenges:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchCoursesAndChallenges();
    }
  }, [profile?.address]);

  const shortAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Function to remove only @ symbol from social handles
  const removeAtSymbol = (handle: string) => {
    return handle.startsWith("@") ? handle.slice(1) : handle;
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <>
      <Navbar />
      <Box p={8} w="100%" maxW="1400px" mx="auto" minH="69vh">
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-around"
          mb={6}
        >
          <Heading as="h2" size="xl" color="white">
            Profile Details
          </Heading>
          <Heading as="h2" size="xl" color="white">
            On-Chain CV
          </Heading>
        </Flex>

        <Flex
          direction={{ base: "column", md: "row" }}
          gap={8}
          justify="center"
          mx="auto"
          w="100%"
        >
          {/* Profile Details Section */}
          <Box
            flexBasis={{ base: "100%", md: "48%" }}
            p={6}
            bg="gray.800"
            borderRadius="md"
            position="relative"
          >
            <VStack align="start" spacing={6} color="white">
              <Text fontSize="2xl" fontWeight="bold">
                {profile?.userName}
              </Text>
              <Box>
                <Text fontSize="lg" fontWeight="bold">
                  Wallet Address:
                </Text>
                <Tooltip label={profile?.address}>
                  <Text cursor="pointer">
                    {shortAddress(profile?.address || "")}
                  </Text>
                </Tooltip>
              </Box>
              <Box>
                <Text fontSize="lg" fontWeight="bold">
                  Institute Token Balance:
                </Text>
                <Text>{profile?.balance} Tokens</Text>
              </Box>
              <Box>
                <Text fontSize="lg" fontWeight="bold">
                  Social Links:
                </Text>
                <HStack spacing={4}>
                  <IconButton
                    aria-label="Twitter"
                    icon={<FaXTwitter />}
                    colorScheme="twitter"
                    isDisabled={!profile?.twitter}
                    as={profile?.twitter ? "a" : undefined}
                    href={
                      profile?.twitter
                        ? `https://x.com/${removeAtSymbol(profile.twitter)}`
                        : undefined
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                  <IconButton
                    aria-label="GitHub"
                    icon={<FaGithub />}
                    colorScheme="gray"
                    isDisabled={!profile?.github}
                    as={profile?.github ? "a" : undefined}
                    href={
                      profile?.github
                        ? `https://github.com/${removeAtSymbol(profile.github)}`
                        : undefined
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                  <IconButton
                    aria-label="Website"
                    icon={<FaGlobe />}
                    colorScheme="teal"
                    isDisabled={!profile?.website}
                    as={profile?.website ? "a" : undefined}
                    href={
                      profile?.website
                        ? profile.website.startsWith("http")
                          ? profile.website
                          : `https://${profile.website}`
                        : undefined
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                </HStack>
              </Box>
              <IconButton
                aria-label="Edit Profile"
                icon={<EditIcon />}
                size="sm"
                position="absolute"
                top={4}
                right={4}
                onClick={onEditProfileOpen}
              />
            </VStack>
          </Box>

          {/* On-Chain CV Section */}
          <Box
            flexBasis={{ base: "100%", md: "48%" }}
            p={6}
            bg="gray.800"
            borderRadius="md"
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <Text color="white" mb={4} textAlign="center">
              Below are the courses you’ve completed or unlocked. Click on a
              course to see your challenge progress.
            </Text>

            <Accordion allowMultiple w="100%">
              {courses.map((course) => (
                <AccordionItem key={course.courseId} border="none">
                  <h2>
                    <AccordionButton
                      _expanded={{ bg: "gray.600", color: "white" }}
                      bg={course.unlocked ? "gray.700" : "gray.700"}
                      borderRadius="md"
                      px={4}
                      py={2}
                      mb={2}
                      _hover={{ bg: "gray.600" }}
                      color="white"
                      onClick={() => !course.unlocked && onOpen(course)}
                    >
                      {course.unlocked ? (
                        <UnlockIcon boxSize={5} color="green.400" mr={4} />
                      ) : (
                        <LockIcon boxSize={5} color="red.400" mr={4} />
                      )}

                      <Box flex="1" textAlign="center">
                        <Text fontSize="xl" fontWeight="bold" color="white">
                          {course.title}
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          Completed:{" "}
                          {course.challenges.filter((c) => c.completed).length}/
                          {course.challenges.length} challenges
                        </Text>
                      </Box>

                      <AccordionIcon />
                    </AccordionButton>
                  </h2>

                  {course.unlocked && (
                    <AccordionPanel mb={4} borderRadius="md" bg="gray.700">
                      <VStack spacing={4} align="center">
                        {course.challenges.map((challenge, index) => (
                          <Box key={index} textAlign="center">
                            <Text color="teal.300" fontWeight="bold">
                              {challenge.name}
                            </Text>
                            <Text color="gray.300">
                              Attempts: {challenge.attempts} | Hints Used:{" "}
                              {challenge.hintsUsed} |{" "}
                              {challenge.completed ? "Completed" : "Incomplete"}
                            </Text>
                            <Divider />
                          </Box>
                        ))}
                        <Button
                          colorScheme="teal"
                          onClick={() =>
                            router.push(`/course/${course.courseId}`)
                          }
                        >
                          Check Course
                        </Button>
                      </VStack>
                    </AccordionPanel>
                  )}
                </AccordionItem>
              ))}
            </Accordion>
          </Box>
        </Flex>
      </Box>

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
                    <strong>{profile?.balance} Tokens</strong>.
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

      {/* Edit Profile Modal */}
      <AlertDialog
        isOpen={editProfileOpen}
        leastDestructiveRef={cancelRef}
        onClose={onEditProfileClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Edit Profile
            </AlertDialogHeader>
            <AlertDialogBody>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>X (Twitter)</FormLabel>
                <Input
                  placeholder="X Handle"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>GitHub</FormLabel>
                <Input
                  placeholder="GitHub Username"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Website</FormLabel>
                <Input
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </FormControl>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onEditProfileClose}>
                Cancel
              </Button>
              <Button colorScheme="teal" onClick={handleUpdateProfile} ml={3}>
                Save
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Footer />
    </>
  );
};

export default Profile;
