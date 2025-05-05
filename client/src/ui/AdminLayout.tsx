import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import Loading from "./Loading";

const AdminLayout = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async (uid: string) => {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        const userData = userDoc.data();

        if (userData?.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          navigate("/admin/login");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        navigate("/admin/login");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkAdminStatus(user.uid);
      } else {
        setIsAdmin(false);
        navigate("/admin/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (isAdmin === null) {
    return <Loading />;
  }

  if (isAdmin === false) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">SnapEat Admin</h1>
        <button
          onClick={() => auth.signOut()}
          className="bg-white text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md min-h-screen p-4">
          <nav className="space-y-2">
            <Link
              to="/admin/dashboard"
              className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/products"
              className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Products
            </Link>
            <Link
              to="/admin/categories"
              className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Categories
            </Link>
            <Link
              to="/admin/orders"
              className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Orders
            </Link>
            <Link
              to="/admin/users"
              className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Users
            </Link>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
