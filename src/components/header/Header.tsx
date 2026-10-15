import Link from "next/link";
import styles from "./header.module.css";
import Navbar from "./Navbar";
import { cookies } from "next/headers";
import { verifyTokenForPage } from "@/utils/verifyToken";
import LogoutButton from "./LogoutButton";
import prisma from "@/utils/db";
import { FaRegUserCircle } from "react-icons/fa";
import FloatingHelp from "../FloatingHelp";

const Header = async () => {
  const token = cookies().get("jwtToken")?.value || "";
  const payload = verifyTokenForPage(token);

  let cartCount = 0;
  if (payload) {
    try {
      const items = await prisma.cart.findMany({ where: { userId: payload.id }, select: { quantity: true } });
      cartCount = items.reduce((s, i) => s + i.quantity, 0);
    } catch {
      cartCount = 0;
    }
  }

  return (
    <header className={styles.header}>
      <Navbar isAdmin={payload?.isAdmin || false} token={token} cartCount={cartCount} />
      <div className={styles.right}>
        {payload ? (
          <>
            <Link href="/orders" className={styles.user} title="My orders">
              <FaRegUserCircle className="text-2xl" />
              <strong className="capitalize hidden sm:inline">{payload?.username}</strong>
            </Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link className={styles.btn} href="/login">
              Login
            </Link>
            <Link className={styles.btn} href="/register">
              Register
            </Link>
          </>
        )}
      </div>
      {payload && !payload.isAdmin && <FloatingHelp />}
    </header>
  );
};

export default Header;
