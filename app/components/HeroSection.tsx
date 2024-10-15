import { Box, Flex, Heading, Text, Button, VStack } from "@chakra-ui/react";
import Link from "next/link";

const HeroSection = () => {
  return (
    <Box
      bgGradient="linear(to-r, teal.500, blue.500)"
      color="white"
      py={20}
      px={8}
      textAlign="center"
    >
      <Flex
        direction="column"
        align="center"
        justify="center"
        maxW="1200px"
        mx="auto"
      >
        <VStack spacing={6}>
          <Heading as="h1" size="2xl" fontWeight="bold">
            Learn, Build, and Get Hired in the Aptos Ecosystem
          </Heading>
          <Text fontSize="xl" maxW="800px">
            Aptos Institute is your gateway to learning blockchain development
            on Aptos. With interactive quests, hands-on learning, and real-world
            projects, you can perfect your on-chain resume and get hired by top
            companies in the Aptos Ecosystem.
          </Text>
          <Link href="/courses">
            <Button
              bg="teal.400"
              color="white"
              _hover={{ bg: "teal.300" }}
              size="lg"
              px={10}
              py={6}
            >
              Explore Courses
            </Button>
          </Link>
        </VStack>
      </Flex>
    </Box>
  );
};

export default HeroSection;
