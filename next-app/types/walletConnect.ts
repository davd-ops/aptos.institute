export interface SignedMessageResponse {
    signature: string;
    fullMessage: string;
  }
  
export interface WalletConnectReturn {
    walletAvailable: boolean;
    connectWallet: () => Promise<void>;
    address: string | null;
    signedMessage: SignedMessageResponse | null;
    verificationStatus: string | null;
  }