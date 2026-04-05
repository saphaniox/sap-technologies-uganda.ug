import React from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import Softwares from "../components/Softwares";
import "../styles/Software.css";

const SoftwarePage = () => {
  const navigate = useNavigate();
  // SEO data for better search engine visibility
  const seoData = {
    title: "Software Apps - SapTech Uganda",
    description: "Explore innovative software applications and web tools developed by SapTech Uganda. Access our portfolio of custom web apps, business solutions, and digital tools designed to enhance productivity and efficiency.",
    keywords: "SapTech Uganda software, SapTech Uganda apps, SapTech Uganda software, web applications Uganda, custom software solutions, business apps, digital tools, technology solutions Uganda, web apps, software portfolio, SapTech Uganda applications",
    ogType: "website",
    ogImage: "/images/software-banner.jpg", // Optional: Add a banner image
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
      "name": "SapTech Uganda",
      "url": "https://sap-technologies.ug"
    },
    "description": "Collection of innovative software applications and web tools developed by SapTech Uganda for enhanced productivity and business efficiency."
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
            <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
              <i className="fas fa-arrow-left"></i> Back
            </button>
            <h1>Software Apps</h1>
            <p className="software-page-subtitle">
              Explore our portfolio of innovative web applications and digital tools. 
              Launch apps directly from your browser - no downloads or installations required.
            </p>
          </div>
        </div>

        {/* Main Software Component */}
        <Softwares />

        {/* Additional SEO Content (hidden but crawlable) */}
        <div className="seo-content" style={{ position: "absolute", left: "-9999px" }}>
          <h2>SapTech Uganda Software Solutions</h2>
          <p>
            SapTech Uganda develops cutting-edge software applications and web-based tools
            to help businesses and individuals achieve their goals. Our software portfolio includes
            custom web applications, business management tools, productivity apps, and innovative
            digital solutions tailored to the Ugandan market and beyond.
          </p>
          <h3>Why Choose SapTech Uganda software?</h3>
          <ul>
            <li>Web-based applications - access from anywhere</li>
            <li>No installation required - launch instantly</li>
            <li>Custom solutions tailored to your needs</li>
            <li>Secure and reliable technology</li>
            <li>Regular updates and support</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default SoftwarePage;

