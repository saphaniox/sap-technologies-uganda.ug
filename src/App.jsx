import React, { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Slider from "./components/Slider";
import About from "./components/About";
import AuthModal from "./components/AuthModal";
import BackToTop from "./components/BackToTop";
import NotFound from "./components/NotFound";
import WhatsAppButton from "./components/WhatsAppButton";
import CookieConsent from "./components/CookieConsent";
import { CartProvider, useCart } from "./contexts/CartContext";
import Cart from "./components/Cart";
import apiService from "./services/api";
import keepAliveService from "./services/keepAliveService";
import { initializeAnimations } from "./utils/animations";

// Below-fold sections — lazy-loaded so initial bundle stays lean
const Services = lazy(() => import("./components/Services"));
const Portfolio = lazy(() => import("./components/Portfolio"));
const Partners = lazy(() => import("./components/Partners"));
const Companies = lazy(() => import("./components/Companies"));
const Products = lazy(() => import("./components/Products"));
const Contact = lazy(() => import("./components/Contact"));
const Footer = lazy(() => import("./components/Footer"));
const Testimonials = lazy(() => import("./components/Testimonials"));
import { microAnimationStyles } from "./utils/microAnimations.jsx";
import { useVisitorTracking } from "./hooks/useVisitorTracking";
import "./styles/App.css";
import "./styles/ErrorBoundary.css";

// Secondary pages and modals — lazy-loaded so they don't bloat the initial bundle
const CertificateVerify = lazy(() => import("./pages/CertificateVerify"));
const SoftwarePage = lazy(() => import("./pages/SoftwarePage"));
const IoTPage = lazy(() => import("./pages/IoTPage"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const Account = lazy(() => import("./components/Account"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./components/TermsOfService"));

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

  const clearPanelState = () => {
    setShowAccount(false);
    setShowAdmin(false);
    localStorage.removeItem("showAccount");
    localStorage.removeItem("showAdmin");
    localStorage.removeItem("showPrivacyPolicy");
    localStorage.removeItem("showTermsOfService");
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      apiService.clearCache();
    } catch {
      apiService.clearCache();
    } finally {
      setIsAuthenticated(false);
      setUserName("");
      setUserDetails(null);
      clearPanelState();
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
      <CartProvider>
      <div className="App">
        <Suspense fallback={null}>
        <Routes>
          <Route path="/verify/:certificateId" element={<CertificateVerify />} />
          <Route path="/software" element={<SoftwarePage />} />
          <Route path="/iot" element={<IoTPage />} />
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
              
              <main>
                <Hero />
                <Slider />
                <About />
                <Suspense fallback={null}>
                  <Services />
                  <Portfolio />
                  <Partners />
                  <Companies />
                  <Products />
                  <Testimonials />
                  <Contact />
                </Suspense>
              </main>
              
              <Suspense fallback={null}>
                <Footer 
                  onPrivacyPolicyOpen={handlePrivacyPolicyOpen}
                  onTermsOfServiceOpen={handleTermsOfServiceOpen}
                  onNavigate={null}
                />
              </Suspense>
              <BackToTop />
              <WhatsAppButton />
              <CookieConsent onPrivacyPolicyOpen={handlePrivacyPolicyOpen} />
              <Cart />
              <CartFloatButton />
              
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
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </div>
      </CartProvider>
    </ErrorBoundary>
  );
}

function CartFloatButton() {
  const { cartCount, openCart } = useCart();
  if (cartCount === 0) return null;
  return (
    <button
      className="cart-float-btn"
      onClick={openCart}
      aria-label={`Open cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
      title="View cart"
    >
      🛒
      <span className="cart-float-badge">{cartCount}</span>
    </button>
  );
}

export default App;
