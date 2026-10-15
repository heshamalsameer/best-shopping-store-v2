"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CgMenuGridR } from "react-icons/cg";
import { MdOutlineArticle } from "react-icons/md";
import { FaRegComments } from "react-icons/fa";
import { FiPackage, FiMessageSquare } from "react-icons/fi";

const links = [
  { href: "/admin/orders", match: "/admin/orders", label: "Orders", icon: FiPackage },
  { href: "/admin/support", match: "/admin/support", label: "Support", icon: FiMessageSquare },
  { href: "/admin/products-table?pageNumber=1", match: "/admin/products-table", label: "Products", icon: MdOutlineArticle },
  { href: "/admin/comments-table", match: "/admin/comments-table", label: "Comments", icon: FaRegComments },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  return (
    <>
      <Link
        href="/admin"
        className={`flex items-center text-lg lg:text-2xl font-semibold transition ${pathname === "/admin" ? "text-yellow-200" : "hover:text-yellow-200"}`}
      >
        <CgMenuGridR className="text-3xl me-1" />
        <span className="hidden lg:block">Dashboard</span>
      </Link>
      <ul className="mt-10 flex items-center justify-center flex-col lg:items-start">
        {links.map(({ href, match, label, icon: Icon }) => {
          const on = pathname.startsWith(match);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`flex items-center text-xl mb-5 lg:border-b transition-all ${
                on ? "border-yellow-200 text-yellow-200 lg:translate-x-1" : "border-gray-300 hover:border-yellow-200 hover:text-yellow-200"
              }`}
            >
              <Icon className="me-1" />
              <span className="hidden lg:block">{label}</span>
            </Link>
          );
        })}
      </ul>
    </>
  );
};

export default AdminSidebar;
