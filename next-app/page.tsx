"use client";
import { Box } from "@chakra-ui/react";

import walletConnect from "./components/WalletConnection";
import Editor from "./components/CodeEditor";

export default function Home() {
  return (
    <>
      <h1>Aptos Institute</h1>
      <p>Hackathon project on Aptos</p>
      {walletConnect()}
    
      <Box p={8}>
        <Editor />
      </Box>
    </>
  );
}
