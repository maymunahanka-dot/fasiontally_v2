import { useState } from "react";
import {
  Search,
  Filter,
  Mail,
  Calendar,
  ChevronUp,
  MousePointer,
} from "lucide-react";
import Button from "../button/Button";
import "./CampaignTab.css";

const CampaignTab = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Sample campaign data based on the image
  const campaignData = [
    {
      id: 1,
      title: "December Holiday Special",
      description: "20% Off All Ankara Designs - Limited Time!",
      status: "Sent",
      statusColor: "#10b981",
      stats: {
        sent: 145,
        opened: { count: 92, percentage: 63 },
        clicked: { count: 34, percentage: 23 },
      },
    },
    {
      id: 2,
      title: "Year-End Appreciation",
      description: "Thank You for an Amazing 2025!",
      status: "Scheduled",
      statusColor: "#3b82f6",
      scheduledDate: "27 December 2025",
    },
    {
      id: 3,
      title: "New Collection Launch",
      description: "Introducing Our Latest Ankara Collection",
      status: "Sent",
      statusColor: "#10b981",
      stats: {
        sent: 230,
        opened: { count: 156, percentage: 68 },
        clicked: { count: 45, percentage: 20 },
      },
    },
    {
      id: 4,
      title: "Valentine's Day Special",
      description: "Love is in the Air - Special Discounts",
      status: "Draft",
      statusColor: "#6b7280",
      scheduledDate: "14 February 2026",
    },
  ];

  const filteredCampaigns = campaignData.filter(
    (campaign) =>
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="campaign_tab">
      {/* Search Section */}
      <div className="campaign_search_section">
        <div className="campaign_search_container">
          <Search className="campaign_search_icon" size={20} />
          <input
            type="text"
            placeholder="Search Campaigns..."
            className="campaign_search_input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="campaign_filter_btn">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="campaign_header">
        <h2 className="campaign_count">
          {filteredCampaigns.length} Email Campaigns
        </h2>
        <Button variant="primary" size="small">
          Create
        </Button>
      </div>

      {/* Campaigns List */}
      <div className="campaign_list">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="campaign_card">
            {/* Campaign Header */}
            <div className="campaign_card_header">
              <div className="campaign_card_left">
                <h3 className="campaign_title">{campaign.title}</h3>
                <p className="campaign_description">{campaign.description}</p>
              </div>
              <div
                className="campaign_status_badge"
                style={{ backgroundColor: campaign.statusColor }}
              >
                {campaign.status}
              </div>
            </div>

            {/* Campaign Stats or Schedule Info */}
            {campaign.stats ? (
              <div className="campaign_stats">
                <div className="campaign_stat_item">
                  <Mail size={16} className="campaign_stat_icon" />
                  <div className="campaign_stat_content">
                    <span className="campaign_stat_label">Sent</span>
                    <span className="campaign_stat_value">
                      {campaign.stats.sent}
                    </span>
                  </div>
                </div>
                <div className="campaign_stat_item">
                  <ChevronUp
                    size={16}
                    className="campaign_stat_icon campaign_stat_success"
                  />
                  <div className="campaign_stat_content">
                    <span className="campaign_stat_label">Opened</span>
                    <span className="campaign_stat_value campaign_stat_success">
                      {campaign.stats.opened.count} (
                      {campaign.stats.opened.percentage}%)
                    </span>
                  </div>
                </div>
                <div className="campaign_stat_item">
                  <MousePointer
                    size={16}
                    className="campaign_stat_icon campaign_stat_success"
                  />
                  <div className="campaign_stat_content">
                    <span className="campaign_stat_label">Clicked</span>
                    <span className="campaign_stat_value campaign_stat_success">
                      {campaign.stats.clicked.count} (
                      {campaign.stats.clicked.percentage}%)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="campaign_schedule_info">
                <Calendar size={16} className="campaign_schedule_icon" />
                <span className="campaign_schedule_text">
                  Scheduled for {campaign.scheduledDate}
                </span>
              </div>
            )}

            {/* View Button */}
            <Button
              variant="secondary"
              size="small"
              icon={<Mail size={16} />}
              iconPosition="left"
              className="campaign_view_btn"
            >
              View
            </Button>
          </div>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="campaign_no_results">
          <p>No campaigns found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default CampaignTab;
