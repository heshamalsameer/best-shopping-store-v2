import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { getStreamServer, streamConfigured, streamUserId, supportChannelId, SUPPORT_BOT } from "@/utils/stream";

export async function GET(request: NextRequest) {
  const payload = verifyToken(request);
  if (!payload) return NextResponse.json({ message: "Please log in first" }, { status: 401 });
  if (!streamConfigured())
    return NextResponse.json({ message: "Support chat is not configured yet", configured: false }, { status: 503 });

  try {
    const user = await prisma.user.findUnique({ where: { id: payload.id }, select: { id: true, username: true, email: true, isAdmin: true } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const server = getStreamServer();
    const me = { id: streamUserId(user.id), name: user.username, role: user.isAdmin ? "admin" : "user" };
    const token = server.createToken(me.id);

    if (user.isAdmin) {
      await server.upsertUsers([me]);
      return NextResponse.json({ apiKey: process.env.STREAM_API_KEY, token, user: me, isAdmin: true }, { status: 200 });
    }

    const admins = await prisma.user.findMany({ where: { isAdmin: true }, select: { id: true, username: true } });
    const adminUsers = admins.map((a) => ({ id: streamUserId(a.id), name: a.username, role: "admin" }));
    await server.upsertUsers([me, SUPPORT_BOT, ...adminUsers]);

    const channelId = supportChannelId(user.id);
    const channel = server.channel("messaging", channelId, {
      name: `${user.username} · Support`,
      created_by_id: me.id,
      members: [me.id, ...adminUsers.map((a) => a.id)],
      support: true,
      customer_id: user.id,
      customer_name: user.username,
      customer_email: user.email,
    });
    const state = await channel.create();

    const known = new Set((state.members || []).map((m) => m.user_id));
    const missing = adminUsers.map((a) => a.id).filter((id) => !known.has(id));
    if (missing.length) await channel.addMembers(missing);

    if (!state.messages || state.messages.length === 0) {
      await channel.sendMessage({
        text: `Hi ${user.username}! 👋 This is Best Shopping support. Ask us anything about products, payments or an order — we usually reply within a few minutes.`,
        user_id: SUPPORT_BOT.id,
      });
    }

    return NextResponse.json({ apiKey: process.env.STREAM_API_KEY, token, user: me, channelId, isAdmin: false }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Could not connect to support chat" }, { status: 500 });
  }
}
