"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const SearchProductInput = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");

  const formSubmitHandler = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchText.trim()) return;
    router.push(`/products/search?searchText=${encodeURIComponent(searchText.trim())}`);
  };

  return (
    <form onSubmit={formSubmitHandler} className="my-5 w-full md:w-2/3 m-auto">
      <input
        className="w-full p-3 rounded text-xl border-2 border-transparent text-gray-900 outline-none focus:border-blue-600 transition"
        type="search"
        placeholder="Search for product"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
    </form>
  );
};

export default SearchProductInput;
