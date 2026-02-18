import { useState, useEffect, useContext } from "react";
import { Plus, Ruler, Info, Download } from "lucide-react";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../backend/firebase.config";
import NewAuthContext from "../../../contexts/NewAuthContext";
import AddMeasurementModal from "../components/AddMeasurementModal";
import "./ClientMeasurements.css";

const ClientMeasurements = ({ client }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [measurements, setMeasurements] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(NewAuthContext);

  useEffect(() => {
    if (!client?.id || !db) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Set up real-time listener for measurements
    const measurementRef = doc(
      db,
      "fashiontally_clients",
      client.id,
      "measurements",
      "latest"
    );

    const unsubscribe = onSnapshot(
      measurementRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          console.log("📊 Measurements loaded from database:", data);
          setMeasurements({
            ...data,
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        } else {
          console.log("📊 No measurements found for this client");
          setMeasurements(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching measurements:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [client?.id]);

  const handleAddMeasurement = () => {
    setShowAddModal(true);
  };

  const handleSaveMeasurement = async (measurementData) => {
    if (!user?.email || !client?.id) {
      console.error("User not authenticated or client not found");
      return;
    }

    try {
      console.log("💾 Saving measurement:", measurementData);

      // Measurements are stored as a subcollection of the client document
      const measurementRef = doc(
        db,
        "fashiontally_clients",
        client.id,
        "measurements",
        "latest"
      );

      // Prepare measurement data with normalized key
      const measurementKey = measurementData.name
        .toLowerCase()
        .replace(/\s+/g, "");

      const newMeasurementData = {
        [measurementKey]: measurementData.value,
        userEmail: user.email,
        updatedAt: new Date(),
      };

      console.log("📝 Saving to Firestore:", newMeasurementData);

      // Add or update measurements (merge to keep existing measurements)
      await setDoc(measurementRef, newMeasurementData, { merge: true });

      // Also update the client document to indicate they have measurements
      const clientRef = doc(db, "fashiontally_clients", client.id);
      await updateDoc(clientRef, {
        hasMeasurements: true,
        measurementsUpdatedAt: new Date(),
      });

      console.log("✅ Measurement saved successfully:", measurementKey);
    } catch (error) {
      console.error("❌ Error saving measurement:", error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="client_details_measurements">
        <div className="client_measurements_header">
          <div className="client_measurements_title_section">
            <h3 className="client_measurements_title">Body Measurements</h3>
            <p className="client_measurements_subtitle">
              Loading measurements...
            </p>
          </div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!measurements) {
    return (
      <div className="client_details_measurements">
        <div className="client_measurements_header">
          <div className="client_measurements_title_section">
            <h3 className="client_measurements_title">Body Measurements</h3>
            <p className="client_measurements_subtitle">
              No measurements recorded
            </p>
          </div>
          <button
            className="client_measurements_add_btn"
            onClick={handleAddMeasurement}
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="no-measurements">
          <p>No measurements recorded for this client</p>
          <button
            className="add-measurement-btn"
            onClick={handleAddMeasurement}
          >
            Add First Measurement
          </button>
        </div>

        <AddMeasurementModal
          isOpen={showAddModal}
          onClose={handleCloseModal}
          onSave={handleSaveMeasurement}
        />
      </div>
    );
  }

  // Get all measurements from the database (excluding system fields)
  const systemFields = ["userEmail", "updatedAt", "customMeasurements"];

  const allMeasurements = Object.entries(measurements || {})
    .filter(
      ([key, value]) =>
        !systemFields.includes(key) &&
        value &&
        typeof value === "string" &&
        value.trim() !== ""
    )
    .map(([key, value]) => ({
      key,
      label: formatMeasurementLabel(key),
      value: value,
      unit: '"',
    }));

  // Helper function to format measurement keys into readable labels
  function formatMeasurementLabel(key) {
    // Convert camelCase or lowercase to Title Case with spaces
    return key
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();
  }

  return (
    <div className="client_details_measurements">
      {/* Measurements Header */}
      <div className="client_measurements_header">
        <div className="client_measurements_title_section">
          <h3 className="client_measurements_title">Body Measurements</h3>
          <p className="client_measurements_subtitle">
            {measurements.updatedAt
              ? `Last updated: ${formatDate(measurements.updatedAt)}`
              : "Standard measurements in inches"}
          </p>
        </div>
        <button
          className="client_measurements_add_btn"
          onClick={handleAddMeasurement}
        >
          <Plus size={20} />
        </button>
      </div>

      {/* All Measurements Grid */}
      {allMeasurements.length > 0 ? (
        <>
          <div className="client_measurements_grid">
            {allMeasurements.map((measurement, index) => (
              <div key={index} className="client_measurement_item">
                <div className="client_measurement_content">
                  <div className="client_measurement_label">
                    {measurement.label}
                  </div>
                  <div className="client_measurement_value">
                    {measurement.value}
                    <span className="client_measurement_unit">
                      {measurement.unit}
                    </span>
                  </div>
                </div>
                <button className="client_measurement_edit_btn">
                  <Ruler size={16} className="client_measurement_ruler_icon" />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="no-measurements">
          <p>No measurements recorded yet</p>
        </div>
      )}

      {/* Measurement Guide */}
      <div className="client_measurements_guide_section">
        <div className="client_measurements_guide_header">
          <Info size={20} className="client_measurements_info_icon" />
          <span className="client_measurements_guide_title">
            Measurement Guide
          </span>
        </div>
        <ul className="client_measurements_guide_list">
          <li>Always take measurements with the client standing straight.</li>
          <li>Update measurements every 6 months for regular clients.</li>
          <li>Record measurements in inches for consistency.</li>
        </ul>
      </div>

      {/* Export Button */}
      {/* {allMeasurements.length > 0 && (
        <button className="client_measurements_export_btn">
          <Download size={20} />
          Export Measurements PDF
        </button>
      )} */}

      {/* Add Measurement Modal */}
      <AddMeasurementModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSave={handleSaveMeasurement}
      />
    </div>
  );
};

export default ClientMeasurements;
