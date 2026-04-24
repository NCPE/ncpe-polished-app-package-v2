import { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase'
import Header from './components/Header'
import Filters from './components/Filters'
import QuoteBox from './components/QuoteBox'
import ResultCard from './components/ResultCard'
import RequestQuoteModal from './components/RequestQuoteModal'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminItems from './pages/admin/Items'
import AdminQuotes from './pages/admin/Quotes'
import AdminUpload from './pages/admin/Upload'

export default function App() {
  const [items, setItems] = useState([])
  const [allItems, setAllItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [search, setSearch] = useState('')
  const [application, setApplication] = useState('')

  const [selectedItem, setSelectedItem] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [qty, setQty] = useState(1)

  const [requestItem, setRequestItem] = useState(null)
  const [route, setRoute] = useState('customer')

  // LEVEL 5: memory-only admin state
  // Nothing is saved to localStorage/sessionStorage.
  const [adminLoggedIn, setAdminLoggedIn] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  // Hidden admin shortcut: Ctrl + Alt + A
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
        setRoute('admin')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    localStorage.clear()
    sessionStorage.clear()
    setAdminLoggedIn(false)
    setRoute('customer')
  }

  async function fetchItems() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('crossover_items')
      .select('*')
      .order('from_brand', { ascending: true })
      .order('from_model', { ascending: true })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const rows = data || []
    setAllItems(rows)
    setItems(rows)
    setLoading(false)
  }

  const categories = useMemo(() => {
    return [...new Set(allItems.map((x) => x.category || x.type).filter(Boolean))].sort()
  }, [allItems])

  const brands = useMemo(() => {
    return [...new Set(allItems.map((x) => x.from_brand).filter(Boolean))].sort()
  }, [allItems])

  function runSearch() {
    const filtered = allItems.filter((item) => {
      const hay = [
        item.from_brand,
        item.from_model,
        item.to_brand,
        item.to_model,
        item.type,
        item.category,
        item.application,
        item.description,
        item.notes,
      ]
        .join(' ')
        .toLowerCase()

      if (category && item.category !== category && item.type !== category) return false
      if (brand && item.from_brand !== brand) return false
      if (search && !hay.includes(search.toLowerCase())) return false
      if (application && !(item.application || '').toLowerCase().includes(application.toLowerCase())) return false

      return true
    })

    setItems(filtered)
  }

  function resetFilters() {
    setCategory('')
    setBrand('')
    setSearch('')
    setApplication('')
    setItems(allItems)
  }

  function handleSelect(item) {
    setSelectedRecord(item)
    setSelectedItem(
      `${item.from_brand || ''} ${item.from_model || ''} → ${item.to_brand || ''} ${item.to_model || ''}`.trim()
    )
  }

  function renderAdmin() {
    if (!adminLoggedIn) {
      return (
        <main className="layout">
          <div className="left-column">
            <AdminLogin onLogin={() => setAdminLoggedIn(true)} />
          </div>

          <div className="panel">
            <h2>Admin Access Required</h2>
            <p className="small">Log in to view admin tools.</p>
          </div>
        </main>
      )
    }

    return (
      <main className="layout">
        <div className="left-column">
          <AdminDashboard />

          <button
            onClick={() => setRoute('customer')}
            style={{
              marginTop: '10px',
              padding: '10px',
              width: '100%',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Customer View
          </button>

          <button
            onClick={handleLogout}
            style={{
              marginTop: '10px',
              padding: '10px',
              width: '100%',
              background: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>

        <div className="admin-stack">
          <AdminItems />
          <AdminQuotes />
          <AdminUpload />
        </div>
      </main>
    )
  }

  function renderCustomer() {
    return (
      <main className="layout">
        <div className="left-column">
          <Filters
            category={category}
            setCategory={setCategory}
            brand={brand}
            setBrand={setBrand}
            search={search}
            setSearch={setSearch}
            application={application}
            setApplication={setApplication}
            categories={categories}
            brands={brands}
            onSearch={runSearch}
            onReset={resetFilters}
            totalRows={allItems.length}
            shownRows={items.length}
          />

          <QuoteBox
            selectedItem={selectedItem}
            qty={qty}
            setQty={setQty}
            onRequestQuote={() => {
              if (selectedRecord) setRequestItem(selectedRecord)
            }}
          />
        </div>

        <div className="panel">
          <div className="results-head">
            <h3>Search Results</h3>

            <div className="route-switch">
              <button
                className={route === 'customer' ? 'primary' : 'secondary'}
                onClick={() => setRoute('customer')}
              >
                Customer
              </button>
            </div>
          </div>

          {loading && <div className="empty-state">Loading…</div>}

          {error && adminLoggedIn && (
            <div className="error-box">{error}</div>
          )}

          {!loading && items.length === 0 && (
            <div className="empty-state">No results found.</div>
          )}

          <div className="cards">
            {items.map((item) => (
              <ResultCard
                key={item.id}
                item={item}
                onSelect={handleSelect}
                onRequestQuote={setRequestItem}
              />
            ))}
          </div>
        </div>

        <RequestQuoteModal
          open={!!requestItem}
          item={requestItem}
          onClose={() => setRequestItem(null)}
        />
      </main>
    )
  }

  return (
    <div>
      <Header />
      {route === 'admin' ? renderAdmin() : renderCustomer()}
    </div>
  )
}