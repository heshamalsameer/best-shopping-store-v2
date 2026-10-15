"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { DOMAIN } from "@/utils/constants";
import { STATUS_LABEL } from "@/utils/orders";

const options: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const OrderStatusSelect = ({ orderId, status }: { orderId: number; status: OrderStatus }) => {
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const change = async (next: OrderStatus) => {
    const prev = value;
    setValue(next);
    setBusy(true);
    try {
      await axios.patch(`${DOMAIN}/api/orders/${orderId}`, { status: next });
      toast.success(`Order marked as ${STATUS_LABEL[next]}`);
      router.refresh();
    } catch (error: any) {
      setValue(prev);
      toast.error(error?.response?.data.message || "Could not update status");
    } finally {
      setBusy(false);
    }
  };

  return (
    <select
      value={value}
      disabled={busy}
      onChange={(e) => change(e.target.value as OrderStatus)}
      className="border-2 border-gray-300 rounded-lg p-1.5 bg-white font-semibold text-gray-800 outline-none focus:border-purple-600 disabled:opacity-60"
      aria-label="Order status"
    >
      {options.map((o) => <option key={o} value={o}>{STATUS_LABEL[o]}</option>)}
    </select>
  );
};

export default OrderStatusSelect;
