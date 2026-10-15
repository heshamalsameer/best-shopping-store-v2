"use client";
import Link from "next/link";
import styles from "./header.module.css";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AiOutlineMenu } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";
import { SiShopware } from "react-icons/si";
import { FiShoppingCart } from "react-icons/fi";

interface NavbarProps {
  isAdmin: boolean;
  token: string;
  cartCount: number;
}

const Navbar = ({ isAdmin, token, cartCount }: NavbarProps) => {
  const [toggle, setToggle] = useState(false);
  const pathname = usePathname();
  const [bump, setBump] = useState(false);
  const prev = useRef(cartCount);

  useEffect(() => {
    if (cartCount !== prev.current) {
      prev.current = cartCount;
      setBump(true);
      const t = setTimeout(() => setBump(false), 400);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [cartCount]);

  const link = (href: string, label: React.ReactNode, match: string) => (
    <Link
      onClick={() => setToggle(false)}
      className={`${styles.navLink} ${pathname.startsWith(match) && (match !== "/" || pathname === "/") ? styles.active : ""}`}
      href={href}
    >
      {label}
    </Link>
  );

  return (
    <nav className={styles.navbar}>
      <div>
        <Link href="/" className={styles.logo}>
          <SiShopware className="mr-2" />
          <span className={styles.logoText}>Best Shopping</span>
        </Link>
        <div className={styles.menu}>
          {toggle ? (
            <IoMdClose onClick={() => setToggle((p) => !p)} />
          ) : (
            <AiOutlineMenu onClick={() => setToggle((p) => !p)} />
          )}
        </div>
      </div>
      <div
        className={styles.navLinksWrapper}
        style={{
          clipPath: (toggle && "polygon(0 0, 100% 0, 100% 100%, 0 100%)") || "",
        }}
      >
        <ul className={`${styles.navLinks} ${toggle ? styles.open : ""}`}>
          {link("/", "Home", "/")}
          {link("/products?pageNumber=1", "Products", "/products")}
          {link(
            token ? "/carts" : "/login",
            <span className="inline-flex items-center gap-1">
              <FiShoppingCart data-cart-icon="" /> Cart
              {cartCount > 0 && <span className={`${styles.badge} ${bump ? "pop" : ""}`}>{cartCount}</span>}
            </span>,
            "/carts"
          )}
          {token && link("/orders", "Orders", "/orders")}
          {token && !isAdmin && link("/support", "Help", "/support")}
          {isAdmin && link("/admin", "Admin Dashboard", "/admin")}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
