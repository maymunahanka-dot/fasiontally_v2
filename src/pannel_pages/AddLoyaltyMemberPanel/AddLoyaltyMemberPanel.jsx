import { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Star,
  DollarSign,
  Calendar,
  Tag,
  Users,
  Search,
} from "lucide-react";
import { useNewAuth } from "../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../utils/teamUtils";
import { getClients } from "../../backend/services/crmService";
import Button from "../../components/button/Button";
import Input from "../../components/Input/Input";
import "./AddLoyaltyMemberPanel.css";

const AddLoyaltyMemberPanel = ({
  onSubmit,
  editingMember = null,
  isLoading = false,
  onClose,
}) => {
  const { user } = useNewAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    level: "Bronze",
    points: 0,
    totalSpent: 0,
    birthday: "",
    tags: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [fillMode, setFillMode] = useState("manual"); // "manual" or "client"

  // Load clients when component mounts
  useEffect(() => {
    if (user?.email) {
      loadClients();
    }
  }, [user?.email]);

  const loadClients = async () => {
    try {
      setClientsLoading(true);
      // Get effective email (main admin's email for team members)
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
      name: client.name || "",
      email: client.email || "",
      // Keep existing loyalty-specific fields
      level: prev.level,
      points: prev.points,
      totalSpent: prev.totalSpent,
      birthday: prev.birthday,
      tags: prev.tags,
      notes: prev.notes,
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

  // Populate form when editing
  useEffect(() => {
    if (editingMember) {
      setFormData({
        name: editingMember.name || "",
        email: editingMember.email || "",
        level: editingMember.level || "Bronze",
        points: editingMember.points || 0,
        totalSpent: editingMember.totalSpent || 0,
        birthday: editingMember.birthday
          ? new Date(editingMember.birthday.seconds * 1000)
              .toISOString()
              .split("T")[0]
          : "",
        tags: editingMember.tags ? editingMember.tags.join(", ") : "",
        notes: editingMember.notes || "",
      });
    } else {
      // Reset form for new member
      setFormData({
        name: "",
        email: "",
        level: "Bronze",
        points: 0,
        totalSpent: 0,
        birthday: "",
        tags: "",
        notes: "",
      });
    }
    setErrors({});
  }, [editingMember]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (formData.points < 0) {
      newErrors.points = "Points cannot be negative";
    }

    if (formData.totalSpent < 0) {
      newErrors.totalSpent = "Total spent cannot be negative";
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
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      level: formData.level,
      points: parseInt(formData.points) || 0,
      totalSpent: parseFloat(formData.totalSpent) || 0,
      notes: formData.notes.trim(),
      lastActivity: new Date(),
    };

    // Handle birthday
    if (formData.birthday) {
      submitData.birthday = new Date(formData.birthday);
    }

    // Handle tags
    if (formData.tags.trim()) {
      submitData.tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);
    }

    onSubmit(submitData);
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      level: "Bronze",
      points: 0,
      totalSpent: 0,
      birthday: "",
      tags: "",
      notes: "",
    });
    setErrors({});
    setShowClientSelector(false);
    setClientSearchTerm("");
    setFillMode("manual");
    onClose();
  };

  return (
    <div className="add_loyalty_member_panel">
      <div className="add_loyalty_member_header">
        <h2>{editingMember ? "Edit Loyalty Member" : "Add Loyalty Member"}</h2>
        <button className="add_loyalty_member_close" onClick={handleClose}>
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="add_loyalty_member_form">
        {/* Basic Information */}
        <div className="add_loyalty_member_section">
          <h3>Basic Information</h3>

          {/* Fill Mode Selection */}
          <div className="add_loyalty_member_field">
            <label>Information Source</label>
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

          <Input
            type="text"
            label={
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <User size={16} />
                Full Name *
              </span>
            }
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter member's full name"
            error={errors.name}
            variant="rounded"
          />

          <Input
            type="email"
            label={
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Mail size={16} />
                Email Address *
              </span>
            }
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
            error={errors.email}
            variant="rounded"
          />

          <Input
            type="select"
            label={
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Star size={16} />
                Loyalty Level
              </span>
            }
            name="level"
            value={formData.level}
            onChange={handleInputChange}
            options={[
              { value: "Bronze", label: "Bronze" },
              { value: "Silver", label: "Silver" },
              { value: "Gold", label: "Gold" },
              { value: "Platinum", label: "Platinum" },
            ]}
            variant="rounded"
          />
        </div>

        {/* Points & Spending */}
        <div className="add_loyalty_member_section">
          <h3>Points & Spending</h3>

          <div className="add_loyalty_member_row">
            <Input
              type="number"
              label={
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Star size={16} />
                  Current Points
                </span>
              }
              name="points"
              value={formData.points}
              onChange={handleInputChange}
              min="0"
              placeholder="0"
              error={errors.points}
              variant="rounded"
            />

            <Input
              type="number"
              label={
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <DollarSign size={16} />
                  Total Spent (₦)
                </span>
              }
              name="totalSpent"
              value={formData.totalSpent}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              error={errors.totalSpent}
              variant="rounded"
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="add_loyalty_member_section">
          <h3>Additional Information</h3>

          <Input
            type="date"
            label={
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Calendar size={16} />
                Birthday (Optional)
              </span>
            }
            name="birthday"
            value={formData.birthday}
            onChange={handleInputChange}
            variant="rounded"
          />

          <Input
            type="text"
            label={
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Tag size={16} />
                Tags (Optional)
              </span>
            }
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="VIP, Regular, New Customer (comma separated)"
            variant="rounded"
          />

          <Input
            type="textarea"
            label="Notes (Optional)"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Any additional notes about this member..."
            rows="3"
            variant="rounded"
          />
        </div>

        <div className="add_loyalty_member_actions">
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
              : editingMember
              ? "Update Member"
              : "Add Member"}
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
                className="client_search_input"
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

export default AddLoyaltyMemberPanel;
