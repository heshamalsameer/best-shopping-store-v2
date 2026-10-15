"use client";
import { Product } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import { formatPrice } from "@/utils/pricing";

interface ProductItemProps {
  product: Product;
  token: string;
  index?: number;
}

const ProductItem = ({ product, token, index = 0 }: ProductItemProps) => {
  return (
    <div
      className="fade-up group bg-[#f5f5f5] p-5 rounded-lg my-1 shadow-lg border-2 border-gray-400 hover:bg-slate-200 hover:-translate-y-1 hover:shadow-xl transition duration-300 w-full md:w-2/5 lg:w-1/4 flex flex-col"
      style={{ ["--i" as string]: index }}
    >
      <Link href={`/products/${product.id}`} className="cursor-pointer flex-1">
        <div className="h-60 overflow-hidden rounded-lg bg-white">
          <Image
            width={500}
            height={240}
            className="rounded-lg h-full w-full object-cover group-hover:scale-110 group-hover:rotate-2 transition duration-500"
            src={product.image}
            alt={product.title}
          />
        </div>

        <div className="flex justify-between items-center gap-3 mt-2">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1" title={product.title}>
            {product.title}
          </h3>
          <p className="my-2 text-xl text-gray-700 font-bold p-1 whitespace-nowrap">{formatPrice(product.price)}</p>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{product.description}</p>
      </Link>

      <AddToCartButton productId={product.id} token={token} />
    </div>
  );
};

export default ProductItem;
