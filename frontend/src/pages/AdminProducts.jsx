import React, { useEffect, useState } from 'react'
import { AlertCircle, Loader, Package, Pencil, PlusCircle, Trash2, X, Search, Upload, CheckCircle, Tag, Percent } from 'lucide-react'
import client from '../api/client'
import { formatINR } from '../utils/currency'
import { resolveImageSrc, DEFAULT_PRODUCT_IMAGE } from '../utils/imageHelper'

const initialForm = {
  name: '', description: '', price: '', category: '', stock: '', image: '', mediaUrls: '',
  discount: { type: 'none', value: '', startDate: '', endDate: '' }
}

const isDiscountActive = (discount) => {
  if (!discount || discount.type === 'none' || !discount.value) return false
  const now = new Date()
  const start = discount.startDate ? new Date(discount.startDate) : null
  const end = discount.endDate ? new Date(discount.endDate) : null
  if (start && now < start) return false
  if (end && now > end) return false
  return true
}

const getDiscountedPrice = (price, discount) => {
  if (!isDiscountActive(discount)) return price
  const original = parseFloat(price) || 0
  if (discount.type === 'percentage') return original * (1 - parseFloat(discount.value) / 100)
  if (discount.type === 'fixed') return Math.max(0, original - parseFloat(discount.value))
  return original
}

export default function AdminProducts() {
  const [products, setProducts]               = useState([])
  const [formData, setFormData]               = useState(initialForm)
  const [loading, setLoading]                 = useState(true)
  const [saving, setSaving]                   = useState(false)
  const [error, setError]                     = useState('')
  const [message, setMessage]                 = useState('')
  const [editingId, setEditingId]             = useState(null)
  const [selectedFiles, setSelectedFiles]     = useState([])
  const [search, setSearch]                   = useState('')
  const [filterStatus, setFilterStatus]       = useState('all')
  const [showForm, setShowForm]               = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [modalImageIndex, setModalImageIndex] = useState(0)

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true); setError('')
      const res = await client.get('/admin/products')
      setProducts(res.data.Allproduct || res.data.products || [])
    } catch (err) {
      setError(err.response?.status === 403 ? 'Admin access denied.' : 'Failed to load products')
    } finally { setLoading(false) }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('discount.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({ ...prev, discount: { ...prev.discount, [field]: value } }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e) => setSelectedFiles(Array.from(e.target.files || []))

  const resetForm = () => {
    setFormData(initialForm); setEditingId(null); setSelectedFiles([]); setShowForm(false)
  }

  const handleEdit = (product) => {
    setError(''); setMessage(''); setEditingId(product._id); setSelectedFiles([])
    setFormData({
      name: product.name || '', description: product.description || '',
      price: product.price || '', category: product.category || '',
      stock: product.stock ?? '', image: product.image || '',
      mediaUrls: Array.isArray(product.media) ? product.media.map(i => i.url).join('\n') : (product.image || ''),
      discount: product.discount || { type: 'none', value: '', startDate: '', endDate: '' }
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setMessage('')
    try {
      const payload = new FormData()
      payload.append('name', formData.name)
      payload.append('description', formData.description)
      payload.append('price', Number(formData.price))
      payload.append('category', formData.category)
      payload.append('stock', Number(formData.stock))
      payload.append('image', formData.image || '')
      payload.append('mediaUrls', formData.mediaUrls || '')
      payload.append('discount', JSON.stringify(formData.discount))
      selectedFiles.forEach(f => payload.append('mediaFiles', f))
      if (editingId) {
        payload.append('id', editingId)
        await client.patch('/admin/update', payload)
        setMessage('Product updated successfully')
      } else {
        await client.post('/admin/addproduct', payload)
        setMessage('Product added successfully')
      }
      resetForm(); fetchProducts()
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${editingId ? 'update' : 'add'} product`)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      setError(''); setMessage('')
      await client.delete(`/admin/delete/${id}`)
      setProducts(prev => prev.filter(p => p._id !== id))
      setMessage('Product deleted successfully')
      setSelectedProduct(null)
    } catch { setError('Failed to delete product') }
  }

  const getStockStatus = (stock) => {
    const s = stock ?? 0
    if (s <= 0) return { label: 'Out of Stock', color: '#B12704', bg: '#fdf0ee' }
    if (s < 10) return { label: `Low: ${s}`, color: '#c7811a', bg: '#fef9ee' }
    return { label: `In Stock: ${s}`, color: '#007600', bg: '#f0fff0' }
  }

  const filtered = products.filter(p => {
    const matchSearch = (p.name||'').toLowerCase().includes(search.toLowerCase()) || (p.category||'').toLowerCase().includes(search.toLowerCase())
    const s = p.stock ?? 0
    const matchFilter = filterStatus==='all' ? true : filterStatus==='out' ? s<=0 : filterStatus==='low' ? s>0&&s<10 : s>=10
    return matchSearch && matchFilter
  })

  const outCount        = products.filter(p => (p.stock??0)<=0).length
  const lowCount        = products.filter(p => (p.stock??0)>0&&(p.stock??0)<10).length
  const discountedCount = products.filter(p => isDiscountActive(p.discount)).length

  const openModal = (product) => { setSelectedProduct(product); setModalImageIndex(0) }

  const getModalImages = (product) => {
    if (!product) return []
    const urls = []
    if (Array.isArray(product.media) && product.media.length > 0) {
      product.media.forEach(m => { if (m.url) urls.push(m.url) })
    } else if (product.image) { urls.push(product.image) }
    return urls
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f3f3', fontFamily: "Arial, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }

        .amz-breadcrumb {
          background: #232f3e; padding: 6px 24px;
        }

        .amz-filter-chip {
          padding: 5px 14px; border-radius: 20px; border: 1px solid #d5d9d9;
          font-size: 0.8rem; font-weight: 600; cursor: pointer;
          background: white; transition: all 0.15s; color: #333;
          font-family: Arial, sans-serif;
        }
        .amz-filter-chip:hover { border-color: #FF9900; color: #FF9900; }
        .amz-filter-chip.active { background: #FF9900; color: #131921; border-color: #FF9900; }

        .amz-panel {
          background: white; border: 1px solid #ddd;
          border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .amz-product-card {
          background: white; border: 1px solid #ddd; border-radius: 4px;
          overflow: hidden; cursor: pointer; transition: all 0.2s ease;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .amz-product-card:hover {
          border-color: #FF9900;
          box-shadow: 0 4px 16px rgba(255,153,0,0.2);
          transform: translateY(-2px);
        }

        .amz-discount-badge {
          position: absolute; top: 8px; left: 8px; z-index: 2;
          background: #CC0C39; color: white;
          padding: 3px 8px; font-size: 0.7rem; font-weight: 800;
          border-radius: 2px;
        }

        .amz-field {
          width: 100%; padding: 8px 12px;
          border: 1px solid #a6a6a6; border-radius: 3px;
          font-size: 0.875rem; outline: none;
          font-family: Arial, sans-serif;
          transition: border-color 0.15s, box-shadow 0.15s;
          background: white; color: #131921;
        }
        .amz-field:focus {
          border-color: #FF9900;
          box-shadow: 0 0 0 3px rgba(255,153,0,0.15);
        }
        .amz-field::placeholder { color: #999; }
        .amz-label {
          display: block; font-size: 0.78rem; font-weight: 700;
          color: #555; margin-bottom: 5px;
        }

        .amz-btn-primary {
          background: linear-gradient(to bottom, #FFD814, #FF9900);
          border: 1px solid #FFA41C; border-radius: 3px;
          padding: 10px 20px; font-weight: 700; font-size: 0.875rem;
          cursor: pointer; color: #131921;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.15s; font-family: Arial, sans-serif;
          box-shadow: 0 2px 5px rgba(213,139,0,0.3);
        }
        .amz-btn-primary:hover:not(:disabled) {
          background: linear-gradient(to bottom, #F0C814, #e68a00);
        }
        .amz-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .amz-btn-secondary {
          background: linear-gradient(to bottom, #f7f8fa, #e7e9ec);
          border: 1px solid #adb1b8; border-radius: 3px;
          padding: 8px 16px; font-weight: 600; font-size: 0.82rem;
          cursor: pointer; color: #333;
          display: flex; align-items: center; gap: 6px;
          transition: all 0.15s; font-family: Arial, sans-serif;
        }
        .amz-btn-secondary:hover { background: linear-gradient(to bottom, #e7e9ec, #d9dce1); }

        .amz-btn-danger {
          background: white; border: 1px solid #CC0C39; border-radius: 3px;
          padding: 7px 14px; font-size: 0.78rem; font-weight: 700; color: #CC0C39;
          cursor: pointer; transition: all 0.15s; font-family: Arial, sans-serif;
          display: flex; align-items: center; gap: 5px;
        }
        .amz-btn-danger:hover { background: #fff0f0; }

        .amz-btn-edit {
          background: white; border: 1px solid #adb1b8; border-radius: 3px;
          padding: 7px 14px; font-size: 0.78rem; font-weight: 700; color: #333;
          cursor: pointer; transition: all 0.15s; font-family: Arial, sans-serif;
          display: flex; align-items: center; gap: 5px;
        }
        .amz-btn-edit:hover { background: #f0f0f0; border-color: #888; }

        .amz-alert-success {
          background: #f0fff0; border: 1px solid #007600; border-radius: 3px;
          padding: 12px 16px; color: #007600; font-size: 0.875rem; font-weight: 500;
          display: flex; align-items: center; gap: 8px;
        }
        .amz-alert-error {
          background: #fff8f5; border: 1px solid #B12704; border-radius: 3px;
          padding: 12px 16px; color: #B12704; font-size: 0.875rem; font-weight: 500;
          display: flex; align-items: center; gap: 8px;
        }

        .amz-upload-zone {
          border: 2px dashed #adb1b8; border-radius: 3px; padding: 20px;
          text-align: center; background: #fafafa; cursor: pointer; transition: all 0.2s;
        }
        .amz-upload-zone:hover { border-color: #FF9900; background: #fffbf0; }

        .amz-section-heading {
          font-size: 1.1rem; font-weight: 700; color: #131921;
          padding-bottom: 8px; border-bottom: 2px solid #FF9900;
          margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
        }

        .amz-search-bar {
          background: white; border: 2px solid #FF9900;
          border-radius: 4px; display: flex; overflow: hidden;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .amz-search-bar input {
          flex: 1; padding: 10px 16px; border: none; outline: none;
          font-size: 0.9rem; font-family: Arial, sans-serif; color: #131921;
        }
        .amz-search-btn {
          background: #FF9900; border: none; padding: 0 18px;
          cursor: pointer; display: flex; align-items: center; transition: background 0.15s;
        }
        .amz-search-btn:hover { background: #e68a00; }

        .amz-modal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.65);
          display: flex; align-items: center; justify-content: center; padding: 16px;
        }
        @keyframes amzModalIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        .amz-modal-in { animation: amzModalIn 0.2s ease forwards; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.25s ease forwards; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @media (max-width:640px) {
          .amz-modal-grid { grid-template-columns: 1fr !important; }
          .amz-modal-img { border-radius: 4px 4px 0 0 !important; }
        }
      `}</style>

      {/* ── Breadcrumb ── */}
      <div className="amz-breadcrumb">
        <span style={{ color: '#ccc', fontSize: '0.78rem' }}>
          Admin &rsaquo; <span style={{ color: '#FF9900' }}>Manage Products</span>
        </span>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 16px' }}>

        {/* ── Page Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#131921', margin: '0 0 4px' }}>Manage Products</h1>
            <p style={{ color: '#565959', fontSize: '0.85rem', margin: 0 }}>
              {products.length} products
              {outCount > 0 && <span style={{ color: '#B12704', fontWeight: 700 }}> · {outCount} out of stock</span>}
              {lowCount > 0 && <span style={{ color: '#c7811a', fontWeight: 700 }}> · {lowCount} low stock</span>}
              {discountedCount > 0 && <span style={{ color: '#CC0C39', fontWeight: 700 }}> · {discountedCount} on sale</span>}
            </p>
          </div>
          {!showForm && (
            <button className="amz-btn-primary" onClick={() => { resetForm(); setShowForm(true) }}>
              <PlusCircle size={16} /> Add New Product
            </button>
          )}
        </div>

        {/* ── Alerts ── */}
        {error   && <div className="amz-alert-error   fade-up" style={{ marginBottom: 16 }}><AlertCircle size={16} />{error}</div>}
        {message && <div className="amz-alert-success fade-up" style={{ marginBottom: 16 }}><CheckCircle size={16} />{message}</div>}

        {/* ── Add / Edit Form ── */}
        {showForm && (
          <div className="amz-panel fade-up" style={{ padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {editingId ? <Pencil size={18} color="#FF9900" /> : <PlusCircle size={18} color="#FF9900" />}
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#131921' }}>
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </span>
              </div>
              <button className="amz-btn-secondary" onClick={resetForm}><X size={14} />Cancel</button>
            </div>

            <div style={{ height: 1, background: '#e7e9ec', marginBottom: 20 }} />

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
                <div>
                  <label className="amz-label">Product Name *</label>
                  <input className="amz-field" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Fresh Apples" required />
                </div>
                <div>
                  <label className="amz-label">Category *</label>
                  <input className="amz-field" type="text" name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Fruits" required />
                </div>
                <div>
                  <label className="amz-label">Price (₹) *</label>
                  <input className="amz-field" type="number" min="0" step="0.01" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" required />
                </div>
                <div>
                  <label className="amz-label">Stock Quantity *</label>
                  <input className="amz-field" type="number" min="0" name="stock" value={formData.stock} onChange={handleChange} placeholder="0" required />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="amz-label">Primary Image URL</label>
                  <input className="amz-field" type="text" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="amz-label">Extra Media URLs (one per line)</label>
                  <textarea className="amz-field" name="mediaUrls" value={formData.mediaUrls} onChange={handleChange} rows="3" placeholder="https://image1.jpg&#10;https://video.mp4" style={{ resize: 'vertical' }} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="amz-label">Upload from Device</label>
                  <div className="amz-upload-zone" onClick={() => document.getElementById('file-upload').click()}>
                    <Upload size={20} color="#FF9900" style={{ margin: '0 auto 8px', display: 'block' }} />
                    <p style={{ fontSize: '0.82rem', color: '#FF9900', fontWeight: 700, margin: '0 0 4px' }}>
                      {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Click to upload images / videos'}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: '#888', margin: 0 }}>Supports JPG, PNG, MP4, MOV</p>
                    <input id="file-upload" type="file" accept="image/*,video/*" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                  </div>
                </div>

                {/* Discount */}
                <div style={{ gridColumn: '1 / -1', background: '#fffbf0', border: '1px solid #FFA41C', borderRadius: 3, padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Tag size={16} color="#c7811a" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c7811a' }}>Discount Settings</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
                    <div>
                      <label className="amz-label">Discount Type</label>
                      <select name="discount.type" value={formData.discount.type} onChange={handleChange} className="amz-field">
                        <option value="none">No Discount</option>
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    {formData.discount.type !== 'none' && (
                      <>
                        <div>
                          <label className="amz-label">{formData.discount.type === 'percentage' ? 'Discount %' : 'Discount Amount (₹)'}</label>
                          <input type="number" min="0" name="discount.value" value={formData.discount.value} onChange={handleChange} className="amz-field" placeholder={formData.discount.type === 'percentage' ? 'e.g. 20' : 'e.g. 50'} required />
                        </div>
                        <div>
                          <label className="amz-label">Start Date (Optional)</label>
                          <input type="date" name="discount.startDate" value={formData.discount.startDate} onChange={handleChange} className="amz-field" />
                        </div>
                        <div>
                          <label className="amz-label">End Date (Optional)</label>
                          <input type="date" name="discount.endDate" value={formData.discount.endDate} onChange={handleChange} className="amz-field" />
                        </div>
                        {formData.discount.value && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Percent size={14} color="#007600" />
                            <span style={{ fontSize: '0.82rem', color: '#007600', fontWeight: 600 }}>
                              Final: ₹{getDiscountedPrice(formData.price, formData.discount).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Media Preview */}
                {(formData.mediaUrls || formData.image || selectedFiles.length > 0) && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="amz-label">Media Preview</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(90px,1fr))', gap: 8 }}>
                      {[
                        ...(formData.mediaUrls ? formData.mediaUrls.split('\n').map(u=>u.trim()).filter(Boolean).map(u=>({url:u,type:/\.(mp4|webm|ogg|mov)$/i.test(u)?'video':'image'})) : []),
                        ...selectedFiles.map(f=>({url:URL.createObjectURL(f),type:f.type.startsWith('video/')?'video':'image'}))
                      ].slice(0,6).map((m,i)=>(
                        <div key={i} style={{ height:80, borderRadius:3, overflow:'hidden', border:'1px solid #ddd' }}>
                          {m.type==='video'
                            ? <video src={m.url} controls style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                            : <img src={resolveImageSrc(m.url)} alt="" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=DEFAULT_PRODUCT_IMAGE}} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="amz-label">Description *</label>
                  <textarea className="amz-field" name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Describe your product..." required style={{ resize: 'vertical' }} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <button type="submit" className="amz-btn-primary" disabled={saving} style={{ width: '100%', padding: '12px 0' }}>
                    {saving && <Loader size={15} style={{ animation: 'spin 0.8s linear infinite' }} />}
                    {saving ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? '✓ Update Product' : '+ Add Product')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ── Products Section ── */}
        <div className="amz-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="amz-search-bar" style={{ flex: 1, minWidth: 220 }}>
              <input placeholder="Search by name or category..." value={search} onChange={e => setSearch(e.target.value)} />
              <button className="amz-search-btn"><Search size={16} color="#131921" /></button>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'All' },
                { key: 'ok',  label: '✅ In Stock' },
                { key: 'low', label: '⚠️ Low Stock' },
                { key: 'out', label: '🚫 Out of Stock' }
              ].map(f => (
                <button key={f.key} className={`amz-filter-chip ${filterStatus===f.key?'active':''}`} onClick={() => setFilterStatus(f.key)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="amz-section-heading">
            <Package size={18} color="#FF9900" />
            Current Inventory
            <span style={{ marginLeft: 'auto', fontSize: '0.78rem', fontWeight: 600, color: '#888', background: '#f3f3f3', padding: '3px 10px', borderRadius: 20, border: '1px solid #ddd' }}>
              {filtered.length} of {products.length}
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ width: 40, height: 40, border: '3px solid #ddd', borderTopColor: '#FF9900', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ color: '#888' }}>Loading products...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
              <Package size={44} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontWeight: 700, color: '#131921' }}>No products found</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
              {filtered.map(product => {
                const stockInfo       = getStockStatus(product.stock)
                const discountActive  = isDiscountActive(product.discount)
                const discountedPrice = discountActive ? getDiscountedPrice(product.price, product.discount) : null
                const discountPercent = discountActive && product.discount.type==='percentage'
                  ? product.discount.value
                  : discountActive && product.discount.type==='fixed' && product.price>0
                  ? ((product.discount.value/product.price)*100).toFixed(0) : null

                return (
                  <div key={product._id} className="amz-product-card fade-up" onClick={() => openModal(product)}>
                    {discountActive && <div className="amz-discount-badge">{discountPercent ? `-${discountPercent}%` : 'SALE'}</div>}

                    <div style={{ position: 'relative', height: 180, background: '#f9f9f9', overflow: 'hidden', borderBottom: '1px solid #eee' }}>
                      {product.media?.[0]?.type==='video'
                        ? <video src={resolveImageSrc(product.media[0].url)} controls style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        : <img
                            src={resolveImageSrc(product.media?.[0]?.url || product.image)}
                            alt={product.name}
                            onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=DEFAULT_PRODUCT_IMAGE}}
                            style={{ width:'100%', height:'100%', objectFit:'contain', padding:8, transition:'transform 0.3s' }}
                            onMouseOver={e=>e.currentTarget.style.transform='scale(1.05)'}
                            onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}
                          />
                      }
                    </div>

                    <div style={{ padding: '12px 14px' }}>
                      <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#131921', marginBottom: 4, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.name}
                      </h3>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#565959', background: '#f3f3f3', border: '1px solid #ddd', padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginBottom: 8 }}>
                        {product.category || 'Uncategorized'}
                      </span>
                      <div style={{ marginBottom: 8 }}>
                        {discountActive ? (
                          <>
                            <span style={{ fontSize: '0.75rem', color: '#565959', textDecoration: 'line-through', marginRight: 6 }}>{formatINR(product.price)}</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#B12704' }}>{formatINR(discountedPrice)}</span>
                            {discountPercent && <span style={{ fontSize: '0.7rem', color: '#CC0C39', fontWeight: 700, marginLeft: 6 }}>({discountPercent}% off)</span>}
                          </>
                        ) : (
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#131921' }}>{formatINR(product.price)}</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: stockInfo.color, marginBottom: 10 }}>{stockInfo.label}</div>
                      <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                        <button className="amz-btn-edit" onClick={() => handleEdit(product)} style={{ flex: 1, justifyContent: 'center' }}>
                          <Pencil size={13} /> Edit
                        </button>
                        <button className="amz-btn-danger" onClick={() => handleDelete(product._id)} style={{ flex: 1, justifyContent: 'center' }}>
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {selectedProduct && (() => {
        const modalImages     = getModalImages(selectedProduct)
        const activeImg       = modalImages[modalImageIndex] || selectedProduct.image
        const stockInfo       = getStockStatus(selectedProduct.stock)
        const discountActive  = isDiscountActive(selectedProduct.discount)
        const discountedPrice = discountActive ? getDiscountedPrice(selectedProduct.price, selectedProduct.discount) : null
        const discountPercent = discountActive && selectedProduct.discount.type==='percentage'
          ? selectedProduct.discount.value
          : discountActive && selectedProduct.discount.type==='fixed' && selectedProduct.price>0
          ? ((selectedProduct.discount.value/selectedProduct.price)*100).toFixed(0) : null

        return (
          <div className="amz-modal-overlay" onClick={() => setSelectedProduct(null)}>
            <div className="amz-modal-in" onClick={e => e.stopPropagation()}
              style={{ background: 'white', borderRadius: 4, maxWidth: 860, width: '100%', maxHeight: '92vh', overflowY: 'auto', position: 'relative', boxShadow: '0 8px 40px rgba(0,0,0,0.3)', border: '1px solid #ddd' }}>

              <button onClick={() => setSelectedProduct(null)}
                style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, background: 'white', border: '1px solid #ddd', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={17} color="#565959" />
              </button>

              <div style={{ background: '#131921', padding: '12px 20px', borderRadius: '4px 4px 0 0' }}>
                <span style={{ color: '#FF9900', fontWeight: 700, fontSize: '0.9rem' }}>Product Details</span>
              </div>

              <div className="amz-modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div className="amz-modal-img" style={{ background: '#f9f9f9', padding: 24, display: 'flex', flexDirection: 'column', gap: 12, borderRight: '1px solid #eee' }}>
                  <div style={{ height: 280, background: 'white', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3 }}>
                    <img src={resolveImageSrc(activeImg)} alt={selectedProduct.name} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=DEFAULT_PRODUCT_IMAGE}} style={{ width:'100%', height:'100%', objectFit:'contain', padding:16 }} />
                  </div>
                  {modalImages.length > 1 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {modalImages.map((url, i) => (
                        <div key={i} onClick={() => setModalImageIndex(i)}
                          style={{ width: 56, height: 56, border: modalImageIndex===i ? '2px solid #FF9900' : '1px solid #ddd', background: 'white', borderRadius: 3, overflow: 'hidden', cursor: 'pointer' }}>
                          <img src={resolveImageSrc(url)} alt="" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=DEFAULT_PRODUCT_IMAGE}} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#565959', background: '#f3f3f3', border: '1px solid #ddd', padding: '3px 10px', borderRadius: 20, width: 'fit-content' }}>
                    {selectedProduct.category || 'Uncategorized'}
                  </span>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#131921', lineHeight: 1.5, margin: 0 }}>{selectedProduct.name}</h2>
                  <div style={{ height: 1, background: '#eee' }} />
                  <div>
                    {discountActive ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#B12704' }}>{formatINR(discountedPrice)}</span>
                          {discountPercent && <span style={{ background: '#CC0C39', color: 'white', fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: 2 }}>-{discountPercent}% OFF</span>}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#565959' }}>
                          M.R.P.: <span style={{ textDecoration: 'line-through' }}>{formatINR(selectedProduct.price)}</span>
                          <span style={{ color: '#007600', fontWeight: 600, marginLeft: 8 }}>You save {formatINR(selectedProduct.price - discountedPrice)}</span>
                        </div>
                      </>
                    ) : (
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#131921' }}>{formatINR(selectedProduct.price)}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: stockInfo.color }}>{stockInfo.label}</div>
                  <div style={{ height: 1, background: '#eee' }} />
                  <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>About this product</p>
                    <p style={{ fontSize: '0.875rem', color: '#333', lineHeight: 1.75, margin: 0 }}>{selectedProduct.description || 'No description.'}</p>
                  </div>
                  <div style={{ height: 1, background: '#eee' }} />
                  <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                    <button className="amz-btn-primary" onClick={() => { setSelectedProduct(null); handleEdit(selectedProduct) }} style={{ flex: 1 }}>
                      <Pencil size={14} /> Edit Product
                    </button>
                    <button className="amz-btn-danger" onClick={() => handleDelete(selectedProduct._id)} style={{ flex: 1, justifyContent: 'center', padding: '10px 0' }}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}