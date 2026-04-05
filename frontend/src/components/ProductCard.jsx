import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Check } from 'lucide-react' // Added Check icon
import { useCart } from '../context/CartContext'
import { formatINR } from '../utils/currency'
import { resolveImageSrc, DEFAULT_PRODUCT_IMAGE } from '../utils/imageHelper'

// ── Helpers ──
const isDiscountActive = (discount) => {
  if (!discount || discount.type === 'none' || !discount.value) return false
  const now = new Date()
  const start = discount.startDate ? new Date(discount.startDate) : null
  const end = discount.endDate ? new Date(discount.endDate) : null
  if (start && now < start) return false
  if (end && now > end) return false
  return true
}

const getDiscountedPrice = (price, discount) => {
  if (!isDiscountActive(discount)) return price
  const original = parseFloat(price) || 0
  if (discount.type === 'percentage') return original * (1 - parseFloat(discount.value) / 100)
  if (discount.type === 'fixed') return Math.max(0, original - parseFloat(discount.value))
  return original
}

const getDiscountPercent = (price, discount) => {
  if (!isDiscountActive(discount)) return 0
  if (discount.type === 'percentage') return Math.round(parseFloat(discount.value))
  if (discount.type === 'fixed' && price > 0) return Math.round((parseFloat(discount.value) / price) * 100)
  return 0
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const [isAdded, setIsAdded] = React.useState(false)

  // Derived values
  const productId = product._id || product.id
  const primaryMedia = Array.isArray(product.media) && product.media.length > 0
    ? product.media[0]
    : (product.image ? { type: 'image', url: product.image } : null)

  const discountActive = isDiscountActive(product.discount)
  const discountedPrice = discountActive ? getDiscountedPrice(product.price, product.discount) : product.price
  const discountPercent = discountActive ? getDiscountPercent(product.price, product.discount) : 0
  const inStock = (product.stock ?? 0) > 0

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigating to detail page if button is clicked
    addToCart({ ...product, id: productId, price: discountedPrice })
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <>
      <style>{`
        /* Use standard system fonts since Amazon Ember is proprietary */
        .product-card-am {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s, box-shadow 0.2s;
          font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          position: relative;
          height: 100%;
        }
        .product-card-am:hover { 
          box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
        }
        .discount-badge-am {
          position: absolute; top: 0; left: 0;
          background: #CC0C39; color: white;
          font-size: 11px; font-weight: 700;
          padding: 4px 10px; z-index: 2;
          border-radius: 0 0 4px 0;
        }
        .product-img-wrap {
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          height: 200px; padding: 15px; cursor: pointer;
        }
        .product-img-wrap img, .product-img-wrap video {
          max-height: 180px; max-width: 100%; object-fit: contain;
          transition: transform 0.4s ease;
        }
        .product-card-am:hover .product-img-wrap img { transform: scale(1.05); }
        
        .product-body {
          padding: 10px 14px; flex: 1;
          display: flex; flex-direction: column; gap: 4px;
        }
        .category-tag-am { font-size: 11px; color: #565959; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .product-name-am {
          font-size: 14px; font-weight: 400; color: #0F1111;
          line-height: 1.4em; height: 2.8em; /* Force 2 lines */
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
          margin-bottom: 4px;
        }
        .product-name-am:hover { color: #C7511F; text-decoration: underline; }
        
        .stars-row { display: flex; align-items: center; gap: 4px; }
        .rating-count { font-size: 12px; color: #007185; }
        
        .price-row-am { margin-top: 6px; }
        .price-main-am { font-size: 21px; font-weight: 500; color: #0F1111; display: flex; align-items: flex-start; }
        .price-symbol { font-size: 12px; margin-top: 4px; margin-right: 1px; }
        .price-fraction { font-size: 13px; margin-top: 4px; }
        
        .price-original-am { font-size: 12px; color: #565959; text-decoration: line-through; margin-top: 2px; }
        .save-badge { font-size: 12px; color: #CC0C39; font-weight: 600; }
        
        .prime-row { display: flex; align-items: center; gap: 5px; margin-top: 4px; font-size: 12px; color: #565959; }
        .prime-chip {
           background: linear-gradient(135deg, #00A8E1, #1A98FF);
           color: white; font-weight: 900; font-size: 10px;
           padding: 1px 4px; border-radius: 2px;
        }

        .stock-status { font-size: 12px; font-weight: 600; margin-top: 4px; }
        .stock-in { color: #007600; }
        .stock-out { color: #CC0C39; }

        .btn-cart-am {
          margin: 12px;
          background: #FFD814; border: 1px solid #FCD200; border-radius: 20px;
          padding: 8px; font-size: 13px; font-weight: 500; color: #0F1111;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 2px 5px rgba(213, 217, 217, 0.5);
          transition: background 0.2s;
        }
        .btn-cart-am:hover:not(:disabled) { background: #F7CA00; border-color: #F2C200; }
        .btn-cart-am.added { background: #007600; border-color: #007600; color: white; }
        .btn-cart-am:disabled { background: #eff1f3; border-color: #d5d9d9; color: #888; cursor: not-allowed; box-shadow: none; }
      `}</style>

      <div className="product-card-am">
        {discountActive && discountPercent > 0 && (
          <div className="discount-badge-am">-{discountPercent}%</div>
        )}

        <Link to={`/product/${productId}`} style={{ textDecoration: 'none' }}>
          <div className="product-img-wrap" title={product.name}>
            {primaryMedia?.type === 'video' ? (
              <video
                src={resolveImageSrc(primaryMedia.url)}
                muted
                loop
                onMouseOver={e => e.target.play()}
                onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
              />
            ) : (
              <img
                src={resolveImageSrc(primaryMedia?.url || product.image)}
                alt={product.name}
                loading="lazy"
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_PRODUCT_IMAGE }}
              />
            )}
          </div>
        </Link>

        <div className="product-body">
          <span className="category-tag-am">{product.category || 'Product'}</span>

          <Link to={`/product/${productId}`} style={{ textDecoration: 'none' }}>
            <h2 className="product-name-am">{product.name}</h2>
          </Link>

          <div className="stars-row">
            <div style={{ display: 'flex', color: '#FFA41C' }}>
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={14} fill={s <= Math.round(product.rating || 4.5) ? '#FFA41C' : 'none'} strokeWidth={1.5} />
              ))}
            </div>
            <span className="rating-count">{product.rating || '4.5'}</span>
          </div>

          <div className="price-row-am">
            <div className="price-main-am">
              <span className="price-symbol">₹</span>
              <span>{Math.floor(discountedPrice).toLocaleString('en-IN')}</span>
              <span className="price-fraction">{String(Math.round((discountedPrice % 1) * 100)).padStart(2, '0')}</span>
            </div>
            {discountActive && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="price-original-am">M.R.P: {formatINR(product.price)}</span>
                <span className="save-badge">({discountPercent}% off)</span>
              </div>
            )}
          </div>

          <div className="prime-row">
            <span className="prime-chip">prime</span>
            <span>FREE Delivery</span>
          </div>

          <div className={`stock-status ${inStock ? 'stock-in' : 'stock-out'}`}>
            {inStock ? 'In Stock' : 'Out of Stock'}
          </div>
        </div>

        <button
          className={`btn-cart-am ${isAdded ? 'added' : ''}`}
          onClick={handleAddToCart}
          disabled={!inStock}
          aria-label="Add to cart"
        >
          {isAdded ? <><Check size={16} /> Added</> : <><ShoppingCart size={16} /> Add to Cart</>}
        </button>
      </div>
    </>
  )
}