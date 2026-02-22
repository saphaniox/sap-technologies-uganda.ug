import React, { useState, useEffect } from "react";
import apiService from "../services/api";
import { showAlert } from "../utils/alerts.jsx";
import { getImageUrl } from "../utils/imageUrl";
import "../styles/AdminForms.css";

const IoTForm = ({ isOpen, onClose, project, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "General",
    status: "completed",
    projectUrl: "",
    githubUrl: "",
    videoUrl: "",
    completionDate: "",
    isPublic: true,
    isFeatured: false,
    order: 0,
    technologies: [""],
    hardware: [""],
    features: [""]
  });
  
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || "",
        description: project.description || "",
        category: project.category || "General",
        status: project.status || "completed",
        projectUrl: project.projectUrl || "",
        githubUrl: project.githubUrl || "",
        videoUrl: project.videoUrl || "",
        completionDate: project.completionDate ? project.completionDate.split("T")[0] : "",
        isPublic: project.isPublic !== undefined ? project.isPublic : true,
        isFeatured: project.isFeatured || false,
        order: project.order || 0,
        technologies: project.technologies?.length > 0 ? project.technologies : [""],
        hardware: project.hardware?.length > 0 ? project.hardware : [""],
        features: project.features?.length > 0 ? project.features : [""]
      });
      
      // Load existing images
      if (project.images && project.images.length > 0) {
        const imageUrls = project.images.map(img => ({
          url: getImageUrl(typeof img === "string" ? img : img.url),
          isExisting: true
        }));
        setImagePreviews(imageUrls);
      }
    } else {
      // Reset for new project
      setFormData({
        title: "",
        description: "",
        category: "General",
        status: "completed",
        projectUrl: "",
        githubUrl: "",
        videoUrl: "",
        completionDate: "",
        isPublic: true,
        isFeatured: false,
        order: 0,
        technologies: [""],
        hardware: [""],
        features: [""]
      });
      setImagePreviews([]);
      setNewImageFiles([]);
    }
  }, [project]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 10;
    
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
      if (file.size > 20 * 1024 * 1024) {
        showAlert.error("File Too Large", `Image "${file.name}" is too large. Maximum size is 20MB.`);
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
    
    if (!formData.title.trim()) {
      showAlert.error("Validation Error", "Please provide a project title");
      return;
    }
    
    try {
      setLoading(true);
      
      const submitData = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
          submitData.append(key, JSON.stringify(formData[key].filter(item => item.trim() !== "")));
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add new image files
      newImageFiles.forEach(file => {
        submitData.append("images", file);
      });
      
      const url = project ? `/api/iot/${project._id}` : "/api/iot";
      const method = project ? "PUT" : "POST";
      
      const response = await apiService.request(url, method, submitData);
      
      if (response.status === "success") {
        showAlert.success(
          "Success!",
          project ? "IoT project updated successfully" : "IoT project created successfully"
        );
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error saving IoT project:", error);
      showAlert.error("Error", error.message || "Failed to save IoT project");
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content iot-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{project ? "Edit IoT Project" : "Add IoT Project"}</h2>
          <button onClick={onClose} className="btn-close">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {/* Instructions for adding IoT projects */}
        <div className="software-form-instructions">
          <div className="instruction-icon">💡</div>
          <div className="instruction-content">
            <strong>Document Your Innovation:</strong>
            <p>Share your IoT projects with detailed images, schematics, and technical specs. Upload up to 10 high-quality photos showing your project in action!</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="software-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3>📋 Basic Information</h3>
            
            <div className="form-group">
              <label>Project Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Smart Home Automation System"
              />
            </div>
            
            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="5"
                placeholder="Detailed description of your IoT project, what it does, and how it works..."
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
                  placeholder="e.g., Smart Home, Industrial, Agriculture"
                />
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="prototype">Prototype</option>
                  <option value="planning">Planning</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Completion Date</label>
                <input
                  type="date"
                  name="completionDate"
                  value={formData.completionDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                />
                <small>Lower numbers appear first</small>
              </div>
            </div>
          </div>
          
          {/* Technologies & Hardware */}
          <div className="form-section">
            <h3>🔧 Technologies & Hardware</h3>
            
            <div className="form-group">
              <label>Technologies Used</label>
              {formData.technologies.map((tech, index) => (
                <div key={index} className="array-input">
                  <input
                    type="text"
                    value={tech}
                    onChange={(e) => handleArrayFieldChange("technologies", index, e.target.value)}
                    placeholder="e.g., Arduino, Python, MQTT"
                  />
                  {formData.technologies.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField("technologies", index)}
                      className="btn-remove"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField("technologies")}
                className="btn-add-array"
              >
                + Add Technology
              </button>
            </div>
            
            <div className="form-group">
              <label>Hardware Components</label>
              {formData.hardware.map((hw, index) => (
                <div key={index} className="array-input">
                  <input
                    type="text"
                    value={hw}
                    onChange={(e) => handleArrayFieldChange("hardware", index, e.target.value)}
                    placeholder="e.g., ESP32, DHT22 Sensor, Relay Module"
                  />
                  {formData.hardware.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField("hardware", index)}
                      className="btn-remove"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField("hardware")}
                className="btn-add-array"
              >
                + Add Hardware
              </button>
            </div>
            
            <div className="form-group">
              <label>Key Features</label>
              {formData.features.map((feature, index) => (
                <div key={index} className="array-input">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleArrayFieldChange("features", index, e.target.value)}
                    placeholder="e.g., Remote control via mobile app"
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField("features", index)}
                      className="btn-remove"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField("features")}
                className="btn-add-array"
              >
                + Add Feature
              </button>
            </div>
          </div>
          
          {/* Links */}
          <div className="form-section">
            <h3>🔗 Links</h3>
            
            <div className="form-group">
              <label>Project URL</label>
              <input
                type="url"
                name="projectUrl"
                value={formData.projectUrl}
                onChange={handleInputChange}
                placeholder="https://project-demo.com"
              />
              <small className="form-hint">Link to live demo or documentation</small>
            </div>
            
            <div className="form-group">
              <label>GitHub URL</label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleInputChange}
                placeholder="https://github.com/username/repo"
              />
              <small className="form-hint">Link to source code repository</small>
            </div>
            
            <div className="form-group">
              <label>Video URL</label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                placeholder="https://youtube.com/watch?v=..."
              />
              <small className="form-hint">YouTube or Vimeo demo video</small>
            </div>
          </div>
          
          {/* Images */}
          <div className="form-section">
            <h3>📷 Project Images</h3>
            
            <div className="form-group">
              <label>Upload Images (Max 10, up to 20MB each)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="file-input"
              />
              <small className="form-hint">🖼️ Images will be automatically compressed and optimized</small>
            </div>
            
            {imagePreviews.length > 0 && (
              <div className="image-preview-grid">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={preview.url} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="btn-remove-image"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Settings */}
          <div className="form-section">
            <h3>⚙️ Settings</h3>
            
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                />
                <span>Make this project public</span>
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                />
                <span>⭐ Feature this project (show prominently)</span>
              </label>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Saving..." : project ? "Update Project" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IoTForm;
