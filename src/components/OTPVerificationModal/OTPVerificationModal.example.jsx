/**
 * OTP Verification Modal - Usage Examples
 *
 * This file shows how to use the OTPVerificationModal component in different scenarios
 */

import { useState } from "react";
import OTPVerificationModal from "./OTPVerificationModal";

// ============================================
// EXAMPLE 1: Basic Usage in Login Page
// ============================================
const LoginPageExample = () => {
  const [showOTPModal, setShowOTPModal] = useState(false);

  const handleLoginClick = () => {
    // After user enters email/phone, show OTP modal
    setShowOTPModal(true);
  };

  const handleOTPVerify = async (otp) => {
    try {
      // Call your API to verify OTP
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        body: JSON.stringify({ otp }),
      });

      if (response.ok) {
        // OTP verified successfully
        setShowOTPModal(false);
        // Navigate to dashboard or next step
      } else {
        throw new Error("Invalid OTP");
      }
    } catch (error) {
      // Error will be shown in the modal
      throw error;
    }
  };

  return (
    <div>
      <button onClick={handleLoginClick}>Login</button>

      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleOTPVerify}
        title="Verify Login"
        message="Enter the OTP sent to your email"
        otpLength={6}
      />
    </div>
  );
};

// ============================================
// EXAMPLE 2: Phone Number Verification
// ============================================
const PhoneVerificationExample = () => {
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSendOTP = async () => {
    // Send OTP to phone number
    await fetch("/api/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone: phoneNumber }),
    });

    // Show OTP modal
    setShowOTPModal(true);
  };

  const handleOTPVerify = async (otp) => {
    // Verify OTP
    const response = await fetch("/api/verify-phone-otp", {
      method: "POST",
      body: JSON.stringify({ phone: phoneNumber, otp }),
    });

    if (!response.ok) {
      throw new Error("Invalid OTP. Please try again.");
    }

    // Success - close modal
    setShowOTPModal(false);
    alert("Phone number verified successfully!");
  };

  return (
    <div>
      <input
        type="tel"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Enter phone number"
      />
      <button onClick={handleSendOTP}>Send OTP</button>

      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleOTPVerify}
        title="Verify Phone Number"
        message={`Enter the 6-digit code sent to ${phoneNumber}`}
        otpLength={6}
      />
    </div>
  );
};

// ============================================
// EXAMPLE 3: Email Verification
// ============================================
const EmailVerificationExample = () => {
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [email, setEmail] = useState("");

  const handleVerifyEmail = () => {
    setShowOTPModal(true);
  };

  const handleOTPVerify = async (otp) => {
    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      setShowOTPModal(false);
      console.log("Email verified successfully!");
    } catch (error) {
      throw error; // Modal will display the error
    }
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email"
      />
      <button onClick={handleVerifyEmail}>Verify Email</button>

      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleOTPVerify}
        title="Verify Email Address"
        message={`We've sent a verification code to ${email}`}
        otpLength={6}
      />
    </div>
  );
};

// ============================================
// EXAMPLE 4: Two-Factor Authentication (2FA)
// ============================================
const TwoFactorAuthExample = () => {
  const [showOTPModal, setShowOTPModal] = useState(false);

  const handleLogin = async (username, password) => {
    // After successful username/password login
    const response = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      // Show 2FA OTP modal
      setShowOTPModal(true);
    }
  };

  const handleOTPVerify = async (otp) => {
    const response = await fetch("/api/verify-2fa", {
      method: "POST",
      body: JSON.stringify({ otp }),
    });

    if (!response.ok) {
      throw new Error("Invalid 2FA code");
    }

    setShowOTPModal(false);
    // Redirect to dashboard
    window.location.href = "/dashboard";
  };

  return (
    <div>
      {/* Login form here */}

      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleOTPVerify}
        title="Two-Factor Authentication"
        message="Enter the 6-digit code from your authenticator app"
        otpLength={6}
      />
    </div>
  );
};

// ============================================
// EXAMPLE 5: Custom OTP Length (4 digits)
// ============================================
const CustomLengthExample = () => {
  const [showOTPModal, setShowOTPModal] = useState(false);

  const handleOTPVerify = async (otp) => {
    console.log("4-digit OTP:", otp);
    // Verify 4-digit OTP
    if (otp === "1234") {
      setShowOTPModal(false);
    } else {
      throw new Error("Invalid PIN");
    }
  };

  return (
    <div>
      <button onClick={() => setShowOTPModal(true)}>Enter PIN</button>

      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleOTPVerify}
        title="Enter PIN"
        message="Enter your 4-digit PIN"
        otpLength={4}
      />
    </div>
  );
};

// ============================================
// PROPS DOCUMENTATION
// ============================================
/**
 * OTPVerificationModal Props:
 *
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Called when user clicks Cancel or X button
 * @param {function} onVerify - Called when user clicks Verify button
 *                               Should return a Promise
 *                               Throw error to show error message in modal
 * @param {string} title - Modal title (default: "Verify OTP")
 * @param {string} message - Message shown above OTP input
 * @param {number} otpLength - Number of OTP digits (default: 6)
 *
 * Example:
 * <OTPVerificationModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onVerify={async (otp) => {
 *     // Verify OTP logic here
 *     if (otp !== "123456") {
 *       throw new Error("Invalid OTP");
 *     }
 *   }}
 *   title="Verify Your Account"
 *   message="Enter the code sent to your email"
 *   otpLength={6}
 * />
 */

export {
  LoginPageExample,
  PhoneVerificationExample,
  EmailVerificationExample,
  TwoFactorAuthExample,
  CustomLengthExample,
};
