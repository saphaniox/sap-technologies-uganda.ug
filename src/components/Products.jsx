import React, { useState, useEffect } from "react";
import apiService from "../services/api";
import ProductInquiryForm from "./ProductInquiryForm";
import ProductForm from "./ProductForm";
import ConfirmDialog from "./ConfirmDialog";
import ImageSlider from "./ImageSlider";
import { LoadingOverlay, showAlert } from "../utils/alerts.jsx";
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
     * Admin State Management
     */
    // Current user (to check admin role)
    const [user, setUser] = useState(null);
    // Controls product form modal visibility (admin)
    const [showProductForm, setShowProductForm] = useState(false);
    // Product being edited (admin)
    const [editingProduct, setEditingProduct] = useState(null);
    // Controls delete confirmation dialog
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    // Product selected for deletion
    const [productToDelete, setProductToDelete] = useState(null);
    // Admin statistics
    const [adminStats, setAdminStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);
    
    /**
     * WhatsApp Support Number
     */
    const WHATSAPP_NUMBER = "+256706564628";

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
        checkUserAuth();
    }, []);

    /**
     * Check if user is authenticated and is admin
     */
    const checkUserAuth = async () => {
        try {
            const currentUser = await apiService.getCurrentUser();
            setUser(currentUser);
            // If admin, fetch statistics
            if (currentUser && currentUser.role === "admin") {
                fetchAdminStats();
            }
        } catch {
            // User not authenticated, which is fine
            setUser(null);
        }
    };

    /**
     * Fetch Admin Statistics
     */
    const fetchAdminStats = async () => {
        try {
            setLoadingStats(true);
            const response = await apiService.getProductAnalytics();
            if (response.success) {
                setAdminStats(response.data);
            }
        } catch (error) {
            console.error("Error fetching admin stats:", error);
        } finally {
            setLoadingStats(false);
        }
    };

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

    /**
     * Admin Functions
     */
    // Refresh products list
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await apiService.request("/api/products");
            if (response.status === "success") {
                setProducts(response.data.products);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            setError("Failed to load products.");
        } finally {
            setLoading(false);
        }
    };

    // Handle edit product
    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowProductForm(true);
    };

    // Handle delete product
    const handleDelete = (product) => {
        setProductToDelete(product);
        setShowDeleteDialog(true);
    };

    // Confirm delete product
    const confirmDelete = async () => {
        if (!productToDelete) return;

        try {
            await apiService.deleteProduct(productToDelete._id);
            // Instantly remove from UI
            setProducts(prev => prev.filter(p => p._id !== productToDelete._id));
            setShowDeleteDialog(false);
            setProductToDelete(null);
            await showAlert.success("Product Deleted", "The product has been successfully deleted.");
            // Refresh in background to ensure data consistency
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
            await showAlert.error("Delete Failed", error.message || "Failed to delete product. Please try again.");
        }
    };

    // Cancel delete
    const cancelDelete = () => {
        setShowDeleteDialog(false);
        setProductToDelete(null);
    };

    // Handle product save success
    const handleProductSave = () => {
        fetchProducts();
        setShowProductForm(false);
        setEditingProduct(null);
    };

    /**
     * WhatsApp Contact Handler
     */
    const handleWhatsAppContact = (product) => {
        const message = encodeURIComponent(`Hi, I'm interested in ${product.name}. Can you provide more information?`);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${message}`;
        window.open(whatsappUrl, '_blank');
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
                {/* Admin Info Panel - Displayed at Top for Admins */}
                {user && user.role === "admin" && (
                    <div className="admin-info-panel" style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        padding: "20px",
                        borderRadius: "12px",
                        marginBottom: "30px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
                            <div>
                                <h3 style={{ margin: "0 0 10px 0", fontSize: "1.5rem" }}>👨‍💼 Admin Mode Active</h3>
                                <p style={{ margin: 0, opacity: 0.9 }}>Welcome back, {user.name}! You have full control over products.</p>
                            </div>
                            <button 
                                className="add-product-btn admin-btn"
                                onClick={() => {
                                    setEditingProduct(null);
                                    setShowProductForm(true);
                                }}
                                style={{
                                    background: "white",
                                    color: "#667eea",
                                    border: "none",
                                    padding: "12px 24px",
                                    borderRadius: "8px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    fontSize: "1rem",
                                    transition: "transform 0.2s"
                                }}
                                onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                                onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                            >
                                + Add Product
                            </button>
                        </div>
                        
                        {/* Admin Statistics */}
                        {adminStats && !loadingStats && (
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                                gap: "15px",
                                marginTop: "20px"
                            }}>
                                <div style={{
                                    background: "rgba(255,255,255,0.15)",
                                    padding: "15px",
                                    borderRadius: "8px",
                                    textAlign: "center"
                                }}>
                                    <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{adminStats.totalProducts || products.length}</div>
                                    <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Total Products</div>
                                </div>
                                <div style={{
                                    background: "rgba(255,255,255,0.15)",
                                    padding: "15px",
                                    borderRadius: "8px",
                                    textAlign: "center"
                                }}>
                                    <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{categories.length}</div>
                                    <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Categories</div>
                                </div>
                                <div style={{
                                    background: "rgba(255,255,255,0.15)",
                                    padding: "15px",
                                    borderRadius: "8px",
                                    textAlign: "center"
                                }}>
                                    <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{adminStats.featuredCount || products.filter(p => p.isFeatured).length}</div>
                                    <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Featured</div>
                                </div>
                                <div style={{
                                    background: "rgba(255,255,255,0.15)",
                                    padding: "15px",
                                    borderRadius: "8px",
                                    textAlign: "center"
                                }}>
                                    <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{adminStats.inStockCount || products.filter(p => p.availability === "in-stock").length}</div>
                                    <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>In Stock</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* User Info Badge - For logged-in non-admin users */}
                {user && user.role !== "admin" && (
                    <div style={{
                        background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                        color: "#333",
                        padding: "15px 20px",
                        borderRadius: "10px",
                        marginBottom: "20px",
                        textAlign: "center",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                    }}>
                        <span style={{ fontSize: "1.1rem" }}>👋 Welcome back, <strong>{user.name}</strong>!</span>
                    </div>
                )}

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
                        products.map((product) => {
                            // Get product images - support both single image and multiple images
                            const productImages = [];
                            if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                                // Multiple images
                                product.images.forEach(img => {
                                    const imageUrl = getImageUrl(typeof img === 'string' ? img : img.url);
                                    if (imageUrl) productImages.push(imageUrl);
                                });
                            } else if (product.image) {
                                // Single image (legacy)
                                const imageUrl = getImageUrl(product.image);
                                if (imageUrl) productImages.push(imageUrl);
                            }
                            
                            // Fallback to placeholder if no images
                            if (productImages.length === 0) {
                                productImages.push(PLACEHOLDERS.product);
                            }
                            
                            return (
                            <div key={product._id} className="product-card">
                                <div className="product-image">
                                    <ImageSlider images={productImages} alt={product.name} />
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
                                        <button 
                                            className="whatsapp-btn"
                                            onClick={() => handleWhatsAppContact(product)}
                                            title="Contact us on WhatsApp"
                                        >
                                            💬 WhatsApp
                                        </button>
                                    </div>
                                    
                                    {/* Admin Controls */}
                                    {user && user.role === "admin" && (
                                        <div className="admin-controls">
                                            <button 
                                                className="edit-btn"
                                                onClick={() => handleEdit(product)}
                                                title="Edit Product"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                className="delete-btn"
                                                onClick={() => handleDelete(product)}
                                                title="Delete Product"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}
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
                        );
                        })
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

            {/* Product Form Modal (Admin) */}
            {showProductForm && (
                <ProductForm 
                    isOpen={showProductForm}
                    product={editingProduct}
                    onClose={() => {
                        setShowProductForm(false);
                        setEditingProduct(null);
                    }}
                    onSave={handleProductSave}
                />
            )}

            {/* Delete Confirmation Dialog (Admin) */}
            {showDeleteDialog && (
                <ConfirmDialog
                    isOpen={showDeleteDialog}
                    title="Delete Product"
                    message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                    confirmText="Delete"
                    cancelText="Cancel"
                    type="danger"
                />
            )}
        </section>
    );
};

export default Products;