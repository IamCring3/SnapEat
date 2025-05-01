import { useEffect } from "react";
import { ProductProps } from "../../type";
import { store } from "../lib/store";
import { config } from "../../config";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ShippingAddressType } from "./ShippingAddressForm";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutBtnProps {
  products: ProductProps[];
  shippingAddress?: ShippingAddressType | null;
}

const RazorpayCheckoutBtn = ({ products, shippingAddress }: RazorpayCheckoutBtnProps) => {
  const { currentUser } = store();
  const navigate = useNavigate();

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleCheckout = async () => {
    try {
      // Check if shipping address is provided
      if (!shippingAddress) {
        toast.error("Please provide shipping address");
        return;
      }

      // Calculate total amount (including shipping and tax)
      const subtotal = products.reduce(
        (sum, item) => sum + (item.discountedPrice || item.price) * (item.quantity || 1),
        0
      );
      const shippingCost = 25; // Same as in Cart.tsx
      const taxAmount = 15; // Same as in Cart.tsx
      const totalAmount = subtotal + shippingCost + taxAmount;

      // Create order on server
      const response = await fetch(`${config?.baseUrl}/razorpay/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: products,
          email: currentUser?.email,
          amount: totalAmount * 100, // Convert to smallest currency unit (paise for INR)
          shippingAddress: shippingAddress,
          userId: currentUser?.id,
          userName: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim(),
          phoneNumber: currentUser?.phoneNumber || shippingAddress.phoneNumber,
        }),
      });

      const orderData = await response.json();

      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // Initialize Razorpay
      const options = {
        key: "rzp_test_C9xDgkosiD7b6l", // Razorpay test key
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "SnapEat",
        description: "Food Order Payment",
        order_id: orderData.order.id,
        handler: async function (response: any) {
          // Verify payment
          console.log("Payment response received:", response);
          try {
            // Show a toast to let the user know we're processing
            toast.loading("Verifying payment...", { id: "payment-verification" });

            const verifyResponse = await fetch(`${config?.baseUrl}/razorpay/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();
            console.log("Verification response:", verifyData);

            // Dismiss the loading toast
            toast.dismiss("payment-verification");

            if (verifyData.success) {
              toast.success("Payment successful!");

              // Add a small delay before redirecting to ensure the toast is seen
              // and to give the backend time to process
              setTimeout(() => {
                // Redirect to success page with payment ID
                navigate(`/success?payment_id=${verifyData.paymentId}`);
              }, 1000);
            } else {
              console.error("Payment verification failed:", verifyData);
              toast.error("Payment verification failed: " + (verifyData.message || "Unknown error"));
            }
          } catch (error: any) {
            // Dismiss the loading toast
            toast.dismiss("payment-verification");

            console.error("Error during payment verification:", error);
            toast.error("Error verifying payment: " + (error.message || "Unknown error"));
          }
        },
        prefill: {
          name: shippingAddress?.fullName || `${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`,
          email: currentUser?.email || "",
          contact: shippingAddress?.phoneNumber || currentUser?.phoneNumber || "",
          method: "upi"
        },
        theme: {
          color: "#DC2626", // Primary color from tailwind config
        },
        // Configure payment methods - only enable UPI
        config: {
          display: {
            blocks: {
              banks: {
                name: "Pay using UPI",
                instruments: [
                  {
                    method: "upi",
                    flow: "intent",
                    apps: ["google_pay", "phonepe", "paytm", "bhim"]
                  }
                ]
              }
            },
            sequence: ["block.banks"],
            preferences: {
              show_default_blocks: false
            }
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      toast.error("Payment initialization failed");
    }
  };

  return (
    <div className="mt-6">
      {currentUser ? (
        <button
          onClick={handleCheckout}
          type="submit"
          disabled={!shippingAddress}
          className={`w-full rounded-md border-2 border-transparent px-4 py-3 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-skyText focus:ring-offset-2 focus:ring-offset-gray-50 duration-300 ease-in ${
            !shippingAddress
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-primary hover:!bg-white hover:text-red-600 hover:border-red-600"
          }`}
        >
          Pay with UPI
        </button>
      ) : (
        <button className="w-full text-base text-white text-center rounded-md border border-transparent bg-gray-500 px-4 py-3 cursor-not-allowed">
          Checkout
        </button>
      )}
      {!currentUser && (
        <p className="mt-2 text-sm font-medium text-red-500 text-center">
          Need to sign in to make checkout
        </p>
      )}
      {currentUser && !shippingAddress && (
        <p className="mt-2 text-sm font-medium text-red-500 text-center">
          Please provide shipping address to continue
        </p>
      )}
    </div>
  );
};

export default RazorpayCheckoutBtn;
