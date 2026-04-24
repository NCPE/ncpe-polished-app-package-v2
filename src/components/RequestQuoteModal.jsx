import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function RequestQuoteModal({ open, item, onClose }) {
  const [form, setForm] = useState({ name:'', company:'', email:'', phone:'', notes:'' })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  if (!open || !item) return null

  async function submit() {
    setSaving(true)
    setError('')
    const payload = {
      customer: form.company || form.name,
      email: form.email,
      phone: form.phone,
      item: `${item.from_brand} ${item.from_model} -> ${item.to_brand} ${item.to_model}`,
      status: 'Requested',
      notes: `${form.name}\n${form.notes || ''}`
    }
    const { error } = await supabase.from('quotes').insert(payload)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setDone(true)
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Request Quote</h3>
        <div className="small modal-item">{item.from_brand} {item.from_model} → {item.to_brand} {item.to_model}</div>
        {done ? (
          <>
            <p>Your request was submitted.</p>
            <div className="btns"><button className="primary" onClick={onClose}>Close</button></div>
          </>
        ) : (
          <>
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({...form, name:e.target.value})} />
            <label>Company</label>
            <input value={form.company} onChange={(e) => setForm({...form, company:e.target.value})} />
            <label>Email</label>
            <input value={form.email} onChange={(e) => setForm({...form, email:e.target.value})} />
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => setForm({...form, phone:e.target.value})} />
            <label>Notes</label>
            <textarea rows="4" value={form.notes} onChange={(e) => setForm({...form, notes:e.target.value})} />
            {error ? <div className="error-box">{error}</div> : null}
            <div className="btns">
              <button className="primary" onClick={submit} disabled={saving}>{saving ? 'Sending…' : 'Submit Request'}</button>
              <button className="secondary" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
