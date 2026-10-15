"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { FiPrinter, FiXCircle } from "react-icons/fi";
import { DOMAIN } from "@/utils/constants";

const OrderActions = ({ orderId, cancellable }: { orderId: number; cancellable: boolean }) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const cancel = async () => {
    setBusy(true);
    try {
      await axios.patch(`${DOMAIN}/api/orders/${orderId}`, { action: "cancel" });
      toast.success("Your order was cancelled");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data.message || "Could not cancel the order");
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  };

  return (
    <div className="no-print flex flex-wrap gap-2">
      <button onClick={() => window.print()} className="inline-flex items-center gap-2 border-2 border-gray-700 text-gray-800 font-bold px-4 py-2 rounded-lg hover:bg-white transition">
        <FiPrinter /> Print invoice
      </button>
      {cancellable &&
        (confirm ? (
          <span className="inline-flex items-center gap-2 fade-up">
            <span className="text-gray-700">Cancel this order?</span>
            <button disabled={busy} onClick={cancel} className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg transition disabled:opacity-60">
              {busy ? "Cancelling…" : "Yes, cancel"}
            </button>
            <button onClick={() => setConfirm(false)} className="font-semibold px-3 py-2 text-gray-700 hover:underline">Keep it</button>
          </span>
        ) : (
          <button onClick={() => setConfirm(true)} className="inline-flex items-center gap-2 text-red-700 border-2 border-red-300 hover:bg-red-50 font-bold px-4 py-2 rounded-lg transition">
            <FiXCircle /> Cancel order
          </button>
        ))}
    </div>
  );
};

export default OrderActions;
