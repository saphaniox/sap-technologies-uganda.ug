import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Newsletter from "./Newsletter";
import "../styles/Footer.css";

const SECTION_LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "portfolio", label: "Our Featured Projects" },
  { id: "products", label: "Products" },
  { id: "contact", label: "Contact" },
  { id: "companies", label: "Our Platforms" }
];

const Footer = ({ onPrivacyPolicyOpen, onTermsOfServiceOpen, onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (onNavigate) {
      onNavigate(sectionId);
      return;
    }

    navigate({ pathname: "/", hash: `#${sectionId}` });
  };

  const goToRoute = (route) => {
    onNavigate?.();
    if (location.pathname === route) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    navigate(route);
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <img src="/images/logo.png" alt="SAPTech Uganda" className="footer-logo" />
          <span>SAPTech Uganda</span>
          <p>Kampala Uganda</p>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            {SECTION_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`/#${link.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToSection(link.id);
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a href="/software" onClick={(event) => { event.preventDefault(); goToRoute("/software"); }}>
                Software Apps
              </a>
            </li>
            <li>
              <a href="/iot" onClick={(event) => { event.preventDefault(); goToRoute("/iot"); }}>
                IoT Projects
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>
          <p>Email: <a href="mailto:saptechnologies256@gmail.com">saptechnologies256@gmail.com</a></p>
          <p>Phone: <a href="tel:+256706564628">+256 706 564 628</a></p>
          <p>WhatsApp: <a href="https://wa.me/256706564628" target="_blank" rel="noopener noreferrer">Chat with us</a></p>
        </div>

        <div className="footer-social">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="https://www.linkedin.com/in/saphan-muganza-a893a9258?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" title="LinkedIn">LinkedIn</a>
            <a href="https://github.com/dashboard" target="_blank" rel="noopener noreferrer" title="GitHub">GitHub</a>
            <a href="https://x.com/SaphanMuganza2?t=-9Ox4ssAxetvwLcFRtQ2YA&s=09" target="_blank" rel="noopener noreferrer" title="Twitter">Twitter</a>
            <a href="https://www.facebook.com/profile.php?id=61563028584961" target="_blank" rel="noopener noreferrer" title="Facebook">Facebook</a>
            <a href="https://wa.me/256706564628" target="_blank" rel="noopener noreferrer" title="WhatsApp">WhatsApp</a>
            <a href="mailto:saptechnologies256@gmail.com" title="Email">Email</a>
          </div>

          <Newsletter />
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-legal">
          <p>&copy; 2026 SAPTech Uganda-Africa. All rights reserved.</p>
          <div className="legal-links">
            <button
              type="button"
              onClick={onPrivacyPolicyOpen}
              className="legal-link"
              aria-label="Privacy Policy"
            >
              Privacy Policy
            </button>
            <span className="separator">|</span>
            <button
              type="button"
              onClick={onTermsOfServiceOpen}
              className="legal-link"
              aria-label="Terms of Service"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      <div className="footer-credits">
        <p>
          Designed & Powered by{" "}
          <a
            href="https://www.sap-technologies.com"
            target="_blank"
            rel="noopener noreferrer"
            className="credits-link"
          >
            SAPTech Uganda
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
