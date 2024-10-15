import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  HStack,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import Editor from "@/app/components/CodeEditor";
import useWalletConnect from "@/app/hooks/walletConnect";

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
  userProgress: { [key: string]: { completed: boolean } };
  handleUpdateProgress: (challengeId: string, completed: boolean) => void;
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
  isReadOnly: initialReadOnly,
  userProgress,
  handleUpdateProgress,
}) => {
  const [isReadOnly, setIsReadOnly] = useState(initialReadOnly);
  const [showHintButton, setShowHintButton] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [userCode, setUserCode] = useState(defaultCode);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [rewardMessage, setRewardMessage] = useState("");

  const { address, isLoggedIn } = useWalletConnect();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setUserCode(defaultCode);
    setIsReadOnly(userProgress[challengeId]?.completed || initialReadOnly);
    setValidationMessage("");
    setShowHint(false);
  }, [challengeId, defaultCode, userProgress, initialReadOnly]);

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
      setIsReadOnly(true);
      onOpen();

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

        handleUpdateProgress(challengeId, true);

        await checkCourseCompletion();
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

  const checkCourseCompletion = async () => {
    try {
      const response = await fetch(
        `/api/getUserProgress?address=${address}&courseId=${courseId}`
      );
      const data = await response.json();

      if (data.success) {
        const completedChallengesCount = data.completedChallenges || 0;

        if (completedChallengesCount === totalChallenges) {
          await completeCourse();
        }
      }
    } catch (error) {
      console.error("Error checking course completion:", error);
    }
  };

  const completeCourse = async () => {
    try {
      const response = await fetch("/api/completeCourse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          courseId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCourseCompleted(true);
        setRewardMessage(
          `Congratulations! You have completed the course "${data.courseName}". You have earned ${data.reward} tokens!`
        );
        onOpen();
      } else {
        console.error("Error completing course:", data.message);
      }
    } catch (error) {
      console.error("Error completing course:", error);
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
          color="white"
        >
          <Heading as="h2" size="lg" mb={4} color="white">
            {name}
          </Heading>
          <Box>
            <Text
              mb={4}
              color="white"
              dangerouslySetInnerHTML={{ __html: explanation }}
            />

            <Heading as="h3" size="md" mt={8} mb={4} color="white">
              Your Task:
            </Heading>
            <Text
              color="white"
              p={4}
              dangerouslySetInnerHTML={{ __html: task }}
              sx={{
                ul: {
                  paddingLeft: "1.5rem",
                  marginBottom: "1rem",
                },
                li: {
                  marginBottom: "0.5rem",
                },
              }}
            />
          </Box>
        </Box>
        <Box
          flex={1}
          p={4}
          display="flex"
          flexDirection="column"
          overflow="hidden"
          color="white"
        >
          <Text fontSize="lg" fontWeight="bold" mb={2} color="white">
            Module.move
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
              <Text fontSize="lg" fontWeight="bold" mt={4} mb={2} color="white">
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
              color={
                validationMessage.includes("Success") ? "green.300" : "red.300"
              }
            >
              {validationMessage}
            </Text>
          )}
        </Box>
      </Flex>

      <Box
        bg="gray.900"
        color="white"
        p={4}
        borderTop="2px solid"
        borderColor="gray.300"
        position="sticky"
        bottom="0"
        w="100%"
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Text color="white">
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

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {courseCompleted ? "Course Completed!" : "Success!"}
            </AlertDialogHeader>

            <AlertDialogBody>
              {courseCompleted ? rewardMessage : "Your code is correct!"}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                {courseCompleted ? "Close" : "Check Code"}
              </Button>
              {!courseCompleted && (
                <Button
                  colorScheme="teal"
                  onClick={() => {
                    onClose();
                    setValidationMessage("");
                    handleNext();
                  }}
                  ml={3}
                >
                  Next Challenge
                </Button>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Flex>
  );
};

export default Challenge;
