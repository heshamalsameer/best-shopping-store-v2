import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/verifyToken";
import { getStreamServer, streamConfigured, streamUserId } from "@/utils/stream";

export async function POST(request: NextRequest) {
  const payload = verifyToken(request);
  if (!payload?.isAdmin) return NextResponse.json({ message: "Only admins can join conversations" }, { status: 403 });
  if (!streamConfigured()) return NextResponse.json({ message: "Support chat is not configured yet" }, { status: 503 });

  const { channelId } = (await request.json().catch(() => ({}))) as { channelId?: string };
  if (!channelId || !/^support-\d+$/.test(channelId))
    return NextResponse.json({ message: "Invalid conversation" }, { status: 400 });

  try {
    await getStreamServer().channel("messaging", channelId).addMembers([streamUserId(payload.id)]);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Could not join the conversation" }, { status: 500 });
  }
}
