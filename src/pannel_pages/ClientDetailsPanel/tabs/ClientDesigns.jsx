import { useState, useEffect } from "react";
import { Plus, ChevronRight } from "lucide-react";
import { useNewAuth } from "../../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../../utils/teamUtils";
import { getDesignsByClientId } from "../../../backend/services/crmService";
import "./ClientDesigns.css";

const ClientDesigns = ({ client, onOpenAddDesign, onDesignClick }) => {
  const { user } = useNewAuth();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch designs for this client
  useEffect(() => {
    if (client?.id && user?.email) {
      loadDesigns();
    }
  }, [client?.id, user?.email]);

  const loadDesigns = async () => {
    try {
      setLoading(true);
      const effectiveEmail = getEffectiveUserEmail(user);
      const designsData = await getDesignsByClientId(client.id, effectiveEmail);
      setDesigns(designsData);
    } catch (error) {
      console.error("Error loading client designs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewDesign = () => {
    if (onOpenAddDesign) {
      onOpenAddDesign(client);
    }
  };

  const handleDesignClick = (design) => {
    if (onDesignClick) {
      onDesignClick(design);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    if (!price) return "₦0";
    return `₦${parseFloat(price).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="client_details_designs">
        <div className="client_designs_loading">Loading designs...</div>
      </div>
    );
  }

  return (
    <div className="client_details_designs">
      {/* Designs Header */}
      <div className="client_designs_header">
        <h3 className="client_designs_count">{designs.length} Designs</h3>
        <button className="client_designs_new_btn" onClick={handleNewDesign}>
          <Plus size={18} />
          New Design
        </button>
      </div>

      {/* Designs Grid */}
      {designs.length > 0 ? (
        <div className="client_designs_grid">
          {designs.map((design) => (
            <div
              key={design.id}
              className="client_design_card"
              onClick={() => handleDesignClick(design)}
            >
              <div className="client_design_image_container">
                {design.imageUrl || (design.images && design.images[0]) ? (
                  <img
                    src={design.imageUrl || design.images[0]}
                    alt={design.name}
                    className="client_design_image"
                  />
                ) : (
                  <div className="client_design_no_image">
                    <span>No Image</span>
                  </div>
                )}
                <div
                  className={`client_design_status_badge ${
                    design.status?.toLowerCase().replace(" ", "_") || "active"
                  }`}
                >
                  {design.status || "Active"}
                </div>
              </div>

              <div className="client_design_content">
                <h4 className="client_design_title">{design.name}</h4>
                <p className="client_design_category">{design.category}</p>
                <p className="client_design_date">
                  {formatDate(design.createdAt)}
                </p>
                <div className="client_design_footer">
                  <span className="client_design_price">
                    {formatPrice(design.price)}
                  </span>
                  <button className="client_design_arrow_btn">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="client_designs_empty">
          <p>No designs yet for this client</p>
          <button
            className="client_designs_empty_btn"
            onClick={handleNewDesign}
          >
            <Plus size={18} />
            Create First Design
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientDesigns;
