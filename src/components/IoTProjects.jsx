import React, { useState, useEffect } from "react";
import apiService from "../services/api";
import IoTForm from "./IoTForm";
import ConfirmDialog from "./ConfirmDialog";
import ImageSlider from "./ImageSlider";
import { LoadingOverlay, showAlert } from "../utils/alerts.jsx";
import { getImageUrl, PLACEHOLDERS } from "../utils/imageUrl";
import "../styles/IoT.css";

const IoTProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [categories, setCategories] = useState([]);
  
  // Admin state
  const [user, setUser] = useState(null);
  const [showIoTForm, setShowIoTForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  
  useEffect(() => {
    fetchData();
    checkUserAuth();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsResponse, categoriesResponse] = await Promise.all([
        apiService.request("/api/iot"),
        apiService.request("/api/iot/categories")
      ]);
      
      if (projectsResponse.status === "success") {
        setProjects(projectsResponse.data.iotProjects);
      }
      
      if (categoriesResponse.status === "success") {
        setCategories(categoriesResponse.data.categories);
      }
    } catch (error) {
      console.error("Error fetching IoT projects:", error);
      setError("Failed to load IoT projects. Please refresh the page.");
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
      const response = await apiService.request("/api/iot/admin/stats");
      if (response.status === "success") {
        setAdminStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    }
  };
  
  const handleAddProject = () => {
    setEditingProject(null);
    setShowIoTForm(true);
  };
  
  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowIoTForm(true);
  };
  
  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setShowDeleteDialog(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    
    try {
      const response = await apiService.request(
        `/api/iot/${projectToDelete._id}`,
        "DELETE"
      );
      
      if (response.status === "success") {
        showAlert.success("Deleted!", "IoT project deleted successfully");
        fetchData();
        if (user?.role === "admin") {
          fetchAdminStats();
        }
      }
    } catch (error) {
      showAlert.error("Error", error.message || "Failed to delete IoT project");
    } finally {
      setShowDeleteDialog(false);
      setProjectToDelete(null);
    }
  };
  
  const handleLike = async (projectId) => {
    try {
      await apiService.request(`/api/iot/${projectId}/like`, "POST");
      fetchData();
    } catch (error) {
      console.error("Error liking project:", error);
    }
  };
  
  const filteredProjects = projects.filter(project => {
    const categoryMatch = selectedCategory === "all" || project.category === selectedCategory;
    const statusMatch = selectedStatus === "all" || project.status === selectedStatus;
    return categoryMatch && statusMatch;
  });
  
  const getStatusBadge = (status) => {
    const badges = {
      completed: { label: "Completed", class: "status-completed" },
      "in-progress": { label: "In Progress", class: "status-progress" },
      prototype: { label: "Prototype", class: "status-prototype" },
      planning: { label: "Planning", class: "status-planning" }
    };
    return badges[status] || badges.completed;
  };
  
  if (loading) {
    return <LoadingOverlay message="Loading IoT projects..." />;
  }
  
  if (error) {
    return <div className="iot-error">{error}</div>;
  }
  
  return (
    <section className="iot-section" id="iot">
      <div className="container">
        {/* Admin Stats Dashboard */}
        {user?.role === "admin" && adminStats && (
          <div className="iot-admin-stats">
            <h3>📊 Admin Dashboard</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Total Projects</span>
                <span className="stat-value">{adminStats.totalProjects}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Completed</span>
                <span className="stat-value">{adminStats.completedProjects}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">In Progress</span>
                <span className="stat-value">{adminStats.inProgressProjects}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Featured</span>
                <span className="stat-value">{adminStats.featuredProjects}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Total Views</span>
                <span className="stat-value">{adminStats.totalViews}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Total Likes</span>
                <span className="stat-value">{adminStats.totalLikes}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Section Header */}
        <div className="iot-header">
          <div className="header-content">
            <h2 className="section-title">IoT Projects & Innovations</h2>
            <p className="section-description">
              Browse our collection of innovative IoT projects and embedded systems
            </p>
          </div>
          
          {user?.role === "admin" && (
            <button onClick={handleAddProject} className="btn-add-project">
              <i className="fas fa-plus"></i> Add IoT Project
            </button>
          )}
        </div>
        
        {/* Filters */}
        <div className="iot-filters">
          <div className="filter-group">
            <label>Category:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="prototype">Prototype</option>
              <option value="planning">Planning</option>
            </select>
          </div>
          
          <div className="results-count">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
        </div>
        
        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="no-projects">
            <i className="fas fa-microchip fa-3x"></i>
            <p>No IoT projects found</p>
          </div>
        ) : (
          <div className="iot-grid">
            {filteredProjects.map((project) => (
              <div key={project._id} className="iot-card">
                {project.isFeatured && (
                  <div className="featured-badge">⭐ Featured</div>
                )}
                
                <div className="iot-image-container">
                  {project.images && project.images.length > 1 ? (
                    <ImageSlider 
                      images={project.images.map(img => getImageUrl(img.url))} 
                      alt={project.title}
                    />
                  ) : (
                    <img 
                      src={getImageUrl(project.primaryImage) || PLACEHOLDERS.iot} 
                      alt={project.title}
                      className="iot-image"
                    />
                  )}
                  
                  <div className={`status-badge ${getStatusBadge(project.status).class}`}>
                    {getStatusBadge(project.status).label}
                  </div>
                </div>
                
                <div className="iot-content">
                  <h3 className="iot-title">{project.title}</h3>
                  
                  {project.category && (
                    <span className="iot-category">{project.category}</span>
                  )}
                  
                  <p className="iot-description">{project.description}</p>
                  
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="tech-tags">
                      {project.technologies.slice(0, 5).map((tech, index) => (
                        <span key={index} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  )}
                  
                  {project.hardware && project.hardware.length > 0 && (
                    <div className="hardware-tags">
                      <strong>Hardware:</strong>
                      {project.hardware.slice(0, 3).map((hw, index) => (
                        <span key={index} className="hardware-tag">{hw}</span>
                      ))}
                    </div>
                  )}
                  
                  <div className="iot-actions">
                    {project.projectUrl && (
                      <a 
                        href={project.projectUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-view"
                      >
                        <i className="fas fa-external-link-alt"></i> View Project
                      </a>
                    )}
                    
                    {project.githubUrl && (
                      <a 
                        href={project.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-github"
                      >
                        <i className="fab fa-github"></i> GitHub
                      </a>
                    )}
                    
                    <button 
                      onClick={() => handleLike(project._id)}
                      className="btn-like"
                    >
                      <i className="fas fa-heart"></i> {project.stats?.likes || 0}
                    </button>
                  </div>
                  
                  {user?.role === "admin" && (
                    <div className="admin-actions">
                      <button 
                        onClick={() => handleEditProject(project)}
                        className="btn-edit"
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(project)}
                        className="btn-delete"
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* IoT Form Modal */}
      {showIoTForm && (
        <IoTForm 
          isOpen={showIoTForm}
          onClose={() => setShowIoTForm(false)}
          project={editingProject}
          onSuccess={() => {
            fetchData();
            if (user?.role === "admin") {
              fetchAdminStats();
            }
          }}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <ConfirmDialog 
          isOpen={showDeleteDialog}
          title="Delete IoT Project"
          message={`Are you sure you want to delete "${projectToDelete?.title}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteDialog(false);
            setProjectToDelete(null);
          }}
          confirmText="Delete"
          cancelText="Cancel"
          confirmButtonClass="btn-danger"
        />
      )}
    </section>
  );
};

export default IoTProjects;
