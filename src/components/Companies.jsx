import React from "react";
import { showAlert } from "../utils/alerts.jsx";
import "../styles/Companies.css";

const Companies = () => {
  /**
   * Show coming soon alert for platforms in development
   */
  const handleComingSoon = (platformName) => {
    showAlert.info(
      `${platformName} — Coming Soon! 🚀`,
      "We're putting the finishing touches on this one. Check back soon!",
      {
        confirmButtonText: "Can't Wait!",
        timer: 4000,
        timerProgressBar: true
      }
    );
  };

  /**
   * Sister Companies and Platforms
    * Array of related business platforms under SAPTech Uganda umbrella
   */
  const companies = [
    {
      title: "SAP Business Management Software",
      image: "/images/sap-business-management.png",
      description: "Comprehensive business management solution for small businesses to enterprises worldwide. Streamline operations, manage inventory, track finances, and grow your business with our all-in-one platform.",
      comingSoon: false,
      link: "https://www.sapbusiness-managementsoftware.com"
    },
    {
      title: "SAP Engineering",
      image: "/images/SAP-ENGINEERING.jpg",
      description: "Specializing in electrical, civil, and mechanical engineering solutions for Uganda and beyond. We deliver innovative, safe, and efficient engineering projects for all sectors.",
      comingSoon: true
    },
    {
      title: "SAP Online Learning",
      image: "/images/sap-onlineplatform.png",
      description: "Your gateway to digital skills! Explore online courses in programming, design, engineering, and more, tailored for African learners and professionals.",
      comingSoon: true
    },
    {
      title: "SAP E-Commerce",
      image: "/images/sap-ecomerce-site.jpg",
      description: "Modern online shopping platform for Ugandan businesses and customers. Secure payments, product management, and seamless user experience.",
      comingSoon: true
    }
  ];

  const liveCompanies = companies.filter((c) => !c.comingSoon);
  const comingSoonCompanies = companies.filter((c) => c.comingSoon);

  return (
    <section id="companies" className="companies">
      <div className="container">
        <h2>Our Other Platforms</h2>

        {/* Live platforms — full cards */}
        <div className="companies-list">
          {liveCompanies.map((company, index) => (
            <div key={index} className="company-card">
              <img src={company.image} alt={company.title} className="company-img" />
              <div className="company-content">
                <h3>{company.title}</h3>
                <p>{company.description}</p>
                <a href={company.link} target="_blank" rel="noopener noreferrer" className="company-link">
                  Visit {company.title}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Coming-soon roadmap — subtle strip */}
        {comingSoonCompanies.length > 0 && (
          <div className="coming-soon-roadmap">
            <p className="roadmap-label">More platforms on the way:</p>
            <div className="roadmap-items">
              {comingSoonCompanies.map((company, index) => (
                <button
                  key={index}
                  className="roadmap-item"
                  onClick={() => handleComingSoon(company.title)}
                  title={company.description}
                >
                  {company.title}
                  <span className="roadmap-badge">Coming Soon</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Companies;
