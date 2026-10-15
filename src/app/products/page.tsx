import type { Metadata } from "next";
import { Product } from "@prisma/client";
import { getProducts, getProductsCount } from "@/apiCalls/productApiCall";
import { PRODUCT_PER_PAGE } from "@/utils/constants";
import ProductsClientPage from "@/components/products/ProductsClientPage";
import { cookies } from "next/headers";
import { verifyTokenForPage } from "@/utils/verifyToken";
import prisma from "@/utils/db";

interface ProductsPageProps {
  searchParams: { pageNumber: string };
}

const ProductsPage = async ({ searchParams }: ProductsPageProps) => {
  const { pageNumber } = searchParams;
  const products: Product[] = await getProducts(pageNumber);
  const count: number = await prisma.product.count();
  const pages = Math.ceil(count / PRODUCT_PER_PAGE);
  const token = cookies().get("jwtToken")?.value || "";
  const payload = verifyTokenForPage(token);

  return (
    <ProductsClientPage
      products={products}
      pages={pages}
      pageNumber={parseInt(pageNumber) || 1}
      token={token}
      payload={payload}
    />
  );
};

export default ProductsPage;

export const metadata: Metadata = {
  title: "Products",
  description: "Keyboards, mice, monitors and desk gear for developers.",
};
