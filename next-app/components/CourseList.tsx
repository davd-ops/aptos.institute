import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  IconButton,
  HStack,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useState } from "react";

const courses = [
  {
    title: "Aptos: Introduction to Blockchain Development",
    description:
      "Learn the fundamentals of Aptos and its blockchain ecosystem.",
    tags: ["Aptos", "Beginner", "Blockchain"],
    imageUrl: "/images/aptos.png",
  },
  {
    title: "Move: Writing Secure Smart Contracts",
    description:
      "Master the Move programming language and write secure smart contracts.",
    tags: ["Move", "Intermediate", "Smart Contracts"],
    imageUrl: "/images/aptos.png",
  },
  {
    title: "Aptos Advanced: Scalable Blockchain Solutions",
    description:
      "Dive deeper into Aptos' advanced features and scalability solutions.",
    tags: ["Aptos", "Advanced", "Scalability"],
    imageUrl: "/images/aptos.png",
  },
];

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
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

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
        {filteredCourses.map((course, index) => (
          <Flex
            key={index}
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
              spacing={4}
              maxW={{ base: "100%", md: "60%" }}
            >
              <Heading as="h3" size="lg">
                {course.title}
              </Heading>
              <Text fontSize="md">{course.description}</Text>
              <HStack>
                {course.tags.map((tag) => (
                  <Text key={tag} fontSize="sm" color="gray.500">
                    {tag}
                  </Text>
                ))}
              </HStack>
              <Button colorScheme="teal" size="md">
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
        ))}
      </Flex>
    </Box>
  );
};

export default CourseList;
