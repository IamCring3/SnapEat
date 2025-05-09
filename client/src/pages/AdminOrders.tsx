import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import Loading from "../ui/Loading";
import { FaEye, FaPhone, FaUser, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";
import toast from "react-hot-toast";

interface OrderItem {
  _id: number;
  name: string;
  quantity: number;
  regularPrice: number;
  discountedPrice: number;
  images: [string];
}

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phoneNumber: string;
}

interface Order {
  paymentId: string;
  userEmail: string;
  phoneNumber?: string;
  userName?: string;
  paymentMethod: string;
  orderDate: string;
  orderItems: OrderItem[];
  userId?: string;
  totalAmount?: number;
  shippingAddress?: ShippingAddress;
  shippingCost?: number;
  taxAmount?: number;
  status?: string;
  cod?: boolean;
}

const AdminOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all"); // all, razorpay, stripe, cod
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData: Order[] = [];

      // 1. Fetch from regular orders collection
      const ordersCollection = collection(db, "orders");
      const ordersSnapshot = await getDocs(ordersCollection);

      ordersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.orders && Array.isArray(data.orders)) {
          data.orders.forEach((order: Order) => {
            // Set default status if not present
            if (!order.status) {
              order.status = "Processing";
            }
            ordersData.push(order);
          });
        }
      });

      // 2. Fetch from temp_orders collection
      const tempOrdersCollection = collection(db, "temp_orders");
      const tempOrdersSnapshot = await getDocs(tempOrdersCollection);

      tempOrdersSnapshot.forEach((doc) => {
        const tempOrderData = doc.data();
        // Format the temp order to match the regular order structure
        const formattedOrder: Order = {
          paymentId: tempOrderData.paymentId,
          orderItems: tempOrderData.orderItems,
          paymentMethod: tempOrderData.paymentMethod,
          orderDate: tempOrderData.orderDate,
          totalAmount: tempOrderData.totalAmount,
          shippingAddress: tempOrderData.shippingAddress,
          userEmail: tempOrderData.userEmail,
          phoneNumber: tempOrderData.phoneNumber,
          userName: tempOrderData.userName,
          userId: tempOrderData.userId,
          status: tempOrderData.status || "Processing"
        };

        ordersData.push(formattedOrder);
      });

      // Sort by date (newest first)
      ordersData.sort((a, b) => {
        const dateA = new Date(a.orderDate || 0).getTime();
        const dateB = new Date(b.orderDate || 0).getTime();
        return dateB - dateA;
      });

      console.log("Total orders fetched:", ordersData.length);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filter === "all"
    ? orders
    : filter === "cod"
      ? orders.filter(order => order.cod === true)
      : orders.filter(order => order.paymentMethod === filter);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const updateOrderStatus = async (status: string) => {
    if (!selectedOrder) return;

    try {
      setUpdatingStatus(true);

      // Find the order in Firestore
      const ordersCollection = collection(db, "orders");
      const ordersSnapshot = await getDocs(ordersCollection);

      let updated = false;

      // Loop through all user order documents
      for (const docSnapshot of ordersSnapshot.docs) {
        const userData = docSnapshot.data();

        if (userData.orders && Array.isArray(userData.orders)) {
          // Find the specific order by paymentId
          const orderIndex = userData.orders.findIndex(
            (order: Order) => order.paymentId === selectedOrder.paymentId
          );

          if (orderIndex !== -1) {
            // Update the order status
            const updatedOrders = [...userData.orders];
            updatedOrders[orderIndex] = {
              ...updatedOrders[orderIndex],
              status: status
            };

            // Update the document in Firestore
            const docRef = doc(db, "orders", docSnapshot.id);
            await updateDoc(docRef, { orders: updatedOrders });

            // Update local state
            setOrders(prevOrders =>
              prevOrders.map(order =>
                order.paymentId === selectedOrder.paymentId
                  ? { ...order, status: status }
                  : order
              )
            );

            // Update selected order
            setSelectedOrder({ ...selectedOrder, status: status });

            updated = true;
            toast.success(`Order status updated to ${status}`);
            break;
          }
        }
      }

      // Also check temp_orders collection
      if (!updated) {
        const tempOrdersCollection = collection(db, "temp_orders");
        const tempOrdersSnapshot = await getDocs(tempOrdersCollection);

        for (const docSnapshot of tempOrdersSnapshot.docs) {
          const orderData = docSnapshot.data();

          if (orderData.paymentId === selectedOrder.paymentId) {
            // Update the order status
            const docRef = doc(db, "temp_orders", docSnapshot.id);
            await updateDoc(docRef, { status: status });

            // Update local state
            setOrders(prevOrders =>
              prevOrders.map(order =>
                order.paymentId === selectedOrder.paymentId
                  ? { ...order, status: status }
                  : order
              )
            );

            // Update selected order
            setSelectedOrder({ ...selectedOrder, status: status });

            toast.success(`Order status updated to ${status}`);
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("razorpay")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "razorpay"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Razorpay
          </button>

          <button
            onClick={() => setFilter("cod")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "cod"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Cash on Delivery
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => {
                  // Calculate total
                  const total = order.totalAmount || order.orderItems?.reduce((sum, item) => {
                    return sum + (item.discountedPrice || item.regularPrice || 0) * (item.quantity || 1);
                  }, 0) || 0;

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.paymentId?.substring(0, 10)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.userName || order.userEmail || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.paymentMethod === "razorpay"
                            ? "bg-blue-100 text-blue-800"
                            : order.paymentMethod === "cod"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-green-100 text-green-800"
                        }`}>
                          {order.cod ? "Cash on Delivery" : order.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          !order.status || order.status === "Processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : order.status === "Pending Approval"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {order.status || "Processing"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.orderItems?.length || 0} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-primary hover:text-primary-dark flex items-center gap-1"
                        >
                          <FaEye className="text-sm" /> View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Order Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Order Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Order Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Order ID:</span> {selectedOrder.paymentId}</p>
                    <p><span className="font-medium">Date:</span> {new Date(selectedOrder.orderDate).toLocaleString()}</p>
                    <p><span className="font-medium">Payment Method:</span> {selectedOrder.cod ? "Cash on Delivery" : selectedOrder.paymentMethod}</p>
                    {selectedOrder.cod && (
                      <p className="text-orange-600 font-medium">This is a Cash on Delivery order</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-medium">Status:</span>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedOrder.status || "Processing"}
                          onChange={(e) => updateOrderStatus(e.target.value)}
                          disabled={updatingStatus}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          {selectedOrder.cod && selectedOrder.status === "Pending Approval" ? (
                            <>
                              <option value="Pending Approval">Pending Approval</option>
                              <option value="Approved">Approve Order</option>
                              <option value="Rejected">Reject Order</option>
                            </>
                          ) : (
                            <>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </>
                          )}
                        </select>
                        {updatingStatus && <span className="text-xs text-gray-500">Updating...</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <FaUser className="text-gray-500" />
                      <span className="font-medium">Name:</span> {selectedOrder.userName || "N/A"}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaEnvelope className="text-gray-500" />
                      <span className="font-medium">Email:</span> {selectedOrder.userEmail || "N/A"}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaPhone className="text-gray-500" />
                      <span className="font-medium">Phone:</span> {selectedOrder.phoneNumber || "N/A"}
                    </p>
                    {selectedOrder.userId && (
                      <p><span className="font-medium">User ID:</span> {selectedOrder.userId}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-500" />
                    Shipping Address
                  </h3>
                  <div className="space-y-1">
                    <p>{selectedOrder.shippingAddress.fullName}</p>
                    <p>{selectedOrder.shippingAddress.address}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</p>
                    <p>Phone: {selectedOrder.shippingAddress.phoneNumber}</p>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.orderItems.map((item, index) => {
                        const itemPrice = item.discountedPrice || item.regularPrice || 0;
                        const itemTotal = itemPrice * item.quantity;

                        return (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                {item.images && item.images[0] && (
                                  <img
                                    src={item.images[0]}
                                    alt={item.name}
                                    className="h-10 w-10 object-cover rounded-md mr-3"
                                  />
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                  <div className="text-xs text-gray-500">ID: {item._id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              ₹{itemPrice.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              ₹{itemTotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.orderItems.reduce((sum, item) =>
                      sum + (item.discountedPrice || item.regularPrice || 0) * item.quantity, 0).toFixed(2)}</span>
                  </div>
                  {selectedOrder.shippingCost !== undefined && (
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>₹{selectedOrder.shippingCost.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.taxAmount !== undefined && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>₹{selectedOrder.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t border-gray-300">
                    <span>Total:</span>
                    <span>₹{(selectedOrder.totalAmount || selectedOrder.orderItems.reduce((sum, item) =>
                      sum + (item.discountedPrice || item.regularPrice || 0) * item.quantity, 0) +
                      (selectedOrder.shippingCost || 0) + (selectedOrder.taxAmount || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
