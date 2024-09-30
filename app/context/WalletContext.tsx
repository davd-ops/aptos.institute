import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import walletConnect from "@/app/hooks/walletConnect";

interface WalletContextProps {
  address: string | null;
  isLoggedIn: boolean;
  userBalance: number;
  userProgress: Record<string, any>;
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
    walletConnect();
  const [userBalance, setUserBalance] = useState(0);
  const [userProgress, setUserProgress] = useState<Record<string, any>>({});

  const fetchUserProgressForCourse = async (courseId: string) => {
    try {
      const response = await fetch(
        `/api/getUserProgress?address=${address}&courseId=${courseId}`
      );
      const data = await response.json();
      if (data.success) {
        return {
          completedChallenges: data.completedChallenges,
          progress: data.progress,
        };
      } else {
        return { completedChallenges: 0, progress: [] };
      }
    } catch (error) {
      console.error("Error fetching user progress for course:", error);
      return { completedChallenges: 0, progress: [] };
    }
  };

  const fetchUserProfile = async () => {
    try {
      const progressMap: Record<string, any> = {};
      const userResponse = await fetch(`/api/profile`);
      const userData = await userResponse.json();

      if (userData) {
        setUserBalance(userData.balance);

        for (const unlockedCourseId of userData.coursesUnlocked) {
          const courseProgress = await fetchUserProgressForCourse(
            unlockedCourseId
          );
          progressMap[unlockedCourseId] = {
            unlocked: true,
            completedChallenges: courseProgress.completedChallenges,
            progress: courseProgress.progress,
          };
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
