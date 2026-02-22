import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/Header";
import SeasonalGreeting from "./components/SeasonalGreeting";
import CertificateVerify from "./pages/CertificateVerify";
import SoftwarePage from "./pages/SoftwarePage";
import Hero from "./components/Hero";
import Slider from "./components/Slider";
import About from "./components/About";
import Services from "./components/Services";
import Portfolio from "./components/Portfolio";
import Partners from "./components/Partners";
import Companies from "./components/Companies";
import Products from "./components/Products";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import ForgotPassword from "./components/ForgotPassword";
import Account from "./components/Account";
import AdminDashboard from "./components/AdminDashboard";
// import Awards from "./components/Awards"; // Deactivated until end of 2026
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import BackToTop from "./components/BackToTop";
import apiService from "./services/api";
import keepAliveService from "./services/keepAliveService";
import { initializeAnimations } from "./utils/animations";
import { microAnimationStyles } from "./utils/microAnimations.jsx";
import { useVisitorTracking } from "./hooks/useVisitorTracking";
import "./styles/App.css";
import "./styles/ErrorBoundary.css";

function App() {
  // Enable visitor tracking
  useVisitorTracking();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: "login" });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Persist page visibility across refreshes
  const [showAccount, setShowAccount] = useState(() => {
    return localStorage.getItem("showAccount") === "true";
  });
  const [showAdmin, setShowAdmin] = useState(() => {
    return localStorage.getItem("showAdmin") === "true";
  });
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(() => {
    return localStorage.getItem("showPrivacyPolicy") === "true";
  });
  const [showTermsOfService, setShowTermsOfService] = useState(() => {
    return localStorage.getItem("showTermsOfService") === "true";
  });

  useEffect(() => {
    // Start keep-alive service to prevent server from sleeping
    keepAliveService.start();
    
    // Also do an immediate wake-up call
    apiService.wakeUpServer();
    
    checkAuthStatus();
    initializeAnimations();
    
    localStorage.removeItem("showAwards");
    
    const styleElement = document.createElement("style");
    styleElement.textContent = microAnimationStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
      // Stop keep-alive service when app unmounts
      keepAliveService.stop();
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authStatus = await apiService.checkAuthStatus();
      
      if (authStatus.isAuthenticated && authStatus.user) {
        setIsAuthenticated(true);
        setUserName(authStatus.user.name || "");
        setUserDetails(authStatus.user);
      } else {
        setIsAuthenticated(false);
        setUserName("");
        setUserDetails(null);
      }
    } catch (error) {
      console.error("Error checking authentication status:", error);
      setIsAuthenticated(false);
      setUserName("");
      setUserDetails(null);
    }
  };

  const handleAuthModalOpen = (mode) => {
    setAuthModal({ isOpen: true, mode });
  };

  const handleAuthModalClose = () => {
    setAuthModal({ isOpen: false, mode: "login" });
  };

  const handleAuthModeSwitch = (newMode) => {
    if (newMode === "forgotPassword") {
      setAuthModal({ isOpen: false, mode: "login" });
      setShowForgotPassword(true);
    } else {
      setAuthModal({ isOpen: true, mode: newMode });
    }
  };

  const handleAuthSuccess = (data) => {
    setIsAuthenticated(true);
    // Extract user data from login response
    if (data.data) {
      setUserName(data.data.name || "");
      setUserDetails(data.data.user);
    } else {
      // Fallback for older response format
      setUserName(data.name || "");
      checkAuthStatus();
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      // Clear API cache to ensure fresh auth state
      apiService.clearCache();
      setIsAuthenticated(false);
      setUserName("");
      setUserDetails(null);
      setShowAccount(false); // Close account modal on logout
      setShowAdmin(false); // Close admin modal on logout
      // Clear localStorage
      localStorage.removeItem("showAccount");
      localStorage.removeItem("showAdmin");
      localStorage.removeItem("showPrivacyPolicy");
      localStorage.removeItem("showTermsOfService");
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout on client side even if server request fails
      apiService.clearCache();
      setIsAuthenticated(false);
      setUserName("");
      setUserDetails(null);
      setShowAccount(false);
      setShowAdmin(false);
      // Clear localStorage
      localStorage.removeItem("showAccount");
      localStorage.removeItem("showAdmin");
      localStorage.removeItem("showPrivacyPolicy");
      localStorage.removeItem("showTermsOfService");
    }
  };

  const handleAccountOpen = () => {
    setShowAccount(true);
    localStorage.setItem("showAccount", "true");
  };

  const handleAccountClose = () => {
    setShowAccount(false);
    localStorage.removeItem("showAccount");
  };

  const handleAdminOpen = () => {
    setShowAdmin(true);
    localStorage.setItem("showAdmin", "true");
  };

  const handleAdminClose = () => {
    setShowAdmin(false);
    localStorage.removeItem("showAdmin");
  };

  const handlePrivacyPolicyOpen = () => {
    setShowPrivacyPolicy(true);
    localStorage.setItem("showPrivacyPolicy", "true");
  };

  const handlePrivacyPolicyClose = () => {
    setShowPrivacyPolicy(false);
    localStorage.removeItem("showPrivacyPolicy");
  };

  const handleTermsOfServiceOpen = () => {
    setShowTermsOfService(true);
    localStorage.setItem("showTermsOfService", "true");
  };

  const handleTermsOfServiceClose = () => {
    setShowTermsOfService(false);
    localStorage.removeItem("showTermsOfService");
  };

  return (
    <ErrorBoundary>
      <div className="App">
        <Routes>
          <Route path="/verify/:certificateId" element={<CertificateVerify />} />
          <Route path="/software" element={<SoftwarePage />} />
          
          <Route path="/*" element={
            <>
              <Header 
                key={`header-${isAuthenticated ? 'auth' : 'guest'}`}
                isAuthenticated={isAuthenticated}
                userName={userName}
                userRole={userDetails?.role}
                userProfilePic={userDetails?.profilePic}
                onAuthModalOpen={handleAuthModalOpen}
                onAccountOpen={handleAccountOpen}
                onAdminOpen={handleAdminOpen}
                onLogout={handleLogout}
              />
              
              <SeasonalGreeting />
              
              <main>
                <Hero />
                <Slider />
                <About />
                <Services />
                <Portfolio />
                <Partners />
                <Companies />
                <Products />
                <Contact />
              </main>
              
              <Footer 
                onPrivacyPolicyOpen={handlePrivacyPolicyOpen}
                onTermsOfServiceOpen={handleTermsOfServiceOpen}
                onNavigate={null}
              />
              <BackToTop />
              
              <AuthModal 
                isOpen={authModal.isOpen}
                mode={authModal.mode}
                onClose={handleAuthModalClose}
                onAuthSuccess={handleAuthSuccess}
                onModeSwitch={handleAuthModeSwitch}
              />
              
              <ForgotPassword 
                isOpen={showForgotPassword}
                onClose={() => setShowForgotPassword(false)}
              />
              
              {showAccount && (
                <Account 
                  onClose={handleAccountClose}
                />
              )}
              
              {showAdmin && (
                <AdminDashboard 
                  user={userDetails}
                  onClose={handleAdminClose}
                />
              )}

              {showPrivacyPolicy && (
                <PrivacyPolicy 
                  onClose={handlePrivacyPolicyClose}
                />
              )}

              {showTermsOfService && (
                <TermsOfService 
                  onClose={handleTermsOfServiceClose}
                />
              )}
            </>
          } />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;
