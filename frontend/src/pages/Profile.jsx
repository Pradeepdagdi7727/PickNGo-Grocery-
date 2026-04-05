import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Loader, AlertCircle, CheckCircle, User, Mail, MapPin, Calendar, Shield, Edit3, X, Eye, EyeOff } from 'lucide-react'
import client from '../api/client'

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    gender: '',
    dob: '',
    address: '',
    password: ''
  })

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchProfile()
  }, [user, navigate])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const base = user?.role === 'admin' ? '/admin' : '/customer'
      const response = await client.get(`${base}/profile`)
      setFormData(prev => ({
        ...prev,
        fullname: response.data.username || '',
        email: response.data.useremail || ''
      }))
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const base = user?.role === 'admin' ? '/admin' : '/customer'
      await client.post(`${base}/profile/edit`, {
        fullname: formData.fullname,
        gender: formData.gender,
        dob: formData.dob,
        password: formData.password,
        address: formData.address
      })
      setMessage('Profile updated successfully!')
      setIsEditing(false)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.Message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (dob) => {
    if (!dob) return ''
    return new Date(dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

        {error && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="flex items-center gap-2 bg-green-100 text-green-700 p-4 rounded-lg mb-6">
            <CheckCircle size={20} />
            <span>{message}</span>
          </div>
        )}

        {/* Avatar Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {getInitials(formData.fullname)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{formData.fullname || 'Your Name'}</h2>
            <p className="text-gray-500 text-sm">{formData.email}</p>
            <span className="inline-flex items-center gap-1 mt-2 bg-orange-100 text-primary text-xs font-semibold px-3 py-1 rounded-full">
              <Shield size={11} />
              {user?.role === 'admin' ? 'Administrator' : 'Customer'}
            </span>
          </div>
        </div>

        {/* Info / Edit Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {!isEditing ? (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Personal Information</h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <User size={20} className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</p>
                    <p className="text-gray-800 font-medium">{formData.fullname || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <Mail size={20} className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email Address</p>
                    <p className="text-gray-800 font-medium">{formData.email || '—'}</p>
                  </div>
                </div>

                {formData.gender && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <User size={20} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</p>
                      <p className="text-gray-800 font-medium">{formData.gender}</p>
                    </div>
                  </div>
                )}

                {formData.dob && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Calendar size={20} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Birth</p>
                      <p className="text-gray-800 font-medium">{formatDate(formData.dob)}</p>
                    </div>
                  </div>
                )}

                {formData.address && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <MapPin size={20} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</p>
                      <p className="text-gray-800 font-medium">{formData.address}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t mt-6 pt-6">
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Edit3 size={17} />
                  Edit Profile
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>
                <button
                  onClick={() => { setIsEditing(false); fetchProfile() }}
                  className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter your address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password (to confirm changes)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password"
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Required to save changes</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <><Loader size={16} className="animate-spin" /> Saving...</> : <><CheckCircle size={16} /> Save Changes</>}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); fetchProfile() }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}