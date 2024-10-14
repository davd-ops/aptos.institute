import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { User } from "@/app/models/User";
import { Course } from "@/app/models/Courses";
import { mintTokens } from "@/app/lib/aptos";
import { updateResumeProgress } from "@/app/lib/aptos";

const MAX_SCORE = 1000;

async function fetchUserProgress(address: string, courseId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/getUserProgress?address=${address}&courseId=${courseId}`
  );
  if (!response.ok) {
    throw new Error("Error fetching user progress");
  }
  const data = await response.json();
  return data;
}

function calculateScore(
  progress: any[],
  maxScore: number,
  totalChallenges: number
): number {
  const baseScorePerChallenge = Math.floor(maxScore / totalChallenges);

  return progress.reduce((totalScore, challenge) => {
    let challengeScore = baseScorePerChallenge;

    const attemptsPenalty = Math.max(
      0,
      (challenge.attempts - 1) * Math.floor(0.1 * baseScorePerChallenge)
    );

    const hintsPenalty =
      challenge.hintsUsed * Math.floor(0.15 * baseScorePerChallenge);

    challengeScore -= attemptsPenalty + hintsPenalty;

    return totalScore + challengeScore;
  }, 0);
}

export async function POST(req: NextRequest) {
  try {
    const { address, courseId } = await req.json();

    if (!address || !courseId) {
      return NextResponse.json(
        { message: "Address and courseId are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const course = await Course.findOne({ courseId });
    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    const { title: courseName, rewards: reward } = course;

    const user = await User.findOne({ address });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.coursesCompleted.includes(courseId)) {
      return NextResponse.json(
        {
          success: false,
          message: `Course '${courseName}' has already been completed.`,
        },
        { status: 400 }
      );
    }

    const progressResponse = await fetchUserProgress(address, courseId);
    const { progress, completedChallenges } = progressResponse;

    if (completedChallenges === 0) {
      return NextResponse.json(
        { success: false, message: "No challenges completed." },
        { status: 400 }
      );
    }

    const score = calculateScore(progress, MAX_SCORE, completedChallenges);

    const mintResponse = await mintTokens(address, reward);
    if (!mintResponse) {
      throw new Error("Failed to mint tokens.");
    }

    const courseIdU64 = parseInt(courseId.match(/\d+/)?.[0] || "0", 10);

    const updateResumeResponse = await updateResumeProgress(
      address,
      courseName,
      progress.length.toString(),
      courseId as string,
      courseIdU64,
      score.toString(),
      score,
      progress
        .reduce(
          (total: number, challenge: { attempts: number }) =>
            total + challenge.attempts,
          0
        )
        .toString(),
      progress
        .reduce(
          (total: number, challenge: { hintsUsed: number }) =>
            total + challenge.hintsUsed,
          0
        )
        .toString()
    );

    if (!updateResumeResponse) {
      throw new Error("Failed to update resume.");
    }

    const existingScore = user.courseScores.find(
      (entry: { courseId: any }) => entry.courseId === courseId
    );

    if (existingScore) {
      await User.updateOne(
        { address, "courseScores.courseId": courseId },
        { $set: { "courseScores.$.score": score }, $inc: { balance: reward } }
      );
    } else {
      await User.updateOne(
        { address },
        {
          $push: { courseScores: { courseId, score } },
          $addToSet: { coursesCompleted: courseId },
          $inc: { balance: reward },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        reward,
        courseName,
        score,
        newBalance: user.balance + reward,
        message: `Course '${courseName}' completed. Reward of ${reward} tokens issued. Score: ${score}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error completing course:", error);
    return NextResponse.json(
      { success: false, message: "Error completing course" },
      { status: 500 }
    );
  }
}
