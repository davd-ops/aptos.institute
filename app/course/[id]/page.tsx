"use client";
import { Flex, Spinner } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Challenge from "@/app/components/Challenge";
import useWalletConnect from "@/app/hooks/walletConnect";
import { useParams } from "next/navigation";

interface Challenge {
  challengeId: string;
  courseId: string;
  name: string;
  task: string;
  defaultCode: string;
  correctCode: string;
  explanation: string;
}

interface ProgressItem {
  challengeId: string;
  completed: boolean;
}

export default function ChallengePage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [userProgress, setUserProgress] = useState<
    Record<string, { completed: boolean }>
  >({});
  const [loading, setLoading] = useState(true);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const { address, isLoggedIn } = useWalletConnect();
  const { id: courseId } = useParams();
  const router = useRouter();
  const [courseUnlocked, setCourseUnlocked] = useState(false);

  const completeCourse = async () => {
    try {
      const response = await fetch("/api/completeCourse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, courseId }),
      });

      const data = await response.json();
      if (data.success) {
        setCourseCompleted(true);
      } else {
        console.error("Error completing course:", data.message);
      }
    } catch (error) {
      console.error("Error completing course:", error);
    }
  };

  useEffect(() => {
    const fetchChallengesAndProgress = async () => {
      try {
        const profileResponse = await fetch(`/api/profile`);
        const profileData = await profileResponse.json();

        if (!profileData.coursesUnlocked.includes(courseId)) {
          router.push("/courses");
          return;
        } else {
          setCourseUnlocked(true);
        }

        const [challengeResponse, progressResponse] = await Promise.all([
          fetch(`/api/fetchChallengesByCourse?courseId=${courseId}`),
          fetch(`/api/getUserProgress?address=${address}&courseId=${courseId}`),
        ]);

        const challengeData = await challengeResponse.json();
        const progressData = await progressResponse.json();

        if (challengeData.challenges) {
          setChallenges(challengeData.challenges);
        }

        if (progressData.success && progressData.progress) {
          const completedChallengesMap = progressData.progress.reduce(
            (
              acc: Record<string, { completed: boolean }>,
              progressItem: ProgressItem
            ) => {
              acc[progressItem.challengeId] = {
                completed: progressItem.completed,
              };
              return acc;
            },
            {}
          );

          setUserProgress(completedChallengesMap);

          const nextUncompletedIndex = challengeData.challenges.findIndex(
            (challenge: Challenge) =>
              !completedChallengesMap[challenge.challengeId]?.completed
          );

          setCurrentChallengeIndex(
            nextUncompletedIndex >= 0 ? nextUncompletedIndex : 0
          );
        }

        setProgressLoaded(true);
      } catch (error) {
        console.error("Error fetching challenges or progress:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn && address && courseId) {
      fetchChallengesAndProgress();
    }
  }, [address, isLoggedIn, courseId, router, completeCourse]);

  useEffect(() => {
    if (progressLoaded && challenges.length > 0) {
      const allChallengesCompleted = challenges.every(
        (challenge) => userProgress[challenge.challengeId]?.completed
      );

      if (allChallengesCompleted && !courseCompleted) {
        completeCourse();
      }
    }
  }, [
    progressLoaded,
    challenges,
    userProgress,
    courseCompleted,
    completeCourse,
  ]);

  const handleNextChallenge = () => {
    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(currentChallengeIndex + 1);
    }
  };

  const handlePreviousChallenge = () => {
    if (currentChallengeIndex > 0) {
      setCurrentChallengeIndex(currentChallengeIndex - 1);
    }
  };

  const handleUpdateProgress = (challengeId: string, completed: boolean) => {
    setUserProgress((prevProgress) => ({
      ...prevProgress,
      [challengeId]: { completed },
    }));
  };

  if (loading || challenges.length === 0) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  const currentChallenge = challenges[currentChallengeIndex];

  return (
    <Flex direction="column" h="100vh">
      <Navbar />
      {courseUnlocked && (
        <Challenge
          defaultCode={currentChallenge.defaultCode}
          correctCode={currentChallenge.correctCode}
          explanation={currentChallenge.explanation}
          task={currentChallenge.task}
          totalChallenges={challenges.length}
          currentChallenge={currentChallengeIndex + 1}
          handleNext={handleNextChallenge}
          handlePrev={handlePreviousChallenge}
          courseId={currentChallenge.courseId}
          challengeId={currentChallenge.challengeId}
          name={currentChallenge.name}
          isReadOnly={!!userProgress[currentChallenge.challengeId]}
          userProgress={userProgress}
          handleUpdateProgress={handleUpdateProgress}
        />
      )}
    </Flex>
  );
}
