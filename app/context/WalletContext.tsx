import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import useWalletConnect from "@/app/hooks/walletConnect";

interface CourseProgress {
  unlocked: boolean;
  completedChallenges: number;
  progress: Array<{
    challengeId: string;
    completed: boolean;
  }>;
}

interface WalletContextProps {
  address: string | null;
  isLoggedIn: boolean;
  userBalance: number;
  userProgress: Record<string, CourseProgress>;
  fetchUserProfile: () => Promise<void>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const useWallet = (): WalletContextProps => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { connectWallet, disconnectWallet, address, isLoggedIn } =
    useWalletConnect();
  const [userBalance, setUserBalance] = useState(0);
  const [userProgress, setUserProgress] = useState<
    Record<string, CourseProgress>
  >({});

  const fetchUserProgressForCourse = async (
    courseId: string
  ): Promise<CourseProgress> => {
    try {
      const response = await fetch(
        `/api/getUserProgress?address=${address}&courseId=${courseId}`
      );
      const data = await response.json();
      if (data.success) {
        return {
          unlocked: true,
          completedChallenges: data.completedChallenges,
          progress: data.progress,
        };
      } else {
        return { unlocked: false, completedChallenges: 0, progress: [] };
      }
    } catch (error) {
      console.error("Error fetching user progress for course:", error);
      return { unlocked: false, completedChallenges: 0, progress: [] };
    }
  };

  const fetchUserProfile = async () => {
    try {
      const progressMap: Record<string, CourseProgress> = {};
      const userResponse = await fetch(`/api/profile`);
      const userData = await userResponse.json();

      if (userData) {
        setUserBalance(userData.balance);

        for (const unlockedCourseId of userData.coursesUnlocked) {
          const courseProgress = await fetchUserProgressForCourse(
            unlockedCourseId
          );
          progressMap[unlockedCourseId] = courseProgress;
        }
        setUserProgress(progressMap);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && address) {
      fetchUserProfile();
    }
  }, [isLoggedIn, address]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isLoggedIn,
        userBalance,
        userProgress,
        fetchUserProfile,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
