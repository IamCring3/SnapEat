import ReactDOM from "react-dom/client";
import {
  Outlet,
  RouterProvider,
  ScrollRestoration,
  createBrowserRouter,
} from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import Cancel from "./pages/Cancel.tsx";
import Cart from "./pages/Cart.tsx";
import Category from "./pages/Category.tsx";
import NotFound from "./pages/NotFound.tsx";
import Orders from "./pages/Orders.tsx";
import Product from "./pages/Product.tsx";
import Profile from "./pages/Profile.tsx";
import Success from "./pages/Success.tsx";
import Kitchen from "./pages/Kitchen.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import AdminOrders from "./pages/AdminOrders.tsx";
import AdminUsers from "./pages/AdminUsers.tsx";
import TestApi from "./pages/TestApi.tsx";
import AdminProducts from "./pages/AdminProducts.tsx";
import AdminCategories from "./pages/AdminCategories.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";


import Layout from "./ui/Layout.tsx";
import AdminLayout from "./ui/AdminLayout.tsx";

console.log("Starting app initialization...");

const RouterLayout = () => {
  console.log("Rendering RouterLayout...");
  return (
    <Layout>
      <ScrollRestoration />
      <Outlet />
    </Layout>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RouterLayout />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/product",
        element: <Product />,
      },
      {
        path: "/product/:id",
        element: <Product />,
      },
      {
        path: "/category",
        element: <Category />,
      },
      {
        path: "/category/:id",
        element: <Category />,
      },
      {
        path: "/kitchen",
        element: <Kitchen />,
      },
      {
        path: "/kitchen/:id",
        element: <Kitchen />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/orders",
        element: <Orders />,
      },
      {
        path: "/success",
        element: <Success />,
      },
      {
        path: "/cancel",
        element: <Cancel />,
      },
      {
        path: "/test-api",
        element: <TestApi />,
      },
      {
        path: "/admin/login",
        element: <AdminLogin />,
      },

      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "orders",
        element: <AdminOrders />,
      },
      {
        path: "users",
        element: <AdminUsers />,
      },
      {
        path: "products",
        element: <AdminProducts />,
      },
      {
        path: "categories",
        element: <AdminCategories />,
      },
    ],
  },
]);

const rootElement = document.getElementById("root");
console.log("Root element:", rootElement);

if (!rootElement) {
  console.error("Failed to find root element");
} else {
  console.log("Creating root...");
  const root = ReactDOM.createRoot(rootElement);
  console.log("Rendering app...");
  root.render(<RouterProvider router={router} />);
  console.log("App rendered");
}
