import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminUpload() {
  const [file, setFile] = useState(null)
  const [sourceUrl, setSourceUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
  }

  async function findMatchingModel(fileNameOrUrl) {
    const cleanSearch = normalize(fileNameOrUrl)

    const { data, error } = await supabase
      .from('crossover_items')
      .select('id, from_brand, from_model, to_brand, to_model')
      .limit(1000)

    if (error) throw new Error(error.message)

    const match = (data || []).find((item) => {
      const fromModel = normalize(item.from_model)
      const toModel = normalize(item.to_model)

      return (
        cleanSearch.includes(fromModel) ||
        cleanSearch.includes(toModel) ||
        fromModel.includes(cleanSearch) ||
        toModel.includes(cleanSearch)
      )
    })

    return match || null
  }

  async function attachSourceUrl() {
    if (!sourceUrl.trim()) {
      setMessage('Paste a source/spec URL first.')
      return
    }

    setLoading(true)
    setMessage('Searching for matching model...')

    try {
      const match = await findMatchingModel(sourceUrl)

      if (!match) {
        setMessage('No matching model found. Make sure the URL contains a model number.')
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from('crossover_items')
        .update({
          spec_url: sourceUrl.trim(),
          spec_storage_path: null,
        })
        .eq('id', match.id)

      if (error) throw new Error(error.message)

      setMessage(
        `Source link attached to ${match.from_brand} ${match.from_model} → ${match.to_brand} ${match.to_model}`
      )
      setSourceUrl('')
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    }

    setLoading(false)
  }

  async function uploadPdf() {
    if (!file) {
      setMessage('Choose a PDF first.')
      return
    }

    setLoading(true)
    setMessage('Searching for matching model...')

    try {
      const match = await findMatchingModel(file.name)

      if (!match) {
        setMessage('No matching model found. Rename PDF so it includes the model number.')
        setLoading(false)
        return
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${match.id}/${Date.now()}_${safeName}`

      const { error: uploadError } = await supabase.storage
        .from('spec-sheets')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw new Error(uploadError.message)

      const { data: publicData } = supabase.storage
        .from('spec-sheets')
        .getPublicUrl(path)

      const publicUrl = publicData?.publicUrl || ''

      const { error: updateError } = await supabase
        .from('crossover_items')
        .update({
          spec_url: publicUrl,
          spec_storage_path: path,
        })
        .eq('id', match.id)

      if (updateError) throw new Error(updateError.message)

      setMessage(
        `PDF uploaded and attached to ${match.from_brand} ${match.from_model} → ${match.to_brand} ${match.to_model}`
      )

      setFile(null)
      const input = document.getElementById('spec-pdf-input')
      if (input) input.value = ''
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    }

    setLoading(false)
  }

  return (
    <div className="panel">
      <h2>Auto-Tag Spec Sheets</h2>

      <p className="small">
        Upload a PDF or paste a source link. The app will match it to an existing model number automatically.
      </p>

      <label>Paste Source / Spec URL</label>
      <input
        type="text"
        value={sourceUrl}
        onChange={(e) => setSourceUrl(e.target.value)}
        placeholder="Example: https://manufacturer.com/3BSV504DS.pdf"
      />

      <div className="btns">
        <button className="secondary" onClick={attachSourceUrl} disabled={loading}>
          Auto-Attach Source Link
        </button>
      </div>

      <label>Upload PDF</label>
      <input
        id="spec-pdf-input"
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <div className="btns">
        <button className="primary" onClick={uploadPdf} disabled={loading}>
          {loading ? 'Working...' : 'Auto-Tag & Upload PDF'}
        </button>
      </div>

      {message ? (
        <div className="small" style={{ marginTop: 12 }}>
          {message}
        </div>
      ) : null}
    </div>
  )
}