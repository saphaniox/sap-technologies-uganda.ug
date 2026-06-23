import { useState, useEffect } from "react";
import JobForm from "../components/JobForm";
import JobApplicationForm from "../components/JobApplicationForm";
import ConfirmDialog from "../components/ConfirmDialog";
import apiService from "../services/api";
import { showAlert } from "../utils/alerts.jsx";
import "../styles/Careers.css";

const Careers = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [applicationJobId, setApplicationJobId] = useState(null);

  useEffect(() => {
    fetchJobs();
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      const currentUser = await apiService.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPublicJobs();
      const jobList = data.data || [];
      setJobs(jobList.filter((j) => j.isActive));
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("We're having trouble loading job openings. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleDelete = (job) => {
    setJobToDelete(job);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    try {
      await apiService.deleteJob(jobToDelete._id);
      setJobs((prev) => prev.filter((j) => j._id !== jobToDelete._id));
      setShowDeleteDialog(false);
      setJobToDelete(null);
      await showAlert.success("Deleted", "Job posting has been deleted.");
    } catch (error) {
      console.error("Error deleting job:", error);
      await showAlert.error("Delete failed", error.message || "Could not delete. Please try again.");
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setJobToDelete(null);
  };

  const handleSave = () => {
    fetchJobs();
    setShowJobForm(false);
    setEditingJob(null);
  };

  const toggleJobExpand = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  const openApplication = (jobId) => {
    setApplicationJobId(jobId);
  };

  const closeApplication = () => {
    setApplicationJobId(null);
  };

  const applyingJob = jobs.find((j) => j._id === applicationJobId);

  if (loading) {
    return (
      <section id="careers" className="careers-section">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading career opportunities...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <section id="careers" className="careers-section">
        <div className="container">
          <div className="error-state">
            <p>⚠️ {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="careers" className="careers-section">
      <div className="container">
        <div className="careers-header">
          <h2>Join Our Team</h2>
          <p className="careers-subtitle">
            We are always looking for talented people to help us build amazing technology.
            Explore our open positions and find your next opportunity.
          </p>
          {user && user.role === "admin" && (
            <button
              className="add-job-btn admin-btn"
              onClick={() => {
                setEditingJob(null);
                setShowJobForm(true);
              }}
            >
              + Post New Job
            </button>
          )}
        </div>

        {jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💼</div>
            <h3>No Open Positions</h3>
            <p>
              We don't have any open positions right now, but we are always interested in
              hearing from talented people. Send us your resume to careers@saptechug.com.
            </p>
          </div>
        ) : (
          <div className="jobs-list">
            {jobs.map((job, index) => (
              <div
                key={job._id}
                className={`job-card ${expandedJobId === job._id ? "expanded" : ""}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="job-main" onClick={() => toggleJobExpand(job._id)}>
                  <div className="job-title-section">
                    <h3>{job.title}</h3>
                    <div className="job-meta">
                      <span className="job-badge department">{job.department}</span>
                      <span className="job-badge location">📍 {job.location}</span>
                      <span className="job-badge type">{job.employmentType}</span>
                    </div>
                  </div>
                  <div className="job-actions-main">
                    {job.salaryRange && (
                      <span className="job-salary">{job.salaryRange}</span>
                    )}
                    <button
                      className={`expand-btn ${expandedJobId === job._id ? "active" : ""}`}
                      aria-label={expandedJobId === job._id ? "Collapse" : "Expand"}
                    >
                      ▼
                    </button>
                    {user && user.role === "admin" && (
                      <div className="job-admin-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(job)}
                          title="Edit Job"
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(job)}
                          title="Delete Job"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {expandedJobId === job._id && (
                  <div className="job-details">
                    <div className="job-detail-section">
                      <h4>About the Role</h4>
                      <p>{job.description}</p>
                    </div>

                    {job.responsibilities && (
                      <div className="job-detail-section">
                        <h4>Responsibilities</h4>
                        <p>{job.responsibilities}</p>
                      </div>
                    )}

                    {job.requirements && (
                      <div className="job-detail-section">
                        <h4>Requirements</h4>
                        <p>{job.requirements}</p>
                      </div>
                    )}

                    {job.benefits && (
                      <div className="job-detail-section">
                        <h4>Benefits</h4>
                        <p>{job.benefits}</p>
                      </div>
                    )}

                    <div className="job-detail-footer">
                      <div className="job-deadline">
                        {job.applicationDeadline ? (
                          <span>
                            ⏰ Apply by:{" "}
                            {new Date(job.applicationDeadline).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })}
                          </span>
                        ) : (
                          <span>✨ Applications accepted on a rolling basis</span>
                        )}
                      </div>
                      <button
                        className="apply-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openApplication(job._id);
                        }}
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showJobForm && (
        <JobForm
          isOpen={showJobForm}
          job={editingJob}
          onClose={() => {
            setShowJobForm(false);
            setEditingJob(null);
          }}
          onSave={handleSave}
        />
      )}

      {showDeleteDialog && jobToDelete && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="Delete Job"
          message={`Are you sure you want to delete "${jobToDelete.title}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}

      {applicationJobId && applyingJob && (
        <JobApplicationForm
          job={applyingJob}
          onClose={closeApplication}
        />
      )}
    </section>
  );
};

export default Careers;
