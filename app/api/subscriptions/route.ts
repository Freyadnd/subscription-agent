import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET user scoped subscriptions
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json([]);
  }

  const subs = await prisma.subscription.findMany({
    where: { userId, status: "active" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(subs);
}

// CREATE subscription
export async function POST(req: Request) {
  const body = await req.json();

  const sub = await prisma.subscription.create({
    data: {
      name: body.name,
      amount: body.amount,
      cycle: body.cycle,
      paymentType: body.paymentType,
      nextCharge: new Date(body.nextCharge),
      userId: body.userId,
    },
  });

  return NextResponse.json(sub);
}

// CANCEL subscription
export async function DELETE(req: Request) {
  const { id } = await req.json();

  await prisma.subscription.update({
    where: { id },
    data: { status: "cancelled" },
  });

  return NextResponse.json({ success: true });
}
