import { FaRegEye } from "react-icons/fa";
import { LuArrowLeftRight } from "react-icons/lu";
import { ProductProps } from "../../type";
import { store } from "../lib/store";

import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ProductCardSideNav = ({ product }: { product?: ProductProps }) => {
  const navigate = useNavigate();
  const { addToCompare, compareProducts } = store();

  const handleQuickView = () => {
    if (product) {
      navigate(`/product/${product._id}`);
    }
  };

  const handleCompare = () => {
    if (product) {
      if (compareProducts.length >= 4) {
        toast.error("You can compare maximum 4 products!");
        return;
      }
      const exists = compareProducts.find(item => item._id === product._id);
      if (exists) {
        toast.error("Product already in compare list!");
        return;
      }
      addToCompare(product);
      toast.success("Added to compare list!");
    }
  };

  return (
    <div className="absolute right-1 top-1 flex flex-col gap-1 transition translate-x-12 group-hover:translate-x-0 duration-300">
      <button
        onClick={handleCompare}
        className="w-11 h-11 inline-flex text-black text-lg items-center justify-center rounded-full hover:text-white hover:bg-black duration-200"
      >
        <LuArrowLeftRight />
      </button>
      <button
        onClick={handleQuickView}
        className="w-11 h-11 inline-flex text-black text-lg items-center justify-center rounded-full hover:text-white hover:bg-black duration-200"
      >
        <FaRegEye />
      </button>
    </div>
  );
};

export default ProductCardSideNav;
