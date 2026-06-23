import { useState } from "react";
import apiService from "../services/api";
import { showAlert } from "../utils/alerts.jsx";
import "../styles/JobApplicationForm.css";

const JobApplicationForm = ({ job, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    coverLetter: "",
    resumeUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    if (formData.resumeUrl && formData.resumeUrl.length > 500) {
      newErrors.resumeUrl = "Resume URL cannot exceed 500 characters";
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
      const response = await apiService.applyForJob(job._id, {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        coverLetter: formData.coverLetter.trim(),
        resumeUrl: formData.resumeUrl.trim()
      });

      await showAlert.success(
        "Application Submitted!",
        "Thank you for your interest. We will review your application and get back to you soon.",
        { timer: 5000 }
      );

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        coverLetter: "",
        resumeUrl: ""
      });
      onClose();
    } catch (error) {
      console.error("Error submitting application:", error);
      const message = error.message || "Could not submit application. Please try again.";
      setErrors({ submit: message });
      await showAlert.error("Application failed", message);
    } finally {
      setLoading(false);
    }
  };

  if (!onClose || !job) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content application-form-modal">
        <div className="modal-header">
          <h2>Apply for {job.title}</h2>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            disabled={loading}
          >
            x
          </button>
        </div>

        <div className="job-summary">
          <p><strong>Department:</strong> {job.department}</p>
          <p><strong>Location:</strong> {job.location}</p>
          <p><strong>Type:</strong> {job.employmentType}</p>
        </div>

        <form onSubmit={handleSubmit} className="application-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name <span className="required">*</span></label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Your full name"
              className={errors.fullName ? "error" : ""}
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address <span className="required">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              className={errors.email ? "error" : ""}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number <span className="optional-field">(optional)</span></label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+256 700 000 000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="coverLetter">Cover Letter <span className="optional-field">(optional)</span></label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleInputChange}
              placeholder="Tell us why you are a great fit for this role..."
              maxLength={2000}
              rows={5}
            />
          </div>

          <div className="form-group">
            <label htmlFor="resumeUrl">Resume / Portfolio URL <span className="optional-field">(optional)</span></label>
            <input
              type="url"
              id="resumeUrl"
              name="resumeUrl"
              value={formData.resumeUrl}
              onChange={handleInputChange}
              placeholder="https://your-resume-link.com"
              className={errors.resumeUrl ? "error" : ""}
            />
            <small className="help-text">
              Link to your CV, portfolio, or LinkedIn profile
            </small>
            {errors.resumeUrl && <span className="error-message">{errors.resumeUrl}</span>}
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
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationForm;
