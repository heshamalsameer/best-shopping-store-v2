"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { FiTrash2 } from "react-icons/fi";
import DeleteProductModal from "./DeleteCartItemModal";
import QuantityStepper from "./QuantityStepper";
import { CartLine } from "@/utils/types";
import { DOMAIN } from "@/utils/constants";
import { formatPrice, toNumber } from "@/utils/pricing";
import { AppDispatch } from "@/app/store/store";
import { setQuantity } from "@/app/store/cart";

interface CartItemProps {
  product: CartLine;
  index: number;
  onQuantity: (q: number) => void;
  onRemoved: () => void;
}

const CartItem = ({ product, index, onQuantity, onRemoved }: CartItemProps) => {
  const [isOpen, setisOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const price = product.product?.price ?? product.price;
  const title = product.product?.title ?? product.title;
  const image = product.product?.image ?? product.image;

  const changeQty = (q: number) => {
    const before = product.quantity;
    onQuantity(q);
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await axios.patch(`${DOMAIN}/api/carts/${product.id}`, { quantity: q });
        dispatch(setQuantity({ id: product.id, quantity: q }));
        router.refresh();
      } catch (error: any) {
        onQuantity(before);
        toast.error(error?.response?.data.message || "Could not update quantity");
      } finally {
        setSaving(false);
      }
    }, 350);
  };

  return (
    <div className={`fade-up flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 transition ${leaving ? "leaving" : ""}`} style={{ ["--i" as string]: index }}>
      <DeleteProductModal
        isOpen={isOpen}
        setIsopen={setisOpen}
        productId={product.id}
        title={title}
        onDeleted={() => {
          setLeaving(true);
          setTimeout(onRemoved, 330);
        }}
      />
      <Link href={product.productId ? `/products/${product.productId}` : "#"} className="shrink-0">
        <Image width={160} height={160} className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200" src={image} alt={title} />
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={product.productId ? `/products/${product.productId}` : "#"} className="text-xl font-bold text-gray-900 hover:text-blue-700 line-clamp-1">
          {title}
        </Link>
        <p className="text-gray-500">{formatPrice(price)} each</p>
        {!product.productId && <p className="text-xs text-yellow-700 mt-1">This product is no longer in the catalogue</p>}
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-5">
        <QuantityStepper value={product.quantity} onChange={changeQty} />
        <p className="w-24 text-right text-xl font-bold text-gray-900">{formatPrice(toNumber(price) * product.quantity)}</p>
        <button
          onClick={() => setisOpen(true)}
          aria-label={`Remove ${title}`}
          title="Remove"
          className="w-10 h-10 grid place-items-center rounded-lg text-red-700 hover:bg-red-50 hover:text-red-600 border-2 border-transparent hover:border-red-200 transition"
        >
          <FiTrash2 className="text-xl" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
