import { useState, useRef, useEffect } from "react";
import { X, Upload, User, Users, Search } from "lucide-react";
import { useNewAuth } from "../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../utils/teamUtils";
import {
  addDesign,
  updateDesign,
  getClients,
} from "../../backend/services/crmService";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
import { useTheme } from "../../contexts/ThemeContext";
import Input from "../../components/Input/Input";
import Button from "../../components/button/Button";
import "./AddDesignPanel.css";

const AddDesignPanel = ({
  onClose,
  onSubmit,
  editMode = false,
  initialData = null,
}) => {
  const { user } = useNewAuth();
  const { isDark } = useTheme();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Uniforms",
    customCategory: "",
    description: "",
    price: "",
    imageUrl: "",
    images: [],
    clientId: "",
    clientName: "",
  });

  const [errors, setErrors] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [fillMode, setFillMode] = useState("manual"); // "manual" or "client"

  const categories = [
    "Uniforms",
    "Shirts",
    "Children's Wear",
    "Dresses",
    "Tops",
    "Bottoms",
    "Others",
  ];

  // Load clients when component mounts
  useEffect(() => {
    if (user?.email) {
      loadClients();
    }
  }, [user?.email]);

  const loadClients = async () => {
    try {
      setClientsLoading(true);
      const effectiveEmail = getEffectiveUserEmail(user);
      const clientsData = await getClients(effectiveEmail);
      setClients(clientsData);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setClientsLoading(false);
    }
  };

  // Handle client selection
  const handleClientSelect = (client) => {
    setFormData((prev) => ({
      ...prev,
      clientId: client.id,
      clientName: client.name || "",
    }));
    setFillMode("client");
    setShowClientSelector(false);
    setClientSearchTerm("");
  };

  // Filter clients based on search
  const filteredClients = clients.filter((client) => {
    const searchLower = clientSearchTerm.toLowerCase();
    return (
      client.name?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone?.toLowerCase().includes(searchLower)
    );
  });

  // Initialize form data when in edit mode
  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        name: initialData.name || "",
        category: initialData.category || "Uniforms",
        customCategory: initialData.customCategory || "",
        description: initialData.description || "",
        price: initialData.price || "",
        imageUrl: initialData.imageUrl || "",
        images: initialData.images || [],
        clientId: initialData.clientId || "",
        clientName: initialData.clientName || "",
      });

      if (
        initialData.imageUrl ||
        (initialData.images && initialData.images.length > 0)
      ) {
        setImagePreview(initialData.imageUrl || initialData.images[0]);
      }
    } else if (
      initialData &&
      (initialData.clientId || initialData.clientName)
    ) {
      // Pre-fill client information when creating new design from client details
      setFormData({
        name: "",
        category: "Uniforms",
        customCategory: "",
        description: "",
        price: "",
        imageUrl: "",
        images: [],
        clientId: initialData.clientId || "",
        clientName: initialData.clientName || "",
      });
      setFillMode("client");
    } else {
      // Reset form for new design
      setFormData({
        name: "",
        category: "Uniforms",
        customCategory: "",
        description: "",
        price: "",
        imageUrl: "",
        images: [],
        clientId: "",
        clientName: "",
      });
    }
    setErrors({});
  }, [editMode, initialData]);

  // Cleanup image preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleInputChange = (field) => (e) => {
    const value = e.target.type === "file" ? e.target.files[0] : e.target.value;
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

  const handleImageUpload = async (file) => {
    if (file && file.type.startsWith("image/")) {
      try {
        setIsUploading(true);

        // Clean up previous preview URL if it exists
        if (imagePreview && imagePreview.startsWith("blob:")) {
          URL.revokeObjectURL(imagePreview);
        }

        // Create temporary preview
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);

        // Upload to Cloudinary
        const cloudinaryUrl = await uploadToCloudinary(file);

        // Update form data with Cloudinary URL
        setFormData((prev) => ({
          ...prev,
          images: [cloudinaryUrl],
          imageUrl: cloudinaryUrl,
        }));

        // Update preview to Cloudinary URL
        setImagePreview(cloudinaryUrl);

        // Clean up blob URL
        URL.revokeObjectURL(previewUrl);

        // Clear any existing error
        if (errors.images) {
          setErrors((prev) => ({
            ...prev,
            images: "",
          }));
        }

        console.log("Design image uploaded successfully:", cloudinaryUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        alert(error.message || "Failed to upload image. Please try again.");

        // Clean up on error
        if (imagePreview && imagePreview.startsWith("blob:")) {
          URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleImageAreaClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    // Clean up the previous URL if it's a blob URL
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setFormData((prev) => ({
      ...prev,
      images: [],
      imageUrl: "",
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Design name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (formData.category === "Others" && !formData.customCategory.trim()) {
      newErrors.customCategory =
        "Custom category is required when 'Others' is selected";
    }

    if (
      formData.price &&
      (isNaN(formData.price) || parseFloat(formData.price) < 0)
    ) {
      newErrors.price = "Please enter a valid price";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user?.email) {
      alert("User not authenticated");
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare data for submission
      const submitData = {
        name: formData.name.trim(),
        category: formData.category,
        customCategory:
          formData.category === "Others" ? formData.customCategory.trim() : "",
        description: formData.description.trim(),
        price: formData.price ? parseFloat(formData.price) : 0,
        imageUrl: formData.imageUrl,
        images: formData.images,
        clientId: formData.clientId || "",
        clientName: formData.clientName || "",
        status: "Active", // Default status
      };

      const effectiveEmail = getEffectiveUserEmail(user);

      if (editMode && initialData?.id) {
        await updateDesign(initialData.id, submitData);
      } else {
        await addDesign(submitData, effectiveEmail);
      }

      // Call onSubmit callback to refresh the designs list
      if (onSubmit) {
        await onSubmit();
      }

      handleClose();
    } catch (error) {
      console.error("Error saving design:", error);
      alert("Error saving design. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clean up blob URLs
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setFormData({
      name: "",
      category: "Uniforms",
      customCategory: "",
      description: "",
      price: "",
      imageUrl: "",
      images: [],
      clientId: "",
      clientName: "",
    });
    setErrors({});
    setImagePreview(null);
    setShowClientSelector(false);
    setClientSearchTerm("");
    setFillMode("manual");
    onClose();
  };

  return (
    <div
      className={`adp_add-design-panell ${
        isDark ? "dark-theme" : "light-theme"
      }`}
    >
      {/* Header */}
      <div className="adp_add-design-header">
        <button className="adp_close-btn" onClick={handleClose}>
          <X size={20} />
        </button>
        <h2 className="adp_panel-title">
          {editMode ? "Edit Design" : "Add New Design"}
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="adp_add-design-form">
        {/* Client Information Section */}
        <div className="adp_form-section">
          <label className="adp_section-label">
            Client Information (Optional)
          </label>

          {/* Fill Mode Selection */}
          <div className="adp_form-field">
            <div className="fill_mode_options">
              <button
                type="button"
                className={`fill_mode_btn ${
                  fillMode === "manual" ? "active" : ""
                }`}
                onClick={() => setFillMode("manual")}
              >
                <User size={16} />
                Manual Entry
              </button>
              <button
                type="button"
                className={`fill_mode_btn ${
                  fillMode === "client" ? "active" : ""
                }`}
                onClick={() => setShowClientSelector(true)}
              >
                <Users size={16} />
                Select from Clients
              </button>
            </div>
          </div>

          {formData.clientName && (
            <div className="adp_form-field">
              <Input
                type="text"
                label="Selected Client"
                value={formData.clientName}
                disabled
                variant="rounded"
              />
            </div>
          )}
        </div>

        {/* Design Name */}
        <div className="adp_form-section">
          <Input
            type="text"
            label="Design Name *"
            placeholder="e.g., Ankara Maxi Dress"
            value={formData.name}
            onChange={handleInputChange("name")}
            error={errors.name}
            required
            variant="rounded"
          />
        </div>

        {/* Category */}
        <div className="adp_form-section">
          <label className="adp_section-label">Category *</label>
          <select
            value={formData.category}
            onChange={handleInputChange("category")}
            className={`adp_select ${errors.category ? "error" : ""}`}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className="error_message">{errors.category}</span>
          )}
        </div>

        {/* Custom Category */}
        {formData.category === "Others" && (
          <div className="adp_form-section">
            <Input
              type="text"
              label="Custom Category *"
              placeholder="Enter custom category"
              value={formData.customCategory}
              onChange={handleInputChange("customCategory")}
              error={errors.customCategory}
              required
              variant="rounded"
            />
          </div>
        )}

        {/* Price */}
        <div className="adp_form-section">
          <Input
            type="number"
            label="Price (₦)"
            placeholder="e.g., 85000"
            value={formData.price}
            onChange={handleInputChange("price")}
            error={errors.price}
            variant="rounded"
            min="0"
            step="0.01"
          />
        </div>

        {/* Description */}
        <div className="adp_form-section">
          <Input
            type="textarea"
            label="Description"
            placeholder="Brief description of the design..."
            value={formData.description}
            onChange={handleInputChange("description")}
            variant="rounded"
            rows={4}
          />
        </div>

        {/* Style Images Section */}
        <div className="adp_form-section">
          <label className="adp_section-label">Style Images (Optional)</label>
          <div
            className={`adp_image-upload-area ${
              dragOver ? "adp_drag-over" : ""
            } ${imagePreview ? "adp_has-image" : ""} ${
              isUploading ? "adp_uploading" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleImageAreaClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleImageAreaClick();
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Upload design image"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="adp_hidden-file-input"
            />

            {imagePreview ? (
              <div className="adp_image-preview-container">
                <img
                  src={imagePreview}
                  alt="Design preview"
                  className="adp_image-preview"
                />
                {isUploading ? (
                  <div className="adp_upload-overlay">
                    <div className="adp_upload-spinner"></div>
                    <p>Uploading...</p>
                  </div>
                ) : (
                  <div className="adp_image-overlay">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="adp_remove-image-btn"
                    >
                      <X size={16} />
                    </button>
                    <p>Click to change image</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="adp_upload-placeholder">
                <div className="adp_upload-icon-container">
                  <Upload size={32} className="adp_upload-icon" />
                </div>
                <p className="adp_upload-text">Click to upload design images</p>
                <p className="adp_upload-hint">PNG, JPG up to 10MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="adp_form-actions">
          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            className="adp_create-design-btn"
            disabled={isSubmitting || isUploading}
          >
            {isUploading
              ? "Uploading image..."
              : isSubmitting
              ? "Saving..."
              : editMode
              ? "Update Design"
              : "Create Design"}
          </Button>
        </div>
      </form>

      {/* Client Selector Slide-in Menu */}
      {showClientSelector && (
        <div className="client_selector_overlay">
          <div className="client_selector_panel">
            <div className="client_selector_header">
              <h3>Select Client</h3>
              <button
                className="client_selector_close"
                onClick={() => {
                  setShowClientSelector(false);
                  setClientSearchTerm("");
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="client_selector_search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search clients by name, email, or phone"
                value={clientSearchTerm}
                onChange={(e) => setClientSearchTerm(e.target.value)}
              />
            </div>

            <div className="client_selector_list">
              {clientsLoading ? (
                <div className="client_selector_loading">
                  <p>Loading clients...</p>
                </div>
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="client_selector_item"
                    onClick={() => handleClientSelect(client)}
                  >
                    <div className="client_info">
                      <h4>{client.name}</h4>
                      <p>{client.email}</p>
                      {client.phone && (
                        <span className="client_phone">{client.phone}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="client_selector_empty">
                  <p>
                    {clientSearchTerm
                      ? "No clients found matching your search"
                      : "No clients available"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddDesignPanel;
