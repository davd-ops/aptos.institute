import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Image,
  StackDivider,
} from "@chakra-ui/react";

import Link from "next/link";

const Footer = () => {
  return (
    <Box bg="gray.900" color="white" py={8} px={4} mt={10}>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align="center"
        maxW="1200px"
        mx="auto"
      >
        <VStack spacing={4} align="start">
          <HStack spacing={4}>
            <Image
              src="/images/logo.png"
              alt="Aptos Institute"
              boxSize="40px"
              borderRadius="full"
            />
            <Text fontSize="lg" fontWeight="bold">
              Aptos Institute
            </Text>
          </HStack>
          <Text>Learn to Code Blockchain and earn tokens</Text>
          <Text fontSize="sm">
            © Copyright 2024 Aptos Institute. All Rights Reserved
          </Text>
        </VStack>

        <HStack
          spacing={8}
          mt={{ base: 8, md: 0 }}
          divider={<StackDivider borderColor="gray.700" />}
        >
          <VStack spacing={2} align="start">
            <Text fontWeight="bold" mb={2}>
              GET STARTED
            </Text>
            <Link href="/courses" passHref>
              <Text _hover={{ textDecoration: "none", color: "teal" }}>
                Courses
              </Text>
            </Link>
            <Link
              href="https://aptosfoundation.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Text _hover={{ textDecoration: "none", color: "teal" }}>
                Aptos
              </Text>
            </Link>
          </VStack>

          <VStack spacing={2} align="start">
            <Text fontWeight="bold" mb={2}>
              GET IN TOUCH
            </Text>
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Text _hover={{ textDecoration: "none", color: "teal" }}>
                Github
              </Text>
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Text _hover={{ textDecoration: "none", color: "teal" }}>
                Twitter
              </Text>
            </Link>
          </VStack>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Footer;
