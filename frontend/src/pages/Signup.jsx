import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AlertCircle, Loader, CheckCircle, Eye, EyeOff } from 'lucide-react'
import api from '../api/client'

export default function Signup({ onClose }) {
  const [step, setStep] = useState('form') // 'form' | 'otp' | 'success'
  const [formData, setFormData] = useState({ fullname: '', email: '', password: '', confirmPassword: '', phone: '', address: '' })
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const res = await api.post('/send-signup-otp', { fullname: formData.fullname, email: formData.email, password: formData.password })
      setSuccess(res.data.otp ? `Dev OTP: ${res.data.otp}` : 'OTP sent to your email!')
      setStep('otp')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/verify-signup-otp', { email: formData.email, otp })
      setStep('success')
      setTimeout(() => { if (onClose) onClose(); navigate('/') }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed')
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    setError(''); setSuccess(''); setOtp(''); setLoading(true)
    try {
      const res = await api.post('/send-signup-otp', { fullname: formData.fullname, email: formData.email, password: formData.password })
      setSuccess(res.data.otp ? `Dev OTP: ${res.data.otp}` : 'OTP resent!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP')
    } finally { setLoading(false) }
  }

  const handleOverlayClick = (e) => { if (e.target === e.currentTarget) onClose() }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amazon+Ember:wght@400;700&display=swap');

        .signup-overlay-am {
          position: fixed; inset: 0;
          background: rgba(15,17,17,0.55);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
          animation: fadeInOv2 0.15s ease;
          font-family: 'Amazon Ember', Arial, sans-serif;
          padding: 16px;
        }
        @keyframes fadeInOv2 { from { opacity: 0 } to { opacity: 1 } }

        .signup-box-am {
          background: white;
          border: 1px solid #d5d9d9;
          border-radius: 8px;
          width: 100%;
          max-width: 390px;
          max-height: 92vh;
          overflow-y: auto;
          padding: 22px 22px 28px;
          animation: slideUpAm2 0.2s ease;
          box-shadow: 0 0 0 1px rgba(0,0,0,.05), 0 4px 24px rgba(0,0,0,.12);
          scrollbar-width: thin;
          scrollbar-color: #ddd transparent;
        }
        .signup-box-am::-webkit-scrollbar { width: 4px; }
        .signup-box-am::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

        @keyframes slideUpAm2 { from { transform: translateY(12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

        .signup-logo-am {
          display: block; text-align: center;
          font-size: 26px; font-weight: 700; color: #0F1111;
          margin-bottom: 18px; letter-spacing: -0.5px;
        }
        .signup-logo-am span { color: #FF9900; }

        .signup-title-am { font-size: 26px; font-weight: 400; color: #0F1111; margin-bottom: 4px; }
        .signup-subtitle { font-size: 13px; color: #565959; margin-bottom: 18px; }

        .am-label2 { display: block; font-size: 13px; font-weight: 700; color: #0F1111; margin-bottom: 4px; }

        .am-input2 {
          width: 100%; padding: 7px 10px;
          border: 1px solid #888; border-radius: 3px;
          font-size: 14px; color: #0F1111; outline: none;
          font-family: 'Amazon Ember', Arial, sans-serif;
          box-sizing: border-box; transition: border-color 0.1s, box-shadow 0.1s;
          background: white;
        }
        .am-input2:focus { border-color: #e77600; box-shadow: 0 0 0 3px rgba(228,121,17,0.5); }

        .pw-wrap2 { position: relative; }
        .pw-toggle2 {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #007185;
          font-size: 13px; font-family: 'Amazon Ember', Arial, sans-serif; padding: 0;
        }
        .pw-toggle2:hover { color: #C7511F; text-decoration: underline; }

        .am-btn-primary2 {
          width: 100%;
          background: linear-gradient(to bottom, #FFD814, #F8C200);
          border: 1px solid #FCD200; border-radius: 20px;
          padding: 9px 10px; font-size: 14px; font-weight: 700; color: #0F1111;
          cursor: pointer; font-family: 'Amazon Ember', Arial, sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.1s; margin-top: 4px;
        }
        .am-btn-primary2:hover:not(:disabled) { background: linear-gradient(to bottom, #F7CA00, #EFBD00); }
        .am-btn-primary2:disabled { opacity: 0.6; cursor: not-allowed; }

        .am-btn-secondary2 {
          width: 100%;
          background: linear-gradient(to bottom, #f7f8f8, #e7e9ec);
          border: 1px solid #adb1b8; border-radius: 20px;
          padding: 9px 10px; font-size: 14px; font-weight: 400; color: #0F1111;
          cursor: pointer; font-family: 'Amazon Ember', Arial, sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.1s; margin-top: 8px;
        }
        .am-btn-secondary2:hover:not(:disabled) { background: linear-gradient(to bottom, #e7e9ec, #dde0e5); }
        .am-btn-secondary2:disabled { opacity: 0.6; cursor: not-allowed; }

        .am-error2 {
          background: #fff8f8; border: 1px solid #a31717;
          border-radius: 4px; padding: 10px 12px; font-size: 13px; color: #a31717;
          display: flex; align-items: flex-start; gap: 8px;
          margin-bottom: 14px; line-height: 1.4;
        }

        .am-success2 {
          background: #f0fdf4; border: 1px solid #22c55e;
          border-radius: 4px; padding: 10px 12px; font-size: 13px; color: #166534;
          display: flex; align-items: flex-start; gap: 8px;
          margin-bottom: 14px; line-height: 1.4;
        }

        .am-legal2 { font-size: 12px; color: #565959; line-height: 1.5; margin-top: 14px; }
        .am-legal2 a { color: #007185; text-decoration: none; }
        .am-legal2 a:hover { text-decoration: underline; color: #C7511F; }

        .am-footer-divider2 { border: none; border-top: 1px solid #e7e7e7; margin: 16px -22px 14px; }

        .am-footer-links2 { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; font-size: 12px; }
        .am-footer-links2 a { color: #007185; text-decoration: none; }
        .am-footer-links2 a:hover { text-decoration: underline; }
        .am-footer-links2 span { color: #e7e7e7; }

        .field-group2 { margin-bottom: 12px; }
        .hint-text { font-size: 12px; color: #565959; margin-top: 4px; }

        .strength-bar { display: flex; gap: 4px; margin-top: 5px; }
        .strength-seg { height: 3px; flex: 1; border-radius: 2px; background: #e7e9ec; transition: background 0.2s; }

        .close-am2 {
          position: absolute; top: 12px; right: 14px;
          background: none; border: none; cursor: pointer; color: #565959;
          font-size: 20px; line-height: 1; padding: 0;
        }
        .close-am2:hover { color: #0F1111; }

        .step-indicator { display: flex; align-items: center; gap: 8px; margin-bottom: 18px; }
        .step-dot { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
        .step-dot.active { background: #FF9900; color: #0F1111; }
        .step-dot.done { background: #007600; color: white; }
        .step-dot.pending { background: #e7e9ec; color: #767676; }
        .step-line { flex: 1; height: 2px; background: #e7e9ec; }
        .step-line.done { background: #007600; }

        .otp-input-am {
          width: 100%; padding: 14px; text-align: center;
          font-size: 28px; font-weight: 700; letter-spacing: 12px;
          border: 1px solid #888; border-radius: 3px; outline: none;
          font-family: 'Amazon Ember', Arial, sans-serif; color: #0F1111;
          box-sizing: border-box;
        }
        .otp-input-am:focus { border-color: #e77600; box-shadow: 0 0 0 3px rgba(228,121,17,0.5); }

        .success-am { text-align: center; padding: 20px 0; }
        .success-check { width: 72px; height: 72px; background: #f0fdf4; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }

        .signin-link-am { font-size: 13px; color: #0F1111; }
        .signin-link-am a { color: #007185; text-decoration: none; font-weight: 700; }
        .signin-link-am a:hover { color: #C7511F; text-decoration: underline; }
      `}</style>

      <div className="signup-overlay-am" onClick={handleOverlayClick}>
        <div className="signup-box-am" style={{ position: 'relative' }}>
          <button className="close-am2" onClick={onClose}>×</button>

          {/* Logo */}
          <span className="signup-logo-am">Pick<span>N</span>Go</span>

          {/* Step indicator */}
          <div className="step-indicator">
            <div className={`step-dot ${step === 'form' ? 'active' : (step === 'otp' || step === 'success') ? 'done' : 'pending'}`}>
              {(step === 'otp' || step === 'success') ? '✓' : '1'}
            </div>
            <div className={`step-line ${step === 'otp' || step === 'success' ? 'done' : ''}`} />
            <div className={`step-dot ${step === 'otp' ? 'active' : step === 'success' ? 'done' : 'pending'}`}>
              {step === 'success' ? '✓' : '2'}
            </div>
            <div className={`step-line ${step === 'success' ? 'done' : ''}`} />
            <div className={`step-dot ${step === 'success' ? 'done' : 'pending'}`}>
              {step === 'success' ? '✓' : '3'}
            </div>
          </div>

          {/* ── STEP 1: Form ── */}
          {step === 'form' && (
            <>
              <h1 className="signup-title-am">Create account</h1>
              <p className="signup-subtitle">Shop millions of products with free delivery</p>

              {error && <div className="am-error2"><AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /><span>{error}</span></div>}

              <form onSubmit={handleFormSubmit}>
                <div className="field-group2">
                  <label className="am-label2" htmlFor="su-name">Your name</label>
                  <input id="su-name" name="fullname" className="am-input2" type="text" value={formData.fullname} onChange={handleChange} required placeholder="First and last name" />
                </div>

                <div className="field-group2">
                  <label className="am-label2" htmlFor="su-email">Mobile number or email</label>
                  <input id="su-email" name="email" className="am-input2" type="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
                </div>

                <div className="field-group2">
                  <label className="am-label2" htmlFor="su-phone">Phone (optional)</label>
                  <input id="su-phone" name="phone" className="am-input2" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" />
                </div>

                <div className="field-group2">
                  <label className="am-label2" htmlFor="su-pass">Password</label>
                  <div className="pw-wrap2">
                    <input
                      id="su-pass" name="password" className="am-input2"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password} onChange={handleChange}
                      required minLength={8} placeholder="At least 8 characters"
                      style={{ paddingRight: 60 }}
                    />
                    <button type="button" className="pw-toggle2" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {formData.password && (
                    <div className="strength-bar">
                      {[1,2,3,4].map(i => {
                        const s = formData.password.length
                        const score = s < 6 ? 1 : s < 8 ? 2 : /(?=.*[A-Z])(?=.*[0-9])/.test(formData.password) ? 4 : 3
                        const colors = ['', '#a31717', '#e77600', '#FF9900', '#007600']
                        return <div key={i} className="strength-seg" style={{ background: i <= score ? colors[score] : '#e7e9ec' }} />
                      })}
                    </div>
                  )}
                  <p className="hint-text">Passwords must be at least 8 characters.</p>
                </div>

                <div className="field-group2">
                  <label className="am-label2" htmlFor="su-confirm">Re-enter password</label>
                  <div className="pw-wrap2">
                    <input
                      id="su-confirm" name="confirmPassword" className="am-input2"
                      type={showConfirm ? 'text' : 'password'}
                      value={formData.confirmPassword} onChange={handleChange}
                      required style={{ paddingRight: 60 }}
                      placeholder="Re-enter password"
                    />
                    <button type="button" className="pw-toggle2" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p style={{ fontSize: 12, color: '#a31717', marginTop: 4 }}>Passwords must match</p>
                  )}
                </div>

                <button type="submit" className="am-btn-primary2" disabled={loading}>
                  {loading && <Loader size={15} style={{ animation: 'spin 0.8s linear infinite' }} />}
                  {loading ? 'Sending OTP...' : 'Continue'}
                </button>
              </form>

              <p className="am-legal2">
                By creating an account, you agree to PickNGo's{' '}
                <a href="#">Conditions of Use</a> and{' '}
                <a href="#">Privacy Notice</a>.
              </p>

              <hr className="am-footer-divider2" />
              <p className="signin-link-am" style={{ textAlign: 'center' }}>
                Already have an account?{' '}
                <a href="#" onClick={e => { e.preventDefault(); onClose(); }}>Sign in</a>
              </p>
            </>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 'otp' && (
            <>
              <h1 className="signup-title-am">Verify email</h1>
              <p className="signup-subtitle">
                We've sent a One Time Password (OTP) to <strong>{formData.email}</strong>. Please enter it below.
              </p>

              {error && <div className="am-error2"><AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /><span>{error}</span></div>}
              {success && <div className="am-success2"><CheckCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /><span>{success}</span></div>}

              <form onSubmit={handleOtpSubmit}>
                <div className="field-group2">
                  <label className="am-label2">Enter OTP</label>
                  <input
                    className="otp-input-am"
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required maxLength={6}
                    placeholder="000000"
                    autoFocus
                  />
                  <p className="hint-text" style={{ textAlign: 'center', marginTop: 6 }}>Enter the 6-digit code</p>
                </div>

                <button type="submit" className="am-btn-primary2" disabled={loading || otp.length !== 6}>
                  {loading && <Loader size={15} style={{ animation: 'spin 0.8s linear infinite' }} />}
                  {loading ? 'Verifying...' : 'Create your account'}
                </button>
              </form>

              <button type="button" className="am-btn-secondary2" onClick={handleResend} disabled={loading}>
                Resend OTP
              </button>

              <button
                type="button"
                onClick={() => { setStep('form'); setError(''); setSuccess('') }}
                style={{ background: 'none', border: 'none', color: '#007185', cursor: 'pointer', fontSize: 13, width: '100%', textAlign: 'center', marginTop: 12, fontFamily: 'Amazon Ember, Arial', padding: 0 }}
              >
                ← Change email address
              </button>
            </>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 'success' && (
            <div className="success-am">
              <div className="success-check">
                <CheckCircle size={40} color="#007600" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 400, color: '#0F1111', marginBottom: 8 }}>Account created!</h2>
              <p style={{ fontSize: 14, color: '#565959', marginBottom: 20 }}>Welcome to PickNGo. Redirecting you now...</p>
              <div style={{ width: '100%', height: 3, background: '#e7e9ec', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#FF9900', animation: 'shrinkBar 2s linear forwards', borderRadius: 2 }} />
              </div>
              <style>{`@keyframes shrinkBar { from { width: 100% } to { width: 0% } } @keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          )}

          <hr className="am-footer-divider2" />
          <div className="am-footer-links2">
            <a href="#">Conditions of Use</a>
            <span>|</span>
            <a href="#">Privacy Notice</a>
            <span>|</span>
            <a href="#">Help</a>
          </div>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#767676', marginTop: 8 }}>© 2025 PickNGo</p>
        </div>
      </div>
    </>
  )
}