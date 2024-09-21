import { Box, Flex, Heading, Text, Button, HStack } from "@chakra-ui/react";
import { useState } from "react";
import Editor from "@/next-app/components/CodeEditor";
import walletConnect from "@/next-app/hooks/walletConnect";

interface ChallengeProps {
  defaultCode: string;
  correctCode: string;
  explanation: string;
  task: string;
  totalChallenges: number;
  currentChallenge: number;
  handleNext: () => void;
  handlePrev: () => void;
  courseId: string;
  challengeId: string;
  name: string;
  isReadOnly: boolean;
}

const Challenge: React.FC<ChallengeProps> = ({
  defaultCode,
  correctCode,
  explanation,
  task,
  totalChallenges,
  currentChallenge,
  handleNext,
  handlePrev,
  courseId,
  challengeId,
  name,
  isReadOnly,
}) => {
  const [showHintButton, setShowHintButton] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [userCode, setUserCode] = useState(defaultCode);
  const [validationMessage, setValidationMessage] = useState<string>("");

  const { address, isLoggedIn } = walletConnect();

  const validateCode = async () => {
    if (isReadOnly) return;

    const normalizeCode = (code: string) =>
      code
        .replace(/\/\/.*$/gm, "")
        .replace(/\/\*[\s\S]*?\*\//gm, "")
        .replace(/\s+/g, "")
        .trim();

    const normalizedUserCode = normalizeCode(userCode);
    const normalizedCorrectCode = normalizeCode(correctCode);

    if (normalizedUserCode === normalizedCorrectCode) {
      setValidationMessage("Success! Your code is correct.");
      setShowHintButton(false);
      setShowHint(false);

      if (isLoggedIn && address) {
        await fetch("/api/submitChallenge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address,
            courseId,
            challengeId,
            success: true,
          }),
        });
      }
    } else {
      setValidationMessage("The code is incorrect. Please try again.");
      setShowHintButton(true);

      if (isLoggedIn && address) {
        await fetch("/api/submitChallenge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address,
            courseId,
            challengeId,
            success: false,
          }),
        });
      }
    }
  };

  const handleShowHint = async () => {
    setShowHint((prev) => !prev);

    if (isLoggedIn && address) {
      await fetch("/api/trackHint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          courseId,
          challengeId,
        }),
      });
    }
  };

  return (
    <Flex direction="column" h="100vh" justifyContent="space-between">
      <Flex direction={{ base: "column", md: "row" }} flex="1" p={0} m={0}>
        <Box
          flex={1}
          p={4}
          borderRight={{ base: "none", md: "2px solid" }}
          borderBottom={{ base: "2px solid", md: "none" }}
          borderColor="gray.300"
          overflowY="auto"
        >
          <Heading as="h2" size="lg" mb={4}>
            {task}
          </Heading>
          <Box>
            <Text mb={4}>{explanation}</Text>

            <Heading as="h3" size="md" mt={8} mb={4}>
              Your Task:
            </Heading>
            <Text>{task}</Text>
          </Box>
        </Box>
        <Box
          flex={1}
          p={4}
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            {name} - Module.move
          </Text>

          <Box flex={1} overflow="hidden">
            <Editor
              defaultCode={isReadOnly ? correctCode : defaultCode} 
              correctCode={correctCode}
              onChange={(value: string) => setUserCode(value || "")}
              isReadOnly={isReadOnly}
            />
          </Box>

          {showHint && (
            <>
              <Text fontSize="lg" fontWeight="bold" mt={4} mb={2}>
                Hint.move
              </Text>

              <Box mt={4} w="100%">
                <Editor defaultCode={correctCode} isReadOnly />
              </Box>
            </>
          )}

          {validationMessage && (
            <Text
              mt={4}
              color={validationMessage.includes("Success") ? "green" : "red"}
            >
              {validationMessage}
            </Text>
          )}
        </Box>
      </Flex>

      <Box
        bg="gray.800"
        color="white"
        p={4}
        borderTop="2px solid"
        borderColor="gray.300"
        position="sticky"
        bottom="0"
        w="100%"
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Text>
            Challenge {currentChallenge} / {totalChallenges}
          </Text>

          <HStack spacing={4}>
            {!isReadOnly ? (
              <Button colorScheme="teal" onClick={validateCode}>
                Validate Code
              </Button>
            ) : (
              <Text color="green.300" fontWeight="bold">
                Challenge completed successfully!
              </Text>
            )}
            {showHintButton && (
              <Button colorScheme="blue" onClick={handleShowHint}>
                {showHint ? "Hide Hint" : "Show Hint"}
              </Button>
            )}
          </HStack>

          <HStack spacing={4}>
            <Button
              colorScheme="gray"
              onClick={handlePrev}
              isDisabled={currentChallenge === 1}
            >
              Back
            </Button>
            <Button
              colorScheme="gray"
              onClick={handleNext}
              isDisabled={currentChallenge === totalChallenges}
            >
              Next
            </Button>
          </HStack>
        </Flex>
      </Box>
    </Flex>
  );
};

export default Challenge;
