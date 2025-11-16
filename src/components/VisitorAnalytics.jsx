import { useState, useEffect } from "react";
import api from "../services/api";
import "../styles/VisitorAnalytics.css";

const VisitorAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [liveVisitors, setLiveVisitors] = useState({ count: 0, sessions: [] });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState(null);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/visitor-analytics?period=${period}`);
      
      if (response.success) {
        setAnalytics(response.data);
        setError(null);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch live visitors
  const fetchLiveVisitors = async () => {
    try {
      const response = await api.get("/admin/visitor-analytics/live");
      
      if (response.success) {
        setLiveVisitors(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch live visitors:", err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchLiveVisitors();

    // Refresh live visitors every 30 seconds
    const liveInterval = setInterval(fetchLiveVisitors, 30000);

    return () => clearInterval(liveInterval);
  }, [period]);

  // Export analytics
  const handleExport = async (type) => {
    try {
      const response = await fetch(
        `/api/admin/visitor-analytics/export?period=${period}&type=${type}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${type}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to export:", err);
      alert("Failed to export data");
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && !analytics) {
    return (
      <div className="visitor-analytics">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="visitor-analytics">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="visitor-analytics">
      <div className="analytics-header">
        <h2>📊 Visitor Analytics</h2>
        
        <div className="header-controls">
          <div className="period-selector">
            <button
              className={period === "24h" ? "active" : ""}
              onClick={() => setPeriod("24h")}
            >
              24 Hours
            </button>
            <button
              className={period === "7d" ? "active" : ""}
              onClick={() => setPeriod("7d")}
            >
              7 Days
            </button>
            <button
              className={period === "30d" ? "active" : ""}
              onClick={() => setPeriod("30d")}
            >
              30 Days
            </button>
            <button
              className={period === "90d" ? "active" : ""}
              onClick={() => setPeriod("90d")}
            >
              90 Days
            </button>
          </div>

          <div className="export-buttons">
            <button onClick={() => handleExport("sessions")}>
              📥 Export Sessions
            </button>
            <button onClick={() => handleExport("pageviews")}>
              📥 Export Page Views
            </button>
          </div>
        </div>
      </div>

      {/* Live Visitors */}
      <div className="live-visitors-banner">
        <div className="live-indicator">
          <span className="pulse"></span>
          <strong>{liveVisitors.count}</strong> visitors online now
        </div>
        <button onClick={fetchLiveVisitors} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {/* Overview Cards */}
      {analytics && (
        <>
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-value">{analytics.overview.totalSessions.toLocaleString()}</div>
                <div className="stat-label">Total Sessions</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✨</div>
              <div className="stat-content">
                <div className="stat-value">{analytics.overview.uniqueVisitors.toLocaleString()}</div>
                <div className="stat-label">Unique Visitors</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📄</div>
              <div className="stat-content">
                <div className="stat-value">{analytics.overview.totalPageViews.toLocaleString()}</div>
                <div className="stat-label">Page Views</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <div className="stat-value">{formatDuration(analytics.overview.avgSessionDuration)}</div>
                <div className="stat-label">Avg. Session</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">{analytics.overview.avgPageViewsPerSession}</div>
                <div className="stat-label">Pages/Session</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">↩️</div>
              <div className="stat-content">
                <div className="stat-value">{analytics.overview.bounceRate}%</div>
                <div className="stat-label">Bounce Rate</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="analytics-tabs">
            <button
              className={activeTab === "overview" ? "active" : ""}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={activeTab === "pages" ? "active" : ""}
              onClick={() => setActiveTab("pages")}
            >
              Top Pages
            </button>
            <button
              className={activeTab === "geography" ? "active" : ""}
              onClick={() => setActiveTab("geography")}
            >
              Geography
            </button>
            <button
              className={activeTab === "technology" ? "active" : ""}
              onClick={() => setActiveTab("technology")}
            >
              Technology
            </button>
            <button
              className={activeTab === "sources" ? "active" : ""}
              onClick={() => setActiveTab("sources")}
            >
              Traffic Sources
            </button>
            <button
              className={activeTab === "live" ? "active" : ""}
              onClick={() => setActiveTab("live")}
            >
              Live Sessions
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "overview" && (
              <div className="overview-charts">
                <div className="chart-card">
                  <h3>Sessions Over Time</h3>
                  <div className="timeline-chart">
                    {analytics.sessionsByDay.map((day, index) => (
                      <div key={index} className="timeline-bar">
                        <div
                          className="bar"
                          style={{
                            height: `${(day.sessions / Math.max(...analytics.sessionsByDay.map(d => d.sessions))) * 100}%`
                          }}
                          title={`${day.date}: ${day.sessions} sessions`}
                        ></div>
                        <div className="bar-label">{new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-card">
                  <h3>Recent Sessions</h3>
                  <div className="sessions-table">
                    <table>
                      <thead>
                        <tr>
                          <th>IP Address</th>
                          <th>Location</th>
                          <th>Browser</th>
                          <th>First Seen</th>
                          <th>Pages</th>
                          <th>Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.recentSessions.slice(0, 10).map((session, index) => (
                          <tr key={index}>
                            <td>{session.ipAddress}</td>
                            <td>{session.location?.country || 'Unknown'}</td>
                            <td>{session.userAgent.browser}</td>
                            <td>{formatDate(session.firstSeen)}</td>
                            <td>{session.pageViews}</td>
                            <td>{formatDuration(session.duration)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "pages" && (
              <div className="pages-list">
                <h3>Top Pages</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Page</th>
                      <th>Views</th>
                      <th>Avg. Time</th>
                      <th>Avg. Scroll</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topPages.map((page, index) => (
                      <tr key={index}>
                        <td>{page.path}</td>
                        <td>{page.views.toLocaleString()}</td>
                        <td>{formatDuration(page.avgTimeOnPage)}</td>
                        <td>{page.avgScrollDepth}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "geography" && (
              <div className="geography-stats">
                <h3>Top Countries</h3>
                <div className="country-list">
                  {analytics.topCountries.map((country, index) => (
                    <div key={index} className="country-item">
                      <div className="country-name">{country.country}</div>
                      <div className="country-bar">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${(country.count / analytics.topCountries[0].count) * 100}%`
                          }}
                        ></div>
                      </div>
                      <div className="country-count">{country.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "technology" && (
              <div className="technology-stats">
                <div className="tech-section">
                  <h3>Browsers</h3>
                  <div className="tech-list">
                    {analytics.browserStats.map((browser, index) => (
                      <div key={index} className="tech-item">
                        <span>{browser.browser}</span>
                        <span className="tech-count">{browser.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="tech-section">
                  <h3>Operating Systems</h3>
                  <div className="tech-list">
                    {analytics.osStats.map((os, index) => (
                      <div key={index} className="tech-item">
                        <span>{os.os}</span>
                        <span className="tech-count">{os.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="tech-section">
                  <h3>Devices</h3>
                  <div className="tech-list">
                    {analytics.deviceStats.map((device, index) => (
                      <div key={index} className="tech-item">
                        <span>{device.device || 'Desktop'}</span>
                        <span className="tech-count">{device.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "sources" && (
              <div className="sources-stats">
                <h3>Traffic Sources</h3>
                <div className="sources-list">
                  {analytics.referrerStats.map((source, index) => (
                    <div key={index} className="source-item">
                      <div className="source-name">{source.source}</div>
                      <div className="source-bar">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${(source.count / analytics.referrerStats[0].count) * 100}%`
                          }}
                        ></div>
                      </div>
                      <div className="source-count">{source.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "live" && (
              <div className="live-sessions">
                <h3>Live Sessions ({liveVisitors.count})</h3>
                <table>
                  <thead>
                    <tr>
                      <th>IP Address</th>
                      <th>Location</th>
                      <th>Browser</th>
                      <th>Last Seen</th>
                      <th>Pages</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveVisitors.sessions.map((session, index) => (
                      <tr key={index}>
                        <td>{session.ipAddress}</td>
                        <td>{session.location?.country || 'Unknown'}</td>
                        <td>{session.userAgent.browser}</td>
                        <td>{formatDate(session.lastSeen)}</td>
                        <td>{session.pageViews}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VisitorAnalytics;
