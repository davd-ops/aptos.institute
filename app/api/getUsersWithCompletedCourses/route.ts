import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { User } from "@/app/models/User";
import { Progress } from "@/app/models/Progress";
import { Course } from "@/app/models/Courses";
import { Challenge } from "@/app/models/Challenges";

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch users who have completed at least one course
    const users = await User.find({
      coursesCompleted: { $exists: true, $not: { $size: 0 } },
    });

    const usersWithProgress = await Promise.all(
      users.map(async (user) => {
        const progress = await Progress.find({ address: user.address });

        // Get course titles and challenge names for each course
        const coursesWithChallenges = await Promise.all(
          user.coursesCompleted.map(async (courseId: string) => {
            const course = await Course.findOne({ courseId }); // Fetch course by courseId
            const courseChallenges = await Challenge.find({ courseId }); // Fetch all challenges for the course

            const challengesWithProgress = courseChallenges.map(
              (challenge: { challengeId: string; name: string }) => {
                const userProgress = progress.find(
                  (p) => p.challengeId === challenge.challengeId
                );
                return {
                  challengeId: challenge.challengeId,
                  name: challenge.name, // Fetch challenge name
                  attempts: userProgress?.attempts || 0,
                  hintsUsed: userProgress?.hintsUsed || 0,
                  completed: userProgress?.completed || false,
                };
              }
            );

            return {
              courseId,
              courseTitle: course?.title || "Unknown Course", // Use title instead of courseId
              challenges: challengesWithProgress,
              score:
                user.courseScores.find(
                  (score: { courseId: string }) => score.courseId === courseId
                )?.score || 0,
            };
          })
        );

        return {
          address: user.address,
          userName: user.userName,
          twitter: user.twitter,
          github: user.github,
          website: user.website,
          coursesCompleted: coursesWithChallenges,
        };
      })
    );

    return NextResponse.json(
      { success: true, users: usersWithProgress },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users with progress:", error);
    return NextResponse.json(
      { message: "Error fetching users with progress", error },
      { status: 500 }
    );
  }
}
