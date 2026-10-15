"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import type { Channel } from "stream-chat";
import { FiArrowLeft, FiInbox, FiMail, FiRefreshCw, FiSearch } from "react-icons/fi";
import { DOMAIN } from "@/utils/constants";
import ChatWindow, { Avatar } from "@/components/support/ChatWindow";
import { useStreamClient } from "@/components/support/useStreamClient";

const ago = (d?: Date | string | null) => {
  if (!d) return "";
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const AdminSupportClient = () => {
  const chat = useStreamClient();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [, setTick] = useState(0);
  const joined = useRef<Set<string>>(new Set());

  const client = chat.status === "ready" ? chat.client : null;

  const load = useCallback(async () => {
    if (!client) return;
    try {
      const list = await client.queryChannels(
        { type: "messaging", support: true },
        [{ last_message_at: -1 }],
        { watch: true, state: true, limit: 30 }
      );
      setChannels(list);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    if (!client) return;
    load();
    const bump = () => setTick((t) => t + 1);
    const subs = [
      client.on("message.new", bump),
      client.on("message.read", bump),
      client.on("notification.message_new", load),
      client.on("notification.added_to_channel", load),
    ];
    const timer = setInterval(load, 60_000);
    return () => {
      subs.forEach((s) => s.unsubscribe());
      clearInterval(timer);
    };
  }, [client, load]);

  const sorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...channels]
      .filter((c) => !q || `${c.data?.customer_name} ${c.data?.customer_email}`.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.state.last_message_at || 0).getTime() - new Date(a.state.last_message_at || 0).getTime());
  }, [channels, query, channels.map((c) => c.state.last_message_at?.toString()).join()]);

  const active = channels.find((c) => c.id === activeId) || null;

  const open = (c: Channel) => {
    setActiveId(c.id || null);
    if (c.id && !joined.current.has(c.id)) {
      joined.current.add(c.id);
      axios.post(`${DOMAIN}/api/support/join`, { channelId: c.id }).catch(() => undefined);
    }
  };

  if (chat.status !== "ready") {
    return (
      <section className="p-5 h-full grid place-items-center text-center">
        {chat.status === "loading" ? (
          <p className="text-gray-600">Connecting to the support inbox…</p>
        ) : (
          <div className="max-w-md">
            <FiInbox className="text-5xl text-purple-600 mx-auto mb-3" />
            <p className="font-bold text-gray-900 text-lg">{chat.status === "off" ? "Support chat isn’t set up yet" : "Couldn’t connect"}</p>
            <p className="text-gray-600 mt-1">
              {chat.status === "off" ? (
                <>Add <code className="bg-purple-100 px-1 rounded">STREAM_API_KEY</code> and <code className="bg-purple-100 px-1 rounded">STREAM_API_SECRET</code> to your <code>.env</code> and restart the server.</>
              ) : (
                (chat as { message: string }).message
              )}
            </p>
            <button onClick={chat.retry} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-800 transition">
              <FiRefreshCw /> Try again
            </button>
          </div>
        )}
      </section>
    );
  }

  const unreadTotal = channels.reduce((s, c) => s + c.countUnread(), 0);

  return (
    <section className="p-3 lg:p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-700 flex items-center gap-2">
          Support inbox
          {unreadTotal > 0 && <span className="pop text-sm px-2 py-0.5 rounded-full bg-purple-600 text-white">{unreadTotal} new</span>}
        </h1>
        <button onClick={load} className="text-purple-700 hover:text-purple-900 p-2" aria-label="Refresh"><FiRefreshCw /></button>
      </div>

      <div className="flex-1 min-h-0 grid lg:grid-cols-[320px_1fr] gap-4">
        <div className={`min-h-0 flex-col bg-purple-200 rounded shadow overflow-hidden ${active ? "hidden lg:flex" : "flex"}`}>
          <label className="flex items-center gap-2 m-3 px-3 py-2 bg-white rounded border-2 border-transparent focus-within:border-purple-600 transition">
            <FiSearch className="text-gray-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customers" className="flex-1 outline-none bg-transparent" />
          </label>
          <ul className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
            {loading ? (
              [0, 1, 2].map((i) => <li key={i} className="h-16 rounded bg-purple-100 animate-pulse" />)
            ) : sorted.length === 0 ? (
              <li className="text-center text-gray-600 py-10">No conversations yet.</li>
            ) : (
              sorted.map((c, i) => {
                const last = c.lastMessage();
                const unread = c.id === activeId ? 0 : c.countUnread();
                return (
                  <li key={c.cid} className="fade-up" style={{ ["--i" as string]: i }}>
                    <button
                      onClick={() => open(c)}
                      className={`w-full flex items-center gap-3 p-3 rounded text-left transition ${
                        c.id === activeId ? "bg-purple-600 text-white shadow" : "bg-white hover:-translate-y-0.5 hover:shadow"
                      }`}
                    >
                      <Avatar size="sm" name={c.data?.customer_name} />
                      <span className="flex-1 min-w-0">
                        <span className="flex justify-between gap-2">
                          <b className="truncate capitalize">{c.data?.customer_name || "Customer"}</b>
                          <span className={`text-xs shrink-0 ${c.id === activeId ? "text-purple-100" : "text-gray-500"}`}>{ago(c.state.last_message_at)}</span>
                        </span>
                        <span className={`flex justify-between gap-2 text-sm ${c.id === activeId ? "text-purple-100" : "text-gray-600"}`}>
                          <span className={`truncate ${unread ? "font-bold text-gray-900" : ""}`}>{last?.text || "No messages"}</span>
                          {unread > 0 && <span className="shrink-0 min-w-5 h-5 px-1.5 grid place-items-center rounded-full bg-purple-600 text-white text-xs font-bold">{unread}</span>}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        <div className={`min-h-0 h-full ${active ? "block" : "hidden lg:block"}`}>
          {active ? (
            <div className="h-full fade-up" key={active.cid}>
              <ChatWindow
                channel={active}
                me={chat.me}
                title={active.data?.customer_name || "Customer"}
                subtitle={<span className="inline-flex items-center gap-1"><FiMail /> {active.data?.customer_email}</span>}
                actions={
                  <button onClick={() => setActiveId(null)} className="lg:hidden p-2 text-gray-600" aria-label="Back to inbox">
                    <FiArrowLeft />
                  </button>
                }
                emptyText="No messages yet."
              />
            </div>
          ) : (
            <div className="h-full bg-white rounded-lg border-2 border-gray-300 grid place-items-center text-center p-8">
              <div>
                <FiInbox className="text-5xl text-purple-600 mx-auto mb-3" />
                <p className="font-bold text-gray-900">Pick a conversation</p>
                <p className="text-gray-600">Customer messages show up here in real time.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminSupportClient;
