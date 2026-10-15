"use client";
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Channel, Event, LocalMessage } from "stream-chat";
import { FiCheck, FiSend } from "react-icons/fi";
import { RiCustomerService2Line } from "react-icons/ri";
import type { ChatMe } from "./useStreamClient";

interface Props {
  channel: Channel;
  me: ChatMe;
  title: string;
  subtitle?: React.ReactNode;
  prefill?: string;
  quickReplies?: string[];
  emptyText?: string;
  actions?: React.ReactNode;
}

const PAGE = 30;
const time = (d?: Date | string) => (d ? new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "");
const dayLabel = (d: Date) => {
  const today = new Date();
  const y = new Date();
  y.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
};
const initials = (name = "?") => name.trim().slice(0, 1).toUpperCase();

export const Avatar = ({ name, support, size = "md" }: { name?: string; support?: boolean; size?: "sm" | "md" }) => (
  <span
    className={`shrink-0 grid place-items-center rounded-full font-bold ${size === "sm" ? "w-8 h-8 text-sm" : "w-11 h-11 text-lg"} ${
      support ? "bg-blue-600 text-white" : "bg-[var(--header-color)] text-[rgb(19,19,126)]"
    }`}
  >
    {support ? <RiCustomerService2Line /> : initials(name)}
  </span>
);

const ChatWindow = ({ channel, me, title, subtitle, prefill, quickReplies = [], emptyText, actions }: Props) => {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [ready, setReady] = useState(false);
  const [typing, setTyping] = useState<string[]>([]);
  const [readAt, setReadAt] = useState<number>(0);
  const [text, setText] = useState(prefill || "");
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stick = useRef(true);
  const freshIds = useRef<Set<string>>(new Set());

  const syncRead = useCallback(() => {
    const read = channel.state.read || {};
    let latest = 0;
    Object.entries(read).forEach(([uid, r]) => {
      if (uid !== me.id && r?.last_read) latest = Math.max(latest, new Date(r.last_read).getTime());
    });
    setReadAt(latest);
  }, [channel, me.id]);

  useEffect(() => {
    let alive = true;
    setReady(false);
    stick.current = true;
    const sync = () => setMessages([...channel.state.messages]);

    channel
      .watch({ messages: { limit: PAGE } } as never)
      .then(() => {
        if (!alive) return;
        sync();
        syncRead();
        setHasMore(channel.state.messages.length >= PAGE);
        setReady(true);
        channel.markRead().catch(() => undefined);
      })
      .catch(() => alive && setReady(true));

    const subs = [
      channel.on("message.new", (e: Event) => {
        if (e.message?.id) freshIds.current.add(e.message.id);
        sync();
        if (e.user?.id !== me.id && document.visibilityState === "visible") channel.markRead().catch(() => undefined);
      }),
      channel.on("message.updated", sync),
      channel.on("message.deleted", sync),
      channel.on("message.read", syncRead),
      channel.on("typing.start", (e: Event) => {
        const n = e.user?.id !== me.id ? e.user?.name || "Someone" : null;
        if (n) setTyping((t) => (t.includes(n) ? t : [...t, n]));
      }),
      channel.on("typing.stop", (e: Event) => setTyping((t) => t.filter((n) => n !== (e.user?.name || "Someone")))),
    ];
    return () => {
      alive = false;
      subs.forEach((s) => s.unsubscribe());
    };
  }, [channel, me.id, syncRead]);

  useEffect(() => {
    if (prefill) setText(prefill);
  }, [prefill]);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const onScroll = () => {
    const el = listRef.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const loadOlder = async () => {
    const oldest = messages[0];
    if (!oldest) return;
    const el = listRef.current;
    const before = el?.scrollHeight || 0;
    stick.current = false;
    const res = await channel.query({ messages: { limit: PAGE, id_lt: oldest.id } });
    setHasMore((res.messages?.length || 0) >= PAGE);
    setMessages([...channel.state.messages]);
    requestAnimationFrame(() => {
      if (el) el.scrollTop = el.scrollHeight - before;
    });
  };

  const send = async (value = text) => {
    const body = value.trim();
    if (!body || sending) return;
    setSending(true);
    stick.current = true;
    try {
      await channel.sendMessage({ text: body });
      setText("");
      channel.stopTyping().catch(() => undefined);
    } catch {
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [text]);

  const lastMine = [...messages].reverse().find((m) => m.user?.id === me.id);
  const showQuick = quickReplies.length > 0 && messages.filter((m) => m.user?.id === me.id).length === 0;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border-2 border-gray-300 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-gray-200 bg-white">
        <Avatar name={title} support={me.role !== "admin"} />
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-gray-900 truncate capitalize">{title}</h2>
          <p className="text-sm text-gray-500 truncate">
            {typing.length ? <span className="text-blue-700 font-semibold">{typing[0]} is typing…</span> : subtitle}
          </p>
        </div>
        {actions}
      </div>

      <div ref={listRef} onScroll={onScroll} className="chat-scroll flex-1 overflow-y-auto px-4 py-4 bg-[#f6f7f9]">
        {!ready ? (
          <div className="space-y-3">
            {[60, 40, 70].map((w, i) => (
              <div key={i} className={`h-10 rounded-2xl bg-gray-200 animate-pulse ${i % 2 ? "ml-auto" : ""}`} style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500 py-16">{emptyText || "No messages yet."}</p>
        ) : (
          <>
            {hasMore && (
              <div className="text-center mb-3">
                <button onClick={loadOlder} className="text-sm font-semibold text-blue-700 hover:underline">Load earlier messages</button>
              </div>
            )}
            {messages.map((m, i) => {
              const prev = messages[i - 1];
              const at = new Date(m.created_at || Date.now());
              const newDay = !prev || new Date(prev.created_at || 0).toDateString() !== at.toDateString();
              const grouped = !newDay && prev?.user?.id === m.user?.id && at.getTime() - new Date(prev.created_at || 0).getTime() < 5 * 60 * 1000;
              const mine = m.user?.id === me.id;
              const next = messages[i + 1];
              const lastInGroup = !next || next.user?.id !== m.user?.id || new Date(next.created_at || 0).getTime() - at.getTime() >= 5 * 60 * 1000;
              const isSupport = m.user?.role === "admin" || m.user?.id === "bs-support";
              const seen = mine && m.id === lastMine?.id && readAt >= at.getTime();
              const fresh = freshIds.current.has(m.id);

              return (
                <Fragment key={m.id}>
                  {newDay && (
                    <div className="flex items-center gap-3 my-4 text-xs font-semibold text-gray-500">
                      <span className="flex-1 h-px bg-gray-300" />
                      {dayLabel(at)}
                      <span className="flex-1 h-px bg-gray-300" />
                    </div>
                  )}
                  <div className={`flex items-end gap-2 ${mine ? "justify-end" : ""} ${grouped ? "mt-1" : "mt-4"} ${fresh ? "msg-in" : ""}`}>
                    {!mine && (
                      <span className={lastInGroup ? "" : "invisible"}>
                        <Avatar size="sm" name={m.user?.name} support={isSupport} />
                      </span>
                    )}
                    <div className={`max-w-[78%] flex flex-col ${mine ? "items-end" : "items-start"}`}>
                      {!mine && !grouped && (
                        <span className="text-xs font-semibold text-gray-500 mb-1 ms-1 capitalize">
                          {m.user?.name}
                          {isSupport && me.role !== "admin" && <span className="ms-1 text-blue-700">· Support</span>}
                        </span>
                      )}
                      <div
                        className={`px-4 py-2 whitespace-pre-wrap break-words leading-relaxed ${
                          mine
                            ? `bg-blue-600 text-white rounded-2xl ${lastInGroup ? "rounded-br-md" : ""}`
                            : `bg-white text-gray-900 border-2 border-gray-200 rounded-2xl ${lastInGroup ? "rounded-bl-md" : ""}`
                        } ${m.status === "failed" || m.type === "error" ? "opacity-60" : ""}`}
                      >
                        {m.text}
                      </div>
                      {lastInGroup && (
                        <span className="mt-1 text-[11px] text-gray-500 flex items-center gap-1">
                          {time(at)}
                          {mine && (seen ? <span className="text-blue-700 font-semibold">· Seen</span> : <FiCheck className="text-gray-400" />)}
                        </span>
                      )}
                    </div>
                  </div>
                </Fragment>
              );
            })}
            {typing.length > 0 && (
              <div className="flex items-end gap-2 mt-4 msg-in">
                <Avatar size="sm" name={typing[0]} support={me.role !== "admin"} />
                <div className="bg-white border-2 border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                  <span className="typing-dot" />
                  <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
                  <span className="typing-dot" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showQuick && ready && (
        <div className="flex gap-2 overflow-x-auto px-4 pt-3 bg-white">
          {quickReplies.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="shrink-0 px-3 py-1 rounded-full border-2 border-blue-600 text-blue-700 text-sm font-semibold hover:bg-blue-600 hover:text-white transition"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-end gap-2 p-3 bg-white"
      >
        <textarea
          ref={inputRef}
          rows={1}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            channel.keystroke().catch(() => undefined);
          }}
          onKeyDown={onKey}
          placeholder="Write a message…"
          aria-label="Message"
          className="flex-1 resize-none rounded-lg border-2 border-gray-300 px-3 py-2 outline-none focus:border-blue-600 transition max-h-36"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          aria-label="Send"
          className="grid place-items-center w-11 h-11 rounded-lg bg-blue-600 text-white text-lg hover:bg-blue-800 disabled:bg-gray-300 transition active:scale-95"
        >
          <FiSend />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
