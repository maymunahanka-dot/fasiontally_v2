# OTP Verification Modal Component

A reusable, customizable OTP (One-Time Password) verification modal component for React applications.

## Features

✅ Fully reusable across different pages  
✅ Customizable OTP length (4, 6, 8 digits, etc.)  
✅ Built-in error handling  
✅ Loading states  
✅ Cancel functionality  
✅ Responsive design  
✅ Smooth animations  
✅ Theme-aware (uses CSS variables)

## Installation

The component is already created in your project at:

```
_v1/src/components/OTPVerificationModal/
├── OTPVerificationModal.jsx
├── OTPVerificationModal.css
├── OTPVerificationModal.example.jsx
└── README.md
```

## Basic Usage

```jsx
import { useState } from "react";
import OTPVerificationModal from "./components/OTPVerificationModal/OTPVerificationModal";

function MyComponent() {
  const [showOTPModal, setShowOTPModal] = useState(false);

  const handleVerify = async (otp) => {
    // Your verification logic here
    const response = await fetch("/api/verify-otp", {
      method: "POST",
      body: JSON.stringify({ otp }),
    });

    if (!response.ok) {
      throw new Error("Invalid OTP");
    }

    // Success - close modal
    setShowOTPModal(false);
  };

  return (
    <div>
      <button onClick={() => setShowOTPModal(true)}>Verify Account</button>

      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleVerify}
        title="Verify Your Account"
        message="Enter the 6-digit code sent to your email"
        otpLength={6}
      />
    </div>
  );
}
```

## Props

| Prop        | Type     | Default                   | Description                                            |
| ----------- | -------- | ------------------------- | ------------------------------------------------------ |
| `isOpen`    | boolean  | required                  | Controls modal visibility                              |
| `onClose`   | function | required                  | Called when Cancel or X is clicked                     |
| `onVerify`  | function | required                  | Called when Verify is clicked. Should return a Promise |
| `title`     | string   | "Verify OTP"              | Modal title                                            |
| `message`   | string   | "Please enter the OTP..." | Message shown above OTP input                          |
| `otpLength` | number   | 6                         | Number of OTP digits                                   |

## Examples

### Example 1: Signup Verification

```jsx
<OTPVerificationModal
  isOpen={showOTPModal}
  onClose={() => setShowOTPModal(false)}
  onVerify={async (otp) => {
    await verifySignupOTP(otp);
    goToNextStep();
  }}
  title="Verify Your Account"
  message="We've sent a code to your email"
  otpLength={6}
/>
```

### Example 2: Phone Verification

```jsx
<OTPVerificationModal
  isOpen={showOTPModal}
  onClose={() => setShowOTPModal(false)}
  onVerify={async (otp) => {
    const result = await verifyPhone(phoneNumber, otp);
    if (!result.success) {
      throw new Error("Invalid code");
    }
  }}
  title="Verify Phone Number"
  message={`Enter code sent to ${phoneNumber}`}
  otpLength={6}
/>
```

### Example 3: Two-Factor Authentication

```jsx
<OTPVerificationModal
  isOpen={showOTPModal}
  onClose={() => setShowOTPModal(false)}
  onVerify={async (otp) => {
    await verify2FA(otp);
    redirectToDashboard();
  }}
  title="Two-Factor Authentication"
  message="Enter code from your authenticator app"
  otpLength={6}
/>
```

### Example 4: Custom Length (4-digit PIN)

```jsx
<OTPVerificationModal
  isOpen={showOTPModal}
  onClose={() => setShowOTPModal(false)}
  onVerify={async (otp) => {
    if (otp !== userPIN) {
      throw new Error("Incorrect PIN");
    }
  }}
  title="Enter PIN"
  message="Enter your 4-digit PIN"
  otpLength={4}
/>
```

## Error Handling

The `onVerify` function should throw an error to display an error message:

```jsx
const handleVerify = async (otp) => {
  try {
    const response = await fetch("/api/verify", {
      method: "POST",
      body: JSON.stringify({ otp }),
    });

    if (!response.ok) {
      throw new Error("Invalid OTP. Please try again.");
    }

    // Success
    setShowOTPModal(false);
  } catch (error) {
    // Error will be displayed in the modal
    throw error;
  }
};
```

## Styling

The component uses CSS variables for theming. You can customize colors by overriding these variables:

```css
:root {
  --background: #ffffff;
  --foreground: #1f2937;
  --border: #e5e7eb;
  --primary: #0d9488;
  --primary-hover: #0f766e;
  --muted-foreground: #6b7280;
}
```

## Integration with Signup Flow

Already integrated in `Step1PersonalInfo.jsx`:

1. User fills in personal information
2. Clicks "Next" button
3. OTP modal appears
4. User enters OTP
5. After verification, proceeds to Step 2

## API Integration

To integrate with your backend:

```jsx
const handleOTPVerify = async (otp) => {
  try {
    const response = await fetch("/api/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        otp: otp,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Verification failed");
    }

    // Success
    setShowOTPModal(false);
    onNext(); // Go to next step
  } catch (error) {
    throw error; // Modal will display the error
  }
};
```

## Mobile Responsive

The component is fully responsive and adapts to mobile screens:

- Stacks buttons vertically on mobile
- Adjusts padding and font sizes
- Maintains usability on small screens

## Accessibility

- Keyboard navigation supported
- Focus management
- ARIA labels (can be enhanced further)
- Clear error messages

## Notes

- The component uses the existing `OTPInput` component
- Integrates with the existing `Button` component
- Follows the project's design system
- Animations are smooth and performant

## Support

For more examples, see `OTPVerificationModal.example.jsx`
