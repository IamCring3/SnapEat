import { ProductProps } from "../../type";
import { useNavigate } from "react-router-dom";
import AddToCartBtn from "./AddToCartBtn";

interface Props {
  item: ProductProps;
  setSearchText?: any;
}

const ProductCard = ({ item, setSearchText }: Props) => {
  const navigation = useNavigate();

  const handleProduct = () => {
    // Navigate to kitchen page for kitchen products, otherwise to product page
    const isKitchenProduct =
      item._base === "kitchen" ||
      item.pageType === "kitchen" ||
      item._base === "food" ||
      item.pageType === "food" ||
      item.category === "Kitchen" ||
      item.category === "Kitchen & Food" ||
      item.isKitchenOnly === true;

    // Debug logging
    console.log(`Clicked product: ${item.name}`, {
      isKitchen: isKitchenProduct,
      _base: item._base,
      pageType: item.pageType,
      category: item.category,
      isKitchenOnly: item.isKitchenOnly,
      navigatingTo: isKitchenProduct ? `/kitchen/${item?._id}` : `/product/${item?._id}`
    });

    if (isKitchenProduct) {
      navigation(`/kitchen/${item?._id}`);
    } else {
      navigation(`/product/${item?._id}`);
    }

    setSearchText && setSearchText("");
  };

  return (
    <div className="bg-white rounded-lg p-4 hover:shadow-md duration-200 border border-gray-100">
      {/* Delivery Time */}
      <div className="flex items-center gap-1 mb-3">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-xs text-gray-500">8 MINS</span>
      </div>

      {/* Product Image */}
      <div className="relative group mb-3">
        <div className="w-full aspect-square overflow-hidden">
          <img
            onClick={handleProduct}
            src={item?.images[0]}
            alt={item?.name}
            className="w-full h-full object-contain group-hover:scale-105 duration-300 cursor-pointer"
          />
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-2">
        <h2 
          className="text-base font-medium cursor-pointer break-words overflow-hidden text-ellipsis"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '2.5rem',
            lineHeight: '1.25rem',
            maxHeight: '2.5rem'
          }}
          onClick={handleProduct}
          title={item?.name}
        >
          {item?.name}
        </h2>
        <p className="text-sm text-gray-500">{item?.quantity || "1 ltr"}</p>

        <div className="flex items-center justify-between pt-2">
          <span className="text-base font-semibold">
            ₹{item?.discountedPrice?.toFixed(2) || '0.00'}
          </span>
          <AddToCartBtn product={item} className="px-4 py-1" />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
