"use client";
import { useState, useEffect } from "react";
import nacl from "tweetnacl";
import { HexString } from "aptos";
import {
  SignedMessageResponse,
  WalletConnectReturn,
} from "@/app/types/walletConnect";
import {
  Aptos,
  AptosConfig,
  Network,
  NetworkToNetworkName,
} from "@aptos-labs/ts-sdk";

const useWalletConnect = (): WalletConnectReturn => {
  const [walletAvailable, setWalletAvailable] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [signedMessage, setSignedMessage] =
    useState<SignedMessageResponse | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(
    null
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const APTOS_NETWORK: Network = NetworkToNetworkName[Network.TESTNET];
  const config = new AptosConfig({ network: APTOS_NETWORK });
  const aptos = new Aptos(config);

  useEffect(() => {
    if (typeof window !== "undefined" && window.aptos) {
      setWalletAvailable(true);
    }

    // Check session when the component loads
    checkSession();
  }, []);

  const checkSession = async (): Promise<void> => {
    try {
      const response = await fetch("/api/session", {
        method: "GET",
      });

      const data = await response.json();

      if (data.loggedIn) {
        setAddress(data.address);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setIsLoggedIn(false);
    }
  };

  const connectWallet = async (): Promise<void> => {
    try {
      const response = await window.aptos.connect();
      setAddress(response.address);
      await fetchNonce();
    } catch (error) {
      console.error("Error connecting to Petra Wallet:", error);
    }
  };

  const fetchNonce = async (): Promise<void> => {
    try {
      const response = await fetch("/api/generateNonce");
      const data = await response.json();
      setNonce(data.nonce);
    } catch (error) {
      console.error("Error fetching nonce:", error);
    }
  };

  const signMessage = async (): Promise<void> => {
    try {
      if (!nonce) {
        console.error("Nonce not fetched");
        return;
      }

      const message = `Please verify your account by signing this message. \n\nNonce: ${nonce}`;
      const response: SignedMessageResponse = await window.aptos.signMessage({
        message,
        nonce,
      });

      setSignedMessage(response);
      await verifyMessage(response);
    } catch (error) {
      console.error("Error signing the message:", error);
    }
  };

  const verifyMessage = async (
    response: SignedMessageResponse
  ): Promise<void> => {
    try {
      const { publicKey } = await window.aptos.account();
      const key = publicKey.slice(2, 66); // Remove the 0x prefix

      const verified = nacl.sign.detached.verify(
        new TextEncoder().encode(response.fullMessage),
        new HexString(response.signature).toUint8Array(),
        new HexString(key).toUint8Array()
      );

      if (verified) {
        setVerificationStatus("Verified");
        await generateJWT(address!);
        await createUser(address!);
      } else {
        setVerificationStatus("Verification failed");
      }
    } catch (error) {
      console.error("Error verifying the message:", error);
    }
  };

  const generateJWT = async (address: string): Promise<void> => {
    try {
      const response = await fetch("/api/generateJWT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();
      if (data.success) {
        console.log("JWT token generated");
        setIsLoggedIn(true); // Set logged-in state
      } else {
        console.error("Failed to generate JWT token.");
      }
    } catch (error) {
      console.error("Error generating JWT token:", error);
    }
  };

  const createUser = async (address: string): Promise<void> => {
    try {
      const response = await fetch("/api/createUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();
      if (data.success) {
        console.log(data.message);
      } else {
        console.error("Failed to create user.");
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const disconnectWallet = async (): Promise<void> => {
    try {
      await window.aptos.disconnect();

      const response = await fetch("/api/logout", {
        method: "GET",
      });

      const data = await response.json();
      if (data.success) {
        setAddress(null);
        setIsLoggedIn(false);
        setVerificationStatus(null);
        console.log("Logged out successfully");
      } else {
        console.error("Failed to log out.");
      }
    } catch (error) {
      console.error("Error during disconnect and logout:", error);
    }
  };

  useEffect(() => {
    if (address && nonce && !signedMessage) {
      signMessage();
    }
  }, [address, nonce, signedMessage, signMessage]);

  const sendTransaction = async (
    args: any[],
    fnc: string,
    type: string,
    typeArguments: any[]
  ): Promise<any> => {
    const buildTransaction = {
      arguments: args,
      function: fnc,
      type: type,
      type_arguments: typeArguments,
    };

    try {
      const pendingTransaction = await window.aptos.signAndSubmitTransaction(
        buildTransaction
      );

      const transaction = await aptos.transaction.waitForTransaction({
        transactionHash: pendingTransaction.hash,
      });

      return transaction;
    } catch (error) {
      console.error("Error sending transaction:", error);
      throw new Error("Transaction submission failed.");
    }
  };

  return {
    walletAvailable,
    connectWallet,
    disconnectWallet,
    sendTransaction,
    address,
    signedMessage,
    verificationStatus,
    isLoggedIn,
  };
};

export default useWalletConnect;
