import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { accessToken } = await req.json();

  if (!accessToken) {
    return NextResponse.json({ error: "No token" }, { status: 400 });
  }

  const query =
    "newer_than:30d (receipt OR billed OR subscription OR invoice OR charged)";

  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(
      query
    )}&maxResults=10`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const listData = await listRes.json();

  if (!listData.messages) {
    return NextResponse.json({ messages: [] });
  }

  // Fetch details
  const detailed = await Promise.all(
    listData.messages.map(async (msg: any) => {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const msgData = await msgRes.json();

      const subject =
        msgData.payload.headers.find(
          (h: any) => h.name === "Subject"
        )?.value || "";

      return {
        id: msg.id,
        subject,
        snippet: msgData.snippet,
      };
    })
  );

  return NextResponse.json({ messages: detailed });
}
