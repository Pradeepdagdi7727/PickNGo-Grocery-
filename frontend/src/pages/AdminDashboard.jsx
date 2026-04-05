import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3, ShoppingBag, Users, TrendingUp,
  AlertTriangle, PackageX, Package, Search, RefreshCw
} from 'lucide-react'
import client from '../api/client'
import { formatINR } from '../utils/currency'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    outOfStock: 0,
    lowStock: 0,
    inventory: []
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | low | out | ok

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await client.get('/admin/dashboard')
      const data = response.data || {}
      setStats({
        totalOrders: data.totalOrders ?? 0,
        totalRevenue: Number(data.totalRevenue ?? 0),
        totalProducts: data.totalProducts ?? 0,
        totalCustomers: data.totalCustomers ?? 0,
        outOfStock: data.outOfStock ?? 0,
        lowStock: data.lowStock ?? 0,
        inventory: data.inventory ?? []
      })
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // ── Filtered inventory ──
  const filteredInventory = stats.inventory.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || p.status === filter
    return matchSearch && matchFilter
  })

  const statCards = [
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', shadow: 'rgba(59,130,246,0.3)' },
    { title: 'Total Revenue', value: formatINR(stats.totalRevenue), icon: TrendingUp, gradient: 'linear-gradient(135deg,#10b981,#047857)', shadow: 'rgba(16,185,129,0.3)' },
    { title: 'Products', value: stats.totalProducts, icon: BarChart3, gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', shadow: 'rgba(139,92,246,0.3)' },
    { title: 'Customers', value: stats.totalCustomers, icon: Users, gradient: 'linear-gradient(135deg,#f59e0b,#b45309)', shadow: 'rgba(245,158,11,0.3)' }
  ]

  const stockFilters = [
    { key: 'all', label: 'All', color: '#64748b' },
    { key: 'ok', label: '✅ In Stock', color: '#16a34a' },
    { key: 'low', label: '⚠️ Low', color: '#d97706' },
    { key: 'out', label: '🚫 Out', color: '#dc2626' }
  ]

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(135deg,#f0f4ff 0%,#e8f0fe 50%,#f0f4ff 100%)', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap');
        .dash-card {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.9);
          border-radius: 20px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 40px -10px rgba(99,102,241,0.1);
        }
        .stat-card {
          border-radius: 20px;
          padding: 24px;
          color: white;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card:hover { transform: translateY(-3px); }
        .stat-card::after {
          content: '';
          position: absolute;
          top: -30px; right: -30px;
          width: 100px; height: 100px;
          background: rgba(255,255,255,0.08);
          border-radius: 50%;
        }
        .inv-row {
          display: grid;
          grid-template-columns: 2fr 1.2fr 1fr 1fr;
          gap: 12px;
          align-items: center;
          padding: 14px 20px;
          border-radius: 12px;
          transition: background 0.15s ease;
        }
        .inv-row:hover { background: rgba(99,102,241,0.04); }
        .inv-header {
          display: grid;
          grid-template-columns: 2fr 1.2fr 1fr 1fr;
          gap: 12px;
          padding: 10px 20px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .stock-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 999px;
        }
        .filter-btn {
          font-size: 0.8rem;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 999px;
          border: 1.5px solid;
          cursor: pointer;
          transition: all 0.15s ease;
          background: white;
        }
        .search-input {
          padding: 10px 16px 10px 40px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.88rem;
          outline: none;
          background: white;
          width: 100%;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s;
        }
        .search-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .action-link {
          display: block;
          text-align: center;
          padding: 11px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.88rem;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 8px 16px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .refresh-btn:hover { border-color: #6366f1; color: #6366f1; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* ── Page Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '2rem', color: '#1e293b', marginBottom: 4 }}>
              Admin Dashboard
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Welcome back! Here's what's happening today.</p>
          </div>
          <button className="refresh-btn" onClick={fetchDashboardStats} disabled={loading}>
            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#94a3b8', fontWeight: 500 }}>Loading dashboard...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {/* ── Stat Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
              {statCards.map((s, i) => {
                const Icon = s.icon
                return (
                  <div key={i} className="stat-card" style={{ background: s.gradient, boxShadow: `0 8px 24px ${s.shadow}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontSize: '0.78rem', fontWeight: 600, opacity: 0.8, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.title}</p>
                        <p style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 10 }}>
                        <Icon size={24} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Stock Alert Banner ── */}
            {(stats.outOfStock > 0 || stats.lowStock > 0) && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                background: 'linear-gradient(135deg,#fff7ed,#fef3c7)',
                border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: 16, padding: '14px 20px', marginBottom: 24
              }}>
                <AlertTriangle size={20} color="#d97706" />
                <span style={{ fontWeight: 600, color: '#92400e', fontSize: '0.9rem' }}>Stock Alert</span>
                {stats.outOfStock > 0 && (
                  <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, padding: '3px 10px', borderRadius: 999 }}>
                    🚫 {stats.outOfStock} Out of Stock
                  </span>
                )}
                {stats.lowStock > 0 && (
                  <span style={{ background: '#fef3c7', color: '#d97706', fontSize: '0.8rem', fontWeight: 600, padding: '3px 10px', borderRadius: 999 }}>
                    ⚠️ {stats.lowStock} Low Stock
                  </span>
                )}
              </div>
            )}

            {/* ── Main Grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

              {/* ── Inventory Table ── */}
              <div className="dash-card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.3rem', color: '#1e293b' }}>
                    Inventory
                  </h2>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
                    {filteredInventory.length} products
                  </span>
                </div>

                {/* Search + Filter */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
                    <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      className="search-input"
                      placeholder="Search product or category..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {stockFilters.map(f => (
                      <button
                        key={f.key}
                        className="filter-btn"
                        onClick={() => setFilter(f.key)}
                        style={{
                          borderColor: filter === f.key ? f.color : '#e2e8f0',
                          color: filter === f.key ? f.color : '#64748b',
                          background: filter === f.key ? `${f.color}10` : 'white'
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table Header */}
                <div className="inv-header">
                  <span>Product</span>
                  <span>Category</span>
                  <span>Price</span>
                  <span>Stock</span>
                </div>

                <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.15),transparent)', marginBottom: 8 }} />

                {/* Table Rows */}
                {filteredInventory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    <Package size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                    <p style={{ fontWeight: 500 }}>No products found</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                    {filteredInventory.map((product, i) => {
                      const badgeStyle =
                        product.status === 'out' ? { background: '#fee2e2', color: '#dc2626' } :
                          product.status === 'low' ? { background: '#fef3c7', color: '#d97706' } :
                            { background: '#dcfce7', color: '#16a34a' }

                      const badgeText =
                        product.status === 'out' ? '🚫 Out' :
                          product.status === 'low' ? `⚠️ ${product.stock} Low` :
                            `✅ ${product.stock}`

                      return (
                        <div key={product.id} className="inv-row" style={{ borderBottom: i < filteredInventory.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                          <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{product.name}</span>
                          <span style={{ fontSize: '0.82rem', color: '#64748b', background: '#f1f5f9', padding: '3px 10px', borderRadius: 999, display: 'inline-block', width: 'fit-content' }}>
                            {product.category}
                          </span>
                          <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.88rem' }}>
                            {formatINR(product.price)}
                          </span>
                          <span className="stock-badge" style={badgeStyle}>{badgeText}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* ── Right Sidebar ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Stock Summary */}
                <div className="dash-card" style={{ padding: 24 }}>
                  <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.1rem', color: '#1e293b', marginBottom: 16 }}>Stock Summary</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { label: 'Total Products', value: stats.totalProducts, icon: Package, color: '#6366f1', bg: '#ede9fe' },
                      { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: '#d97706', bg: '#fef3c7' },
                      { label: 'Out of Stock', value: stats.outOfStock, icon: PackageX, color: '#dc2626', bg: '#fee2e2' }
                    ].map((item, i) => {
                      const Icon = item.icon
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: item.bg + '60', borderRadius: 12, border: `1px solid ${item.bg}` }}>
                          <div style={{ background: item.bg, borderRadius: 8, padding: 8 }}>
                            <Icon size={16} color={item.color} />
                          </div>
                          <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 500, color: '#475569' }}>{item.label}</span>
                          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: item.color }}>{item.value}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="dash-card" style={{ padding: 24 }}>
                  <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.1rem', color: '#1e293b', marginBottom: 16 }}>Quick Actions</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Link to="/admin/products" className="action-link" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: 'white', boxShadow: '0 4px 12px rgba(79,70,229,0.25)' }}>
                      📦 Manage Products
                    </Link>
                    <Link to="/admin/orders" className="action-link" style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: 'white', boxShadow: '0 4px 12px rgba(14,165,233,0.25)' }}>
                      🧾 View Orders
                    </Link>
                   
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}