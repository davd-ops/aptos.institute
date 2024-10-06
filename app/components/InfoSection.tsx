import { Box, Flex, Heading, Text, VStack, Image } from "@chakra-ui/react";

const InfoSection = () => {
  return (
    <Box color="white" py={20} px={8}>
      <VStack spacing={20} maxW="1200px" mx="auto">
        <Flex
          direction={{ base: "column", md: "row" }}
          align="center"
          justify="space-between"
          w="100%"
        >
          <VStack align="flex-start" spacing={6} flex={1}>
            <Heading as="h2" size="xl">
              Earn Points and Build Your On-Chain Resume
            </Heading>
            <Text fontSize="lg">
              Complete interactive quests and earn points to showcase your
              skills. Use these points to enhance your dynamic on-chain resume
              or boost your visibility for job opportunities within the Aptos
              ecosystem.
            </Text>
          </VStack>

          <Box flex={1} mt={{ base: 10, md: 0 }} textAlign="center">
            <Image
              src="/images/aptos.png"
              alt="Earn Points"
              maxH="300px"
              objectFit="contain"
            />
          </Box>
        </Flex>

        <Flex
          direction={{ base: "column", md: "row-reverse" }}
          align="center"
          justify="space-between"
          w="100%"
        >
          <VStack align="flex-start" spacing={6} flex={1}>
            <Heading as="h2" size="xl">
              Hands-On Learning Tailored for Aptos
            </Heading>
            <Text fontSize="lg">
              Dive into hands-on projects designed for the Aptos ecosystem.
              Learn by doing, with real-world examples and practical challenges
              that help you build confidence in blockchain development.
            </Text>
          </VStack>

          <Box flex={1} mt={{ base: 10, md: 0 }} textAlign="center">
            <Image
              src="/images/aptos.png"
              alt="Hands-On Learning"
              maxH="300px"
              objectFit="contain"
            />
          </Box>
        </Flex>

        <Flex
          direction={{ base: "column", md: "row" }}
          align="center"
          justify="space-between"
          w="100%"
        >
          <VStack align="flex-start" spacing={6} flex={1}>
            <Heading as="h2" size="xl">
              Find Your Place in the Aptos Ecosystem
            </Heading>
            <Text fontSize="lg">
              After completing the quests, connect with companies that are
              actively looking for skilled Aptos developers. Showcase your
              provable on-chain resume and land your dream job in the Web3
              space!
            </Text>
          </VStack>

          <Box flex={1} mt={{ base: 10, md: 0 }} textAlign="center">
            <Image
              src="/images/aptos.png"
              alt="Find Jobs"
              maxH="300px"
              objectFit="contain"
            />
          </Box>
        </Flex>
      </VStack>
    </Box>
  );
};

export default InfoSection;
