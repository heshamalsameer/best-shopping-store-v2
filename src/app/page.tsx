import Link from "next/link";
import { cookies } from "next/headers";
import Hero from "@/components/home/Hero";
import ProductItem from "@/components/products/ProductItem";
import Reveal from "@/components/Reveal";
import prisma from "@/utils/db";
import { FiCreditCard, FiPackage, FiTruck } from "react-icons/fi";

const steps = [
  { icon: FiPackage, title: "Pick your gear", text: "Add products to your cart and change quantities any time." },
  { icon: FiCreditCard, title: "Pay your way", text: "Card payment in seconds, or cash on delivery." },
  { icon: FiTruck, title: "Follow it home", text: "See every step — paid, packed, shipped, delivered." },
];

const HomePage = async () => {
  const token = cookies().get("jwtToken")?.value || "";
  let latest: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  try {
    latest = await prisma.product.findMany({ take: 3, orderBy: { createdAt: "desc" } });
  } catch {
    latest = [];
  }

  return (
    <section>
      <Hero />

      <div className="container m-auto px-5 pb-12">
        <div className="grid md:grid-cols-3 gap-5 mb-14">
          {steps.map((s, i) => (
            <Reveal key={s.title} index={i} className="bg-white rounded-lg border-2 border-gray-300 p-5 flex gap-4 items-start">
              <span className="w-12 h-12 shrink-0 rounded-full bg-[#b4cadc] text-[rgb(19,19,126)] grid place-items-center text-2xl"><s.icon /></span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{i + 1}. {s.title}</h3>
                <p className="text-gray-600">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {latest.length > 0 && (
          <>
            <Reveal className="flex items-end justify-between mb-5">
              <h2 className="text-3xl font-bold text-gray-900">New arrivals</h2>
              <Link href="/products?pageNumber=1" className="text-blue-700 font-semibold hover:underline">View all products →</Link>
            </Reveal>
            <div className="flex items-stretch justify-center flex-wrap gap-7">
              {latest.map((p, i) => <ProductItem key={p.id} product={p} token={token} index={i} />)}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default HomePage;
