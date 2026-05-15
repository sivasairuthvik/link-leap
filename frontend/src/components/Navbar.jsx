import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">🔗 link-leap</Link>
      <div className="navbar-links">
        <Link to="/shorten" className="navbar-link">Shorten</Link>
        <Link to="/dashboard" className="navbar-link">Dashboard</Link>
      </div>
    </nav>
  );
}

