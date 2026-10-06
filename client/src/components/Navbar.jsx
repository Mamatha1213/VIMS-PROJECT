import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="top-navbar">
      <div className="navbar-inner">

        <NavLink to="/" className="nav-brand">
          <span className="nav-brand-symbol">◈</span>

          <div className="nav-brand-text">
            <span className="nav-brand-name">VIMS</span>
            <span className="nav-brand-subtitle">
              Vendor & Inventory Management System
            </span>
          </div>
        </NavLink>

        <nav className="nav-menu">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/vendors"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            Vendors
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            Products
          </NavLink>
        </nav>

      </div>
    </header>
  );
}

export default Navbar;