"use client";
import { Button, Box, Text } from "@chakra-ui/react";
import walletConnect from "@/app/hooks/walletConnect";

const petraConnect = () => {
  const { walletAvailable, connectWallet, address } = walletConnect();

  return (
    <Box>
      {walletAvailable ? (
        address ? (
          <Text>Connected: {address}</Text>
        ) : (
          <Button colorScheme="teal" onClick={connectWallet}>
            Connect Petra Wallet
          </Button>
        )
      ) : (
        <Text>Petra Wallet is not available. Please install it.</Text>
      )}
    </Box>
  );
};

export default petraConnect;
