"use client";

import { useState } from "react";

export default function AIChat() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const sendPrompt = async () => {
    const res = await fetch("/api/agent", {
      method: "POST",
      body: JSON.stringify({ prompt: input }),
    });

    const data = await res.json();
    setResponse(data.reply);
  };

  return (
    <div className="space-y-2">
      <h3 className="font-medium">AI Assistant</h3>
      <input
        className="border p-2 w-full"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Summarize my subscriptions"
      />
      <button
        onClick={sendPrompt}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Send
      </button>

      {response && (
        <div className="border p-2 rounded">
          {response}
        </div>
      )}
    </div>
  );
}
