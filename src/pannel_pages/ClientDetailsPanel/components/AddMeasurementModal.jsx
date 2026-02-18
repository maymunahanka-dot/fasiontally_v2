import { useState } from "react";
import { X, Save, Lightbulb, Plus, Trash2 } from "lucide-react";
import Button from "../../../components/button/Button";
import Input from "../../../components/Input/Input";
import { useTheme } from "../../../contexts/ThemeContext";
import "./AddMeasurementModal.css";

const AddMeasurementModal = ({ isOpen, onClose, onSave }) => {
  const { isDark } = useTheme();

  // Array of measurements
  const [measurements, setMeasurements] = useState([
    { id: 1, name: "", value: "", unit: "inches" },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (id, field, value) => {
    setMeasurements((prev) =>
      prev.map((measurement) =>
        measurement.id === id ? { ...measurement, [field]: value } : measurement
      )
    );
  };

  const handleAddMeasurement = () => {
    const newId = Math.max(...measurements.map((m) => m.id), 0) + 1;
    setMeasurements((prev) => [
      ...prev,
      { id: newId, name: "", value: "", unit: "inches" },
    ]);
  };

  const handleRemoveMeasurement = (id) => {
    if (measurements.length > 1) {
      setMeasurements((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleSave = async () => {
    // Filter out empty measurements
    const validMeasurements = measurements.filter(
      (m) => m.name.trim() && m.value.trim()
    );

    if (validMeasurements.length > 0) {
      try {
        setIsSaving(true);
        console.log(`💾 Saving ${validMeasurements.length} measurements...`);

        // Save all valid measurements sequentially
        for (const measurement of validMeasurements) {
          await onSave({
            name: measurement.name,
            value: measurement.value,
            unit: measurement.unit,
          });
        }

        console.log("✅ All measurements saved successfully!");
        handleClose();
      } catch (error) {
        console.error("❌ Error saving measurements:", error);
        alert("Failed to save measurements. Please try again.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleClose = () => {
    setMeasurements([{ id: 1, name: "", value: "", unit: "inches" }]);
    onClose();
  };

  // Quick fill common measurements
  const handleQuickFill = () => {
    const commonMeasurements = [
      { id: 1, name: "Chest", value: "", unit: "inches" },
      { id: 2, name: "Waist", value: "", unit: "inches" },
      { id: 3, name: "Hip", value: "", unit: "inches" },
      { id: 4, name: "Shoulder Width", value: "", unit: "inches" },
      { id: 5, name: "Sleeve Length", value: "", unit: "inches" },
      { id: 6, name: "Inseam", value: "", unit: "inches" },
    ];
    setMeasurements(commonMeasurements);
  };

  const hasValidMeasurements = measurements.some(
    (m) => m.name.trim() && m.value.trim()
  );

  if (!isOpen) return null;

  return (
    <div className="add_measurement_modal_overlay">
      <div
        className={`add_measurement_modal ${
          isDark ? "dark-theme" : "light-theme"
        }`}
      >
        {/* Header */}
        <div className="add_measurement_modal_header">
          <h3 className="add_measurement_modal_title">Add Measurements</h3>
          <button className="add_measurement_modal_close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="add_measurement_modal_content">
          {/* Quick Fill Button */}
          <div className="add_measurement_quick_fill">
            <button
              className="add_measurement_quick_fill_btn"
              onClick={handleQuickFill}
            >
              <Lightbulb size={16} />
              Quick Fill Common Measurements
            </button>
          </div>

          {/* Measurements List */}
          <div className="add_measurement_list">
            {measurements.map((measurement, index) => (
              <div key={measurement.id} className="add_measurement_item">
                <div className="add_measurement_item_header">
                  <span className="add_measurement_item_number">
                    #{index + 1}
                  </span>
                  {measurements.length > 1 && (
                    <button
                      className="add_measurement_remove_btn"
                      onClick={() => handleRemoveMeasurement(measurement.id)}
                      title="Remove measurement"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="add_measurement_item_fields">
                  {/* Measurement Name and Value - Side by Side */}
                  <div className="add_measurement_fields_row">
                    <div className="add_measurement_form_group add_measurement_name_field">
                      <Input
                        type="text"
                        label="Name"
                        placeholder="e.g., Chest"
                        value={measurement.name}
                        onChange={(e) =>
                          handleInputChange(
                            measurement.id,
                            "name",
                            e.target.value
                          )
                        }
                        variant="rounded"
                      />
                    </div>

                    <div className="add_measurement_form_group add_measurement_value_field">
                      <Input
                        type="text"
                        label="Value"
                        placeholder="36"
                        value={measurement.value}
                        onChange={(e) =>
                          handleInputChange(
                            measurement.id,
                            "value",
                            e.target.value
                          )
                        }
                        variant="rounded"
                      />
                      <span className="add_measurement_unit_label">inches</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add More Button */}
          <button
            className="add_measurement_add_more_btn"
            onClick={handleAddMeasurement}
          >
            <Plus size={18} />
            Add Another Measurement
          </button>

          {/* Tip Section */}
          <div className="add_measurement_tip_section">
            <div className="add_measurement_tip_header">
              <Lightbulb size={16} className="add_measurement_tip_icon" />
              <span className="add_measurement_tip_title">Tip</span>
            </div>
            <p className="add_measurement_tip_text">
              Common measurements: Chest, Waist, Hip, Shoulder Width, Sleeve
              Length, Inseam, Neck, Bust, Dress Length. You can add multiple
              measurements at once!
            </p>
          </div>

          {/* Save Button */}
          <div className="add_measurement_modal_actions">
            <Button
              variant="primary"
              size="large"
              icon={<Save size={20} />}
              onClick={handleSave}
              className="add_measurement_save_btn"
              disabled={!hasValidMeasurements || isSaving}
            >
              {isSaving ? "Saving..." : "Save All Measurements"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMeasurementModal;
