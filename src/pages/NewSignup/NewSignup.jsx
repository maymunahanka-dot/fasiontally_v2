import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useNewAuth } from "../../contexts/NewAuthContext";
import Step1PersonalInfo from "./steps/Step1PersonalInfo";
import Step2Password from "./steps/Step2Password";
import Step3BusinessInfo from "./steps/Step3BusinessInfo";
import "./NewSignup.css";
import logo from "../../assets/Image/logo.png";

const NewSignup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get("plan");
  const { signUpWithEmail, signInWithGoogle } = useNewAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 - Personal Info
    name: "",
    email: "",
    phone: "",

    // Step 2 - Password
    password: "",
    confirmPassword: "",

    // Step 3 - Business Info
    businessName: "",
    category: "",
    country: "",
    logo: "",
    logoFile: null,
  });

  const [errors, setErrors] = useState({});

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async () => {
    console.log("🚀 Starting signup process...");
    console.log("🚀 Form data:", formData);

    try {
      const result = await signUpWithEmail(formData);
      console.log("🚀 Signup result:", result);
      if (result.success) {
        // Navigation is handled in the context
        console.log("✅ Signup successful");
      } else {
        console.error("❌ Signup failed:", result.error);
      }
    } catch (error) {
      console.error("❌ Signup error:", error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1PersonalInfo
            formData={formData}
            errors={errors}
            setErrors={setErrors}
            onInputChange={handleInputChange}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <Step2Password
            formData={formData}
            errors={errors}
            setErrors={setErrors}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <Step3BusinessInfo
            formData={formData}
            errors={errors}
            setErrors={setErrors}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="n_s_u_main-signup-con">
      <div className="n_s_u_signup-step-left-sec">
        <div className="n_s_u_signup-step-left-sec-content">
          <img src={logo} alt="" className="n_s_u_s-s-logo" />
          <h2 className="n_s_u_s-s-logo-text">
            Run Your Fashion Business Smarter, Faster, Better
          </h2>
        </div>
      </div>
      <div className="n_s_u_signup-step-right-sec">
        <div className="n_s_u_signup-step-right-sec-content">
          {selectedPlan && (
            <div className="selected-plan-indicator">
              <p className="selected-plan-text">
                Selected Plan: <strong>{selectedPlan.toUpperCase()}</strong>
              </p>
            </div>
          )}
          <p className="n_s_u_s-s-step">step {currentStep} / 3</p>
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default NewSignup;
