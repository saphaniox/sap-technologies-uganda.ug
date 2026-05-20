import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { getImageUrl } from "../utils/imageUrl";
import apiService from "../services/api";
import "../styles/Header.css";

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "portfolio", label: "Our Featured Projects" },
  { id: "software", label: "Software Apps", route: "/software" },
  { id: "iot", label: "IoT Projects", route: "/iot" },
  { id: "contact", label: "Contact" }
];

const Header = ({ isAuthenticated, userName, userRole, userProfilePic, onAuthModalOpen, onAccountOpen, onAdminOpen, onLogout }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchTimerRef = useRef(null);
  const searchInputRef = useRef(null);
  
  const location = useLocation();
  const isAwardsPage = location.pathname === "/awards";

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 700);
    };
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults(null);
    clearTimeout(searchTimerRef.current);
  };

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(searchTimerRef.current);
    if (val.trim().length < 2) {
      setSearchResults(null);
      return;
    }
    searchTimerRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await apiService.search(val.trim());
        if (res.success) setSearchResults(res.results);
      } catch {
        setSearchResults(null);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveLink(sectionId);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const handleHomeNavigation = () => {
    closeMenu();
    if (location.pathname !== "/" || isAwardsPage) {
      window.location.href = "/";
      return;
    }
    scrollToSection("home");
  };

  const handleSectionNavigation = (event, sectionId) => {
    event.preventDefault();
    closeMenu();

    if (location.pathname !== "/" || isAwardsPage) {
      window.location.href = `/#${sectionId}`;
      return;
    }

    scrollToSection(sectionId);
  };

  const handleMenuAction = (callback) => {
    closeMenu();
    callback?.();
  };

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const logoVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        duration: 1,
        ease: "easeOut",
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    hover: {
      scale: 1.1,
      rotate: [0, -10, 10, -10, 0],
      transition: { duration: 0.5 }
    }
  };

  const linkVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    hover: {
      scale: 1.1,
      y: -2,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const glowVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.8, delay: 0.5 }
    }
  };

  return (
    <motion.header 
      className={`header ${isMobile ? "mobile" : "desktop"} ${isScrolled ? "scrolled" : ""}`}
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <motion.nav className={`nav ${userRole === "admin" ? "nav-admin" : ""}`}>
        {/* Animated background glow */}
        <motion.div 
          className={`nav-glow ${userRole === "admin" ? "nav-glow-admin" : ""}`}
          variants={glowVariants}
        />
        
        <motion.div 
          className="logo"
          variants={logoVariants}
          whileHover="hover"
          whileTap={{ scale: 0.9 }}
          onClick={handleHomeNavigation}
          style={{ cursor: "pointer" }}
        >
          <motion.img 
            src="/images/logo2.jpg" 
            alt="SAP Logo" 
            className="logo-img"
            animate={{
              rotateY: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotateY: { duration: 4, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            SAPTech Uganda
          </motion.span>
        </motion.div>

        <motion.button
          type="button"
          className={`nav-menu-toggle ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(open => !open)}
          variants={linkVariants}
          whileHover="hover"
          whileTap="tap"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation-sidebar"
        >
          <span className="menu-bars" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span className="menu-toggle-text">Menu</span>
        </motion.button>

        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.button
                type="button"
                className="nav-sidebar-backdrop"
                onClick={closeMenu}
                aria-label="Close navigation menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.aside
                id="main-navigation-sidebar"
                className={`nav-sidebar ${userRole === "admin" ? "nav-sidebar-admin" : ""}`}
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 32 }}
              >
                <div className="nav-sidebar-header">
                  <div className="nav-sidebar-brand">
                    <img src="/images/logo2.jpg" alt="SAPTech Uganda" />
                    <div>
                      <strong>SAPTech Uganda</strong>
                      <span>Navigation</span>
                    </div>
                  </div>
                  <button type="button" className="nav-sidebar-close" onClick={closeMenu} aria-label="Close menu">x</button>
                </div>

                <nav className="nav-sidebar-links" aria-label="Main navigation">
                  {NAV_ITEMS.map((link) => (
                    link.route ? (
                      <Link
                        key={link.id}
                        to={link.route}
                        onClick={closeMenu}
                        className={`nav-sidebar-link ${location.pathname === link.route ? "active" : ""}`}
                      >
                        <span>{link.label}</span>
                      </Link>
                    ) : (
                      <a
                        key={link.id}
                        href={`#${link.id}`}
                        onClick={(event) => handleSectionNavigation(event, link.id)}
                        className={`nav-sidebar-link ${activeLink === link.id ? "active" : ""}`}
                      >
                        <span>{link.label}</span>
                      </a>
                    )
                  ))}

                  {userRole === "admin" && (
                    <div className="nav-sidebar-group">
                      <span className="nav-sidebar-label">Admin</span>
                      <button type="button" className="nav-sidebar-link nav-sidebar-button" onClick={() => handleMenuAction(onAdminOpen)}>
                        <span>Dashboard</span>
                      </button>
                      <button type="button" className="nav-sidebar-link nav-sidebar-button" onClick={() => handleMenuAction(onAdminOpen)}>
                        <span>Users</span>
                      </button>
                    </div>
                  )}

                  <div className="nav-sidebar-auth">
                    {!isAuthenticated ? (
                      <>
                        <button type="button" className="nav-sidebar-action login-action" onClick={() => handleMenuAction(() => onAuthModalOpen("login"))}>
                          Login
                        </button>
                        <button type="button" className="nav-sidebar-action signup-action" onClick={() => handleMenuAction(() => onAuthModalOpen("signup"))}>
                          Sign Up
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="nav-sidebar-action account-action" onClick={() => handleMenuAction(onAccountOpen)}>
                          <span className="account-profile">
                            {userProfilePic ? (
                              <img src={getImageUrl(userProfilePic)} alt={userName || "Profile"} className="profile-pic-small" />
                            ) : (
                              <span className="profile-icon">U</span>
                            )}
                            <span className="profile-name">{userName || "My Account"}</span>
                          </span>
                        </button>
                        {userRole === "admin" && (
                          <button type="button" className="nav-sidebar-action admin-action" onClick={() => handleMenuAction(onAdminOpen)}>
                            Admin
                          </button>
                        )}
                        <button type="button" className="nav-sidebar-action logout-action" onClick={() => handleMenuAction(onLogout)}>
                          Logout
                        </button>
                      </>
                    )}
                  </div>
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
        {/* Search Button */}
        <motion.button
          className="nav-search-btn"
          onClick={openSearch}
          title="Search"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Open search"
        >
          Search</motion.button>

        {/* Theme Toggle */}
        <motion.div 
          className="nav-theme-toggle"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <ThemeToggle />
        </motion.div>
      </motion.nav>

      {/* Global Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.target === e.currentTarget && closeSearch()}
          >
            <motion.div
              className="search-modal"
              initial={{ y: -40, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="search-modal-header">
                <div className="search-input-wrap">
                  <span className="search-modal-icon">Search</span>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInput}
                    placeholder="Search products, services, projects..."
                    className="search-modal-input"
                    onKeyDown={(e) => e.key === "Escape" && closeSearch()}
                  />
                  {searchQuery && (
                    <button
                      className="search-input-clear"
                      onClick={() => { setSearchQuery(""); setSearchResults(null); }}
                      aria-label="Clear search"
                    >
                      x
                    </button>
                  )}
                </div>
                <button className="search-close-btn" onClick={closeSearch}>Close</button>
              </div>

              <div className="search-modal-results">
                {searchLoading && (
                  <div className="search-loading">
                    <span className="search-spinner" /> Searching...
                  </div>
                )}

                {!searchLoading && searchResults && (() => {
                  const hasProducts = searchResults.products?.length > 0;
                  const hasServices = searchResults.services?.length > 0;
                  const hasProjects = searchResults.projects?.length > 0;
                  if (!hasProducts && !hasServices && !hasProjects) {
                    return <div className="search-no-results">No results found for "<strong>{searchQuery}</strong>"</div>;
                  }
                  return (
                    <>
                      {hasProducts && (
                        <div className="search-result-section">
                          <h4 className="search-section-title"> Products</h4>
                          {searchResults.products.map((p) => (
                            <a key={p._id} href="#products" className="search-result-item" onClick={closeSearch}>
                              <span className="search-result-name">{p.name}</span>
                              <span className="search-result-meta">{p.category}</span>
                            </a>
                          ))}
                        </div>
                      )}
                      {hasServices && (
                        <div className="search-result-section">
                          <h4 className="search-section-title"> Services</h4>
                          {searchResults.services.map((s) => (
                            <a key={s._id} href="#services" className="search-result-item" onClick={closeSearch}>
                              <span className="search-result-name">{s.title || s.name}</span>
                              <span className="search-result-meta">{s.category}</span>
                            </a>
                          ))}
                        </div>
                      )}
                      {hasProjects && (
                        <div className="search-result-section">
                          <h4 className="search-section-title"> Projects</h4>
                          {searchResults.projects.map((p) => (
                            <a key={p._id} href="#portfolio" className="search-result-item" onClick={closeSearch}>
                              <span className="search-result-name">{p.title || p.name}</span>
                              <span className="search-result-meta">{p.category}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}

                {!searchLoading && !searchResults && (
                  <div className="search-hint">
                    Start typing to search across products, services and projects...
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;

