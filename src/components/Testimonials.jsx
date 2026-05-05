import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../utils/animations";
import "../styles/Testimonials.css";

const testimonials = [
  {
    name: "John Kizito",
    company: "Kizito Enterprises, Kampala",
    rating: 5,
    text: "SAPTech Uganda built our business management system from scratch. The quality exceeded our expectations and their support team is always available. Highly recommended!",
    avatar: "JK"
  },
  {
    name: "Grace Nakibuule",
    company: "GN Fashion House, Entebbe",
    rating: 5,
    text: "The website they designed for us is stunning and professional. Our online sales increased by over 60% within the first two months. Outstanding work!",
    avatar: "GN"
  },
  {
    name: "David Ochieng",
    company: "Ochieng Tech Solutions, Jinja",
    rating: 5,
    text: "Their electrical engineering team delivered our industrial automation project on time and within budget. Technical expertise at its finest.",
    avatar: "DO"
  },
  {
    name: "Fatuma Nantongo",
    company: "Nantongo Retail Group, Kampala",
    rating: 5,
    text: "From branding to software development, SAPTech Uganda handled everything seamlessly. They truly understand what businesses in Uganda need.",
    avatar: "FN"
  }
];

const StarRating = ({ count }) => (
  <div className="star-rating" aria-label={`${count} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < count ? "star filled" : "star"}>★</span>
    ))}
  </div>
);

const Testimonials = () => {
  const [active, setActive] = useState(0);

  const prev = () => setActive((a) => (a === 0 ? testimonials.length - 1 : a - 1));
  const next = () => setActive((a) => (a === testimonials.length - 1 ? 0 : a + 1));

  const t = testimonials[active];

  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <motion.h2
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          What Our Clients Say
        </motion.h2>
        <motion.p
          className="testimonials-subtitle"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          Real feedback from businesses we&apos;ve empowered across Uganda and beyond.
        </motion.p>

        <motion.div
          className="testimonials-carousel"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div
            key={active}
            className="testimonial-card"
            variants={fadeInUp}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
          >
            <div className="testimonial-quote">&ldquo;</div>
            <p className="testimonial-text">{t.text}</p>
            <StarRating count={t.rating} />
            <div className="testimonial-author">
              <div className="testimonial-avatar">{t.avatar}</div>
              <div className="testimonial-meta">
                <strong>{t.name}</strong>
                <span>{t.company}</span>
              </div>
            </div>
          </motion.div>

          <div className="testimonials-nav">
            <button className="nav-btn" onClick={prev} aria-label="Previous testimonial">&#8592;</button>
            <div className="testimonials-dots">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`dot${i === active ? " active" : ""}`}
                  onClick={() => setActive(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button className="nav-btn" onClick={next} aria-label="Next testimonial">&#8594;</button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
