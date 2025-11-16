import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// Get API base URL
const getApiUrl = () => {
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' || 
     window.location.hostname === '0.0.0.0');
  
  if (isLocalhost && import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || "";
  }
  return import.meta.env.VITE_API_URL || "https://sap-technologies-ug.onrender.com";
};

const API_BASE_URL = getApiUrl();

// Generate a unique fingerprint for the visitor
const generateFingerprint = () => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.textBaseline = "top";
  ctx.font = "14px 'Arial'";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#f60";
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = "#069";
  ctx.fillText("Browser Fingerprint", 2, 15);
  ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
  ctx.fillText("Browser Fingerprint", 4, 17);

  const canvasData = canvas.toDataURL();
  
  // Combine with other browser properties
  const fingerprint = {
    canvas: canvasData,
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    plugins: Array.from(navigator.plugins || []).map(p => p.name).join(","),
  };

  // Create hash from fingerprint
  const fingerprintString = JSON.stringify(fingerprint);
  let hash = 0;
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36);
};

// Get or create session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem("visitor_session_id");
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("visitor_session_id", sessionId);
  }
  
  return sessionId;
};

// Custom hook for visitor tracking
export const useVisitorTracking = () => {
  const location = useLocation();
  const startTimeRef = useRef(Date.now());
  const maxScrollRef = useRef(0);
  const sessionId = useRef(getSessionId());
  const fingerprint = useRef(generateFingerprint());

  // Track page view
  useEffect(() => {
    startTimeRef.current = Date.now();
    maxScrollRef.current = 0;

    // Send initial page view (will be created by backend middleware)
    // We just need to send fingerprint for identification
    const sendPageView = async () => {
      try {
        // Set headers for tracking
        const headers = {
          "X-Session-ID": sessionId.current,
          "X-Fingerprint": fingerprint.current,
        };

        // The backend middleware will automatically track the page view
        // We don't need to make an explicit API call for initial tracking
        
        // Store in sessionStorage for subsequent updates
        sessionStorage.setItem("x-fingerprint", fingerprint.current);
      } catch (error) {
        console.error("Tracking error:", error);
      }
    };

    sendPageView();

    // Track scroll depth
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollPercentage = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
      
      maxScrollRef.current = Math.max(maxScrollRef.current, scrollPercentage);
    };

    window.addEventListener("scroll", handleScroll);

    // Send page view update when user leaves
    const sendPageViewUpdate = async () => {
      const timeOnPage = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      try {
        await fetch(`${API_BASE_URL}/api/visitor/track`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Session-ID": sessionId.current,
            "X-Fingerprint": fingerprint.current,
          },
          body: JSON.stringify({
            sessionId: sessionId.current,
            path: location.pathname,
            title: document.title,
            timeOnPage,
            scrollDepth: maxScrollRef.current,
            performance: {
              loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
              domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
            }
          }),
        });
      } catch (error) {
        console.error("Failed to update page view:", error);
      }
    };

    // Send update before leaving page
    const handleBeforeUnload = () => {
      sendPageViewUpdate();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Send periodic updates every 30 seconds
    const updateInterval = setInterval(sendPageViewUpdate, 30000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearInterval(updateInterval);
      sendPageViewUpdate(); // Send final update
    };
  }, [location]);

  return {
    sessionId: sessionId.current,
    fingerprint: fingerprint.current,
  };
};

// Track custom events
export const trackEvent = async (eventName, eventValue = "") => {
  try {
    const sessionId = getSessionId();
    const fingerprint = generateFingerprint();
    
    await fetch(`${API_BASE_URL}/api/visitor/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Session-ID": sessionId,
        "X-Fingerprint": fingerprint,
      },
      body: JSON.stringify({
        sessionId,
        path: window.location.pathname,
        event: {
          name: eventName,
          value: eventValue,
          timestamp: new Date(),
        },
      }),
    });
  } catch (error) {
    console.error("Failed to track event:", error);
  }
};

export default useVisitorTracking;
