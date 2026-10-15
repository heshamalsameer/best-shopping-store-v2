import type { OrderStatus } from "@prisma/client";
import { STATUS_LABEL, STATUS_STYLE } from "@/utils/orders";

const StatusBadge = ({ status }: { status: OrderStatus }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-sm font-semibold whitespace-nowrap ${STATUS_STYLE[status]}`}>
    <span className="w-1.5 h-1.5 rounded-full bg-current" />
    {STATUS_LABEL[status]}
  </span>
);

export default StatusBadge;
