import React, { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
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
import PhotoLightbox from "./components/PhotoLightbox";
import GoogleAdSense from "./components/GoogleAdSense";
import SEO from "./components/SEO";
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
import "./styles/theme-complete.css";

const SITE_URL = "https://www.sap-technologies.com";

const SECTION_ROUTE_MAP = {
  "/": "home",
  "/about": "about",
  "/services": "services",
  "/portfolio": "portfolio",
  "/products": "products",
  "/partners": "partners",
  "/companies": "companies",
  "/testimonials": "testimonials",
  "/contact": "contact"
};

const SECTION_SEO = {
  home: {
    path: "/",
    title: "SAPTech Uganda | Engineering & Technology Solutions",
    description: "SAPTech Uganda provides web development, software, IoT, engineering, cloud, cybersecurity, and digital transformation services in Uganda.",
    keywords: "SAPTech Uganda, technology company Uganda, web development Uganda, software development Uganda, IoT projects Uganda"
  },
  about: {
    path: "/about",
    title: "About SAPTech Uganda | Engineering & Technology Team",
    description: "Learn about SAPTech Uganda, a Kampala technology team building practical engineering, software, and digital solutions for businesses and communities.",
    keywords: "about SAPTech Uganda, technology team Uganda, engineering company Kampala"
  },
  services: {
    path: "/services",
    title: "Services | SAPTech Uganda",
    description: "Explore SAPTech Uganda services including web development, mobile apps, custom software, cloud services, cybersecurity, IoT, and engineering support.",
    keywords: "IT services Uganda, web development services Uganda, mobile app development Uganda, cybersecurity Uganda, IoT services Uganda"
  },
  portfolio: {
    path: "/portfolio",
    title: "Projects & Portfolio | SAPTech Uganda",
    description: "View SAPTech Uganda projects across web platforms, business systems, software products, engineering, IoT, and digital transformation.",
    keywords: "SAPTech Uganda projects, technology portfolio Uganda, software projects Kampala"
  },
  products: {
    path: "/products",
    title: "Products | SAPTech Uganda",
    description: "Browse technology products, software tools, and digital solutions available from SAPTech Uganda.",
    keywords: "SAPTech Uganda products, technology products Uganda, software products Uganda"
  },
  partners: {
    path: "/partners",
    title: "Partners | SAPTech Uganda",
    description: "Meet SAPTech Uganda partners and collaborators supporting technology, engineering, software, and digital growth.",
    keywords: "SAPTech Uganda partners, technology partners Uganda, business partners Kampala"
  },
  companies: {
    path: "/companies",
    title: "Platforms & Companies | SAPTech Uganda",
    description: "Explore SAPTech Uganda platforms, companies, and connected initiatives in engineering and technology.",
    keywords: "SAPTech Uganda platforms, SAPTech companies, Uganda technology platforms"
  },
  testimonials: {
    path: "/testimonials",
    title: "Testimonials | SAPTech Uganda",
    description: "Read client feedback and testimonials from people and organizations working with SAPTech Uganda.",
    keywords: "SAPTech Uganda testimonials, SAPTech reviews, technology company reviews Uganda"
  },
  contact: {
    path: "/contact",
    title: "Contact SAPTech Uganda",
    description: "Contact SAPTech Uganda for software development, web design, engineering, IoT, cloud, cybersecurity, and digital transformation projects.",
    keywords: "contact SAPTech Uganda, SAPTech Kampala, software developer Uganda contact"
  }
};

const normalizePath = (pathname) => {
  const cleanPath = pathname.replace(/\/+$/, "");
  return cleanPath || "/";
};

const getSectionIdFromPath = (pathname) => SECTION_ROUTE_MAP[normalizePath(pathname)];

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
  const navigate = useNavigate();
  const location = useLocation();

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
  const legalPageOpen = showPrivacyPolicy || showTermsOfService;
  const currentSectionId = getSectionIdFromPath(location.pathname);
  const currentSectionSeo = SECTION_SEO[currentSectionId] || SECTION_SEO.home;
  const currentSectionUrl = `${SITE_URL}${currentSectionSeo.path === "/" ? "/" : currentSectionSeo.path}`;

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

  const scrollToMainSection = useCallback((sectionId, attempt = 0) => {
    if (!sectionId || sectionId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (attempt < 18) {
      window.setTimeout(() => scrollToMainSection(sectionId, attempt + 1), 120);
    }
  }, []);

  useEffect(() => {
    const hashSectionId = location.hash
      ? decodeURIComponent(location.hash.replace("#", ""))
      : "";
    const routeSectionId = getSectionIdFromPath(location.pathname);
    const targetSectionId = hashSectionId || routeSectionId;

    if (!targetSectionId) return;

    window.setTimeout(() => scrollToMainSection(targetSectionId), 140);
  }, [location.hash, location.pathname, scrollToMainSection]);

  const handleSiteNavigation = (sectionId) => {
    setShowPrivacyPolicy(false);
    setShowTermsOfService(false);
    localStorage.removeItem("showPrivacyPolicy");
    localStorage.removeItem("showTermsOfService");

    if (!sectionId) return;

    if (sectionId === "home") {
      if (location.pathname !== "/") {
        navigate("/");
      }
      window.setTimeout(() => scrollToMainSection("home"), 120);
      return;
    }

    if (location.pathname !== "/") {
      navigate({ pathname: "/", hash: `#${sectionId}` });
    } else {
      navigate({ pathname: "/", hash: `#${sectionId}` });
      window.setTimeout(() => scrollToMainSection(sectionId), 80);
    }
  };

  return (
    <ErrorBoundary>
      <CartProvider>
      <div className="App">
        <GoogleAdSense />
        <Suspense fallback={null}>
        <Routes>
          <Route path="/verify/:certificateId" element={<CertificateVerify />} />
          <Route path="/software" element={<SoftwarePage />} />
          <Route path="/iot" element={<IoTPage />} />
          <Route path="/*" element={
            <>
              <SEO
                title={currentSectionSeo.title}
                description={currentSectionSeo.description}
                keywords={currentSectionSeo.keywords}
                canonicalUrl={currentSectionUrl}
                url={currentSectionUrl}
                ogImage="/images/logo.png"
              />
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
                onNavigate={handleSiteNavigation}
                legalOpen={legalPageOpen}
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
                  onNavigate={handleSiteNavigation}
                />
              </Suspense>
              <BackToTop />
              <WhatsAppButton />
              <CookieConsent onPrivacyPolicyOpen={handlePrivacyPolicyOpen} />
              <PhotoLightbox />
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
                  onNavigate={handleSiteNavigation}
                  onTermsOfServiceOpen={handleTermsOfServiceOpen}
                />
              )}

              {showTermsOfService && (
                <TermsOfService 
                  onClose={handleTermsOfServiceClose}
                  onNavigate={handleSiteNavigation}
                  onPrivacyPolicyOpen={handlePrivacyPolicyOpen}
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
