"use client";

import { Flex, Spinner } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import Challenge from "@/app/components/Challenge";
import walletConnect from "@/app/hooks/walletConnect";

const challenges = [
  {
    courseId: "course_1",
    challengeId: "challenge_1",
    defaultCode: `module Aptos::CreateAccount {
        struct Account has copy, drop {
            name: vector<u8>,
            age: u64
        }
        public fun create_account(name: vector<u8>, age: u64): Account {
            Account { } // Use the function parameters to initialize the struct
        }
    }`,
    correctCode: `module Aptos::CreateAccount {
        struct Account has copy, drop {
            name: vector<u8>,
            age: u64
        }
        public fun create_account(name: vector<u8>, age: u64): Account {
            Account { name, age } // Use the function parameters to initialize the struct
        }
    }`,
    explanation: `In this challenge, you need to implement the create_account function and initialize the struct with the correct parameters.`,
    task: "Implement the create_account function",
    name: "Create Account Function",
  },
  {
    courseId: "course_1",
    challengeId: "challenge_2",
    defaultCode: `module Aptos::DeleteAccount {
        struct Account has copy, drop {
            name: vector<u8>,
            age: u64
        }
        public fun create_account(name: vector<u8>, age: u64): Account {
            Account { } // Use the function parameters to initialize the struct
        }
    }`,
    correctCode: `module Aptos::DeleteAccount {
        struct Account has copy, drop {
            name: vector<u8>,
            age: u64
        }
        public fun create_account(name: vector<u8>, age: u64): Account {
            Account { name, age } // Use the function parameters to initialize the struct
        }
    }`,
    explanation: `In this challenge, you need to implement the create_account function and initialize the struct with the correct parameters.`,
    task: "Implement the create_account function",
    name: "Delete Account Challenge",
  },
];

export default function ChallengePage() {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [userProgress, setUserProgress] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const { address, isLoggedIn } = walletConnect();

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        if (isLoggedIn && address) {
          const response = await fetch(
            `/api/getUserProgress?address=${address}&courseId=course_1`
          );
          const data = await response.json();

          if (data.success && data.progress) {
            const completedChallenges = data.progress.map(
              (progressItem: any) => progressItem.challengeId
            );
            const completedChallengesMap = completedChallenges.reduce(
              (acc: any, challengeId: string) => {
                acc[challengeId] = true;
                return acc;
              },
              {}
            );

            setUserProgress(completedChallengesMap);

            const nextUncompletedIndex = challenges.findIndex(
              (challenge) => !completedChallengesMap[challenge.challengeId]
            );

            setCurrentChallengeIndex(
              nextUncompletedIndex >= 0 ? nextUncompletedIndex : 0
            );
          }
        }
      } catch (error) {
        console.error("Error fetching user progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProgress();
  }, [address, isLoggedIn]);

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

  if (loading) {
    return <Spinner />;
  }

  const currentChallenge = challenges[currentChallengeIndex];

  return (
    <Flex direction="column" h="100vh">
      <Navbar />
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
      />
    </Flex>
  );
}
