// src/utils/emailService.js
import axios from "axios";

export const sendOTP = async ({ mail, otp }) => {
  if (!mail || !otp) {
    return { success: false, message: "Email and OTP are required" };
  }

  try {
    const response = await axios.post(
      "https://mailtrap-g2su.onrender.com/api/send-otp",
      {
        mail: mail,
        otp: otp,
      }
    );

    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Backend call failed:", error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Network or server error",
    };
  }
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
