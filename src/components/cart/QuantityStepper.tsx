"use client";
import { FiMinus, FiPlus } from "react-icons/fi";
import { MAX_QTY } from "@/utils/constants";

interface Props {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}

const QuantityStepper = ({ value, onChange, disabled }: Props) => (
  <div className="inline-flex items-center border-2 border-gray-400 rounded-lg overflow-hidden bg-white">
    <button
      type="button"
      aria-label="Decrease quantity"
      disabled={disabled || value <= 1}
      onClick={() => onChange(value - 1)}
      className="w-9 h-9 grid place-items-center text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-white transition"
    >
      <FiMinus />
    </button>
    <span key={value} className="pop w-10 text-center font-bold text-lg text-gray-900 select-none" aria-live="polite">
      {value}
    </span>
    <button
      type="button"
      aria-label="Increase quantity"
      disabled={disabled || value >= MAX_QTY}
      onClick={() => onChange(value + 1)}
      className="w-9 h-9 grid place-items-center text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-white transition"
    >
      <FiPlus />
    </button>
  </div>
);

export default QuantityStepper;
