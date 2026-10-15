import type { OrderStatus } from "@prisma/client";

export const STATUS_FLOW: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const STATUS_TEXT: Record<OrderStatus, string> = {
  PENDING: "We received your order and are waiting for payment.",
  PAID: "Payment confirmed — we're getting your items ready.",
  PROCESSING: "Your items are being packed.",
  SHIPPED: "Your order is on the way.",
  DELIVERED: "Delivered. Enjoy your new gear!",
  CANCELLED: "This order was cancelled.",
};

export const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  PAID: "bg-blue-100 text-blue-800 border-blue-300",
  PROCESSING: "bg-indigo-100 text-indigo-800 border-indigo-300",
  SHIPPED: "bg-sky-100 text-sky-800 border-sky-300",
  DELIVERED: "bg-green-100 text-green-800 border-green-300",
  CANCELLED: "bg-gray-200 text-gray-700 border-gray-400",
};

export const canCancel = (s: OrderStatus) => s === "PENDING" || s === "PAID" || s === "PROCESSING";

export const newOrderNumber = () =>
  `BS-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.floor(Math.random() * 90 + 10)}`;
