"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { DOMAIN } from "@/utils/constants";
import ButtonSpinner from "@/components/ButtonSpinner";
import Link from "next/link";
import { useRouter } from "next/navigation";

const RegisterForm = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const formSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "") return toast.error("Username is required");
    if (email === "") return toast.error("Email is required");
    if (password === "") return toast.error("Password is required");
    if (password.length < 6) return toast.error("Password should be at least 6 characters");

    try {
      setLoading(true);
      await axios.post(`${DOMAIN}/api/users/register`, {
        email,
        password,
        username,
      });
      toast.success("Your account is ready");
      router.replace("/");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={formSubmitHandler} className="flex flex-col">
      <input
        className="mb-4 border-2 rounded p-2 text-xl outline-none focus:border-blue-600 transition"
        type="text"
        placeholder="Your name" autoComplete="name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="mb-4 border-2 rounded p-2 text-xl outline-none focus:border-blue-600 transition"
        type="email"
        placeholder="you@example.com" autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="mb-4 border-2 rounded p-2 text-xl outline-none focus:border-blue-600 transition"
        type="password"
        placeholder="At least 6 characters" autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        disabled={loading}
        type="submit"
        className="text-2xl text-white bg-blue-800 hover:bg-blue-900 p-2 rounded-lg font-bold transition disabled:opacity-70"
      >
        {loading ? <ButtonSpinner /> : "Register"}
      </button>
      <p className="text-gray-600 mt-5 text-center">
        Already have an account? <Link href="/login" className="text-blue-700 font-semibold hover:underline">Log in</Link>
      </p>
    </form>
  );
};

export default RegisterForm;
