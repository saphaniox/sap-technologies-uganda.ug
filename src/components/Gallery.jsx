import { useState, useEffect } from "react";
import GalleryForm from "./GalleryForm";
import ConfirmDialog from "./ConfirmDialog";
import apiService from "../services/api";
import { getImageUrl } from "../utils/imageUrl";
import { showAlert } from "../utils/alerts.jsx";
import "../styles/Gallery.css";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "services", label: "Services" },
  { value: "projects", label: "Projects" },
  { value: "events", label: "Events" },
  { value: "team", label: "Team" },
  { value: "office", label: "Office" },
  { value: "other", label: "Other" }
];

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    fetchGallery();
    checkUserAuth();
  }, []);

  useEffect(() => {
    if (activeCategory === "all") {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter((item) => item.category === activeCategory));
    }
  }, [activeCategory, items]);

  const checkUserAuth = async () => {
    try {
      const currentUser = await apiService.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  };

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPublicGallery();
      const galleryItems = data.data || [];
      setItems(galleryItems);
    } catch (err) {
      console.error("Error fetching gallery:", err);
      setError("We're having trouble loading the gallery. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await apiService.deleteGalleryItem(itemToDelete._id);
      setItems((prev) => prev.filter((i) => i._id !== itemToDelete._id));
      setShowDeleteDialog(false);
      setItemToDelete(null);
      await showAlert.success("Deleted", "Gallery item has been deleted.");
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      await showAlert.error("Delete failed", error.message || "Could not delete. Please try again.");
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  const handleSave = () => {
    fetchGallery();
    setShowForm(false);
    setEditingItem(null);
  };

  const openLightbox = (image) => {
    setLightboxImage(image);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  if (loading) {
    return (
      <section id="gallery" className="gallery-section">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading gallery...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error && items.length === 0) {
    return (
      <section id="gallery" className="gallery-section">
        <div className="container">
          <div className="error-state">
            <p>⚠️ {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="gallery-section">
      <div className="container">
        <div className="gallery-header">
          <h2>Our Gallery</h2>
          <p className="gallery-subtitle">
            Explore our work through images of services, projects, and team moments
          </p>
          {user && user.role === "admin" && (
            <button
              className="add-gallery-btn admin-btn"
              onClick={() => {
                setEditingItem(null);
                setShowForm(true);
              }}
            >
              + Add Gallery Item
            </button>
          )}
        </div>

        <div className="gallery-story-grid" aria-label="What SAPTech Uganda documents in the gallery">
          <article>
            <h3>Project Builds</h3>
            <p>
              Photos from websites, business systems, IoT devices, electronics prototypes,
              installation work, testing sessions, and client-ready technology solutions.
            </p>
          </article>
          <article>
            <h3>Service Delivery</h3>
            <p>
              A visual record of design, software development, graphics, electrical engineering,
              automation, security, and digital transformation work delivered by the team.
            </p>
          </article>
          <article>
            <h3>Team & Events</h3>
            <p>
              Moments from workshops, training, office work, community events, partnerships,
              and the people behind SAPTech Uganda's engineering and technology projects.
            </p>
          </article>
        </div>

        <div className="gallery-filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`filter-btn ${activeCategory === cat.value ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📷</div>
            <h3>No Gallery Items</h3>
            <p>
              {activeCategory === "all"
                ? "No gallery items have been added yet."
                : `No items in the "${activeCategory}" category.`}
            </p>
          </div>
        ) : (
          <div className="gallery-grid">
            {filteredItems.map((item) => (
              <div key={item._id} className="gallery-card">
                <div className="gallery-image-wrapper">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.title || "Gallery image"}
                    loading="lazy"
                    onClick={() => openLightbox(getImageUrl(item.image))}
                  />
                  <div className="gallery-overlay">
                    <button
                      className="lightbox-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openLightbox(getImageUrl(item.image));
                      }}
                      title="View full size"
                    >
                      🔍
                    </button>
                    {user && user.role === "admin" && (
                      <>
                        <button
                          className="edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(item);
                          }}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item);
                          }}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {(item.title || item.description) && (
                  <div className="gallery-info">
                    {item.title && <h3>{item.title}</h3>}
                    {item.description && <p>{item.description}</p>}
                    <span className="gallery-category-badge">{item.category}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <GalleryForm
          isOpen={showForm}
          galleryItem={editingItem}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onSave={handleSave}
        />
      )}

      {showDeleteDialog && itemToDelete && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="Delete Gallery Item"
          message={`Are you sure you want to delete "${itemToDelete.title || "this gallery item"}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}

      {lightboxImage && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>
              x
            </button>
            <img src={lightboxImage} alt="Full size" />
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;
