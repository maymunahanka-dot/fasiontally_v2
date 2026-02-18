import { useState } from "react";
import {
  X,
  Search,
  SlidersHorizontal,
  DollarSign,
  Package,
  Calendar,
  FileText,
  MessageCircle,
} from "lucide-react";
import "./DashboardNotification.css";

const DashboardNotification = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    type: "all", // all, payment, stock, appointment, invoice, feedback
    status: "all", // all, unread, read
  });

  // Notification type configuration
  const notificationConfig = {
    payment: {
      icon: DollarSign,
      className: "payment",
    },
    stock: {
      icon: Package,
      className: "stock",
    },
    appointment: {
      icon: Calendar,
      className: "appointment",
    },
    invoice: {
      icon: FileText,
      className: "invoice",
    },
    feedback: {
      icon: MessageCircle,
      className: "feedback",
    },
  };

  // Sample notifications data - simplified structure
  const notifications = [
    {
      id: 1,
      type: "payment",
      title: "Payment Received",
      description: "₦120,000 from Mr. Adekunle",
      time: "10 mins ago",
      isUnread: true,
    },
    {
      id: 2,
      type: "stock",
      title: "Low Stock Alert",
      description: "Aso-Oke fabric (Gold) - Only 3 yards left",
      time: "2 hours ago",
      isUnread: true,
    },
    {
      id: 3,
      type: "appointment",
      title: "Upcoming Appointment",
      description: "Mrs. Adewale - Wedding Gown Consultation at 2:00 PM",
      time: "4 hours ago",
      isUnread: false,
    },
    {
      id: 4,
      type: "invoice",
      title: "Invoice Overdue",
      description: "Invoice #FT-2025-046 - Miss Chioma (₦60,000)",
      time: "1 day ago",
      isUnread: false,
    },
    {
      id: 5,
      type: "feedback",
      title: "New Feedback",
      description: "Mrs. Okafor left a 5-star review",
      time: "3 days ago",
      isUnread: false,
    },
    {
      id: 6,
      type: "appointment",
      title: "Appointment Confirmed",
      description: "Miss Chioma - First Fitting at",
      time: "5 days ago",
      isUnread: false,
    },
  ];

  // Get notification config based on type
  const getNotificationConfig = (notification) => {
    return (
      notificationConfig[notification.type] || notificationConfig.appointment
    );
  };

  // Filter notifications based on search, type, and status
  const filteredNotifications = notifications.filter((notification) => {
    // Search filter
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Type filter
    const matchesType =
      activeFilters.type === "all" || notification.type === activeFilters.type;

    // Status filter
    const matchesStatus =
      activeFilters.status === "all" ||
      (activeFilters.status === "unread" && notification.isUnread) ||
      (activeFilters.status === "read" && !notification.isUnread);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    // Auto close filter menu after selection
    setShowFilterMenu(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({
      type: "all",
      status: "all",
    });
  };

  // Check if any filters are active
  const hasActiveFilters =
    activeFilters.type !== "all" || activeFilters.status !== "all";

  return (
    <div className="dash_notif_panel">
      {/* Header */}
      <div className="dash_notif_header">
        <button className="dash_notif_close_btn" onClick={onClose}>
          <X size={24} />
        </button>
        <h2 className="dash_notif_title">Notifications</h2>
      </div>

      {/* Search Section */}
      <div className="dash_notif_search_section">
        <div className="dash_notif_search_container">
          <Search size={20} className="dash_notif_search_icon" />
          <input
            type="text"
            placeholder="Search..."
            className="dash_notif_search_input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={`dash_notif_filter_btn ${
              hasActiveFilters ? "active" : ""
            }`}
            onClick={() => setShowFilterMenu(!showFilterMenu)}
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>

        {/* Filter Menu */}
        {showFilterMenu && (
          <div className="dash_notif_filter_menu">
            <div className="dash_notif_filter_header">
              <h4>Filter Notifications</h4>
              {hasActiveFilters && (
                <button
                  className="dash_notif_clear_filters"
                  onClick={clearFilters}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Type Filter */}
            <div className="dash_notif_filter_group">
              <label className="dash_notif_filter_label">Type</label>
              <div className="dash_notif_filter_options">
                <button
                  className={`dash_notif_filter_option ${
                    activeFilters.type === "all" ? "active" : ""
                  }`}
                  onClick={() => handleFilterChange("type", "all")}
                >
                  All
                </button>
                <button
                  className={`dash_notif_filter_option ${
                    activeFilters.type === "payment" ? "active" : ""
                  }`}
                  onClick={() => handleFilterChange("type", "payment")}
                >
                  Payment
                </button>
                <button
                  className={`dash_notif_filter_option ${
                    activeFilters.type === "stock" ? "active" : ""
                  }`}
                  onClick={() => handleFilterChange("type", "stock")}
                >
                  Stock
                </button>
                <button
                  className={`dash_notif_filter_option ${
                    activeFilters.type === "appointment" ? "active" : ""
                  }`}
                  onClick={() => handleFilterChange("type", "appointment")}
                >
                  Appointment
                </button>
                <button
                  className={`dash_notif_filter_option ${
                    activeFilters.type === "invoice" ? "active" : ""
                  }`}
                  onClick={() => handleFilterChange("type", "invoice")}
                >
                  Invoice
                </button>
                <button
                  className={`dash_notif_filter_option ${
                    activeFilters.type === "feedback" ? "active" : ""
                  }`}
                  onClick={() => handleFilterChange("type", "feedback")}
                >
                  Feedback
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="dash_notif_filter_group">
              <label className="dash_notif_filter_label">Status</label>
              <div className="dash_notif_filter_options">
                <button
                  className={`dash_notif_filter_option ${
                    activeFilters.status === "all" ? "active" : ""
                  }`}
                  onClick={() => handleFilterChange("status", "all")}
                >
                  All
                </button>
                <button
                  className={`dash_notif_filter_option ${
                    activeFilters.status === "unread" ? "active" : ""
                  }`}
                  onClick={() => handleFilterChange("status", "unread")}
                >
                  Unread
                </button>
                <button
                  className={`dash_notif_filter_option ${
                    activeFilters.status === "read" ? "active" : ""
                  }`}
                  onClick={() => handleFilterChange("status", "read")}
                >
                  Read
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="dash_notif_list">
        {filteredNotifications.map((notification) => {
          const config = getNotificationConfig(notification);
          const IconComponent = config.icon;

          return (
            <div
              key={notification.id}
              className={`dash_notif_item ${config.className} ${
                notification.isUnread ? "unread" : "read"
              }`}
            >
              <div className="dash_notif_content">
                <div className="dash_notif_left">
                  <div className={`dash_notif_icon ${config.className}`}>
                    <IconComponent size={20} />
                  </div>
                  <div className="dash_notif_details">
                    <h4 className="dash_notif_item_title">
                      {notification.title}
                    </h4>
                    <p className="dash_notif_description">
                      {notification.description}
                    </p>
                  </div>
                </div>
                <div className="dash_notif_right">
                  {notification.isUnread && (
                    <div className="dash_notif_unread_dot" />
                  )}
                  <span className="dash_notif_time">{notification.time}</span>
                </div>
              </div>
              {notification.isUnread && (
                <div className="dash_notif_actions">
                  <button className="dash_notif_mark_read_btn">
                    ✓ Mark as read
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardNotification;
