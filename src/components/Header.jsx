import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { getImageUrl } from "../utils/imageUrl";
import apiService from "../services/api";
import "../styles/Header.css";

const Header = ({ isAuthenticated, userName, userRole, userProfilePic, onAuthModalOpen, onAccountOpen, onAdminOpen, onLogout }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
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
          onClick={() => {
            if (isAwardsPage) {
              window.location.href = "/";
            } else {
              scrollToSection("home");
            }
          }}
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

        <motion.ul className="nav-links">
          {[
            { id: "home", label: "Home" },
            { id: "about", label: "About" },
            { id: "services", label: "Services" },
            { id: "portfolio", label: "Our Featured Projects" },
            { id: "software", label: "Software Apps" },
            { id: "iot", label: "IoT Projects" },
            { id: "contact", label: "Contact" }
          ].map((link, index) => (
            <motion.li 
              key={link.id}
              variants={linkVariants}
              custom={index}
            >
              {link.id === "software" ? (
                // Software Apps - Navigate to dedicated page
                <Link to="/software">
                  <motion.span 
                    className="link-text"
                    variants={linkVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {link.label}
                  </motion.span>
                </Link>
              ) : link.id === "iot" ? (
                // IoT Projects - Navigate to dedicated page
                <Link to="/iot">
                  <motion.span 
                    className="link-text"
                    variants={linkVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {link.label}
                  </motion.span>
                </Link>
              ) : isAwardsPage ? (
                // On Awards page, link back to homepage sections
                <Link to={`/#${link.id}`}>
                  <motion.span 
                    className="link-text"
                    variants={linkVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {link.label}
                  </motion.span>
                </Link>
              ) : (
                // On homepage, scroll to sections
                <motion.a
                  href={`#${link.id}`}
                  onClick={(e) => { 
                    e.preventDefault(); 
                    scrollToSection(link.id);
                  }}
                  variants={linkVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className={activeLink === link.id ? "active" : ""}
                >
                  <motion.span className="link-text">
                    {link.label}
                  </motion.span>
                  <motion.div 
                    className="link-underline"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              )}
            </motion.li>
          ))}

          {/* Saphaniox Awards - Standalone Page Link - Commented out until needed */}
          {/* <motion.li 
            variants={linkVariants}
            custom={5}
          >
            <Link to="/awards">
              <motion.span
                className="link-text awards-link"
                variants={linkVariants}
                whileHover="hover"
                whileTap="tap"
              >
                🏆 Saphaniox Awards 2025
              </motion.span>
            </Link>
          </motion.li> */}

          {/* Admin-specific navigation items */}
          {userRole === "admin" && (
            <>
              <motion.li variants={linkVariants}>
                <motion.a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onAdminOpen(); }}
                  variants={linkVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="admin-nav-item"
                >
                  <motion.span className="link-text">
                    📊 Dashboard
                  </motion.span>
                  <motion.div 
                    className="link-underline"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              </motion.li>
              
              <motion.li variants={linkVariants}>
                <motion.a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onAdminOpen(); }}
                  variants={linkVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="admin-nav-item"
                >
                  <motion.span className="link-text">
                    👥 Users
                  </motion.span>
                  <motion.div 
                    className="link-underline"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              </motion.li>
            </>
          )}
          
          <AnimatePresence mode="wait">
            {!isAuthenticated ? (
              <motion.div 
                key="auth-links"
                className="auth-links"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
              >
                <motion.li variants={linkVariants}>
                  <motion.a
                    href="#"
                    onClick={(e) => { e.preventDefault(); onAuthModalOpen("login"); }}
                    variants={linkVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="login-btn"
                  >
                    <motion.span>Login</motion.span>
                  </motion.a>
                </motion.li>
                <motion.li variants={linkVariants}>
                  <motion.a
                    href="#"
                    onClick={(e) => { e.preventDefault(); onAuthModalOpen("signup"); }}
                    variants={linkVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="signup-btn"
                  >
                    <motion.span>Sign Up</motion.span>
                  </motion.a>
                </motion.li>
              </motion.div>
            ) : (
              <motion.div 
                key="user-links"
                className="user-links"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
              >
                <motion.li variants={linkVariants}>
                  <motion.a
                    href="#"
                    onClick={(e) => { e.preventDefault(); onAccountOpen(); }}
                    variants={linkVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="account-btn"
                  >
                    <motion.div className="account-profile">
                      {userProfilePic ? (
                        <img 
                          src={getImageUrl(userProfilePic)} 
                          alt={userName || "Profile"}
                          className="profile-pic-small"
                        />
                      ) : (
                        <span className="profile-icon">👤</span>
                      )}
                      <span className="profile-name">{userName || "My Account"}</span>
                    </motion.div>
                  </motion.a>
                </motion.li>
                
                {userRole === "admin" && (
                  <motion.li variants={linkVariants}>
                    <motion.a
                      href="#"
                      onClick={(e) => { e.preventDefault(); onAdminOpen(); }}
                      variants={linkVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="admin-btn"
                    >
                      <motion.span>Admin</motion.span>
                    </motion.a>
                  </motion.li>
                )}
                
                <motion.li variants={linkVariants}>
                  <motion.a
                    href="#"
                    onClick={(e) => { e.preventDefault(); onLogout(); }}
                    variants={linkVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="logout-btn"
                  >
                    <motion.span>Logout</motion.span>
                  </motion.a>
                </motion.li>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.ul>
        
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
          🔍
        </motion.button>

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
                  <span className="search-modal-icon">🔍</span>
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
                    >✕</button>
                  )}
                </div>
                <button className="search-close-btn" onClick={closeSearch}>✕ Close</button>
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
                          <h4 className="search-section-title">🛒 Products</h4>
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
                          <h4 className="search-section-title">⚙️ Services</h4>
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
                          <h4 className="search-section-title">🗂 Projects</h4>
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

