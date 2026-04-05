const DEFAULT_API_URL = 'http://localhost:4000'
const API_BASE_URL = ((import.meta?.env?.VITE_API_URL || '').trim()) || DEFAULT_API_URL

export const DEFAULT_PRODUCT_IMAGE = '/no-image.png'

export const resolveImageSrc = (image) => {
  if (!image) return DEFAULT_PRODUCT_IMAGE
  if (image.startsWith('data:')) return image
  if (image.includes('media-amazon.com')) {
    return `https://images.weserv.nl/?url=${encodeURIComponent(image)}&output=jpg`
  }
  if (image.startsWith('http://') || image.startsWith('https://')) return image
  return `${API_BASE_URL}${image}`
}