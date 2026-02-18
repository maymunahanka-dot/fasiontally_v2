import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Gift,
  MoreVertical,
  Edit,
  Trash2,
  Star,
  Calendar,
  Users,
} from "lucide-react";
import { useNewAuth } from "../../contexts/NewAuthContext";
import {
  getRewards,
  addReward,
  updateReward,
  deleteReward,
} from "../../backend/services/crmService";
import Button from "../button/Button";
import AddRewardPanel from "../../pannel_pages/AddRewardPanel";
import "./RewardsTab.css";

const RewardsTab = () => {
  const { user } = useNewAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // Load rewards
  const loadRewards = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const rewardsData = await getRewards(user.email);
      setRewards(rewardsData);
    } catch (error) {
      console.error("Error loading rewards:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRewards();
  }, [user?.email]);

  // Handle add/update reward
  const handleSubmitReward = async (rewardData) => {
    if (!user?.email) return;

    try {
      setIsSubmitting(true);

      if (editingReward) {
        await updateReward(editingReward.id, rewardData);
      } else {
        await addReward(rewardData, user.email);
      }

      await loadRewards();
      setIsAddPanelOpen(false);
      setEditingReward(null);
    } catch (error) {
      console.error("Error saving reward:", error);
      alert("Error saving reward. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete reward
  const handleDeleteReward = async (rewardId) => {
    if (!confirm("Are you sure you want to delete this reward?")) {
      return;
    }

    try {
      await deleteReward(rewardId);
      await loadRewards();
      setDropdownOpen(null);
    } catch (error) {
      console.error("Error deleting reward:", error);
      alert("Error deleting reward. Please try again.");
    }
  };

  // Handle edit reward
  const handleEditReward = (reward) => {
    setEditingReward(reward);
    setIsAddPanelOpen(true);
    setDropdownOpen(null);
  };

  // Close panel
  const handleClosePanel = () => {
    setIsAddPanelOpen(false);
    setEditingReward(null);
  };

  // Filter rewards based on search
  const filteredRewards = rewards.filter((reward) => {
    const matchesSearch =
      reward.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case "discount":
        return <Star size={20} color="#f59e0b" />;
      case "service":
        return <Gift size={20} color="#10b981" />;
      case "access":
        return <Users size={20} color="#8b5cf6" />;
      case "gift":
        return <Gift size={20} color="#ef4444" />;
      default:
        return <Gift size={20} color="#6b7280" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "discount":
        return "#fef3c7";
      case "service":
        return "#d1fae5";
      case "access":
        return "#e9d5ff";
      case "gift":
        return "#fee2e2";
      default:
        return "#f3f4f6";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "No expiry";

    let date;
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="rewards_tab">
        <div className="rewards_loading">
          <p>Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rewards_tab">
      {/* Search and Add Reward Section */}
      <div className="rewards_controls">
        <div className="rewards_search_section">
          <div className="rewards_search_input_container">
            <Search className="rewards_search_icon" size={20} />
            <input
              type="text"
              placeholder="Search rewards by title, description, or category"
              className="rewards_search_input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Button
          variant="primary"
          size="medium"
          icon={<Plus size={20} />}
          iconPosition="left"
          className="rewards_add_btn"
          onClick={() => setIsAddPanelOpen(true)}
        >
          Add Reward
        </Button>
      </div>

      {/* Rewards Grid */}
      <div className="rewards_grid">
        {filteredRewards.map((reward) => (
          <div key={reward.id} className="reward_card">
            <div className="reward_header">
              <div
                className="reward_icon"
                style={{ backgroundColor: getCategoryColor(reward.category) }}
              >
                {getCategoryIcon(reward.category)}
              </div>
              <div className="reward_actions">
                <span
                  className={`reward_status ${
                    reward.isActive ? "active" : "inactive"
                  }`}
                >
                  {reward.isActive ? "Active" : "Inactive"}
                </span>
                <div className="reward_dropdown">
                  <button
                    className="reward_dropdown_trigger"
                    onClick={() =>
                      setDropdownOpen(
                        dropdownOpen === reward.id ? null : reward.id
                      )
                    }
                  >
                    <MoreVertical size={16} />
                  </button>
                  {dropdownOpen === reward.id && (
                    <div className="reward_dropdown_menu">
                      <button
                        onClick={() => handleEditReward(reward)}
                        className="reward_dropdown_item"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
                        className="reward_dropdown_item delete"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="reward_content">
              <h3 className="reward_title">{reward.title}</h3>
              <p className="reward_description">{reward.description}</p>

              <div className="reward_details">
                <div className="reward_cost">
                  <Star size={16} color="#f59e0b" fill="#f59e0b" />
                  <span>{reward.pointsCost} points</span>
                </div>
                <div className="reward_category">
                  <span className="category_badge">{reward.category}</span>
                </div>
              </div>

              <div className="reward_meta">
                <div className="reward_usage">
                  <Users size={14} />
                  <span>Used {reward.usageCount || 0} times</span>
                </div>
                {reward.validUntil && (
                  <div className="reward_expiry">
                    <Calendar size={14} />
                    <span>Expires {formatDate(reward.validUntil)}</span>
                  </div>
                )}
                {reward.usageLimit && (
                  <div className="reward_limit">
                    <span>Limit: {reward.usageLimit}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRewards.length === 0 && !loading && (
        <div className="rewards_no_data">
          <Gift size={48} color="#d1d5db" />
          <p>
            {rewards.length === 0
              ? "No rewards created yet. Add your first reward to get started!"
              : "No rewards found matching your search criteria."}
          </p>
        </div>
      )}

      {/* Add/Edit Reward Panel */}
      <AddRewardPanel
        isOpen={isAddPanelOpen}
        onClose={handleClosePanel}
        onSubmit={handleSubmitReward}
        editingReward={editingReward}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default RewardsTab;
