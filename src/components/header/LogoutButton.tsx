"use client";
import axios from "axios";
import { DOMAIN } from "@/utils/constants";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ButtonSpinner from "../ButtonSpinner";

const LogoutButton = () => {
  const router = useRouter();
  const [isLoading, setisLoading] = useState(false);
  const logoutHandler = async () => {
    setisLoading(true);
    try {
      await axios.get(`${DOMAIN}/api/users/logout`);
      setisLoading(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.warning("Something went wrong");
      setisLoading(false);
    }
  };

  return (
    <button
      onClick={logoutHandler}
      className="bg-blue-800 hover:bg-blue-950 text-lg md:text-xl font-semibold p-1 px-3 text-gray-200 rounded transition"
    >
      {isLoading ? <ButtonSpinner /> : "Logout"}
    </button>
  );
};

export default LogoutButton;
