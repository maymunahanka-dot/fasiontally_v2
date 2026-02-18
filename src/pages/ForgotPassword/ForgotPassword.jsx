import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNewAuth } from "../../contexts/NewAuthContext";
import Input from "../../components/Input";
import Button from "../../components/button/Button";
import logo from "../../assets/Image/logo.png";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPassword } = useNewAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    const result = await resetPassword(email);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "Failed to send password reset email");
    }

    setLoading(false);
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const resetState = () => {
    setSuccess(false);
    setError("");
    setEmail("");
  };

  if (success) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-left-section">
          <div className="forgot-password-left-content">
            <img
              src={logo}
              alt="FashionTally Logo"
              className="forgot-password-logo"
            />
            <h2 className="forgot-password-tagline">
              Empowering African Fashion Entrepreneurs With Smart Tools
            </h2>
          </div>
        </div>

        <div className="forgot-password-right-section">
          <div className="forgot-password-right-content">
            <div className="forgot-password-header">
              <div className="forgot-password-success-icon">✅</div>
              <h1 className="forgot-password-title">Check Your Email</h1>
              <p className="forgot-password-subtitle">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </div>

            <div className="forgot-password-success-alert">
              <p className="forgot-password-alert-text">
                If an account with this email exists, you'll receive a password
                reset link shortly.
              </p>
            </div>

            <div className="forgot-password-instructions">
              <p>• Check your spam folder if you don't see the email</p>
              <p>• The link will expire in 1 hour</p>
              <p>• Make sure to check the email address you used to sign up</p>
            </div>

            <div className="forgot-password-actions">
              <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={resetState}
              >
                Send Another Email
              </Button>

              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => navigate("/login")}
              >
                ← Back to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-left-section">
        <div className="forgot-password-left-content">
          <img
            src={logo}
            alt="FashionTally Logo"
            className="forgot-password-logo"
          />
          <h2 className="forgot-password-tagline">
            Empowering African Fashion Entrepreneurs With Smart Tools
          </h2>
        </div>
      </div>

      <div className="forgot-password-right-section">
        <div className="forgot-password-right-content">
          <div className="forgot-password-header">
            <h1 className="forgot-password-title">Forgot Password?</h1>
            <p className="forgot-password-subtitle">
              Enter your email to receive a password reset link
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="forgot-password-error-message">{error}</div>
            )}

            <Input
              type="email"
              label=""
              value={email}
              onChange={handleInputChange}
              placeholder="Email Address"
              required
              error={error}
              active={!!email}
            />

            <div className="forgot-password-submit-button">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={!email}
                className={email ? "" : "forgot-password-btn-inactive"}
              >
                Send Reset Link
              </Button>
            </div>

            <p className="forgot-password-login-link">
              Remember your password?{" "}
              <span
                className="forgot-password-link"
                onClick={() => navigate("/login")}
              >
                Sign in here
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
