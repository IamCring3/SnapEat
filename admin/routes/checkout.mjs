import { Router } from "express";
import Razorpay from "razorpay";
import crypto from 'crypto';
const router = Router();

// Get Razorpay keys from environment variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Check if Razorpay keys are available
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.error("Razorpay keys not found in environment variables");
}

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

// Create order endpoint
router.post("/checkout", async (req, res) => {
  try {
    console.log("Received checkout request:", req.body);

    const {
      items,
      email,
      amount,
      shippingAddress,
      userId,
      userName,
      phoneNumber
    } = req.body;

    // Calculate total amount if not provided
    let totalAmount = amount;
    if (!totalAmount) {
      console.log("Amount not provided, calculating from items:", items);
      totalAmount = items.reduce(
        (sum, item) => sum + (item.discountedPrice || item.price) * (item.quantity || 1) * 100,
        0
      );
      console.log("Calculated total amount:", totalAmount);
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(totalAmount), // amount in smallest currency unit (paise for INR)
      currency: "INR", // change as needed
      receipt: `receipt_${Date.now()}`,
      notes: {
        email: email || "",
        userId: userId || "",
        userName: userName || "",
        phoneNumber: phoneNumber || "",
        shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : "",
      },
    };

    console.log("Creating Razorpay order with options:", options);
    console.log("Using Razorpay credentials - Key ID:", RAZORPAY_KEY_ID);

    // Check if Razorpay keys are available
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error("Razorpay keys not found in environment variables");
      return res.status(500).json({
        error: "Payment configuration error. Please contact support.",
        success: false
      });
    }

    try {
      const order = await razorpay.orders.create(options);
      console.log("Razorpay order created successfully:", order);

      res.json({
        message: "Order created successfully",
        success: true,
        order: order,
      });
    } catch (razorpayError) {
      console.error("Razorpay API error:", razorpayError);
      res.status(500).json({
        error: `Razorpay API error: ${razorpayError.message}`,
        success: false
      });
    }
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      error: error.message,
      success: false,
      details: "Server error during order creation"
    });
  }
});

// Verify payment signature
router.post("/razorpay/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    console.log("Payment verification request received:");
    console.log("Order ID:", razorpay_order_id);
    console.log("Payment ID:", razorpay_payment_id);
    console.log("Signature:", razorpay_signature);

    // Validate required parameters
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("Missing required parameters");
      return res.status(400).json({
        success: false,
        message: "Missing required parameters for payment verification"
      });
    }

    // Create signature verification payload
    const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    console.log("Generated signature:", generatedSignature);
    console.log("Signatures match:", generatedSignature === razorpay_signature);

    // Verify signature
    if (generatedSignature === razorpay_signature) {
      console.log("Payment verification successful");

      // For test mode, always return success
      // In production, you might want to fetch the payment details from Razorpay API
      // to confirm the payment status

      res.json({
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    } else {
      console.log("Payment verification failed - signatures don't match");
      res.status(400).json({
        success: false,
        message: "Payment verification failed - signature mismatch",
      });
    }
  } catch (error) {
    console.error("Razorpay verification error:", error);
    console.error("Verification error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: "Server error during payment verification",
      error: error.message
    });
  }
});

export default router;
