import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShoppingCart, Star, ArrowLeft, Package, Shield, Truck, RotateCcw, ChevronLeft, ChevronRight, Loader, AlertCircle, Check } from 'lucide-react'
import client from '../api/client'
import { useCart } from '../context/CartContext'
import { formatINR } from '../utils/currency'
import { resolveImageSrc, DEFAULT_PRODUCT_IMAGE } from '../utils/imageHelper'

const isDiscountActive = (discount) => {
  if (!discount || discount.type === 'none' || !discount.value) return false
  const now = new Date()
  const start = discount.startDate ? new Date(discount.startDate) : null
  const end   = discount.endDate   ? new Date(discount.endDate)   : null
  if (start && now < start) return false
  if (end   && now > end)   return false
  return true
}

const getDiscountedPrice = (price, discount) => {
  if (!isDiscountActive(discount)) return price
  const original = parseFloat(price) || 0
  if (discount.type === 'percentage') return original * (1 - parseFloat(discount.value) / 100)
  if (discount.type === 'fixed')      return Math.max(0, original - parseFloat(discount.value))
  return original
}

const getDiscountPercent = (price, discount) => {
  if (!isDiscountActive(discount)) return 0
  if (discount.type === 'percentage') return Math.round(parseFloat(discount.value))
  if (discount.type === 'fixed' && price > 0)
    return Math.round((parseFloat(discount.value) / price) * 100)
  return 0
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product,      setProduct]      = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [activeImg,    setActiveImg]    = useState(0)
  const [qty,          setQty]          = useState(1)
  const [added,        setAdded]        = useState(false)
  const [imgZoomed,    setImgZoomed]    = useState(false)

  useEffect(() => {
    fetchProduct()
    window.scrollTo({ top: 0 })
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await client.get(`/customer/product/${id}`)
      if (res.data && res.data.Productis && res.data.Productis.length > 0) {
        setProduct(res.data.Productis[0])
      } else {
        setError('Product not found.')
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setError('Product not found or login required.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    for (let i = 0; i < qty; i++) {
      addToCart({
        ...product,
        id: product._id || product.id,
        price: discountedPrice,
        originalPrice: discountActive ? parseFloat(product.price) : null,
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EAEDED' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid #ddd', borderTopColor: '#FF9900', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#666', fontFamily: 'Arial, sans-serif' }}>Loading product...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )

  if (error || !product) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EAEDED' }}>
      <div style={{ textAlign: 'center', background: 'white', padding: 40, borderRadius: 8, border: '1px solid #ddd' }}>
        <AlertCircle size={48} color="#CC0C39" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontFamily: 'Arial, sans-serif', color: '#0F1111', marginBottom: 8 }}>Product not found</h2>
        <p style={{ color: '#565959', marginBottom: 20, fontFamily: 'Arial, sans-serif' }}>{error}</p>
        <button onClick={() => navigate('/')} style={btnYellow}>← Back to Home</button>
      </div>
    </div>
  )

  // ── Derived values ──
  const allImages = (() => {
    const imgs = []
    if (Array.isArray(product.media) && product.media.length > 0) {
      product.media.forEach(m => { if (m.url) imgs.push({ url: m.url, type: m.type || 'image' }) })
    }
    if (imgs.length === 0 && product.image) {
      imgs.push({ url: product.image, type: 'image' })
    }
    return imgs
  })()

  const discountActive  = isDiscountActive(product.discount)
  const discountedPrice = discountActive ? getDiscountedPrice(product.price, product.discount) : product.price
  const discountPercent = discountActive ? getDiscountPercent(product.price, product.discount) : 0
  const inStock         = (product.stock ?? 0) > 0
  const savings         = discountActive ? (parseFloat(product.price) - discountedPrice) : 0

  const prevImg = () => setActiveImg(i => (i - 1 + allImages.length) % allImages.length)
  const nextImg = () => setActiveImg(i => (i + 1) % allImages.length)

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .pd-page { font-family: Arial, sans-serif; background: #EAEDED; min-height: 100vh; }
        .pd-breadcrumb { background: #232F3E; padding: 8px 20px; font-size: 13px; color: #ccc; }
        .pd-breadcrumb a { color: #FF9900; text-decoration: none; }
        .pd-breadcrumb a:hover { text-decoration: underline; }
        .pd-inner { max-width: 1200px; margin: 0 auto; padding: 20px; display: grid; grid-template-columns: 460px 1fr 280px; gap: 20px; align-items: start; }
        
        /* Left: Image gallery */
        .img-gallery { background: white; border: 1px solid #ddd; border-radius: 4px; padding: 16px; position: sticky; top: 20px; }
        .main-img-wrap {
          position: relative; height: 380px; display: flex; align-items: center; justify-content: center;
          background: #f7f8f8; border-radius: 4px; overflow: hidden; cursor: zoom-in; margin-bottom: 12px;
        }
        .main-img-wrap img, .main-img-wrap video { max-height: 340px; max-width: 100%; object-fit: contain; transition: transform 0.3s ease; }
        .main-img-wrap:hover img { transform: scale(1.06); }
        .main-img-wrap.zoomed { cursor: zoom-out; }
        .main-img-wrap.zoomed img { transform: scale(1.8); }
        .img-nav-btn {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.9); border: 1px solid #ddd; border-radius: 50%;
          width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 2; box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          transition: all 0.15s;
        }
        .img-nav-btn:hover { background: white; box-shadow: 0 3px 10px rgba(0,0,0,0.2); }
        .img-nav-btn.prev { left: 8px; }
        .img-nav-btn.next { right: 8px; }
        .thumb-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .thumb {
          width: 56px; height: 56px; border-radius: 3px; overflow: hidden; cursor: pointer;
          border: 2px solid transparent; background: #f7f8f8; padding: 3px;
          transition: all 0.15s; flex-shrink: 0;
        }
        .thumb.active { border-color: #FF9900; }
        .thumb:hover:not(.active) { border-color: #aaa; }
        .thumb img { width: 100%; height: 100%; object-fit: contain; }
        .img-counter { text-align: center; font-size: 12px; color: #888; margin-top: 8px; }

        /* Middle: Product info */
        .pd-info { background: white; border: 1px solid #ddd; border-radius: 4px; padding: 20px; }
        .pd-category { font-size: 12px; color: #007185; margin-bottom: 8px; }
        .pd-title { font-size: 22px; font-weight: 400; color: #0F1111; line-height: 1.4; margin-bottom: 10px; }
        .stars-row { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid #eee; }
        .stars-fill { display: flex; color: #FFA41C; }
        .rating-num { font-size: 14px; color: #007185; }
        .pd-price-block { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #eee; }
        .price-label { font-size: 12px; color: #565959; margin-bottom: 4px; }
        .price-main { font-size: 32px; font-weight: 400; color: #0F1111; line-height: 1; }
        .price-main sup { font-size: 14px; vertical-align: super; }
        .price-original { font-size: 14px; color: #565959; margin-top: 4px; }
        .price-original s { color: #565959; }
        .save-row { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
        .save-chip { background: #CC0C39; color: white; font-size: 12px; font-weight: 700; padding: 3px 8px; border-radius: 3px; }
        .save-text { font-size: 13px; color: #CC0C39; font-weight: 600; }
        .deal-ends { font-size: 12px; color: #CC0C39; margin-top: 4px; }

        .feature-list { list-style: none; padding: 0; margin: 0 0 16px; }
        .feature-list li { font-size: 14px; color: #333; padding: 4px 0; padding-left: 16px; position: relative; }
        .feature-list li::before { content: '›'; position: absolute; left: 0; color: #FF9900; font-weight: 700; }

        .about-section h3 { font-size: 16px; font-weight: 700; color: #0F1111; margin-bottom: 10px; }
        .about-section p { font-size: 14px; color: #444; line-height: 1.7; }

        /* Right: Buy box */
        .buy-box { background: white; border: 1px solid #ddd; border-radius: 4px; padding: 20px; position: sticky; top: 20px; }
        .buy-price { font-size: 28px; font-weight: 400; color: #0F1111; margin-bottom: 4px; }
        .buy-price sup { font-size: 13px; vertical-align: super; }
        .free-delivery { font-size: 13px; color: #0F1111; margin-bottom: 4px; }
        .free-delivery span { color: #007185; font-weight: 700; }
        .delivery-date { font-size: 14px; color: #007600; font-weight: 700; margin-bottom: 12px; }
        .stock-label { font-size: 18px; font-weight: 400; margin-bottom: 12px; }
        .stock-in  { color: #007600; }
        .stock-out { color: #CC0C39; }
        .qty-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .qty-label { font-size: 13px; color: #0F1111; }
        .qty-select { border: 1px solid #888; border-radius: 3px; padding: 5px 24px 5px 8px; font-size: 13px; background: white; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23555' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 6px center; }
        .btn-add-cart { width: 100%; background: linear-gradient(to bottom, #FFD814, #F8C200); border: 1px solid #FCD200; border-radius: 20px; padding: 11px; font-size: 14px; font-weight: 600; color: #0F1111; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 10px; transition: all 0.15s; font-family: Arial, sans-serif; }
        .btn-add-cart:hover:not(:disabled) { background: linear-gradient(to bottom, #F7CA00, #EFBD00); }
        .btn-add-cart:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-add-cart.added { background: linear-gradient(to bottom, #4CAF50, #43A047); border-color: #43A047; color: white; }
        .btn-buy-now { width: 100%; background: linear-gradient(to bottom, #FF9900, #e68a00); border: 1px solid #e68a00; border-radius: 20px; padding: 11px; font-size: 14px; font-weight: 600; color: #0F1111; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 14px; transition: all 0.15s; font-family: Arial, sans-serif; }
        .btn-buy-now:hover { background: linear-gradient(to bottom, #e68a00, #d07d00); }
        .secure-msg { display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 12px; color: #565959; margin-bottom: 16px; }
        .buy-divider { border: none; border-top: 1px solid #eee; margin: 12px 0; }
        .buy-detail-row { display: flex; font-size: 13px; margin-bottom: 8px; }
        .buy-detail-label { color: #565959; width: 80px; flex-shrink: 0; }
        .buy-detail-val { color: #0F1111; }
        .feature-badge { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #565959; margin-top: 4px; }
        .feature-badge svg { flex-shrink: 0; }

        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }
        .fade-in { animation: fadeIn 0.35s ease forwards; }

        @media (max-width: 900px) {
          .pd-inner { grid-template-columns: 1fr; }
          .img-gallery, .buy-box { position: static; }
        }
      `}</style>

      <div className="pd-page">
        {/* Breadcrumb */}
        <div className="pd-breadcrumb">
          <a href="#" onClick={e => { e.preventDefault(); navigate('/') }}>Home</a>
          {' › '}
          {product.category && <><a href="#" onClick={e => { e.preventDefault(); navigate('/') }}>{product.category}</a>{' › '}</>}
          <span style={{ color: '#fff' }}>{product.name?.slice(0, 40)}{product.name?.length > 40 ? '...' : ''}</span>
        </div>

        {/* Back button */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 20px 0' }}>
          <button onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#007185', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Arial, sans-serif', padding: 0 }}
            onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}>
            <ArrowLeft size={14} /> Back to results
          </button>
        </div>

        <div className="pd-inner fade-in">

          {/* ── LEFT: Image Gallery ── */}
          <div className="img-gallery">
            {allImages.length > 0 ? (
              <>
                <div className={`main-img-wrap ${imgZoomed ? 'zoomed' : ''}`} onClick={() => setImgZoomed(z => !z)}>
                  {allImages[activeImg]?.type === 'video' ? (
                    <video src={resolveImageSrc(allImages[activeImg].url)} controls style={{ maxHeight: 340, maxWidth: '100%', objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
                  ) : (
                    <img
                      src={resolveImageSrc(allImages[activeImg]?.url)}
                      alt={product.name}
                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_PRODUCT_IMAGE }}
                    />
                  )}
                  {allImages.length > 1 && (
                    <>
                      <button className="img-nav-btn prev" onClick={e => { e.stopPropagation(); prevImg() }}><ChevronLeft size={18} /></button>
                      <button className="img-nav-btn next" onClick={e => { e.stopPropagation(); nextImg() }}><ChevronRight size={18} /></button>
                    </>
                  )}
                  {discountActive && discountPercent > 0 && (
                    <div style={{ position: 'absolute', top: 10, left: 10, background: '#CC0C39', color: 'white', fontSize: 13, fontWeight: 700, padding: '4px 10px', borderRadius: 3 }}>
                      -{discountPercent}%
                    </div>
                  )}
                </div>

                {allImages.length > 1 && (
                  <div className="thumb-row">
                    {allImages.map((m, i) => (
                      <div key={i} className={`thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                        {m.type === 'video'
                          ? <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#888' }}>▶</div>
                          : <img src={resolveImageSrc(m.url)} alt="" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_PRODUCT_IMAGE }} />
                        }
                      </div>
                    ))}
                  </div>
                )}

                {allImages.length > 1 && (
                  <p className="img-counter">{activeImg + 1} / {allImages.length} · Click image to zoom</p>
                )}
              </>
            ) : (
              <div style={{ height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f8f8', borderRadius: 4 }}>
                <img src={DEFAULT_PRODUCT_IMAGE} alt="No image" style={{ maxHeight: 200, opacity: 0.5 }} />
              </div>
            )}
          </div>

          {/* ── MIDDLE: Product Info ── */}
          <div className="pd-info">
            <p className="pd-category">{product.category}</p>
            <h1 className="pd-title">{product.name}</h1>

            {/* Stars */}
            <div className="stars-row">
              <div className="stars-fill">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={16} fill={s <= Math.round(product.rating || 4.5) ? '#FFA41C' : 'none'} color="#FFA41C" />
                ))}
              </div>
              <span className="rating-num">{product.rating || '4.5'} out of 5</span>
            </div>

            {/* Price */}
            <div className="pd-price-block">
              {discountActive ? (
                <>
                  <p className="price-label">Deal Price:</p>
                  <p className="price-main">
                    <sup>₹</sup>{Math.floor(discountedPrice).toLocaleString('en-IN')}
                    <span style={{ fontSize: 18 }}>.{String(Math.round((discountedPrice % 1) * 100)).padStart(2, '0')}</span>
                  </p>
                  <p className="price-original">M.R.P.: <s>{formatINR(product.price)}</s></p>
                  <div className="save-row">
                    <span className="save-chip">-{discountPercent}%</span>
                    <span className="save-text">You save {formatINR(savings)}</span>
                  </div>
                  {product.discount?.endDate && (
                    <p className="deal-ends">🕐 Deal ends {new Date(product.discount.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</p>
                  )}
                </>
              ) : (
                <>
                  <p className="price-label">Price:</p>
                  <p className="price-main">
                    <sup>₹</sup>{Math.floor(product.price).toLocaleString('en-IN')}
                    <span style={{ fontSize: 18 }}>.{String(Math.round((product.price % 1) * 100)).padStart(2, '0')}</span>
                  </p>
                </>
              )}
              <p style={{ fontSize: 12, color: '#565959', marginTop: 6 }}>Inclusive of all taxes</p>
            </div>

            {/* Prime / Delivery */}
            <div style={{ background: '#f7f8f8', border: '1px solid #eee', borderRadius: 4, padding: '12px 16px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ background: 'linear-gradient(135deg,#00A8E1,#1A98FF)', color: 'white', fontWeight: 900, fontSize: 12, padding: '2px 7px', borderRadius: 3 }}>prime</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#007600' }}>FREE Delivery</span>
              </div>
              <p style={{ fontSize: 13, color: '#0F1111' }}>
                Get it by <strong style={{ color: '#0F1111' }}>{getDeliveryDate()}</strong>
              </p>
            </div>

            {/* About */}
            {product.description && (
              <div className="about-section" style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #eee' }}>
                <h3>About this item</h3>
                <p>{product.description}</p>
              </div>
            )}

            {/* ── FIXED: Product Details table ── */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F1111', marginBottom: 10 }}>Product Details</h3>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['Category',     product.category || '—'],
                    ['Availability', inStock ? `In Stock (${product.stock} units)` : 'Out of Stock'],
                    ['Rating',       `${product.rating || '4.5'} / 5`],
                    ['Delivery',     'FREE · Ships across India'],
                  ].map(([label, val], i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#f7f8f8' : 'white' }}>
                      <td style={{ padding: '8px 12px', color: '#565959', fontWeight: 600, width: '40%', border: '1px solid #eee' }}>{label}</td>
                      <td style={{ padding: '8px 12px', color: '#0F1111', border: '1px solid #eee' }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── RIGHT: Buy Box ── */}
          <div className="buy-box">
            {discountActive ? (
              <>
                <p style={{ fontSize: 13, color: '#CC0C39', fontWeight: 700, marginBottom: 4 }}>Deal of the Day</p>
                <p className="buy-price">
                  <sup>₹</sup>{Math.floor(discountedPrice).toLocaleString('en-IN')}
                  <span style={{ fontSize: 14 }}>.{String(Math.round((discountedPrice % 1) * 100)).padStart(2, '0')}</span>
                </p>
                <p style={{ fontSize: 13, color: '#565959', marginBottom: 6 }}>
                  M.R.P.: <s>{formatINR(product.price)}</s>
                  <span style={{ color: '#CC0C39', fontWeight: 700, marginLeft: 6 }}>-{discountPercent}%</span>
                </p>
              </>
            ) : (
              <p className="buy-price">
                <sup>₹</sup>{Math.floor(product.price || 0).toLocaleString('en-IN')}
                <span style={{ fontSize: 14 }}>.{String(Math.round(((product.price || 0) % 1) * 100)).padStart(2, '0')}</span>
              </p>
            )}

            <div className="free-delivery">
              <Truck size={14} style={{ display: 'inline', marginRight: 4, color: '#007185' }} />
              <span>FREE</span> Delivery
            </div>
            <p className="delivery-date">Arrives by {getDeliveryDate()}</p>

            <p className={`stock-label ${inStock ? 'stock-in' : 'stock-out'}`}>
              {inStock ? 'In Stock' : 'Currently unavailable'}
            </p>

            {inStock && (
              <div className="qty-row">
                <label className="qty-label">Qty:</label>
                <select className="qty-select" value={qty} onChange={e => setQty(Number(e.target.value))}>
                  {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              className={`btn-add-cart ${added ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              {added ? <><Check size={16} /> Added to Cart</> : <><ShoppingCart size={16} /> Add to Cart</>}
            </button>

            <button
              className="btn-buy-now"
              onClick={() => { handleAddToCart(); navigate('/checkout') }}
              disabled={!inStock}
              style={{ opacity: inStock ? 1 : 0.6, cursor: inStock ? 'pointer' : 'not-allowed' }}
            >
              Buy Now
            </button>

            <div className="secure-msg">
              <Shield size={13} color="#007600" />
              <span style={{ color: '#007600' }}>Secure transaction</span>
            </div>

            <hr className="buy-divider" />

            <div className="buy-detail-row">
              <span className="buy-detail-label">Ships from</span>
              <span className="buy-detail-val">PickNGo Warehouse</span>
            </div>
            <div className="buy-detail-row">
              <span className="buy-detail-label">Sold by</span>
              <span className="buy-detail-val" style={{ color: '#007185' }}>PickNGo</span>
            </div>
            <div className="buy-detail-row">
              <span className="buy-detail-label">Returns</span>
              <span className="buy-detail-val" style={{ color: '#007185' }}>30-day return policy</span>
            </div>

            <hr className="buy-divider" />

            <div className="feature-badge">
              <Package size={14} color="#007185" />
              <span>Free packaging included</span>
            </div>
            <div className="feature-badge" style={{ marginTop: 6 }}>
              <RotateCcw size={14} color="#007185" />
              <span>Easy 30-day returns</span>
            </div>
            <div className="feature-badge" style={{ marginTop: 6 }}>
              <Shield size={14} color="#007185" />
              <span>Secure payments</span>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

// Helper: get estimated delivery date (4 days from now)
function getDeliveryDate() {
  const d = new Date()
  d.setDate(d.getDate() + 4)
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
}

const btnYellow = {
  background: 'linear-gradient(to bottom,#FFD814,#F8C200)',
  border: '1px solid #FCD200', borderRadius: 20,
  padding: '9px 24px', fontSize: 14, fontWeight: 600,
  color: '#0F1111', cursor: 'pointer', fontFamily: 'Arial, sans-serif'
}