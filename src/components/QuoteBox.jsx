export default function QuoteBox({
  selectedItem,
  qty,
  setQty,
  onRequestQuote,
}) {
  return (
    <div className="panel quote-panel">
      <h3>Request a Quote</h3>
      <div className="budget-note">
        Submit your request and our team will provide pricing and availability.
      </div>

      <div className="quote-grid">
        <div className="full">
          <label>Selected Item</label>
          <input readOnly value={selectedItem || ''} />
        </div>

        <div>
          <label>Qty</label>
          <input
            type="number"
            step="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </div>
      </div>

      <button
        className="primary"
        onClick={() => onRequestQuote(selectedItem)}
        disabled={!selectedItem}
        style={{ marginTop: '12px' }}
      >
        Request Quote
      </button>
    </div>
  )
}