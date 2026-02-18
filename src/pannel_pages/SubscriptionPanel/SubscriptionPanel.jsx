import { useState, useEffect } from "react";
import { ArrowLeft, Check, Crown, Clock, X, XCircle } from "lucide-react";
import Button from "../../components/button/Button";
import { useSubscription } from "../../hooks/use-subscription";
import { useNewAuth } from "../../contexts/NewAuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { removeTestSubscription } from "../../lib/subscription-check";
import { getPlanPricing } from "../../lib/payment";
import { db } from "../../backend/firebase.config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "./SubscriptionPanel.css";

const SubscriptionPanel = ({ onClose }) => {
  const subscription = useSubscription();
  const { user } = useNewAuth();
  const { actualTheme } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState("growth");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const subscriptionPlans = [
    {
      id: "starter",
      name: "Starter",
      monthlyPrice: 10000,
      yearlyPrice: 100000,
      description: "Perfect for solo designers",
      features: [
        "1 User",
        "Client Management",
        "Inventory Tool",
        "Financial Reports",
        "Custom Orders",
        "CRM Tools",
        "Appointment Scheduling",
        "Detailed Measurements",
        "Invoicing",
        "Order Tracking",
        "Support",
      ],
      buttonText: "Get Started",
      cardStyle: "basic",
    },
    {
      id: "growth",
      name: "Growth",
      monthlyPrice: 15000,
      yearlyPrice: 150000,
      description: "Ideal for growing fashion brands",
      badge: "Popular",
      badgeColor: "#3b82f6",
      features: [
        "Up to 3 Users",
        "All Starter features",
        "Design Management",
        "Notifications",
        "Calendar Sync",
        "Enhanced CRM",
      ],
      buttonText: "Upgrade to Growth",
      cardStyle: "popular",
    },
    {
      id: "professional",
      name: "Professional",
      monthlyPrice: 25000,
      yearlyPrice: 250000,
      description: "Best for studios with teams",
      badge: "Pro",
      badgeColor: "#f59e0b",
      features: [
        "Up to 10 Users",
        "All Growth features",
        "Full Workflow Access",
        "Priority Notifications",
        "Priority Support",
      ],
      buttonText: "Upgrade to Professional",
      cardStyle: "pro",
    },
  ];

  // Update plan status based on current subscription
  const updatedPlans = subscriptionPlans.map((plan) => {
    const isCurrentPlan =
      subscription.planType?.toUpperCase() === plan.id.toUpperCase();
    const pricing = getPlanPricing(plan.id, "monthly");

    if (isCurrentPlan) {
      return {
        ...plan,
        price: pricing.formattedAmount,
        period: "/month",
        badge: subscription.isTrialActive ? "Trial Active" : "Current Plan",
        badgeColor: subscription.isTrialActive ? "#10b981" : "#6b7280",
        buttonText: subscription.isTrialActive
          ? "Trial Active"
          : "Current Plan",
        buttonDisabled: true,
        cardStyle: "current",
      };
    }

    return {
      ...plan,
      price: pricing.formattedAmount,
      period: "/month",
    };
  });

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const handleUpgrade = async (plan) => {
    if (!user?.email) {
      alert("Please log in to upgrade your subscription");
      return;
    }

    if (plan.buttonDisabled) return;

    // Redirect to the subscription page with the selected plan
    const planName = plan.id.toLowerCase();
    window.location.href = `/subscription?plan=${planName}`;
  };

  const handleCancelSubscription = async () => {
    if (!user?.email) return;

    if (!cancelReason) {
      alert("Please select a reason for cancellation");
      return;
    }

    setLoading(true);
    try {
      // Save cancellation data to database
      await addDoc(collection(db, "subscription_cancellations"), {
        userEmail: user.email,
        userId: user.uid,
        userName: user.displayName || user.name || "Unknown",
        planType: subscription.planType,
        subscriptionType: subscription.subscriptionType,
        reason: cancelReason,
        cancelledAt: serverTimestamp(),
        subscriptionEndDate: subscription.subscriptionEndDate,
        isTrialActive: subscription.isTrialActive,
      });

      // Cancel the subscription
      const success = await removeTestSubscription(user.email, user.uid);
      if (success) {
        alert(
          "Subscription cancelled successfully. No refunds will be processed."
        );
        setShowCancelModal(false);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        alert("Failed to cancel subscription. Please contact support.");
      }
    } catch (error) {
      console.error("Cancel subscription error:", error);
      alert("An error occurred while cancelling. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openCancelModal = () => {
    setShowCancelModal(true);
    setCancelReason("");
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelReason("");
  };

  const getTrialDaysRemaining = () => {
    if (!subscription.subscriptionEndDate) return 0;
    const endDate = new Date(subscription.subscriptionEndDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getSubscriptionProgress = () => {
    if (!subscription.subscriptionEndDate)
      return { percentage: 0, daysRemaining: 0, totalDays: 30 };

    const endDate = new Date(subscription.subscriptionEndDate);
    const today = new Date();

    // Calculate total subscription period (assume 30 days for monthly, 3 days for trial)
    const totalDays = subscription.isTrialActive ? 3 : 30;
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - totalDays);

    const totalTime = endDate - startDate;
    const remainingTime = endDate - today;
    const elapsedTime = totalTime - remainingTime;

    const percentage = Math.max(
      0,
      Math.min(100, (elapsedTime / totalTime) * 100)
    );
    const daysRemaining = Math.max(
      0,
      Math.ceil(remainingTime / (1000 * 60 * 60 * 24))
    );

    return { percentage, daysRemaining, totalDays };
  };

  // Handle initial loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Update initial loading based on subscription loading state
  useEffect(() => {
    if (!subscription.loading) {
      setInitialLoading(false);
    }
  }, [subscription.loading]);

  return (
    <div className="sub_panel" data-theme={actualTheme}>
      {/* Loading Overlay */}
      {initialLoading && (
        <div className="sub_loading_overlay">
          <div className="sub_loading_content">
            <div className="sub_loading_spinner"></div>
            <p className="sub_loading_text">Loading your subscription...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sub_header">
        <button className="sub_back_btn" onClick={onClose}>
          <ArrowLeft size={20} />
        </button>
        <div className="sub_header_content">
          <h2 className="sub_title">Subscription</h2>
          <p className="sub_subtitle">Plan & billing</p>
        </div>
      </div>

      {/* Content */}
      <div className="sub_content">
        {/* Current Subscription Status */}
        {subscription.isSubscribed && (
          <div className="current_subscription_status">
            <div className="status_header">
              <div className="status_header_left">
                <Crown size={20} className="crown_icon" />
                <h3>Current Subscription</h3>
              </div>
              <button
                className="cancel_subscription_icon"
                onClick={openCancelModal}
                disabled={loading}
                title="Cancel Subscription"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="status_details">
              <div className="plan_info">
                <span className="current_plan_name">
                  {subscription.planType} Plan
                </span>
                {subscription.isTrialActive && (
                  <span className="trial_badge">
                    <Clock size={14} />
                    Trial - {getTrialDaysRemaining()} days left
                  </span>
                )}
              </div>

              {subscription.subscriptionEndDate && (
                <>
                  <div className="subscription_progress">
                    <div className="progress_info">
                      <span className="progress_label">
                        {subscription.isTrialActive
                          ? "Trial Progress"
                          : "Subscription Progress"}
                      </span>
                      <span className="progress_days">
                        {getSubscriptionProgress().daysRemaining} of{" "}
                        {getSubscriptionProgress().totalDays} days remaining
                      </span>
                    </div>
                    <div className="progress_bar">
                      <div
                        className="progress_fill"
                        style={{
                          width: `${getSubscriptionProgress().percentage}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <p className="expiry_date">
                    {subscription.isTrialActive
                      ? "Trial expires"
                      : subscription.subscriptionType === "paid"
                      ? "Expires"
                      : "Valid until"}
                    :{" "}
                    {new Date(
                      subscription.subscriptionEndDate
                    ).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Free Trial Banner for non-subscribers */}
        {!subscription.isSubscribed && (
          <div className="free_trial_banner">
            <div className="trial_content">
              <h3>🎉 Start Your Free Trial</h3>
              <p>
                Get full access to all features for 7 days, no credit card
                required!
              </p>
            </div>
          </div>
        )}

        <h3 className="sub_section_title">
          {subscription.isSubscribed ? "Upgrade Your Plan" : "Choose Your Plan"}
        </h3>

        <div className="sub_plans_container">
          {updatedPlans.map((plan) => (
            <div
              key={plan.id}
              className={`sub_plan_card ${plan.cardStyle} ${
                selectedPlan === plan.id ? "selected" : ""
              }`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {/* Plan Header */}
              <div className="sub_plan_header">
                <div className="sub_plan_title_section">
                  <h4 className="sub_plan_name">{plan.name}</h4>
                  {plan.badge && (
                    <span
                      className="sub_plan_badge"
                      style={{ backgroundColor: plan.badgeColor }}
                    >
                      {plan.badge}
                    </span>
                  )}
                </div>

                {plan.price && (
                  <div className="sub_plan_pricing">
                    <span className="sub_plan_price">{plan.price}</span>
                    <span className="sub_plan_period">{plan.period}</span>
                  </div>
                )}

                <p className="sub_plan_description">{plan.description}</p>
              </div>

              {/* Plan Features */}
              <div className="sub_plan_features">
                {plan.features.map((feature, index) => (
                  <div key={index} className="sub_plan_feature">
                    <div className="sub_feature_icon">
                      <Check size={14} />
                    </div>
                    <span className="sub_feature_text">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Plan Button */}
              <div className="sub_plan_button_container">
                <Button
                  variant={plan.buttonDisabled ? "secondary" : "primary"}
                  onClick={() => handleUpgrade(plan)}
                  disabled={plan.buttonDisabled || loading}
                  className="sub_plan_button"
                >
                  {loading ? "Processing..." : plan.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Subscription Info */}
        <div className="subscription_info">
          <h4>Subscription Details</h4>
          <ul>
            <li>• All plans include a 3-day free trial</li>
            <li>• Cancel anytime, no questions asked</li>
            <li>• Secure payment processing</li>
            <li>• 24/7 customer support</li>
            <li>• Monthly billing</li>
          </ul>
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="cancel_modal_overlay">
          <div className="cancel_modal" data-theme={actualTheme}>
            <div className="cancel_modal_header">
              <h3>Cancel Subscription</h3>
              <button className="cancel_modal_close" onClick={closeCancelModal}>
                <X size={20} />
              </button>
            </div>

            <div className="cancel_modal_content">
              <p className="cancel_warning">
                ⚠️ <strong>Important:</strong> Cancelling your subscription will
                immediately revoke access to premium features.{" "}
                <strong>No refunds will be processed.</strong>
              </p>

              <div className="cancel_form">
                <div className="cancel_form_group">
                  <label htmlFor="cancelReason">
                    Why do you want to cancel your subscription? *
                  </label>
                  <textarea
                    id="cancelReason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please tell us why you're cancelling your subscription..."
                    className="cancel_textarea"
                    rows={4}
                  />
                </div>
              </div>

              <div className="cancel_modal_actions">
                <Button
                  variant="secondary"
                  onClick={closeCancelModal}
                  disabled={loading}
                  className="cancel_confirm_btnn"
                >
                  Keep Subscription
                </Button>
                <Button
                  variant="danger"
                  onClick={handleCancelSubscription}
                  disabled={loading || !cancelReason.trim()}
                  className="cancel_confirm_btn"
                >
                  {loading ? "Cancelling..." : "Cancel Subscription"}
                </Button>
              </div>

              <p className="cancel_disclaimer">
                By clicking "Cancel Subscription", you acknowledge that no
                refunds will be provided and your access will be revoked
                immediately.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPanel;
