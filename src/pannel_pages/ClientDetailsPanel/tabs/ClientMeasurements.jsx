import { useState, useEffect, useContext } from "react";
import { Plus, Ruler, Info, Download } from "lucide-react";
import { doc, onSnapshot, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../backend/firebase.config";
import NewAuthContext from "../../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../../utils/teamUtils";
import AddMeasurementModal from "../components/AddMeasurementModal";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";
import "./ClientMeasurements.css";

const ClientMeasurements = ({ client }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [measurements, setMeasurements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [brandData, setBrandData] = useState(null);
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

  // Load brand data for PDF
  useEffect(() => {
    const loadBrandData = async () => {
      if (!user?.email) return;

      try {
        const effectiveEmail = getEffectiveUserEmail(user);

        // Load user data first
        const userDoc = await getDoc(
          doc(db, "fashiontally_users", effectiveEmail)
        );
        let userData = null;

        if (userDoc.exists()) {
          userData = userDoc.data();
        }

        // Load brand settings
        const brandDoc = await getDoc(
          doc(db, "fashiontally_brand_settings", effectiveEmail)
        );

        if (brandDoc.exists()) {
          const brandData = brandDoc.data();
          setBrandData({
            businessName:
              brandData.businessName || userData?.businessName || null,
            businessAddress:
              brandData.businessAddress || userData?.businessAddress || null,
            businessPhone:
              brandData.businessPhone || userData?.phoneNumber || null,
            businessEmail: brandData.businessEmail || userData?.email || null,
            logoUrl:
              brandData.logoUrl ||
              userData?.logoUrl ||
              userData?.profilePicture ||
              null,
            primaryColor: brandData.primaryColor || "#14b8a6",
            secondaryColor: brandData.secondaryColor || "#0d9488",
          });
        } else if (userData) {
          setBrandData({
            businessName: userData.businessName || null,
            businessAddress: userData.businessAddress || null,
            businessPhone: userData.phoneNumber || null,
            businessEmail: userData.email || null,
            logoUrl: userData.logoUrl || userData.profilePicture || null,
            primaryColor: "#14b8a6",
            secondaryColor: "#0d9488",
          });
        }
      } catch (error) {
        console.error("Error loading brand data:", error);
      }
    };

    loadBrandData();
  }, [user?.email]);

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

  // PDF Component for rendering measurements
  const MeasurementPDFComponent = ({ client, measurements, company }) => {
    const primaryColor = company.primaryColor || "#14b8a6";
    const allMeasurements = Object.entries(measurements || {})
      .filter(
        ([key, value]) =>
          !["userEmail", "updatedAt", "customMeasurements"].includes(key) &&
          value &&
          typeof value === "string" &&
          value.trim() !== ""
      )
      .map(([key, value]) => ({
        key,
        label: formatMeasurementLabel(key),
        value: value,
      }));

    return (
      <div
        style={{
          width: "1000px",
          fontSize: "14px",
          lineHeight: "1.6",
          color: "#333",
          backgroundColor: "white",
          padding: "48px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "48px",
            borderBottom: `3px solid ${primaryColor}`,
            paddingBottom: "24px",
          }}
        >
          <div style={{ flex: 1 }}>
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt="Company Logo"
                style={{ height: "80px", objectFit: "contain" }}
                crossOrigin="anonymous"
              />
            ) : (
              <div
                style={{
                  height: "80px",
                  width: "80px",
                  backgroundColor: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#9ca3af",
                  borderRadius: "8px",
                }}
              >
                {company.businessName?.charAt(0) || "FT"}
              </div>
            )}
          </div>

          <div style={{ textAlign: "right" }}>
            <h1
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                marginBottom: "8px",
                margin: 0,
                color: primaryColor,
              }}
            >
              MEASUREMENTS
            </h1>
            <p style={{ fontSize: "16px", color: "#666", margin: 0 }}>
              {formatDate(measurements.updatedAt)}
            </p>
          </div>
        </div>

        {/* Company & Client Info */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "48px",
          }}
        >
          {/* Company Info */}
          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#666",
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              From
            </h3>
            {company.businessName && (
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  margin: "0 0 8px 0",
                }}
              >
                {company.businessName}
              </p>
            )}
            {company.businessAddress && (
              <p style={{ color: "#666", margin: "4px 0" }}>
                {company.businessAddress}
              </p>
            )}
            {company.businessPhone && (
              <p style={{ color: "#666", margin: "4px 0" }}>
                {company.businessPhone}
              </p>
            )}
            {company.businessEmail && (
              <p style={{ color: "#666", margin: "4px 0" }}>
                {company.businessEmail}
              </p>
            )}
          </div>

          {/* Client Info */}
          <div style={{ flex: 1, textAlign: "right" }}>
            <h3
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#666",
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Client Information
            </h3>
            {client.name && (
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  margin: "0 0 8px 0",
                }}
              >
                {client.name}
              </p>
            )}
            {client.phone && (
              <p style={{ color: "#666", margin: "4px 0" }}>{client.phone}</p>
            )}
            {client.email && (
              <p style={{ color: "#666", margin: "4px 0" }}>{client.email}</p>
            )}
            {client.address && (
              <p style={{ color: "#666", margin: "4px 0" }}>
                {client.address}
              </p>
            )}
          </div>
        </div>

        {/* Measurements Table */}
        <div style={{ marginBottom: "48px" }}>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "24px",
              color: primaryColor,
            }}
          >
            Body Measurements
          </h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #e5e7eb",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: primaryColor }}>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "14px",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Measurement
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "right",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "14px",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Value (inches)
                </th>
              </tr>
            </thead>
            <tbody>
              {allMeasurements.map((measurement, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                  }}
                >
                  <td
                    style={{
                      padding: "14px 16px",
                      borderBottom: "1px solid #e5e7eb",
                      color: "#1f2937",
                      fontSize: "14px",
                    }}
                  >
                    {measurement.label}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      textAlign: "right",
                      borderBottom: "1px solid #e5e7eb",
                      color: "#1f2937",
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                  >
                    {measurement.value}"
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "2px solid #e5e7eb",
            paddingTop: "24px",
            textAlign: "center",
            color: "#666",
            fontSize: "12px",
          }}
        >
          <p style={{ margin: "0 0 8px 0" }}>
            Generated on {new Date().toLocaleDateString()}
            {company.businessName && ` by ${company.businessName}`}
          </p>
          <p style={{ margin: 0, color: "#999" }}>
            This is a computer-generated document. No signature required.
          </p>
        </div>
      </div>
    );
  };

  // Handle PDF Download
  const handleDownloadPDF = async () => {
    if (!measurements || !client) return;

    setDownloadingPDF(true);
    try {
      const companyData = brandData || {
        businessName: "Your Business",
        businessAddress: "Business Address",
        businessPhone: "Phone Number",
        businessEmail: "email@business.com",
        logoUrl: null,
        primaryColor: "#14b8a6",
        secondaryColor: "#0d9488",
      };

      // Create temporary container
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      document.body.appendChild(tempContainer);

      try {
        const root = createRoot(tempContainer);

        await new Promise((resolve) => {
          root.render(
            <MeasurementPDFComponent
              client={client}
              measurements={measurements}
              company={companyData}
            />
          );
          setTimeout(resolve, 500);
        });

        const measurementElement = tempContainer.firstChild;
        const canvas = await html2canvas(measurementElement, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
          allowTaint: true,
        });

        const dataCanvas = canvas.toDataURL("image/png");

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: "a4",
        });

        const imgProperties = pdf.getImageProperties(dataCanvas);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight =
          (imgProperties.height * pdfWidth) / imgProperties.width;

        pdf.addImage(dataCanvas, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`measurements-${client.name.replace(/\s+/g, "-")}.pdf`);

        root.unmount();
      } finally {
        document.body.removeChild(tempContainer);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setDownloadingPDF(false);
    }
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
      {allMeasurements.length > 0 && (
        <button
          className="client_measurements_export_btn"
          onClick={handleDownloadPDF}
          disabled={downloadingPDF}
        >
          <Download size={20} />
          {downloadingPDF ? "Generating PDF..." : "Download Measurements PDF"}
        </button>
      )}

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
