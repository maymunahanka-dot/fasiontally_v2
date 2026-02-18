import React from "react";
import { useNewAuth } from "../contexts/NewAuthContext";
import {
  getLoginTypeFromUserData,
  getLoginMethodDescription,
  getLoginMethodIcon,
} from "../utils/authUtils";

const LoginTypeExample = () => {
  const { user } = useNewAuth();

  if (!user) {
    return <div>Please log in to see login type information</div>;
  }

  const loginInfo = getLoginTypeFromUserData(user);

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        margin: "20px",
      }}
    >
      <h3>Login Type Information</h3>

      <div style={{ marginBottom: "10px" }}>
        <strong>Login Method:</strong> {getLoginMethodIcon(user)}{" "}
        {getLoginMethodDescription(user)}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <strong>Provider:</strong> {loginInfo.provider}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <strong>Can Change Password:</strong>{" "}
        {loginInfo.canChangePassword ? "✅ Yes" : "❌ No"}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <strong>Login Type Checks:</strong>
        <ul>
          <li>Is Google: {loginInfo.isGoogle ? "✅" : "❌"}</li>
          <li>Is Email: {loginInfo.isEmail ? "✅" : "❌"}</li>
          <li>Is Phone: {loginInfo.isPhone ? "✅" : "❌"}</li>
        </ul>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <strong>User Data:</strong>
        <ul>
          <li>Email: {user.email}</li>
          <li>Phone: {user.phone || "Not provided"}</li>
          <li>Display Name: {user.displayName || user.name}</li>
          <li>Provider: {user.provider}</li>
          <li>
            Is Phone Based Account: {user.isPhoneBasedAccount ? "Yes" : "No"}
          </li>
        </ul>
      </div>

      {/* Conditional rendering based on login type */}
      {loginInfo.isGoogle && (
        <div
          style={{
            background: "#e3f2fd",
            padding: "10px",
            borderRadius: "4px",
            marginTop: "10px",
          }}
        >
          <strong>Google User:</strong> This user signed in with Google.
          Password changes should be done through Google account settings.
        </div>
      )}

      {loginInfo.isEmail && (
        <div
          style={{
            background: "#f3e5f5",
            padding: "10px",
            borderRadius: "4px",
            marginTop: "10px",
          }}
        >
          <strong>Email User:</strong> This user can change their password
          through the Security panel.
        </div>
      )}

      {loginInfo.isPhone && (
        <div
          style={{
            background: "#fff3e0",
            padding: "10px",
            borderRadius: "4px",
            marginTop: "10px",
          }}
        >
          <strong>Phone User:</strong> This user signed in with phone number.
          Password changes are not available.
        </div>
      )}
    </div>
  );
};

export default LoginTypeExample;
