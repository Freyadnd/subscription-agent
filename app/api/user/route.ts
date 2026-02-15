import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  console.log("🔥 User API hit");

  const { email, walletAddress } = await req.json();

  const user = await prisma.user.upsert({
    where: { email },
    update: { walletAddress },
    create: { email, walletAddress },
  });

  console.log("🔥 Created:", user);

  return NextResponse.json(user);
}
