import { getProductsBasedOnSearch } from "@/apiCalls/productApiCall";
import { Product } from "@prisma/client";
import ProductItem from "@/components/products/ProductItem";
import { cookies } from "next/headers";

interface SearchArticlePageProps {
  searchParams: { searchText: string };
}

const SearchArticlePage = async ({
  searchParams: { searchText },
}: SearchArticlePageProps) => {
  const products: Product[] = await getProductsBasedOnSearch(searchText);
  const token = cookies().get("jwtToken")?.value || "";

  return (
    <section className="fix-height container m-auto px-5">
      {products.length === 0 ? (
        <h2 className="text-gray-800 text-2xl font-bold p-5">
          products based on
          <span className="text-red-500 mx-1">{searchText}</span>
          not found
        </h2>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-2 mt-7 text-gray-800">
            products based on
            <span className="ms-1 text-green-700 text-3xl font-bold">
              {searchText}
            </span>
          </h1>
          <div className="flex items-stretch justify-center flex-wrap gap-7 mb-10">
            {products.map((item, i) => (
              <ProductItem key={item.id} product={item} token={token} index={i} />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default SearchArticlePage;
