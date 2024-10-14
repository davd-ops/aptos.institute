export interface SignedMessageResponse {
  signature: string;
  fullMessage: string;
}

export interface WalletConnectReturn {
  walletAvailable: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  sendTransaction: (
    args: any[],
    fnc: string,
    type: string,
    typeArguments: any[]
  ) => Promise<any>;
  address: string | null;
  signedMessage: SignedMessageResponse | null;
  verificationStatus: string | null;
  isLoggedIn: boolean;
}
