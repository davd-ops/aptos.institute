"use client";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import HeroSection from "@/app/components/HeroSection";
import InfoSection from "@/app/components/InfoSection";
import { Box } from "@chakra-ui/react";

export default function Home() {
  return (
    <>
      <Navbar />
      <Box minH="69vh">
        <HeroSection />
        <InfoSection />
      </Box>
      <Footer />
    </>
  );
}
