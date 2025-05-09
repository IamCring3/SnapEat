import { useEffect, useState } from "react";
import { RotatingLines } from "react-loader-spinner";
import { CategoryProps } from "../../type";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { categories as fallbackCategories } from "../constants/index";

const CategoryFilters = ({ id }: { id: string | undefined }) => {
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        console.log("Fetching categories from Firebase");

        // Fetch categories from Firestore
        const categoriesCollection = collection(db, "categories");
        const categoriesSnapshot = await getDocs(categoriesCollection);
        let categoriesData: CategoryProps[] = [];

        // Check if we have categories in Firestore
        if (!categoriesSnapshot.empty) {
          categoriesSnapshot.forEach((doc) => {
            const data = doc.data() as CategoryProps;
            categoriesData.push({
              ...data,
              _id: parseInt(doc.id),
            });
          });
          console.log(`Found ${categoriesData.length} categories in Firebase`);
        } else {
          console.log("No categories found in Firebase, using fallback data");
          categoriesData = fallbackCategories;
        }

        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        console.log("Using fallback categories due to error");
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);
  return (
    <div className="hidden md:inline-flex flex-col gap-6">
      <p className="text-3xl font-bold">Filters</p>
      <div>
        <p className="text-sm uppercase font-semibold underline underline-offset-2 decoration-[1px] mb-2">
          Select Categories
        </p>
        <div className="flex flex-col gap-y-2 min-w-40">
          {loading ? (
            <div className="flex items-center justify-center my-5">
              <RotatingLines
                visible={true}
                strokeWidth="5"
                animationDuration="0.75"
                ariaLabel="rotating-lines-loading"
                width="50"
              />
            </div>
          ) : (
            categories
              ?.filter((item: CategoryProps) => {
                // Filter out kitchen and food categories
                const isKitchenCategory =
                  item._base === 'kitchen' ||
                  item._base === 'food' ||
                  item.name === 'Kitchen' ||
                  item.name === 'Kitchen & Food' ||
                  item.isKitchenPage === true;

                // Debug logging
                console.log(`Category: ${item.name}`, {
                  included: !isKitchenCategory,
                  _base: item._base,
                  name: item.name,
                  isKitchenPage: item.isKitchenPage
                });

                return !isKitchenCategory;
              })
              .map((item: CategoryProps) => (
                <Link
                  to={`/category/${item?._base}`}
                  key={item?._id}
                  className={`text-base font-medium text-start underline underline-offset-2 decoration-[1px] decoration-transparent hover:decoration-gray-950 hover:text-black duration-200 ${
                    item?._base === id
                      ? "text-greenText decoration-greenText"
                      : "text-lightText"
                  }`}
                >
                  {item?.name}
                </Link>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilters;
