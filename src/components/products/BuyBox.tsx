"use client";
import { useState } from "react";
import AddToCartButton from "./AddToCartButton";
import QuantityStepper from "../cart/QuantityStepper";
import { formatPrice, toNumber } from "@/utils/pricing";
import { FREE_SHIPPING_OVER } from "@/utils/constants";
import { FiTruck } from "react-icons/fi";

const BuyBox = ({ productId, price, token }: { productId: number; price: string; token: string }) => {
  const [qty, setQty] = useState(1);
  return (
    <div className="mt-6 border-t-2 border-gray-200 pt-5">
      <div className="flex items-center gap-4 flex-wrap">
        <QuantityStepper value={qty} onChange={setQty} />
        <span className="text-gray-600">
          Total: <strong className="text-gray-900 text-xl">{formatPrice(toNumber(price) * qty)}</strong>
        </span>
      </div>
      <AddToCartButton productId={productId} token={token} quantity={qty} className="mt-4 md:w-72" />
      <p className="flex items-center gap-2 text-sm text-gray-600 mt-3">
        <FiTruck /> Free shipping on orders over ${FREE_SHIPPING_OVER}
      </p>
    </div>
  );
};

export default BuyBox;
