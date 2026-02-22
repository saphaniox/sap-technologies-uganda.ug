import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { getImageUrl } from "../utils/imageUrl";
import "../styles/Header.css";

const Header = ({ isAuthenticated, userName, userRole, userProfilePic, onAuthModalOpen, onAccountOpen, onAdminOpen, onLogout }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  
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
            SAP-Technologies Uganda
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
    </motion.header>
  );
};

export default Header;
