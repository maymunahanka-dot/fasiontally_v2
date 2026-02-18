// Payment integration utilities for subscription management

/**
 * Initialize Flutterwave payment
 * @param {Object} config - Payment configuration
 * @returns {Promise} Payment initialization result
 */
export async function initializeFlutterwavePayment(config) {
  const {
    amount,
    currency = "NGN",
    email,
    phone,
    name,
    planType,
    userId,
    onSuccess,
    onError,
    onClose,
  } = config;

  // Generate unique transaction reference
  const txRef = `FT_${planType}_${userId}_${Date.now()}`;

  const paymentConfig = {
    public_key:
      process.env.REACT_APP_FLUTTERWAVE_PUBLIC_KEY ||
      "FLWPUBK_TEST-SANDBOXDEMOKEY-X",
    tx_ref: txRef,
    amount: amount,
    currency: currency,
    payment_options: "card,mobilemoney,ussd,banktransfer",
    customer: {
      email: email,
      phone_number: phone,
      name: name,
    },
    customizations: {
      title: "Fashion Tally Subscription",
      description: `${planType} Plan Subscription`,
      logo: "/logo.png",
    },
    callback: (response) => {
      console.log("Payment callback:", response);
      if (response.status === "successful") {
        // Verify payment on backend
        verifyPayment(response.transaction_id, response.tx_ref)
          .then((verified) => {
            if (verified) {
              onSuccess && onSuccess(response);
            } else {
              onError && onError("Payment verification failed");
            }
          })
          .catch((error) => {
            console.error("Payment verification error:", error);
            onError && onError("Payment verification failed");
          });
      } else {
        onError && onError("Payment failed");
      }
    },
    onclose: () => {
      onClose && onClose();
    },
  };

  // Check if FlutterwaveCheckout is available
  if (typeof window !== "undefined" && window.FlutterwaveCheckout) {
    window.FlutterwaveCheckout(paymentConfig);
  } else {
    // Fallback: Load Flutterwave script dynamically
    loadFlutterwaveScript()
      .then(() => {
        if (window.FlutterwaveCheckout) {
          window.FlutterwaveCheckout(paymentConfig);
        } else {
          onError && onError("Payment system not available");
        }
      })
      .catch((error) => {
        console.error("Failed to load payment system:", error);
        onError && onError("Payment system not available");
      });
  }

  return { txRef, paymentConfig };
}

/**
 * Load Flutterwave script dynamically
 * @returns {Promise} Script loading promise
 */
function loadFlutterwaveScript() {
  return new Promise((resolve, reject) => {
    if (document.getElementById("flutterwave-script")) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = "flutterwave-script";
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Verify payment with backend
 * @param {string} transactionId - Flutterwave transaction ID
 * @param {string} txRef - Transaction reference
 * @returns {Promise<boolean>} Verification result
 */
async function verifyPayment(transactionId, txRef) {
  try {
    // In a real implementation, this would call your backend API
    // For demo purposes, we'll simulate verification
    console.log("Verifying payment:", { transactionId, txRef });

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // For demo, always return true
    // In production, this should verify with Flutterwave API
    return true;
  } catch (error) {
    console.error("Payment verification error:", error);
    return false;
  }
}

/**
 * Format amount for display
 * @param {number} amount - Amount in kobo/cents
 * @param {string} currency - Currency code
 * @returns {string} Formatted amount
 */
export function formatAmount(amount, currency = "NGN") {
  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(amount);
}

/**
 * Get plan pricing
 * @param {string} planType - Plan type (starter, growth, professional)
 * @param {string} billingCycle - Billing cycle (monthly, yearly)
 * @returns {Object} Plan pricing information
 */
export function getPlanPricing(planType, billingCycle = "monthly") {
  const pricing = {
    starter: {
      monthly: 10000,
      yearly: 100000,
    },
    growth: {
      monthly: 15000,
      yearly: 150000,
    },
    professional: {
      monthly: 25000,
      yearly: 250000,
    },
  };

  const planPricing = pricing[planType.toLowerCase()];
  if (!planPricing) {
    throw new Error(`Invalid plan type: ${planType}`);
  }

  const amount = planPricing[billingCycle];
  const savings =
    billingCycle === "yearly" ? planPricing.monthly * 12 - amount : 0;
  const savingsPercentage =
    billingCycle === "yearly"
      ? Math.round((savings / (planPricing.monthly * 12)) * 100)
      : 0;

  return {
    amount,
    formattedAmount: formatAmount(amount),
    savings,
    formattedSavings: formatAmount(savings),
    savingsPercentage,
    billingCycle,
    planType,
  };
}

/**
 * Generate payment metadata
 * @param {Object} config - Payment configuration
 * @returns {Object} Payment metadata
 */
export function generatePaymentMetadata(config) {
  const { planType, billingCycle, userId, email } = config;

  return {
    plan_type: planType,
    billing_cycle: billingCycle,
    user_id: userId,
    user_email: email,
    payment_for: "subscription",
    created_at: new Date().toISOString(),
  };
}

/**
 * Handle payment success
 * @param {Object} response - Payment response
 * @param {Object} config - Original payment configuration
 */
export async function handlePaymentSuccess(response, config) {
  try {
    console.log("Payment successful:", response);

    // Update user subscription in Firebase
    // This would typically be done via an API call to your backend
    const subscriptionData = {
      planType: config.planType,
      subscriptionType: "paid",
      subscriptionEndDate: calculateSubscriptionEndDate(config.billingCycle),
      paymentAmount: config.amount,
      paymentDate: new Date().toISOString(),
      transactionId: response.transaction_id,
      txRef: response.tx_ref,
      isSubscribed: true,
      isTrialActive: false,
    };

    console.log("Subscription data to save:", subscriptionData);

    // In a real app, you would save this to your database
    // For demo purposes, we'll just log it

    return subscriptionData;
  } catch (error) {
    console.error("Error handling payment success:", error);
    throw error;
  }
}

/**
 * Calculate subscription end date
 * @param {string} billingCycle - Billing cycle
 * @returns {string} End date ISO string
 */
function calculateSubscriptionEndDate(billingCycle) {
  const now = new Date();

  if (billingCycle === "yearly") {
    now.setFullYear(now.getFullYear() + 1);
  } else {
    now.setMonth(now.getMonth() + 1);
  }

  return now.toISOString();
}

/**
 * Mock payment for development/testing
 * @param {Object} config - Payment configuration
 * @returns {Promise} Mock payment result
 */
export async function mockPayment(config) {
  console.log("Mock payment initiated:", config);

  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Simulate successful payment
  const mockResponse = {
    status: "successful",
    transaction_id: `mock_${Date.now()}`,
    tx_ref: config.txRef || `mock_ref_${Date.now()}`,
    amount: config.amount,
    currency: config.currency || "NGN",
    customer: config.customer,
  };

  return mockResponse;
}
