export default function RequestQuoteModal({ open, item, onClose }) {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    qty: '1',
    notes: '',
  })

  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open || !item) return null

  const itemLabel = `${item.from_brand || ''} ${item.from_model || ''} → ${item.to_brand || ''} ${item.to_model || ''}`

  function updateField(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setStatus('')

    const payload = {
      name: form.name,
      company: form.company,
      email: form.email,
      phone: form.phone,
      quantity: form.qty,
      notes: form.notes,
      requested_item: itemLabel,
      from_brand: item.from_brand || '',
      from_model: item.from_model || '',
      recommended_brand: item.to_brand || '',
      recommended_model: item.to_model || '',
      type: item.type || '',
      application: item.application || '',
      description: item.description || '',
      spec_url: item.spec_url || '',
      _subject: `New NCPE Quote Request: ${item.from_model || 'Pump Crossover'}`,
    }

    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    setLoading(false)

    if (res.ok) {
      setStatus('Quote request sent successfully.')
      setForm({
        name: '',
        company: '',
        email: '',
        phone: '',
        qty: '1',
        notes: '',
      })
    } else {
      setStatus('Error sending quote request. Please try again.')
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Request Quote</h2>

        <p className="small">{itemLabel}</p>

        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            name="name"
            value={form.name}
            onChange={updateField}
            required
          />

          <label>Company</label>
          <input
            name="company"
            value={form.company}
            onChange={updateField}
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={updateField}
            required
          />

          <label>Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={updateField}
          />

          <label>Quantity</label>
          <input
            type="number"
            name="qty"
            value={form.qty}
            onChange={updateField}
            min="1"
          />

          <label>Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={updateField}
            placeholder="Application, voltage, head, flow, urgency, etc."
          />

          {status && <p className="small">{status}</p>}

          <div className="actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Submit Request'}
            </button>

            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
