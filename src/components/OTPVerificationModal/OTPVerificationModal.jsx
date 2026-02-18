import { useState } from "react";
import { X } from "lucide-react";
import OTPInput from "../OTPInput/OTPInput";
import Button from "../button/Button";
import "./OTPVerificationModal.css";

const OTPVerificationModal = ({
  isOpen,
  onClose,
  onVerify,
  title = "Verify OTP",
  message = "Please enter the OTP sent to your email/phone",
  otpLength = 6,
}) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const handleOTPChange = (e) => {
    const value = e.target.value || "";
    setOtp(value);
    setError(""); // Clear error when user types
  };

  const handleVerify = async () => {
    if (otp.length !== otpLength) {
      setError(`Please enter all ${otpLength} digits`);
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // Call the onVerify callback passed from parent
      await onVerify(otp);
      // Parent component will handle navigation/next steps
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    setOtp("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="otp-modal-overlay" onClick={handleCancel}>
      <div className="otp-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="otp-modal-close" onClick={handleCancel}>
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="otp-modal-title">{title}</h2>

        {/* Message */}
        <p className="otp-modal-message">{message}</p>

        {/* OTP Input */}
        <div className="otp-input-container">
          <OTPInput
            length={otpLength}
            value={otp}
            onChange={handleOTPChange}
            disabled={isVerifying}
          />
        </div>

        {/* Error Message */}
        {error && <p className="otp-error-message">{error}</p>}

        {/* Action Buttons */}
        <div className="otp-modal-actions">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isVerifying}
            className="otp-cancel-btn"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleVerify}
            disabled={isVerifying || otp.length !== otpLength}
            className="otp-verify-btn"
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationModal;
