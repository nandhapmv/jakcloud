import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Dynamically loads the Razorpay Standard Checkout script if not already present
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay checkout script.");
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface RazorpayOrderResult {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface RazorpayPaymentSuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/**
 * Initiates Razorpay checkout flow
 */
export async function openRazorpayCheckout({
  amount,
  customerName,
  customerEmail,
  customerPhone,
  description = "Handcrafted Dum Biryani Handi Tray Booking",
  notes = {},
}: {
  amount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  description?: string;
  notes?: Record<string, string>;
}): Promise<RazorpayPaymentSuccess> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    throw new Error("Unable to load Razorpay Checkout. Please check your internet connection.");
  }

  // 1. Create order on backend Express API
  const apiBase = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000/api";
  const orderRes = await fetch(`${apiBase}/razorpay/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      currency: "USD",
      notes: {
        customerName,
        customerPhone,
        ...notes,
      },
    }),
  });

  const orderData: RazorpayOrderResult = await orderRes.json();
  if (!orderRes.ok || !orderData.orderId) {
    throw new Error((orderData as any).error || "Failed to initialize payment gateway order.");
  }

  // 2. Open Razorpay modal and await response
  return new Promise((resolve, reject) => {
    const options = {
      key: orderData.keyId || "rzp_test_SwedUUn1KgRMs0",
      amount: orderData.amount,
      currency: orderData.currency || "USD",
      name: "JAKLOUD Spice King Dum Biryani",
      description,
      image: "/logo.png",
      order_id: orderData.orderId,
      prefill: {
        name: customerName,
        email: customerEmail || "customer@jakloud.com",
        contact: customerPhone.replace(/\D/g, ""),
      },
      notes: {
        store: "3625 S Bedford Ave, Springfield, MO",
        ...notes,
      },
      theme: {
        color: "#d97706", // Amber 600 royal gold
      },
      modal: {
        ondismiss: function () {
          toast.info("Payment window was dismissed. You can try again when ready.");
          reject(new Error("Payment cancelled by user"));
        },
      },
      handler: async function (response: RazorpayPaymentSuccess) {
        try {
          // 3. Verify payment signature on backend
          const verifyRes = await fetch(`${apiBase}/razorpay/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.verified) {
            throw new Error(verifyData.error || "Payment signature verification failed.");
          }

          resolve(response);
        } catch (vErr: any) {
          reject(vErr);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response: any) {
      console.error("Razorpay Payment Failure:", response.error);
      const desc = response.error?.description || "Payment failed or was declined.";
      toast.error(`Payment Failed: ${desc}`);
      reject(new Error(desc));
    });

    rzp.open();
  });
}
