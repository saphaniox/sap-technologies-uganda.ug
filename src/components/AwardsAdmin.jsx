import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import apiService from "../services/api";
import { showAlert } from "../utils/alerts";
import { getImageUrl, PLACEHOLDERS } from "../utils/imageUrl";
import Swal from "sweetalert2";
import { Icon } from "./IconLibrary";
import "../styles/AwardsAdmin.css";
import "../styles/IconLibrary.css";

const AwardsAdmin = () => {
  console.log("🏆 AwardsAdmin component is rendering!");
  
  const [activeSubTab, setActiveSubTab] = useState("nominations");
  const [nominations, setNominations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState({
    nominations: false,
    categories: false,
    updating: false,
    deleting: false,
    stats: false
  });
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 10
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNomination, setEditingNomination] = useState(null);
  const [statusSummary, setStatusSummary] = useState({});
  const [showPhotoEditModal, setShowPhotoEditModal] = useState(false);
  const [editingPhotoNomination, setEditingPhotoNomination] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadCategories();
    loadNominations();
    loadAwardsStats();
  }, []);

  // Reload nominations when filters change
  useEffect(() => {
    loadNominations();
  }, [filters]);

  // Reload data when active tab changes
  useEffect(() => {
    if (activeSubTab === "categories") {
      loadCategories();
    } else if (activeSubTab === "nominations") {
      loadNominations();
    } else if (activeSubTab === "stats") {
      loadAwardsStats();
    }
  }, [activeSubTab]);

  const loadCategories = async () => {
    try {
      console.log("🏆 Loading award categories...");
      const response = await apiService.getAwardsCategories();
      console.log("✅ Categories response:", response);
      
      // Backend returns: { status: "success", data: { categories: [...] } }
      const categoriesData = response.data?.categories || [];
      setCategories(categoriesData);
      console.log("📝 Categories loaded:", categoriesData.length, "categories");
    } catch (error) {
      console.error("❌ Error loading categories:", error);
      setCategories([]);
    }
  };

  const loadNominations = async () => {
    setLoading(prev => ({ ...prev, nominations: true }));
    try {
      const response = await apiService.getAdminNominations(filters);
      setNominations(response.data.nominations);
      setPagination(response.data.pagination);
      setStatusSummary(response.data.statusSummary || {});
    } catch (error) {
      console.error("Error loading nominations:", error);
      showAlert.error("Error", "Failed to load nominations");
    } finally {
      setLoading(prev => ({ ...prev, nominations: false }));
    }
  };

  const loadAwardsStats = async () => {
    console.log("📊 Loading awards statistics...");
    setLoading(prev => ({ ...prev, stats: true }));
    try {
      const response = await apiService.getAwardsStats();
      console.log("✅ Stats response:", response);
      
      // Backend returns: { status: "success", data: { generalStats, categoryStats, topNominations } }
      const statsData = response.data || {};
      console.log("📝 Stats data:", statsData);
      
      // Ensure we have default values
      setStats({
        generalStats: statsData.generalStats || {
          totalNominations: 0,
          approvedNominations: 0,
          pendingNominations: 0,
          totalVotes: 0,
          ugandanNominees: 0,
          internationalNominees: 0
        },
        categoryStats: Array.isArray(statsData.categoryStats) ? statsData.categoryStats : [],
        topNominations: Array.isArray(statsData.topNominations) ? statsData.topNominations : []
      });
    } catch (error) {
      console.error("❌ Error loading stats:", error);
      console.error("❌ Error details:", error.response?.data || error.message);
      
      // Set empty stats to prevent undefined errors
      setStats({
        generalStats: {
          totalNominations: 0,
          approvedNominations: 0,
          pendingNominations: 0,
          totalVotes: 0,
          ugandanNominees: 0,
          internationalNominees: 0
        },
        categoryStats: [],
        topNominations: []
      });
      
      // Show error to user
      await Swal.fire({
        title: '❌ Failed to Load Statistics',
        text: error.response?.data?.message || error.message || "Unable to fetch awards statistics",
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  const handleUpdateStatus = async (nominationId, status, adminNotes = "") => {
    console.log("📝 Updating nomination status:", nominationId, "to", status);
    
    setLoading(prev => ({ ...prev, updating: true }));
    try {
      const response = await apiService.updateNominationStatus(nominationId, status, adminNotes);
      console.log("✅ Status updated successfully:", response);
      
      // Show success message
      await Swal.fire({
        title: '✅ Status Updated!',
        text: `Nomination ${status} successfully`,
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true
      });
      
      await loadNominations(); // Reload the list
      await loadAwardsStats(); // Update stats
    } catch (error) {
      console.error("❌ Error updating status:", error);
      console.error("Error details:", error.response?.data);
      
      await Swal.fire({
        title: '❌ Update Failed',
        text: error.response?.data?.message || error.message || "Failed to update nomination status",
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  };

  const handleGenerateCertificate = async (nominationId, nomineeName, status) => {
    console.log("📜 Generating certificate for:", nominationId, nomineeName, status);
    
    // Check if eligible for certificate
    if (!['winner', 'finalist', 'approved'].includes(status)) {
      await Swal.fire({
        title: 'Not Eligible',
        html: `Certificates can only be generated for <strong>Winners</strong>, <strong>Finalists</strong>, or <strong>Approved</strong> nominations.<br><br>Current status: <strong>${status}</strong>`,
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    setLoading(prev => ({ ...prev, updating: true }));
    try {
      const response = await apiService.request(`/api/certificates/generate/${nominationId}`, {
        method: 'POST'
      });
      
      if (response) {
        await Swal.fire({
          title: 'Certificate Generated!',
          html: `
            <p>Certificate for <strong>${nomineeName}</strong> has been generated successfully.</p>
            <p><strong>Certificate ID:</strong> ${response.certificateId}</p>
            <p><strong>Storage:</strong> ${response.storage === 'cloudinary' ? 'Cloudinary (CDN)' : 'Local Server'}</p>
            ${response.cloudinaryUrl ? `<p class="certificate-path"><small>CDN URL: <code>${response.cloudinaryUrl}</code></small></p>` : ''}
          `,
          icon: 'success',
          confirmButtonText: 'Download Certificate',
          showCancelButton: true,
          cancelButtonText: 'Close',
          confirmButtonColor: '#10b981',
          cancelButtonColor: '#6b7280'
        }).then((result) => {
          if (result.isConfirmed) {
            // Download the certificate - check if downloadUrl is already a full URL
            const downloadUrl = response.downloadUrl.startsWith('http') 
              ? response.downloadUrl 
              : `${apiService.baseURL}${response.downloadUrl}`;
            window.open(downloadUrl, '_blank');
          }
        });
        
        // Reload nominations to show certificate status
        loadNominations();
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      await Swal.fire({
        title: 'Generation Failed',
        text: error.message || 'Failed to generate certificate',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  };

  const handleDeleteNomination = async (nominationId, nomineeName) => {
    console.log("🗑️ Attempting to delete nomination:", nominationId, nomineeName);
    
    try {
      // Close any existing Swal dialogs first
      if (Swal.isVisible()) {
        console.log("⚠️ Closing existing Swal dialog");
        Swal.close();
      }
      
      // Small delay to ensure any previous dialog is closed
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const result = await Swal.fire({
        title: 'Delete Nomination?',
        html: `Are you sure you want to delete the nomination for <strong>"${nomineeName}"</strong>?<br><br>This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        reverseButtons: true,
        focusCancel: true,
        allowOutsideClick: false,
        allowEscapeKey: true,
        backdrop: true,
        heightAuto: false
      });
      
      console.log("Delete confirmation result:", result);
      
      if (!result.isConfirmed) {
        console.log("❌ Delete cancelled by user");
        return;
      }
      
      console.log("✅ User confirmed deletion - proceeding...");
    } catch (swalError) {
      console.error("❌ Error showing Swal dialog:", swalError);
      return;
    }

    setLoading(prev => ({ ...prev, deleting: true }));
    try {
      const response = await apiService.deleteNomination(nominationId);
      console.log("✅ Nomination deleted successfully:", response);
      
      // Instantly remove from UI
      setNominations(prev => prev.filter(nom => nom._id !== nominationId));
      
      await Swal.fire({
        title: '🗑️ Deleted!',
        text: `Nomination for "${nomineeName}" has been deleted successfully.`,
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true
      });
      
  // Clear API cache and reload in background to ensure data consistency
  try { apiService.clearCache(); } catch (e) { /* ignore */ }
  await loadNominations();
  await loadAwardsStats();
    } catch (error) {
      console.error("❌ Error deleting nomination:", error);
      console.error("Error details:", error.response?.data);
      
      await Swal.fire({
        title: '❌ Delete Failed',
        text: error.response?.data?.message || error.message || "Failed to delete nomination",
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  };

  // Handle edit nomination photo
  const handleEditNominationPhoto = (nomination) => {
    setEditingPhotoNomination(nomination);
    setShowPhotoEditModal(true);
    setNewPhoto(null);
    setPhotoPreview(nomination.nomineePhoto ? getImageUrl(nomination.nomineePhoto) : null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async () => {
    if (!editingPhotoNomination) return;

    try {
      setLoading(prev => ({ ...prev, updating: true }));

      const formData = new FormData();
      
      // Add all existing nomination data
      formData.append("nomineeName", editingPhotoNomination.nomineeName);
      formData.append("nomineeTitle", editingPhotoNomination.nomineeTitle || "");
      formData.append("nomineeCompany", editingPhotoNomination.nomineeCompany || "");
      formData.append("nomineeCountry", editingPhotoNomination.nomineeCountry);
      formData.append("category", editingPhotoNomination.category._id);
      formData.append("nominationReason", editingPhotoNomination.nominationReason);
      formData.append("achievements", editingPhotoNomination.achievements || "");
      formData.append("impactDescription", editingPhotoNomination.impactDescription || "");
      formData.append("nominatorName", editingPhotoNomination.nominatorName);
      formData.append("nominatorEmail", editingPhotoNomination.nominatorEmail);
      formData.append("nominatorPhone", editingPhotoNomination.nominatorPhone || "");
      formData.append("nominatorOrganization", editingPhotoNomination.nominatorOrganization || "");
      
      // Add new photo if selected
      if (newPhoto) {
        formData.append("nomineePhoto", newPhoto);
      }

      const response = await apiService.updateNomination(editingPhotoNomination._id, formData);
      
      await Swal.fire({
        title: '✅ Photo Updated!',
        text: `Nominee photo has been updated successfully`,
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true
      });

      setShowPhotoEditModal(false);
      setEditingPhotoNomination(null);
      setNewPhoto(null);
      setPhotoPreview(null);
      await loadNominations(); // Reload the list
    } catch (error) {
      console.error("❌ Error updating photo:", error);
      
      await Swal.fire({
        title: '❌ Update Failed',
        text: error.response?.data?.message || error.message || "Failed to update photo",
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  };

  // Category Management Functions
  const handleCreateCategory = async (categoryData) => {
    try {
      console.log("🔥 Creating category with data:", categoryData);
      setLoading(prev => ({ ...prev, categories: true }));
      
      const response = await apiService.createAwardsCategory(categoryData);
      console.log("✅ Category created successfully:", response);
      
      await showAlert.success(
        "🎉 Category Created!",
        `Category "${categoryData.name}" has been created successfully.`,
        { timer: 3000, showConfirmButton: false }
      );
      
      setShowCategoryForm(false);
      setEditingCategory(null);
      loadCategories(); // Reload categories
    } catch (error) {
      console.error("❌ Error creating category:", error);
      console.error("Error details:", error.response?.data || error.message);
      
      await showAlert.error(
        "❌ Creation Failed",
        error.response?.data?.message || error.message || "Failed to create category. Please try again.",
        { timer: 5000, showConfirmButton: true }
      );
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const handleEditCategory = (category) => {
    console.log("🖊️ Editing category:", category);
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleUpdateCategory = async (categoryId, categoryData) => {
    try {
      console.log("📝 Updating category ID:", categoryId, "with data:", categoryData);
      setLoading(prev => ({ ...prev, categories: true }));
      
      const response = await apiService.updateAwardsCategory(categoryId, categoryData);
      console.log("✅ Category updated successfully:", response);
      
      await showAlert.success(
        "✅ Category Updated!",
        `Category "${categoryData.name}" has been updated successfully.`,
        { timer: 3000, showConfirmButton: false }
      );
      
      setShowCategoryForm(false);
      setEditingCategory(null);
      await loadCategories(); // Reload categories
    } catch (error) {
      console.error("❌ Error updating category:", error);
      console.error("Error response:", error.response);
      
      await showAlert.error(
        "❌ Update Failed",
        error.response?.data?.message || error.message || "Failed to update category. Please try again.",
        { timer: 5000, showConfirmButton: true }
      );
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    console.log("🗑️ Attempting to delete category:", categoryId, categoryName);
    console.log("🔍 Swal object:", Swal);
    console.log("🔍 Swal.fire:", typeof Swal.fire);
    
    try {
      // Use Swal directly to avoid any config conflicts
      console.log("⏳ About to show Swal dialog...");
      
      // Close any existing Swal dialogs first
      if (Swal.isVisible()) {
        console.log("⚠️ Closing existing Swal dialog");
        Swal.close();
      }
      
      // Small delay to ensure any previous dialog is closed
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const result = await Swal.fire({
        title: 'Delete Category?',
        html: `Are you sure you want to delete <strong>"${categoryName}"</strong>?<br><br>This action cannot be undone and may affect existing nominations.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        reverseButtons: true,
        focusCancel: true,
        allowOutsideClick: false,
        allowEscapeKey: true,
        backdrop: true,
        heightAuto: false,
        customClass: {
          container: 'swal-container-awards',
          popup: 'swal-popup-awards'
        }
      });
      
      console.log("✅ Swal dialog returned");
      console.log("📋 Full result object:", JSON.stringify(result, null, 2));
      console.log("🔍 Result keys:", Object.keys(result));
      console.log("Is confirmed:", result.isConfirmed);
      console.log("Is dismissed:", result.isDismissed);
      console.log("Is denied:", result.isDenied);
      console.log("Dismiss reason:", result.dismiss);
      console.log("Value:", result.value);
      
      if (!result.isConfirmed) {
        console.log("❌ Delete cancelled by user");
        return;
      }
      
      console.log("✅ User confirmed deletion - proceeding...");
    } catch (swalError) {
      console.error("❌ Error showing Swal dialog:", swalError);
      return;
    }

    try {
      console.log("🔥 Proceeding with delete for category ID:", categoryId);
      setLoading(prev => ({ ...prev, deleting: true }));
      
      const response = await apiService.deleteAwardsCategory(categoryId);
      console.log("✅ Category deleted successfully:", response);
      
      // Instantly remove from UI
      setCategories(prev => prev.filter(cat => cat._id !== categoryId));
      
      // Show success message
      await Swal.fire({
        title: '🗑️ Deleted!',
        text: `Category "${categoryName}" has been deleted successfully.`,
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true
      });
      
      // Reload in background to ensure data consistency
      await loadCategories();
      await loadNominations();
    } catch (error) {
      console.error("❌ Error deleting category:", error);
      console.error("Error details:", error.response?.data);
      
      // Show error message
      await Swal.fire({
        title: '❌ Delete Failed',
        text: error.response?.data?.message || error.message || "Failed to delete category. It may have nominations assigned to it.",
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1 // Reset to page 1 when other filters change
    }));
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending": return "status-pending";
      case "approved": return "status-approved";
      case "rejected": return "status-rejected";
      case "winner": return "status-winner";
      case "finalist": return "status-finalist";
      default: return "status-unknown";
    }
  };

  const renderStatsOverview = () => {
    console.log("📊 Rendering stats with data:", stats);
    const generalStats = stats?.generalStats || {};
    
    return (
      <div className="awards-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper total">
            <Icon name="chart" size={24} />
          </div>
          <div className="stat-info">
            <h3>{generalStats.totalNominations || 0}</h3>
            <p>Total Nominations</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper approved">
            <Icon name="check" size={24} />
          </div>
          <div className="stat-info">
            <h3>{generalStats.approvedNominations || 0}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper pending">
            <Icon name="clock" size={24} />
          </div>
          <div className="stat-info">
            <h3>{generalStats.pendingNominations || 0}</h3>
            <p>Pending Review</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper votes">
            <Icon name="ballot" size={24} />
          </div>
          <div className="stat-info">
            <h3>{generalStats.totalVotes || 0}</h3>
            <p>Total Votes</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper regional">
            <Icon name="flag" size={24} />
          </div>
          <div className="stat-info">
            <h3>{generalStats.ugandanNominees || 0}</h3>
            <p>Ugandan Nominees</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper global">
            <Icon name="globe" size={24} />
          </div>
          <div className="stat-info">
            <h3>{generalStats.internationalNominees || 0}</h3>
            <p>International</p>
          </div>
        </div>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="awards-filters">
      <div className="filter-row">
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="winner">Winner</option>
            <option value="finalist">Finalist</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Category:</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Sort By:</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
          >
            <option value="createdAt">Date Created</option>
            <option value="nomineeName">Nominee Name</option>
            <option value="votes">Votes</option>
            <option value="status">Status</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Order:</label>
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>
      <div className="search-row">
        <input
          type="text"
          placeholder="Search by nominee name, company, or nomination reason..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="search-input"
        />
        <button 
          className="create-btn"
          onClick={() => setShowCreateForm(true)}
        >
          ➕ Create Nomination
        </button>
      </div>
    </div>
  );

  const renderNominationCard = (nomination) => (
    <motion.div
      key={nomination._id}
      className="nomination-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <div className="nomination-header">
        <div className="nominee-info">
          <div style={{ position: 'relative', width: 80, height: 80 }}>
            {nomination.nomineePhoto && (
              <img 
                src={getImageUrl(nomination.nomineePhoto)}
                alt={nomination.nomineeName}
                className="nominee-photo"
                onError={(e) => {
                  e.target.src = PLACEHOLDERS.avatar;
                }}
              />
            )}
            {/* Country badge overlay */}
            <div className="country-badge-admin">
              {nomination.nomineeCountry}
            </div>
          </div>
          <div>
            <h3>{nomination.nomineeName}</h3>
            {nomination.nomineeTitle && (
              <p className="nominee-title">{nomination.nomineeTitle}</p>
            )}
            {nomination.nomineeCompany && (
              <p className="nominee-company">{nomination.nomineeCompany}</p>
            )}
          </div>
        </div>
        <div className="nomination-meta">
          <span className={`status-badge ${getStatusBadgeClass(nomination.status)}`}>
            {nomination.status.toUpperCase()}
          </span>
          <span className="vote-count">🗳️ {nomination.votes} votes</span>
          <span className="category-name">
            {nomination.category?.icon} {nomination.category?.name}
          </span>
        </div>
      </div>

      <div className="nomination-body">
        <div className="nomination-reason">
          <h4>Nomination Reason:</h4>
          <p>{nomination.nominationReason}</p>
        </div>
        
        {nomination.achievements && (
          <div className="achievements">
            <h4>Achievements:</h4>
            <p>{nomination.achievements}</p>
          </div>
        )}

        {nomination.impactDescription && (
          <div className="impact">
            <h4>Impact:</h4>
            <p>{nomination.impactDescription}</p>
          </div>
        )}

        <div className="nominator-info">
          <h4>Nominated By:</h4>
          <p>
            {nomination.nominatorName} ({nomination.nominatorEmail})
            {nomination.nominatorOrganization && ` - ${nomination.nominatorOrganization}`}
          </p>
        </div>

        {nomination.adminNotes && (
          <div className="admin-notes">
            <h4>Admin Notes:</h4>
            <p>{nomination.adminNotes}</p>
          </div>
        )}

        <div className="nomination-dates">
          <p>Created: {new Date(nomination.createdAt).toLocaleDateString()}</p>
          {nomination.reviewedAt && (
            <p>Reviewed: {new Date(nomination.reviewedAt).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      <div className="nomination-actions">
        {nomination.status === "pending" && (
          <>
            <button
              className="action-btn approve-btn"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("✅ Approve clicked for:", nomination.nomineeName);
                await new Promise(resolve => setTimeout(resolve, 100));
                await handleUpdateStatus(nomination._id, "approved");
              }}
              disabled={loading.updating}
            >
              ✅ Approve
            </button>
            <button
              className="action-btn reject-btn"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("❌ Reject clicked for:", nomination.nomineeName);
                
                // Use Swal for admin notes input
                const { value: adminNotes } = await Swal.fire({
                  title: 'Reject Nomination',
                  input: 'textarea',
                  inputLabel: 'Reason for rejection (optional)',
                  inputPlaceholder: 'Enter rejection reason...',
                  showCancelButton: true,
                  confirmButtonText: 'Reject',
                  cancelButtonText: 'Cancel',
                  confirmButtonColor: '#ef4444',
                  inputValidator: (value) => {
                    // Optional, so no validation needed
                    return null;
                  }
                });
                
                if (adminNotes !== undefined) {
                  await handleUpdateStatus(nomination._id, "rejected", adminNotes || "");
                }
              }}
              disabled={loading.updating}
            >
              ❌ Reject
            </button>
          </>
        )}
        
        {nomination.status === "approved" && (
          <>
            <button
              className="action-btn winner-btn"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("🏆 Mark as Winner clicked for:", nomination.nomineeName);
                await new Promise(resolve => setTimeout(resolve, 100));
                await handleUpdateStatus(nomination._id, "winner");
              }}
              disabled={loading.updating}
            >
              🏆 Mark as Winner
            </button>
            <button
              className="action-btn finalist-btn"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("🥈 Mark as Finalist clicked for:", nomination.nomineeName);
                await new Promise(resolve => setTimeout(resolve, 100));
                await handleUpdateStatus(nomination._id, "finalist");
              }}
              disabled={loading.updating}
            >
              🥈 Mark as Finalist
            </button>
          </>
        )}

        {nomination.status !== "pending" && (
          <button
            className="action-btn reset-btn"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("🔄 Reset to Pending clicked for:", nomination.nomineeName);
              await new Promise(resolve => setTimeout(resolve, 100));
              await handleUpdateStatus(nomination._id, "pending");
            }}
            disabled={loading.updating}
          >
            🔄 Reset to Pending
          </button>
        )}

        <button
          className="action-btn edit-btn"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("✏️ Edit Photo clicked for:", nomination.nomineeName);
            await new Promise(resolve => setTimeout(resolve, 100));
            handleEditNominationPhoto(nomination);
          }}
          disabled={loading.updating}
        >
          📸 Edit Photo
        </button>

        {['winner', 'finalist', 'approved'].includes(nomination.status) && (
          <button
            className="action-btn certificate-btn"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("📜 Generate Certificate clicked for:", nomination.nomineeName);
              await new Promise(resolve => setTimeout(resolve, 100));
              await handleGenerateCertificate(nomination._id, nomination.nomineeName, nomination.status);
            }}
            disabled={loading.updating}
            title={nomination.certificateFile ? "Certificate already generated - Click to regenerate" : "Generate certificate"}
          >
            {nomination.certificateFile ? '📜 Regenerate' : '📜 Generate'} Certificate
          </button>
        )}

        {nomination.certificateFile && (
          <button
            className="action-btn download-btn"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("⬇️ Download Certificate clicked for:", nomination.nomineeName);
              // Extract just the filename from the path (handles both relative and absolute paths)
              const filename = nomination.certificateFile.split(/[/\\]/).pop();
              window.open(`${apiService.baseURL}/api/certificates/download/${filename}`, '_blank');
            }}
            title="Download existing certificate"
          >
            ⬇️ Download
          </button>
        )}

        <button
          className="action-btn delete-btn"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("🗑️ Delete clicked for:", nomination.nomineeName);
            await new Promise(resolve => setTimeout(resolve, 100));
            await handleDeleteNomination(nomination._id, nomination.nomineeName);
          }}
          disabled={loading.deleting}
        >
          {loading.deleting ? '⏳' : '🗑️'} Delete
        </button>
      </div>
    </motion.div>
  );

  const renderPagination = () => (
    <div className="pagination">
      <button
        disabled={filters.page <= 1}
        onClick={() => handleFilterChange("page", filters.page - 1)}
      >
        Previous
      </button>
      <span>
        Page {filters.page} of {pagination.totalPages} 
        ({pagination.totalItems} total)
      </span>
      <button
        disabled={filters.page >= pagination.totalPages}
        onClick={() => handleFilterChange("page", filters.page + 1)}
      >
        Next
      </button>
    </div>
  );

  return (
    <div className="awards-admin">
      <div className="admin-section-header">
        <h2>🏆 Awards Management</h2>
        <div className="sub-tabs">
          <button
            className={`sub-tab ${activeSubTab === "nominations" ? "active" : ""}`}
            onClick={() => setActiveSubTab("nominations")}
          >
            📝 Nominations
          </button>
          <button
            className={`sub-tab ${activeSubTab === "categories" ? "active" : ""}`}
            onClick={() => setActiveSubTab("categories")}
          >
            🏷️ Categories
          </button>
          <button
            className={`sub-tab ${activeSubTab === "stats" ? "active" : ""}`}
            onClick={() => setActiveSubTab("stats")}
          >
            📊 Statistics
          </button>
        </div>
      </div>

      {activeSubTab === "nominations" && (
        <div className="nominations-section">
          {renderFilters()}
          
          {loading.nominations ? (
            <div className="loading-state">Loading nominations...</div>
          ) : (
            <>
              {nominations.length === 0 ? (
                <div className="empty-state">
                  <p>No nominations found with current filters</p>
                </div>
              ) : (
                <div className="nominations-list">
                  {nominations.map(renderNominationCard)}
                </div>
              )}
              {pagination.totalPages > 1 && renderPagination()}
            </>
          )}
        </div>
      )}

      {activeSubTab === "stats" && (
        <div className="stats-section">
          {loading.stats ? (
            <div className="loading-state">Loading statistics...</div>
          ) : stats ? (
            renderStatsOverview()
          ) : (
            <div className="empty-state">
              <p>Failed to load statistics</p>
            </div>
          )}
        </div>
      )}

      {activeSubTab === "categories" && (
        <div className="categories-section">
          <div className="section-header">
            <h3>🏷️ Award Categories Management</h3>
            <button 
              className="create-btn"
              onClick={() => {
                setEditingCategory(null);
                setShowCategoryForm(true);
              }}
            >
              ➕ Create New Category
            </button>
          </div>

          {loading.categories ? (
            <div className="loading-state">Loading categories...</div>
          ) : (
            <div className="categories-grid">
              {categories.map((category) => (
                <motion.div 
                  key={category._id} 
                  className="category-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="category-header">
                    <div className="category-icon">{category.icon || '🏆'}</div>
                    <div className="category-info">
                      <h4>{category.name}</h4>
                      <p className="category-description">{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="category-stats">
                    <span className="nomination-count">
                      📝 {category.totalNominations || category.nominationCount || 0} nominations
                    </span>
                    <span className="approved-count">
                      ✅ {category.approvedNominations || category.approvedCount || 0} approved
                    </span>
                  </div>

                  <div className="category-actions">
                    <button
                      className="edit-btn action-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("✏️ Edit clicked for category:", category.name);
                        handleEditCategory(category);
                      }}
                      title="Edit Category"
                      disabled={loading.categories || loading.deleting}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="delete-btn action-btn"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("🗑️ Delete clicked for category:", category.name);
                        
                        // Add small delay to ensure click event completes
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                        await handleDeleteCategory(category._id, category.name);
                      }}
                      title="Delete Category"
                      disabled={loading.categories || loading.deleting}
                    >
                      {loading.deleting ? '⏳' : '🗑️'} Delete
                    </button>
                  </div>

                  <div className="category-status">
                    <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                      {category.isActive ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </div>
                </motion.div>
              ))}
              
              {categories.length === 0 && (
                <div className="empty-state">
                  <p>🏷️ No award categories found</p>
                  <p>Create your first category to start organizing awards!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="modal-overlay" onClick={() => setShowCategoryForm(false)}>
          <div className="modal-content category-form" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategory ? '✏️ Edit Category' : '➕ Create New Category'}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowCategoryForm(false);
                  setEditingCategory(null);
                }}
              >
                ❌
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const categoryData = {
                  name: formData.get('name'),
                  description: formData.get('description'),
                  icon: formData.get('icon') || '🏆',
                  isActive: formData.get('isActive') === 'on' // Convert checkbox to boolean
                };

                console.log("📝 Form data being submitted:", categoryData);

                if (editingCategory) {
                  handleUpdateCategory(editingCategory._id, categoryData);
                } else {
                  handleCreateCategory(categoryData);
                }
              }}
            >
              <div className="form-group">
                <label>Category Name:</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingCategory?.name || ''}
                  placeholder="e.g., Innovation Excellence"
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  required
                  rows="3"
                  defaultValue={editingCategory?.description || ''}
                  placeholder="Describe what this award category recognizes..."
                />
              </div>

              <div className="form-group">
                <label>Icon (Emoji):</label>
                <input
                  type="text"
                  name="icon"
                  required
                  defaultValue={editingCategory?.icon || '🏆'}
                  placeholder="🏆"
                  maxLength="2"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={editingCategory?.isActive !== false}
                  />
                  Active (visible to users)
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading.categories}>
                  {loading.categories ? '⏳ Saving...' : (editingCategory ? '💾 Update' : '➕ Create')}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowCategoryForm(false);
                    setEditingCategory(null);
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Nomination Form Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content nomination-form" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Create New Nomination</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(prev => ({ ...prev, nominations: true }));
                
                try {
                  const formData = new FormData(e.target);
                  
                  // Auto-fill nominator info with admin defaults
                  formData.append('nominatorName', 'SAP Technologies Admin');
                  formData.append('nominatorEmail', 'admin@saptechnologies.com');
                  formData.append('nominatorOrganization', 'SAP Technologies');
                  
                  const response = await apiService.createAdminNomination(formData);
                  
                  if (response.status === "success") {
                    await showAlert.success(
                      "🎉 Nomination Created!",
                      "The nomination has been successfully created."
                    );
                    setShowCreateForm(false);
                    loadNominations(); // Reload nominations list
                    e.target.reset(); // Clear form
                  }
                } catch (error) {
                  console.error("Error creating nomination:", error);
                  await showAlert.error(
                    "❌ Creation Failed",
                    error.message || "Failed to create nomination. Please try again."
                  );
                } finally {
                  setLoading(prev => ({ ...prev, nominations: false }));
                }
              }}
              className="nomination-form-content"
            >
              {/* Nominee Information - Simplified */}
              <div className="form-section">
                <h4>👤 Nominee Details</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Nominee Name *</label>
                    <input 
                      type="text" 
                      name="nomineeName" 
                      required
                      placeholder="Full name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Title/Position (Optional)</label>
                    <input 
                      type="text" 
                      name="nomineeTitle" 
                      placeholder="Job title"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Company (Optional)</label>
                    <input 
                      type="text" 
                      name="nomineeCompany" 
                      placeholder="Company name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Category *</label>
                    <select name="category" required>
                      <option value="">Select category...</option>
                      {categories && categories.length > 0 ? (
                        categories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.icon} {category.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>No categories available</option>
                      )}
                    </select>
                    {(!categories || categories.length === 0) && (
                      <small style={{ color: '#f59e0b', fontSize: '12px' }}>
                        ⚠️ {categories ? `No categories found (${categories.length})` : 'Loading categories...'}
                      </small>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Photo *</label>
                  <input 
                    type="file" 
                    name="nomineePhoto" 
                    required
                    accept="image/*"
                  />
                </div>
                
                <div className="form-group">
                  <label>Reason for Nomination</label>
                  <textarea 
                    name="nominationReason" 
                    rows="3"
                    placeholder="Brief reason why they deserve this award..."
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading.nominations}>
                  {loading.nominations ? '⏳ Creating...' : '➕ Create Nomination'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowCreateForm(false)}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Edit Modal */}
      {showPhotoEditModal && editingPhotoNomination && (
        <div className="modal-overlay" onClick={() => setShowPhotoEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📸 Edit Nominee Photo</h3>
              <button 
                className="close-modal-btn" 
                onClick={() => setShowPhotoEditModal(false)}
              >
                ✖
              </button>
            </div>
            
            <div className="photo-edit-content">
              <div className="nominee-info-summary">
                <h4>{editingPhotoNomination.nomineeName}</h4>
                <p>{editingPhotoNomination.nomineeTitle}</p>
                <p>{editingPhotoNomination.nomineeCompany}</p>
              </div>

              <div className="photo-preview-section">
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="photo-preview-large"
                    onError={(e) => {
                      e.target.src = PLACEHOLDERS.avatar;
                    }}
                  />
                ) : (
                  <div className="no-photo-placeholder">
                    <p>👤 No photo available</p>
                  </div>
                )}
              </div>

              <div className="photo-upload-section">
                <label className="upload-label">
                  📁 Choose New Photo
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                </label>
                {newPhoto && (
                  <p className="file-selected">✅ Selected: {newPhoto.name}</p>
                )}
              </div>

              <div className="modal-actions">
                <button 
                  className="save-btn"
                  onClick={handleSavePhoto}
                  disabled={loading.updating || !newPhoto}
                >
                  {loading.updating ? '⏳ Saving...' : '💾 Save Photo'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setShowPhotoEditModal(false)}
                  disabled={loading.updating}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AwardsAdmin;