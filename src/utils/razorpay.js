export const initializeRazorpayPayment = ({ planName, amount, billingCycle, userEmail, userName, onSuccess, onFailure }) => {
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

  const rzp = new window.Razorpay(options);
  rzp.open();
};
