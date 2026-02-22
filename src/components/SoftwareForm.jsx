import React, { useState, useEffect } from "react";
import apiService from "../services/api";
import { showAlert } from "../utils/alerts.jsx";
import { getImageUrl } from "../utils/imageUrl";
import "../styles/AdminForms.css";

const SoftwareForm = ({ isOpen, onClose, software, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    url: "",
    category: "General",
    status: "active",
    isPublic: true,
    order: 0,
    features: [""],
    technologies: [""]
  });
  
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  
  useEffect(() => {
    if (software) {
      setFormData({
        name: software.name || "",
        description: software.description || "",
        url: software.url || "",
        category: software.category || "General",
        status: software.status || "active",
        isPublic: software.isPublic !== undefined ? software.isPublic : true,
        order: software.order || 0,
        features: software.features?.length > 0 ? software.features : [""],
        technologies: software.technologies?.length > 0 ? software.technologies : [""]
      });
      
      // Load existing images
      if (software.images && software.images.length > 0) {
        const imageUrls = software.images.map(img => ({
          url: getImageUrl(typeof img === "string" ? img : img.url),
          isExisting: true
        }));
        setImagePreviews(imageUrls);
      } else if (software.image) {
        setImagePreviews([{
          url: getImageUrl(software.image),
          isExisting: true
        }]);
      }
    } else {
      // Reset for new software
      setFormData({
        name: "",
        description: "",
        url: "",
        category: "General",
        status: "active",
        isPublic: true,
        order: 0,
        features: [""],
        technologies: [""]
      });
      setImagePreviews([]);
      setNewImageFiles([]);
    }
  }, [software]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 5;
    
    if (imagePreviews.length + files.length > maxImages) {
      showAlert.error(
        "Too Many Images",
        `You can only upload up to ${maxImages} images. Currently you have ${imagePreviews.length} image(s).`
      );
      e.target.value = "";
      return;
    }
    
    // Validate files
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        showAlert.error("File Too Large", `Image "${file.name}" is too large. Maximum size is 10MB.`);
        e.target.value = "";
        return;
      }
      
      if (!file.type.startsWith("image/")) {
        showAlert.error("Invalid File Type", `"${file.name}" is not an image file.`);
        e.target.value = "";
        return;
      }
    }
    
    // Add files
    setNewImageFiles(prev => [...prev, ...files]);
    
    // Generate previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, {
          url: e.target.result,
          file: file,
          isExisting: false
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    e.target.value = "";
  };
  
  const handleRemoveImage = (index) => {
    const imageToRemove = imagePreviews[index];
    
    if (!imageToRemove.isExisting) {
      const fileIndex = newImageFiles.findIndex(f => f === imageToRemove.file);
      if (fileIndex !== -1) {
        setNewImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
      }
    }
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleArrayFieldChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };
  
  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }));
  };
  
  const removeArrayField = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = new FormData();
      
      // Add basic fields
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("url", formData.url);
      submitData.append("category", formData.category);
      submitData.append("status", formData.status);
      submitData.append("isPublic", formData.isPublic);
      submitData.append("order", formData.order);
      
      // Add arrays as JSON
      submitData.append("features", JSON.stringify(
        formData.features.filter(f => f.trim())
      ));
      submitData.append("technologies", JSON.stringify(
        formData.technologies.filter(t => t.trim())
      ));
      
      // Add new images
      newImageFiles.forEach(file => {
        submitData.append("images", file);
      });
      
      // Determine endpoint
      const endpoint = software
        ? `/api/software/${software._id}`
        : "/api/software";
      const method = software ? "PUT" : "POST";
      
      const response = await apiService.request(endpoint, method, submitData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      if (response.status === "success") {
        showAlert.success(
          "Success!",
          software ? "Software updated successfully" : "Software created successfully"
        );
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error saving software:", error);
      showAlert.error("Error", error.message || "Failed to save software");
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content software-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{software ? "Edit Software" : "Add Software"}</h2>
          <button onClick={onClose} className="btn-close">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="software-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label>Software Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., SAP Invoice Generator"
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Brief description of what this software does..."
              />
            </div>
            
            <div className="form-group">
              <label>App URL *</label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                required
                placeholder="https://example.com/app"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Productivity, Business, etc."
                />
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="active">Active</option>
                  <option value="beta">Beta</option>
                  <option value="coming-soon">Coming Soon</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                  />
                  <span>Public (Visible to all users)</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Images */}
          <div className="form-section">
            <h3>Images (Optional)</h3>
            
            <div className="form-group">
              <label>Upload Images (Max 5)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={imagePreviews.length >= 5}
              />
              <small>Supported formats: JPG, PNG, GIF (Max 10MB each)</small>
            </div>
            
            {imagePreviews.length > 0 && (
              <div className="image-previews">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview">
                    <img src={preview.url} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="btn-remove-image"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                    {index === 0 && <span className="primary-badge">Primary</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Features */}
          <div className="form-section">
            <h3>Features (Optional)</h3>
            {formData.features.map((feature, index) => (
              <div key={index} className="array-field-group">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleArrayFieldChange("features", index, e.target.value)}
                  placeholder="Feature description"
                />
                {formData.features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField("features", index)}
                    className="btn-remove-field"
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField("features")}
              className="btn-add-field"
            >
              <i className="fas fa-plus"></i> Add Feature
            </button>
          </div>
          
          {/* Technologies */}
          <div className="form-section">
            <h3>Technologies Used (Optional)</h3>
            {formData.technologies.map((tech, index) => (
              <div key={index} className="array-field-group">
                <input
                  type="text"
                  value={tech}
                  onChange={(e) => handleArrayFieldChange("technologies", index, e.target.value)}
                  placeholder="e.g., React, Node.js, MongoDB"
                />
                {formData.technologies.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField("technologies", index)}
                    className="btn-remove-field"
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField("technologies")}
              className="btn-add-field"
            >
              <i className="fas fa-plus"></i> Add Technology
            </button>
          </div>
          
          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> {software ? "Update" : "Create"} Software
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SoftwareForm;
