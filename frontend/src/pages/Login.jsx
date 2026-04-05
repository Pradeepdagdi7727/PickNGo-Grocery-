import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AlertCircle, Loader, Eye, EyeOff } from 'lucide-react'

export default function Login({ onClose, defaultRole = 'customer' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(defaultRole)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const loggedInUser = await login(email, password)
      if (onClose) onClose()
      navigate(loggedInUser?.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      setError(err.response?.data?.message || 'Your email or password is incorrect.')
    } finally {
      setLoading(false)
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amazon+Ember:wght@400;700&display=swap');

        .login-overlay-am {
          position: fixed; inset: 0;
          background: rgba(15, 17, 17, 0.55);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
          animation: fadeInOv 0.15s ease;
          font-family: 'Amazon Ember', Arial, sans-serif;
          padding: 16px;
        }
        @keyframes fadeInOv { from { opacity: 0 } to { opacity: 1 } }

        .login-box-am {
          background: white;
          border: 1px solid #d5d9d9;
          border-radius: 8px;
          width: 100%;
          max-width: 350px;
          padding: 22px 22px 28px;
          animation: slideUpAm 0.2s ease;
          box-shadow: 0 0 0 1px rgba(0,0,0,.05), 0 4px 24px rgba(0,0,0,.12);
        }
        @keyframes slideUpAm { from { transform: translateY(12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

        .login-logo-am {
          display: block;
          text-align: center;
          font-size: 26px;
          font-weight: 700;
          color: #0F1111;
          margin-bottom: 18px;
          letter-spacing: -0.5px;
        }
        .login-logo-am span { color: #FF9900; }

        .login-title-am {
          font-size: 26px;
          font-weight: 400;
          color: #0F1111;
          margin-bottom: 18px;
          line-height: 1.2;
        }

        .am-label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #0F1111;
          margin-bottom: 4px;
        }

        .am-input {
          width: 100%;
          padding: 7px 10px;
          border: 1px solid #888;
          border-radius: 3px;
          font-size: 14px;
          color: #0F1111;
          outline: none;
          font-family: 'Amazon Ember', Arial, sans-serif;
          box-sizing: border-box;
          transition: border-color 0.1s, box-shadow 0.1s;
          background: white;
        }
        .am-input:focus {
          border-color: #e77600;
          box-shadow: 0 0 0 3px rgba(228, 121, 17, 0.5);
        }

        .am-select {
          width: 100%;
          padding: 7px 10px;
          border: 1px solid #888;
          border-radius: 3px;
          font-size: 14px;
          color: #0F1111;
          outline: none;
          font-family: 'Amazon Ember', Arial, sans-serif;
          box-sizing: border-box;
          background: white;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23555' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
        }
        .am-select:focus { border-color: #e77600; box-shadow: 0 0 0 3px rgba(228,121,17,0.5); }

        .pw-wrap-am { position: relative; }
        .pw-toggle-am {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #007185;
          font-size: 13px; font-family: 'Amazon Ember', Arial, sans-serif; padding: 0;
        }
        .pw-toggle-am:hover { color: #C7511F; text-decoration: underline; }

        .am-btn-primary {
          width: 100%;
          background: linear-gradient(to bottom, #FFD814, #F8C200);
          border: 1px solid #FCD200;
          border-radius: 20px;
          padding: 9px 10px;
          font-size: 14px;
          font-weight: 700;
          color: #0F1111;
          cursor: pointer;
          font-family: 'Amazon Ember', Arial, sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.1s;
          margin-top: 2px;
        }
        .am-btn-primary:hover:not(:disabled) { background: linear-gradient(to bottom, #F7CA00, #EFBD00); }
        .am-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .am-error {
          background: #fff8f8;
          border: 1px solid #a31717;
          border-radius: 4px;
          padding: 10px 12px;
          font-size: 13px;
          color: #a31717;
          display: flex; align-items: flex-start; gap: 8px;
          margin-bottom: 14px;
          line-height: 1.4;
        }

        .am-divider {
          display: flex; align-items: center; gap: 10px;
          margin: 16px 0;
        }
        .am-divider hr { flex: 1; border: none; border-top: 1px solid #e7e7e7; }
        .am-divider span { font-size: 12px; color: #767676; white-space: nowrap; }

        .am-btn-secondary {
          width: 100%;
          background: linear-gradient(to bottom, #f7f8f8, #e7e9ec);
          border: 1px solid #adb1b8;
          border-radius: 20px;
          padding: 9px 10px;
          font-size: 14px;
          font-weight: 400;
          color: #0F1111;
          cursor: pointer;
          font-family: 'Amazon Ember', Arial, sans-serif;
          text-align: center;
          transition: background 0.1s;
          text-decoration: none;
          display: block;
          box-sizing: border-box;
        }
        .am-btn-secondary:hover { background: linear-gradient(to bottom, #e7e9ec, #dde0e5); }

        .am-legal {
          font-size: 12px;
          color: #565959;
          line-height: 1.5;
          margin-top: 14px;
        }
        .am-legal a { color: #007185; text-decoration: none; }
        .am-legal a:hover { text-decoration: underline; color: #C7511F; }

        .am-footer-divider {
          border: none; border-top: 1px solid #e7e7e7;
          margin: 18px -22px 16px;
        }

        .am-footer-links {
          display: flex; flex-wrap: wrap; gap: 8px;
          justify-content: center;
          font-size: 12px;
        }
        .am-footer-links a, .am-footer-links button {
          color: #007185; text-decoration: none;
          background: none; border: none; cursor: pointer;
          font-size: 12px; font-family: 'Amazon Ember', Arial, sans-serif; padding: 0;
        }
        .am-footer-links a:hover, .am-footer-links button:hover { color: #C7511F; text-decoration: underline; }
        .am-footer-links span { color: #e7e7e7; }

        .field-group { margin-bottom: 12px; }
        .close-am {
          position: absolute; top: 12px; right: 14px;
          background: none; border: none; cursor: pointer; color: #565959;
          font-size: 20px; line-height: 1; padding: 0;
        }
        .close-am:hover { color: #0F1111; }
      `}</style>

      <div className="login-overlay-am" onClick={handleOverlayClick}>
        <div className="login-box-am" style={{ position: 'relative' }}>
          <button className="close-am" onClick={onClose} aria-label="Close">×</button>

          {/* Logo */}
          <span className="login-logo-am">Pick<span>N</span>Go</span>

          <h1 className="login-title-am">Sign in</h1>

          {error && (
            <div className="am-error">
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Role */}
            <div className="field-group">
              <label className="am-label">Sign in as</label>
              <select className="am-select" value={role} onChange={e => setRole(e.target.value)}>
                <option value="customer">Customer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {/* Email */}
            <div className="field-group">
              <label className="am-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                className="am-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="Enter email"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="field-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label className="am-label" htmlFor="login-password" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" onClick={onClose} style={{ fontSize: 12, color: '#007185', textDecoration: 'none' }}
                  onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}>
                  Forgot password?
                </Link>
              </div>
              <div className="pw-wrap-am">
                <input
                  id="login-password"
                  className="am-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  autoComplete="current-password"
                  style={{ paddingRight: 60 }}
                />
                <button type="button" className="pw-toggle-am" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="am-btn-primary" disabled={loading}>
              {loading && <Loader size={15} style={{ animation: 'spin 0.8s linear infinite' }} />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="am-legal">
            By signing in you agree to PickNGo's{' '}
            <a href="#">Conditions of Use</a> and{' '}
            <a href="#">Privacy Notice</a>.
          </p>

          <div className="am-divider">
            <hr />
            <span>New to PickNGo?</span>
            <hr />
          </div>

          <button
            className="am-btn-secondary"
            onClick={() => { onClose(); setTimeout(() => {}, 0) }}
            type="button"
          >
            <span onClick={() => { /* trigger signup */ }}>
              Create your PickNGo account
            </span>
          </button>

          <hr className="am-footer-divider" />

          <div className="am-footer-links">
            <a href="#">Conditions of Use</a>
            <span>|</span>
            <a href="#">Privacy Notice</a>
            <span>|</span>
            <a href="#">Help</a>
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#767676', marginTop: 8 }}>
            © 2025 PickNGo
          </p>
        </div>
      </div>
    </>
  )
}