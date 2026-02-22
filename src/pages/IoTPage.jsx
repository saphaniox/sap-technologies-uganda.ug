import React from "react";
import SEO from "../components/SEO";
import IoTProjects from "../components/IoTProjects";
import "../styles/IoT.css";

const IoTPage = () => {
  // SEO data for better search engine visibility
  const seoData = {
    title: "IoT Projects & Tech Innovations - SAP Technologies Uganda",
    description: "Explore cutting-edge Internet of Things (IoT) projects and tech innovations by SAP Technologies Uganda. Discover our Arduino, Raspberry Pi, ESP32, and custom hardware solutions for smart systems, automation, and connected devices.",
    keywords: "IoT projects Uganda, Internet of Things, SAP Technologies IoT, smart systems, Arduino projects, Raspberry Pi, ESP32, tech innovation Uganda, automation projects, embedded systems, hardware projects, smart home, industrial IoT, IoT solutions Africa, connected devices",
    ogType: "website",
    ogImage: "/images/iot-banner.jpg",
    canonicalUrl: "/iot",
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "IoT Projects & Tech Innovations",
    "description": "Innovative Internet of Things projects and embedded systems developed by SAP Technologies Uganda",
    "provider": {
      "@type": "Organization",
      "name": "SAP Technologies Uganda",
      "url": "https://www.sap-technologies-ug.com"
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
            <h1>🔌 IoT Projects & Tech Innovations</h1>
            <p className="iot-page-subtitle">
              Explore our innovative Internet of Things projects and embedded systems. 
              From smart home automation to industrial solutions, we build connected devices that make life easier.
            </p>
          </div>
        </div>

        {/* Main IoT Projects Component */}
        <IoTProjects />

        {/* Additional SEO Content (hidden but crawlable) */}
        <div className="seo-content" style={{ position: "absolute", left: "-9999px" }}>
          <h2>SAP Technologies IoT Innovations</h2>
          <p>
            SAP Technologies Uganda specializes in developing innovative Internet of Things (IoT) 
            solutions and embedded systems. Our projects leverage cutting-edge technologies including 
            Arduino, Raspberry Pi, ESP32, and custom hardware designs to create smart, connected devices 
            that solve real-world problems.
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
