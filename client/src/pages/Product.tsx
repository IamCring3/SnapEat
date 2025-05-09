import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { config } from "../../config";
import { ProductProps } from "../../type";
import { getData } from "../lib";
import Loading from "../ui/Loading";
import Container from "../ui/Container";
import _, { divide } from "lodash";
import PriceTag from "../ui/PriceTag";
import { MdOutlineStarOutline } from "react-icons/md";
import { FaRegEye } from "react-icons/fa";
import FormattedPrice from "../ui/FormattedPrice";
import { IoClose } from "react-icons/io5";
import AddToCartBtn from "../ui/AddToCartBtn";
import { productPayment } from "../assets";
import ProductCard from "../ui/ProductCard";
import CategoryFilters from "../ui/CategoryFilters";

const Product = () => {
  const [productData, setProductData] = useState<ProductProps | null>(null);
  const [allProducts, setAllProducts] = useState<ProductProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [color, setColor] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [selectedVariation, setSelectedVariation] = useState<string>("");
  const { id } = useParams();

  const endpoint = id
    ? `${config?.baseUrl}/products/${id}`
    : `${config?.baseUrl}/products/`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Import the functions here to avoid circular dependencies
        const { getProductsFromFirebase, getProductByIdFromFirebase } = await import('../lib/index');

        if (id) {
          // Fetch single product from Firebase
          const product = await getProductByIdFromFirebase(id);
          setProductData(product || null);
          setAllProducts([]);
        } else {
          // Fetch all products from Firebase
          const data = await getProductsFromFirebase();

          // Filter out kitchen products from the product page
          const filtered = Array.isArray(data)
            ? data.filter((product: ProductProps) => {
                // Make sure we have a valid product with required properties
                if (!product || typeof product !== 'object') {
                  console.warn('Invalid product object:', product);
                  return false;
                }

                // Check if product has the required properties
                if (!product.hasOwnProperty('_base') || !product.hasOwnProperty('name') || !product.hasOwnProperty('images')) {
                  console.warn('Product missing required properties:', product);
                  return false;
                }

                      // Check if this is a kitchen/food product
                const isKitchenProduct = (
                  product._base === "kitchen" ||
                  product.pageType === "kitchen" ||
                  product._base === "food" ||
                  product.pageType === "food" ||
                  product.category === "Kitchen" ||
                  product.category === "Kitchen & Food" ||
                  product.isKitchenOnly === true
                );

                // Debug logging for kitchen products
                if (isKitchenProduct) {
                  console.log(`Filtering out kitchen product: ${product.name}`, {
                    _base: product._base,
                    pageType: product.pageType,
                    category: product.category,
                    isKitchenOnly: product.isKitchenOnly
                  });
                }

                // Return false for kitchen products (filter them out)
                return !isKitchenProduct;
              })
            : [];
          setAllProducts(filtered);
          setProductData(null);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (productData && Array.isArray(productData.images) && productData.images.length > 0) {
      setImgUrl(productData.images[0]);
    }
    if (productData && Array.isArray(productData.colors) && productData.colors.length > 0) {
      setColor(productData.colors[0]);
    }
  }, [productData]);

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <Container>
          {!!id && productData && _.isEmpty(allProducts) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="flex flex-start">
                <div>
                  {productData?.images?.map((item, index) => (
                    <img
                      src={item}
                      alt="img"
                      key={index}
                      className={`w-24 cursor-pointer opacity-80 hover:opacity-100 duration-300 ${
                        imgUrl === item &&
                        "border border-gray-500 rounded-sm opacity-100"
                      }`}
                      onClick={() => setImgUrl(item)}
                    />
                  ))}
                </div>
                <div>
                  <img src={imgUrl} alt="mainImage" />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h2 className="text-3xl font-bold">{productData?.name}</h2>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">
                    <FormattedPrice
                      amount={
                        productData?.variations && selectedVariation
                          ? productData.variations.find(v => v.id === selectedVariation)?.discountedPrice || productData?.discountedPrice
                          : productData?.discountedPrice
                      }
                    />
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="text-base text-lightText flex items-center">
                      <MdOutlineStarOutline />
                      <MdOutlineStarOutline />
                      <MdOutlineStarOutline />
                      <MdOutlineStarOutline />
                      <MdOutlineStarOutline />
                    </div>
                    <p className="text-base font-semibold">{`(${productData?.reviews} reviews)`}</p>
                  </div>
                </div>


                {/* Option selection for Dry/Fry/Gravy */}
                {productData?.options && Array.isArray(productData.options) && (
                  <div className="mb-4">
                    <p className="font-semibold mb-1">Choose Style:</p>
                    <div className="flex gap-3">
                      {productData.options.map((option: string) => (
                        <label key={option} className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="gizzard-style"
                            value={option}
                            checked={selectedOption === option}
                            onChange={() => setSelectedOption(option)}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  {color && (
                    <p>
                      Color:{" "}
                      <span
                        className="font-semibold capitalize"
                        style={{ color: color }}
                      >
                        {color}
                      </span>
                    </p>
                  )}
                  <div className="flex items-center gap-x-3">
                    {productData?.colors?.map((item) => (
                      <div
                        key={item}
                        className={`${
                          item === color
                            ? "border border-black p-1 rounded-full"
                            : "border-transparent"
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-full cursor-pointer"
                          style={{ backgroundColor: item }}
                          onClick={() => setColor(item)}
                        />
                      </div>
                    ))}
                  </div>
                  {color && (
                    <button
                      onClick={() => setColor("")}
                      className="font-semibold mt-1 flex items-center gap-1 hover:text-red-600 duration-200"
                    >
                      <IoClose /> Clear
                    </button>
                  )}
                </div>
                <p>
                  Brand:{" "}
                  <span className="font-medium">{productData?.brand}</span>
                </p>
                <p>
                  Category:{" "}
                  <span className="font-medium">{productData?.category}</span>
                </p>

                {/* Product Variations */}
                {productData?.variations && productData.variations.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-900">Size Options</h3>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {productData.variations.map((variation) => (
                        <div
                          key={variation.id}
                          onClick={() => setSelectedVariation(variation.id)}
                          className={`
                            flex flex-col items-center justify-center border rounded-md p-2 cursor-pointer
                            ${selectedVariation === variation.id ? 'border-primary ring-2 ring-primary' : 'border-gray-300'}
                            ${!variation.isStock ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}
                          `}
                        >
                          <span className="text-sm font-medium">{variation.name}</span>
                          <span className="text-xs text-gray-500">
                            <FormattedPrice amount={variation.discountedPrice} />
                          </span>
                          {variation.regularPrice > variation.discountedPrice && (
                            <span className="text-xs line-through text-gray-400">
                              <FormattedPrice amount={variation.regularPrice} />
                            </span>
                          )}
                          {!variation.isStock && (
                            <span className="text-xs text-red-500 mt-1">Out of stock</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center mt-4">
                  <AddToCartBtn
                    product={{
                      ...productData,
                      selectedVariation: selectedVariation
                    }}
                    title="Buy now"
                    className="bg-black/80 py-1.5 px-3 text-xs text-gray-200 hover:scale-100 hover:text-white duration-200 w-1/3"
                  />
                </div>
                <div className="bg-[#f7f7f7] p-5 rounded-md flex flex-col items-center justify-center gap-2">
                  <img
                    src={productPayment}
                    alt="payment"
                    className="w-auto object-cover"
                  />
                  <p className="font-semibold">
                    Guaranteed safe & secure checkout
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-10">
              <CategoryFilters id={id} />
              <div>
                <p className="text-4xl font-semibold mb-5 text-center">
                  Products Collection
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {allProducts?.map((item: ProductProps) => (
                    <ProductCard item={item} key={item?._id} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </Container>
      )}
    </div>
  );
};

export default Product;
