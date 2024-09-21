import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import { fonts } from "@/app/fonts";
import { Box } from "@chakra-ui/react";

export const metadata: Metadata = {
  title: "Aptos Institute",
  description: "Hackathon project on Aptos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fonts.rubik.variable}>
      <body>
        <Providers>
          <Box bgColor="gray.800">{children}</Box>
        </Providers>
      </body>
    </html>
  );
}
