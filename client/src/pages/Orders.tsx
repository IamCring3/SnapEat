import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { OrderTypes, ProductProps } from "../../type";
import { db } from "../lib/firebase";
import { store } from "../lib/store";
import Container from "../ui/Container";
import FormattedPrice from "../ui/FormattedPrice";
import Loading from "../ui/Loading";

const Orders = () => {
  const { currentUser } = store();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        // Make sure we have a user ID
        if (!currentUser?.id) {
          console.log("No user ID available for fetching orders");
          setLoading(false);
          return;
        }

        console.log("Fetching orders for user ID:", currentUser.id);
        let allOrders = [];

        // 1. Check the regular orders collection first
        const docRef = doc(db, "orders", currentUser.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const orderData = docSnap?.data()?.orders;
          console.log("Orders document exists with data:", docSnap.data());
          console.log("Orders found in regular collection:", orderData?.length || 0);

          if (Array.isArray(orderData)) {
            allOrders = [...orderData];
          }
        } else {
          console.log("No orders document found in regular collection for user ID:", currentUser.id);
        }

        // 2. Check the temporary orders collection
        console.log("Checking temporary orders collection");
        const tempOrdersRef = collection(db, "temp_orders");
        const q = query(tempOrdersRef, where("userId", "==", currentUser.id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          console.log("Found orders in temporary collection:", querySnapshot.size);

          querySnapshot.forEach((doc) => {
            const tempOrderData = doc.data();
            console.log("Temporary order:", tempOrderData);

            // Format the temp order to match the regular order structure
            const formattedOrder = {
              paymentId: tempOrderData.paymentId,
              orderItems: tempOrderData.orderItems,
              paymentMethod: tempOrderData.paymentMethod,
              orderDate: tempOrderData.orderDate,
              totalAmount: tempOrderData.totalAmount,
              shippingAddress: tempOrderData.shippingAddress,
              userEmail: tempOrderData.userEmail,
              phoneNumber: tempOrderData.phoneNumber,
              userName: tempOrderData.userName,
              userId: tempOrderData.userId
            };

            allOrders.push(formattedOrder);
          });
        } else {
          console.log("No orders found in temporary collection");
        }

        // 3. Set all orders
        console.log("Total orders found:", allOrders.length);
        setOrders(allOrders);

      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      getData();
    }
  }, [currentUser]);
  return (
    <Container>
      {loading ? (
        <Loading />
      ) : orders?.length > 0 ? (
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mt-1">Customer order details</h2>
          <p className="text-gray-600">
            Customer Name{" "}
            <span className="text-black font-semibold">
              {currentUser?.firstName} {currentUser?.lastName}
            </span>
          </p>
          <p className="text-gray-600">
            Total Orders{" "}
            <span className="text-black font-semibold">{orders?.length}</span>
          </p>
          <p className="text-sm max-w-[600px] tracking-wide text-gray-500">

          </p>
          <div className="flex flex-col gap-3">
            <div className="space-y-6 divide-y divide-gray-900/10">
              {orders?.map((order: OrderTypes) => {
                const totalAmt = order?.orderItems.reduce(
                  (acc, item) =>
                    acc + (item?.discountedPrice * item?.quantity || 0),
                  0
                );
                return (
                  <Disclosure as="div" key={order?.paymentId} className="pt-6">
                    {({ open }) => (
                      <>
                        <dt>
                          <DisclosureButton className="flex w-full items-center justify-between text-left text-gray-900">
                            <span className="text-base font-semibold leading-7">
                              Tracking number:{" "}
                              <span className="font-normal">
                                {order?.paymentId}
                              </span>
                            </span>
                            <span>{open ? <FaMinus /> : <FaPlus />}</span>
                          </DisclosureButton>
                        </dt>
                        <DisclosurePanel as="dd" className="mt-5 pr-12">
                          <div className="flex flex-col gap-2 bg-[#f4f4f480] p-5 border border-gray-200">
                            <p className="text-base font-semibold">
                              Your order{" "}
                              <span className="text-skyText">
                                #{order?.paymentId.substring(0, 20)}...
                              </span>{" "}
                              has shipped and will be with you soon.
                            </p>
                            <div className="flex flex-col gap-1">
                              <p className="text-gray-600">
                                Order Item Count:{" "}
                                <span className="text-black font-medium">
                                  {order?.orderItems?.length}
                                </span>
                              </p>
                              <p className="text-gray-600">
                                Payment Status:{" "}
                                <span className="text-black font-medium">
                                  Paid by {order?.paymentMethod === 'razorpay' ? 'Razorpay' : 'Stripe'}
                                </span>
                              </p>
                              <p className="text-gray-600">
                                Order Amount:{" "}
                                <span className="text-black font-medium">
                                  <FormattedPrice amount={totalAmt} />
                                </span>
                              </p>

                              {order?.shippingAddress && (
                                <div className="mt-2">
                                  <p className="text-gray-600 font-medium">Shipping Address:</p>
                                  <p className="text-sm text-gray-700">{order.shippingAddress.fullName}</p>
                                  <p className="text-sm text-gray-700">{order.shippingAddress.addressLine1}</p>
                                  {order.shippingAddress.addressLine2 && (
                                    <p className="text-sm text-gray-700">{order.shippingAddress.addressLine2}</p>
                                  )}
                                  <p className="text-sm text-gray-700">
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                                  </p>
                                  <p className="text-sm text-gray-700">{order.shippingAddress.country}</p>
                                  <p className="text-sm text-gray-700">{order.shippingAddress.phoneNumber}</p>
                                </div>
                              )}
                            </div>
                            {order?.orderItems?.map((item: ProductProps) => (
                              <div
                                key={item?._id}
                                className="flex space-x-6 border-b border-gray-200 py-3"
                              >
                                <Link
                                  to={`/product/${item?._id}`}
                                  className="h-20 w-20 flex-none sm:h-40 sm:w-40 rounded-lg bg-gray-100 border border-gray-300 hover:border-skyText overflow-hidden"
                                >
                                  <img
                                    src={item?.images[0]}
                                    alt="productImg"
                                    className="h-full w-full object-cover object-center hover:scale-110 duration-300"
                                  />
                                </Link>
                                <div className="flex flex-auto flex-col">
                                  <div>
                                    <Link
                                      to={`/product/${item?._id}`}
                                      className="font-medium text-gray-900"
                                    >
                                      {item?.name}
                                    </Link>
                                    <p className="mt-2 text-sm text-gray-900">
                                      {item?.description}
                                    </p>
                                  </div>
                                  <div className="mt-6 flex flex-1 items-end">
                                    <dl className="flex space-x-4 divide-x divide-gray-200 text-sm sm:space-x-6">
                                      <div className="flex">
                                        <dt className="font-medium text-gray-900">
                                          Quantity
                                        </dt>
                                        <dd className="ml-2 text-gray-700">
                                          {item?.quantity}
                                        </dd>
                                      </div>
                                      <div className="flex pl-4 sm:pl-6">
                                        <dt className="text-black font-bold">
                                          Price
                                        </dt>
                                        <dd className="ml-2 text-gray-700">
                                          <span className="text-black font-bold">
                                            <FormattedPrice
                                              amount={item?.discountedPrice}
                                            />
                                          </span>
                                        </dd>
                                      </div>
                                      <div className="flex pl-4 sm:pl-6">
                                        <dt className="font-medium text-gray-900">
                                          SubTotal
                                        </dt>
                                        <dd className="ml-2 text-gray-700">
                                          <span className="text-black font-bold">
                                            <FormattedPrice
                                              amount={
                                                item?.discountedPrice *
                                                item?.quantity
                                              }
                                            />
                                          </span>
                                        </dd>
                                      </div>
                                    </dl>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </DisclosurePanel>
                      </>
                    )}
                  </Disclosure>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <p className="text-2xl font-semibold">No orders yet</p>
          <p>You did not create any purchase from us</p>
          <Link
            to={"/product"}
            className="mt-2 bg-red-600 text-gray-200 px-8 py-4 rounded-md border-2 border-transparent hover:bg-white hover:text-red-600 hover:border-2 hover:border-red-600 duration-200 uppercase text-sm font-semibold tracking-wide"
          >
            Go to Shopping
          </Link>
        </div>
      )}
    </Container>
  );
};

export default Orders;
