import Image from "next/image";
import Link from "next/link";
import ShopImage from "../../../public/360_F_241431868_8DFQpCcmpEPVG0UvopdztOAd4a6Rqsoo.jpg";
import { TiTick } from "react-icons/ti";
import styles from "./hero.module.css";

const Hero = () => {
  return (
    <div className={styles.hero}>
      <div className={`${styles.heroLeft} fade-up`}>
        <h1 className={styles.title}>Best Shopping</h1>
        <p className={styles.desc}>Gear for people who build things — keyboards, mice, monitors and everything for your desk.</p>
        <div className={styles.services}>
          <div className={`${styles.serviceItem} fade-up`} style={{ ["--i" as string]: 1 }}>
            <TiTick /> Easy checkout with card or cash on delivery
          </div>
          <div className={`${styles.serviceItem} fade-up`} style={{ ["--i" as string]: 2 }}>
            <TiTick /> Track every order from paid to delivered
          </div>
          <div className={`${styles.serviceItem} fade-up`} style={{ ["--i" as string]: 3 }}>
            <TiTick /> Free shipping on orders over $100
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link href="/products?pageNumber=1" className="bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold py-2 px-6 rounded-lg transition active:scale-[0.98]">
            Shop now
          </Link>
          <Link href="/orders" className="border-2 border-gray-700 text-gray-800 hover:bg-white text-lg font-bold py-2 px-6 rounded-lg transition">
            Track an order
          </Link>
        </div>
      </div>
      <div className="fade-up" style={{ ["--i" as string]: 2 }}>
        <Image
          src={ShopImage}
          className="rounded-xl shadow-xl shadow-gray-800"
          alt="Shopping cart with parcels in front of a laptop"
          width={600}
          height={400}
          priority
        />
      </div>
    </div>
  );
};

export default Hero;
