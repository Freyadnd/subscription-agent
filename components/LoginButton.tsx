"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthButton() {
  const { login, logout, authenticated, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (authenticated) {
      router.push("/dashboard");
    }
  }, [authenticated]);

  if (!ready) return null;

  if (authenticated) {
    return (
      <button
        onClick={() => {
          logout();
          router.push("/");
        }}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Logout
      </button>
    );
  }

  return (
    <button
      onClick={login}
      className="px-4 py-2 bg-black text-white rounded"
    >
      Login with Google
    </button>
  );
}
