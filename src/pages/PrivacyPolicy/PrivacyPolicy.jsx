import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt, FaShieldAlt } from "react-icons/fa";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import "./PrivacyPolicy.css";
import second from "./../../assets/Image/logog.png";

// Custom hook for scroll animations
const useScrollAnimation = () => {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(".scroll-animate");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

const policyData = {
  title: "Privacy Policy for Fashion Tally",
  lastUpdated: "23 January 2026",
  sections: [
    {
      title: "Introduction",
      content:
        'Fashion Tally ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our website, mobile application, services, or interact with our advertisements.',
      list: [],
    },
    {
      title: "1. Information We Collect",
      content:
        "We may collect the following information when you use Fashion Tally or submit a form:",
      list: [
        "Full name",
        "Email address",
        "Phone number",
        "Business information (such as fashion brand name)",
        "Usage data related to how you interact with our platform",
      ],
    },
    {
      title: "2. How We Use Your Information",
      content: "We use the information we collect to:",
      list: [
        "Provide and improve Fashion Tally's services",
        "Create and manage user accounts",
        "Communicate with you about demos, updates, and support",
        "Send relevant product information and educational content",
        "Comply with legal, regulatory, and tax requirements",
      ],
    },
    {
      title: "3. Legal Basis for Processing",
      content: "We collect and process your information based on:",
      list: [
        "Your consent (when you submit forms or sign up)",
        "Our legitimate business interests",
        "Legal and regulatory obligations",
      ],
    },
    {
      title: "4. Data Sharing",
      content:
        "We do not sell your personal information. We may share your information only with:",
      list: [
        "Trusted service providers who help operate our platform",
        "Legal or regulatory authorities when required by law",
      ],
    },
    {
      title: "Data Sharing Commitment",
      content:
        "All third parties are required to keep your information secure and confidential.",
      list: [],
    },
    {
      title: "5. Data Security",
      content:
        "We take reasonable technical and organizational measures to protect your information from unauthorized access, loss, misuse, or disclosure.",
      list: [],
    },
    {
      title: "6. Data Retention",
      content:
        "We retain personal information only for as long as necessary to:",
      list: [
        "Fulfill the purposes outlined in this policy",
        "Meet legal, accounting, or regulatory requirements",
      ],
    },
    {
      title: "7. Your Rights",
      content: "You have the right to:",
      list: [
        "Request access to your personal data",
        "Request correction or deletion of your data",
        "Withdraw consent at any time",
        "Request information about how your data is used",
      ],
    },
    {
      title: "Exercising Your Rights",
      content: "You can exercise these rights by contacting us.",
      list: [],
    },
    {
      title: "8. Cookies and Tracking",
      content:
        "We may use cookies or similar technologies to improve user experience, analyze traffic, and optimize our services.",
      list: [],
    },
    {
      title: "9. Third-Party Links",
      content:
        "Fashion Tally may contain links to third-party websites. We are not responsible for the privacy practices of those websites.",
      list: [],
    },
    {
      title: "10. Updates to This Policy",
      content:
        "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date.",
      list: [],
    },
    {
      title: "11. Contact Us",
      content:
        "If you have any questions about this Privacy Policy or how we handle your data, please contact us at:",
      list: [
        "Email: info@fashiontally.com",
        "Website: https://fashiontally.com",
      ],
    },
  ],
};

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useScrollAnimation();

  return (
    <div className="privacy_page">
      <nav className="privacy_nav-bar">
        <div className="privacy_nav-container">
          <div className="privacy_nav-content">
            <div className="privacy_nav-logo">
              <img src={second} alt="logo" className="privacy_logo-image" />
              <span className="privacy_logo-textt">FashionTally</span>
            </div>
            <div className="privacy_nav-links-desktop">
              <a href="/" className="privacy_nav-link">
                Home
              </a>
              <a href="/#featurees" className="privacy_nav-link">
                Features
              </a>
              <a href="/#pricing" className="privacy_nav-link">
                Pricing
              </a>
              <a href="/about" className="privacy_nav-link">
                About
              </a>
              <a href="/contact" className="privacy_nav-link">
                Contact
              </a>
              <div className="privacy_nav-buttons">
                <button
                  className="privacy_btn-outline"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
                <button
                  className="privacy_btn-primaryy"
                  onClick={() => navigate("/signup")}
                >
                  Get Started
                </button>
              </div>
            </div>
            <div className="privacy_nav-mobile-toggle">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="privacy_menu-btn"
              >
                {isMenuOpen ? <IoClose size={24} /> : <HiMenuAlt3 size={24} />}
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div
            className="privacy_nav-mobile-menu"
            style={{
              animation: isMenuOpen
                ? "slideDown 0.3s ease-out"
                : "slideUp 0.3s ease-out",
            }}
          >
            <a
              href="/"
              className="privacy_nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </a>
            <a
              href="/#featurees"
              className="privacy_nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="/#pricing"
              className="privacy_nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <a
              href="/about"
              className="privacy_nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            <a
              href="/contact"
              className="privacy_nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </a>
            <div className="privacy_nav-mobile-buttons">
              <button
                className="privacy_btn-outline"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="privacy_btn-primaryy"
                onClick={() => navigate("/signup")}
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="privacy_container">
        {/* Header */}
        <div className="privacy_header">
          <button className="privacy_back-btn" onClick={() => navigate("/")}>
            <FaArrowLeft size={16} />
            Back to Home
          </button>

          <div className="privacy_title-section">
            <div className="privacy_title-wrapper">
              <FaShieldAlt className="privacy_title-icon" />
              <h1 className="privacy_title">{policyData.title}</h1>
            </div>
            <div className="privacy_last-updated">
              <FaCalendarAlt size={16} />
              <span>Last updated: {policyData.lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="privacy_content-card">
          <div className="privacy_content-header">
            <h2 className="privacy_content-title">
              Your Privacy Matters to Us
            </h2>
            <p className="privacy_content-subtitle">
              We are committed to protecting your personal information and being
              transparent about how we use it.
            </p>
          </div>
          <div className="privacy_content-body">
            {policyData.sections.map((section, index) => (
              <div key={index} className="privacy_section">
                <h3 className="privacy_section-title">{section.title}</h3>
                <p className="privacy_section-content">{section.content}</p>
                {section.list && section.list.length > 0 && (
                  <ul className="privacy_section-list">
                    {section.list.map((item, itemIndex) => (
                      <li key={itemIndex} className="privacy_list-item">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {index < policyData.sections.length - 1 && (
                  <div className="privacy_section-separator" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="privacy_footer">
          <p className="privacy_footer-text">
            If you have any questions about this Privacy Policy, please don't
            hesitate to contact us.
          </p>
          <div className="privacy_footer-buttons">
            <button
              className="privacy_btn-outline"
              onClick={() => navigate("/contact")}
            >
              Contact Us
            </button>
            <button
              className="privacy_btn-primaryy"
              onClick={() => navigate("/")}
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
