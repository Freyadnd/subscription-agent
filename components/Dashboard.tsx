"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { user, authenticated, ready, logout } = usePrivy();
  const router = useRouter();

  const [dbUser, setDbUser] = useState<any>(null);
  const [subs, setSubs] = useState<any[]>([]);
  const [gmailMessages, setGmailMessages] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    cycle: "monthly",
    nextCharge: "",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (ready && !authenticated) {
      router.replace("/");
    }
  }, [ready, authenticated]);

  // Sync DB user
  useEffect(() => {
    if (!ready || !authenticated) return;

    const email =
      user?.email?.address ||
      user?.google?.email;

    if (!email) return;

    fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        walletAddress: user.wallet?.address || null,
      }),
    })
      .then(res => res.json())
      .then(data => setDbUser(data));
  }, [ready, authenticated, user]);

  // Load subscriptions
  useEffect(() => {
    if (!dbUser?.id) return;

    fetch(`/api/subscriptions?userId=${dbUser.id}`)
      .then(res => res.json())
      .then(data => setSubs(data));
  }, [dbUser]);

  // 🔥 Subscription engine
  const getNextCharge = (sub: any) => {
    let next = new Date(sub.nextCharge);
    const today = new Date();

    while (next < today) {
      if (sub.cycle === "monthly") {
        next.setMonth(next.getMonth() + 1);
      } else if (sub.cycle === "yearly") {
        next.setFullYear(next.getFullYear() + 1);
      } else {
        break;
      }
    }

    return next;
  };

  const handleCreate = async () => {
    if (!dbUser?.id || !form.nextCharge) return;

    await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        amount: parseFloat(form.amount),
        cycle: form.cycle,
        paymentType: "manual",
        nextCharge: form.nextCharge,
        userId: dbUser.id,
      }),
    });

    const res = await fetch(`/api/subscriptions?userId=${dbUser.id}`);
    const data = await res.json();
    setSubs(data);

    setForm({
      name: "",
      amount: "",
      cycle: "monthly",
      nextCharge: "",
    });
  };

  const handleCancel = async (id: string) => {
    await fetch("/api/subscriptions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const res = await fetch(`/api/subscriptions?userId=${dbUser.id}`);
    const data = await res.json();
    setSubs(data);
  };

  // Gmail Import
  const importGmail = async () => {
    const googleAccount = user?.linkedAccounts?.find(
      (acc: any) => acc.type === "google_oauth"
    );

    const accessToken = googleAccount?.accessToken;

    if (!accessToken) {
      alert("No Gmail access token found. Re-login with Gmail scope.");
      return;
    }

    const res = await fetch("/api/gmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
    });

    const data = await res.json();
    setGmailMessages(data.messages || []);
  };

  const monthlyTotal = subs.reduce((acc, sub) => {
    if (sub.cycle === "monthly") return acc + sub.amount;
    if (sub.cycle === "yearly") return acc + sub.amount / 12;
    return acc;
  }, 0);

  const upcoming = subs.filter(sub => {
    const chargeDate = getNextCharge(sub);
    const today = new Date();
    const diff =
      (chargeDate.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  if (!ready) return null;

  return (
    <div className="p-10 space-y-6">
      <button
        onClick={async () => {
          await logout();
          router.replace("/");
        }}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Logout
      </button>

      <h2 className="text-2xl font-semibold">
        Subscription Dashboard
      </h2>

      <p className="text-lg font-semibold">
        Monthly Burn: ${monthlyTotal.toFixed(2)}
      </p>

      {/* Gmail Import */}
      <button
        onClick={importGmail}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Import from Gmail
      </button>

      {gmailMessages.length > 0 && (
        <div className="border p-4 rounded">
          <h3 className="font-semibold">Gmail Receipts</h3>
          {gmailMessages.map(msg => (
            <div key={msg.id} className="border-b py-2">
              <p className="font-semibold">{msg.subject}</p>
              <p className="text-sm text-gray-500">
                {msg.snippet}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming */}
      <div className="border p-4 rounded">
        <h3 className="font-semibold">Upcoming (7 days)</h3>
        {upcoming.length === 0 ? (
          <p>No upcoming charges</p>
        ) : (
          upcoming.map(sub => (
            <p key={sub.id}>
              {sub.name} — ${sub.amount}
            </p>
          ))
        )}
      </div>

      {/* Add Subscription */}
      <div className="space-y-2 border p-4 rounded">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          className="border p-2 w-full"
        />

        <input
          placeholder="Amount"
          value={form.amount}
          onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
          }
          className="border p-2 w-full"
        />

        <select
          value={form.cycle}
          onChange={(e) =>
            setForm({ ...form, cycle: e.target.value })
          }
          className="border p-2 w-full"
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <input
          type="date"
          value={form.nextCharge}
          onChange={(e) =>
            setForm({ ...form, nextCharge: e.target.value })
          }
          className="border p-2 w-full"
        />

        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Add Subscription
        </button>
      </div>

      {/* Subscription List */}
      <div className="space-y-2">
        {subs.length === 0 ? (
          <p>No subscriptions yet.</p>
        ) : (
          subs.map(sub => (
            <div
              key={sub.id}
              className="border p-3 rounded flex justify-between"
            >
              <div>
                <p className="font-semibold">{sub.name}</p>
                <p>
                  ${sub.amount} ({sub.cycle})
                </p>
                <p className="text-sm text-gray-500">
                  Next charge:{" "}
                  {getNextCharge(sub).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleCancel(sub.id)}
                className="text-red-500"
              >
                Cancel
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
