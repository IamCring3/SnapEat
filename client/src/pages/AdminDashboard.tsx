import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import Loading from "../ui/Loading";

interface Order {
  paymentId: string;
  userEmail: string;
  paymentMethod: string;
  orderDate: string;
  orderItems: any[];
}

interface User {
  id: string;
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: string;
}

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch orders
      const ordersCollection = collection(db, "orders");
      const ordersSnapshot = await getDocs(ordersCollection);
      const ordersData: Order[] = [];
      let totalRevenue = 0;

      ordersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.orders && Array.isArray(data.orders)) {
          data.orders.forEach((order: Order) => {
            ordersData.push(order);
            // Calculate revenue if order items have price
            if (order.orderItems && Array.isArray(order.orderItems)) {
              order.orderItems.forEach(item => {
                totalRevenue += (item.discountedPrice || item.price || 0) * (item.quantity || 1);
              });
            }
          });
        }
      });

      setOrders(ordersData);

      // Fetch users
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersData: User[] = [];

      usersSnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as User);
      });

      setUsers(usersData);

      // Set stats
      setStats({
        totalOrders: ordersData.length,
        totalUsers: usersData.length,
        totalRevenue: totalRevenue,
        recentOrders: ordersData.filter(order => {
          const orderDate = new Date(order.orderDate || 0);
          const now = new Date();
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= oneWeekAgo;
        }).length
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase mb-2">Total Orders</h2>
          <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase mb-2">Total Users</h2>
          <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase mb-2">Total Revenue</h2>
          <p className="text-3xl font-bold text-gray-900">₹{stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm font-medium uppercase mb-2">Recent Orders</h2>
          <p className="text-3xl font-bold text-gray-900">{stats.recentOrders}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.slice(0, 5).map((order, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.paymentId?.substring(0, 10)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.userEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.orderItems?.length || 0} items
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Stats */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">User Statistics</h2>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">User Types</h3>
            <div className="bg-gray-100 p-4 rounded-md">
              <div className="flex justify-between mb-2">
                <span>Regular Users</span>
                <span>{users.filter(user => !user.role || user.role !== 'admin').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Admin Users</span>
                <span>{users.filter(user => user.role === 'admin').length}</span>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">Authentication Methods</h3>
            <div className="bg-gray-100 p-4 rounded-md">
              <div className="flex justify-between mb-2">
                <span>Email/Password</span>
                <span>{users.filter(user => user.email).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone Number</span>
                <span>{users.filter(user => user.phoneNumber).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
