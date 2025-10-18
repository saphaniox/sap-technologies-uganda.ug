// Keep Render Backend Awake Service
// This pings the backend every 10 minutes to prevent it from sleeping

const BACKEND_URL = "https://sap-technologies-ug.onrender.com";
const PING_INTERVAL = 8 * 60 * 1000; // 8 minutes (safer margin before 15min sleep)

class RenderKeepAlive {
  constructor() {
    this.intervalId = null;
  }

  start() {
    console.log("🔄 Starting Render Keep-Alive service...");
    
    // Ping immediately
    this.ping();
    
    // Then ping every 10 minutes
    this.intervalId = setInterval(() => {
      this.ping();
    }, PING_INTERVAL);
  }

  async ping() {
    try {
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log("✅ Backend is awake:", new Date().toLocaleTimeString());
      } else {
        console.warn("⚠️ Backend responded but with error:", response.status);
      }
    } catch (error) {
      console.error("❌ Failed to ping backend:", error.message);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("🛑 Render Keep-Alive service stopped");
    }
  }
}

// Export singleton instance
export const renderKeepAlive = new RenderKeepAlive();
