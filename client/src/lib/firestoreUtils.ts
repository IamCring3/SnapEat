import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  DocumentData,
  QueryConstraint
} from "firebase/firestore";
import { db, storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { ProductProps, CategoryProps } from "../../type";

// Generic function to fetch all documents from a collection
export const fetchCollection = async <T>(collectionName: string): Promise<T[]> => {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    const data: T[] = [];
    
    snapshot.forEach((doc) => {
      data.push({ 
        ...doc.data(), 
        _id: doc.id 
      } as unknown as T);
    });
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    throw error;
  }
};

// Function to fetch a single document by ID
export const fetchDocument = async <T>(collectionName: string, docId: string): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { 
        ...docSnap.data(), 
        _id: docSnap.id 
      } as unknown as T;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching document ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

// Function to save a document (create or update)
export const saveDocument = async <T extends { _id?: string | number }>(
  collectionName: string, 
  data: T
): Promise<T> => {
  try {
    const docId = data._id?.toString() || Date.now().toString();
    const docRef = doc(db, collectionName, docId);
    
    // Remove _id from data before saving to Firestore
    const { _id, ...dataWithoutId } = data;
    
    await setDoc(docRef, dataWithoutId);
    
    return { 
      ...data, 
      _id: docId 
    } as T;
  } catch (error) {
    console.error(`Error saving document to ${collectionName}:`, error);
    throw error;
  }
};

// Function to delete a document
export const deleteDocument = async (collectionName: string, docId: string): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

// Function to query documents with filters
export const queryDocuments = async <T>(
  collectionName: string,
  constraints: QueryConstraint[]
): Promise<T[]> => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const snapshot = await getDocs(q);
    const data: T[] = [];
    
    snapshot.forEach((doc) => {
      data.push({ 
        ...doc.data(), 
        _id: doc.id 
      } as unknown as T);
    });
    
    return data;
  } catch (error) {
    console.error(`Error querying ${collectionName}:`, error);
    throw error;
  }
};

// Function to upload an image to Firebase Storage
export const uploadImage = async (
  file: File, 
  path: string
): Promise<string> => {
  try {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Function to delete an image from Firebase Storage
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    if (!imageUrl.includes("firebasestorage")) {
      return; // Not a Firebase Storage URL
    }
    
    // Extract the path from the URL
    const imagePath = imageUrl.split('?')[0].split('/o/')[1];
    if (imagePath) {
      const decodedPath = decodeURIComponent(imagePath);
      const imageRef = ref(storage, decodedPath);
      await deleteObject(imageRef);
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

// Specific functions for products
export const fetchProducts = async (): Promise<ProductProps[]> => {
  return fetchCollection<ProductProps>("products");
};

export const saveProduct = async (product: ProductProps): Promise<ProductProps> => {
  return saveDocument<ProductProps>("products", product);
};

export const deleteProduct = async (productId: string): Promise<void> => {
  return deleteDocument("products", productId);
};

// Specific functions for categories
export const fetchCategories = async (): Promise<CategoryProps[]> => {
  return fetchCollection<CategoryProps>("categories");
};

export const saveCategory = async (category: CategoryProps): Promise<CategoryProps> => {
  return saveDocument<CategoryProps>("categories", category);
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  return deleteDocument("categories", categoryId);
};
