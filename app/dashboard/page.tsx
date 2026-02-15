"use client";

import { usePrivy } from "@privy-io/react-auth";
import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  const { authenticated } = usePrivy();

  if (!authenticated) {
    return <p>Please login first.</p>;
  }

  return <Dashboard />;
}
