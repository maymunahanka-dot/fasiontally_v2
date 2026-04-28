import { useState } from "react";
import { sendWhatsAppTemplate } from "../backend/services/whatsapp.service";

const WhatsAppTest = () => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("Test User");
  const [status, setStatus] = useState(null); // { type: "success"|"error", message }
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!phone.trim()) {
      setStatus({ type: "error", message: "Please enter a phone number." });
      return;
    }
    if (!name.trim()) {
      setStatus({ type: "error", message: "Please enter a name." });
      return;
    }
    setLoading(true);
    setStatus(null);
    const result = await sendWhatsAppTemplate(phone, { 1: name });
    setLoading(false);
    if (result?.success) {
      setStatus({ type: "success", message: `✅ Template sent! SID: ${result.sid}` });
    } else {
      setStatus({ type: "error", message: `❌ Failed: ${result?.error || "Unknown error"}` });
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
      background: "#1e1e2e", padding: "10px 16px",
      display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
      borderBottom: "2px solid #7c3aed", fontFamily: "monospace", fontSize: 13,
    }}>
      <span style={{ color: "#a78bfa", fontWeight: "bold" }}>WA Template Test:</span>
      <input
        type="tel"
        placeholder="+2348012345678"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{
          padding: "4px 8px", borderRadius: 4, border: "1px solid #7c3aed",
          background: "#2d2d3f", color: "#fff", width: 180,
        }}
      />
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          padding: "4px 8px", borderRadius: 4, border: "1px solid #7c3aed",
          background: "#2d2d3f", color: "#fff", width: 120,
        }}
      />
      <button
        onClick={handleSend}
        disabled={loading}
        style={{
          padding: "4px 14px", borderRadius: 4, border: "none",
          background: loading ? "#555" : "#7c3aed", color: "#fff", cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Sending..." : "Send Template"}
      </button>
      {status && (
        <span style={{ color: status.type === "success" ? "#4ade80" : "#f87171" }}>
          {status.message}
        </span>
      )}
    </div>
  );
};

export default WhatsAppTest;
