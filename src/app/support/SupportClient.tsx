"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { FiClock, FiMessageCircle, FiRefreshCw, FiZap } from "react-icons/fi";
import ChatWindow from "@/components/support/ChatWindow";
import { useStreamClient } from "@/components/support/useStreamClient";
import StatusBadge from "@/components/orders/StatusBadge";

type MiniOrder = { id: number; number: string; status: OrderStatus; total: number; createdAt: string };

interface Props {
  username: string;
  orders: MiniOrder[];
  initialOrder?: string;
}

const FAQ = [
  { q: "When will my order arrive?", a: "Most orders ship within 24 hours and arrive in 2–4 days. You can follow every step on the order page." },
  { q: "Can I cancel an order?", a: "Yes — open the order and press “Cancel order” any time before it is shipped." },
  { q: "Which payments do you accept?", a: "Visa, Mastercard and Amex online, or cash on delivery." },
  { q: "Is shipping free?", a: "Shipping is free on orders over $100, otherwise it’s a flat $5." },
];

const QUICK = ["Where is my order?", "I want to change my address", "Payment question", "Product advice"];

const SupportClient = ({ username, orders, initialOrder }: Props) => {
  const chat = useStreamClient();
  const [prefill, setPrefill] = useState(initialOrder ? `Hi, I have a question about order ${initialOrder}: ` : "");

  const channel = useMemo(
    () => (chat.status === "ready" && chat.channelId ? chat.client.channel("messaging", chat.channelId) : null),
    [chat.status === "ready" ? chat.channelId : null]
  );

  return (
    <section className="container fix-height m-auto px-5 py-8 max-w-6xl">
      <div className="fade-up mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Help &amp; support</h1>
        <p className="text-gray-600 mt-1">Hi {username}, chat with our team — real people, no bots in the way.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="fade-up h-[calc(100vh-260px)] min-h-[480px]" style={{ ["--i" as string]: 1 }}>
          {chat.status === "ready" && channel ? (
            <ChatWindow
              channel={channel}
              me={chat.me}
              title="Best Shopping Support"
              subtitle={<span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 live-dot" /> Usually replies in a few minutes</span>}
              prefill={prefill}
              quickReplies={QUICK}
              emptyText="Say hello — we’re here to help."
            />
          ) : (
            <div className="h-full bg-white rounded-lg border-2 border-gray-300 grid place-items-center p-8 text-center">
              {chat.status === "loading" ? (
                <div className="text-gray-500">
                  <FiMessageCircle className="text-4xl mx-auto mb-3 text-blue-600 animate-bounce" />
                  Connecting you to support…
                </div>
              ) : (
                <div>
                  <FiMessageCircle className="text-4xl mx-auto mb-3 text-gray-400" />
                  <p className="font-bold text-gray-900">{chat.status === "off" ? "Live chat is offline" : "Couldn’t connect"}</p>
                  <p className="text-gray-600 mt-1 max-w-sm">
                    {chat.status === "off" ? "Our chat isn’t available right now. Please check back soon." : (chat as { message: string }).message}
                  </p>
                  <button onClick={chat.retry} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-800 transition">
                    <FiRefreshCw /> Try again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <div className="fade-up bg-white rounded-lg border-2 border-gray-300 p-5" style={{ ["--i" as string]: 2 }}>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3"><FiClock className="mt-1 text-blue-600 shrink-0" /><span><b className="text-gray-900">Every day, 9am – 11pm</b><br />Messages after hours are answered first thing.</span></li>
              <li className="flex gap-3"><FiZap className="mt-1 text-blue-600 shrink-0" /><span>Mention your order number and we’ll get to it faster.</span></li>
            </ul>
          </div>

          {orders.length > 0 && (
            <div className="fade-up bg-white rounded-lg border-2 border-gray-300 p-5" style={{ ["--i" as string]: 3 }}>
              <h2 className="font-bold text-gray-900 mb-3">Ask about an order</h2>
              <ul className="space-y-2">
                {orders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-2 rounded-lg border-2 border-gray-200 px-3 py-2 hover:border-blue-600 transition">
                    <div className="min-w-0">
                      <Link href={`/orders/${o.id}`} className="font-semibold text-gray-900 hover:text-blue-700 block truncate">{o.number}</Link>
                      <StatusBadge status={o.status} />
                    </div>
                    <button
                      onClick={() => setPrefill(`Hi, I have a question about order ${o.number}: `)}
                      className="shrink-0 text-sm font-bold text-blue-700 hover:underline"
                    >
                      Ask
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="fade-up bg-white rounded-lg border-2 border-gray-300 p-5" style={{ ["--i" as string]: 4 }}>
            <h2 className="font-bold text-gray-900 mb-2">Quick answers</h2>
            {FAQ.map((f) => (
              <details key={f.q} className="faq group border-b border-gray-200 last:border-0 py-2">
                <summary className="cursor-pointer list-none flex justify-between items-center font-semibold text-gray-800 hover:text-blue-700">
                  {f.q}
                  <span className="text-blue-600 transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                </summary>
                <p className="text-sm text-gray-600 mt-2">{f.a}</p>
              </details>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
};

export default SupportClient;
