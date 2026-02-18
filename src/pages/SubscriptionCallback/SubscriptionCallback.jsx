import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import Button from "../../components/button/Button";
import "./SubscriptionCallback.css";

const SubscriptionCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { actualTheme } = useTheme();
  const [status, setStatus] = useState("loading"); // loading, success, failed
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get parameters from URL
        const txRef = searchParams.get("tx_ref");
        const status = searchParams.get("status");
        const transactionId = searchParams.get("transaction_id");

        console.log("Payment callback received:", {
          txRef,
          status,
          transactionId,
        });

        if (status === "successful" || status === "success") {
          // Payment was successful
          setStatus("success");
          setMessage(
            "Payment successful! Your subscription has been activated."
          );

          // Here you would typically:
          // 1. Verify the payment with Cash on Rails
          // 2. Update the user's subscription in Firestore
          // 3. Send confirmation email

          // For now, we'll simulate this
          setTimeout(() => {
            navigate("/dashboard");
          }, 3000);
        } else if (status === "cancelled" || status === "failed") {
          // Payment failed or was cancelled
          setStatus("failed");
          setMessage("Payment was cancelled or failed. Please try again.");
        } else {
          // Unknown status
          setStatus("failed");
          setMessage("Payment status unknown. Please contact support.");
        }
      } catch (error) {
        console.error("Error handling payment callback:", error);
        setStatus("failed");
        setMessage("An error occurred while processing your payment.");
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    navigate("/subscription");
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="subscription-callback" data-theme={actualTheme}>
      <div className="callback-container">
        <div className="callback-content">
          {status === "loading" && (
            <>
              <div className="callback-icon loading">
                <Loader className="spinner" />
              </div>
              <h1 className="callback-title">Processing Payment...</h1>
              <p className="callback-message">
                Please wait while we confirm your payment.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="callback-icon success">
                <CheckCircle />
              </div>
              <h1 className="callback-title">Payment Successful!</h1>
              <p className="callback-message">{message}</p>
              <div className="callback-actions">
                <Button onClick={handleGoToDashboard} variant="primary">
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}

          {status === "failed" && (
            <>
              <div className="callback-icon failed">
                <XCircle />
              </div>
              <h1 className="callback-title">Payment Failed</h1>
              <p className="callback-message">{message}</p>
              <div className="callback-actions">
                <Button onClick={handleRetry} variant="primary">
                  Try Again
                </Button>
                <Button onClick={handleGoToDashboard} variant="secondary">
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCallback;
