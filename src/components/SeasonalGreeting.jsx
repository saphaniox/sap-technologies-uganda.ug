import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/SeasonalGreeting.css";

const SeasonalGreeting = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentMonth] = useState(new Date().getMonth()); // 0 = January, 11 = December

  // Determine greeting type based on season
  const isDecember = currentMonth === 11; // December - Christmas
  const isEasterSeason = currentMonth >= 2 && currentMonth <= 3; // Mar-April - Easter season

  // Auto-hide after 15 seconds
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
                {isDecember ? (
                  <>
                    <span className="decoration">🎄</span>
                    <span className="decoration">⭐</span>
                    <span className="decoration">🎁</span>
                  </>
                ) : isEasterSeason ? (
                  <>
                    <span className="decoration">🐣</span>
                    <span className="decoration">🌸</span>
                    <span className="decoration">✨</span>
                  </>
                ) : (
                  <>
                    <span className="decoration">💡</span>
                    <span className="decoration">🚀</span>
                    <span className="decoration">📱</span>
                  </>
                )}
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
                {isDecember ? (
                  <>
                    <h2 className="seasonal-title">
                      🎄 Merry Christmas & Happy New Year! 🎉
                    </h2>
                    <p className="seasonal-subtitle">
                      Wishing You Joy, Success, and Innovation in the Coming Year!
                    </p>
                  </>
                ) : isEasterSeason ? (
                  <>
                    <h2 className="seasonal-title">
                      ✝️ Happy Easter! 🐣
                    </h2>
                    <p className="seasonal-subtitle">
                      Wishing Our People, Friends, and Family a Wonderful Easter Celebration
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="seasonal-title">
                      🚀 Exciting New Launches! 🚀
                    </h2>
                    <p className="seasonal-subtitle">
                      SAP Smart Home System & SAP Business Management Software
                    </p>
                  </>
                )}
              </motion.div>

              {/* Message */}
              <motion.p
                className="seasonal-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                {isDecember ? (
                  <>
                    As we celebrate this wonderful season, we extend our warmest wishes to you and your loved ones.
                    May this festive period bring you joy, prosperity, and success.
                    Thank you for your continued trust and partnership throughout the year.
                    Here's to a bright and innovative New Year ahead!
                  </>
                ) : isEasterSeason ? (
                  <>
                    To all our people, friends, and family, we wish you a wonderful Easter filled with peace, joy, hope, and love.
                    May this beautiful season renew your spirit, strengthen your faith, and bring you closer to everyone you cherish.
                    Thank you for being part of our journey and community. Happy Easter from all of us at SapTech Uganda!
                  </>
                ) : (
                  <>
                    We're excited to announce the launch of our SAP Smart Home System and SAP Business Management Software!
                    These innovative solutions are designed to enhance your home automation and streamline your business operations.
                    Stay tuned for more details and thank you for being part of our journey!
                  </>
                )}
              </motion.p>

              {/* Decorative Bottom */}
              <div className="seasonal-decorations bottom">
                {isDecember ? (
                  <>
                    <span className="decoration">🎅</span>
                    <span className="decoration">🔔</span>
                    <span className="decoration">❄️</span>
                  </>
                ) : isEasterSeason ? (
                  <>
                    <span className="decoration">🐰</span>
                    <span className="decoration">🙏</span>
                    <span className="decoration">✝️</span>
                  </>
                ) : (
                  <>
                    <span className="decoration">🏠</span>
                    <span className="decoration">💼</span>
                    <span className="decoration">📊</span>
                  </>
                )}
              </div>

              {/* From SapTech Uganda */}
              <motion.div
                className="seasonal-from"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                <p>— From all of us at <strong>SapTech Uganda</strong> 💚</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SeasonalGreeting;

