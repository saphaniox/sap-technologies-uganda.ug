import React from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import Softwares from "../components/Softwares";
import "../styles/Software.css";

const SoftwarePage = () => {
  const navigate = useNavigate();
  // SEO data for better search engine visibility
  const seoData = {
    title: "Software Apps & Business Systems | SAPTech Uganda",
    description: "Explore SAPTech Uganda software apps, custom web applications, business management systems, ecommerce tools, school systems, inventory systems, dashboards, and digital business platforms built in Uganda.",
    keywords: "SAPTech Uganda software, software apps Uganda, custom software Uganda, web applications Uganda, business management software Uganda, school management system Uganda, inventory management system Uganda, ecommerce platform Uganda, restaurant ordering system Uganda, learning management system Uganda, digital tools Kampala, business apps Uganda",
    ogType: "website",
    ogImage: "/images/software.jpg",
    canonicalUrl: "/software",
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "price": "0",
      "description": "Free to use web applications"
    },
    "provider": {
      "@type": "Organization",
      "name": "SAPTech Uganda",
      "url": "https://sap-technologies.com"
    },
    "description": "Collection of innovative software applications and web tools developed by SAPTech Uganda for enhanced productivity and business efficiency."
  };

  return (
    <>
      {/* SEO Component with comprehensive meta tags */}
      <SEO 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        ogType={seoData.ogType}
        ogImage={seoData.ogImage}
        canonicalUrl={seoData.canonicalUrl}
        structuredData={structuredData}
      />

      <div className="software-page">
        {/* Page Header */}
        <div className="software-page-header">
          <div className="container">
            <button onClick={() => navigate("/")} className="back-button" aria-label="Back to homepage">
              <i className="fas fa-arrow-left"></i> Back
            </button>
            <h1>Software Apps</h1>
            <p className="software-page-subtitle">
              Explore our portfolio of innovative web applications and digital tools. 
              Launch apps directly from your browser - no downloads or installations required.
            </p>
            <div className="software-page-highlights" aria-label="Software app benefits">
              <span>Browser based</span>
              <span>No installs</span>
              <span>Business ready</span>
            </div>
          </div>
        </div>

        {/* Main Software Component */}
        <Softwares />

        <section className="software-search-content" aria-labelledby="software-search-title">
          <div className="container">
            <h2 id="software-search-title">Software solutions for Ugandan businesses</h2>
            <p>
              SAPTech Uganda builds practical software for companies, schools, shops, restaurants,
              organizations, and startups that need reliable digital tools. Our work covers custom
              web applications, business management systems, ecommerce platforms, inventory tracking,
              school management systems, learning platforms, dashboards, booking tools, and internal
              workflow systems.
            </p>
            <div className="software-search-grid" aria-label="Common software project types">
              <span>Custom web applications</span>
              <span>Business management software</span>
              <span>School management systems</span>
              <span>Inventory management systems</span>
              <span>Ecommerce platforms</span>
              <span>Restaurant ordering systems</span>
              <span>Learning management systems</span>
              <span>Dashboards and reporting tools</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SoftwarePage;

