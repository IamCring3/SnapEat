import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { db } from "./firebase";
import { ProductProps, UserTypes } from "../../type";

interface CartProduct extends ProductProps {
  quantity: number;
}

interface UserType {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  avatar: string;
  id: string;
}

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
          const existingProduct = state.cartProduct.find(
            (item) => item._id === product._id
          );
          if (existingProduct) {
            const updatedProducts = state.cartProduct.map((item) =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
            return { cartProduct: updatedProducts };
          }
          return { cartProduct: [...state.cartProduct, { ...product, quantity: 1 }] };
        });
      },
      decreaseQuantity: (id) => {
        set((state) => ({
          cartProduct: state.cartProduct.map((item) =>
            item._id === id ? { ...item, quantity: item.quantity - 1 } : item
          ),
        }));
      },
      removeFromCart: (id) => {
        set((state) => ({
          cartProduct: state.cartProduct.filter((item) => item._id !== id),
        }));
      },
      resetCart: () => {
        set((state) => ({
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
          favoriteProduct: state.favoriteProduct.filter((item) => item._id !== id),
        }));
      },
      addToCompare: (product) => {
        set((state) => ({
          compareProducts: [...state.compareProducts, product],
        }));
      },
      removeFromCompare: (id) => {
        set((state) => ({
          compareProducts: state.compareProducts.filter((item) => item._id !== id),
        }));
      },
      clearCompare: () => {
        set((state) => ({
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
