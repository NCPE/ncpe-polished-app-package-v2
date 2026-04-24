export default function Filters(props) {
  const {
    category, setCategory, brand, setBrand, search, setSearch, application, setApplication,
    categories, brands, onSearch, onReset, totalRows, shownRows
  } = props

  return (
    <div className="panel">
      <label>Category</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        {categories.map(v => <option key={v} value={v}>{v}</option>)}
      </select>

      <label>From Brand</label>
      <select value={brand} onChange={(e) => setBrand(e.target.value)}>
        <option value="">All Brands</option>
        {brands.map(v => <option key={v} value={v}>{v}</option>)}
      </select>

      <label>Search Model / Notes / Application</label>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="NP 3102, DDA, Chemineer, chlorine" />

      <label>Application Contains</label>
      <input value={application} onChange={(e) => setApplication(e.target.value)} placeholder="wastewater, chlorine, chemical" />

            <div className="btns">
        <button className="primary" onClick={onSearch}>Search</button>
        <button className="secondary" onClick={onReset}>Reset</button>
      </div>
    </div>
  )
}
     

