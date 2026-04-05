import React from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, Loader, ShoppingCart, Lock } from 'lucide-react'
import { formatINR } from '../utils/currency'
import { resolveImageSrc, DEFAULT_PRODUCT_IMAGE } from '../utils/imageHelper'

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart, loaded } = useCart()
  const navigate = useNavigate()
  const total = getTotalPrice()

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader style={{ animation: 'spin 0.8s linear infinite' }} size={40} color="#FF9900" />
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amazon+Ember:wght@400;700&display=swap');
        .cart-am { font-family: 'Amazon Ember', Arial, sans-serif; background: #EAEDED; min-height: 100vh; padding: 20px 0; }
        .cart-inner { max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; gap: 20px; align-items: flex-start; }
        .cart-main { flex: 1; min-width: 0; }
        .cart-sidebar { width: 300px; flex-shrink: 0; }

        .cart-header-am { background: white; border-radius: 4px; padding: 20px 24px; margin-bottom: 12px; border: 1px solid #ddd; }
        .cart-header-am h1 { font-size: 28px; font-weight: 400; color: #0F1111; margin-bottom: 4px; border-bottom: 1px solid #ddd; padding-bottom: 14px; }
        .cart-header-am .price-col { font-size: 13px; color: #565959; text-align: right; font-weight: 400; display: block; margin-bottom: 10px; }

        .cart-item-am { background: white; border-radius: 4px; border: 1px solid #ddd; padding: 20px; margin-bottom: 8px; display: flex; gap: 16px; }
        .cart-item-img { width: 120px; height: 120px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: #f7f8f8; border-radius: 4px; padding: 8px; }
        .cart-item-img img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .cart-item-body { flex: 1; min-width: 0; }
        .cart-item-name { font-size: 16px; color: #0F1111; margin-bottom: 6px; font-weight: 400; line-height: 1.4; }
        .cart-item-name:hover { color: #C7511F; cursor: pointer; text-decoration: underline; }
        .cart-instock { font-size: 13px; color: #007600; font-weight: 400; margin-bottom: 8px; }
        .qty-controls { display: flex; align-items: center; gap: 0; border: 1px solid #888; border-radius: 4px; width: fit-content; margin-top: 8px; }
        .qty-btn { background: #f3f3f3; border: none; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; transition: background 0.15s; }
        .qty-btn:hover { background: #ddd; }
        .qty-display { padding: 0 16px; font-size: 14px; font-weight: 700; border-left: 1px solid #888; border-right: 1px solid #888; height: 32px; display: flex; align-items: center; min-width: 40px; justify-content: center; }
        .delete-link { font-size: 13px; color: #007185; cursor: pointer; margin-left: 16px; margin-top: 8px; display: inline-flex; align-items: center; gap: 4px; text-decoration: none; }
        .delete-link:hover { color: #C7511F; text-decoration: underline; }
        .cart-item-price { font-size: 18px; font-weight: 700; color: #0F1111; text-align: right; white-space: nowrap; }

        .order-summary-am { background: white; border: 1px solid #ddd; border-radius: 4px; padding: 20px; }
        .proceed-btn { background: linear-gradient(to bottom, #FFD814, #F8C200); border: 1px solid #FCD200; border-radius: 20px; padding: 10px 20px; font-size: 15px; font-weight: 600; color: #0F1111; cursor: pointer; width: 100%; font-family: 'Amazon Ember', Arial, sans-serif; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 6px; transition: background 0.15s; }
        .proceed-btn:hover { background: linear-gradient(to bottom, #F7CA00, #EFBD00); }
        .secure-msg { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #565959; justify-content: center; margin-bottom: 16px; }
        .total-line { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; }
        .total-line.final { font-size: 20px; font-weight: 700; border-top: 1px solid #eee; padding-top: 12px; margin-top: 8px; }
        .subtotal-label { color: #565959; }
        .free-text { color: #007600; font-weight: 700; }
        .clear-cart-btn { background: white; border: 1px solid #ddd; border-radius: 3px; padding: 8px 16px; font-size: 13px; cursor: pointer; width: 100%; color: #565959; font-family: 'Amazon Ember', Arial, sans-serif; margin-top: 8px; transition: border-color 0.15s; }
        .clear-cart-btn:hover { border-color: #C7511F; color: #C7511F; }
        .continue-btn { background: #f3f3f3; border: 1px solid #ddd; border-radius: 20px; padding: 8px 20px; font-size: 13px; font-weight: 600; color: #0F1111; cursor: pointer; width: 100%; font-family: 'Amazon Ember', Arial, sans-serif; margin-bottom: 8px; transition: background 0.15s; }
        .continue-btn:hover { background: #e9e9e9; }

        .empty-cart { background: white; border: 1px solid #ddd; border-radius: 4px; padding: 60px 20px; text-align: center; }
        .empty-cart h2 { font-size: 28px; font-weight: 400; color: #0F1111; margin-bottom: 12px; }
        .empty-cart p { color: #565959; font-size: 15px; margin-bottom: 20px; }
        .shop-btn { background: linear-gradient(to bottom, #FFD814, #F8C200); border: 1px solid #FCD200; border-radius: 20px; padding: 10px 24px; font-size: 14px; font-weight: 600; color: #0F1111; cursor: pointer; font-family: 'Amazon Ember', Arial, sans-serif; }

        .discount-badge { background: #CC0C39; color: white; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 3px; margin-left: 6px; }
        .original-price { font-size: 13px; color: #565959; text-decoration: line-through; margin-right: 6px; }
        .you-save { font-size: 12px; color: #CC0C39; font-weight: 600; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .cart-inner { flex-direction: column; }
          .cart-sidebar { width: 100%; }
        }
      `}</style>

      <div className="cart-am">
        {cart.length === 0 ? (
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
            <div className="empty-cart">
              <ShoppingCart size={80} color="#ddd" style={{ margin: '0 auto 20px' }} />
              <h2>Your Cart is empty</h2>
              <p>Shop today's deals</p>
              <button className="shop-btn" onClick={() => navigate('/')}>Continue Shopping</button>
            </div>
          </div>
        ) : (
          <div className="cart-inner">
            {/* Main */}
            <div className="cart-main">
              <div className="cart-header-am">
                <h1>Shopping Cart</h1>
                <span className="price-col">Price</span>

                {cart.map(item => {
                  // item.price = discounted price (set in ProductDetail)
                  // item.originalPrice = original price (if stored)
                  const discountedPrice = item.price
                  const originalPrice = item.originalPrice
                  const hasDiscount = originalPrice && originalPrice > discountedPrice
                  const savingsPerItem = hasDiscount ? (originalPrice - discountedPrice) : 0
                  const discountPercent = hasDiscount ? Math.round((savingsPerItem / originalPrice) * 100) : 0

                  return (
                    <div key={item.id || item._id} className="cart-item-am">
                      <div className="cart-item-img">
                        <img
                          src={resolveImageSrc(item.image)}
                          alt={item.name}
                          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = DEFAULT_PRODUCT_IMAGE }}
                        />
                      </div>

                      <div className="cart-item-body" style={{ flex: 1 }}>
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-instock">In Stock</div>
                        <div style={{ fontSize: 12, color: '#565959', marginBottom: 6 }}>
                          {item.description?.slice(0, 60)}{item.description?.length > 60 ? '...' : ''}
                        </div>

                        {/* Discount info under description */}
                        {hasDiscount && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <span className="discount-badge">-{discountPercent}%</span>
                            <span className="you-save">You save {formatINR(savingsPerItem)} per item</span>
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                          <div className="qty-controls">
                            <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                              <Minus size={14} />
                            </button>
                            <span className="qty-display">{item.quantity}</span>
                            <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="delete-link" onClick={() => removeFromCart(item.id)}>
                            <Trash2 size={13} /> Delete
                          </span>
                        </div>
                      </div>

                      {/* Price column — show original strikethrough + discounted */}
                      <div className="cart-item-price">
                        {hasDiscount && (
                          <div className="original-price">{formatINR(originalPrice * item.quantity)}</div>
                        )}
                        {formatINR(discountedPrice * item.quantity)}
                      </div>
                    </div>
                  )
                })}

                <div style={{ textAlign: 'right', padding: '16px 0', fontSize: 18, fontWeight: 400 }}>
                  Subtotal ({cart.reduce((t, i) => t + i.quantity, 0)} items):&nbsp;
                  <span style={{ fontWeight: 700 }}>{formatINR(total)}</span>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="cart-sidebar">
              <div className="order-summary-am">
                <div className="secure-msg">
                  <Lock size={13} color="#007600" />
                  <span style={{ color: '#007600' }}>Your order is secure</span>
                </div>

                <div style={{ fontSize: 18, marginBottom: 14 }}>
                  Subtotal ({cart.reduce((t, i) => t + i.quantity, 0)} items):{' '}
                  <strong>{formatINR(total)}</strong>
                </div>

                <button className="proceed-btn" onClick={() => navigate('/checkout')}>
                  Proceed to Buy
                </button>

                <button className="continue-btn" onClick={() => navigate('/')}>
                  Continue Shopping
                </button>

                <div style={{ borderTop: '1px solid #eee', paddingTop: 14, marginTop: 6 }}>
                  <div className="total-line">
                    <span className="subtotal-label">Subtotal</span>
                    <span>{formatINR(total)}</span>
                  </div>
                  <div className="total-line">
                    <span className="subtotal-label">Shipping</span>
                    <span className="free-text">FREE</span>
                  </div>
                  <div className="total-line">
                    <span className="subtotal-label">Tax (10%)</span>
                    <span>{formatINR(total * 0.1)}</span>
                  </div>
                  <div className="total-line final">
                    <span>Order Total</span>
                    <span style={{ color: '#C7511F' }}>{formatINR(total * 1.1)}</span>
                  </div>
                </div>

                <button className="clear-cart-btn" onClick={clearCart}>
                  Clear Cart
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  )
}