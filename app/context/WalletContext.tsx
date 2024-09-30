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

  const fetchUserProfile = async () => {
    try {
      const progressMap: Record<string, any> = {};
      const userResponse = await fetch(`/api/profile`);
      const userData = await userResponse.json();

      if (userData) {
        setUserBalance(userData.balance);
        userData.coursesUnlocked.forEach((unlockedCourseId: string) => {
          progressMap[unlockedCourseId] = { unlocked: true };
        });
        setUserProgress(progressMap);
      }
    } catch (error) {
      console.error("Error fetching user progress or balance:", error);
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
