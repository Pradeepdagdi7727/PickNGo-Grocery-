import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Loader, Mail, Shield } from 'lucide-react'
import api from '../api/client'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('email') // 'email' or 'otp'
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [devOtp, setDevOtp] = useState('')
  const navigate = useNavigate()

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await api.post('/forgot-password', { email })
      if (response.data.otp) {
        // Development mode - show OTP directly
        setDevOtp(response.data.otp)
        setSuccess(`OTP generated! For development: ${response.data.otp}${response.data.note ? '\n\n' + response.data.note : ''}`)
      } else {
        setSuccess('OTP sent to your email! Please check your inbox.')
      }
      setStep('otp')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/verify-otp', { email, otp })
      // Navigate to reset password page with session token
      navigate(`/reset-password/${response.data.sessionToken}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = () => {
    setStep('email')
    setOtp('')
    setError('')
    setSuccess('')
    setDevOtp('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-blue-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <Shield size={48} className="mx-auto text-primary mb-4" />
          <h2 className="text-3xl font-bold text-secondary mb-2">
            {step === 'email' ? 'Forgot Password' : 'Verify OTP'}
          </h2>
          <p className="text-gray-600">
            {step === 'email'
              ? 'Enter your email to receive OTP'
              : 'Enter the 6-digit OTP sent to your email'
            }
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">
            <span>{success}</span>
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {loading && <Loader size={20} className="animate-spin" />}
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-center text-2xl tracking-widest"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full btn-primary flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {loading && <Loader size={20} className="animate-spin" />}
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              className="w-full text-primary hover:underline text-sm mt-2"
            >
              Didn't receive OTP? Resend
            </button>
          </form>
        )}

        <p className="text-center text-gray-600 mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}