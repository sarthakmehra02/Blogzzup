export const initializeRazorpayPayment = ({ planName, amount, billingCycle, userEmail, userName, onSuccess, onFailure }) => {
  if (!window.Razorpay) {
    console.error("Razorpay SDK not found. Please ensure the script is loaded.");
    if (onFailure) onFailure("Payment system (Razorpay) failed to load. Please refresh the page.");
    return;
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: amount * 100, // Razorpay takes amount in paise
    currency: "INR",
    name: "BlogForge AI",
    description: `${planName} Plan - ${billingCycle}`,
    image: "/vite.svg",
    prefill: {
      name: userName || "User",
      email: userEmail || "",
    },
    theme: {
      color: "#7C3AED",
    },
    handler: function (response) {
      onSuccess(response);
    },
    modal: {
      ondismiss: function () {
        if (onFailure) onFailure("Payment cancelled");
      },
    },
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error("Error creating Razorpay instance:", error);
    if (onFailure) onFailure("An internal error occurred while opening the payment gateway.");
  }
};
