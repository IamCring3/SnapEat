import { Router } from "express";
import crypto from 'crypto';

const router = Router();

// Get Razorpay keys from environment variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Check if Razorpay keys are available
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.error("Razorpay keys not found in environment variables");
}

// Create order endpoint
router.post("/razorpay/create-order", async (req, res) => {
  try {
    const { amount, email } = req.body;

    // Check if Razorpay keys are available
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error("Razorpay keys not found in environment variables");
      return res.status(500).json({
        error: "Payment configuration error. Please contact support.",
        success: false
      });
    }

    // Initialize Razorpay with environment variables
    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });

    // Create Razorpay order
    const options = {
      amount: amount, // amount in smallest currency unit (paise for INR)
      currency: "INR", // change as needed
      receipt: `receipt_${Date.now()}`,
      notes: {
        email: email,
      },
    };

    // Make API call to Razorpay
    const response = await fetch(razorpayOrderUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')
      },
      body: JSON.stringify(options)
    });

    const order = await response.json();

    if (order.error) {
      throw new Error(order.error.description);
    }

    res.json({
      success: true,
      order: order,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({ error: error.message });
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

    // Check if Razorpay keys are available
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error("Razorpay keys not found in environment variables");
      return res.status(500).json({
        error: "Payment configuration error. Please contact support.",
        success: false
      });
    }

    console.log("Verifying payment with Razorpay Key Secret");

    // Create signature verification payload
    const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    // Verify signature
    if (generatedSignature === razorpay_signature) {
      res.json({
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Razorpay verification error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
