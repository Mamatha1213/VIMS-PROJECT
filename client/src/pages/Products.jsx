import { useEffect, useMemo, useState } from "react";
import axios from "axios";

function Products() {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    productName: "",
    quantity: "",
    price: "",
    vendor: "",
  });

  // ==========================================
  // FETCH PRODUCTS + VENDORS
  // ==========================================

  const fetchData = async () => {
    try {
      setLoading(true);

      const [productsResponse, vendorsResponse] =
        await Promise.all([
          axios.get(
            "http://localhost:5000/api/products/get-products"
          ),
          axios.get(
            "http://localhost:5000/api/vendors/get-vendors"
          ),
        ]);

      setProducts(productsResponse.data);
      setVendors(vendorsResponse.data);

    } catch (error) {
      console.error("Error fetching products/vendors:", error);

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unable to load products and vendors."
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
    setEditingProduct(null);

    setForm({
      productName: "",
      quantity: "",
      price: "",
      vendor: "",
    });

    setShowModal(true);
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const openEditModal = (product) => {
    setEditingProduct(product);

    setForm({
      productName: product.productName || "",
      quantity: product.quantity ?? "",
      price: product.price ?? "",
      vendor: product.vendor || "",
    });

    setShowModal(true);
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
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
  // ADD / UPDATE PRODUCT
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.productName.trim()) {
      alert("Please enter a product name.");
      return;
    }

    if (
      form.quantity === "" ||
      Number(form.quantity) < 0
    ) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (
      form.price === "" ||
      Number(form.price) < 0
    ) {
      alert("Please enter a valid price.");
      return;
    }

    if (!form.vendor) {
      alert("Please select a vendor.");
      return;
    }

    try {
      const productData = {
        productName: form.productName.trim(),
        quantity: Number(form.quantity),
        price: Number(form.price),
        vendor: form.vendor,
      };

      // UPDATE
      if (editingProduct) {
        await axios.put(
          `http://localhost:5000/api/products/update-product/${editingProduct._id}`,
          productData
        );

        alert("Product updated successfully.");
      }

      // ADD
      else {
        await axios.post(
          "http://localhost:5000/api/products/add-product",
          productData
        );

        alert("Product added successfully.");
      }

      closeModal();

      await fetchData();

    } catch (error) {
      console.error("Error saving product:", error);

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unable to save product."
      );
    }
  };

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  const deleteProduct = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/products/delete-product/${id}`
      );

      alert("Product deleted successfully.");

      await fetchData();

    } catch (error) {
      console.error("Error deleting product:", error);

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unable to delete product."
      );
    }
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredProducts = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.productName
          ?.toLowerCase()
          .includes(searchValue) ||
        product.vendor
          ?.toLowerCase()
          .includes(searchValue)
      );
    });
  }, [products, search]);

  // ==========================================
  // TOTAL INVENTORY VALUE
  // ==========================================

  const totalValue = products.reduce(
    (total, product) =>
      total +
      Number(product.quantity || 0) *
        Number(product.price || 0),
    0
  );

  // ==========================================
  // LOW STOCK
  // ==========================================

  const lowStockCount = products.filter(
    (product) =>
      Number(product.quantity || 0) < 5
  ).length;

  // ==========================================
  // STOCK STATUS
  // ==========================================

  const getStockStatus = (quantity) => {
    const value = Number(quantity || 0);

    if (value === 0) {
      return {
        label: "Out of Stock",
        className: "stock-danger",
      };
    }

    if (value < 5) {
      return {
        label: "Low Stock",
        className: "stock-warning",
      };
    }

    return {
      label: "In Stock",
      className: "stock-success",
    };
  };

  // ==========================================
  // CURRENCY
  // ==========================================

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  return (
    <div className="products-page">

      {/* PAGE HEADER */}

      <section className="products-hero">

        <div>

          <div className="products-eyebrow">
            <span>📦</span>
            INVENTORY MANAGEMENT
          </div>

          <h1>Products</h1>

          <p>
            Manage your products, stock levels, vendors
            and inventory value from one place.
          </p>

        </div>

        <button
          className="add-product-btn"
          onClick={openAddModal}
        >
          <span>＋</span>
          Add Product
        </button>

      </section>

      {/* SUMMARY CARDS */}

      <section className="product-summary-grid">

        <div className="product-stat-card">

          <div className="product-stat-icon purple">
            📦
          </div>

          <div>
            <span>Total Products</span>
            <strong>{products.length}</strong>
          </div>

        </div>

        <div className="product-stat-card">

          <div className="product-stat-icon blue">
            📊
          </div>

          <div>
            <span>Total Stock</span>

            <strong>
              {products.reduce(
                (total, product) =>
                  total +
                  Number(product.quantity || 0),
                0
              )}
            </strong>

          </div>

        </div>

        <div className="product-stat-card">

          <div className="product-stat-icon green">
            💰
          </div>

          <div>
            <span>Inventory Value</span>

            <strong>
              {formatCurrency(totalValue)}
            </strong>

          </div>

        </div>

        <div className="product-stat-card">

          <div className="product-stat-icon orange">
            ⚠️
          </div>

          <div>
            <span>Low Stock</span>
            <strong>{lowStockCount}</strong>
          </div>

        </div>

      </section>

      {/* PRODUCT LIST */}

      <section className="products-panel">

        <div className="products-panel-header">

          <div>

            <h2>Product Inventory</h2>

            <p>
              {filteredProducts.length} product
              {filteredProducts.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>

          </div>

          <div className="product-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search products or vendors..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {search && (
              <button
                className="clear-search"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}

          </div>

        </div>

        {/* LOADING */}

        {loading ? (

          <div className="products-loading">

            <div className="loading-spinner"></div>

            <p>
              Loading products...
            </p>

          </div>

        ) : filteredProducts.length === 0 ? (

          /* EMPTY */

          <div className="products-empty">

            <div className="empty-icon">
              📦
            </div>

            <h3>
              {search
                ? "No products found"
                : "No products yet"}
            </h3>

            <p>
              {search
                ? "Try searching with a different product or vendor name."
                : "Add your first product to start managing your inventory."}
            </p>

            {!search && (
              <button
                className="empty-add-btn"
                onClick={openAddModal}
              >
                ＋ Add Your First Product
              </button>
            )}

          </div>

        ) : (

          /* TABLE */

          <div className="products-table-wrapper">

            <table className="products-table">

              <thead>

                <tr>
                  <th>PRODUCT</th>
                  <th>STOCK</th>
                  <th>PRICE</th>
                  <th>VENDOR</th>
                  <th>VALUE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>

              </thead>

              <tbody>

                {filteredProducts.map((product) => {

                  const stockStatus =
                    getStockStatus(
                      product.quantity
                    );

                  const inventoryValue =
                    Number(product.quantity || 0) *
                    Number(product.price || 0);

                  return (

                    <tr key={product._id}>

                      {/* PRODUCT */}

                      <td>

                        <div className="product-name-cell">

                          <div className="product-avatar">

                            {product.productName
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "P"}

                          </div>

                          <div>

                            <strong>
                              {product.productName}
                            </strong>

                            <span>
                              Product ID:{" "}
                              {product._id?.slice(-6)}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* STOCK */}

                      <td>

                        <div className="quantity-cell">

                          <strong>
                            {product.quantity}
                          </strong>

                          <span>
                            units
                          </span>

                        </div>

                      </td>

                      {/* PRICE */}

                      <td>

                        <strong className="price-text">
                          {formatCurrency(
                            product.price
                          )}
                        </strong>

                      </td>

                      {/* VENDOR */}

                      <td>

                        <div className="vendor-cell">

                          <span className="vendor-mini-icon">
                            🏢
                          </span>

                          <span>
                            {product.vendor ||
                              "No vendor"}
                          </span>

                        </div>

                      </td>

                      {/* VALUE */}

                      <td>

                        <strong>
                          {formatCurrency(
                            inventoryValue
                          )}
                        </strong>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`stock-badge ${stockStatus.className}`}
                        >
                          <span></span>
                          {stockStatus.label}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="product-actions">

                          <button
                            className="action-btn edit-btn"
                            onClick={() =>
                              openEditModal(
                                product
                              )
                            }
                            title="Edit product"
                          >
                            ✏️
                          </button>

                          <button
                            className="action-btn delete-btn"
                            onClick={() =>
                              deleteProduct(
                                product._id
                              )
                            }
                            title="Delete product"
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
          className="product-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="product-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="product-modal-header">

              <div>

                <div className="modal-icon">
                  📦
                </div>

                <div>

                  <h2>
                    {editingProduct
                      ? "Edit Product"
                      : "Add Product"}
                  </h2>

                  <p>
                    {editingProduct
                      ? "Update product information"
                      : "Add a new product to your inventory"}
                  </p>

                </div>

              </div>

              <button
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              className="product-form"
              onSubmit={handleSubmit}
            >

              {/* PRODUCT NAME */}

              <div className="form-group">

                <label>
                  Product Name
                </label>

                <input
                  type="text"
                  name="productName"
                  value={form.productName}
                  onChange={handleChange}
                  placeholder="e.g. Wireless Mouse"
                  required
                />

              </div>

              {/* QUANTITY + PRICE */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Quantity
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="0"
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Price
                  </label>

                  <div className="price-input">

                    <span>₹</span>

                    <input
                      type="number"
                      name="price"
                      min="0"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0"
                      required
                    />

                  </div>

                </div>

              </div>

              {/* VENDOR */}

              <div className="form-group">

                <label>
                  Vendor
                </label>

                <select
                  name="vendor"
                  value={form.vendor}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select a vendor
                  </option>

                  {vendors.map((vendor) => (

                    <option
                      key={vendor._id}
                      value={vendor.name}
                    >
                      {vendor.name}
                    </option>

                  ))}

                </select>

              </div>

              {/* ACTIONS */}

              <div className="product-form-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-product-btn"
                >
                  {editingProduct
                    ? "Save Changes"
                    : "Add Product"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Products;
