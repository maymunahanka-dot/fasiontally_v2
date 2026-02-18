import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt, FaFileAlt } from "react-icons/fa";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import "./TermsOfService.css";
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
  title: "Fashion Tally – Terms of Service",
  lastUpdated: "27th January 2026",
  sections: [
    {
      title: "Welcome to Fashion Tally",
      content:
        'By accessing or using the Fashion Tally platform (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, please do not use the Service.',
    },
    {
      title: "1. About Fashion Tally",
      content:
        "Fashion Tally is a digital business management platform designed for fashion designers, tailors, fashion retailers, and related fashion entrepreneurs to manage records, inventory, clients, invoices, and financial data. Fashion Tally provides tools, not professional, legal, tax, or accounting advice.",
    },
    {
      title: "2. Eligibility",
      content: "To use Fashion Tally, you must:",
      list: [
        "Be at least 18 years old",
        "Have the legal capacity to enter a binding agreement",
        "Use the Service only for lawful business purposes",
      ],
    },
    {
      title: "3. Account Registration & Responsibility",
      content:
        "You are responsible for maintaining the confidentiality of your login details. All activities under your account are your responsibility. Fashion Tally is not liable for losses caused by unauthorized access due to your negligence. You agree to provide accurate and up-to-date information at all times.",
    },
    {
      title: "4. Subscription, Payments & Billing",
      content:
        "Fashion Tally operates on a paid subscription model. Subscription fees are stated clearly before payment. All payments are non-refundable, unless otherwise stated in writing by Fashion Tally. Failure to complete payment may result in restricted or suspended access. Fashion Tally reserves the right to:",
      list: [
        "Change pricing with prior notice",
        "Introduce new paid features",
        "Offer promotional pricing at its discretion",
      ],
    },
    {
      title: "5. No Refund Policy",
      content: "Once a payment is made:",
      list: [
        "No refunds will be issued for partial use, non-use, or user error",
        "Demo access or trial sessions are provided to help users make informed decisions before payment",
      ],
    },
    {
      title: "6. Acceptable Use Policy",
      content: "You agree NOT to:",
      list: [
        "Use Fashion Tally for fraudulent or illegal activities",
        "Upload false, misleading, or unlawful data",
        "Attempt to hack, reverse-engineer, or misuse the platform",
        "Share or resell access without permission",
      ],
    },
    {
      title: "Violation Consequences",
      content:
        "Violation may lead to immediate suspension or termination without notice.",
    },
    {
      title: "7. Data & User Content",
      content:
        "You retain ownership of your business data. By using Fashion Tally, you grant us permission to store, process, and display your data solely for service delivery. Fashion Tally may use aggregated and anonymized data for analytics, improvements, and reporting. We do not sell user data to third parties.",
    },
    {
      title: "8. Data Accuracy Disclaimer",
      content: "Fashion Tally does not guarantee:",
      list: [
        "Accuracy of user-entered data",
        "Financial correctness if data is entered incorrectly",
        "Compliance with tax laws if records are incomplete or inaccurate",
      ],
    },
    {
      title: "Data Responsibility",
      content:
        "You are fully responsible for reviewing and verifying your records.",
    },
    {
      title: "9. System Availability",
      content:
        "We aim for high availability but do not guarantee uninterrupted access. Downtime may occur due to:",
      list: ["Maintenance", "Updates", "Technical issues beyond our control"],
    },
    {
      title: "Availability Disclaimer",
      content:
        "Fashion Tally is not liable for losses caused by temporary service unavailability.",
    },
    {
      title: "10. Limitation of Liability",
      content: "To the fullest extent permitted by law:",
      list: [
        "Fashion Tally shall not be liable for indirect, incidental, or consequential damages",
        "Including loss of profits, data, reputation, or business opportunities",
      ],
    },
    {
      title: "Risk Acknowledgment",
      content: "Your use of the Service is at your own risk.",
    },
    {
      title: "11. Intellectual Property",
      content: "All platform content including:",
      list: [
        "Software",
        "Branding",
        "Logos",
        "Interface design",
        "Documentation",
      ],
    },
    {
      title: "Property Rights",
      content:
        "Are the exclusive property of Fashion Tally. Unauthorized use is strictly prohibited.",
    },
    {
      title: "12. Termination",
      content: "Fashion Tally may suspend or terminate your account if:",
      list: [
        "You violate these Terms",
        "You misuse the platform",
        "Required payments are not made",
      ],
    },
    {
      title: "Termination Effects",
      content: "Upon termination, access to your account may be revoked.",
    },
    {
      title: "13. Modifications to Terms",
      content:
        "Fashion Tally reserves the right to update these Terms at any time. Continued use of the Service means acceptance of the updated Terms.",
    },
    {
      title: "14. Governing Law",
      content:
        "These Terms shall be governed by the laws of the Federal Republic of Nigeria.",
    },
    {
      title: "15. Contact Information",
      content: "For questions or concerns regarding these Terms:",
      list: [
        "📧 Email: info@fashiontally.com",
        "📞 Phone/WhatsApp: +2349123124709",
      ],
    },
  ],
};

const TermsOfService = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useScrollAnimation();

  return (
    <div className="terms_page">
      <nav className="terms_nav-bar">
        <div className="terms_nav-container">
          <div className="terms_nav-content">
            <div className="terms_nav-logo">
              <img src={second} alt="logo" className="terms_logo-image" />
              <span className="terms_logo-textt">FashionTally</span>
            </div>
            <div className="terms_nav-links-desktop">
              <a href="/" className="terms_nav-link">
                Home
              </a>
              <a href="/#featurees" className="terms_nav-link">
                Features
              </a>
              <a href="/#pricing" className="terms_nav-link">
                Pricing
              </a>
              <a href="/about" className="terms_nav-link">
                About
              </a>
              <a href="/contact" className="terms_nav-link">
                Contact
              </a>
              <div className="terms_nav-buttons">
                <button
                  className="terms_btn-outline"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
                <button
                  className="terms_btn-primaryy"
                  onClick={() => navigate("/signup")}
                >
                  Get Started
                </button>
              </div>
            </div>
            <div className="terms_nav-mobile-toggle">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="terms_menu-btn"
              >
                {isMenuOpen ? <IoClose size={24} /> : <HiMenuAlt3 size={24} />}
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div
            className="terms_nav-mobile-menu"
            style={{
              animation: isMenuOpen
                ? "slideDown 0.3s ease-out"
                : "slideUp 0.3s ease-out",
            }}
          >
            <a
              href="/"
              className="terms_nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </a>
            <a
              href="/#featurees"
              className="terms_nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="/#pricing"
              className="terms_nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <a
              href="/about"
              className="terms_nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            <a
              href="/contact"
              className="terms_nav-mobile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </a>
            <div className="terms_nav-mobile-buttons">
              <button
                className="terms_btn-outline"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="terms_btn-primaryy"
                onClick={() => navigate("/signup")}
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="terms_container">
        {/* Header */}
        <div className="terms_header">
          <button className="terms_back-btn" onClick={() => navigate("/")}>
            <FaArrowLeft size={16} />
            Back to Home
          </button>

          <div className="terms_title-section">
            <div className="terms_title-wrapper">
              <FaFileAlt className="terms_title-icon" />
              <h1 className="terms_title">{policyData.title}</h1>
            </div>
            <div className="terms_last-updated">
              <FaCalendarAlt size={16} />
              <span>Last updated: {policyData.lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="terms_content-card">
          <div className="terms_content-header">
            <h2 className="terms_content-title">Terms and Conditions of Use</h2>
            <p className="terms_content-subtitle">
              Please read these terms carefully before using our platform. By
              using FashionTally, you agree to these terms.
            </p>
          </div>
          <div className="terms_content-body">
            {policyData.sections.map((section, index) => (
              <div key={index} className="terms_section">
                <h3 className="terms_section-title">{section.title}</h3>
                <p className="terms_section-content">{section.content}</p>
                {section.list && section.list.length > 0 && (
                  <ul className="terms_section-list">
                    {section.list.map((item, itemIndex) => (
                      <li key={itemIndex} className="terms_list-item">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {index < policyData.sections.length - 1 && (
                  <div className="terms_section-separator" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="terms_footer">
          <p className="terms_footer-text">
            By using our service, you acknowledge that you have read and
            understood these terms.
          </p>
          <div className="terms_footer-buttons">
            <button
              className="terms_btn-outline"
              onClick={() => navigate("/contact")}
            >
              Contact Us
            </button>
            <button
              className="terms_btn-primaryy"
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

export default TermsOfService;
