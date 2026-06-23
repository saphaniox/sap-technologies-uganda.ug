import { useState, useEffect } from "react";
import apiService from "../services/api";
import { showAlert } from "../utils/alerts.jsx";
import { getImageUrl } from "../utils/imageUrl";
import "../styles/GalleryForm.css";

const GalleryForm = ({ isOpen, galleryItem, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "services",
    isActive: true,
    displayOrder: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const CATEGORIES = [
    { value: "services", label: "Services" },
    { value: "projects", label: "Projects" },
    { value: "events", label: "Events" },
    { value: "team", label: "Team" },
    { value: "office", label: "Office" },
    { value: "other", label: "Other" }
  ];

  useEffect(() => {
    if (galleryItem) {
      setFormData({
        title: galleryItem.title || "",
        description: galleryItem.description || "",
        category: galleryItem.category || "services",
        isActive: galleryItem.isActive !== undefined ? galleryItem.isActive : true,
        displayOrder: galleryItem.displayOrder || 0
      });
      setImagePreview(getImageUrl(galleryItem.image) || "");
    } else {
      setFormData({
        title: "",
        description: "",
        category: "services",
        isActive: true,
        displayOrder: 0
      });
      setImagePreview("");
    }
    setImageFile(null);
    setErrors({});
  }, [galleryItem, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type?.startsWith("image/")) {
        const message = "Please select a valid image file.";
        setErrors((prev) => ({ ...prev, image: message }));
        showAlert.error("Wrong file type", message);
        e.target.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        const message = "Image too large. Please keep it under 10MB.";
        setErrors((prev) => ({ ...prev, image: message }));
        showAlert.error("Image too large", message);
        e.target.value = "";
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!galleryItem && !imageFile) {
      newErrors.image = "Gallery image is required";
    }
    if (formData.title && formData.title.length > 100) {
      newErrors.title = "Title cannot exceed 100 characters";
    }
    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
    }
    if (formData.displayOrder < 0) {
      newErrors.displayOrder = "Order must be a non-negative number";
    }
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    if (!isValid) {
      showAlert.error("Please check the form", Object.values(newErrors)[0] || "Fix the highlighted fields and try again.");
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("category", formData.category);
      payload.append("isActive", String(formData.isActive));
      payload.append("displayOrder", String(formData.displayOrder));
      if (formData.title) payload.append("title", formData.title.trim());
      if (formData.description) payload.append("description", formData.description.trim());
      if (imageFile) payload.append("image", imageFile);

      const url = galleryItem
        ? `${apiService.baseURL}/api/gallery/${galleryItem._id}`
        : `${apiService.baseURL}/api/gallery`;

      const method = galleryItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: payload,
        credentials: "include"
      });

      if (response.ok) {
        const savedItem = await response.json();
        await showAlert.success(
          galleryItem ? "Gallery updated" : "Gallery item added",
          imageFile ? "The image uploaded successfully." : "Saved successfully."
        );
        onSave(savedItem);
        onClose();
      } else {
        const errorData = await response.json();
        const message = errorData.errors
          ? errorData.errors.join(", ")
          : errorData.message || "Couldn't save. Please try again.";
        setErrors({ submit: message });
        await showAlert.error("Save failed", message);
      }
    } catch (error) {
      console.error("Error saving gallery item:", error);
      const message = "A network error occurred. Please check your connection and try again.";
      setErrors({ submit: message });
      await showAlert.error("Upload failed", message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content gallery-form-modal">
        <div className="modal-header">
          <h2>{galleryItem ? "Edit Gallery Item" : "Add New Gallery Item"}</h2>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            disabled={loading}
          >
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="gallery-form">
          <div className="form-group">
            <label htmlFor="image">
              Gallery Image {!galleryItem ? <span className="required">*</span> : <span className="optional-field">(optional)</span>}
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className={errors.image ? "error" : ""}
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
            <small className="help-text">
              Supported formats: JPG, PNG, WebP (Max 10MB)
            </small>
            {errors.image && <span className="error-message">{errors.image}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="title">Title <span className="optional-field">(optional)</span></label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Optional title for this image"
              className={errors.title ? "error" : ""}
              maxLength={100}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description <span className="optional-field">(optional)</span></label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of this gallery item"
              className={errors.description ? "error" : ""}
              maxLength={500}
              rows={3}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="displayOrder">Display Order <span className="optional-field">(optional)</span></label>
            <input
              type="number"
              id="displayOrder"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleInputChange}
              min="0"
              className={errors.displayOrder ? "error" : ""}
            />
            <small className="help-text">
              Lower numbers appear first (0 = first position)
            </small>
            {errors.displayOrder && <span className="error-message">{errors.displayOrder}</span>}
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
              <span className="checkmark"></span>
              Active (visible on website)
            </label>
            <small className="help-text">
              Only active items will be displayed on the public gallery
            </small>
          </div>

          {errors.submit && (
            <div className="error-message submit-error">
              {errors.submit}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : (galleryItem ? "Update Item" : "Add Item")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GalleryForm;
