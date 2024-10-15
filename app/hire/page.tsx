"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Spinner,
  Avatar,
  Heading,
  Text,
  HStack,
  Divider,
  Link,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Grid,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Stack,
  Flex,
} from "@chakra-ui/react";
import { FaTwitter, FaGithub, FaGlobe, FaSearch } from "react-icons/fa";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

// Function to shorten wallet address
const shortAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Interfaces for Challenge, Course, and User data
interface Challenge {
  challengeId: string;
  name: string;
  attempts: number;
  hintsUsed: number;
  completed: boolean;
}

interface Course {
  courseId: string;
  courseTitle: string;
  score: number;
  challenges: Challenge[];
}

interface User {
  address: string;
  userName: string;
  coursesCompleted: Course[];
  twitter?: string;
  github?: string;
  website?: string;
}

const HirePage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<number[]>([]);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/getUsersWithCompletedCourses");
        const data = await response.json();
        if (data.success) {
          setUsers(data.users);
          setFilteredUsers(data.users);
        } else {
          console.error("Failed to fetch users:", data.message);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter logic by search and completed courses
  useEffect(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.address.toLowerCase().includes(searchQuery.toLowerCase());

      const meetsCourseFilter =
        selectedFilters.length === 0 ||
        (selectedFilters.length === 1
          ? user.coursesCompleted.length === selectedFilters[0]
          : selectedFilters.some(
              (filter) => user.coursesCompleted.length >= filter
            ));

      return matchesSearch && meetsCourseFilter;
    });
    setFilteredUsers(filtered);
  }, [searchQuery, selectedFilters, users]);

  // Handle filter selection
  const toggleFilter = (count: number) => {
    if (selectedFilters.includes(count)) {
      setSelectedFilters(selectedFilters.filter((filter) => filter !== count));
    } else {
      setSelectedFilters([...selectedFilters, count]);
    }
  };

  // Display loading spinner while data is being fetched
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  // Main UI
  return (
    <>
      <Navbar />
      <Box p={8} w="100%" maxW="1400px" mx="auto" minH="70vh">
        <Heading
          mb={6}
          textAlign="center"
          color="gray.100"
          fontSize="3xl"
          fontWeight="bold"
        >
          Hire Talented Developers
        </Heading>

        {/* Search bar */}
        <Stack direction={{ base: "column", md: "row" }} spacing={4} mb={6}>
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray.300" />
            </InputLeftElement>
            <Input
              type="text"
              placeholder="Search by name or wallet"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              color="white"
              bg="gray.600"
              _placeholder={{ color: "gray.400" }}
            />
          </InputGroup>

          {/* Filter buttons for courses completed (multi-select) */}
          <Stack direction="row" spacing={4}>
            {[1, 2, 3].map((count) => (
              <Button
                key={count}
                colorScheme={selectedFilters.includes(count) ? "teal" : "gray"}
                onClick={() => toggleFilter(count)}
              >
                {count}
              </Button>
            ))}
          </Stack>
        </Stack>

        <Grid
          templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
          gap={6}
          alignItems="start"
        >
          {filteredUsers.map((user) => (
            <Box
              key={user.address}
              p={6}
              boxShadow="md"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="gray.600"
              bg="gray.700"
              transition="all 0.3s"
              _hover={{ boxShadow: "lg", transform: "scale(1.02)" }}
              alignSelf="start"
            >
              {/* User Details with Socials next to name */}
              <Flex justify="space-between" alignItems="center" mb={4}>
                <HStack spacing={4}>
                  <Avatar name={user.userName} size="lg" bg="teal.500" />
                  <Box>
                    <Heading size="md" color="white">
                      {" "}
                      {user.userName}
                    </Heading>
                    <Text color="gray.300" fontSize="sm">
                      {" "}
                      {shortAddress(user.address)}
                    </Text>
                  </Box>
                </HStack>
                <HStack spacing={4}>
                  {user.twitter && (
                    <Link
                      href={`https://twitter.com/${user.twitter}`}
                      isExternal
                    >
                      <FaTwitter size="24" color="gray.300" />{" "}
                    </Link>
                  )}
                  {user.github && (
                    <Link href={`https://github.com/${user.github}`} isExternal>
                      <FaGithub size="24" color="gray.300" />{" "}
                    </Link>
                  )}
                  {user.website && (
                    <Link
                      href={
                        user.website.startsWith("http")
                          ? user.website
                          : `https://${user.website}`
                      }
                      isExternal
                    >
                      <FaGlobe size="24" color="gray.300" />{" "}
                    </Link>
                  )}
                </HStack>
              </Flex>
              {/* Divider */}
              <Divider my={4} borderColor="gray.500" />{" "}
              {/* Courses Completed Section */}
              <Box>
                <Text fontWeight="bold" fontSize="lg" color="white" mb={2}>
                  {" "}
                  Courses Completed: {user.coursesCompleted?.length || 0}
                </Text>

                {/* Accordion for Courses (allowToggle ensures only one opens) */}
                <Accordion allowToggle>
                  {user.coursesCompleted?.map((course) => (
                    <AccordionItem key={course.courseId}>
                      <h2>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <Text fontWeight="semibold" color="white">
                              {" "}
                              {course.courseTitle}
                            </Text>
                            <Text fontSize="sm" color="gray.400">
                              {" "}
                              Score: {course.score || 0}
                            </Text>
                          </Box>
                          <AccordionIcon color="white" />{" "}
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        {course.challenges && course.challenges.length > 0 ? (
                          course.challenges.map((challenge) => (
                            <Box key={challenge.challengeId} mb={3}>
                              <Text fontWeight="bold" color="teal.300">
                                {" "}
                                {challenge.name}
                              </Text>
                              <Text fontSize="sm" color="gray.300">
                                {" "}
                                Attempts: {challenge.attempts} | Hints Used:{" "}
                                {challenge.hintsUsed} |{" "}
                                {challenge.completed
                                  ? "Completed"
                                  : "Incomplete"}
                              </Text>
                              <Divider my={2} borderColor="gray.500" />{" "}
                            </Box>
                          ))
                        ) : (
                          <Text color="gray.400" fontSize="sm">
                            {" "}
                            No challenges data available.
                          </Text>
                        )}
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Box>
            </Box>
          ))}
        </Grid>
      </Box>
      <Footer />
    </>
  );
};

export default HirePage;
