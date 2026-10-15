import { Cart, Product } from "@prisma/client";
import { DOMAIN } from "@/utils/constants";
import { SingleProduct } from "@/utils/types";

export async function getProducts(
  pageNumber: string | undefined
): Promise<Product[]> {

  const response = await fetch(
    `${DOMAIN}/api/products?pageNumber=${pageNumber}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

export async function getProductsCount(): Promise<number> {
  const response = await fetch(`${DOMAIN}/api/products/count`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to get products count");
  }

  const { count } = (await response.json()) as { count: number };
  return count;
}

export async function getProductsBasedOnSearch(
  searchText: string
): Promise<Product[]> {
  const response = await fetch(
    `${DOMAIN}/api/products/search?searchText=${encodeURIComponent(searchText)}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

export async function getSingleProduct(
  productId: string
): Promise<SingleProduct> {
  const response = await fetch(`${DOMAIN}/api/products/${productId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  return response.json();
}

export async function getProductsCart(
  token:string
): Promise<Cart[]> {
  const response = await fetch(
    `${DOMAIN}/api/carts`,
    {
      method: "GET",
      headers: {
        Cookie: `jwtToken=${token}`,
      },
      cache: "no-store" 
    }
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch carts products");
  }

  return response.json();
}
export async function getProductsCartNumber(
  token:string
): Promise<Cart[]> {
  const response = await fetch(
    `${DOMAIN}/api/carts/count`,
    {
      method: "GET",
      headers: {
        Cookie: `jwtToken=${token}`,
      },
      cache: "no-store" 
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch carts products count");
  }

  return response.json();
}