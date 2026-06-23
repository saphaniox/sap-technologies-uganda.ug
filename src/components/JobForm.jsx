import { useState, useEffect } from "react";
import apiService from "../services/api";
import { showAlert } from "../utils/alerts.jsx";
import "../styles/JobForm.css";

const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Remote",
  "Freelance"
];

const JobForm = ({ isOpen, job, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    department: "General",
    location: "Kampala, Uganda",
    employmentType: "Full-time",
    description: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    salaryRange: "",
    applicationDeadline: "",
    isActive: true,
    isFeatured: false,
    displayOrder: 0
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || "",
        department: job.department || "General",
        location: job.location || "Kampala, Uganda",
        employmentType: job.employmentType || "Full-time",
        description: job.description || "",
        requirements: job.requirements || "",
        responsibilities: job.responsibilities || "",
        benefits: job.benefits || "",
        salaryRange: job.salaryRange || "",
        applicationDeadline: job.applicationDeadline
          ? new Date(job.applicationDeadline).toISOString().slice(0, 16)
          : "",
        isActive: job.isActive !== undefined ? job.isActive : true,
        isFeatured: job.isFeatured !== undefined ? job.isFeatured : false,
        displayOrder: job.displayOrder || 0
      });
    } else {
      setFormData({
        title: "",
        department: "General",
        location: "Kampala, Uganda",
        employmentType: "Full-time",
        description: "",
        requirements: "",
        responsibilities: "",
        benefits: "",
        salaryRange: "",
        applicationDeadline: "",
        isActive: true,
        isFeatured: false,
        displayOrder: 0
      });
    }
    setErrors({});
  }, [job, isOpen]);

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title || formData.title.trim().length < 2) {
      newErrors.title = "Job title is required (min 2 characters)";
    }
    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = "Job description is required (min 10 characters)";
    }
    if (formData.salaryRange && formData.salaryRange.length > 100) {
      newErrors.salaryRange = "Salary range cannot exceed 100 characters";
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
      const url = job
        ? `${apiService.baseURL}/api/jobs/${job._id}`
        : `${apiService.baseURL}/api/jobs`;

      const method = job ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(apiService.authToken ? { Authorization: `Bearer ${apiService.authToken}` } : {})
        },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title.trim(),
          department: formData.department.trim(),
          location: formData.location.trim(),
          employmentType: formData.employmentType,
          description: formData.description.trim(),
          requirements: formData.requirements.trim(),
          responsibilities: formData.responsibilities.trim(),
          benefits: formData.benefits.trim(),
          salaryRange: formData.salaryRange.trim(),
          applicationDeadline: formData.applicationDeadline || undefined,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
          displayOrder: formData.displayOrder
        })
      });

      if (response.ok) {
        await showAlert.success(
          job ? "Job updated" : "Job created",
          "The job posting has been saved successfully."
        );
        onSave();
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
      console.error("Error saving job:", error);
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
      <div className="modal-content job-form-modal">
        <div className="modal-header">
          <h2>{job ? "Edit Job" : "Post New Job"}</h2>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            disabled={loading}
          >
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Job Title <span className="required">*</span></label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Senior Software Engineer"
                className={errors.title ? "error" : ""}
                maxLength={100}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="e.g. Engineering"
                className={errors.department ? "error" : ""}
                maxLength={50}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g. Kampala, Uganda"
                className={errors.location ? "error" : ""}
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label htmlFor="employmentType">Employment Type</label>
              <select
                id="employmentType"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleInputChange}
              >
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Job Description <span className="required">*</span></label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the role and what the candidate will be doing..."
              className={errors.description ? "error" : ""}
              maxLength={2000}
              rows={5}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="requirements">Requirements <span className="optional-field">(optional)</span></label>
            <textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              placeholder="Required qualifications, skills, experience..."
              className={errors.requirements ? "error" : ""}
              maxLength={2000}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="responsibilities">Responsibilities <span className="optional-field">(optional)</span></label>
            <textarea
              id="responsibilities"
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleInputChange}
              placeholder="Key responsibilities for this role..."
              className={errors.responsibilities ? "error" : ""}
              maxLength={2000}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="benefits">Benefits <span className="optional-field">(optional)</span></label>
            <textarea
              id="benefits"
              name="benefits"
              value={formData.benefits}
              onChange={handleInputChange}
              placeholder="Health insurance, paid leave, training, etc."
              className={errors.benefits ? "error" : ""}
              maxLength={1000}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salaryRange">Salary Range <span className="optional-field">(optional)</span></label>
              <input
                type="text"
                id="salaryRange"
                name="salaryRange"
                value={formData.salaryRange}
                onChange={handleInputChange}
                placeholder="e.g. UGX 2,000,000 - 4,000,000"
                className={errors.salaryRange ? "error" : ""}
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="applicationDeadline">Application Deadline <span className="optional-field">(optional)</span></label>
              <input
                type="datetime-local"
                id="applicationDeadline"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleInputChange}
                className={errors.applicationDeadline ? "error" : ""}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="displayOrder">Display Order</label>
              <input
                type="number"
                id="displayOrder"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                min="0"
                className={errors.displayOrder ? "error" : ""}
              />
              <small className="help-text">Lower numbers appear first</small>
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
                Active
              </label>
              <small className="help-text">Only active jobs appear on careers page</small>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                Featured
              </label>
              <small className="help-text">Featured jobs appear first</small>
            </div>
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
              {loading ? "Saving..." : (job ? "Update Job" : "Post Job")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;
