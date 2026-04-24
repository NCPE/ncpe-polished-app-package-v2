export default function ResultCard({ item, onSelect, onRequestQuote }) {
  return (
    <div className="card">
      <h4>{item.from_brand} {item.from_model}</h4>
      <div className="small">{item.category || 'Item'} → {item.to_brand}</div>

      <div className="badges">
        {item.type ? <div className="badge">{item.type}</div> : null}
        {item.application ? <div className="badge">{item.application}</div> : null}
      </div>

      <div><strong>Description:</strong> {item.description || '-'}</div>
      <div className="match"><strong>Best Match:</strong> {item.to_model}</div>

      {item.spec_url ? (
        <a
          className="spec-link"
          href={item.spec_url}
          target="_blank"
          rel="noreferrer"
        >
          View Spec Sheet
        </a>
      ) : (
        <div className="small">No linked spec sheet yet</div>
      )}

      <div className="meta">
        <div>
          <strong>Accessories / Tool Items</strong>
          <div className="small">{item.accessories || '-'}</div>
        </div>
        <div>
          <strong>Notes</strong>
          <div className="small">{item.notes || '-'}</div>
        </div>
      </div>

      <div className="actions">
        <button className="primary" onClick={() => onSelect(item)}>
          Select Item
        </button>
        <button className="secondary" onClick={() => onRequestQuote(item)}>
          Request Quote
        </button>
      </div>
    </div>
  )
}