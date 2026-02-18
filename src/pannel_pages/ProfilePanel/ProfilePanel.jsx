import { useState, useEffect } from "react";
import { ChevronLeft, Camera, Loader2 } from "lucide-react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { auth, db } from "../../backend/firebase.config";
import { useNewAuth } from "../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../utils/teamUtils";
import Input from "../../components/Input";
import toast from "react-hot-toast";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
import "./ProfilePanel.css";

const ProfilePanel = ({ onClose }) => {
  const { user, updateUserProfile, refreshUserData } = useNewAuth();

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  // Loading states
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [errors, setErrors] = useState({});

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          // Get effective email (main admin's email for team members)
          const effectiveEmail = getEffectiveUserEmail(user);
          console.log(
            "📧 ProfilePanel: Using effective email:",
            effectiveEmail
          );

          // Get user data from Firestore
          const userDocRef = doc(db, "fashiontally_users", effectiveEmail);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFullName(
              userData.name || userData.displayName || user.displayName || ""
            );
            setEmail(user.email || "");
            setPhone(userData.phone || userData.phoneNumber || "");
            setAddress(userData.address || userData.location || "");
            setBio(userData.bio || "");
            setCurrentImageUrl(userData.photoURL || user.photoURL || "");
          } else {
            // Use auth data as fallback
            setFullName(user.displayName || user.name || "");
            setEmail(user.email || "");
            setPhone(user.phoneNumber || "");
            setCurrentImageUrl(user.photoURL || "");
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          // Use auth data as fallback
          setFullName(user.displayName || user.name || "");
          setEmail(user.email || "");
          setPhone(user.phoneNumber || "");
          setCurrentImageUrl(user.photoURL || "");
        }
      }
      setInitialLoading(false);
    };

    loadUserData();
  }, [user]);

  // Update form when user data changes from other parts of the app
  useEffect(() => {
    if (user && !initialLoading) {
      setFullName(user.displayName || user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || user.phoneNumber || "");
      setAddress(user.address || user.location || "");
      setBio(user.bio || "");
      setCurrentImageUrl(user.photoURL || "");
    }
  }, [
    user?.name,
    user?.displayName,
    user?.phone,
    user?.phoneNumber,
    user?.address,
    user?.location,
    user?.bio,
    user?.photoURL,
    initialLoading,
  ]);

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

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email address is invalid";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImageToStorage = async (imageFile) => {
    if (!imageFile || !user) return null;

    try {
      setImageUploading(true);

      // Check if user is authenticated
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You must be logged in to upload images.");
      }

      console.log("Uploading image to Cloudinary...");

      // Upload to Cloudinary
      const downloadURL = await uploadToCloudinary(imageFile);

      console.log("Image uploaded successfully:", downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);

      // Provide specific error messages
      if (error.message.includes("not configured")) {
        throw new Error(
          "Image upload is not configured. Please contact support."
        );
      } else if (error.message.includes("network")) {
        throw new Error(
          "Network error. Please check your internet connection and try again."
        );
      } else {
        throw new Error(
          error.message || "Failed to upload image. Please try again."
        );
      }
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Check if user is authenticated
    if (!user || !auth.currentUser) {
      toast.error("You must be logged in to update your profile.");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = currentImageUrl;
      let imageUploadFailed = false;

      // Upload new image if selected
      if (profileImage) {
        try {
          imageUrl = await uploadImageToStorage(profileImage);
          toast.success("Profile image uploaded successfully!");
        } catch (imageError) {
          console.error("Image upload failed:", imageError);
          imageUploadFailed = true;

          // Show specific error message but continue with profile update
          toast.error(`Image upload failed: ${imageError.message}`);
          toast.info("Continuing with profile update without image change...");

          // Keep the current image URL
          imageUrl = currentImageUrl;
        }
      }

      // Prepare user data
      const userData = {
        name: fullName,
        displayName: fullName,
        phone: phone,
        phoneNumber: phone,
        address: address,
        location: address,
        bio: bio,
        photoURL: imageUrl,
        updatedAt: new Date().toISOString(),
      };

      // Get effective email (main admin's email for team members)
      const effectiveEmail = getEffectiveUserEmail(user);

      // Update Firestore document
      const userDocRef = doc(db, "fashiontally_users", effectiveEmail);
      await updateDoc(userDocRef, userData);

      // Update Firebase Auth profile using the current authenticated user
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, {
          displayName: fullName,
          photoURL: imageUrl,
        });
      }

      // Refresh user data from Firestore to get the latest data
      const refreshedData = await refreshUserData();

      // If refresh failed, fallback to manual update
      if (!refreshedData) {
        const fallbackData = {
          ...user,
          name: fullName,
          displayName: fullName,
          phone: phone,
          phoneNumber: phone,
          address: address,
          location: address,
          bio: bio,
          photoURL: imageUrl,
        };
        updateUserProfile(fallbackData);
      }

      console.log("Profile updated successfully across the entire app");

      // Show success message with toast
      if (imageUploadFailed && profileImage) {
        toast.success(
          "Profile updated successfully! Note: Image upload failed, but other changes are saved."
        );
      } else {
        toast.success(
          "Profile updated successfully! Changes are now visible across the app."
        );
      }

      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error.message || "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file.");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB.");
        return;
      }

      setProfileImage(file);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDisplayImage = () => {
    if (profileImage) {
      return URL.createObjectURL(profileImage);
    }
    return currentImageUrl;
  };

  if (initialLoading) {
    return (
      <div className="profile_panel">
        <div className="profile_loading">
          <Loader2 size={32} className="profile_loading_spinner" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile_panel">
      {/* Header */}
      <div className="profile_header">
        <button className="profile_back_btn" onClick={onClose}>
          <ChevronLeft size={20} />
          Profile
        </button>
      </div>

      {/* Subtitle */}
      <div className="profile_subtitle">
        <p>Update your personal information</p>
      </div>

      {/* Form */}
      <form className="profile_form" onSubmit={handleSubmit}>
        {/* Profile Image Section */}
        <div className="profile_image_section">
          <div className="profile_avatar_container">
            <div className="profile_avatar">
              {getDisplayImage() ? (
                <img
                  src={getDisplayImage()}
                  alt="Profile"
                  className="profile_avatar_image"
                />
              ) : (
                <span className="profile_avatar_initials">
                  {getInitials(fullName)}
                </span>
              )}
              {imageUploading && (
                <div className="profile_avatar_loading">
                  <Loader2 size={24} className="profile_avatar_spinner" />
                  <span className="profile_upload_text">Uploading...</span>
                </div>
              )}
            </div>
            <button
              type="button"
              className="profile_camera_btn"
              onClick={() =>
                document.getElementById("profile-image-input").click()
              }
              disabled={imageUploading}
            >
              {imageUploading ? (
                <Loader2 size={16} className="profile_camera_spinner" />
              ) : (
                <Camera size={16} />
              )}
            </button>
            <input
              id="profile-image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="profile_image_input"
              disabled={imageUploading}
            />
          </div>
          <p className="profile_image_hint">
            Click the camera icon to change your profile picture
          </p>
        </div>

        {/* Form Fields */}
        <div className="profile_form_group">
          <Input
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              clearError("fullName");
            }}
            error={errors.fullName}
            required
            variant="rounded"
          />
        </div>

        <div className="profile_form_group">
          <Input
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError("email");
            }}
            error={errors.email}
            required
            variant="rounded"
            disabled={true}
            helperText="Email cannot be changed"
          />
        </div>

        <div className="profile_form_group">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+234 800 000 0000"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              clearError("phone");
            }}
            error={errors.phone}
            required
            variant="rounded"
          />
        </div>

        <div className="profile_form_group">
          <Input
            label="Address"
            type="text"
            placeholder="Enter your address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            variant="rounded"
          />
        </div>

        <div className="profile_form_group">
          <Input
            label="Bio"
            type="textarea"
            placeholder="Tell us about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            variant="rounded"
            rows={4}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="profile_save_btn"
          disabled={loading || imageUploading}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="profile_save_spinner" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </div>
  );
};

export default ProfilePanel;
