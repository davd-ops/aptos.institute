import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { Challenge } from "@/app/models/Challenges";

const challenges = [
  {
    courseId: "course_2",
    challengeId: "challenge_1_2",
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
    explanation:
      "In this challenge, you need to implement the create_account function and initialize the struct with the correct parameters.",
    task: "Implement the create_account function",
    name: "Create Account Function",
  },
  {
    courseId: "course_2",
    challengeId: "challenge_2_2",
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
    explanation:
      "In this challenge, you need to implement the create_account function and initialize the struct with the correct parameters.",
    task: "Implement the create_account function",
    name: "Delete Account Challenge",
  },
  {
    courseId: "course_3",
    challengeId: "challenge_1_3",
    defaultCode: `module Aptos::EditAccount {
        struct Account has copy, drop {
            name: vector<u8>,
            age: u64
        }
        public fun create_account(name: vector<u8>, age: u64): Account {
            Account { } // Use the function parameters to initialize the struct
        }
    }`,
    correctCode: `module Aptos::EditAccount {
        struct Account has copy, drop {
            name: vector<u8>,
            age: u64
        }
        public fun create_account(name: vector<u8>, age: u64): Account {
            Account { name, age } // Use the function parameters to initialize the struct
        }
    }`,
    explanation:
      "In this challenge, you need to implement the create_account function and initialize the struct with the correct parameters.",
    task: "Implement the create_account function",
    name: "Delete Account Challenge",
  },
];

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    await connectToDatabase();

    for (const challenge of challenges) {
      const existingChallenge = await Challenge.findOne({
        challengeId: challenge.challengeId,
      });

      if (!existingChallenge) {
        await Challenge.create(challenge);
      }
    }

    return NextResponse.json(
      { message: "Challenges created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating challenges:", error);
    return NextResponse.json(
      { message: "Error creating challenges" },
      { status: 500 }
    );
  }
}
