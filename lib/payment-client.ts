import toast from "react-hot-toast";

export async function loadCashfreeSDK(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Browser environment required"));
      return;
    }

    // Already loaded
    if ((window as any).Cashfree) {
      resolve((window as any).Cashfree);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => {
      if ((window as any).Cashfree) {
        resolve((window as any).Cashfree);
      } else {
        reject(new Error("Cashfree SDK loaded but Cashfree object not found"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load Cashfree SDK script"));
    document.head.appendChild(script);
  });
}

export async function initiateCashfreePayment({
  planId,
  email,
  mentorId
}: {
  planId: "pro" | "mentor" | "mentorship";
  email: string | null;
  mentorId?: string;
}) {
  if (!email) {
    toast.error("Please log in to proceed with payment.");
    return;
  }

  const toastId = toast.loading("Initializing secure payment...");

  try {
    // Step 1: Create order on backend and get payment_session_id
    const res = await fetch("/api/subscription/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        planSlug: planId.toUpperCase(), 
        email, 
        mentorId 
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to initialize checkout");

    const { paymentSessionId } = data;
    if (!paymentSessionId) throw new Error("No payment session returned from server");

    // Step 2: Load Cashfree JS SDK v3
    const CashfreeLib = await loadCashfreeSDK();

    // Step 3: Initialize with mode
    const mode = (process.env.NEXT_PUBLIC_CASHFREE_MODE as "sandbox" | "production") || "sandbox";
    const cashfree = CashfreeLib({ mode });

    toast.dismiss(toastId);

    // Step 4: Open Cashfree checkout (redirects page)
    cashfree.checkout({
      paymentSessionId,
      redirectTarget: "_self"
    });

  } catch (error: any) {
    console.error("Cashfree payment error:", error);
    toast.error(error.message || "Payment initiation failed. Please try again.", { id: toastId });
  }
}
