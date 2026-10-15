import { StreamChat } from "stream-chat";

declare module "stream-chat" {
  interface CustomChannelData {
    name?: string;
    support?: boolean;
    customer_id?: number;
    customer_name?: string;
    customer_email?: string;
  }
}

export const SUPPORT_BOT = { id: "bs-support", name: "Best Shopping Support" };

export const streamUserId = (id: number) => `bs-user-${id}`;
export const supportChannelId = (id: number) => `support-${id}`;

export const streamConfigured = () =>
  Boolean(process.env.STREAM_API_KEY && process.env.STREAM_API_SECRET);

export const getStreamServer = () =>
  StreamChat.getInstance(process.env.STREAM_API_KEY as string, process.env.STREAM_API_SECRET as string);
