import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { db } from "./firebase";
import { ProductProps, UserTypes } from "../../type";


interface StoreType {
  // user
  currentUser: UserTypes | null;
  isLoading: boolean;
  getUserInfo: (uid: any) => Promise<void>;
  // cart
  cartProduct: ProductProps[];
  addToCart: (product: ProductProps) => void;
  decreaseQuantity: (id: string) => void;
  removeFromCart: (id: string) => void;
  resetCart: () => void;
  favoriteProduct: ProductProps[];
  addToFavorite: (product: ProductProps) => void;
  removeFromFavorite: (id: string) => void;
  compareProducts: ProductProps[];
  addToCompare: (product: ProductProps) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
}

const customStorage = {
  getItem: (name: string) => {
    const item = localStorage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: (name: string, value: any) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

export const store = create<StoreType>()(
  persist(
    (set) => ({
      currentUser: null,
      isLoading: true,
      cartProduct: [],
      favoriteProduct: [],
      compareProducts: [],

      getUserInfo: async (uid: any) => {
        if (!uid) {
          console.log("No UID provided to getUserInfo");
          return set({ currentUser: null, isLoading: false });
        }

        console.log("Getting user info for UID:", uid);

        try {
          const docRef = doc(db, "users", uid);
          console.log("Attempting to fetch user document from Firestore");
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            console.log("User document found:", docSnap.data());
            set({ currentUser: docSnap.data() as UserTypes, isLoading: false });
          } else {
            console.log("No user document found for UID:", uid);
            set({ currentUser: null, isLoading: false });
          }
        } catch (error) {
          console.error("getUserInfo error:", error);
          set({ currentUser: null, isLoading: false });
        }
      },
      addToCart: (product) => {
        set((state) => {
          // Create a unique key for the product based on ID and selected variation
          const productKey = product.selectedVariation
            ? `${product._id}-${product.selectedVariation}`
            : String(product._id);

          // Find if this exact product (with same variation if applicable) exists in cart
          const existingProduct = state.cartProduct.find(item => {
            const itemKey = item.selectedVariation
              ? `${item._id}-${item.selectedVariation}`
              : String(item._id);
            return itemKey === productKey;
          });

          // If product has variations, get the selected variation details
          let productToAdd = { ...product };
          if (product.variations && product.selectedVariation) {
            const selectedVar = product.variations.find(v => v.id === product.selectedVariation);
            if (selectedVar) {
              // Update price based on selected variation
              productToAdd = {
                ...productToAdd,
                regularPrice: selectedVar.regularPrice,
                discountedPrice: selectedVar.discountedPrice,
                isStock: selectedVar.isStock
              };
            }
          }

          if (existingProduct) {
            // Update quantity of existing product
            const updatedProducts = state.cartProduct.map(item => {
              const itemKey = item.selectedVariation
                ? `${item._id}-${item.selectedVariation}`
                : String(item._id);

              return itemKey === productKey
                ? { ...item, quantity: item.quantity + 1 }
                : item;
            });
            return { cartProduct: updatedProducts };
          }

          // Add new product to cart
          return {
            cartProduct: [...state.cartProduct, { ...productToAdd, quantity: 1 }]
          };
        });
      },
      decreaseQuantity: (id) => {
        set((state) => {
          // Check if the ID contains a variation ID (format: productId-variationId)
          const parts = id.toString().split('-');
          if (parts.length > 1) {
            // This is a product with variation
            const productId = parts[0];
            const variationId = parts[1];

            return {
              cartProduct: state.cartProduct.map((item) => {
                if (String(item._id) === productId && item.selectedVariation === variationId) {
                  return { ...item, quantity: item.quantity - 1 };
                }
                return item;
              }),
            };
          } else {
            // Regular product without variation
            return {
              cartProduct: state.cartProduct.map((item) =>
                String(item._id) === String(id) && !item.selectedVariation
                  ? { ...item, quantity: item.quantity - 1 }
                  : item
              ),
            };
          }
        });
      },
      removeFromCart: (id) => {
        set((state) => {
          // Check if the ID contains a variation ID (format: productId-variationId)
          const parts = id.toString().split('-');
          if (parts.length > 1) {
            // This is a product with variation
            const productId = parts[0];
            const variationId = parts[1];

            return {
              cartProduct: state.cartProduct.filter(
                (item) => !(String(item._id) === productId && item.selectedVariation === variationId)
              ),
            };
          } else {
            // Regular product without variation
            return {
              cartProduct: state.cartProduct.filter(
                (item) => !(String(item._id) === String(id) && !item.selectedVariation)
              ),
            };
          }
        });
      },
      resetCart: () => {
        set(() => ({
          cartProduct: [],
        }));
      },
      addToFavorite: (product) => {
        set((state) => ({
          favoriteProduct: [...state.favoriteProduct, product],
        }));
      },
      removeFromFavorite: (id) => {
        set((state) => ({
          favoriteProduct: state.favoriteProduct.filter((item) => String(item._id) !== String(id)),
        }));
      },
      addToCompare: (product) => {
        set((state) => ({
          compareProducts: [...state.compareProducts, product],
        }));
      },
      removeFromCompare: (id) => {
        set((state) => ({
          compareProducts: state.compareProducts.filter((item) => String(item._id) !== String(id)),
        }));
      },
      clearCompare: () => {
        set(() => ({
          compareProducts: [],
        }));
      },
    }),
    {
      name: "supergear-storage",
      storage: customStorage,
    }
  )
);
