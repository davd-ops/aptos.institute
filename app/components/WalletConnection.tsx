import { Box, Text, VStack, Button } from "@chakra-ui/react";
import walletConnect from "../hooks/walletConnect";

const walletConnector = () => {
  const {
    walletAvailable,
    connectWallet,
    disconnectWallet,
    address,
    verificationStatus,
    isLoggedIn,
  } = walletConnect();

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack spacing={5}>
        {walletAvailable ? (
          <>
            {isLoggedIn ? (
              <Box>
                <Text fontSize="lg" fontWeight="bold">
                  Logged in as: {address}
                </Text>
                <Button onClick={disconnectWallet} colorScheme="red" size="lg">
                  Disconnect Wallet / Logout
                </Button>
              </Box>
            ) : (
              <Button onClick={connectWallet} colorScheme="teal" size="lg">
                Connect Petra Wallet
              </Button>
            )}

            {verificationStatus && (
              <Box mt={4}>
                <Text fontSize="lg" fontWeight="bold">
                  Verification Status: {verificationStatus}
                </Text>
              </Box>
            )}
          </>
        ) : (
          <Text>Petra Wallet is not available. Please install it.</Text>
        )}
      </VStack>
    </Box>
  );
};

export default walletConnector;
