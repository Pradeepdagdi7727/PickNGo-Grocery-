import React, { createContext, useState, useEffect } from 'react'
import client from '../api/client'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await client.post('/login', { email, password })
      const { token } = response.data
      const loggedInUser = response.data.user || {
        email,
        role: response.data.role || 'customer'
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(loggedInUser))
      setUser(loggedInUser)
      return loggedInUser
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const signup = async (userData) => {
    try {
      const signupData = {
        fullname: userData.name,
        email: userData.email,
        password: userData.password
      }
      const response = await client.post('/register', signupData)
      
      // Auto login after signup
      if (response.data.message === 'User created successfully') {
        const loginResponse = await client.post('/login', { 
          email: userData.email, 
          password: userData.password 
        })
        const { token } = loginResponse.data
        const user = loginResponse.data.user || {
          email: userData.email,
          role: loginResponse.data.role || 'customer',
          fullname: userData.name
        }
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        setUser(user)
      }
      return true
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
