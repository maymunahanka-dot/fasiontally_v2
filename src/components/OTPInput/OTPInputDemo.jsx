import React, { useState } from "react";
import OTPInput from "./OTPInput";

const OTPInputDemo = () => {
  const [otp1, setOtp1] = useState("");
  const [otp2, setOtp2] = useState("");
  const [otp3, setOtp3] = useState("");
  const [otp4, setOtp4] = useState("");
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);

  const handleOTP1Change = (e) => {
    setOtp1(e.target.value);
    setError("");
  };

  const handleOTP2Change = (e) => {
    setOtp2(e.target.value);
    setError("");
  };

  const handleOTP3Change = (e) => {
    setOtp3(e.target.value);
    setError("");
  };

  const handleOTP4Change = (e) => {
    setOtp4(e.target.value);
    setError("");
  };

  const handleComplete = (otpValue) => {
    console.log("OTP Completed:", otpValue);
    setCompleted(true);
    setTimeout(() => setCompleted(false), 2000);
  };

  const toggleError = (otpSetter) => {
    setError(error ? "" : "Invalid verification code. Please try again.");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "2rem" }}>
      <h1>OTP Input Component Demo</h1>

      <div style={{ display: "grid", gap: "3rem" }}>
        <section>
          <h2>Standard 6-Digit OTP</h2>
          <OTPInput
            length={6}
            value={otp1}
            onChange={handleOTP1Change}
            onComplete={handleComplete}
            placeholder=""
          />
          <button onClick={() => toggleError(setOtp1)}>Toggle Error</button>
          <p>Value: {otp1}</p>
        </section>

        <section>
          <h2>4-Digit OTP with Error</h2>
          <OTPInput
            length={4}
            value={otp2}
            onChange={handleOTP2Change}
            error={error}
            onComplete={handleComplete}
          />
          <button onClick={() => toggleError(setOtp2)}>Toggle Error</button>
          <p>Value: {otp2}</p>
        </section>

        <section>
          <h2>Active State OTP</h2>
          <OTPInput
            length={6}
            value={otp3}
            onChange={handleOTP3Change}
            active={true}
            onComplete={handleComplete}
          />
          <p>Value: {otp3}</p>
        </section>

        <section>
          <h2>Disabled OTP</h2>
          <OTPInput
            length={6}
            value="123456"
            onChange={handleOTP4Change}
            disabled={true}
          />
          <p>This OTP is disabled</p>
        </section>

        <section>
          <h2>8-Digit OTP (Custom Length)</h2>
          <OTPInput
            length={8}
            value={otp4}
            onChange={handleOTP4Change}
            onComplete={handleComplete}
          />
          <p>Value: {otp4}</p>
        </section>

        <section>
          <h2>Features Demonstration</h2>
          <div
            style={{
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: "8px",
            }}
          >
            <h3>Features:</h3>
            <ul>
              <li>✅ Auto-focus next input on digit entry</li>
              <li>✅ Backspace moves to previous input</li>
              <li>✅ Arrow keys for navigation</li>
              <li>✅ Paste support (try pasting "123456")</li>
              <li>✅ Only accepts numeric input</li>
              <li>✅ Auto-complete callback when all digits filled</li>
              <li>✅ Error state styling</li>
              <li>✅ Active state styling</li>
              <li>✅ Disabled state</li>
              <li>✅ Responsive design</li>
              <li>✅ Accessibility support</li>
            </ul>
          </div>
        </section>
      </div>

      {completed && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#28a745",
            color: "white",
            padding: "1rem",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          OTP Completed! ✅
        </div>
      )}

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h3>OTP Values:</h3>
        <pre>
          {JSON.stringify(
            { otp1, otp2, otp3, otp4, error, completed },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
};

export default OTPInputDemo;
