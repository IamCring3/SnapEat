import { Link, useLocation, useNavigate } from "react-router-dom";
import { store } from "../lib/store";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { arrayUnion, collection, doc, getDoc, setDoc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import Container from "../ui/Container";
import Loading from "../ui/Loading";

const Success = () => {
  const { currentUser, cartProduct, resetCart } = store();
  const location = useLocation();
  const paymentId = new URLSearchParams(location.search).get("payment_id");
  const isCod = new URLSearchParams(location.search).get("cod") === "true";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("Success page loaded with paymentId:", paymentId, "isCod:", isCod);
    console.log("Cart products:", cartProduct);
    console.log("Current user state:", currentUser);

    if (!paymentId) {
      console.log("No paymentId found, redirecting to home");
      navigate("/");
    } else if (cartProduct.length > 0) {
      console.log("Cart has products, proceeding to save order");

      // Function to save order with retry mechanism
      const saveOrder = async (retryCount = 0, maxRetries = 3) => {
        try {
          setLoading(true);
          console.log("Attempting to save order...");
          console.log("Current user:", currentUser);

          // Wait for user data to be available if it's not yet loaded
          if (!currentUser?.id) {
            console.log("User ID not found, waiting for user data to load...");
            // Wait a bit and check again - the user might still be loading
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log("After waiting, current user:", currentUser);

            // If still no user ID, show a more user-friendly error
            if (!currentUser?.id) {
              console.error("Still no user ID after waiting");
              throw new Error("Unable to save your order. Please try again or contact support.");
            }
          }

          const orderRef = doc(db, "orders", currentUser.id);
          const docSnap = await getDoc(orderRef);

          // Determine payment method and ID
          const paymentMethod = isCod ? "cod" : "razorpay";
          const finalPaymentId = paymentId;

          console.log("Payment method:", paymentMethod);
          console.log("Payment ID:", finalPaymentId);
          console.log("Cart products:", cartProduct.length);
          console.log("Saving order for user ID:", currentUser.id);

          // Try to get shipping address from localStorage
          let shippingAddress = null;
          try {
            const savedAddress = localStorage.getItem('lastShippingAddress');
            if (savedAddress) {
              shippingAddress = JSON.parse(savedAddress);
            }
          } catch (error) {
            console.error("Error retrieving shipping address:", error);
          }

          const orderData = {
            userEmail: currentUser?.email || null,
            phoneNumber: currentUser?.phoneNumber || null,
            userName: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim(),
            paymentId: finalPaymentId,
            orderItems: cartProduct,
            paymentMethod: paymentMethod,
            userId: currentUser.id,
            orderDate: new Date().toISOString(),
            totalAmount: cartProduct.reduce((sum, item) => sum + ((item.discountedPrice || item.regularPrice) * item.quantity), 0),
            shippingAddress: shippingAddress,
            shippingCost: 25,
            taxAmount: 15,
            cod: isCod,
            status: isCod ? "Pending Approval" : "Processing"
          };

          if (docSnap.exists()) {
            console.log("Updating existing order document");
            console.log("Existing orders:", docSnap.data()?.orders?.length || 0);

            // Document exists, update the orderItems array
            try {
              await updateDoc(orderRef, {
                orders: arrayUnion(orderData),
              });
              console.log("Order document updated successfully");
            } catch (updateError) {
              console.error("Error updating order document:", updateError);
              throw updateError;
            }
          } else {
            console.log("Creating new order document");
            // Document doesn't exist, create a new one
            try {
              await setDoc(orderRef, {
                orders: [orderData],
              });
              console.log("New order document created successfully");
            } catch (setError) {
              console.error("Error creating order document:", setError);
              throw setError;
            }
          }

          console.log("Order saved successfully with data:", {
            userId: currentUser.id,
            paymentId: finalPaymentId,
            items: cartProduct.length,
            total: orderData.totalAmount
          });

          toast.success("Payment accepted successfully & order saved!");
          resetCart();
        } catch (error: any) {
          console.error("Error saving order data:", error);

          // Check if it's a permissions error
          const isPermissionError = error.message && error.message.includes("permission");

          if (isPermissionError) {
            console.log("Permission error detected. Trying alternative approach...");

            try {
              // Try a different approach - create a temporary document with a random ID
              const tempOrdersCollection = collection(db, "temp_orders");
              await addDoc(tempOrdersCollection, {
                userId: currentUser.id,
                paymentId: finalPaymentId,
                orderItems: cartProduct,
                paymentMethod: paymentMethod,
                orderDate: new Date().toISOString(),
                totalAmount: orderData.totalAmount,
                shippingAddress: orderData.shippingAddress,
                userEmail: currentUser?.email || null,
                phoneNumber: currentUser?.phoneNumber || null,
                userName: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim(),
                cod: isCod,
                status: isCod ? "Pending Approval" : "Processing"
              });

              console.log("Order saved to temporary collection");
              toast.success("Payment accepted! Your order has been saved.");
              resetCart();
              return; // Exit the function after successful save
            } catch (tempError) {
              console.error("Error saving to temporary collection:", tempError);
              // Continue with retry logic
            }
          }

          // Retry logic for other errors
          if (retryCount < maxRetries) {
            console.log(`Retrying order save (${retryCount + 1}/${maxRetries})...`);
            setLoading(false);
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 2000));
            return saveOrder(retryCount + 1, maxRetries);
          }

          toast.error(`Error saving order data: ${error.message || "Unknown error"}`);
        } finally {
          setLoading(false);
        }
      };

      // Start the save order process
      saveOrder();
    }
  }, [paymentId, navigate, currentUser, cartProduct, resetCart, isCod]);

  // Function to manually check if order was saved
  const checkOrderStatus = async () => {
    if (!currentUser?.id) {
      toast.error("Please log in to check your order status");
      return;
    }

    setLoading(true);
    try {
      const orderRef = doc(db, "orders", currentUser.id);
      const docSnap = await getDoc(orderRef);

      if (docSnap.exists()) {
        const orderData = docSnap.data()?.orders || [];
        const paymentIdentifier = paymentId;

        // Check if the order with this payment ID exists
        const orderExists = orderData.some(
          (order: any) => order.paymentId === paymentIdentifier
        );

        if (orderExists) {
          toast.success("Your order was successfully saved! You can view it in your orders.");
        } else {
          toast.error("Your order was not found. Please contact customer support.");
        }
      } else {
        toast.error("No orders found for your account. Please contact customer support.");
      }
    } catch (error: any) {
      console.error("Error checking order status:", error);
      toast.error(`Error checking order: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {loading && <Loading />}
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-y-5">
        <h2 className="text-2xl md:text-4xl font-bold text-center">
          {loading
            ? "Your order payment is processing"
            : isCod
              ? "Your Order Has Been Placed"
              : "Your Payment Accepted by SnapEat"}
        </h2>
        <p>
          {loading
            ? "Once done"
            : isCod
              ? "Your cash on delivery order is awaiting approval"
              : "Now"} you can view your Orders or continue
          Shopping with us
        </p>
        <div className="flex items-center gap-x-5 flex-wrap justify-center">
          <Link to={"/orders"}>
            <button className="bg-black text-slate-100 w-52 h-12 rounded-full text-base font-semibold hover:bg-primeColor duration-300 m-2">
              View Orders
            </button>
          </Link>
          <Link to={"/"}>
            <button className="bg-black text-slate-100 w-52 h-12 rounded-full text-base font-semibold hover:bg-primeColor duration-300 m-2">
              Continue Shopping
            </button>
          </Link>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">Don't see your order? Click below to check:</p>
          <button
            onClick={checkOrderStatus}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 duration-300"
          >
            Check Order Status
          </button>
        </div>
      </div>
    </Container>
  );
};

export default Success;
