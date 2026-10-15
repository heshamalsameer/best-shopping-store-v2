"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { DOMAIN } from "@/utils/constants";
import { useRouter } from "next/navigation";
import { Product } from "@prisma/client";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/app/store/store";
import { addProducts, editProduct } from "@/app/store/product";
import ButtonSpinner from "@/components/ButtonSpinner";
import UploadImage from "@/components/UploadImage";

interface EditProductFormProps {
  product: Product;
}

const EditProductForm = ({ product }: EditProductFormProps) => {
  const router = useRouter();
  const [isLoading, setisLoading] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState({
    title: product.title,
    description: product.description,
    price: product.price,
    image: product.image,
  });

  const handleChange = (e: any) => {
    setisLoading(false);
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const formSubmitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setisLoading(true);

    try {
      await axios.put(`${DOMAIN}/api/products/${product.id}`, formData);
      dispatch(editProduct({ ...product, ...formData, price: String(formData.price) }));

      toast.success("product updated");
      setisLoading(false);
      router.refresh();
    } catch (error: any) {
      setisLoading(false);
      toast.error(error?.response?.data.message);
      console.log(error);
    }
  };

  return (
    <form
      onSubmit={formSubmitHandler}
      className="flex flex-col"
    >
      <input
        className="mb-4 border rounded p-2 text-xl"
        type="text"
        name="title"
        value={formData.title}
        placeholder="Enter Product Title"
        onChange={handleChange}
      />
      <input
        className="mb-4 border rounded p-2 text-xl"
        type="number"
        name="price"
        value={formData.price}
        placeholder="Enter Product Price"
        onChange={handleChange}
      />
      <UploadImage setFormData={setFormData} image={formData.image} />
      <textarea
        className="mb-4 p-2 lg:text-xl rounded resize-none"
        rows={5}
        placeholder="Enter Product Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
      ></textarea>
      <button
        type="submit"
        className="text-2xl text-white bg-blue-700 hover:bg-blue-900 p-2 rounded-lg font-bold"
      >
        {isLoading ? <ButtonSpinner /> : "Edit"}
      </button>
    </form>
  );
};

export default EditProductForm;
