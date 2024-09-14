"use client";
import petraConnect from "./components/petraConnect";

export default function Home() {
  return (
    <>
      <h1>Aptos Institute</h1>
      <p>Hackathon project on Aptos</p>
      {petraConnect()}
    </>
  );
}
