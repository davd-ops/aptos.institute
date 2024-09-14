"use client";
import walletConnect from "./components/walletConnector";

export default function Home() {
  return (
    <>
      <h1>Aptos Institute</h1>
      <p>Hackathon project on Aptos</p>
      {walletConnect()}
    </>
  );
}
