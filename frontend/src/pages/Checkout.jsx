import React, { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Loader, ArrowLeft } from 'lucide-react'
import client from '../api/client'
import { formatINR } from '../utils/currency'

export default function Checkout() {
  const { cart, getTotalPrice, clearCart, loaded } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    fullname: user?.fullname || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    deliveryNotes: ''
  })

  // FIX: Cart load hone ke baad stale error clear karo
  useEffect(() => {
    if (loaded && cart.length > 0) {
      setError('')
    }
  }, [loaded, cart])

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin" size={48} />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <div className="mb-4">
            <svg className="w-20 h-20 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
          <p className="text-gray-600 mb-2">Thank you for your order.</p>
          <p className="text-sm text-gray-500 mb-6">Redirecting to your orders...</p>
          <button onClick={() => navigate('/orders')} className="btn-primary w-full">
            View Orders
          </button>
        </div>
      </div>
    )
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const originalSubtotal = cart.reduce((sum, item) => {
    const orig = item.originalPrice && item.originalPrice > item.price ? item.originalPrice : item.price
    return sum + (orig * item.quantity)
  }, 0)
  const totalSavings = originalSubtotal - subtotal
  const hasSavings = totalSavings > 0.01
  const tax = subtotal * 0.1
  const finalTotal = subtotal + tax

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!cart || cart.length === 0) {
      setError('Your cart is empty')
      return
    }

    if (!formData.phone || !formData.address || !formData.city || !formData.postalCode) {
      setError('Please fill in all delivery details')
      return
    }

    setLoading(true)
    try {
      const response = await client.post('/customer/order', {
        address: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
        phone: formData.phone,
        notes: formData.deliveryNotes,
        cart: cart.map(item => ({
          product_id: item.id || item.product_id,
          quantity: item.quantity,
          price: item.price
        }))
      })

      if (response.data?.message === 'Order placed successfully' || response.data?.order_id) {
        clearCart()
        setSuccess(true)
        setTimeout(() => navigate('/orders'), 2000)
      } else {
        setError(response.data?.message || 'Failed to place order')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (loaded && cart.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products before checking out</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-primary hover:text-secondary mb-6 transition"
        >
          <ArrowLeft size={20} />
          Back to Cart
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

              {error && (
                <div className="flex items-center gap-2 bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input type="text" name="fullname" value={formData.fullname} onChange={handleChange} disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Delivery Address</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                      <input type="text" name="address" value={formData.address} onChange={handleChange} required
                        placeholder="123 Main Street"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                        <input type="text" name="city" value={formData.city} onChange={handleChange} required
                          placeholder="Mumbai"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
                        <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} required
                          placeholder="400001"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Notes (Optional)</label>
                      <textarea name="deliveryNotes" value={formData.deliveryNotes} onChange={handleChange} rows="3"
                        placeholder="Please ring the doorbell..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Order Items</h2>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {cart.map(item => {
                      const hasDiscount = item.originalPrice && item.originalPrice > item.price
                      return (
                        <div key={item.id} className="flex justify-between text-gray-700 pb-2 border-b">
                          <span>{item.name} x {item.quantity}</span>
                          <div style={{ textAlign: 'right' }}>
                            {hasDiscount && (
                              <div style={{ fontSize: 12, color: '#999', textDecoration: 'line-through' }}>
                                {formatINR(item.originalPrice * item.quantity)}
                              </div>
                            )}
                            <span style={{ color: hasDiscount ? '#CC0C39' : 'inherit', fontWeight: hasDiscount ? 700 : 400 }}>
                              {formatINR(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 py-3">
                  {loading && <Loader size={20} className="animate-spin" />}
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                {hasSavings && (
                  <div className="flex justify-between text-gray-500" style={{ fontSize: 13 }}>
                    <span>Original Price</span>
                    <span style={{ textDecoration: 'line-through' }}>{formatINR(originalSubtotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {hasSavings && (
                  <div className="flex justify-between" style={{ color: '#007600', fontWeight: 600, fontSize: 14 }}>
                    <span>🎉 You Save</span>
                    <span>-{formatINR(totalSavings)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (10%)</span>
                  <span>{formatINR(tax)}</span>
                </div>
                <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-primary">{formatINR(finalTotal)}</span>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Items:</span> {cart.reduce((t, i) => t + i.quantity, 0)} item{cart.reduce((t, i) => t + i.quantity, 0) !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-semibold">Delivery:</span> Free shipping across India
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}