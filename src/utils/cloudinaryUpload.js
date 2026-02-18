/**
 * Upload image to Cloudinary using unsigned upload preset
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The URL of the uploaded image
 */
export const uploadToCloudinary = async (file) => {
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const folder = import.meta.env.VITE_CLOUDINARY_UPLOAD_FOLDER;

    // Validate environment variables
    if (!cloudName) {
      throw new Error("Cloudinary cloud name not configured");
    }
    if (!uploadPreset) {
      throw new Error(
        "Cloudinary upload preset not configured. Please check CLOUDINARY_SETUP.md"
      );
    }

    // Create form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary error:", errorData);

      // Provide helpful error messages
      if (errorData.error?.message?.includes("API key")) {
        throw new Error(
          "Upload preset not configured. Please follow instructions in CLOUDINARY_SETUP.md"
        );
      }

      throw new Error(errorData.error?.message || "Failed to upload image");
    }

    const data = await response.json();
    console.log("Upload successful:", data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};
