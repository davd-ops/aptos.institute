import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  Image,
} from "@chakra-ui/react";
import Link from "next/link";

const HeroSection = () => {
  return (
    <Box color="white" py={20} px={8}>
      <Flex
        direction={{ base: "column", md: "row" }}
        align="center"
        justify="center"
        maxW="1200px"
        mx="auto"
      >
        <VStack align="flex-start" spacing={6} flex={1}>
          <Heading as="h1" size="2xl">
            Learn, Build, and Get Hired in the Aptos Ecosystem
          </Heading>
          <Text fontSize="lg">
            Aptos Institute is your gateway to learning blockchain development
            on Aptos. With interactive quests, hands-on learning, and real-world
            projects, you can perfect your on-chain resume and get hired by top
            companies in the Aptos Ecosystem.
          </Text>
          <Link href="/courses">
            <Button colorScheme="teal" size="lg">
              Explore Courses
            </Button>
          </Link>
        </VStack>

        <Box flex={1} textAlign="center" mt={{ base: 10, md: 0 }}>
          <Image
            src="/images/aptos.png"
            alt="Aptos Institute"
            maxH="400px"
            objectFit="contain"
          />
        </Box>
      </Flex>
    </Box>
  );
};

export default HeroSection;
