// SEO Component for dynamic meta tags
import { useEffect } from 'react';

const SEO = ({ 
  title = "SAP Technologies Uganda | Professional IT Solutions & Digital Services",
  description = "SAP Technologies Uganda offers professional IT solutions, web development, mobile apps, cloud services, cybersecurity, and digital transformation.",
  keywords = "SAP Technologies, IT solutions Uganda, web development, mobile apps, cloud services",
  ogImage = "/images/logo2.jpg",
  url = window.location.href
}) => {
  useEffect(() => {
    // Update page title
    document.title = title;

    // Update meta description
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', keywords);

    // Update Open Graph tags
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:url', url);
    updateMetaTag('property', 'og:image', `${window.location.origin}${ogImage}`);

    // Update Twitter Card tags
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', `${window.location.origin}${ogImage}`);
  }, [title, description, keywords, ogImage, url]);

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

export default SEO;
