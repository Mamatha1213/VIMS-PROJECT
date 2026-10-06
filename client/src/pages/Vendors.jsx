
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // ==========================================
  // FETCH VENDORS + PRODUCTS
  // ==========================================

  const fetchData = async () => {
    try {
      setLoading(true);

      const [vendorsResponse, productsResponse] =
  await Promise.all([
    axios.get("http://localhost:5000/api/vendors/get-vendors"),
    axios.get("http://localhost:5000/api/products/get-products"),
  ]);

      setVendors(vendorsResponse.data);
      setProducts(productsResponse.data);
    } catch (error) {
      console.error("Error fetching vendors:", error);

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to load vendors."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==========================================
  // OPEN ADD MODAL
  // ==========================================

  const openAddModal = () => {
    setEditingVendor(null);

    setForm({
      name: "",
      email: "",
      phone: "",
      address: "",
    });

    setShowModal(true);
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const openEditModal = (vendor) => {
    setEditingVendor(vendor);

    setForm({
      name: vendor.name || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      address: vendor.address || "",
    });

    setShowModal(true);
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = () => {
    setShowModal(false);
    setEditingVendor(null);
  };

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  // ==========================================
  // ADD / UPDATE VENDOR
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter the vendor name.");
      return;
    }

    if (!form.email.trim()) {
      alert("Please enter the vendor email.");
      return;
    }

    if (!form.phone.trim()) {
      alert("Please enter the phone number.");
      return;
    }

    if (!form.address.trim()) {
      alert("Please enter the vendor address.");
      return;
    }

    try {
      const vendorData = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };

      // UPDATE
      if (editingVendor) {
        await axios.put(
          `http://localhost:5000/api/vendors/update-vendor/${editingVendor._id}`,
          vendorData
        );

        alert("Vendor updated successfully.");
      }

      // ADD
      else {
        await axios.post(
          "http://localhost:5000/api/vendors/add-vendor",
          vendorData
        );

        alert("Vendor added successfully.");
      }

      closeModal();

      await fetchData();

    } catch (error) {
      console.error("Error saving vendor:", error);

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unable to save vendor."
      );
    }
  };

  // ==========================================
  // DELETE VENDOR
  // ==========================================

  const deleteVendor = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this vendor?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/vendors/delete-vendor/${id}`
      );

      alert("Vendor deleted successfully.");

      await fetchData();

    } catch (error) {
      console.error("Error deleting vendor:", error);

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unable to delete vendor."
      );
    }
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredVendors = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return vendors;
    }

    return vendors.filter((vendor) => {
      return (
        vendor.name?.toLowerCase().includes(searchValue) ||
        vendor.email?.toLowerCase().includes(searchValue) ||
        vendor.phone?.toLowerCase().includes(searchValue) ||
        vendor.address?.toLowerCase().includes(searchValue)
      );
    });
  }, [vendors, search]);

  // ==========================================
  // PRODUCT COUNT FOR VENDOR
  // ==========================================

  const getVendorProductCount = (vendorName) => {
    return products.filter(
      (product) =>
        product.vendor?.toLowerCase() ===
        vendorName?.toLowerCase()
    ).length;
  };

  return (
    <div className="vendors-page">

      {/* HERO */}
      <section className="vendors-hero">
        <div>
          <div className="vendors-eyebrow">
            <span>🏢</span>
            VENDOR MANAGEMENT
          </div>

          <h1>Vendors</h1>

          <p>
            Manage your suppliers, contact information and
            vendor relationships from one place.
          </p>
        </div>

        <button
          className="add-vendor-btn"
          onClick={openAddModal}
        >
          <span>＋</span>
          Add Vendor
        </button>
      </section>

      {/* SUMMARY CARDS */}
      <section className="vendor-summary-grid">

        <div className="vendor-stat-card">
          <div className="vendor-stat-icon purple">
            🏢
          </div>

          <div>
            <span>Total Vendors</span>
            <strong>{vendors.length}</strong>
          </div>
        </div>

        <div className="vendor-stat-card">
          <div className="vendor-stat-icon blue">
            📦
          </div>

          <div>
            <span>Supplied Products</span>
            <strong>{products.length}</strong>
          </div>
        </div>

        <div className="vendor-stat-card">
          <div className="vendor-stat-icon green">
            👥
          </div>

          <div>
            <span>Active Vendors</span>
            <strong>{vendors.length}</strong>
          </div>
        </div>

        <div className="vendor-stat-card">
          <div className="vendor-stat-icon orange">
            🔗
          </div>

          <div>
            <span>Vendor Connections</span>

            <strong>
              {
                vendors.filter((vendor) =>
                  products.some(
                    (product) =>
                      product.vendor?.toLowerCase() ===
                      vendor.name?.toLowerCase()
                  )
                ).length
              }
            </strong>
          </div>
        </div>

      </section>

      {/* VENDOR PANEL */}
      <section className="vendors-panel">

        <div className="vendors-panel-header">

          <div>
            <h2>Vendor Directory</h2>

            <p>
              {filteredVendors.length} vendor
              {filteredVendors.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>

          <div className="vendor-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search vendors, email or phone..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {search && (
              <button
                className="vendor-clear-search"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}

          </div>

        </div>

        {/* LOADING */}
        {loading ? (
          <div className="vendors-loading">
            <div className="vendor-loading-spinner"></div>
            <p>Loading vendors...</p>
          </div>
        ) : filteredVendors.length === 0 ? (

          /* EMPTY */
          <div className="vendors-empty">

            <div className="vendor-empty-icon">
              🏢
            </div>

            <h3>
              {search
                ? "No vendors found"
                : "No vendors yet"}
            </h3>

            <p>
              {search
                ? "Try searching with a different name, email or phone number."
                : "Add your first vendor to start managing your suppliers."}
            </p>

            {!search && (
              <button
                className="empty-vendor-btn"
                onClick={openAddModal}
              >
                ＋ Add Your First Vendor
              </button>
            )}

          </div>

        ) : (

          /* TABLE */
          <div className="vendors-table-wrapper">

            <table className="vendors-table">

              <thead>
                <tr>
                  <th>VENDOR</th>
                  <th>CONTACT</th>
                  <th>PHONE</th>
                  <th>LOCATION</th>
                  <th>PRODUCTS</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>

                {filteredVendors.map((vendor) => {

                  const productCount =
                    getVendorProductCount(vendor.name);

                  return (
                    <tr key={vendor._id}>

                      {/* NAME */}
                      <td>

                        <div className="vendor-name-cell">

                          <div className="vendor-avatar">
                            {vendor.name
                              ?.charAt(0)
                              ?.toUpperCase() || "V"}
                          </div>

                          <div>
                            <strong>
                              {vendor.name}
                            </strong>

                            <span>
                              Vendor ID:{" "}
                              {vendor._id?.slice(-6)}
                            </span>
                          </div>

                        </div>

                      </td>

                      {/* EMAIL */}
                      <td>

                        <div className="vendor-contact-cell">

                          <span className="contact-icon">
                            ✉️
                          </span>

                          <span>
                            {vendor.email ||
                              "No email"}
                          </span>

                        </div>

                      </td>

                      {/* PHONE */}
                      <td>

                        <div className="vendor-contact-cell">

                          <span className="contact-icon phone">
                            📞
                          </span>

                          <span>
                            {vendor.phone ||
                              "No phone"}
                          </span>

                        </div>

                      </td>

                      {/* ADDRESS */}
                      <td>

                        <div className="vendor-address-cell">

                          <span>
                            📍
                          </span>

                          <span>
                            {vendor.address ||
                              "No address"}
                          </span>

                        </div>

                      </td>

                      {/* PRODUCTS */}
                      <td>

                        <div className="vendor-product-count">

                          <strong>
                            {productCount}
                          </strong>

                          <span>
                            {productCount === 1
                              ? "product"
                              : "products"}
                          </span>

                        </div>

                      </td>

                      {/* STATUS */}
                      <td>

                        <span className="vendor-status-badge">
                          <span></span>
                          Active
                        </span>

                      </td>

                      {/* ACTIONS */}
                      <td>

                        <div className="vendor-actions">

                          <button
                            className="vendor-action-btn vendor-edit-btn"
                            onClick={() =>
                              openEditModal(vendor)
                            }
                            title="Edit vendor"
                          >
                            ✏️
                          </button>

                          <button
                            className="vendor-action-btn vendor-delete-btn"
                            onClick={() =>
                              deleteVendor(vendor._id)
                            }
                            title="Delete vendor"
                          >
                            🗑️
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div
          className="vendor-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="vendor-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="vendor-modal-header">

              <div className="vendor-modal-title">

                <div className="vendor-modal-icon">
                  🏢
                </div>

                <div>
                  <h2>
                    {editingVendor
                      ? "Edit Vendor"
                      : "Add Vendor"}
                  </h2>

                  <p>
                    {editingVendor
                      ? "Update vendor information"
                      : "Add a new supplier to your vendor directory"}
                  </p>
                </div>

              </div>

              <button
                className="vendor-modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form
              className="vendor-form"
              onSubmit={handleSubmit}
            >

              <div className="vendor-form-group">

                <label>Vendor Name</label>

                <div className="vendor-input-wrapper">
                  <span>👤</span>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. ABC Suppliers"
                    required
                  />
                </div>

              </div>

              <div className="vendor-form-group">

                <label>Email Address</label>

                <div className="vendor-input-wrapper">
                  <span>✉️</span>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="vendor@example.com"
                    required
                  />
                </div>

              </div>

              <div className="vendor-form-group">

                <label>Phone Number</label>

                <div className="vendor-input-wrapper">
                  <span>📞</span>

                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    required
                  />
                </div>

              </div>

              <div className="vendor-form-group">

                <label>Address</label>

                <div className="vendor-input-wrapper vendor-textarea-wrapper">
                  <span>📍</span>

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter vendor address"
                    rows="3"
                  />
                </div>

              </div>

              <div className="vendor-form-actions">

                <button
                  type="button"
                  className="vendor-cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="vendor-save-btn"
                >
                  {editingVendor
                    ? "Save Changes"
                    : "Add Vendor"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Vendors;

