import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, LogOut, Package, User, ClipboardList, MapPin } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar({ onLoginClick, onSignupClick }) {
  const { user, logout } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  // Show cart badge only when user is logged in
  const cartCount = user ? cart.reduce((total, item) => total + item.quantity, 0) : 0
  const isAdmin = user?.role === 'admin'

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsOpen(false)
  }

  const handleCartClick = (e) => {
    if (!user) {
      e.preventDefault()
      onLoginClick()
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amazon+Ember:wght@400;700&display=swap');

        .navbar-am {
          font-family: 'Amazon Ember', Arial, sans-serif;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        /* Top bar */
        .navbar-top {
          background: #131921;
          color: white;
          display: flex;
          align-items: center;
          padding: 8px 16px;
          gap: 12px;
          min-height: 60px;
        }

        /* Logo */
        .navbar-logo {
          font-size: 22px;
          font-weight: 700;
          color: white;
          text-decoration: none;
          letter-spacing: -0.5px;
          padding: 4px 8px;
          border: 2px solid transparent;
          border-radius: 3px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .navbar-logo:hover { border-color: white; color: white; }
        .navbar-logo span { color: #FF9900; }

        /* Deliver to */
        .deliver-to {
          display: flex;
          flex-direction: column;
          font-size: 11px;
          color: #ccc;
          padding: 4px 8px;
          border: 2px solid transparent;
          border-radius: 3px;
          cursor: pointer;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .deliver-to:hover { border-color: white; }
        .deliver-to strong { font-size: 13px; color: white; }



        /* Nav items */
        .nav-item-am {
          display: flex;
          flex-direction: column;
          font-size: 11px;
          color: #ccc;
          padding: 4px 8px;
          border: 2px solid transparent;
          border-radius: 3px;
          cursor: pointer;
          text-decoration: none;
          flex-shrink: 0;
          white-space: nowrap;
          transition: border-color 0.1s;
          background: none;
          font-family: 'Amazon Ember', Arial, sans-serif;
        }
        .nav-item-am:hover { border-color: white; color: white; }
        .nav-item-am strong { font-size: 13px; color: white; }

        /* Cart */
        .cart-icon-am {
          position: relative;
          display: flex;
          align-items: flex-end;
          gap: 4px;
          padding: 4px 8px;
          border: 2px solid transparent;
          border-radius: 3px;
          text-decoration: none;
          color: white;
          flex-shrink: 0;
        }
        .cart-icon-am:hover { border-color: white; }
        .cart-count-am {
          position: absolute;
          top: -2px;
          left: 22px;
          background: #FF9900;
          color: #0F1111;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
        }
        .cart-text-am { font-size: 13px; font-weight: 700; line-height: 1; }

        /* Bottom bar */
        .navbar-bottom {
          background: #232F3E;
          color: white;
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 0;
          font-size: 13px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .navbar-bottom::-webkit-scrollbar { display: none; }
        .bottom-link {
          padding: 8px 10px;
          color: white;
          text-decoration: none;
          white-space: nowrap;
          border: 2px solid transparent;
          border-radius: 3px;
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          transition: border-color 0.1s;
          font-family: 'Amazon Ember', Arial, sans-serif;
          background: none;
          cursor: pointer;
          font-weight: 400;
        }
        .bottom-link:hover { border-color: white; }

        /* Auth buttons */
        .signin-btn-am {
          background: #FF9900;
          border: none;
          border-radius: 4px;
          padding: 7px 16px;
          font-size: 13px;
          font-weight: 700;
          color: #0F1111;
          cursor: pointer;
          font-family: 'Amazon Ember', Arial, sans-serif;
          transition: background 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .signin-btn-am:hover { background: #e68a00; }
        .signup-link-am {
          font-size: 12px;
          color: #ccc;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .signup-link-am button {
          background: none;
          border: none;
          color: #FF9900;
          cursor: pointer;
          font-size: 12px;
          font-family: 'Amazon Ember', Arial, sans-serif;
          padding: 0;
          text-decoration: underline;
        }

        /* Mobile */
        .mobile-menu-am {
          background: #131921;
          border-top: 1px solid #37475A;
          padding: 12px 16px;
        }
        .mobile-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          color: white;
          text-decoration: none;
          font-size: 15px;
          border-bottom: 1px solid #37475A;
          background: none;
          border-top: none;
          border-left: none;
          border-right: none;
          cursor: pointer;
          width: 100%;
          font-family: 'Amazon Ember', Arial, sans-serif;
        }
        .mobile-link:last-child { border-bottom: none; }

        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
          .hide-desktop { display: none !important; }
        }
      `}</style>

      <nav className="navbar-am">
        {/* Top Bar */}
        <div className="navbar-top">
          {/* Logo */}
          <Link to={isAdmin ? '/admin' : '/'} className="navbar-logo">
            Pick<span>N</span>Go
          </Link>

          {/* Deliver to - hide on small */}
          {user && !isAdmin && (
            <div className="deliver-to hide-mobile">
              <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MapPin size={12} color="#ccc" /> Deliver to
              </span>
              <strong>{user.fullname || 'You'}</strong>
            </div>
          )}

          {/* Spacer — pushes auth + cart to the right */}
          <div style={{ flex: 1 }} />

          {/* Auth / User area */}
          {!user ? (
            <>
              <button className="signin-btn-am" onClick={onLoginClick}>Sign In</button>
              <div className="signup-link-am hide-mobile">
                New customer?{' '}
                <button onClick={onSignupClick}>Start here</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/profile" className="nav-item-am hide-mobile">
                <span>Hello, {user.fullname?.split(' ')[0] || 'User'}</span>
                <strong>Account & Lists</strong>
              </Link>
              {!isAdmin && (
                <Link to="/orders" className="nav-item-am hide-mobile">
                  <span>Returns</span>
                  <strong>& Orders</strong>
                </Link>
              )}
            </>
          )}

          {/* Cart — always visible, before logout */}
          {!isAdmin && (
            <Link to="/cart" className="cart-icon-am" onClick={handleCartClick}>
              <div style={{ position: 'relative' }}>
                <ShoppingCart size={32} />
                {cartCount > 0 && <span className="cart-count-am">{cartCount}</span>}
              </div>
              <span className="cart-text-am hide-mobile">Cart</span>
            </Link>
          )}

          {/* Logout — only when logged in */}
          {user && (
            <button className="nav-item-am hide-mobile" onClick={handleLogout} style={{ border: '2px solid #565959' }}>
              
              <strong style={{ color: '#FF9900' }}>Logout</strong>
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            className="show-mobile"
            onClick={() => setIsOpen(!isOpen)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px', marginLeft: 4 }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Bottom Nav Bar — only on mobile */}
        <div className="navbar-bottom hide-desktop">
          {!isAdmin && (
            <>
              {user && (
                <>
                  <Link to="/cart" className="bottom-link">
                    <ShoppingCart size={14} /> Cart {cartCount > 0 && `(${cartCount})`}
                  </Link>
                  <Link to="/orders" className="bottom-link">
                    <ClipboardList size={14} /> Orders
                  </Link>
                  <Link to="/profile" className="bottom-link">
                    <User size={14} /> Profile
                  </Link>
                </>
              )}
            </>
          )}
          {isAdmin && (
            <>
              <Link to="/admin" className="bottom-link">
                <Package size={14} /> Dashboard
              </Link>
              <Link to="/admin/products" className="bottom-link">Products</Link>
              <Link to="/admin/orders" className="bottom-link">Orders</Link>
              <Link to="/profile" className="bottom-link">
                <User size={14} /> Profile
              </Link>
            </>
          )}

        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="mobile-menu-am show-mobile" style={{ flexDirection: 'column' }}>
            {!user ? (
              <>
                <button className="mobile-link" onClick={() => { onLoginClick(); setIsOpen(false) }}>
                  <User size={18} /> Sign In
                </button>
                <button className="mobile-link" onClick={() => { onSignupClick(); setIsOpen(false) }}>
                  Create Account
                </button>
              </>
            ) : (
              <>
                <div style={{ color: '#FF9900', fontSize: 14, fontWeight: 700, paddingBottom: 10, borderBottom: '1px solid #37475A' }}>
                  Hello, {user.fullname}
                </div>
                {!isAdmin && (
                  <>
                    <Link to="/cart" className="mobile-link" onClick={() => setIsOpen(false)}><ShoppingCart size={18} /> Cart ({cartCount})</Link>
                    <Link to="/orders" className="mobile-link" onClick={() => setIsOpen(false)}><ClipboardList size={18} /> Orders</Link>
                  </>
                )}
                {isAdmin && (
                  <>
                    <Link to="/admin" className="mobile-link" onClick={() => setIsOpen(false)}><Package size={18} /> Dashboard</Link>
                    <Link to="/admin/products" className="mobile-link" onClick={() => setIsOpen(false)}>Products</Link>
                    <Link to="/admin/orders" className="mobile-link" onClick={() => setIsOpen(false)}>Orders</Link>
                  </>
                )}
                <Link to="/profile" className="mobile-link" onClick={() => setIsOpen(false)}><User size={18} /> Profile</Link>
                <button className="mobile-link" onClick={handleLogout}><LogOut size={18} /> Sign Out</button>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  )
}