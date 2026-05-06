import React, { useState, useEffect, useRef } from "react";
import apiService from "../services/api";
import { useCart } from "../contexts/CartContext";
import ProductInquiryForm from "./ProductInquiryForm";
import ProductForm from "./ProductForm";
import ConfirmDialog from "./ConfirmDialog";
import ImageSlider from "./ImageSlider";
import { LoadingOverlay, showAlert } from "../utils/alerts.jsx";
import { getImageUrl, PLACEHOLDERS } from "../utils/imageUrl";
import { humanizeError } from "../utils/errorMessages";
import "../styles/Products.css";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showInquiryForm, setShowInquiryForm] = useState(false);
    const [categories, setCategories] = useState([]);
    const [user, setUser] = useState(null);
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [adminStats, setAdminStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const { addToCart, isInCart, openCart } = useCart();

    // Cache of all products — never overwritten between category switches
    const allProductsRef = useRef([]);
    
    const WHATSAPP_NUMBER = "+256706564628";

    /**
     * Load products and categories on component mount
     */
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productsResponse, categoriesResponse] = await Promise.all([
                    apiService.request("/api/products?limit=500"),
                    apiService.request("/api/products/categories")
                ]);

                if (productsResponse.status === "success") {
                    allProductsRef.current = productsResponse.data.products;
                    setProducts(productsResponse.data.products);
                }

                if (categoriesResponse.status === "success") {
                    setCategories(categoriesResponse.data.categories);
                }
            } catch (error) {
                setError("We're having trouble loading products right now. Please refresh the page and try again.");
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
            if (currentUser && currentUser.role === "admin") {
                fetchAdminStats();
            }
        } catch {
            // User not authenticated, which is fine
            setUser(null);
        }
    };

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

    const applyFilters = (all, category, search) => {
        let filtered = all;
        if (category && category !== "all") {
            filtered = filtered.filter((p) => p.category === category);
        }
        if (search && search.trim().length > 0) {
            const q = search.trim().toLowerCase();
            filtered = filtered.filter((p) =>
                p.name?.toLowerCase().includes(q) ||
                p.shortDescription?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q) ||
                p.tags?.some((t) => t.toLowerCase().includes(q))
            );
        }
        return filtered;
    };

    const handleCategoryFilter = (category) => {
        setSelectedCategory(category);
        setProducts(applyFilters(allProductsRef.current, category, searchTerm));
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        setProducts(applyFilters(allProductsRef.current, selectedCategory, val));
    };

    const handleInquiry = (product) => {
        setSelectedProduct(product);
        setShowInquiryForm(true);
    };

    const handleCloseInquiryForm = () => {
        setShowInquiryForm(false);
        setSelectedProduct(null);
    };

    const handleSubmitInquiry = async (inquiryData) => {
        try {
            const response = await apiService.submitProductInquiry(inquiryData);
            return response;
        } catch (error) {
            console.error("Error submitting inquiry:", error);
            throw error;
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await apiService.request("/api/products?limit=500");
            if (response.status === "success") {
                allProductsRef.current = response.data.products;
                setProducts(applyFilters(response.data.products, selectedCategory, searchTerm));
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            setError("Couldn't load the products. Please try again.");
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
            await showAlert.success("Product removed", "The product has been successfully deleted.");
            // Refresh in background to ensure data consistency
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
            const msg = error.message?.includes('404') ? "That product doesn't exist anymore." : "We couldn't delete that. Please try again.";
      await showAlert.error("Oops", msg);
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

                {/* Search Bar */}
                <div className="products-search-bar">
                    <span className="products-search-icon">🔍</span>
                    <input
                        type="text"
                        className="products-search-input"
                        placeholder="Search products by name, category, or keyword..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    {searchTerm && (
                        <button
                            className="products-search-clear"
                            onClick={() => { setSearchTerm(""); setProducts(applyFilters(allProductsRef.current, selectedCategory, "")); }}
                            aria-label="Clear search"
                        >
                            ✕
                        </button>
                    )}
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
                            {searchTerm ? (
                                <p>No products found matching "<strong>{searchTerm}</strong>". Try a different keyword.</p>
                            ) : (
                                <p>No products available in this category.</p>
                            )}
                        </div>
                    ) : (
                        products.map((product) => {
                            const productImages = [];
                            if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                                product.images.forEach(img => {
                                    const imageUrl = getImageUrl(typeof img === 'string' ? img : img.url);
                                    if (imageUrl) productImages.push(imageUrl);
                                });
                            } else if (product.image) {
                                const imageUrl = getImageUrl(product.image);
                                if (imageUrl) productImages.push(imageUrl);
                            }
                            
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
                                                if (!product.price || product.price.type === "contact-for-price") {
                                                    return "Contact for Price";
                                                }
                                                
                                                const amount = product.price.amount;
                                                const currency = product.price.currency;
                                                const type = product.price.type;
                                                
                                                let formattedPrice = "";
                                                if (amount && currency) {
                                                    const formattedAmount = parseFloat(amount).toLocaleString('en-US', {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 2
                                                    });
                                                    formattedPrice = `${currency} ${formattedAmount}`;
                                                }
                                                
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

                                    {/* Visible CTA buttons — always accessible including mobile */}
                                    {product.availability !== "discontinued" && (
                                        <div className="product-cta-row">
                                            <button
                                                className={`card-inquire-btn${isInCart(product._id) ? " in-cart" : ""}`}
                                                onClick={() => {
                                                    if (isInCart(product._id)) {
                                                        openCart();
                                                    } else {
                                                        addToCart(product);
                                                    }
                                                }}
                                            >
                                                {isInCart(product._id) ? "✓ View Cart" : "+ Add to Cart"}
                                            </button>
                                            <button
                                                className="card-whatsapp-btn"
                                                onClick={() => handleWhatsAppContact(product)}
                                                title="Chat on WhatsApp"
                                                aria-label="Chat on WhatsApp"
                                            >
                                                <svg viewBox="0 0 32 32" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.469 2.027 7.77L0 32l8.451-2.002A15.934 15.934 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm7.281 19.347c-.398-.2-2.354-1.162-2.72-1.295-.365-.133-.631-.2-.896.2-.267.398-1.029 1.295-1.262 1.562-.232.267-.465.3-.863.1-.398-.2-1.68-.62-3.2-1.976-1.183-1.056-1.98-2.36-2.213-2.758-.232-.4-.025-.615.175-.814.179-.178.398-.465.597-.697.2-.232.266-.399.399-.665.133-.267.067-.5-.033-.698-.1-.2-.896-2.16-1.228-2.96-.323-.777-.651-.672-.896-.683l-.763-.013c-.267 0-.698.1-1.064.5-.365.398-1.395 1.363-1.395 3.323s1.429 3.856 1.628 4.122c.2.267 2.812 4.294 6.815 6.023.953.412 1.696.658 2.275.842.956.304 1.826.261 2.514.158.767-.114 2.354-.963 2.687-1.893.333-.93.333-1.728.233-1.893-.1-.167-.365-.267-.763-.467z"/></svg>
                                            </button>
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