import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import ProductDetail from './pages/ProductDetail'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import AdminProducts from './pages/AdminProducts'
import ProtectedRoute from './pages/ProtectedRoute'

function App() {
  // 'login', 'signup' या null
  const [authMode, setAuthMode] = useState(null)

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          {/* Auth Modals Logic merged */}
          {authMode === 'login' && (
            <Login 
              onClose={() => setAuthMode(null)} 
              onSwitchToSignup={() => setAuthMode('signup')} 
            />
          )}
          {authMode === 'signup' && (
            <Signup 
              onClose={() => setAuthMode(null)} 
              onSwitchToLogin={() => setAuthMode('login')} 
            />
          )}

          <Navbar
            onLoginClick={() => setAuthMode('login')}
            onSignupClick={() => setAuthMode('signup')}
          />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route path="/cart" element={
              <ProtectedRoute onLoginRequired={() => setAuthMode('login')}>
                <Cart />
              </ProtectedRoute>
            } />

            <Route path="/checkout" element={
              <ProtectedRoute onLoginRequired={() => setAuthMode('login')}>
                <Checkout />
              </ProtectedRoute>
            } />

            <Route path="/orders" element={
              <ProtectedRoute onLoginRequired={() => setAuthMode('login')}>
                <Orders />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute onLoginRequired={() => setAuthMode('login')}>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute requiredRole="admin"><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute requiredRole="admin"><Orders /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App