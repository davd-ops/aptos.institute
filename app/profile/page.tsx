"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Spinner,
  FormControl,
  FormLabel,
  Input,
  IconButton,
  Link,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Tooltip,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { EditIcon } from "@chakra-ui/icons";
import { LockIcon, UnlockIcon } from "@chakra-ui/icons";
import { FaGithub, FaGlobe } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Navbar from "@/app/components/Navbar";
import Footer from "../components/Footer";

interface ProfileProps {
  address: string;
  userName: string;
  balance: number;
  coursesCompleted: number;
  twitter?: string;
  github?: string;
  website?: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileProps | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [twitter, setTwitter] = useState<string>("");
  const [github, setGithub] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const toast = useToast();

  const courses = [
    {
      id: 1,
      title: "Aptos Blockchain Basics",
      challengesCompleted: 10,
      totalChallenges: 10,
      unlocked: true,
      challenges: [
        {
          title: "Set Up Wallet",
          attempts: 2,
          hintsUsed: 1,
          status: "Completed",
        },
        {
          title: "Transfer Tokens",
          attempts: 3,
          hintsUsed: 0,
          status: "Completed",
        },
        {
          title: "Deploy Smart Contract",
          attempts: 1,
          hintsUsed: 2,
          status: "Completed",
        },
      ],
    },
    {
      id: 2,
      title: "Advanced Move Programming",
      challengesCompleted: 5,
      totalChallenges: 10,
      unlocked: false,
      challenges: [
        {
          title: "Define Custom Structs",
          attempts: 4,
          hintsUsed: 1,
          status: "Completed",
        },
        {
          title: "Implement Modules",
          attempts: 2,
          hintsUsed: 0,
          status: "Completed",
        },
        {
          title: "Call External Contracts",
          attempts: 3,
          hintsUsed: 2,
          status: "In Progress",
        },
        {
          title: "Write Unit Tests",
          attempts: 1,
          hintsUsed: 1,
          status: "Not Started",
        },
      ],
    },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setUserName(data.userName);
          setTwitter(data.twitter || "");
          setGithub(data.github || "");
          setWebsite(data.website || "");
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleUpdateProfile = async () => {
    if (profile) {
      try {
        const response = await fetch(`/api/updateUser`, {
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
          onClose();
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
        console.error("Error updating profile:", error);
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

  const shortAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!profile) {
    return <p>Redirecting...</p>;
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
          <Box
            flexBasis={{ base: "100%", md: "48%" }}
            p={6}
            bg="gray.800"
            borderRadius="md"
            position="relative"
          >
            <VStack align="start" spacing={6} color="white">
              <FormControl>
                <Text fontSize="2xl" fontWeight="bold">
                  {profile.userName}
                </Text>
              </FormControl>

              <Box>
                <Text fontSize="lg" fontWeight="bold">
                  Wallet Address:
                </Text>
                <Tooltip
                  label={profile.address}
                  aria-label="Full wallet address"
                >
                  <Text cursor="pointer">{shortAddress(profile.address)}</Text>
                </Tooltip>
              </Box>

              <Box>
                <Text fontSize="lg" fontWeight="bold">
                  Institute Token Balance:
                </Text>
                <Text>{profile.balance} Tokens</Text>
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
                    isDisabled={!profile.twitter}
                    as={profile.twitter ? Link : undefined}
                    href={
                      profile.twitter
                        ? profile.twitter.startsWith("@")
                          ? `https://x.com/${profile.twitter.slice(1)}`
                          : `https://x.com/${profile.twitter}`
                        : undefined
                    }
                    isExternal={profile.twitter ? true : undefined}
                  />

                  <IconButton
                    aria-label="GitHub"
                    icon={<FaGithub />}
                    colorScheme="gray"
                    isDisabled={!profile.github}
                    as={profile.github ? Link : undefined}
                    href={
                      profile.github
                        ? profile.github.startsWith("@")
                          ? `https://github.com/${profile.github.slice(1)}`
                          : `https://github.com/${profile.github}`
                        : undefined
                    }
                    isExternal={profile.github ? true : undefined}
                  />

                  <IconButton
                    aria-label="Website"
                    icon={<FaGlobe />}
                    colorScheme="teal"
                    isDisabled={!profile.website}
                    as={profile.website ? Link : undefined}
                    href={
                      profile.website
                        ? profile.website.startsWith("http")
                          ? profile.website
                          : `https://${profile.website}`
                        : undefined
                    }
                    isExternal={profile.website ? true : undefined}
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
                onClick={onOpen}
              />
            </VStack>
          </Box>

          <Flex align="center" display={{ base: "none", md: "flex" }}>
            <Box height="100%" width="2px" bg="gray.600" />
          </Flex>

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
                <AccordionItem key={course.id} border="none">
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
                          Completed: {course.challengesCompleted}/
                          {course.totalChallenges} challenges
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
                              {challenge.title}
                            </Text>
                            <Text color="gray.300">
                              Attempts: {challenge.attempts} | Hints Used:{" "}
                              {challenge.hintsUsed} | Status: {challenge.status}
                            </Text>
                            <Divider />
                          </Box>
                        ))}
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
              <Button ref={cancelRef} onClick={onClose}>
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
