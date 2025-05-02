import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { config } from "../../config";
import { getData } from "../lib";
import Loading from "../ui/Loading";
import Container from "../ui/Container";
import CategoryFilters from "../ui/CategoryFilters";
import ProductCard from "../ui/ProductCard";
import { ProductProps } from "../../type";

const Category = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log(`Fetching products for category ${id} from Firebase`);

      try {
        setLoading(true);
        setError(null);

        // Import the function here to avoid circular dependencies
        const { getProductsFromFirebase } = await import('../lib/index');
        const allProducts = await getProductsFromFirebase();

        console.log(`Received all products from Firebase, filtering for category ${id}`);

        // Filter products by category
        const filteredProducts = allProducts.filter(product => {
          // Match by _base (exact or case-insensitive)
          if (product._base === id ||
              (typeof product._base === 'string' && product._base.toLowerCase() === id.toLowerCase())) {
            return true;
          }

          // Match by category name for specific categories
          const categoryMap = {
            "beverages": "Beverages",
            "babyCare": "Baby Care",
            "hairCare": "Hair Care",
            "personalCare": "Personal Care",
            "skinCare": "Skin Care",
            "homeCare": "Home Care",
            "oralCare": "Oral Care",
            "cleaningDisinfectant": "Cleaning & Disinfectants",
            "stationary": "Stationary"
          };

          if (id && categoryMap[id] && product.category === categoryMap[id]) {
            return true;
          }

          // Also check if pageType matches
          if (product.pageType && product.pageType.toLowerCase() === id.toLowerCase()) {
            return true;
          }

          return false;
        });

        console.log(`Found ${filteredProducts.length} products for category ${id}`);
        setProducts(filteredProducts);
      } catch (error) {
        console.error("Error fetching data", error);
        setError("Failed to load products. Please try again later.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const formatId = (id: string) => {
    // Map of category IDs to their display names
    const categoryMap: Record<string, string> = {
      "beverages": "Beverages",
      "babyCare": "Baby Care",
      "hairCare": "Hair Care",
      "personalCare": "Personal Care",
      "skinCare": "Skin Care",
      "homeCare": "Home Care",
      "oralCare": "Oral Care",
      "cleaningDisinfectant": "Cleaning & Disinfectants",
      "stationary": "Stationary"
    };

    // Check if we have a predefined name for this category
    if (categoryMap[id]) {
      return categoryMap[id];
    }

    // Otherwise, format it automatically
    return id
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Convert camelCase to spaces
      .replace(/(^\w|\s\w)/g, (match) => match.toUpperCase()); // Capitalize first letter of each word
  };
  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <Container>
          <h2 className="text-4xl text-center font-semibold mb-5">
            {formatId(id!)}
          </h2>

          {error ? (
            <div className="text-center py-10">
              <div className="text-red-500 mb-4">{error}</div>
              <p className="text-gray-600 mb-4">
                There are no products in this category yet.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-10">
              <CategoryFilters id={id} />

              {products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {products.map((item: ProductProps) => (
                    <ProductCard item={item} key={item?._id} />
                  ))}
                </div>
              ) : (
                <div className="flex-1 text-center py-10">
                  <p className="text-lg mb-4">No products found in this category</p>
                  <p className="text-gray-500 mb-6">
                    This category doesn't have any products yet.
                  </p>
                  <div className="flex justify-center">
                    <a
                      href={`/admin/products?category=${id}`}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Add Products
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </Container>
      )}
    </div>
  );
};

export default Category;
