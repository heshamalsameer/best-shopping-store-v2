import type { OrderStatus } from "@prisma/client";
import { FiCheck, FiX } from "react-icons/fi";
import { STATUS_FLOW, STATUS_LABEL } from "@/utils/orders";

const OrderTracker = ({ status }: { status: OrderStatus }) => {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-gray-100 border-2 border-gray-300 p-4 text-gray-700">
        <span className="w-9 h-9 rounded-full bg-gray-600 text-white grid place-items-center"><FiX /></span>
        <strong>This order was cancelled</strong>
      </div>
    );
  }
  const current = STATUS_FLOW.indexOf(status);
  return (
    <ol className="flex items-start">
      {STATUS_FLOW.map((s, i) => {
        const done = i <= current;
        return (
          <li key={s} className="flex-1 flex flex-col items-center relative">
            {i > 0 && (
              <span className="absolute top-[17px] right-1/2 w-full h-1 bg-gray-300 -z-0">
                <span className="block h-full bg-blue-600 transition-all duration-700" style={{ width: done ? "100%" : "0%", transitionDelay: `${i * 120}ms` }} />
              </span>
            )}
            <span
              className={`relative z-10 w-9 h-9 rounded-full grid place-items-center border-2 font-bold fade-up ${
                done ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-300 text-gray-400"
              } ${i === current ? "ring-4 ring-blue-200" : ""}`}
              style={{ ["--i" as string]: i }}
            >
              {done ? <FiCheck /> : i + 1}
            </span>
            <span className={`mt-2 text-xs sm:text-sm font-semibold text-center ${done ? "text-gray-900" : "text-gray-500"}`}>{STATUS_LABEL[s]}</span>
          </li>
        );
      })}
    </ol>
  );
};

export default OrderTracker;
