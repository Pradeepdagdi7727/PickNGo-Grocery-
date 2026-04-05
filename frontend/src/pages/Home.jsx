import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import client from '../api/client';
import { resolveImageSrc } from '../utils/imageHelper'


export default function Home() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await client.get('/customer/products');
        const data = Array.isArray(response.data.products) ? response.data.products : [];
        setProducts(data);
      } catch (err) {
        setError('Could not load products. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const isDiscountActive = (discount) => {
    if (!discount || discount.type === 'none' || !discount.value) return false;
    const now = new Date();
    const start = discount.startDate ? new Date(discount.startDate) : null;
    const end = discount.endDate ? new Date(discount.endDate) : null;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  };

  const getDiscountedPrice = (price, discount) => {
    if (!isDiscountActive(discount)) return price;
    const p = parseFloat(price) || 0;
    if (discount.type === 'percentage') return p * (1 - parseFloat(discount.value) / 100);
    if (discount.type === 'fixed') return Math.max(0, p - parseFloat(discount.value));
    return p;
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = category === 'all' || p.category === category;
      return matchSearch && matchCategory;
    });

    if (sortBy === 'price-low') result = [...result].sort((a, b) => getDiscountedPrice(a.price, a.discount) - getDiscountedPrice(b.price, b.discount));
    else if (sortBy === 'price-high') result = [...result].sort((a, b) => getDiscountedPrice(b.price, b.discount) - getDiscountedPrice(a.price, a.discount));
    else if (sortBy === 'discount') result = [...result].sort((a, b) => isDiscountActive(b.discount) - isDiscountActive(a.discount));
    else if (sortBy === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [searchTerm, category, products, sortBy]);

  const categories = useMemo(() => ['all', ...new Set(products.map(p => p.category).filter(Boolean))], [products]);
  const discountedCount = products.filter(p => isDiscountActive(p.discount)).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amazon+Ember:wght@400;700&display=swap');
        .home-amazon { font-family: 'Amazon Ember', 'Arial', sans-serif; background: #EAEDED; min-height: 100vh; }

        /* Hero */
        .hero-am {
          background: linear-gradient(135deg, #131921 0%, #232F3E 60%, #37475A 100%);
          color: white;
          padding: 40px 0 30px;
          margin-bottom: 0;
        }
        .hero-inner { max-width: 1500px; margin: 0 auto; padding: 0 20px; }
        .hero-am h1 { font-size: clamp(22px, 3vw, 32px); font-weight: 700; margin-bottom: 6px; letter-spacing: -0.3px; }
        .hero-am p { font-size: 15px; color: #aab; margin-bottom: 20px; }

        /* Search bar */
        .search-bar-am {
          display: flex;
          background: white;
          border-radius: 4px;
          overflow: hidden;
          max-width: 700px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .search-bar-am input {
          flex: 1;
          border: none;
          outline: none;
          padding: 11px 16px;
          font-size: 14px;
          color: #0F1111;
          font-family: 'Amazon Ember', Arial, sans-serif;
        }
        .search-bar-am button {
          background: #FF9900;
          border: none;
          padding: 0 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 700;
          color: #0F1111;
          font-family: 'Amazon Ember', Arial, sans-serif;
          transition: background 0.15s;
        }
        .search-bar-am button:hover { background: #e68a00; }
        .clear-search {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0 12px;
          color: #666;
          display: flex;
          align-items: center;
        }

        /* Content area */
        .content-am { max-width: 1500px; margin: 0 auto; padding: 16px 20px; display: flex; gap: 20px; }

        /* Sidebar */
        .sidebar-am {
          width: 220px;
          flex-shrink: 0;
        }
        .sidebar-section {
          background: white;
          border-radius: 4px;
          padding: 16px;
          margin-bottom: 12px;
          border: 1px solid #ddd;
        }
        .sidebar-title { font-size: 16px; font-weight: 700; color: #0F1111; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
        .cat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
          cursor: pointer;
          font-size: 13px;
          color: #333;
          transition: color 0.15s;
        }
        .cat-item:hover { color: #C7511F; }
        .cat-item.active { color: #C7511F; font-weight: 700; }
        .cat-dot { width: 8px; height: 8px; border-radius: 50%; background: #ddd; flex-shrink: 0; }
        .cat-item.active .cat-dot { background: #C7511F; }

        /* Main area */
        .main-am { flex: 1; min-width: 0; }

        /* Toolbar */
        .toolbar-am {
          background: #f3f3f3;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .result-count { font-size: 14px; color: #0F1111; }
        .result-count span { color: #C7511F; font-weight: 700; }
        .sort-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #0F1111;
        }
        .sort-select {
          border: 1px solid #888;
          border-radius: 3px;
          padding: 5px 28px 5px 10px;
          font-size: 13px;
          font-family: 'Amazon Ember', Arial, sans-serif;
          background: white;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23555' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
        }

        /* Deal banner */
        .deal-banner {
          background: linear-gradient(135deg, #232F3E, #37475A);
          color: white;
          border-radius: 4px;
          padding: 14px 20px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .deal-banner-left { display: flex; align-items: center; gap: 12px; }
        .deal-tag { background: #FF9900; color: #0F1111; font-weight: 800; font-size: 12px; padding: 3px 8px; border-radius: 3px; letter-spacing: 0.5px; }

        /* Product grid */
        .product-grid-am { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }

        /* Spinner */
        .spinner-wrap { display: flex; flex-direction: column; align-items: center; padding: 60px 0; }
        .spinner-am { width: 40px; height: 40px; border: 3px solid #ddd; border-top-color: #FF9900; border-radius: 50%; animation: spinam 0.7s linear infinite; }
        @keyframes spinam { to { transform: rotate(360deg); } }

        /* Empty */
        .empty-am { text-align: center; padding: 60px 20px; background: white; border-radius: 4px; border: 1px solid #ddd; }
        .empty-am h3 { font-size: 20px; color: #0F1111; margin-bottom: 8px; }
        .empty-am p { color: #565959; font-size: 14px; margin-bottom: 16px; }
        .btn-clear-am { background: #FF9900; border: none; border-radius: 20px; padding: 8px 20px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'Amazon Ember', Arial, sans-serif; }

        /* Responsive */
        @media (max-width: 768px) {
          .content-am { flex-direction: column; }
          .sidebar-am { width: 100%; }
          .product-grid-am { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
        }
      `}</style>

      <div className="home-amazon">
        {/* Hero */}
        <div className="hero-am">
          <div className="hero-inner">
            <h1>Welcome to PickNGo</h1>
            <p>Discover amazing products at unbeatable prices — Free delivery on all orders</p>
            <div className="search-bar-am">
              <input
                type="text"
                placeholder="Search products, brands and more..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none' }}>
                  <X size={16} />
                </button>
              )}
              <button>
                <Search size={18} />
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="content-am">
          {/* Sidebar */}
          <aside className="sidebar-am">
            <div className="sidebar-section">
              <div className="sidebar-title">Department</div>
              {categories.map(cat => (
                <div
                  key={cat}
                  className={`cat-item ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  <div className="cat-dot" />
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </div>
              ))}
            </div>

            {discountedCount > 0 && (
              <div className="sidebar-section">
                <div className="sidebar-title">Offers</div>
                <div
                  className={`cat-item ${sortBy === 'discount' ? 'active' : ''}`}
                  onClick={() => setSortBy(sortBy === 'discount' ? 'default' : 'discount')}
                >
                  <div className="cat-dot" />
                  Today's Deals ({discountedCount})
                </div>
              </div>
            )}

            <div className="sidebar-section">
              <div className="sidebar-title">Price</div>
              <div className={`cat-item ${sortBy === 'price-low' ? 'active' : ''}`} onClick={() => setSortBy('price-low')}>
                <div className="cat-dot" /> Low to High
              </div>
              <div className={`cat-item ${sortBy === 'price-high' ? 'active' : ''}`} onClick={() => setSortBy('price-high')}>
                <div className="cat-dot" /> High to Low
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="main-am">
            {/* Deal banner */}
            {discountedCount > 0 && (
              <div className="deal-banner">
                <div className="deal-banner-left">
                  <span className="deal-tag">🔥 DEALS</span>
                  <span style={{ fontSize: 14 }}>{discountedCount} products with special discounts today!</span>
                </div>
                <button
                  onClick={() => setSortBy('discount')}
                  style={{ background: '#FF9900', border: 'none', borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Amazon Ember, Arial' }}
                >
                  See all deals
                </button>
              </div>
            )}

            {/* Toolbar */}
            <div className="toolbar-am">
              <div className="result-count">
                {loading ? 'Loading...' : (
                  <>Showing <span>{filteredProducts.length}</span> results{searchTerm && ` for "${searchTerm}"`}</>
                )}
              </div>
              <div className="sort-wrap">
                <SlidersHorizontal size={14} />
                Sort by:
                <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="default">Featured</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="discount">Biggest Discount</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="spinner-wrap">
                <div className="spinner-am" />
                <p style={{ marginTop: 12, color: '#666', fontSize: 14 }}>Loading products...</p>
              </div>
            ) : error ? (
              <div className="empty-am">
                <h3>Something went wrong</h3>
                <p>{error}</p>
                <button className="btn-clear-am" onClick={() => window.location.reload()}>Try Again</button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-am">
                <h3>No results found</h3>
                <p>Try adjusting your search or filter to find what you're looking for.</p>
                <button className="btn-clear-am" onClick={() => { setSearchTerm(''); setCategory('all'); setSortBy('default'); }}>
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="product-grid-am">
                {filteredProducts.map(product => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}