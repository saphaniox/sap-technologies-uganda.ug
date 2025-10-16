/**
 * Saphaniox Awards - Standalone Inspirational Page
 * 
 * A beautifully designed, standalone awards platform celebrating excellence
 * in engineering and technology. Features include:
 * - Inspiring hero section with dynamic animations
 * - Category showcase with modern cards
 * - Nomination submission system
 * - Nominee gallery with voting
 * - Search, filter, and pagination
 * - Fully responsive and accessible
 * 
 * @component
 */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { showAlert } from "../utils/alerts";
import apiService from "../services/api";
import { getImageUrl, PLACEHOLDERS } from "../utils/imageUrl";
import Footer from "./Footer";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsOfService from "./TermsOfService";
import BackToTop from "./BackToTop";
import "../styles/Awards.css";

const Awards = ({ onClose }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [nominations, setNominations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showNominationForm, setShowNominationForm] = useState(false);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState({
    categories: true,
    nominations: true,
    submitting: false
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("votes");
  const [filterCountry, setFilterCountry] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  
  // Success/Error feedback
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successText, setSuccessText] = useState("");
  
  // Countdown timer state
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  // Modal states for Footer functionality
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);

  // Nomination form state
  const [nominationForm, setNominationForm] = useState({
    isSelfNomination: false,
    nomineeName: "",
    nomineeTitle: "",
    nomineeCompany: "",
    nomineeCountry: "Uganda",
    nomineePhoto: null,
    category: "",
    nominationReason: "",
    achievements: "",
    impactDescription: "",
    nominatorName: "",
    nominatorEmail: "",
    nominatorPhone: "",
    nominatorOrganization: ""
  });

  // Load categories
  useEffect(() => {
    loadCategories();
    
    // Countdown timer - Awards deadline: December 25, 2025, 23:59:59
    const deadline = new Date("2025-12-25T23:59:59").getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = deadline - now;
      
      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Load nominations when filters change
  useEffect(() => {
    loadNominations();
  }, [selectedCategory, searchTerm, sortBy, filterCountry, pagination.currentPage]);

  const loadCategories = async () => {
    try {
      const response = await apiService.get("/awards/categories");
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Failed to load categories:", error);
      // Only show error if it's not a network/timeout issue
      if (!error.message?.includes("Failed to fetch")) {
        showAlert.error("Error", "Failed to load award categories");
      }
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const loadNominations = async () => {
    try {
      setLoading(prev => ({ ...prev, nominations: true }));
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 12,
        sortBy,
        sortOrder: "desc"
      });

      if (selectedCategory) params.append("category", selectedCategory);
      if (filterCountry) params.append("country", filterCountry);
      if (searchTerm) params.append("search", searchTerm);

      const response = await apiService.get(`/awards/nominations?${params}`);
      setNominations(response.data.nominations);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to load nominations:", error);
      // Only show error alert if it's not a network/timeout issue
      if (!error.message?.includes("Failed to fetch") && !error.message?.includes("NetworkError")) {
        showAlert.error("Error", "Failed to load nominations. Please try again.");
      }
    } finally {
      setLoading(prev => ({ ...prev, nominations: false }));
    }
  };

  const handleNominationSubmit = async (e) => {
    e.preventDefault();
    
    if (!nominationForm.nomineePhoto) {
      showAlert.error("Error", "Please upload a photo of the nominee");
      return;
    }

    // Validate required fields for self-nominations
    if (nominationForm.isSelfNomination) {
      if (!nominationForm.nominatorEmail) {
        showAlert.error("Error", "Please provide your email address");
        return;
      }
    } else {
      // Validate required fields for other nominations
      if (!nominationForm.nominatorName) {
        showAlert.error("Error", "Please provide your full name");
        return;
      }
      if (!nominationForm.nominatorEmail) {
        showAlert.error("Error", "Please provide your email address");
        return;
      }
    }

    setLoading(prev => ({ ...prev, submitting: true }));

    try {
      const formData = new FormData();
      
      // For self-nominations, auto-fill nominator name and organization with nominee data
      const submissionData = { ...nominationForm };
      if (submissionData.isSelfNomination) {
        submissionData.nominatorName = submissionData.nomineeName;
        if (!submissionData.nominatorOrganization) {
          submissionData.nominatorOrganization = submissionData.nomineeCompany || "";
        }
      }
      
      Object.keys(submissionData).forEach(key => {
        if (submissionData[key] !== null && submissionData[key] !== "") {
          formData.append(key, submissionData[key]);
          console.log(`📝 Added to FormData: ${key} = ${submissionData[key]}`);
        }
      });

      console.log("🚀 Making API request to /awards/nominations");
      const response = await apiService.post("/awards/nominations", formData);
      // Note: Don't set Content-Type header for FormData - browser sets it automatically

      console.log("✅ API request successful:", response);

      await showAlert.success(
        "🎉 Nomination Submitted!",
        "Thank you for your nomination. It will be reviewed before being published.",
        { timer: 5000 }
      );

      // Reset form
      setNominationForm({
        isSelfNomination: false,
        nomineeName: "",
        nomineeTitle: "",
        nomineeCompany: "",
        nomineeCountry: "Uganda",
        nomineePhoto: null,
        category: "",
        nominationReason: "",
        achievements: "",
        impactDescription: "",
        nominatorName: "",
        nominatorEmail: "",
        nominatorPhone: "",
        nominatorOrganization: ""
      });
      setShowNominationForm(false);
      
      // Reload nominations
      loadNominations();
    } catch (error) {
      console.error("❌ API request failed:", error);
      console.error("📊 Error response:", error.response);
      
      // Extract detailed validation errors
      let errorMessage = "Failed to submit nomination. Please try again.";
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        // Show specific validation errors
        const validationErrors = error.response.data.errors.map(err => err.msg).join("\n• ");
        errorMessage = `Validation errors:\n• ${validationErrors}`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      await showAlert.error(
        "❌ Submission Failed", 
        errorMessage,
        {
          position: 'center',
          showConfirmButton: true,
          confirmButtonText: 'OK'
        }
      );
    } finally {
      console.log("✅ Setting loading state to false");
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  // Success feedback function
  const showSuccess = (message) => {
    setSuccessText(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleVote = async (nominationId, voterEmail) => {
    try {
      await apiService.post(`/awards/nominations/${nominationId}/vote`, {
        voterEmail,
        voterName: "" // Optional
      });

      showSuccess("🎉 Vote Submitted! Thank you for your support!");
      loadNominations(); // Refresh to show updated vote count
    } catch (error) {
      showAlert.error("Vote Failed", error.message || "Failed to submit vote");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setNominationForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const getTopNominations = () => {
    return nominations.slice(0, 6).filter(nom => nom.votes > 0);
  };

  const uniqueCountries = [...new Set(nominations.map(nom => nom.nomineeCountry))];

  // Handler functions for Footer modals
  const handlePrivacyPolicyOpen = () => {
    setShowPrivacyPolicy(true);
  };

  const handlePrivacyPolicyClose = () => {
    setShowPrivacyPolicy(false);
  };

  const handleTermsOfServiceOpen = () => {
    setShowTermsOfService(true);
  };

  const handleTermsOfServiceClose = () => {
    setShowTermsOfService(false);
  };

  // Navigation handler for Footer
  const handleFooterNavigate = (sectionId) => {
    // Show alert to guide user to main page
    showAlert.info(
      `Navigate to ${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} Section`,
      `To access the ${sectionId} section, please close this awards modal and scroll to the ${sectionId} section on the main page.`,
      {
        confirmButtonText: "Close Awards & Go to Main Page",
        cancelButtonText: "Stay Here",
        showCancelButton: true,
        timer: 6000,
        timerProgressBar: true
      }
    ).then((result) => {
      if (result.isConfirmed) {
        // Close the awards modal
        onClose();
        // Small delay to ensure modal closes first
        setTimeout(() => {
          // Try to scroll to the section on main page
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 300);
      }
    });
  };

  return (
    <div className="awards-standalone-page">
      {/* Simple Awards Header */}
      <div className="awards-simple-header">
        <div className="awards-header-content">
          <button 
            className="back-to-home-btn"
            onClick={() => navigate('/')}
            title="Back to Home"
          >
            ← Back to Home
          </button>
          <h1 className="awards-header-title">
            🏆 Welcome to Saphaniox Awards 2025
          </h1>
          <div className="header-spacer"></div>
        </div>
      </div>

      {/* Hero Section - Inspirational */}
      <section className="awards-hero-section">
        <div className="awards-hero-background">
          <div className="hero-logo-background"></div>
          <div className="hero-gradient-overlay"></div>
          <div className="hero-particles"></div>
        </div>
        
        <div className="container awards-hero-container">
          <div className="awards-hero-content">
            <div className="hero-badge animated fadeInDown">
              <span className="badge-icon">🏆</span>
              <span className="badge-text">5 Years of Saphaniox Awards</span>
            </div>
            
            <h1 className="awards-hero-title animated fadeInUp">
              <span className="title-line title-line-1">Celebrating</span>
              <span className="title-line title-line-2">Excellence in</span>
              <span className="title-line title-line-3">
                <span className="gradient-text">Engineering</span> & <span className="gradient-text">Technology</span>
              </span>
            </h1>
            
            <p className="awards-hero-subtitle animated fadeInUp delay-1">
              Recognizing outstanding contributions to technology advancement, innovation, 
              and engineering excellence in Uganda and across the international community. 
              Join us in honoring the minds that shape our digital future.
            </p>
            
            {/* Hero Stats */}
            <div className="awards-hero-stats animated fadeInUp delay-2">
              <div className="hero-stat">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <span className="stat-number">
                    {loading.categories ? "..." : categories.length}
                  </span>
                  <span className="stat-label">Award Categories</span>
                </div>
              </div>
              <div className="hero-stat">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <span className="stat-number">
                    {loading.nominations ? "..." : nominations.length}
                  </span>
                  <span className="stat-label">Nominations</span>
                </div>
              </div>
              <div className="hero-stat">
                <div className="stat-icon">⭐</div>
                <div className="stat-content">
                  <span className="stat-number">
                    {loading.nominations ? "..." : nominations.reduce((total, nom) => total + (nom.votes || 0), 0)}
                  </span>
                  <span className="stat-label">Total Votes</span>
                </div>
              </div>
            </div>
            
            {/* Countdown Timer */}
            <div className="awards-countdown animated fadeInUp delay-4">
              <div className="countdown-header">
                <span className="countdown-icon">⏰</span>
                <h3>Awards Deadline</h3>
              </div>
              <div className="countdown-timer">
                <div className="countdown-item">
                  <span className="countdown-value">{countdown.days}</span>
                  <span className="countdown-label">Days</span>
                </div>
                <div className="countdown-separator">:</div>
                <div className="countdown-item">
                  <span className="countdown-value">{String(countdown.hours).padStart(2, '0')}</span>
                  <span className="countdown-label">Hours</span>
                </div>
                <div className="countdown-separator">:</div>
                <div className="countdown-item">
                  <span className="countdown-value">{String(countdown.minutes).padStart(2, '0')}</span>
                  <span className="countdown-label">Minutes</span>
                </div>
                <div className="countdown-separator">:</div>
                <div className="countdown-item">
                  <span className="countdown-value">{String(countdown.seconds).padStart(2, '0')}</span>
                  <span className="countdown-label">Seconds</span>
                </div>
              </div>
            </div>
            
            {/* Hero Actions */}
            <div className="awards-hero-actions animated fadeInUp delay-3">
              <button
                className="awards-btn awards-btn-primary"
                onClick={() => setShowNominationForm(true)}
              >
                <span className="btn-icon">✨</span>
                <span className="btn-text">Submit Nomination</span>
              </button>
              <button
                className="awards-btn awards-btn-secondary"
                onClick={() => document.getElementById('nominations')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="btn-icon">🗳️</span>
                <span className="btn-text">View & Vote</span>
              </button>
            </div>
            
            {/* Social Sharing */}
            <div className="social-sharing animated fadeInUp delay-5">
              <p className="sharing-text">Share the awards:</p>
              <div className="social-buttons">
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn facebook"
                  title="Share on Facebook"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=Check%20out%20Saphaniox%20Awards%202025!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn twitter"
                  title="Share on Twitter"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a 
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn linkedin"
                  title="Share on LinkedIn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a 
                  href={`https://wa.me/?text=Check%20out%20Saphaniox%20Awards%202025!%20${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn whatsapp"
                  title="Share on WhatsApp"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
                <a 
                  href={`https://www.tiktok.com/share?url=${encodeURIComponent(window.location.href)}&title=Check%20out%20Saphaniox%20Awards%202025!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn tiktok"
                  title="Share on TikTok"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
                <a 
                  href={`https://www.instagram.com/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn instagram"
                  title="Share on Instagram"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="hero-decoration">
            <div className="decoration-circle decoration-circle-1"></div>
            <div className="decoration-circle decoration-circle-2"></div>
            <div className="decoration-circle decoration-circle-3"></div>
          </div>
        </div>
      </section>

      {/* Award Categories */}
      <section 
        className="awards-categories"
      >
        <div className="container">
          <h2>
            🏆 Award Categories
          </h2>
          <p>
            Explore our diverse categories celebrating different aspects of technological excellence
          </p>
          
          {loading.categories ? (
            <div className="loading-skeleton">
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <h3>No Categories Available</h3>
              <p>Award categories will be announced soon. Stay tuned!</p>
            </div>
          ) : (
            <div 
              className="categories-grid"
              >
              {categories.map((category, index) => (
                <div 
                  key={category._id} 
                  className={`category-card ${selectedCategory === category._id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(selectedCategory === category._id ? "" : category._id)}
                >
                  {/* Countdown Timer - Top Right Corner */}
                  <div className="category-countdown-badge">
                    <div className="countdown-badge-content">
                      <div className="countdown-time">
                        <strong>{countdown.days}</strong>
                        <span>D</span>
                      </div>
                      <span className="countdown-separator">:</span>
                      <div className="countdown-time">
                        <strong>{countdown.hours.toString().padStart(2, '0')}</strong>
                        <span>H</span>
                      </div>
                      <span className="countdown-separator">:</span>
                      <div className="countdown-time">
                        <strong>{countdown.minutes.toString().padStart(2, '0')}</strong>
                        <span>M</span>
                      </div>
                      <span className="countdown-separator">:</span>
                      <div className="countdown-time">
                        <strong>{countdown.seconds.toString().padStart(2, '0')}</strong>
                        <span>S</span>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="category-icon"
                  >
                    {category.icon}
                  </div>
                  <h3>
                    {category.name}
                  </h3>
                  <p>
                    {category.description}
                  </p>
                  <div 
                    className="category-stats"
                  >
                    <span className="nominations-count">
                      🎯 {category.approvedNominations || 0} approved
                    </span>
                    {category.totalNominations > category.approvedNominations && (
                      <span className="nominations-pending">
                        ⏳ {(category.totalNominations || 0) - (category.approvedNominations || 0)} pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Nominations */}
      {getTopNominations().length > 0 && (
        <section className="top-nominations">
          <div className="container">
            <h2>⭐ Leading Nominations</h2>
            <div className="top-nominees-grid">
              {getTopNominations().map((nomination, index) => (
                <div key={nomination._id} className="top-nominee-card">
                  <div className="rank-badge">{index + 1}</div>
                  <div className="nominee-photo">
                    <img src={getImageUrl(nomination.nomineePhoto) || PLACEHOLDERS.avatar} alt={nomination.nomineeName} />
                  </div>
                  <div className="nominee-info">
                    <h3>{nomination.nomineeName}</h3>
                    {nomination.nomineeTitle && <p className="title">{nomination.nomineeTitle}</p>}
                    {nomination.nomineeCompany && <p className="company">{nomination.nomineeCompany}</p>}
                    <div className="category-tag">
                      {nomination.category?.icon} {nomination.category?.name}
                    </div>
                    <div className="votes-display">
                      🗳️ {nomination.votes} votes
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Nominations Section */}
      <section id="nominations" className="nominations-section">
        <div className="container">
          <div className="section-header">
            <h2>🎯 Current Nominations</h2>
            <p>Vote for your favorite nominees and help recognize excellence</p>
          </div>

          {/* Filters */}
          <div className="filters-bar">
            <div className="search-filters">
              <input
                type="text"
                placeholder="Search nominations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="votes">Most Voted</option>
                <option value="createdAt">Most Recent</option>
                <option value="nomineeName">Name (A-Z)</option>
              </select>

              {uniqueCountries.length > 1 && (
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Countries</option>
                  {uniqueCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Nominations Grid */}
          {loading.nominations ? (
            <div className="loading-skeleton">
              <div className="skeleton-nomination-card"></div>
              <div className="skeleton-nomination-card"></div>
              <div className="skeleton-nomination-card"></div>
              <div className="skeleton-nomination-card"></div>
              <div className="skeleton-nomination-card"></div>
              <div className="skeleton-nomination-card"></div>
            </div>
          ) : nominations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <h3>No Nominations Yet</h3>
              <p>Be the first to nominate someone for these prestigious awards!</p>
              <button
                className="btn-primary"
                onClick={() => setShowNominationForm(true)}
              >
                🌟 Submit First Nomination
              </button>
            </div>
          ) : (
            <>
              <div className="nominations-grid">
                {nominations.map(nomination => (
                  <NominationCard
                    key={nomination._id}
                    nomination={nomination}
                    onVote={handleVote}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn-pagination"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  >
                    ← Previous
                  </button>
                  
                  <span className="pagination-info">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  
                  <button
                    className="btn-pagination"
                    disabled={!pagination.hasNextPage}
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Nomination Form Modal */}
      {showNominationForm && (
        <NominationModal
          categories={categories}
          nominationForm={nominationForm}
          onChange={handleInputChange}
          onSubmit={handleNominationSubmit}
          onClose={() => setShowNominationForm(false)}
          loading={loading.submitting}
        />
      )}
      
      {/* Success Toast Notification */}
      {showSuccessMessage && (
        <div className="success-toast animated slideInRight">
          <div className="toast-content">
            <span className="toast-icon">✅</span>
            <span className="toast-text">{successText}</span>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <Footer 
        onPrivacyPolicyOpen={handlePrivacyPolicyOpen}
        onTermsOfServiceOpen={handleTermsOfServiceOpen}
        onNavigate={handleFooterNavigate}
      />
      
      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <PrivacyPolicy onClose={handlePrivacyPolicyClose} />
      )}
      
      {/* Terms of Service Modal */}
      {showTermsOfService && (
        <TermsOfService onClose={handleTermsOfServiceClose} />
      )}
      
      {/* Back to Top Button */}
      <BackToTop />
    </div>
  );
};

// Nomination Card Component
const NominationCard = ({ nomination, onVote }) => {
  const [voterEmail, setVoterEmail] = useState("");
  const [showVoteForm, setShowVoteForm] = useState(false);

  const handleVoteSubmit = (e) => {
    e.preventDefault();
    if (voterEmail.trim()) {
      onVote(nomination._id, voterEmail.trim());
      setVoterEmail("");
      setShowVoteForm(false);
    }
  };

  return (
    <div 
      className="nomination-card"
    >
      <div className="nominee-photo">
        <img src={getImageUrl(nomination.nomineePhoto) || PLACEHOLDERS.avatar} alt={nomination.nomineeName} />
        <div className="country-badge">{nomination.nomineeCountry}</div>
      </div>
      
      <div className="card-content">
        <div className="nominee-header">
          <h3>{nomination.nomineeName}</h3>
          {nomination.nomineeTitle && <p className="title">{nomination.nomineeTitle}</p>}
          {nomination.nomineeCompany && <p className="company">@ {nomination.nomineeCompany}</p>}
        </div>

        <div className="category-badge">
          {nomination.category?.icon} {nomination.category?.name}
        </div>

        <div className="nomination-reason">
          <p>{nomination.nominationReason.substring(0, 120)}...</p>
        </div>

        {nomination.achievements && (
          <div className="achievements">
            <strong>Key Achievements:</strong>
            <p>{nomination.achievements.substring(0, 100)}...</p>
          </div>
        )}

        <div className="card-footer">
          <div className="votes-section">
            <span className="vote-count">🗳️ {nomination.votes} votes</span>
            
            {!showVoteForm ? (
              <button
                className="vote-btn"
                onClick={() => setShowVoteForm(true)}
              >
                Vote
              </button>
            ) : (
              <form onSubmit={handleVoteSubmit} className="vote-form">
                <input
                  type="email"
                  placeholder="Your email"
                  value={voterEmail}
                  onChange={(e) => setVoterEmail(e.target.value)}
                  required
                />
                <button type="submit">Submit Vote</button>
                <button type="button" onClick={() => setShowVoteForm(false)}>Cancel</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Nomination Modal Component  
const NominationModal = ({ categories, nominationForm, onChange, onSubmit, onClose, loading }) => {
  const isSelf = nominationForm.isSelfNomination;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content nomination-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎯 Submit Nomination</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={onSubmit} className="nomination-form">
          {/* Nomination Type Selector */}
          <div className="nomination-type-selector">
            <label className={!isSelf ? 'active' : ''}>
              <input
                type="radio"
                name="nominationType"
                checked={!isSelf}
                onChange={() => onChange({ target: { name: 'isSelfNomination', value: false } })}
              />
              <span className="radio-content">
                <span className="radio-icon">🎯</span>
                <span className="radio-text">I'm nominating someone else</span>
              </span>
            </label>
            <label className={isSelf ? 'active' : ''}>
              <input
                type="radio"
                name="nominationType"
                checked={isSelf}
                onChange={() => onChange({ target: { name: 'isSelfNomination', value: true } })}
              />
              <span className="radio-content">
                <span className="radio-icon">⭐</span>
                <span className="radio-text">I'm nominating myself</span>
              </span>
            </label>
          </div>

          {/* Nominee Information */}
          <div className="form-section">
            <h3>👤 {isSelf ? 'Your Information' : 'Nominee Information'}</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>{isSelf ? 'Your Full Name *' : 'Full Name *'}</label>
                <input
                  type="text"
                  name="nomineeName"
                  value={nominationForm.nomineeName}
                  onChange={onChange}
                  required
                  placeholder={isSelf ? "Enter your full name" : "Enter nominee's full name"}
                />
              </div>
              
              <div className="form-group">
                <label>{isSelf ? 'Your Professional Title' : 'Professional Title'}</label>
                <input
                  type="text"
                  name="nomineeTitle"
                  value={nominationForm.nomineeTitle}
                  onChange={onChange}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{isSelf ? 'Your Company/Organization' : 'Company/Organization'}</label>
                <input
                  type="text"
                  name="nomineeCompany"
                  value={nominationForm.nomineeCompany}
                  onChange={onChange}
                  placeholder="Company or organization name"
                />
              </div>
              
              <div className="form-group">
                <label>Country</label>
                <select
                  name="nomineeCountry"
                  value={nominationForm.nomineeCountry}
                  onChange={onChange}
                >
                  <option value="Uganda">Uganda</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Rwanda">Rwanda</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Ghana">Ghana</option>
                  <option value="South Africa">South Africa</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>{isSelf ? 'Your Photo *' : 'Photo *'}</label>
              <input
                type="file"
                name="nomineePhoto"
                onChange={onChange}
                accept="image/*"
                required
              />
              <small>Upload a professional photo {isSelf ? 'of yourself' : 'of the nominee'} (max 5MB)</small>
            </div>
          </div>

          {/* Award Category */}
          <div className="form-section">
            <h3>🏆 Award Category</h3>
            <div className="category-selection">
              {categories.map(category => (
                <label key={category._id} className="category-option">
                  <input
                    type="radio"
                    name="category"
                    value={category._id}
                    checked={nominationForm.category === category._id}
                    onChange={onChange}
                    required
                  />
                  <div className="category-card-small">
                    <span className="icon">{category.icon}</span>
                    <span className="name">{category.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Nomination Details */}
          <div className="form-section">
            <h3>📝 {isSelf ? 'Why You Deserve This Award' : 'Nomination Details'}</h3>
            
            <div className="form-group">
              <label>{isSelf ? 'Why do you deserve this award? *' : 'Why should this person win? *'}</label>
              <textarea
                name="nominationReason"
                value={nominationForm.nominationReason}
                onChange={onChange}
                required
                rows={4}
                placeholder={isSelf 
                  ? "Explain why you deserve to win this award (minimum 50 characters)" 
                  : "Explain why this person deserves to win this award (minimum 50 characters)"}
                minLength={50}
              />
              <small>{nominationForm.nominationReason.length}/1000 characters</small>
            </div>

            <div className="form-group">
              <label>{isSelf ? 'Your Key Achievements' : 'Key Achievements'}</label>
              <textarea
                name="achievements"
                value={nominationForm.achievements}
                onChange={onChange}
                rows={3}
                placeholder={isSelf 
                  ? "List your key achievements and accomplishments" 
                  : "List the nominee's key achievements and accomplishments"}
              />
            </div>

            <div className="form-group">
              <label>{isSelf ? 'Your Impact on the Industry' : 'Impact Description'}</label>
              <textarea
                name="impactDescription"
                value={nominationForm.impactDescription}
                onChange={onChange}
                rows={3}
                placeholder={isSelf 
                  ? "Describe the impact of your work on the community or industry" 
                  : "Describe the impact of their work on the community or industry"}
              />
            </div>
          </div>

          {/* Nominator Information - Only show for non-self nominations */}
          {!isSelf && (
            <div className="form-section">
              <h3>👨‍💼 Your Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Your Full Name *</label>
                  <input
                    type="text"
                    name="nominatorName"
                    value={nominationForm.nominatorName}
                    onChange={onChange}
                    required={!isSelf}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Your Email *</label>
                  <input
                    type="email"
                    name="nominatorEmail"
                    value={nominationForm.nominatorEmail}
                    onChange={onChange}
                    required={!isSelf}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="nominatorPhone"
                    value={nominationForm.nominatorPhone}
                    onChange={onChange}
                    placeholder="+256 xxx xxx xxx"
                  />
                </div>
                
                <div className="form-group">
                  <label>Your Organization</label>
                  <input
                    type="text"
                    name="nominatorOrganization"
                    value={nominationForm.nominatorOrganization}
                    onChange={onChange}
                    placeholder="Your company or organization"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Information - Only show for self nominations */}
          {isSelf && (
            <div className="form-section">
              <h3>📧 Your Contact Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Your Email *</label>
                  <input
                    type="email"
                    name="nominatorEmail"
                    value={nominationForm.nominatorEmail}
                    onChange={onChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="nominatorPhone"
                    value={nominationForm.nominatorPhone}
                    onChange={onChange}
                    placeholder="+256 xxx xxx xxx"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit Nomination"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Awards;