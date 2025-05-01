import { Router } from "express";
import crypto from 'crypto';

const router = Router();

// Razorpay test keys
const RAZORPAY_KEY_ID = "rzp_test_C9xDgkosiD7b6l";
const RAZORPAY_KEY_SECRET = "N1AIv5WW7anORvIpuXkuxgIk";

// Create order endpoint
router.post("/razorpay/create-order", async (req, res) => {
  try {
    const { amount, email } = req.body;

    // Initialize Razorpay - we're doing this inline since we don't have the package installed yet
    // In production, you would use: const razorpay = new Razorpay({ key_id, key_secret });
    const razorpayOrderUrl = "https://api.razorpay.com/v1/orders";

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
