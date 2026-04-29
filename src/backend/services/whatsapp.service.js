/**
 * Twilio WhatsApp Service
 * Sends WhatsApp messages via Twilio Messaging API
 */

const ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const FROM = import.meta.env.VITE_TWILIO_WHATSAPP_FROM;
const TEMPLATE_SID = import.meta.env.VITE_TWILIO_TEMPLATE_SID;
const OTP_TEMPLATE_SID = import.meta.env.VITE_TWILIO_OTP_TEMPLATE_SID;

const normalizePhone = (phone) => {
  let cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("00")) cleaned = "+" + cleaned.slice(2);
  if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
  if (cleaned.replace("+", "").length < 7) return null;
  return cleaned;
};

/**
 * Send WhatsApp using an approved template (for first message / outside 24hr window)
 * @param {string} to - recipient phone number
 * @param {object} variables - template variables e.g. {1: "John", 2: "7"}
 */
export const sendWhatsAppTemplate = async (to, variables = {}) => {
  if (!ACCOUNT_SID || !AUTH_TOKEN || !FROM || !TEMPLATE_SID) {
    const err = "WhatsApp template not configured. Check .env";
    console.warn(err);
    return { success: false, error: err };
  }

  const normalized = normalizePhone(to);
  if (!normalized) {
    const err = `Invalid phone number: ${to}`;
    console.warn(err);
    return { success: false, error: err };
  }

  const toFormatted = `whatsapp:${normalized}`;
  const auth = btoa(`${ACCOUNT_SID}:${AUTH_TOKEN}`);
  const body = new URLSearchParams({
    From: FROM,
    To: toFormatted,
    ContentSid: TEMPLATE_SID,
    ContentVariables: JSON.stringify(variables),
  });

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      const reason = data?.message || data?.error_message || `Error code ${data?.code || res.status}`;
      console.error("❌ WhatsApp template failed:", data);
      return { success: false, error: reason };
    }

    console.log("✅ WhatsApp template sent:", data.sid);
    return { success: true, sid: data.sid };
  } catch (error) {
    console.error("❌ WhatsApp template error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate a random numeric OTP
 * @param {number} length - number of digits (default 6)
 */
export const generateOTP = (length = 6) => {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
};

/**
 * Send OTP via WhatsApp using the verifications_2fa_template
 * The template expects {{1}} = the OTP code
 * @param {string} to - recipient phone number
 * @returns {{ success: boolean, otp?: string, sid?: string, error?: string }}
 */
export const sendWhatsAppOTP = async (to) => {
  if (!ACCOUNT_SID || !AUTH_TOKEN || !FROM || !OTP_TEMPLATE_SID) {
    const err = "WhatsApp OTP not configured. Add VITE_TWILIO_OTP_TEMPLATE_SID to .env";
    console.warn(err);
    return { success: false, error: err };
  }

  const normalized = normalizePhone(to);
  if (!normalized) {
    return { success: false, error: `Invalid phone number: ${to}` };
  }

  const otp = generateOTP(6);
  const toFormatted = `whatsapp:${normalized}`;
  const auth = btoa(`${ACCOUNT_SID}:${AUTH_TOKEN}`);

  const body = new URLSearchParams({
    From: FROM,
    To: toFormatted,
    ContentSid: OTP_TEMPLATE_SID,
    ContentVariables: JSON.stringify({ "1": otp }),
  });

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      const reason = data?.message || data?.error_message || `Error code ${data?.code || res.status}`;
      console.error("❌ WhatsApp OTP failed:", data);
      return { success: false, error: reason };
    }

    console.log("✅ WhatsApp OTP sent:", data.sid, "OTP:", otp);
    // Return the otp so the caller can store it for verification
    return { success: true, otp, sid: data.sid };
  } catch (error) {
    console.error("❌ WhatsApp OTP error:", error);
    return { success: false, error: error.message };
  }
};
