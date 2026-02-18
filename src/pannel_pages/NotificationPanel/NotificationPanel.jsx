import { useState } from "react";
import { ArrowLeft, Mail, Bell } from "lucide-react";
import Button from "../../components/button/Button";
import "./NotificationPanel.css";

const NotificationPanel = ({ onClose }) => {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    inventoryAlerts: true,
    lowStockAlerts: true,
    newClients: true,
    newInvoices: true,
    overdueInvoices: true,
    paymentReceived: true,
    appointmentReminders: true,
    newFeedback: true,
  });

  const handleToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePreferences = () => {
    // Handle save logic here
    console.log("Saving notification preferences:", notifications);
    onClose();
  };

  const ToggleSwitch = ({ isOn, onToggle }) => (
    <div
      className={`notif_toggle_switch ${
        isOn ? "notif_toggle_on" : "notif_toggle_off"
      }`}
      onClick={onToggle}
    >
      <div className="notif_toggle_slider"></div>
    </div>
  );

  return (
    <div className="notif_panel">
      {/* Header */}
      <div className="notif_header">
        <button className="notif_back_btn" onClick={onClose}>
          <ArrowLeft size={20} />
        </button>
        <div className="notif_header_content">
          <h2 className="notif_title">Notification</h2>
          <p className="notif_subtitle">Configure alerts & notifications</p>
        </div>
      </div>

      {/* Content */}
      <div className="notif_content">
        {/* Channels Section */}
        <div className="notif_section">
          <h3 className="notif_section_title">Channels</h3>

          <div className="notif_item">
            <div className="notif_item_content">
              <div className="notif_item_icon">
                <Mail size={20} />
              </div>
              <div className="notif_item_info">
                <h4 className="notif_item_title">Email Notifications</h4>
                <p className="notif_item_description">
                  Receive updates via email
                </p>
              </div>
            </div>
            <ToggleSwitch
              isOn={notifications.emailNotifications}
              onToggle={() => handleToggle("emailNotifications")}
            />
          </div>

          <div className="notif_item">
            <div className="notif_item_content">
              <div className="notif_item_icon">
                <Bell size={20} />
              </div>
              <div className="notif_item_info">
                <h4 className="notif_item_title">Push Notifications</h4>
                <p className="notif_item_description">Get real-time alerts</p>
              </div>
            </div>
            <ToggleSwitch
              isOn={notifications.pushNotifications}
              onToggle={() => handleToggle("pushNotifications")}
            />
          </div>
        </div>

        {/* Event Notifications Section */}
        <div className="notif_section">
          <h3 className="notif_section_title">Event Notifications</h3>

          <div className="notif_simple_item">
            <span className="notif_simple_title">Order Updates</span>
            <ToggleSwitch
              isOn={notifications.orderUpdates}
              onToggle={() => handleToggle("orderUpdates")}
            />
          </div>

          <div className="notif_simple_item">
            <span className="notif_simple_title">Inventory Alerts</span>
            <ToggleSwitch
              isOn={notifications.inventoryAlerts}
              onToggle={() => handleToggle("inventoryAlerts")}
            />
          </div>

          <div className="notif_simple_item">
            <span className="notif_simple_title">Low Stock Alerts</span>
            <ToggleSwitch
              isOn={notifications.lowStockAlerts}
              onToggle={() => handleToggle("lowStockAlerts")}
            />
          </div>

          <div className="notif_simple_item">
            <span className="notif_simple_title">New Clients</span>
            <ToggleSwitch
              isOn={notifications.newClients}
              onToggle={() => handleToggle("newClients")}
            />
          </div>

          <div className="notif_simple_item">
            <span className="notif_simple_title">New Invoices</span>
            <ToggleSwitch
              isOn={notifications.newInvoices}
              onToggle={() => handleToggle("newInvoices")}
            />
          </div>

          <div className="notif_simple_item">
            <span className="notif_simple_title">Overdue Invoices</span>
            <ToggleSwitch
              isOn={notifications.overdueInvoices}
              onToggle={() => handleToggle("overdueInvoices")}
            />
          </div>

          <div className="notif_simple_item">
            <span className="notif_simple_title">Payment Received</span>
            <ToggleSwitch
              isOn={notifications.paymentReceived}
              onToggle={() => handleToggle("paymentReceived")}
            />
          </div>

          <div className="notif_simple_item">
            <span className="notif_simple_title">Appointment Reminders</span>
            <ToggleSwitch
              isOn={notifications.appointmentReminders}
              onToggle={() => handleToggle("appointmentReminders")}
            />
          </div>

          <div className="notif_simple_item">
            <span className="notif_simple_title">New Feedback</span>
            <ToggleSwitch
              isOn={notifications.newFeedback}
              onToggle={() => handleToggle("newFeedback")}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="notif_footer">
        <Button
          variant="primary"
          onClick={handleSavePreferences}
          className="notif_save_btn"
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

export default NotificationPanel;
