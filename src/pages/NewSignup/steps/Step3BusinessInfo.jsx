import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../components/Input";
import Button from "../../../components/button/Button";
import { uploadToCloudinary } from "../../../utils/cloudinaryUpload";

// Business categories
const businessCategories = [
  "Fashion Design",
  "Tailoring",
  "Clothing Store",
  "Boutique",
  "Fashion Accessories",
  "Textile Business",
  "Custom Clothing",
  "Fashion Consulting",
  "Other",
];

// Countries list
const countries = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United States",
  "United Kingdom",
  "Canada",
  "Other",
];

const Step3BusinessInfo = ({
  formData,
  errors,
  setErrors,
  onInputChange,
  onSubmit,
  onBack,
}) => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const validateStep3 = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business/Store name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.country) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateStep3()) {
      // Logo is already uploaded to Cloudinary in handleLogoChange
      // Just proceed with signup
      onSubmit();
    }
  };

  const handleLogoChange = async (file) => {
    if (file && file.type.startsWith("image/")) {
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        alert("File size must be less than 10MB");
        return;
      }

      // Create preview URL immediately
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);

      // Store file info
      onInputChange("logo", file.name);
      onInputChange("logoFile", file);

      // Upload to Cloudinary immediately
      setIsUploading(true);
      try {
        const cloudinaryUrl = await uploadToCloudinary(file);

        // Update formData with Cloudinary URL
        onInputChange("logoUrl", cloudinaryUrl);
        onInputChange("logo", cloudinaryUrl);

        console.log("Logo uploaded successfully:", cloudinaryUrl);
      } catch (error) {
        console.error("Error uploading logo:", error);
        setErrors({ logo: "Failed to upload logo. Please try again." });
        // Remove preview on error
        removeLogo();
      } finally {
        setIsUploading(false);
      }
    } else if (file) {
      alert("Please select a valid image file (PNG, JPG, GIF)");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleLogoChange(e.target.files[0]);
    }
  };

  const removeLogo = () => {
    // Clean up the preview URL to prevent memory leaks
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    onInputChange("logo", "");
    onInputChange("logoFile", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const isFormValid = !!(
    formData.businessName &&
    formData.category &&
    formData.country
  );

  return (
    <>
      <div className="n_s_u_s-s-header">
        <div className="n_s_u_s-s-header-l-s">
          <button className="n_s_u_s-s-back-btn" onClick={onBack} type="button">
            <svg
              className="n_s_u_s-s-back-icon"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M19 12H5m7-7l-7 7 7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="n_s_u_s-s-title-con">
        <h1 className="n_s_u_s-s-title">Business Information</h1>
        <p className="n_s_u_s-s-subtitle">Tell us about your business</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {/* Business Name/Store Name */}
        <Input
          type="text"
          label="Business/Store Name"
          value={formData.businessName}
          onChange={(e) => onInputChange("businessName", e.target.value)}
          placeholder="Enter your business or store name"
          required
          error={errors.businessName}
          active={!!formData.businessName}
          variant="rounded"
        />

        {/* Category Selection */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "10px",
              color: "var(--text-primary)",
              fontWeight: "500",
            }}
          >
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => onInputChange("category", e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "2px solid var(--border-primary)",
              borderRadius: "4px",
              fontSize: "1rem",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          >
            <option value="">Select Category</option>
            {businessCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <div className="n_s_u_error-message">{errors.category}</div>
          )}
        </div>

        {/* Country Selection */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "10px",
              color: "var(--text-primary)",
              fontWeight: "500",
            }}
          >
            Country
          </label>
          <select
            value={formData.country}
            onChange={(e) => onInputChange("country", e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "2px solid var(--border-primary)",
              borderRadius: "4px",
              fontSize: "1rem",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          {errors.country && (
            <div className="n_s_u_error-message">{errors.country}</div>
          )}
        </div>

        {/* Logo Upload - Drag and Drop */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "10px",
              color: "var(--text-primary)",
              fontWeight: "500",
            }}
          >
            Logo (Optional)
          </label>

          <div
            className={`n_s_u_logo-upload-area ${
              dragActive ? "drag-active" : ""
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              style={{ display: "none" }}
            />

            {logoPreview ? (
              <div className="n_s_u_logo-preview-container">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="n_s_u_logo-preview"
                />
                {isUploading && (
                  <div className="n_s_u_logo-upload-overlay">
                    <div className="n_s_u_logo-upload-spinner"></div>
                    <p className="n_s_u_logo-upload-text">Uploading...</p>
                  </div>
                )}
                {!isUploading && (
                  <div className="n_s_u_logo-preview-overlay">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLogo();
                      }}
                      className="n_s_u_logo-remove-btn"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M18 6L6 18M6 6l12 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <p className="n_s_u_logo-change-text">Click to change</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="n_s_u_logo-upload-content">
                <div className="n_s_u_upload-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="n_s_u_upload-text">
                  <p className="n_s_u_upload-main-text">
                    Drop your logo here, or{" "}
                    <span className="n_s_u_upload-link">browse</span>
                  </p>
                  <p className="n_s_u_upload-sub-text">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="n_s_u_s-s-submitbutton">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={!isFormValid || isUploading}
            className={
              isFormValid && !isUploading ? "" : "n_s_u_s-s-btn-inactive"
            }
          >
            {isUploading ? "Uploading..." : "Complete Signup"}
          </Button>
        </div>

        <p className="n_s_u_s-s-term">
          By signing up, you agree to the{" "}
          <span
            className="n_s_u_s-s-terml-link"
            onClick={() => navigate("/terms-of-service")}
          >
            Terms of Service
          </span>{" "}
          and{" "}
          <span
            className="n_s_u_s-s-terml-link"
            onClick={() => navigate("/privacy-policy")}
          >
            Data Processing Agreement
          </span>
        </p>

        <p className="n_s_u_s-s-already-have-account">
          Already have an account?{" "}
          <span
            className="n_s_u_s-s-link"
            onClick={() => (window.location.href = "/login")}
          >
            Sign in
          </span>
        </p>
      </form>
    </>
  );
};

export default Step3BusinessInfo;
