"use client";
import Link from "next/link";

interface ErrorPageProps {
  error: Error;
  reset: () => void;
}
const ProductErrorPage = (props: ErrorPageProps) => {
  return (
    <div className="fix-height pt-7 text-center">
      <div className="text-3xl text-red-600 font-semibold ">
        something went wrong
      </div>
      <h2 className="text-gray-700 my-2 text-xl">
        Error Message : {props.error.message}
      </h2>
      <button
        onClick={() => props.reset()}
        className="bg-blue-500 hover:bg-blue-700 py-2 px-4 text-white font-bold rounded-full"
      >
        Try again
      </button>
      <Link href="/" className="text-xl underline text-blue-700 block mt-6">
        Go to home page
      </Link>
    </div>
  );
};

export default ProductErrorPage;
