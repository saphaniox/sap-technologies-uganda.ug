import React, { useState, useEffect } from "react";
import apiService from "../services/api";
import SoftwareForm from "./SoftwareForm";
import ConfirmDialog from "./ConfirmDialog";
import ImageSlider from "./ImageSlider";
import { LoadingOverlay, showAlert } from "../utils/alerts.jsx";
import { getImageUrl, PLACEHOLDERS } from "../utils/imageUrl";
import "../styles/Software.css";

const Softwares = () => {
  const [software, setSoftware] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  
  // Admin state
  const [user, setUser] = useState(null);
  const [showSoftwareForm, setShowSoftwareForm] = useState(false);
  const [editingSoftware, setEditingSoftware] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [softwareToDelete, setSoftwareToDelete] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  
  useEffect(() => {
    fetchData();
    checkUserAuth();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const [softwareResponse, categoriesResponse] = await Promise.all([
        apiService.request("/api/software"),
        apiService.request("/api/software/categories")
      ]);
      
      if (softwareResponse.status === "success") {
        setSoftware(softwareResponse.data.software);
      }
      
      if (categoriesResponse.status === "success") {
        setCategories(categoriesResponse.data.categories);
      }
    } catch (error) {
      console.error("Error fetching software:", error);
      setError("Failed to load software. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };
  
  const checkUserAuth = async () => {
    try {
      const currentUser = await apiService.getCurrentUser();
      setUser(currentUser);
      if (currentUser && currentUser.role === "admin") {
        fetchAdminStats();
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    }
  };
  
  const fetchAdminStats = async () => {
    try {
      const response = await apiService.request("/api/software/admin/stats");
      if (response.status === "success") {
        setAdminStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    }
  };
  
  const handleAddSoftware = () => {
    setEditingSoftware(null);
    setShowSoftwareForm(true);
  };
  
  const handleEditSoftware = (item) => {
    setEditingSoftware(item);
    setShowSoftwareForm(true);
  };
  
  const handleDeleteClick = (item) => {
    setSoftwareToDelete(item);
    setShowDeleteDialog(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!softwareToDelete) return;
    
    try {
      const response = await apiService.request(
        `/api/software/${softwareToDelete._id}`,
        "DELETE"
      );
      
      if (response.status === "success") {
        showAlert.success("Deleted!", "Software deleted successfully");
        fetchData();
        fetchAdminStats();
      }
    } catch (error) {
      console.error("Error deleting software:", error);
      showAlert.error("Error", "Failed to delete software");
    } finally {
      setShowDeleteDialog(false);
      setSoftwareToDelete(null);
    }
  };
  
  const handleFormSuccess = () => {
    fetchData();
    fetchAdminStats();
    setShowSoftwareForm(false);
    setEditingSoftware(null);
  };
  
  const handleSoftwareClick = async (item) => {
    // Track click
    try {
      await apiService.request(`/api/software/${item._id}/click`, "POST");
    } catch (error) {
      console.error("Error tracking click:", error);
    }
    
    // Open URL
    window.open(item.url, "_blank", "noopener,noreferrer");
  };
  
  const filteredSoftware = selectedCategory === "all"
    ? software
    : software.filter(item => item.category === selectedCategory);
  
  const getStatusBadge = (status) => {
    const badges = {
      active: { text: "Active", class: "status-active" },
      inactive: { text: "Inactive", class: "status-inactive" },
      "coming-soon": { text: "Coming Soon", class: "status-coming-soon" },
      beta: { text: "Beta", class: "status-beta" }
    };
    return badges[status] || badges.active;
  };
  
  if (loading) {
    return <LoadingOverlay message="Loading software..." />;
  }
  
  return (
    <section id="software" className="software">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Software Apps</h2>
          <p className="section-description">
            Explore our latest software applications and tools designed to solve real-world problems
          </p>
        </div>
        
        {/* Admin Stats */}
        {user?.role === "admin" && adminStats && (
          <div className="admin-stats">
            <div className="stat-card">
              <span className="stat-value">{adminStats.total}</span>
              <span className="stat-label">Total Software</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{adminStats.active}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{adminStats.totalClicks}</span>
              <span className="stat-label">Total Clicks</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{adminStats.totalViews}</span>
              <span className="stat-label">Total Views</span>
            </div>
          </div>
        )}
        
        {/* Admin Controls */}
        {user?.role === "admin" && (
          <div className="admin-controls">
            <button onClick={handleAddSoftware} className="btn-add">
              <i className="fas fa-plus"></i> Add Software
            </button>
          </div>
        )}
        
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="category-filter">
            <button
              className={`filter-btn ${selectedCategory === "all" ? "active" : ""}`}
              onClick={() => setSelectedCategory("all")}
            >
              All ({software.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.name}
                className={`filter-btn ${selectedCategory === cat.name ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.name)}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        )}
        
        {/* Software Grid */}
        {filteredSoftware.length === 0 ? (
          <div className="no-software">
            <i className="fas fa-laptop-code"></i>
            <p>No software available at the moment.</p>
          </div>
        ) : (
          <div className="software-grid">
            {filteredSoftware.map((item) => (
              <div key={item._id} className="software-card">
                {/* Image */}
                <div className="software-image">
                  {item.images && item.images.length > 1 ? (
                    <ImageSlider
                      images={item.images}
                      alt={item.name}
                      className="software-slider"
                    />
                  ) : (
                    <img
                      src={getImageUrl(item.primaryImage || item.image, PLACEHOLDERS.software)}
                      alt={item.name}
                      loading="lazy"
                    />
                  )}
                  
                  {/* Status Badge */}
                  <span className={`status-badge ${getStatusBadge(item.status).class}`}>
                    {getStatusBadge(item.status).text}
                  </span>
                </div>
                
                {/* Content */}
                <div className="software-content">
                  <h3 className="software-name">{item.name}</h3>
                  
                  {item.category && (
                    <span className="software-category">
                      <i className="fas fa-tag"></i> {item.category}
                    </span>
                  )}
                  
                  {item.description && (
                    <p className="software-description">{item.description}</p>
                  )}
                  
                  {/* Technologies */}
                  {item.technologies && item.technologies.length > 0 && (
                    <div className="software-technologies">
                      {item.technologies.map((tech, index) => (
                        <span key={index} className="tech-badge">{tech}</span>
                      ))}
                    </div>
                  )}
                  
                  {/* Features */}
                  {item.features && item.features.length > 0 && (
                    <ul className="software-features">
                      {item.features.slice(0, 3).map((feature, index) => (
                        <li key={index}>
                          <i className="fas fa-check"></i> {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {/* Actions */}
                  <div className="software-actions">
                    <button
                      onClick={() => handleSoftwareClick(item)}
                      className="btn-launch"
                      disabled={item.status === "inactive" || item.status === "coming-soon"}
                    >
                      <i className="fas fa-external-link-alt"></i>
                      {item.status === "coming-soon" ? "Coming Soon" : "Launch App"}
                    </button>
                    
                    {user?.role === "admin" && (
                      <div className="admin-actions">
                        <button
                          onClick={() => handleEditSoftware(item)}
                          className="btn-edit"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="btn-delete"
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Stats (admin only) */}
                  {user?.role === "admin" && (
                    <div className="software-stats">
                      <span><i className="fas fa-eye"></i> {item.stats?.views || 0} views</span>
                      <span><i className="fas fa-mouse-pointer"></i> {item.stats?.clicks || 0} clicks</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Software Form Modal */}
      {showSoftwareForm && (
        <SoftwareForm
          isOpen={showSoftwareForm}
          onClose={() => {
            setShowSoftwareForm(false);
            setEditingSoftware(null);
          }}
          software={editingSoftware}
          onSuccess={handleFormSuccess}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="Delete Software"
          message={`Are you sure you want to delete "${softwareToDelete?.name}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteDialog(false);
            setSoftwareToDelete(null);
          }}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}
    </section>
  );
};

export default Softwares;
