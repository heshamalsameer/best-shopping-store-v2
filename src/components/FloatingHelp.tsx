"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiCustomerService2Line } from "react-icons/ri";

const HIDDEN = ["/support", "/checkout", "/admin", "/login", "/register"];

const FloatingHelp = () => {
  const pathname = usePathname();
  if (HIDDEN.some((p) => pathname.startsWith(p))) return null;
  return (
    <Link
      href="/support"
      aria-label="Chat with support"
      className="help-fab no-print group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-blue-600 text-white shadow-lg pl-3 pr-3 py-3 hover:bg-blue-800 hover:pr-5 transition-all"
    >
      <RiCustomerService2Line className="text-2xl" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap font-bold transition-all duration-300 group-hover:max-w-[120px]">Need help?</span>
    </Link>
  );
};

export default FloatingHelp;
