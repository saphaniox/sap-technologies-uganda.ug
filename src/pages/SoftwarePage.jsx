import React from "react";
import SEO from "../components/SEO";
import Softwares from "../components/Softwares";
import "../styles/Software.css";

const SoftwarePage = () => {
  // SEO data for better search engine visibility
  const seoData = {
    title: "Software Apps - SAP Technologies Uganda",
    description: "Explore innovative software applications and web tools developed by SAP Technologies Uganda. Access our portfolio of custom web apps, business solutions, and digital tools designed to enhance productivity and efficiency.",
    keywords: "SAP Technologies software, SAP Technologies apps, SAP Technologies Uganda software, web applications Uganda, custom software solutions, business apps, digital tools, technology solutions Uganda, web apps, software portfolio, sap technologies applications",
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
      "name": "SAP Technologies Uganda",
      "url": "https://www.sap-technologies.com"
    },
    "description": "Collection of innovative software applications and web tools developed by SAP Technologies Uganda for enhanced productivity and business efficiency."
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
          <h2>SAP Technologies Uganda Software Solutions</h2>
          <p>
            SAP Technologies Uganda develops cutting-edge software applications and web-based tools
            to help businesses and individuals achieve their goals. Our software portfolio includes
            custom web applications, business management tools, productivity apps, and innovative
            digital solutions tailored to the Ugandan market and beyond.
          </p>
          <h3>Why Choose SAP Technologies Software?</h3>
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
