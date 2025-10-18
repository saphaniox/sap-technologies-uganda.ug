import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { HelmetProvider } from "./utils/helmet.jsx"
import "./styles/index.css"
import App from "./App.jsx"
import { ThemeProvider } from "./contexts/ThemeContext.jsx"
import { renderKeepAlive } from "./services/keepAlive.js"

// Start keep-alive service to prevent Render free tier server from sleeping
renderKeepAlive.start()

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </HelmetProvider>
    </BrowserRouter>
  </StrictMode>,
)
