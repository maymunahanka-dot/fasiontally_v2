import { useState } from "react";
import { sendWhatsAppTemplate } from "../backend/services/whatsapp.service";
import { sendWhatsAppOTP } from "../backend/services/whatsapp.service";

const inputStyle = {
  padding: "4px 8px", borderRadius: 4, border: "1px solid #7c3aed",
  background: "#2d2d3f", color: "#fff",
};

const btnStyle = (loading, color = "#7c3aed") => ({
  padding: "4px 14px", borderRadius: 4, border: "none",
  background: loading ? "#555" : color, color: "#fff",
  cursor: loading ? "not-allowed" : "pointer",
});

const WhatsAppTest = () => {
  // --- Template test state ---
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("Test User");
  const [templateStatus, setTemplateStatus] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(false);

  // --- OTP test state ---
  const [otpPhone, setOtpPhone] = useState("");
  const [sentOtp, setSentOtp] = useState(null);       // OTP returned from service
  const [otpInput, setOtpInput] = useState("");        // what user types
  const [otpStatus, setOtpStatus] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);

  // --- Template send ---
  const handleSend = async () => {
    if (!phone.trim()) { setTemplateStatus({ type: "error", message: "Enter a phone number." }); return; }
    if (!name.trim()) { setTemplateStatus({ type: "error", message: "Enter a name." }); return; }
    setTemplateLoading(true);
    setTemplateStatus(null);
    const result = await sendWhatsAppTemplate(phone, { 1: name });
    setTemplateLoading(false);
    if (result?.success) {
      setTemplateStatus({ type: "success", message: `✅ Sent! SID: ${result.sid}` });
    } else {
      setTemplateStatus({ type: "error", message: `❌ ${result?.error || "Unknown error"}` });
    }
  };

  // --- OTP send ---
  const handleSendOTP = async () => {
    if (!otpPhone.trim()) { setOtpStatus({ type: "error", message: "Enter a phone number." }); return; }
    setOtpLoading(true);
    setOtpStatus(null);
    setSentOtp(null);
    setOtpInput("");
    const result = await sendWhatsAppOTP(otpPhone);
    setOtpLoading(false);
    if (result?.success) {
      setSentOtp(result.otp);
      setOtpStatus({ type: "success", message: `✅ OTP sent! SID: ${result.sid}` });
    } else {
      setOtpStatus({ type: "error", message: `❌ ${result?.error || "Unknown error"}` });
    }
  };

  // --- OTP verify ---
  const handleVerifyOTP = () => {
    if (!otpInput.trim()) { setOtpStatus({ type: "error", message: "Enter the OTP." }); return; }
    if (otpInput.trim() === sentOtp) {
      setOtpStatus({ type: "success", message: "✅ OTP verified successfully!" });
    } else {
      setOtpStatus({ type: "error", message: "❌ Wrong OTP. Try again." });
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
      background: "#1e1e2e", padding: "10px 16px",
      display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
      borderBottom: "2px solid #7c3aed", fontFamily: "monospace", fontSize: 13,
    }}>

      {/* --- Template Section --- */}
      <span style={{ color: "#a78bfa", fontWeight: "bold" }}>Template:</span>
      <input type="tel" placeholder="+2348012345678" value={phone}
        onChange={(e) => setPhone(e.target.value)} style={{ ...inputStyle, width: 160 }} />
      <input type="text" placeholder="Name" value={name}
        onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, width: 110 }} />
      <button onClick={handleSend} disabled={templateLoading} style={btnStyle(templateLoading)}>
        {templateLoading ? "Sending..." : "Send Template"}
      </button>
      {templateStatus && (
        <span style={{ color: templateStatus.type === "success" ? "#4ade80" : "#f87171" }}>
          {templateStatus.message}
        </span>
      )}

      {/* Divider */}
      <span style={{ color: "#555", margin: "0 4px" }}>|</span>

      {/* --- OTP Section --- */}
      <span style={{ color: "#34d399", fontWeight: "bold" }}>OTP:</span>
      <input type="tel" placeholder="+2348012345678" value={otpPhone}
        onChange={(e) => setOtpPhone(e.target.value)} style={{ ...inputStyle, width: 160 }} />
      <button onClick={handleSendOTP} disabled={otpLoading} style={btnStyle(otpLoading, "#059669")}>
        {otpLoading ? "Sending..." : "Send OTP"}
      </button>

      {/* OTP input + verify — only show after OTP is sent */}
      {sentOtp && (
        <>
          <input type="text" placeholder="Enter OTP" value={otpInput} maxLength={6}
            onChange={(e) => setOtpInput(e.target.value)}
            style={{ ...inputStyle, width: 90, letterSpacing: 4, textAlign: "center" }} />
          <button onClick={handleVerifyOTP} style={btnStyle(false, "#0284c7")}>
            Verify
          </button>
        </>
      )}

      {otpStatus && (
        <span style={{ color: otpStatus.type === "success" ? "#4ade80" : "#f87171" }}>
          {otpStatus.message}
        </span>
      )}
    </div>
  );
};

export default WhatsAppTest;
