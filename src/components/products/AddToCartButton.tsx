"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { FiCheck, FiShoppingCart } from "react-icons/fi";
import { DOMAIN } from "@/utils/constants";
import { AppDispatch } from "@/app/store/store";
import { addToCart } from "@/app/store/cart";
import ButtonSpinner from "../ButtonSpinner";
import { flyToCart } from "./flyToCart";

interface Props {
  productId: number;
  token: string;
  quantity?: number;
  className?: string;
}

const AddToCartButton = ({ productId, token, quantity = 1, className = "" }: Props) => {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const add = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    if (!token) {
      toast.info("Please log in to add products to your cart");
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${DOMAIN}/api/carts`, { productId, quantity });
      dispatch(addToCart(res.data));
      flyToCart(btn);
      setAdded(true);
      setTimeout(() => setAdded(false), 1600);
      router.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data.message || "Could not add to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={add}
      disabled={loading}
      className={`cursor-pointer w-full rounded-lg p-2 font-bold text-white text-[18px] transition flex items-center justify-center gap-2 disabled:opacity-70 ${
        added ? "bg-green-600 hover:bg-green-600" : "bg-blue-600 hover:bg-blue-500 active:scale-[0.98]"
      } ${className}`}
    >
      {loading ? (
        <ButtonSpinner />
      ) : added ? (
        <>
          <FiCheck className="pop" /> Added to cart
        </>
      ) : (
        <>
          <FiShoppingCart /> Add To Cart
        </>
      )}
    </button>
  );
};

export default AddToCartButton;
