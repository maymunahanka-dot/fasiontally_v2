import { useState, useEffect } from "react";
import { X, Clock, Sparkles, ArrowRight } from "lucide-react";
import { useSubscription } from "../../hooks/use-subscription";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import "./TrialBanner.css";

export function TrialBanner() {
  const subscription = useSubscription();
  const navigate = useNavigate();
  const { actualTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!subscription.subscriptionEndDate || !subscription.isTrialActive)
      return;

    const updateTimeLeft = () => {
      const now = new Date();
      const endDate = new Date(subscription.subscriptionEndDate);
      const timeDiff = endDate.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setTimeLeft("Trial expired");
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days} day${days > 1 ? "s" : ""} left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours} hour${hours > 1 ? "s" : ""} left`);
      } else {
        setTimeLeft(`${minutes} minute${minutes > 1 ? "s" : ""} left`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [subscription]);

  // Don't show banner if:
  // - User dismissed it
  // - No trial active
  // - User has paid subscription
  if (
    !isVisible ||
    !subscription.isTrialActive ||
    subscription.subscriptionType !== "trial"
  ) {
    return null;
  }

  const isExpiringSoon =
    subscription.subscriptionEndDate &&
    new Date(subscription.subscriptionEndDate).getTime() -
      new Date().getTime() <
      24 * 60 * 60 * 1000; // Less than 24 hours

  return (
    <div
      className={`trial-status-banner ${
        isExpiringSoon ? "expiring-soon" : "active"
      }`}
      data-theme={actualTheme}
    >
      <div className="banner-content">
        <div className="banner-info">
          <div
            className={`icon-wrapper ${isExpiringSoon ? "warning" : "info"}`}
          >
            {isExpiringSoon ? (
              <Clock className="banner-icon" />
            ) : (
              <Sparkles className="banner-icon" />
            )}
          </div>
          <div className="text-content">
            <div className="badge-and-time">
              <span
                className={`trial-badge ${isExpiringSoon ? "warning" : "info"}`}
              >
                {isExpiringSoon ? "Trial Ending Soon!" : "Free Trial Active"}
              </span>
              <span className="time-remaining">{timeLeft}</span>
            </div>
            <p className="trial-message">
              {isExpiringSoon
                ? "Your free trial is ending soon. Upgrade now to keep all your data and continue using premium features."
                : `You're enjoying full access to all ${subscription.planType} features. Upgrade anytime to continue after your trial.`}
            </p>
          </div>
        </div>
        <div className="banner-actions">
          <button
            className="upgrade-button"
            onClick={() => navigate("/subscription")}
          >
            <ArrowRight className="button-icon" />
            Upgrade Now
          </button>
          <button
            className="dismiss-button"
            onClick={() => setIsVisible(false)}
            aria-label="Dismiss banner"
          >
            <X className="dismiss-icon" />
          </button>
        </div>
      </div>
    </div>
  );
}
