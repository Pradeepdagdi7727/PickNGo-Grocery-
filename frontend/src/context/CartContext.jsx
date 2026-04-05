import React, { createContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth()
  const [cart, setCart] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (authLoading) return
    setLoaded(false)
    if (user) {
      const key = `cart_${user.id}`
      let storedCart = localStorage.getItem(key)
      if (!storedCart) {
        const allKeys = Object.keys(localStorage).filter(k => k.startsWith('cart_') && k !== key)
        for (const oldKey of allKeys) {
          const oldData = localStorage.getItem(oldKey)
          if (oldData && oldData !== '[]') {
            storedCart = oldData
            localStorage.setItem(key, oldData)
            localStorage.removeItem(oldKey)
            break
          }
        }
      }
      let parsed = []
      if (storedCart) {
        try { parsed = JSON.parse(storedCart) } catch { parsed = [] }
      }
      setCart(parsed)
      setLoaded(true)
    } else {
      setCart([])
      setLoaded(true)
    }
  }, [user, authLoading])

  useEffect(() => {
    if (user && loaded) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart))
    }
  }, [cart, user, loaded])

  const addToCart = (product) => {
    if (!user) return
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(prev =>
        prev.map(item => item.id === productId ? { ...item, quantity } : item)
      )
    }
  }

  const clearCart = () => setCart([])

  const getTotalPrice = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{
      cart, loaded, addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = React.useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
