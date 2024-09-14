import { Box, Text, VStack, Button } from "@chakra-ui/react";
import walletConnect from "@/app/hooks/walletConnect";

const walletConnector = () => {
  const {
    walletAvailable,
    connectWallet,
    address,
    signedMessage,
    verificationStatus,
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
            {address ? (
              <Box>
                <Text fontSize="lg" fontWeight="bold">
                  Connected Address:
                </Text>
                <Text>{address}</Text>

                {signedMessage && (
                  <Box mt={4}>
                    <Text fontSize="lg" fontWeight="bold">
                      Signed Message:
                    </Text>
                    <Text wordBreak="break-all">{signedMessage.signature}</Text>
                  </Box>
                )}

                {verificationStatus && (
                  <Box mt={4}>
                    <Text fontSize="lg" fontWeight="bold">
                      Verification Status:
                    </Text>
                    <Text>{verificationStatus}</Text>
                  </Box>
                )}
              </Box>
            ) : (
              <Button onClick={connectWallet} colorScheme="teal" size="lg">
                Connect Petra Wallet
              </Button>
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
