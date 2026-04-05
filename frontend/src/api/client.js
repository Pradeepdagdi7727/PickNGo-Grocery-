import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// developer debug: check baseURL and final request URL
console.log('[API client] resolved baseURL:', API_BASE_URL)

client.interceptors.request.use((config) => {
  // enforce valid base URL at request time
  if (!config.baseURL || !/^https?:\/\//i.test(config.baseURL)) {
    console.warn('[API client] invalid baseURL', config.baseURL, '-> resetting to', DEFAULT_API_URL)
    config.baseURL = DEFAULT_API_URL
  }
  console.log('[API client] request', config.method, `${config.baseURL}${config.url}`)
  return config
}, (error) => {
  return Promise.reject(error)
})

// Handle responses
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  return config
}, (error) => {
  return Promise.reject(error)
})

// Handle responses
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || ''

    if (
      status === 401 ||
      (status === 403 && /invalid token|token missing|access denied/i.test(message))
    ) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default client
