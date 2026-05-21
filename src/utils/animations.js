import AOS from 'aos';
import 'aos/dist/aos.css';

let revealObserver = null;
let motionMutationObserver = null;
let decorateTimer = null;

const EXCLUDED_MOTION_AREAS = [
  '.admin-modal',
  '.auth-modal',
  '.forgot-password-modal',
  '.legal-modal',
  '.cart-sidebar',
  '.photo-lightbox',
  '.swal2-container',
  '.cookie-consent'
].join(', ');

const REVEAL_SELECTORS = [
  'main > section:not(.hero)',
  'main section .section-header',
  'main section h2',
  'main section .section-subtitle',
  'main .about-text',
  'main .about-visual',
  'main .services-list',
  'main .portfolio-grid',
  'main .partners-grid',
  'main .products-grid',
  'main .testimonials-container',
  'main .contact-info',
  'main .contact-form',
  'main .coming-soon-roadmap',
  'footer .footer-section'
];

const STAGGER_CONTAINERS = [
  '.services-list',
  '.portfolio-grid',
  '.partners-grid',
  '.products-grid',
  '.team-grid',
  '.mvv-grid',
  '.stats-grid',
  '.roadmap-items',
  '.contact-items'
];

const CARD_SELECTORS = [
  'main .service',
  'main .portfolio-card',
  'main .partner-card',
  'main .product-card',
  'main .testimonial-card',
  'main .mvv-card',
  'main .team-member',
  'main .stat-item',
  'main .contact-item',
  'main .roadmap-item'
];

const MEDIA_SELECTORS = [
  'main .service-image',
  'main .portfolio-image',
  'main .product-image',
  'main .member-image',
  'main .image-slider',
  'main .partner-logo',
  'main .company-img'
];

const ACTION_SELECTORS = [
  'main button',
  'main .btn',
  'main a[class*="btn"]',
  'main .company-link',
  'footer a',
  'footer button'
];

const isMotionExcluded = (element) => {
  return element.closest(EXCLUDED_MOTION_AREAS);
};

const isElementInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
};

const observeRevealElement = (element) => {
  if (!element || isMotionExcluded(element)) return;
  if (element.dataset.sapMotionReveal === 'true') return;

  element.dataset.sapMotionReveal = 'true';
  element.classList.add('sap-reveal');

  if (isElementInViewport(element)) {
    element.classList.add('sap-in-view');
    return;
  }

  revealObserver?.observe(element);
};

const decorateCollection = (root, selector, className) => {
  root.querySelectorAll(selector).forEach((element) => {
    if (isMotionExcluded(element)) return;
    element.classList.add(className);
  });
};

const decorateProfessionalMotion = (root = document) => {
  if (typeof window === 'undefined' || respectsReducedMotion()) return;

  REVEAL_SELECTORS.forEach((selector) => {
    root.querySelectorAll(selector).forEach(observeRevealElement);
  });

  STAGGER_CONTAINERS.forEach((selector) => {
    root.querySelectorAll(selector).forEach((container) => {
      if (isMotionExcluded(container)) return;

      Array.from(container.children).forEach((child, index) => {
        if (!(child instanceof HTMLElement)) return;
        if (isMotionExcluded(child)) return;

        child.style.setProperty('--sap-reveal-delay', `${Math.min(index, 6) * 70}ms`);
        observeRevealElement(child);
      });
    });
  });

  CARD_SELECTORS.forEach((selector) => decorateCollection(root, selector, 'sap-motion-card'));
  MEDIA_SELECTORS.forEach((selector) => decorateCollection(root, selector, 'sap-motion-media'));
  ACTION_SELECTORS.forEach((selector) => decorateCollection(root, selector, 'sap-motion-action'));
};

const queueMotionDecoration = () => {
  window.clearTimeout(decorateTimer);
  decorateTimer = window.setTimeout(() => {
    decorateProfessionalMotion(document);
    refreshAnimations();
  }, 120);
};

const initializeProfessionalMotion = () => {
  if (typeof window === 'undefined') return;

  document.documentElement.classList.add('sap-motion-ready');

  if (respectsReducedMotion()) {
    document.documentElement.classList.add('sap-motion-reduced');
    return;
  }

  revealObserver?.disconnect();
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('sap-in-view');
      revealObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.14,
    rootMargin: '0px 0px -8% 0px'
  });

  decorateProfessionalMotion(document);

  motionMutationObserver?.disconnect();
  motionMutationObserver = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.addedNodes.length > 0)) {
      queueMotionDecoration();
    }
  });

  motionMutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
};

// Initialize AOS with custom settings
export const initializeAnimations = () => {
  AOS.init({
    duration: 750,
    easing: 'ease-out-cubic',
    once: true,
    mirror: false,
    anchorPlacement: 'top-bottom',
    offset: 90,
    delay: 0,
  });

  initializeProfessionalMotion();
};

// Refresh AOS when content changes
export const refreshAnimations = () => {
  AOS.refresh();
};

// Custom animation variants for Framer Motion
export const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 60,
    transition: { duration: 0.5 }
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

export const fadeInLeft = {
  hidden: { 
    opacity: 0, 
    x: -60,
    transition: { duration: 0.5 }
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

export const fadeInRight = {
  hidden: { 
    opacity: 0, 
    x: 60,
    transition: { duration: 0.5 }
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

export const scaleIn = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    transition: { duration: 0.5 }
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

export const slideInFromTop = {
  hidden: { 
    opacity: 0, 
    y: -60,
    transition: { duration: 0.5 }
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

export const slideInFromBottom = {
  hidden: { 
    opacity: 0, 
    y: 60,
    transition: { duration: 0.5 }
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

export const rotateIn = {
  hidden: { 
    opacity: 0, 
    rotate: -180,
    scale: 0.5,
    transition: { duration: 0.5 }
  },
  visible: { 
    opacity: 1, 
    rotate: 0,
    scale: 1,
    transition: { 
      duration: 1,
      ease: "easeOut"
    }
  }
};

export const bounceIn = {
  hidden: { 
    opacity: 0, 
    scale: 0.3,
    transition: { duration: 0.5 }
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.8,
      type: "spring",
      damping: 10,
      stiffness: 100
    }
  }
};

// Hover animations
export const cardHover = {
  rest: { 
    scale: 1, 
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  hover: { 
    scale: 1.05, 
    y: -10,
    transition: { 
      duration: 0.3, 
      ease: "easeOut",
      type: "spring",
      stiffness: 300
    }
  }
};

export const buttonHover = {
  rest: { 
    scale: 1,
    transition: { duration: 0.2 }
  },
  hover: { 
    scale: 1.1,
    transition: { 
      duration: 0.2,
      type: "spring",
      stiffness: 400
    }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

export const scaleHover = {
  rest: { 
    scale: 1,
    transition: { duration: 0.3 }
  },
  hover: { 
    scale: 1.05,
    transition: { 
      duration: 0.3,
      type: "spring",
      stiffness: 300
    }
  }
};

export const iconSpin = {
  rest: { 
    rotate: 0,
    transition: { duration: 0.5 }
  },
  hover: { 
    rotate: 360,
    transition: { 
      duration: 0.8,
      ease: "easeInOut"
    }
  }
};

// Loading animations
export const pulseAnimation = {
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const spinAnimation = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Text animations
export const typewriterAnimation = {
  hidden: { width: 0 },
  visible: {
    width: "100%",
    transition: {
      duration: 2,
      ease: "easeInOut"
    }
  }
};

export const letterAnimation = {
  hidden: { 
    opacity: 0,
    y: 50
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

// Page transition animations
export const pageTransition = {
  hidden: { 
    opacity: 0,
    x: -200,
    transition: { duration: 0.5 }
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: { 
      duration: 0.8,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    x: 200,
    transition: { 
      duration: 0.5,
      ease: "easeIn"
    }
  }
};

// Performance optimized animations for mobile
export const reduceMotionVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

// Check if user prefers reduced motion
export const respectsReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get appropriate animation variant based on user preference
export const getAnimationVariant = (normalVariant, reducedVariant = reduceMotionVariants) => {
  return respectsReducedMotion() ? reducedVariant : normalVariant;
};
