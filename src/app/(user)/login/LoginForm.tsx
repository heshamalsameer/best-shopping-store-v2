"use client";
import React, { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FiEye, FiEyeOff, FiUser } from "react-icons/fi";
import { DEMO_ACCOUNTS, DOMAIN } from "@/utils/constants";
import ButtonSpinner from "@/components/ButtonSpinner";

const LoginForm = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = async (mail: string, pass: string) => {
    try {
      setLoading(true);
      await axios.post(`${DOMAIN}/api/users/login`, { email: mail, password: pass });
      toast.success("Welcome back!");
      router.replace("/");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data.message || "Could not log in");
      setLoading(false);
    }
  };

  const formSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "") return toast.error("Email is required");
    if (password === "") return toast.error("Password is required");
    login(email, password);
  };

  return (
    <>
      <form onSubmit={formSubmitHandler} className="flex flex-col">
        <label className="text-sm font-semibold text-gray-700 mb-1" htmlFor="email">Email</label>
        <input
          id="email"
          className="mb-4 border-2 rounded p-2 text-xl outline-none focus:border-blue-600 transition"
          type="email"
          autoComplete="email"
          placeholder="demo@bestshopping.dev"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="text-sm font-semibold text-gray-700 mb-1" htmlFor="password">Password</label>
        <div className="relative mb-4">
          <input
            id="password"
            className="w-full border-2 rounded p-2 pr-12 text-xl outline-none focus:border-blue-600 transition"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            placeholder="demo1234"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 text-xl">
            {show ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        <button
          disabled={loading}
          type="submit"
          className="text-2xl text-white bg-blue-800 hover:bg-blue-900 active:scale-[0.99] p-2 rounded-lg font-bold transition disabled:opacity-70"
        >
          {loading ? <ButtonSpinner /> : "Login"}
        </button>
      </form>

      <div className="mt-6 rounded-lg bg-[#eef3f8] border-2 border-[#b4cadc] p-4">
        <p className="font-semibold text-gray-800 mb-2">Try a demo account</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.email}
              type="button"
              disabled={loading}
              onClick={() => {
                setEmail(a.email);
                setPassword(a.password);
                login(a.email, a.password);
              }}
              className="text-left bg-white rounded-lg border-2 border-gray-300 hover:border-blue-600 p-3 transition"
            >
              <span className="flex items-center gap-2 font-bold text-gray-900"><FiUser /> {a.label}</span>
              <span className="block text-sm text-gray-600 font-mono">{a.email}</span>
              <span className="block text-sm text-gray-600 font-mono">{a.password}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="text-gray-600 mt-5 text-center">
        New here? <Link href="/register" className="text-blue-700 font-semibold hover:underline">Create an account</Link>
      </p>
    </>
  );
};

export default LoginForm;
