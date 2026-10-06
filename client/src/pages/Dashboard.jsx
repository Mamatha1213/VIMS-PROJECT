import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AIChat from "../components/AIChat";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [productsResponse, vendorsResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/products"),
          axios.get("http://localhost:5000/api/vendors"),
        ]);

        setProducts(productsResponse.data);
        setVendors(vendorsResponse.data);
      } catch (error) {
        console.error("Dashboard loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalInventoryValue = products.reduce((total, product) => {
    const quantity = Number(product.quantity || 0);
    const price = Number(product.price || 0);

    return total + quantity * price;
  }, 0);

  const totalStock = products.reduce((total, product) => {
    return total + Number(product.quantity || 0);
  }, 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="dashboard-page">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="hero-section">

        <div className="hero-glow hero-glow-one"></div>
        <div className="hero-glow hero-glow-two"></div>

        <div className="hero-content">

          <div className="hero-small-label">
            ✨ SMART INVENTORY MANAGEMENT
          </div>

          <div className="hero-logo">
            <span className="hero-logo-symbol">◈</span>

            <h1>VIMS</h1>
          </div>

          <h2>
            Vendor & Inventory
            <br />
            Management System
          </h2>

          <p className="hero-description">
            Manage your products, vendors and inventory
            <br className="desktop-break" />
            easily from one powerful platform.
          </p>

          <div className="hero-buttons">

            <Link to="/products" className="hero-button primary">
              <span>📦</span>
              Manage Products
              <strong>→</strong>
            </Link>

            <Link to="/vendors" className="hero-button secondary">
              <span>🏢</span>
              Manage Vendors
              <strong>→</strong>
            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          OVERVIEW
      ====================================================== */}

      <section className="content-section">

        <div className="section-title">
          <div>
            <span className="section-label">OVERVIEW</span>
            <h2>Your system at a glance</h2>
          </div>
        </div>

        <div className="stats-grid">

          {/* Products */}

          <div className="stat-card products-card">

            <div className="stat-card-top">
              <div className="stat-icon">
                📦
              </div>

              <span className="stat-arrow">↗</span>
            </div>

            <div className="stat-number">
              {loading ? "—" : products.length}
            </div>

            <div className="stat-title">
              Products
            </div>

            <div className="stat-description">
              Total products in inventory
            </div>

          </div>


          {/* Vendors */}

          <div className="stat-card vendors-card">

            <div className="stat-card-top">
              <div className="stat-icon">
                🏢
              </div>

              <span className="stat-arrow">↗</span>
            </div>

            <div className="stat-number">
              {loading ? "—" : vendors.length}
            </div>

            <div className="stat-title">
              Vendors
            </div>

            <div className="stat-description">
              Vendors connected to VIMS
            </div>

          </div>


          {/* Inventory Value */}

          <div className="stat-card value-card">

            <div className="stat-card-top">
              <div className="stat-icon">
                💰
              </div>

              <span className="stat-arrow">↗</span>
            </div>

            <div className="stat-number inventory-value">
              {loading
                ? "—"
                : formatCurrency(totalInventoryValue)}
            </div>

            <div className="stat-title">
              Inventory Value
            </div>

            <div className="stat-description">
              Total value of your inventory
            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          INVENTORY SUMMARY
      ====================================================== */}

      <section className="inventory-summary">

        <div className="summary-left">

          <div className="summary-icon">
            📊
          </div>

          <div>
            <span>Total Stock</span>

            <strong>
              {loading ? "—" : totalStock}
            </strong>
          </div>

        </div>

        <div className="summary-text">
          Units currently available across all products
        </div>

      </section>


      {/* =====================================================
          QUICK ACTIONS
      ====================================================== */}

      <section className="content-section">

        <div className="section-title">
          <div>
            <span className="section-label">QUICK ACTIONS</span>
            <h2>Manage your VIMS system</h2>
          </div>
        </div>

        <div className="quick-actions-grid">

          <Link
            to="/products"
            className="quick-action-card"
          >

            <div className="quick-card-icon products-icon">
              📦
            </div>

            <div className="quick-card-content">

              <span className="quick-card-label">
                INVENTORY
              </span>

              <h3>
                Manage Products
              </h3>

              <p>
                Add, edit, delete and manage all
                your products and inventory.
              </p>

              <span className="quick-card-link">
                Explore Products
                <strong>→</strong>
              </span>

            </div>

          </Link>


          <Link
            to="/vendors"
            className="quick-action-card"
          >

            <div className="quick-card-icon vendors-icon">
              🏢
            </div>

            <div className="quick-card-content">

              <span className="quick-card-label">
                SUPPLIERS
              </span>

              <h3>
                Manage Vendors
              </h3>

              <p>
                Add, edit and manage your vendor
                information and contacts.
              </p>

              <span className="quick-card-link">
                Explore Vendors
                <strong>→</strong>
              </span>

            </div>

          </Link>

        </div>

      </section>


      {/* =====================================================
          AI COPILOT
      ====================================================== */}

      <section className="ai-section">

        <div className="ai-background-circle circle-one"></div>
        <div className="ai-background-circle circle-two"></div>

        <div className="ai-section-header">

          <div className="ai-heading">

            <div className="ai-icon-large">
              ✨
            </div>

            <div>

              <span>
                VIMS AI COPILOT
              </span>

              <h2>
                Your intelligent inventory assistant
              </h2>

            </div>

          </div>

          <p>
            Ask questions about products, vendors,
            stock and inventory value.
          </p>

        </div>

        <div className="ai-chat-wrapper">
          <AIChat />
        </div>

      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="dashboard-footer">

        <div className="footer-logo">
          ◈ VIMS
        </div>

        <p>
          Vendor & Inventory Management System
        </p>

        <span>
          © 2026 VIMS. All rights reserved.
        </span>

      </footer>

    </div>
  );
}

export default Dashboard;