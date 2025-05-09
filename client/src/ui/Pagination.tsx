"use client";
import { useEffect, useState } from "react";
import { config } from "../../config";
import { getData } from "../lib";
import { ProductProps } from "../../type";
import ProductCard from "./ProductCard";
import ReactPaginate from "react-paginate";

interface ItemsProps {
  currentItems: ProductProps[];
}

const Items = ({ currentItems }: ItemsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
      {currentItems &&
        currentItems?.map((item: ProductProps) => (
          <ProductCard key={item?._id} item={item} />
        ))}
    </div>
  );
};

const Pagination = () => {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Import the function here to avoid circular dependencies
        const { getProductsFromFirebase } = await import('../lib/index');
        console.log("Fetching products from Firebase");

        const data = await getProductsFromFirebase();
        console.log("Products data received from Firebase:", data);

        // Check if data is valid
        if (!data || !Array.isArray(data)) {
          console.error("Invalid data format received:", data);
          setError("Invalid data format received from Firebase");
          setProducts([]);
          return;
        }

        // Filter out kitchen products and only show featured products on the home page
        const filtered = data.filter((product: ProductProps) => {
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

          // Only include featured products that are not kitchen products
          const shouldInclude = !isKitchenProduct && product.featured === true;

          // Debug logging for featured products
          if (product.featured === true) {
            console.log(`Featured product: ${product.name}`, {
              included: shouldInclude,
              isKitchen: isKitchenProduct,
              _base: product._base,
              pageType: product.pageType,
              category: product.category,
              isKitchenOnly: product.isKitchenOnly
            });
          }

          return shouldInclude;
        });

        console.log(`Filtered ${data.length} products to ${filtered.length} products`);

        if (filtered.length === 0 && data.length > 0) {
          console.warn("All products were filtered out. Check filtering criteria.");
        }

        setProducts(filtered);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const itemsPerPage = 15;
  const [itemOffset, setItemOffset] = useState(0);
  const [itemStart, setItemStart] = useState(1);
  const endOffset = itemOffset + itemsPerPage;
  // console.log(`Loading items from ${itemOffset} to ${endOffset}`);
  const currentItems = products.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(products.length / itemsPerPage);

  const handlePageClick = (event: any) => {
    const newOffset = (event.selected * itemsPerPage) % products.length;
    const newStart = newOffset + 1;
    // console.log(
    //   `User requested page number ${event.selected}, which is offset ${newOffset}`
    // );
    setItemOffset(newOffset);
    setItemStart(newStart);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg mb-4">No products found</p>
        <p className="text-gray-500">Try checking the server connection or adding some products.</p>
      </div>
    );
  }

  return (
    <>
      <Items currentItems={currentItems} />
      <div className="flex flex-col md:flex-row justify-center md:justify-between items-center">
        {pageCount > 1 && (
          <ReactPaginate
            nextLabel=""
            onPageChange={handlePageClick}
            pageRangeDisplayed={3}
            marginPagesDisplayed={2}
            pageCount={pageCount}
            previousLabel=""
            pageLinkClassName="w-9 h-9 border[1px] border-lightColor hover:border-gray-500 duration-300 flex justify-center items-center"
            pageClassName="mr-6"
            containerClassName="flex text-base font-semibold py-10"
            activeClassName="bg-black text-white"
          />
        )}
        <p>
          Products from {itemStart} to {Math.min(endOffset, products?.length)}{" "}
          of {products?.length}
        </p>
      </div>
    </>
  );
};

export default Pagination;
