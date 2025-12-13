import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/SeasonalGreeting.css";

const SeasonalGreeting = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [showSnowflakes, setShowSnowflakes] = useState(true);

  // Create snowflakes
  const snowflakes = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 3 + 5}s`,
    animationDelay: `${Math.random() * 5}s`,
    fontSize: `${Math.random() * 10 + 10}px`,
  }));

  // Auto-hide after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="seasonal-greeting-wrapper"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="seasonal-greeting">
            {/* Snowflakes Animation */}
            {showSnowflakes && (
              <div className="snowflakes" aria-hidden="true">
                {snowflakes.map((flake) => (
                  <div
                    key={flake.id}
                    className="snowflake"
                    style={{
                      left: flake.left,
                      animationDuration: flake.animationDuration,
                      animationDelay: flake.animationDelay,
                      fontSize: flake.fontSize,
                    }}
                  >
                    ❄
                  </div>
                ))}
              </div>
            )}

            {/* Close Button */}
            <button
              className="seasonal-close-btn"
              onClick={handleClose}
              aria-label="Close greeting"
            >
              ×
            </button>

            {/* Main Content */}
            <div className="seasonal-content">
              {/* Decorative Elements */}
              <div className="seasonal-decorations">
                <span className="decoration">🎄</span>
                <span className="decoration">✨</span>
                <span className="decoration">🎅</span>
              </div>

              {/* Greeting Text */}
              <motion.div
                className="seasonal-text"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              >
                <h2 className="seasonal-title">
                  🎄 Merry Christmas! 🎄
                </h2>
                <p className="seasonal-subtitle">
                  & Happy New Year 2026!
                </p>
              </motion.div>

              {/* Message */}
              <motion.p
                className="seasonal-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                Wishing you and your loved ones a joyful holiday season filled with peace, 
                prosperity, and endless possibilities. Thank you for being part of our journey!
              </motion.p>

              {/* Decorative Bottom */}
              <div className="seasonal-decorations bottom">
                <span className="decoration">🎁</span>
                <span className="decoration">⭐</span>
                <span className="decoration">🎊</span>
              </div>

              {/* From SAP Technologies */}
              <motion.div
                className="seasonal-from"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                <p>— From all of us at <strong>SAP Technologies</strong> 💚</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SeasonalGreeting;
