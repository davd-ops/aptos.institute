"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/next-app/components/Navbar";

interface ProfileProps {
  address: string;
  userName: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileProps | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!profile) {
    return <p>Redirecting...</p>;
  }

  return (
    <>
      <Navbar />
      <h1>User Profile</h1>
      <p>
        <strong>Wallet Address:</strong> {profile.address}
      </p>
      <p>
        <strong>Username:</strong> {profile.userName}
      </p>
    </>
  );
};

export default Profile;
