import React from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import IoTProjects from "../components/IoTProjects";
import "../styles/IoT.css";

const IoTPage = () => {
  const navigate = useNavigate();
  // SEO data for better search engine visibility
  const seoData = {
    title: "IoT Solutions & Connected Systems - SAPTech Uganda",
    description: "Explore practical Internet of Things (IoT) projects by SAPTech Uganda, from smart monitoring and automation to custom hardware, sensors, and connected devices built for real environments.",
    keywords: "IoT projects Uganda, Internet of Things, SAPTech Uganda IoT, smart systems, Arduino projects, Raspberry Pi, ESP32, tech innovation Uganda, automation projects, embedded systems, hardware projects, smart home, industrial IoT, IoT solutions Africa, connected devices",
    ogType: "website",
    ogImage: "/images/iot-banner.jpg",
    canonicalUrl: "/iot",
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "IoT Solutions & Connected Systems",
    "description": "Practical Internet of Things projects and embedded systems developed by SAPTech Uganda",
    "provider": {
      "@type": "Organization",
      "name": "SAPTech Uganda",
      "url": "https://sap-technologies.ug"
    },
    "about": {
      "@type": "Technology",
      "name": "Internet of Things (IoT)",
      "description": "Smart connected devices and embedded systems"
    }
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

      <div className="iot-page">
        {/* Page Header */}
        <div className="iot-page-header">
          <div className="container">
            <button onClick={() => navigate("/")} className="back-button" aria-label="Back to homepage">
              <i className="fas fa-arrow-left"></i> Back
            </button>
            <h1>IoT Solutions Built for Real Work</h1>
            <p className="iot-page-subtitle">
              Explore connected systems designed for homes, farms, workshops, schools, and businesses.
              We turn sensors, devices, and automation into useful tools people can actually rely on.
            </p>
          </div>
        </div>

        {/* Main IoT Projects Component */}
        <IoTProjects />

        {/* Additional SEO Content (hidden but crawlable) */}
        <div className="seo-content" style={{ position: "absolute", left: "-9999px" }}>
          <h2>SAPTech Uganda IoT Innovations</h2>
          <p>
            SAPTech Uganda develops practical Internet of Things (IoT) solutions and embedded systems.
            Our work combines Arduino, Raspberry Pi, ESP32, sensors, connectivity, and custom hardware
            to create connected devices for real-world monitoring, automation, and control.
          </p>
          <h3>Our IoT Expertise</h3>
          <ul>
            <li>Smart Home Automation Systems</li>
            <li>Industrial IoT Solutions</li>
            <li>Environmental Monitoring Devices</li>
            <li>Agriculture Tech & Smart Farming</li>
            <li>Security & Surveillance Systems</li>
            <li>Custom Hardware Development</li>
            <li>Sensor Networks & Data Collection</li>
            <li>Remote Monitoring & Control</li>
          </ul>
          <h3>Technologies We Use</h3>
          <p>
            Arduino, Raspberry Pi, ESP8266, ESP32, NodeMCU, STM32, MQTT, LoRaWAN, 
            Bluetooth, WiFi, Zigbee, custom PCB design, 3D printing, sensors, 
            actuators, and cloud integration.
          </p>
        </div>
      </div>
    </>
  );
};

export default IoTPage;

