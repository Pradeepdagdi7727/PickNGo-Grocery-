import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Loader, AlertCircle } from 'lucide-react'
import client from '../api/client'
import { formatINR } from '../utils/currency'

export default function Orders() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [statusUpdates, setStatusUpdates] = useState({})
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchOrders()
  }, [user, navigate])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const endpoint = user?.role === 'admin' ? '/admin/orders' : '/customer/orders'
      const response = await client.get(endpoint)
      const orderData = response.data.orders || response.data.order || []
      const mappedOrders = orderData.map(order => ({
        id: order.order_id || order.id,
        total_amount: order.total_amount,
        created_at: order.created_at,
        status: order.status || 'pending',
        items: order.items || [],
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        shipping_address: order.shipping_address || '', // ✅ NEW
        phone: order.phone || '',                        // ✅ NEW
        notes: order.notes || ''                         // ✅ NEW
      }))
      setOrders(mappedOrders)
      setStatusUpdates(
        mappedOrders.reduce((acc, order) => {
          acc[order.id] = order.status || 'pending'
          return acc
        }, {})
      )
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (orderId, value) => {
    setStatusUpdates(prev => ({ ...prev, [orderId]: value }))
  }

  const updateOrderStatus = async (orderId) => {
    try {
      setUpdatingOrderId(orderId)
      setError('')
      setMessage('')
      const nextStatus = statusUpdates[orderId]
      await client.patch('/admin/order/status', {
        order_id: orderId,
        status: nextStatus
      })
      setOrders(prev => prev.map(order => (
        order.id === orderId ? { ...order, status: nextStatus } : order
      )))
      setMessage(`Order #${orderId} updated to ${nextStatus}.`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-primary" size={40} />
          <p className="text-gray-600">Loading {user?.role === 'admin' ? 'all orders' : 'your orders'}...</p>
        </div>
      </div>
    )
  }

  if (error && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-800 mb-4">{error}</p>
          <button onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/')} className="btn-primary">
            {user?.role === 'admin' ? 'Back to Dashboard' : 'Back to Home'}
          </button>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {user?.role === 'admin' ? 'All Orders' : 'Your Orders'}
          </h1>
          <p className="text-gray-600 mb-8">
            {user?.role === 'admin' ? 'No customer orders have been placed yet.' : "You haven't placed any orders yet."}
          </p>
          <button onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/')} className="btn-primary">
            {user?.role === 'admin' ? 'Back to Dashboard' : 'Start Shopping'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          {user?.role === 'admin' ? 'All Orders' : 'Your Orders'}
        </h1>

        {error && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
            {message}
          </div>
        )}

        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">

              {/* Customer Info (Admin only) */}
              {user?.role === 'admin' && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-gray-600">Customer</p>
                  <p className="text-base font-semibold text-gray-800">
                    {order.customer_name || 'Unknown Customer'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.customer_email || 'No email available'}
                  </p>

                  {/* ✅ ADDRESS, PHONE, NOTES */}
                  {order.shipping_address && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-semibold">📍 Address:</span> {order.shipping_address}
                    </p>
                  )}
                  {order.phone && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-semibold">📞 Phone:</span> {order.phone}
                    </p>
                  )}
                  {order.notes && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-semibold">📝 Notes:</span> {order.notes}
                    </p>
                  )}
                </div>
              )}

              {/* Order Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 pb-4 border-b">
                <div>
                  <p className="text-sm font-medium text-gray-600">Order ID</p>
                  <p className="text-sm font-bold text-gray-800 break-all">
                    #{order.id?.slice(-8)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Order Date</p>
                  <p className="text-lg font-bold text-gray-800">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-lg font-bold text-primary">{formatINR(order.total_amount || 0)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className={`text-lg font-bold ${
                    order.status === 'delivered'  ? 'text-green-600' :
                    order.status === 'shipped'    ? 'text-blue-600'  :
                    order.status === 'pending'    ? 'text-yellow-600':
                    order.status === 'cancelled'  ? 'text-red-600'   :
                    'text-gray-600'
                  }`}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                  </p>
                </div>
              </div>

              {/* ✅ Customer view — apna address dekhe */}
              {user?.role !== 'admin' && order.shipping_address && (
                <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm text-gray-700">
                  <p><span className="font-semibold">📍 Delivery Address:</span> {order.shipping_address}</p>
                  {order.phone && <p className="mt-1"><span className="font-semibold">📞 Phone:</span> {order.phone}</p>}
                  {order.notes && <p className="mt-1"><span className="font-semibold">📝 Notes:</span> {order.notes}</p>}
                </div>
              )}

              {/* Items */}
              {order.items && order.items.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-gray-800 mb-3">Items:</p>
                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-gray-700">
                        <span>{item.product_name || 'Product'} x {item.quantity}</span>
                        <span>{formatINR(item.total_price || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Status Update */}
              {user?.role === 'admin' && (
                <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <label className="text-sm font-medium text-gray-700">Update Status</label>
                    <select
                      value={statusUpdates[order.id] || order.status || 'pending'}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <button
                    onClick={() => updateOrderStatus(order.id)}
                    disabled={updatingOrderId === order.id}
                    className="btn-primary disabled:opacity-50"
                  >
                    {updatingOrderId === order.id ? 'Updating...' : 'Save Status'}
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/')} className="btn-primary">
            {user?.role === 'admin' ? 'Back to Dashboard' : 'Continue Shopping'}
          </button>
        </div>
      </div>
    </div>
  )
}