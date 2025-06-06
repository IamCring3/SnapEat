import { Link } from "react-router-dom";
import { ProductProps } from "../../type";
import FormattedPrice from "./FormattedPrice";
import AddToCartBtn from "./AddToCartBtn";
import { IoClose } from "react-icons/io5";
import { store } from "../lib/store";
import toast from "react-hot-toast";
import { FaCheck } from "react-icons/fa";

const CartProduct = ({ product }: { product: ProductProps }) => {
  const { removeFromCart } = store();
  const handleRemoveProduct = () => {
    if (product) {
      // Create a product ID that includes variation if present
      const productId = product.selectedVariation
        ? `${product._id}-${product.selectedVariation}`
        : String(product._id);

      removeFromCart(productId);
      toast.success(`${product?.name.substring(0, 20)} deleted successfully!`);
    }
  };
  return (
    <div className="flex py-6 sm:py-10">
      <Link to={
        // Navigate to kitchen page for kitchen products, otherwise to product page
        (product._base === "kitchen" ||
         product.pageType === "kitchen" ||
         product._base === "food" ||
         product.pageType === "food" ||
         product.category === "Kitchen" ||
         product.category === "Kitchen & Food" ||
         product.isKitchenOnly === true)
          ? `/kitchen/${product?._id}`
          : `/product/${product?._id}`
      }>
        <img
          src={product?.images[0]}
          alt="productImage"
          className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48 border border-skyText/30 hover:border-skyText duration-300"
        />
      </Link>
      <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
        <div className="relative pr-9 sm:grid sm:grid-cols-4 sm:gap-x-6 sm:pr-0">
          <div className="flex flex-col gap-1 col-span-3">
            <h3 className="text-base font-semibold w-full">
              {product?.name.substring(0, 80)}
            </h3>
            {product.selectedVariation && product.variations && (
              <p className="text-xs">
                Size: <span className="font-medium">
                  {product.variations.find(v => v.id === product.selectedVariation)?.name || ''}
                </span>
              </p>
            )}
            <p className="text-xs">
              Brand: <span className="font-medium">{product?.brand}</span>
            </p>
            <p className="text-xs">
              Category: <span className="font-medium">{product?.category}</span>
            </p>
            <div className="flex items-center gap-6 mt-2">
              <p className="text-base font-semibold">
                <FormattedPrice
                  amount={product?.discountedPrice * product?.quantity}
                />
              </p>
              <AddToCartBtn product={product} showPrice={false} />
            </div>
          </div>
          <div className="mt-4 sm:mt-0 sm:pr-9">
            <div className="absolute right-0 top-0">
              <button
                onClick={handleRemoveProduct}
                className="-m2 inline-flex p-2 text-gray-600 hover:text-red-600"
              >
                <IoClose className="text-xl" />
              </button>
            </div>
          </div>
        </div>
        <div>
          {product?.isStock && (
            <p className="mt-4 flex space-x-2 text-sm text-gray-700">
              <FaCheck className="text-lg text-green-500" />{" "}
              <span>In Stock</span>
            </p>
          )}
          <p>
            You are saving{" "}
            <span className="text-sm font-semibold text-green-500">
              <FormattedPrice
                amount={product?.regularPrice - product?.discountedPrice}
              />
            </span>{" "}
            upon purchase
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartProduct;
