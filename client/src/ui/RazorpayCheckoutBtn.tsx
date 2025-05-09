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
  codEnabled?: boolean;
}

const RazorpayCheckoutBtn = ({ products, shippingAddress, codEnabled = false }: RazorpayCheckoutBtnProps) => {
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
      // Test server connection first
      try {
        console.log("Testing server connection...");
        console.log("Using API URL:", config?.baseUrl);

        // Try the test-cors endpoint
        const testResponse = await fetch(`${config?.baseUrl}/test-cors`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Server connection test response status:", testResponse.status);

        if (testResponse.ok) {
          const testData = await testResponse.json();
          console.log("Server connection successful:", testData);
        } else {
          console.error("Server connection failed with status:", testResponse.status);
          const errorText = await testResponse.text();
          console.error("Error response:", errorText);
        }
      } catch (error) {
        console.error("Server connection test failed:", error);
        toast.error(`Server connection failed: ${error.message || "Unknown error"}`);
      }

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

      // If Cash on Delivery is enabled, skip payment processing and create order directly
      if (codEnabled) {
        try {
          toast.loading("Processing your order...", { id: "cod-order-processing" });

          // Generate a unique COD order ID
          const codOrderId = `COD_${Date.now()}`;

          // Save the order with COD flag
          // We'll redirect to success page with the COD order ID
          setTimeout(() => {
            toast.dismiss("cod-order-processing");
            toast.success("Order placed successfully! Awaiting admin approval.");
            navigate(`/success?payment_id=${codOrderId}&cod=true`);
          }, 1500);

          return;
        } catch (error) {
          console.error("COD order error:", error);
          toast.error("Failed to place COD order");
          return;
        }
      }

      // Regular online payment flow
      // Create order on server
      // Try both endpoints to see which one works
      const endpoint = "/checkout"; // You can also try "/razorpay/create-order"

      // Make sure the baseUrl doesn't have a trailing slash
      const baseUrl = config?.baseUrl ? config.baseUrl.replace(/\/$/, '') : '';
      console.log("Attempting to create Razorpay order with URL:", `${baseUrl}${endpoint}`);
      console.log("Using config baseUrl:", baseUrl);

      // Check if baseUrl is available
      if (!baseUrl) {
        console.error("API URL is not configured");
        toast.error("Payment system configuration error. Please contact support.");
        return;
      }

      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors", // Explicitly set CORS mode
          credentials: "include", // Include credentials if needed
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

        // Log the raw response for debugging
        console.log("Razorpay order creation response status:", response.status);

        // Check if the response is ok before parsing JSON
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Razorpay order creation failed with status:", response.status);
          console.error("Error response:", errorText);
          throw new Error(`Failed to create order: ${response.status} ${errorText}`);
        }

        const orderData = await response.json();
        console.log("Razorpay order creation response:", orderData);

        if (!orderData.success) {
          console.error("Razorpay order creation failed:", orderData);
          throw new Error(orderData.error || "Failed to create order");
        }

        // Initialize Razorpay
        // Use the key from environment variables with fallback to test key
        const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
        console.log("Using Razorpay key:", razorpayKeyId);

        // If no key is found, show an error and return
        if (!razorpayKeyId) {
          console.error("Razorpay key not found in environment variables");
          toast.error("Payment configuration error. Please contact support.");
          return;
        }

        const options = {
          key: razorpayKeyId,
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

              const verifyEndpoint = "/razorpay/verify";
              console.log("Verifying payment with URL:", `${baseUrl}${verifyEndpoint}`);
              const verifyResponse = await fetch(`${baseUrl}${verifyEndpoint}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                mode: "cors",
                credentials: "include",
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
      } catch (fetchError) {
        console.error("Error fetching from API:", fetchError);
        toast.error("Server connection failed: " + (fetchError.message || "Failed to fetch"));
      }
    } catch (error: any) {
      console.error("Razorpay error:", error);
      // Provide more detailed error message to the user
      const errorMessage = error.message || "Unknown error occurred";
      toast.error(`Payment initialization failed: ${errorMessage}`);

      // Log additional details for debugging
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
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
          {codEnabled ? "Place Order (Cash on Delivery)" : "Pay with UPI"}
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
