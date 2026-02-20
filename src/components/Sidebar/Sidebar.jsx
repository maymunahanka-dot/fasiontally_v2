import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../backend/firebase.config";
import { useNewAuth } from "../../contexts/NewAuthContext";
import { getEffectiveUserEmail } from "../../utils/teamUtils";

import { TbUsersGroup } from "react-icons/tb";
import { SiHackthebox } from "react-icons/si";
import { MdOutlineColorLens } from "react-icons/md";
import { CiDeliveryTruck } from "react-icons/ci";
import { TbInvoice } from "react-icons/tb";
import { SlCalender } from "react-icons/sl";
import { FaArrowTrendUp } from "react-icons/fa6";
import { TbUserStar } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";
import { RiApps2AiLine } from "react-icons/ri";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";

import "./Sidebar.css";
import logo from "../../assets/Image/logog.png";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useNewAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Brand data state
  const [brandData, setBrandData] = useState({
    businessName: "",
    businessAddress: "",
    businessPhone: "",
    businessEmail: "",
    logoUrl: "",
  });

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard Overview",
      icon: <RiApps2AiLine className="sidebar-icon" />,
      path: "/dashboard",
    },
    {
      id: "clients",
      label: "Clients Management",
      icon: <TbUsersGroup className="sidebar-icon" />,
      path: "/dashboard/clients",
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: <SiHackthebox className="sidebar-icon" />,
      path: "/dashboard/inventory",
    },
    {
      id: "designs",
      label: "Designs",
      icon: <MdOutlineColorLens className="sidebar-icon" />,
      path: "/dashboard/designs",
    },
    {
      id: "orders",
      label: "Order Management",
      icon: <CiDeliveryTruck className="sidebar-icon" />,
      path: "/dashboard/orders",
    },
    {
      id: "invoice",
      label: "Invoice",
      icon: <TbInvoice className="sidebar-icon" />,
      path: "/dashboard/invoice",
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: <SlCalender className="sidebar-icon" />,
      path: "/dashboard/appointments",
    },
    {
      id: "finances",
      label: "Finances",
      icon: <FaArrowTrendUp className="sidebar-icon" />,
      path: "/dashboard/finances",
    },
    {
      id: "crm",
      label: "CRM",
      icon: <TbUserStar className="sidebar-icon" />,
      path: "/dashboard/crm",
    },
  ];

  const settingsItem = {
    id: "settings",
    label: "More Settings",
    icon: <IoSettingsOutline className="sidebar-icon" />,
    path: "/dashboard/settings",
  };

  const handleNavigation = (path) => {
    navigate(path);
    // Close mobile sidebar after navigation
    setIsMobileOpen(false);
  };

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  // Touch handlers for swipe functionality
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    // Close sidebar on left swipe when open
    if (isLeftSwipe && isMobileOpen) {
      setIsMobileOpen(false);
    }
    // Open sidebar on right swipe from left edge when closed
    if (isRightSwipe && !isMobileOpen && touchStart < 50) {
      setIsMobileOpen(true);
    }
  };

  // Load brand data
  useEffect(() => {
    const loadBrandData = async () => {
      if (!user?.email) return;

      try {
        const effectiveEmail = getEffectiveUserEmail(user);

        // First, try to get from brand settings collection
        const brandRef = doc(db, "fashiontally_brand_settings", effectiveEmail);
        const brandDoc = await getDoc(brandRef);

        if (brandDoc.exists()) {
          const data = brandDoc.data();
          setBrandData({
            businessName: data.businessName || "",
            businessAddress: data.businessAddress || "",
            businessPhone: data.businessPhone || "",
            businessEmail: data.businessEmail || "",
            logoUrl: data.logoUrl || "",
          });
        } else {
          // Fallback to user collection
          const userRef = doc(db, "fashiontally_users", effectiveEmail);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setBrandData({
              businessName: userData.businessName || "",
              businessAddress: userData.address || "",
              businessPhone: userData.phone || "",
              businessEmail: userData.email || "",
              logoUrl: userData.logoUrl || userData.profilePicture || "",
            });
          }
        }
      } catch (error) {
        console.error("Error loading brand data:", error);
      }
    };

    loadBrandData();
  }, [user]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileOpen &&
        !event.target.closest(".sidebar") &&
        !event.target.closest(".sidebar-lever")
      ) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* Draggable Lever Handle */}
      <div
        className={`sidebar-lever ${isMobileOpen ? "sidebar-lever-open" : ""}`}
        onClick={toggleMobileSidebar}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="lever-handle">
          <div className="lever-grip"></div>
          <div className="lever-grip"></div>
          <div className="lever-grip"></div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className={`mobile-overlay ${isMobileOpen ? "active" : ""}`}
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar ${isMobileOpen ? "sidebar-mobile-open" : ""}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="sidebar-header">
          <img src={logo} alt="FashionTally" className="sidebar-logo" />
          <h2 className="sidebar-title">FashionTally</h2>
        </div>

        {/* Brand Info Section */}
        {brandData.businessName && (
          <div className="sidebar-brand-info">
            <div className="brand-info-container">
              <div className="brand-logo-container">
                {brandData.logoUrl ? (
                  <img
                    src={brandData.logoUrl}
                    alt={brandData.businessName}
                    className="brand-logo-img"
                  />
                ) : (
                  <div className="brand-logo-placeholder">
                    {brandData.businessName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="brand-details">
                <h3 className="brand-name">{brandData.businessName}</h3>
                {brandData.businessAddress && (
                  <p className="brand-address">{brandData.businessAddress}</p>
                )}
                {brandData.businessPhone && (
                  <p className="brand-contact">{brandData.businessPhone}</p>
                )}
                {brandData.businessEmail && (
                  <p className="brand-contact">{brandData.businessEmail}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.id} className="sidebar-menu-item">
                <button
                  className={`sidebar-link ${
                    isActive(item.path) ? "sidebar-link-active" : ""
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.icon}
                  <span className="sidebar-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="sidebar-settings">
            <button
              className={`sidebar-link ${
                isActive(settingsItem.path) ? "sidebar-link-active" : ""
              }`}
              onClick={() => handleNavigation(settingsItem.path)}
            >
              {settingsItem.icon}
              <span className="sidebar-label">{settingsItem.label}</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
