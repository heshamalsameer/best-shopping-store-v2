"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { StreamChat } from "stream-chat";
import { DOMAIN } from "@/utils/constants";

export type ChatMe = { id: string; name: string; role: string };

type State =
  | { status: "loading" }
  | { status: "off"; message: string }
  | { status: "error"; message: string }
  | { status: "ready"; client: StreamChat; me: ChatMe; channelId?: string };

export function useStreamClient() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    let client: StreamChat | null = null;

    (async () => {
      try {
        const { data } = await axios.get(`${DOMAIN}/api/support/token`);
        if (!alive) return;
        client = StreamChat.getInstance(data.apiKey);
        if (client.userID && client.userID !== data.user.id) await client.disconnectUser();
        if (!client.userID) await client.connectUser({ id: data.user.id, name: data.user.name }, data.token);
        if (alive) setState({ status: "ready", client, me: data.user, channelId: data.channelId });
      } catch (err: any) {
        if (!alive) return;
        const res = err?.response;
        if (res?.status === 503) setState({ status: "off", message: res.data?.message || "Support chat is offline" });
        else setState({ status: "error", message: res?.data?.message || "We couldn’t reach support right now." });
      }
    })();

    return () => {
      alive = false;
      client?.disconnectUser().catch(() => undefined);
    };
  }, [attempt]);

  return { ...state, retry: () => { setState({ status: "loading" }); setAttempt((a) => a + 1); } } as State & { retry: () => void };
}
