import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from "firebase/firestore";
import { db, storage } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { ProductProps } from "../../type";
import Loading from "../ui/Loading";
import toast from "react-hot-toast";
// Import fallback data from client constants
import { products as fallbackProducts, categories as fallbackCategories } from "../constants/index";

const AdminProducts = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductProps | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductProps | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const productsPerPage = 10;

  // New product form state
  const [newProduct, setNewProduct] = useState<Partial<ProductProps>>({
    name: "",
    description: "",
    regularPrice: 0,
    discountedPrice: 0,
    category: "",
    brand: "",
    isStock: true,
    isNew: true,
    rating: 4.0,
    reviews: 0,
    quantity: 1,
    overView: "",
    colors: ["black", "white"],
    images: [""],
    _base: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
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
      } else {
        // Use fallback data if Firestore is empty
        console.log("No products found in Firestore, using fallback data");
        productsData = fallbackProducts;

        // Save fallback data to Firestore
        for (const product of fallbackProducts) {
          try {
            await setDoc(doc(db, "products", product._id.toString()), product);
          } catch (error) {
            console.error("Error saving fallback product to Firestore:", error);
          }
        }
      }

      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");

      // Use fallback data if there's an error
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesCollection = collection(db, "categories");
      const categoriesSnapshot = await getDocs(categoriesCollection);
      let categoriesData: string[] = [];

      // Check if we have categories in Firestore
      if (!categoriesSnapshot.empty) {
        categoriesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.name) {
            categoriesData.push(data.name);
          }
        });
      } else {
        // Use fallback data if Firestore is empty
        console.log("No categories found in Firestore, using fallback data");
        categoriesData = fallbackCategories.map(category => category.name);

        // Save fallback data to Firestore
        for (const category of fallbackCategories) {
          try {
            await setDoc(doc(db, "categories", category._id.toString()), category);
          } catch (error) {
            console.error("Error saving fallback category to Firestore:", error);
          }
        }
      }

      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");

      // Use fallback data if there's an error
      setCategories(fallbackCategories.map(category => category.name));
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setNewProduct({
      name: "",
      description: "",
      regularPrice: 0,
      discountedPrice: 0,
      category: categories[0] || "",
      brand: "",
      isStock: true,
      isNew: true,
      rating: 4.0,
      reviews: 0,
      quantity: 1,
      overView: "",
      colors: ["black", "white"],
      images: [""],
      _base: "",
    });
    setProductImages([]);
    setImageUrls([]);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: ProductProps) => {
    setSelectedProduct(product);
    setNewProduct({
      ...product,
    });
    setImageUrls(product.images || []);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (product: ProductProps) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setLoading(true);

      // Delete product document
      await deleteDoc(doc(db, "products", productToDelete._id.toString()));

      // Delete product images from storage
      if (productToDelete.images && productToDelete.images.length > 0) {
        for (const imageUrl of productToDelete.images) {
          try {
            // Extract the path from the URL
            const imagePath = imageUrl.split('?')[0].split('/o/')[1];
            if (imagePath) {
              const decodedPath = decodeURIComponent(imagePath);
              const imageRef = ref(storage, decodedPath);
              await deleteObject(imageRef);
            }
          } catch (error) {
            console.error("Error deleting image:", error);
          }
        }
      }

      // Update local state
      setProducts(products.filter(p => p._id !== productToDelete._id));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setProductImages(prev => [...prev, ...filesArray]);

      // Create preview URLs
      const newImageUrls = filesArray.map(file => URL.createObjectURL(file));
      setImageUrls(prev => [...prev, ...newImageUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (productImages.length === 0) {
      return newProduct.images as string[] || [];
    }

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const image of productImages) {
        const storageRef = ref(storage, `products/${Date.now()}_${image.name}`);
        await uploadBytes(storageRef, image);
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
      }

      return [...uploadedUrls, ...(newProduct.images || [])].filter(url =>
        // Filter out blob URLs
        !url.startsWith('blob:')
      );
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
      return newProduct.images as string[] || [];
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Generate a new ID if adding a new product
      const productId = selectedProduct ? selectedProduct._id : Date.now();

      // Upload images
      const imageUrls = await uploadImages();

      // Prepare product data
      const productData: ProductProps = {
        ...newProduct as ProductProps,
        _id: productId,
        images: imageUrls as [string],
      };

      // Save to Firestore
      await setDoc(doc(db, "products", productId.toString()), productData);

      // Update local state
      if (selectedProduct) {
        setProducts(products.map(p => p._id === productId ? productData : p));
        toast.success("Product updated successfully");
      } else {
        setProducts([...products, productData]);
        toast.success("Product added successfully");
      }

      // Close modal
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  // Filter and paginate products
  const filteredProducts = products
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory === "" || product.category === filterCategory)
    );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading && products.length === 0) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={handleAddProduct}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="md:w-1/4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={product.images?.[0] || "/placeholder.png"}
                        alt={product.name}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name.length > 30 ? `${product.name.substring(0, 30)}...` : product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{product.discountedPrice}
                      {product.regularPrice > product.discountedPrice && (
                        <span className="line-through text-gray-400 ml-2">₹{product.regularPrice}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.isStock
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.isStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md mr-2 bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-md mx-1 ${
                  currentPage === page
                    ? "bg-primary text-white"
                    : "bg-gray-200"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md ml-2 bg-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name*
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category*
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Regular Price*
                  </label>
                  <input
                    type="number"
                    value={newProduct.regularPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, regularPrice: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discounted Price*
                  </label>
                  <input
                    type="number"
                    value={newProduct.discountedPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, discountedPrice: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overview
                  </label>
                  <input
                    type="text"
                    value={newProduct.overView}
                    onChange={(e) => setNewProduct({ ...newProduct, overView: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Category
                  </label>
                  <input
                    type="text"
                    value={newProduct._base}
                    onChange={(e) => setNewProduct({ ...newProduct, _base: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Status
                  </label>
                  <select
                    value={newProduct.isStock ? "true" : "false"}
                    onChange={(e) => setNewProduct({ ...newProduct, isStock: e.target.value === "true" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="true">In Stock</option>
                    <option value="false">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Product
                  </label>
                  <select
                    value={newProduct.isNew ? "true" : "false"}
                    onChange={(e) => setNewProduct({ ...newProduct, isNew: e.target.value === "true" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <input
                    type="number"
                    value={newProduct.rating}
                    onChange={(e) => setNewProduct({ ...newProduct, rating: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Images
                </label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  accept="image/*"
                  multiple
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index}`}
                        className="h-20 w-20 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || isUploading}
                  className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
                >
                  {loading || isUploading ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete the product "{productToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
