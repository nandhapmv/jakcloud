import { Router } from "express";
import crypto from "crypto";
import { config } from "../config/index.js";
import { getPool } from "../config/database.js";

export const razorpayRouter = Router();

/**
 * POST /api/razorpay/create-order
 * Creates an official Razorpay Order in USD (cents)
 */
razorpayRouter.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "USD", receipt, notes = {} } = req.body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid amount in dollars is required.",
      });
    }

    // Convert dollars to cents (smallest unit for USD)
    const amountInSubunits = Math.round(amount * 100);

    const authHeader = Buffer.from(
      `${config.razorpay.keyId}:${config.razorpay.keySecret}`
    ).toString("base64");

    const payload = {
      amount: amountInSubunits,
      currency: currency.toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: {
        business: "JAKLOUD Spice King Dum Biryani",
        city: "Springfield, MO",
        ...notes,
      },
    };

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Razorpay API order creation failed:", data);
      return res.status(response.status).json({
        success: false,
        error: data.error?.description || "Failed to create Razorpay order",
      });
    }

    return res.json({
      success: true,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId: config.razorpay.keyId,
      receipt: data.receipt,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error while creating Razorpay order",
    });
  }
});

/**
 * POST /api/razorpay/verify-payment
 * Cryptographically verifies Razorpay payment signature
 */
razorpayRouter.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dbOrderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Missing required Razorpay payment verification fields.",
      });
    }

    const hmac = crypto.createHmac("sha256", config.razorpay.keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    const isAuthentic = generatedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "Invalid Razorpay payment signature. Payment verification failed.",
      });
    }

    // If a database orderId is provided, mark it as PAID in MySQL
    if (dbOrderId) {
      try {
        const pool = getPool();
        if (pool) {
          await pool.execute(
            `UPDATE orders SET payment_status = 'PAID', notes = CONCAT(COALESCE(notes, ''), ' [Razorpay Paid: ', ?, ']') WHERE id = ? OR order_number = ?`,
            [razorpay_payment_id, dbOrderId, dbOrderId]
          );
        }
      } catch (dbErr) {
        console.warn("DB payment status update warning:", dbErr);
      }
    }

    return res.json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      message: "Payment successfully verified.",
    });
  } catch (error: any) {
    console.error("Error verifying Razorpay payment:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to verify Razorpay payment",
    });
  }
});

/**
 * GET /api/razorpay/config
 * Exposes the public test Key ID for the frontend
 */
razorpayRouter.get("/config", (_req, res) => {
  res.json({
    keyId: config.razorpay.keyId,
    currency: "USD",
  });
});
