import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db, storage } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { CategoryProps } from "../../type";
import Loading from "../ui/Loading";
import toast from "react-hot-toast";
// Import fallback data from client constants
import { categories as fallbackCategories } from "../constants/index";

const AdminCategories = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryProps | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryProps | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // New category form state
  const [newCategory, setNewCategory] = useState<Partial<CategoryProps>>({
    name: "",
    description: "",
    image: "",
    _base: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
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
      } else {
        // Use fallback data if Firestore is empty
        console.log("No categories found in Firestore, using fallback data");
        categoriesData = fallbackCategories;

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
      setCategories(fallbackCategories);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setNewCategory({
      name: "",
      description: "",
      image: "",
      _base: "",
    });
    setCategoryImage(null);
    setImagePreview("");
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: CategoryProps) => {
    setSelectedCategory(category);
    setNewCategory({
      ...category,
    });
    setImagePreview(category.image || "");
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (category: CategoryProps) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setLoading(true);

      // Delete category document
      await deleteDoc(doc(db, "categories", categoryToDelete._id.toString()));

      // Delete category image from storage if it's stored in Firebase
      if (categoryToDelete.image && categoryToDelete.image.includes("firebasestorage")) {
        try {
          // Extract the path from the URL
          const imagePath = categoryToDelete.image.split('?')[0].split('/o/')[1];
          if (imagePath) {
            const decodedPath = decodeURIComponent(imagePath);
            const imageRef = ref(storage, decodedPath);
            await deleteObject(imageRef);
          }
        } catch (error) {
          console.error("Error deleting image:", error);
        }
      }

      // Update local state
      setCategories(categories.filter(c => c._id !== categoryToDelete._id));
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    } finally {
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCategoryImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!categoryImage) {
      return newCategory.image || "";
    }

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `categories/${Date.now()}_${categoryImage.name}`);
      await uploadBytes(storageRef, categoryImage);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      return newCategory.image || "";
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Generate a new ID if adding a new category
      const categoryId = selectedCategory ? selectedCategory._id : Date.now();

      // Upload image
      const imageUrl = await uploadImage();

      // Prepare category data
      const categoryData: CategoryProps = {
        ...newCategory as CategoryProps,
        _id: categoryId,
        image: imageUrl,
      };

      // Save to Firestore
      await setDoc(doc(db, "categories", categoryId.toString()), categoryData);

      // Update local state
      if (selectedCategory) {
        setCategories(categories.map(c => c._id === categoryId ? categoryData : c));
        toast.success("Category updated successfully");
      } else {
        setCategories([...categories, categoryData]);
        toast.success("Category added successfully");
      }

      // Close modal
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  // Filter categories
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && categories.length === 0) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button
          onClick={handleAddCategory}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Add Category
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
              placeholder="Search categories..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <div key={category._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src={category.image || "/placeholder.png"}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Base: {category._base}</span>
                  <div>
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No categories found
          </div>
        )}
      </div>

      {/* Add/Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {selectedCategory ? "Edit Category" : "Add New Category"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name*
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Identifier*
                  </label>
                  <input
                    type="text"
                    value={newCategory._base}
                    onChange={(e) => setNewCategory({ ...newCategory, _base: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    placeholder="e.g., tvAndAudio"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Image
                </label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  accept="image/*"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-40 w-auto object-cover rounded-md"
                    />
                  </div>
                )}
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
                  {loading || isUploading ? "Saving..." : "Save Category"}
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
              Are you sure you want to delete the category "{categoryToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCategory}
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

export default AdminCategories;
