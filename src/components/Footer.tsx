import Link from "next/link";
import { SiShopware } from "react-icons/si";
import { FiLock, FiTruck, FiRotateCcw } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container m-auto px-5 py-6 flex flex-col md:flex-row gap-5 md:items-center justify-between">
        <Link href="/" className="flex items-center text-xl font-bold">
          <SiShopware className="mr-2" /> Best Shopping
        </Link>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-300">
          <li className="flex items-center gap-2"><FiTruck /> Free shipping over $100</li>
          <li className="flex items-center gap-2"><FiLock /> Secure checkout</li>
          <li className="flex items-center gap-2"><FiRotateCcw /> Cancel before shipping</li>
        </ul>
        <nav className="flex gap-5 text-sm font-semibold">
          <Link className="hover:text-blue-300 transition" href="/products?pageNumber=1">Products</Link>
          <Link className="hover:text-blue-300 transition" href="/carts">Cart</Link>
          <Link className="hover:text-blue-300 transition" href="/orders">Orders</Link>
          <Link className="hover:text-blue-300 transition" href="/support">Help</Link>
        </nav>
      </div>
      <div className="border-t border-gray-800 text-center text-xs text-gray-400 py-3">
        © {new Date().getFullYear()} Best Shopping — electronics for developers
      </div>
    </footer>
  );
};

export default Footer;
