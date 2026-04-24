import logo from '../assets/ncpe-logo.jpeg'

export default function Header() {
  return (
    <header className="app-header branded-header">
      <div className="header-inner">
        <img src={logo} alt="NCPE logo" className="brand-logo" />
        <div className="header-copy">
          <h1>NCPE Crossover App</h1>
          <p>Wastewater • Industrial • Mining Pump Solutions</p>
        </div>
      </div>
    </header>
  )
}
