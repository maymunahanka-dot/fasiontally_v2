import { useState, useEffect } from "react";
import {
  X,
  Gift,
  DollarSign,
  Tag,
  Calendar,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Button from "../../components/button/Button";
import "./AddRewardPanel.css";

const AddRewardPanel = ({
  isOpen,
  onClose,
  onSubmit,
  editingReward = null,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pointsCost: 0,
    icon: "gift",
    category: "discount",
    isActive: true,
    usageLimit: "",
    validUntil: "",
  });

  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (editingReward) {
      setFormData({
        title: editingReward.title || "",
        description: editingReward.description || "",
        pointsCost: editingReward.pointsCost || 0,
        icon: editingReward.icon || "gift",
        category: editingReward.category || "discount",
        isActive:
          editingReward.isActive !== undefined ? editingReward.isActive : true,
        usageLimit: editingReward.usageLimit || "",
        validUntil: editingReward.validUntil
          ? new Date(editingReward.validUntil.seconds * 1000)
              .toISOString()
              .split("T")[0]
          : "",
      });
    } else {
      // Reset form for new reward
      setFormData({
        title: "",
        description: "",
        pointsCost: 0,
        icon: "gift",
        category: "discount",
        isActive: true,
        usageLimit: "",
        validUntil: "",
      });
    }
    setErrors({});
  }, [editingReward, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.pointsCost <= 0) {
      newErrors.pointsCost = "Points cost must be greater than 0";
    }

    if (formData.usageLimit && formData.usageLimit <= 0) {
      newErrors.usageLimit = "Usage limit must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare data for submission
    const submitData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      pointsCost: parseInt(formData.pointsCost) || 0,
      icon: formData.icon,
      category: formData.category,
      isActive: formData.isActive,
    };

    // Handle optional fields
    if (formData.usageLimit) {
      submitData.usageLimit = parseInt(formData.usageLimit);
    }

    if (formData.validUntil) {
      submitData.validUntil = new Date(formData.validUntil);
    }

    onSubmit(submitData);
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      pointsCost: 0,
      icon: "gift",
      category: "discount",
      isActive: true,
      usageLimit: "",
      validUntil: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="add_reward_overlay">
      <div className="add_reward_panel">
        <div className="add_reward_header">
          <h2>{editingReward ? "Edit Reward" : "Add Reward"}</h2>
          <button className="add_reward_close" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add_reward_form">
          {/* Basic Information */}
          <div className="add_reward_section">
            <h3>Basic Information</h3>

            <div className="add_reward_field">
              <label>
                <Gift size={16} />
                Reward Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., 10% Off Next Purchase"
                className={errors.title ? "error" : ""}
              />
              {errors.title && (
                <span className="error_message">{errors.title}</span>
              )}
            </div>

            <div className="add_reward_field">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what this reward offers..."
                rows="3"
                className={errors.description ? "error" : ""}
              />
              {errors.description && (
                <span className="error_message">{errors.description}</span>
              )}
            </div>

            <div className="add_reward_row">
              <div className="add_reward_field">
                <label>
                  <DollarSign size={16} />
                  Points Cost *
                </label>
                <input
                  type="number"
                  name="pointsCost"
                  value={formData.pointsCost}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="100"
                  className={errors.pointsCost ? "error" : ""}
                />
                {errors.pointsCost && (
                  <span className="error_message">{errors.pointsCost}</span>
                )}
              </div>

              <div className="add_reward_field">
                <label>
                  <Tag size={16} />
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="discount">Discount</option>
                  <option value="service">Service</option>
                  <option value="access">Access</option>
                  <option value="gift">Gift</option>
                </select>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="add_reward_section">
            <h3>Settings</h3>

            <div className="add_reward_field">
              <label className="add_reward_toggle_label">
                <span>Active Status</span>
                <button
                  type="button"
                  className={`add_reward_toggle ${
                    formData.isActive ? "active" : ""
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: !prev.isActive,
                    }))
                  }
                >
                  {formData.isActive ? (
                    <ToggleRight size={20} />
                  ) : (
                    <ToggleLeft size={20} />
                  )}
                  <span>{formData.isActive ? "Active" : "Inactive"}</span>
                </button>
              </label>
            </div>

            <div className="add_reward_row">
              <div className="add_reward_field">
                <label>Usage Limit (Optional)</label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="Unlimited"
                  className={errors.usageLimit ? "error" : ""}
                />
                {errors.usageLimit && (
                  <span className="error_message">{errors.usageLimit}</span>
                )}
              </div>

              <div className="add_reward_field">
                <label>
                  <Calendar size={16} />
                  Valid Until (Optional)
                </label>
                <input
                  type="date"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="add_reward_actions">
            <Button
              type="button"
              variant="secondary"
              size="medium"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="medium"
              disabled={isLoading}
            >
              {isLoading
                ? "Saving..."
                : editingReward
                ? "Update Reward"
                : "Add Reward"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRewardPanel;
