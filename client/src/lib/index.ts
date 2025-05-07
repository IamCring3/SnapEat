import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { ProductProps } from "../../type";
import { products as fallbackProducts } from "../constants/index";

// Original API fetch function
export const getData = async (endpoint: string) => {
  try {
    console.log(`Fetching data from: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Log response status
    console.log(`Response status: ${response.status} ${response.statusText}`);

    // Handle different HTTP status codes
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Resource not found at ${endpoint}`);
        // For 404, we'll return the error message from the server if available
        try {
          const errorData = await response.json();
          return errorData; // Return the error data so the component can handle it
        } catch (parseError) {
          throw new Error(`Resource not found: ${response.statusText}`);
        }
      } else {
        throw new Error(`Data fetching error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error while fetching data:", error);
    throw error;
  }
};

// New function to fetch products from Firebase
export const getProductsFromFirebase = async (): Promise<ProductProps[]> => {
  try {
    console.log("Fetching products from Firebase");
    const productsCollection = collection(db, "products");
    const productsSnapshot = await getDocs(productsCollection);
    let productsData: ProductProps[] = [];

    // Check if we have products in Firestore
    if (!productsSnapshot.empty) {
      productsSnapshot.forEach((doc) => {
        const data = doc.data() as ProductProps;
        productsData.push({
          ...data,
          _id: parseInt(doc.id),
        });
      });
      console.log(`Found ${productsData.length} products in Firebase`);
      return productsData;
    } else {
      console.log("No products found in Firebase, using fallback data");
      // Ensure fallback products match the ProductProps type
      return fallbackProducts.map(product => ({
        ...product,
        _base: product._base || "",
        colors: product.colors || ["black"],
        images: product.images || [""],
        isStock: product.isStock !== undefined ? product.isStock : true,
        isNew: product.isNew !== undefined ? product.isNew : false,
        overView: product.overView || "",
      })) as ProductProps[];
    }
  } catch (error) {
    console.error("Error fetching products from Firebase:", error);
    console.log("Using fallback data due to error");
    // Ensure fallback products match the ProductProps type
    return fallbackProducts.map(product => ({
      ...product,
      _base: product._base || "",
      colors: product.colors || ["black"],
      images: product.images || [""],
      isStock: product.isStock !== undefined ? product.isStock : true,
      isNew: product.isNew !== undefined ? product.isNew : false,
      overView: product.overView || "",
    })) as ProductProps[];
  }
};

// Function to get a single product from Firebase by ID
export const getProductByIdFromFirebase = async (id: string): Promise<ProductProps | null> => {
  try {
    console.log(`Fetching product with ID ${id} from Firebase`);
    const productRef = doc(db, "products", id);
    const productSnapshot = await getDoc(productRef);

    if (productSnapshot.exists()) {
      const data = productSnapshot.data() as ProductProps;
      return {
        ...data,
        _id: parseInt(id),
      };
    } else {
      console.log(`Product with ID ${id} not found in Firebase`);
      // Try to find in fallback data
      const fallbackProduct = fallbackProducts.find(p => p._id.toString() === id);
      if (fallbackProduct) {
        // Ensure fallback product matches the ProductProps type
        return {
          ...fallbackProduct,
          _base: fallbackProduct._base || "",
          colors: fallbackProduct.colors || ["black"],
          images: fallbackProduct.images || [""],
          isStock: fallbackProduct.isStock !== undefined ? fallbackProduct.isStock : true,
          isNew: fallbackProduct.isNew !== undefined ? fallbackProduct.isNew : false,
          overView: fallbackProduct.overView || "",
        } as ProductProps;
      }
      return null;
    }
  } catch (error) {
    console.error(`Error fetching product with ID ${id} from Firebase:`, error);
    // Try to find in fallback data
    const fallbackProduct = fallbackProducts.find(p => p._id.toString() === id);
    if (fallbackProduct) {
      // Ensure fallback product matches the ProductProps type
      return {
        ...fallbackProduct,
        _base: fallbackProduct._base || "",
        colors: fallbackProduct.colors || ["black"],
        images: fallbackProduct.images || [""],
        isStock: fallbackProduct.isStock !== undefined ? fallbackProduct.isStock : true,
        isNew: fallbackProduct.isNew !== undefined ? fallbackProduct.isNew : false,
        overView: fallbackProduct.overView || "",
      } as ProductProps;
    }
    return null;
  }
};
