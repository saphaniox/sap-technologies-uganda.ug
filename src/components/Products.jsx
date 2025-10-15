/**
 * Products Component
 * 
 * Displays our key products with detailed specifications and features.
 * Features include:
 * - Product catalog with images and descriptions
 * - Category filtering system
 * - Technical specifications display
 * - Product inquiry form integration
 * - Availability status indicators
 * - Price and tag information
 * 
 * @component
 */
import React, { useState, useEffect } from "react";
import apiService from "../services/api";
import ProductInquiryForm from "./ProductInquiryForm";
import { LoadingOverlay } from "../utils/alerts.jsx";
import { getImageUrl, PLACEHOLDERS } from "../utils/imageUrl";
import "../styles/Products.css";

const Products = () => {
    /**
     * Product Data State
     */
    // Array of products fetched from API
    const [products, setProducts] = useState([]);
    // Loading indicator for data fetching
    const [loading, setLoading] = useState(true);
    // Error message if API fails
    const [error, setError] = useState("");
    
    /**
     * Filter and Selection State
     */
    // Currently selected category filter ("all" or category ID)
    const [selectedCategory, setSelectedCategory] = useState("all");
    // Product selected for inquiry form
    const [selectedProduct, setSelectedProduct] = useState(null);
    // Controls inquiry form modal visibility
    const [showInquiryForm, setShowInquiryForm] = useState(false);
    // Available product categories with counts
    const [categories, setCategories] = useState([]);

    /**
     * Load products and categories on component mount
     */
    useEffect(() => {
        /**
         * Fetch Products and Categories
         * Loads all products and available categories from API
         */
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productsResponse, categoriesResponse] = await Promise.all([
                    apiService.request("/api/products"),  // Get all products
                    apiService.request("/api/products/categories")
                ]);

                if (productsResponse.status === "success") {
                    setProducts(productsResponse.data.products);
                }

                if (categoriesResponse.status === "success") {
                    setCategories(categoriesResponse.data.categories);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                setError("Failed to load products. Please refresh the page.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    /**
     * Filter Products by Category
     * Fetches products based on selected category or shows all
     */
    const handleCategoryFilter = async (category) => {
        try {
            setLoading(true);
            setSelectedCategory(category);
            
            const endpoint = category === "all" 
                ? "/api/products"  // Get all products, no limit
                : `/api/products?category=${encodeURIComponent(category)}`;
            
            const response = await apiService.request(endpoint);
            
            if (response.status === "success") {
                setProducts(response.data.products);
            }
        } catch (error) {
            console.error("Error filtering products:", error);
            setError("Failed to filter products. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Open inquiry form for selected product
     */
    const handleInquiry = (product) => {
        setSelectedProduct(product);
        setShowInquiryForm(true);
    };

    /**
     * Close inquiry form modal
     */
    const handleCloseInquiryForm = () => {
        setShowInquiryForm(false);
        setSelectedProduct(null);
    };

    /**
     * Submit product inquiry to backend API
     */
    const handleSubmitInquiry = async (inquiryData) => {
        try {
            const response = await apiService.submitProductInquiry(inquiryData);
            console.log("✅ Inquiry submitted successfully", response);
            return response;
        } catch (error) {
            console.error("❌ Error submitting inquiry:", error);
            console.error("Error details:", {
                message: error.message,
                response: error.response,
                stack: error.stack
            });
            throw error;
        }
    };

    if (loading) {
        return <LoadingOverlay message="Loading products..." />;
    }

    if (error) {
        return (
            <section className="products-section" id="products">
                <div className="container">
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="products-section" id="products">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Our Key Products</h2>
                    <p className="section-subtitle">
                        Discover our innovative solutions designed to transform your business
                    </p>
                </div>

                {/* Category Filter */}
                <div className="category-filter">
                    <button 
                        className={`filter-btn ${selectedCategory === "all" ? "active" : ""}`}
                        onClick={() => handleCategoryFilter("all")}
                    >
                        All Products
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category._id}
                            className={`filter-btn ${selectedCategory === category._id ? "active" : ""}`}
                            onClick={() => handleCategoryFilter(category._id)}
                        >
                            {category._id} ({category.count})
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                <div className="products-grid">
                    {products.length === 0 ? (
                        <div className="no-products">
                            <p>No products available in this category.</p>
                        </div>
                    ) : (
                        products.map((product) => (
                            <div key={product._id} className="product-card">
                                <div className="product-image">
                                    <img 
                                        src={getImageUrl(product.image) || PLACEHOLDERS.product} 
                                        alt={product.name}
                                        onError={(e) => {
                                            if (!e.target.dataset.errorHandled) {
                                                e.target.dataset.errorHandled = 'true';
                                                e.target.src = PLACEHOLDERS.error;
                                            }
                                        }}
                                    />
                                    {product.isFeatured && (
                                        <div className="featured-badge">Featured</div>
                                    )}
                                    <div className="product-overlay">
                                        <button 
                                            className="new-inquiry-btn"
                                            onClick={() => handleInquiry(product)}
                                        >
                                            📨 Inquire Now
                                        </button>
                                    </div>
                                </div>

                                <div className="product-content">
                                    <div className="product-category">{product.category}</div>
                                    <h3 className="product-name">{product.name}</h3>
                                    <p className="product-description">{product.shortDescription}</p>
                                    
                                    {/* Technical Specs Preview */}
                                    {product.technicalSpecs && product.technicalSpecs.length > 0 && (
                                        <div className="tech-specs-preview">
                                            <h4>Key Specifications:</h4>
                                            <ul>
                                                {product.technicalSpecs.slice(0, 3).map((spec, index) => (
                                                    <li key={index}>
                                                        <strong>{spec.name}:</strong> {spec.value}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Features Preview */}
                                    {product.features && product.features.length > 0 && (
                                        <div className="features-preview">
                                            <h4>Key Features:</h4>
                                            <ul>
                                                {product.features.slice(0, 3).map((feature, index) => (
                                                    <li key={index}>{feature}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="product-footer">
                                        <div className="product-price">
                                            {(() => {
                                                // Handle price display based on type
                                                if (!product.price || product.price.type === "contact-for-price") {
                                                    return "Contact for Price";
                                                }
                                                
                                                const amount = product.price.amount;
                                                const currency = product.price.currency;
                                                const type = product.price.type;
                                                
                                                // Format the price with currency
                                                let formattedPrice = "";
                                                if (amount && currency) {
                                                    // Format number with commas
                                                    const formattedAmount = parseFloat(amount).toLocaleString('en-US', {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 2
                                                    });
                                                    formattedPrice = `${currency} ${formattedAmount}`;
                                                }
                                                
                                                // Add negotiable indicator
                                                if (type === "negotiable") {
                                                    return formattedPrice ? `${formattedPrice} (Negotiable)` : "Negotiable";
                                                }
                                                
                                                return formattedPrice || "Contact for Price";
                                            })()}
                                        </div>
                                        <div className="product-availability">
                                            <span className={`availability-status ${product.availability}`}>
                                                {product.availability === "in-stock" && "✅ In Stock"}
                                                {product.availability === "pre-order" && "📋 Pre-Order"}
                                                {product.availability === "custom-order" && "🔧 Custom Order"}
                                                {product.availability === "discontinued" && "❌ Discontinued"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {product.tags && product.tags.length > 0 && (
                                        <div className="product-tags">
                                            {product.tags.map((tag, index) => (
                                                <span key={index} className="product-tag">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Call to Action */}
                <div className="products-cta">
                    <p>Need a custom solution? We'd love to help!</p>
                    <button 
                        className="new-cta-btn"
                        onClick={() => {
                            const contactSection = document.getElementById("contact");
                            if (contactSection) {
                                contactSection.scrollIntoView({ behavior: "smooth" });
                            }
                        }}
                    >
                        📞 Contact Us
                    </button>
                </div>
            </div>

            {/* Inquiry Form Modal */}
            {showInquiryForm && selectedProduct && (
                <ProductInquiryForm
                    product={selectedProduct}
                    onClose={handleCloseInquiryForm}
                    onSubmit={handleSubmitInquiry}
                />
            )}
        </section>
    );
};

export default Products;