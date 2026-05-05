// SEO Component for dynamic meta tags
import { useEffect } from 'react';

const SEO = ({ 
  title = "SAPTech Uganda | Professional in Engineering & Technology solutions",
  description = "SAPTech Uganda offers professional IT solutions in engineering & technology — web development, mobile apps, cloud services, cybersecurity, and digital transformation.",
  keywords = "SAPTech Uganda, IT solutions Uganda, web development, mobile apps, Softwaredevelopment and cloud services",
  ogImage = "/images/logo2.jpg",
  url,
  ogType = "website",
  canonicalUrl,
  robots = "index, follow",
  structuredData = null
}) => {
  useEffect(() => {
    const resolvedUrl = url || window.location.href;
    const resolvedCanonical = canonicalUrl
      ? `${window.location.origin}${canonicalUrl}`
      : resolvedUrl;

    // Update page title
    document.title = title;

    // Update meta description
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', keywords);
    updateMetaTag('name', 'robots', robots);

    // Update Open Graph tags
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:url', resolvedUrl);
    updateMetaTag('property', 'og:image', `${window.location.origin}${ogImage}`);

    // Update Twitter Card tags
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', `${window.location.origin}${ogImage}`);

    // Keep canonical URL aligned with route
    updateLinkTag('canonical', resolvedCanonical);

    // Inject route-level structured data if provided
    updateStructuredData(structuredData);
  }, [title, description, keywords, ogImage, url, ogType, canonicalUrl, robots, structuredData]);

  return null;
};

// Helper function to update meta tags
const updateMetaTag = (attribute, key, content) => {
  let element = document.querySelector(`meta[${attribute}="${key}"]`);
  
  if (element) {
    element.setAttribute('content', content);
  } else {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    element.setAttribute('content', content);
    document.head.appendChild(element);
  }
};

const updateLinkTag = (rel, href) => {
  let element = document.querySelector(`link[rel="${rel}"]`);

  if (element) {
    element.setAttribute('href', href);
  } else {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    element.setAttribute('href', href);
    document.head.appendChild(element);
  }
};

const updateStructuredData = (structuredData) => {
  const existing = document.getElementById('dynamic-structured-data');

  if (!structuredData) {
    if (existing) existing.remove();
    return;
  }

  const script = existing || document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'dynamic-structured-data';
  script.text = JSON.stringify(structuredData);

  if (!existing) {
    document.head.appendChild(script);
  }
};

export default SEO;

