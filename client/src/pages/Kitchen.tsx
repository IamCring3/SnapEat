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
import AddToCartBtn from "../ui/AddToCartBtn";
import { productPayment } from "../assets";
import ProductCard from "../ui/ProductCard";


const Kitchen = () => {
  const [productData, setProductData] = useState<ProductProps | null>(null);
  const [allProducts, setAllProducts] = useState<ProductProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const { id } = useParams();

  const endpoint = id
    ? `${config?.baseUrl}/kitchen/${id}`
    : `${config?.baseUrl}/kitchen`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Import the functions here to avoid circular dependencies
        const { getProductsFromFirebase, getProductByIdFromFirebase } = await import('../lib/index');

        if (id) {
          console.log('Fetching product with ID:', id);
          // Fetch single product from Firebase
          const product = await getProductByIdFromFirebase(id);
          console.log('Fetched product:', product);

          if (product) {
            console.log('Product found, checking if it\'s a kitchen product...');
            const isKitchen = (
              product._base === "kitchen" ||
              product.pageType === "kitchen" ||
              product._base === "food" ||
              product.pageType === "food" ||
              product.category === "Kitchen" ||
              product.category === "Kitchen & Food" ||
              product.isKitchenOnly === true
            );
            console.log('Is kitchen product?', isKitchen, 'Product properties:', {
              _base: product._base,
              pageType: product.pageType,
              category: product.category,
              isKitchenOnly: product.isKitchenOnly
            });

            if (isKitchen) {
              setProductData(product);
              setAllProducts([]);
            } else {
              console.log('Product is not marked as a kitchen product');
              setProductData(null);
              setAllProducts([]);
            }
          } else {
            console.log('No product found with ID:', id);
            setProductData(null);
            setAllProducts([]);
          }
        } else {
          // Fetch all products from Firebase
          const data = await getProductsFromFirebase();
          console.log('All products from Firebase:', data);

          // Filter only kitchen products
          const kitchenProducts = Array.isArray(data) ? data.filter((product: ProductProps) => {
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

            // Debug logging for all products to see what's available
            console.log(`Product: ${product.name || 'Unnamed Product'}`, {
              isKitchen: isKitchenProduct,
              _base: product._base,
              pageType: product.pageType,
              category: product.category,
              isKitchenOnly: product.isKitchenOnly,
              id: product._id || 'no-id'
            });

            return isKitchenProduct;
          }) : [];

          setAllProducts(kitchenProducts);
          setProductData(null);
        }
      } catch (error) {
        console.error("Error fetching data", error);
        setAllProducts([]);
        setProductData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (productData?.images && productData.images.length > 0) {
      setImgUrl(productData.images[0]);
    }
  }, [productData]);

  // If no kitchen products found
  if (!loading && allProducts.length === 0 && !productData) {
    return (
      <Container>
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold mb-4">No Kitchen Products Available</h2>
          <p>Please check back later for our kitchen menu.</p>
        </div>
      </Container>
    );
  }

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
              <div>
                <h2 className="text-3xl font-bold">{productData?.name}</h2>
                <div className="flex items-center justify-between">
                  <PriceTag
                    regularPrice={productData?.regularPrice}
                    discountedPrice={productData?.discountedPrice}
                    className="text-xl"
                  />
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


                <p>
                  Brand:{" "}
                  <span className="font-medium">{productData?.brand}</span>
                </p>
                <p>
                  Category:{" "}
                  <span className="font-medium">{productData?.category}</span>
                </p>
                <AddToCartBtn
                  product={productData}
                  title="Buy now"
                  className="bg-black/80 py-3 text-base text-gray-200 hover:scale-100 hover:text-white duration-200"
                />
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
              <div>
                <p className="text-4xl font-semibold mb-5 text-center">
                  Kitchen Collection
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {allProducts && allProducts.map((item: ProductProps) => (
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

export default Kitchen;