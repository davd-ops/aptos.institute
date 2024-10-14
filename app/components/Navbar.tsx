"use client";
import { Box, Flex, Button, Text, Spacer, HStack } from "@chakra-ui/react";
import { Link } from "@chakra-ui/next-js";
import { useWallet } from "@/app/context/WalletContext";

export default function Navbar() {
  const { connectWallet, disconnectWallet, isLoggedIn } = useWallet();

  const handleLogin = async () => {
    await connectWallet();
  };

  return (
    <Box bg="gray.900" px={4} boxShadow="sm" color="white">
      <Flex h={16} alignItems="center">
        <Link href="/" _hover={{ textDecoration: "none" }}>
          <Text fontSize="lg" fontWeight="bold">
            Aptos Institute
          </Text>
        </Link>
        <Spacer />
        <HStack spacing={8} alignItems="center">
          <Link href="/courses" _hover={{ textDecoration: "none" }}>
            <Button
              variant="ghost"
              color="white"
              _hover={{ bg: "gray.700", color: "white" }}
            >
              Courses
            </Button>
          </Link>
          <Link href="/hire" _hover={{ textDecoration: "none" }}>
            <Button
              variant="ghost"
              color="white"
              _hover={{ bg: "gray.700", color: "white" }}
            >
              Hire
            </Button>
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/profile" _hover={{ textDecoration: "none" }}>
                <Button
                  variant="ghost"
                  color="white"
                  _hover={{ bg: "gray.700", color: "white" }}
                >
                  Profile
                </Button>
              </Link>
              <Button colorScheme="red" onClick={disconnectWallet}>
                Disconnect
              </Button>
            </>
          ) : (
            <Button colorScheme="teal" onClick={handleLogin}>
              Connect Wallet
            </Button>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}
