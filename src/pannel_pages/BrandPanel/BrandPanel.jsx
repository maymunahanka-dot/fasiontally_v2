import { useState, useEffect } from "react";
import { ChevronLeft, Upload, Link, Loader2 } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../backend/firebase.config";
import { useNewAuth } from "../../contexts/NewAuthContext";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
import { getEffectiveUserEmail } from "../../utils/teamUtils";
import Input from "../../components/Input";
import "./BrandPanel.css";

const BrandPanel = ({ onClose }) => {
  const { user } = useNewAuth();

  // Form state
  const [brandName, setBrandName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [brandLogo, setBrandLogo] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#666666");
  const [footerText, setFooterText] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const [errors, setErrors] = useState({});

  // Load existing brand data on component mount
  useEffect(() => {
    if (user?.email) {
      loadBrandData();
    }
  }, [user]);

  const loadBrandData = async () => {
    try {
      setLoading(true);
      // Get effective email (main admin's email for team members)
      const effectiveEmail = getEffectiveUserEmail(user);
      console.log("📧 BrandPanel: Using effective email:", effectiveEmail);

      // Load user data first to get backup logo
      const userDocRef = doc(db, "fashiontally_users", effectiveEmail);
      const userDoc = await getDoc(userDocRef);
      let userLogoUrl = "";

      if (userDoc.exists()) {
        const userData = userDoc.data();
        userLogoUrl = userData.logoUrl || userData.profilePicture || "";
      }

      const docRef = doc(db, "fashiontally_brand_settings", effectiveEmail);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Load existing brand settings
        const data = docSnap.data();
        setBrandName(data.businessName || "");
        setBusinessAddress(data.businessAddress || "");
        setPhoneNumber(data.businessPhone || "");
        setEmail(data.businessEmail || "");
        setWebsite(data.businessWebsite || "");
        setInstagramHandle(data.instagramHandle || "");
        setBankName(data.bankName || "");
        setAccountNumber(data.accountNumber || "");
        setAccountName(data.accountName || "");
        // Use brand logo, fallback to user logo
        setLogoUrl(data.logoUrl || userLogoUrl);
        setPrimaryColor(data.primaryColor || "#000000");
        setSecondaryColor(data.secondaryColor || "#666666");
        setFooterText(data.footerText || "");
        setTermsAndConditions(data.termsAndConditions || "");
      } else {
        // No brand settings exist - only pre-fill basic info from signup
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Only pre-fill the business name from signup, leave other fields empty for user to fill
          setBrandName(userData.businessName || "");
          setEmail(userData.email || "");
          // Use user logo as fallback
          setLogoUrl(userLogoUrl);
          // Leave other fields empty - don't pre-fill with profile data
          setBusinessAddress("");
          setPhoneNumber("");
          setWebsite("");
          setInstagramHandle("");
          setBankName("");
          setAccountNumber("");
          setAccountName("");
          setPrimaryColor("#000000");
          setSecondaryColor("#666666");
          setFooterText("");
          setTermsAndConditions("");
        }
      }
    } catch (error) {
      console.error("Error loading brand data:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!brandName.trim()) {
      newErrors.brandName = "Brand name is required";
    }

    if (!businessAddress.trim()) {
      newErrors.businessAddress = "Business address is required";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email address is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadLogoToStorage = async (file) => {
    if (!file || !user) return null;

    try {
      setLogoUploading(true);

      // Upload to Cloudinary using the utility function
      const downloadURL = await uploadToCloudinary(file);

      console.log("Logo uploaded successfully:", downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading logo:", error);
      throw new Error(
        error.message || "Failed to upload logo. Please try again."
      );
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      let finalLogoUrl = logoUrl;

      // Upload logo if a new file was selected
      if (brandLogo) {
        finalLogoUrl = await uploadLogoToStorage(brandLogo);
      }

      // Prepare brand data
      const brandData = {
        businessName: brandName,
        businessAddress: businessAddress,
        businessPhone: phoneNumber,
        businessEmail: email,
        businessWebsite: website,
        instagramHandle: instagramHandle,
        bankName: bankName,
        accountNumber: accountNumber,
        accountName: accountName,
        logoUrl: finalLogoUrl,
        primaryColor: primaryColor,
        secondaryColor: secondaryColor,
        footerText: footerText,
        termsAndConditions: termsAndConditions,
        userEmail: getEffectiveUserEmail(user),
        updatedAt: new Date(),
      };

      // Save to Firebase
      const effectiveEmail = getEffectiveUserEmail(user);
      const docRef = doc(db, "fashiontally_brand_settings", effectiveEmail);
      await setDoc(docRef, brandData, { merge: true });

      console.log("Brand settings saved successfully:", brandData);

      // Show success message (you can replace with your preferred notification method)
      alert("Brand settings saved successfully!");

      onClose();
    } catch (error) {
      console.error("Error saving brand settings:", error);
      alert("Failed to save brand settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("Logo file must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      setBrandLogo(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setLogoUrl(previewUrl);
    }
  };

  const getBrandInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="brand_panel">
        <div className="brand_header">
          <button className="brand_back_btn" onClick={onClose}>
            <ChevronLeft size={20} />
            Brand
          </button>
        </div>
        <div className="brand_loading">
          <Loader2 className="animate-spin" size={24} />
          <p>Loading brand settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="brand_panel">
      {/* Header */}
      <div className="brand_header">
        <button className="brand_back_btn" onClick={onClose}>
          <ChevronLeft size={20} />
          Brand
        </button>
      </div>

      {/* Subtitle */}
      <div className="brand_subtitle">
        <p>Manage your business details</p>
      </div>

      {/* Form */}
      <form className="brand_form" onSubmit={handleSubmit}>
        {/* Brand Logo Section */}
        <div className="brand_logo_section">
          <label className="brand_section_label">Brand Logo</label>
          <div className="brand_logo_container">
            <div className="brand_logo_display">
              {logoUrl || brandLogo ? (
                <img
                  src={brandLogo ? URL.createObjectURL(brandLogo) : logoUrl}
                  alt="Brand Logo"
                  className="brand_logo_image"
                />
              ) : (
                <span className="brand_logo_initials">
                  {getBrandInitials(brandName)}
                </span>
              )}
            </div>
            <button
              type="button"
              className="brand_upload_btn"
              onClick={() =>
                document.getElementById("brand-logo-input").click()
              }
              disabled={logoUploading}
            >
              {logoUploading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload Logo
                </>
              )}
            </button>
            <input
              id="brand-logo-input"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="brand_logo_input"
            />
          </div>
        </div>

        {/* Brand Name */}
        <div className="brand_form_group">
          <Input
            label="Brand Name"
            type="text"
            placeholder="M&S Design"
            value={brandName}
            onChange={(e) => {
              setBrandName(e.target.value);
              clearError("brandName");
            }}
            error={errors.brandName}
            required
            variant="rounded"
          />
        </div>

        {/* Business Address */}
        <div className="brand_form_group">
          <Input
            label="Business Address"
            type="textarea"
            placeholder="12 Fashion Street, Victoria Island, Lagos"
            value={businessAddress}
            onChange={(e) => {
              setBusinessAddress(e.target.value);
              clearError("businessAddress");
            }}
            error={errors.businessAddress}
            required
            variant="rounded"
            rows={3}
          />
        </div>

        {/* Phone Number */}
        <div className="brand_form_group">
          <Input
            label="Phone Number"
            type="number"
            placeholder="+234 803 456 7890"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              clearError("phoneNumber");
            }}
            error={errors.phoneNumber}
            required
            variant="rounded"
          />
        </div>

        {/* Email */}
        <div className="brand_form_group">
          <Input
            label="Email"
            type="email"
            placeholder="hello@fashiontalfy.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError("email");
            }}
            error={errors.email}
            required
            variant="rounded"
          />
        </div>

        {/* Website */}
        <div className="brand_form_group">
          <Input
            label="Website"
            type="text"
            placeholder="www.M&S.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            variant="rounded"
          />
        </div>

        {/* Instagram Handle */}
        <div className="brand_form_group">
          <Input
            label="Instagram Handle"
            type="text"
            placeholder="@fashiontalfy"
            value={instagramHandle}
            onChange={(e) => setInstagramHandle(e.target.value)}
            variant="rounded"
          />
        </div>

        {/* Brand Colors Section */}
        <div className="brand_colors_section">
          <label className="brand_section_label">Brand Colors</label>
          <div className="brand_colors_container">
            <div className="brand_form_group">
              <label className="brand_color_label">Primary Color</label>
              <div className="brand_color_input_container">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="brand_color_picker"
                />
                <Input
                  type="text"
                  placeholder="#000000"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  variant="rounded"
                />
              </div>
            </div>
            <div className="brand_form_group">
              <label className="brand_color_label">Secondary Color</label>
              <div className="brand_color_input_container">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="brand_color_picker"
                />
                <Input
                  type="text"
                  placeholder="#666666"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  variant="rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="brand_form_group">
          <Input
            label="Invoice Footer Text"
            type="textarea"
            placeholder="Thank you for your business! Payment terms: Net 30 days."
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            variant="rounded"
            rows={3}
          />
        </div>

        {/* Terms and Conditions */}
        <div className="brand_form_group">
          <Input
            label="Terms and Conditions"
            type="textarea"
            placeholder="Enter your terms and conditions here..."
            value={termsAndConditions}
            onChange={(e) => setTermsAndConditions(e.target.value)}
            variant="rounded"
            rows={4}
          />
        </div>

        {/* Bank Details Section */}
        <div className="brand_bank_section">
          <div className="brand_bank_header">
            <label className="brand_section_label">Bank Details</label>
            <button type="button" className="brand_link_btn">
              <Link size={16} />
            </button>
          </div>

          <div className="brand_form_group">
            <Input
              label="Bank Name"
              type="text"
              placeholder="GTBank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              variant="rounded"
            />
          </div>

          <div className="brand_form_group">
            <Input
              label="Account Number"
              type="text"
              placeholder="0123456789"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              variant="rounded"
            />
          </div>

          <div className="brand_form_group">
            <Input
              label="Account Name"
              type="text"
              placeholder="M&S Design"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              variant="rounded"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="brand_save_btn"
          disabled={saving || logoUploading}
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Saving Changes...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </div>
  );
};

export default BrandPanel;
