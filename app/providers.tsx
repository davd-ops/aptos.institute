"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { WalletProvider } from "@/app/context/WalletContext";
import theme from "@/app/theme/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <CacheProvider>
        <ChakraProvider theme={theme}>{children}</ChakraProvider>
      </CacheProvider>
    </WalletProvider>
  );
}
