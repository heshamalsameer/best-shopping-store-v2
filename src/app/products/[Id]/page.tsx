import Link from "next/link";
import AddCommentForm from "@/components/comments/AddCommentForm";
import CommentItem from "@/components/comments/CommentItem";
import BuyBox from "@/components/products/BuyBox";
import { SingleProduct } from "@/utils/types";
import { cookies } from "next/headers";
import { verifyTokenForPage } from "@/utils/verifyToken";
import { getSingleProduct } from "@/apiCalls/productApiCall";
import { formatPrice } from "@/utils/pricing";

interface SingleProductPageProps {
  params: { Id: string };
}

const SingleProductPage = async ({ params }: SingleProductPageProps) => {
  const token = cookies().get("jwtToken")?.value || "";
  const payload = verifyTokenForPage(token);

  const product: SingleProduct = await getSingleProduct(params.Id);

  return (
    <section className="fix-height container m-auto w-full px-5 pt-8 pb-12 md:w-3/4">
      <Link href="/products?pageNumber=1" className="text-blue-700 hover:underline font-semibold">← Back to products</Link>
      <div className="fade-up flex flex-col lg:flex-row bg-white rounded-lg overflow-hidden border-2 border-gray-300 mt-4">
        <img
          src={product.image}
          alt={product.title}
          className="max-h-[420px] w-full lg:w-1/2 object-cover"
        />
        <div className="p-7 flex-1">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.title}</h1>
          <div className="text-2xl font-bold text-blue-700">{formatPrice(product.price)}</div>
          <p className="text-gray-700 mt-5 leading-relaxed">{product.description}</p>
          <BuyBox productId={product.id} price={product.price} token={token} />
        </div>
      </div>

      <h4 className="text-xl text-gray-800 ps-1 font-semibold mb-3 mt-10">
        Reviews <span className="text-gray-500 font-normal">({product.comments.length})</span>
      </h4>
      <div className="mb-6">
        {payload ? (
          <AddCommentForm articleId={product.id} />
        ) : (
          <p className="text-blue-600 md:text-xl">
            <Link href="/login" className="underline font-semibold">Log in</Link> to write a review
          </p>
        )}
      </div>
      {product.comments.length === 0 && <p className="text-gray-500">No reviews yet — be the first.</p>}
      {product.comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} userId={payload?.id} />
      ))}
    </section>
  );
};

export default SingleProductPage;
