const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || "TEST10276606fbcae56de0222be45d2f60667201";
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || "cfsk_ma_test_04b30177727de9cbe665a3962e73775f_efc464ef";
// Use NEXT_PUBLIC_CASHFREE_MODE so server & client SDK are always in sync
const CASHFREE_MODE = process.env.CASHFREE_MODE || process.env.NEXT_PUBLIC_CASHFREE_MODE || "sandbox";

const BASE_URL = CASHFREE_MODE === "production"
  ? "https://api.cashfree.com/pg"
  : "https://sandbox.cashfree.com/pg";

export async function createCashfreeOrder({
  orderId,
  amount,
  customerEmail,
  customerName,
  customerPhone = "9999999999",
  returnUrl
}: {
  orderId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  returnUrl: string;
}) {
  try {
    const url = `${BASE_URL}/orders`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: `cust_${customerEmail.replace(/[^a-zA-Z0-9]/g, "_")}`,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone
        },
        order_meta: {
          return_url: returnUrl
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to create Cashfree order");
    }
    return data;
  } catch (error: any) {
    console.error("Cashfree order creation error:", error);
    throw error;
  }
}

export async function getCashfreeOrder(orderId: string) {
  try {
    const url = `${BASE_URL}/orders/${orderId}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch Cashfree order status");
    }
    return data;
  } catch (error: any) {
    console.error("Cashfree fetch order error:", error);
    throw error;
  }
}

export async function getCashfreeOrderPayments(orderId: string) {
  try {
    const url = `${BASE_URL}/orders/${orderId}/payments`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch Cashfree payments");
    }
    return data;
  } catch (error: any) {
    console.error("Cashfree fetch payments error:", error);
    throw error;
  }
}
