import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import API from "../api";
import {
  FaEnvelope,
  FaPlus,
  FaTrash,
  FaEdit,
  FaHome,
  FaBriefcase,
  FaArrowLeft,
  FaShoppingCart,
  FaHeadset
} from "react-icons/fa";
import "./Profile.css";

function Profile() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  
  // Address Form State
  const [addressForm, setAddressForm] = useState({
    full_name: "",
    phone: "",
    house_name: "",
    area: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    landmark: "",
    address_type: "home",
    is_default: false
  });

  // Fetch Addresses
  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      const res = await API.get("addresses/");
      setAddresses(res.data);
    } catch (err) {
      console.error("Failed to load addresses", err);
      toast.error("Failed to fetch address book");
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Add or Edit Address Submit
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        // Edit Mode
        const res = await API.put(`addresses/${editingAddressId}/`, addressForm);
        toast.success("Address updated successfully!");
        setAddresses((prev) =>
          prev.map((addr) => (addr.id === editingAddressId ? res.data : addr))
        );
      } else {
        // Add Mode
        const res = await API.post("addresses/", {
          ...addressForm,
          is_default: addresses.length === 0 ? true : addressForm.is_default
        });
        toast.success("Address added successfully!");
        setAddresses((prev) => [...prev, res.data]);
      }
      resetAddressForm();
      fetchAddresses();
    } catch (err) {
      console.error("Failed to save address", err);
      toast.error("Failed to save address. Please check fields.");
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      full_name: "",
      phone: "",
      house_name: "",
      area: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
      landmark: "",
      address_type: "home",
      is_default: false
    });
    setEditingAddressId(null);
    setShowAddressForm(false);
  };

  const handleEditAddressClick = (addr) => {
    setAddressForm({
      full_name: addr.full_name,
      phone: addr.phone,
      house_name: addr.house_name,
      area: addr.area,
      city: addr.city,
      district: addr.district,
      state: addr.state,
      pincode: addr.pincode,
      landmark: addr.landmark || "",
      address_type: addr.address_type,
      is_default: addr.is_default
    });
    setEditingAddressId(addr.id);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await API.delete(`addresses/${id}/`);
      toast.success("Address deleted");
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
      fetchAddresses();
    } catch (err) {
      console.error("Failed to delete address", err);
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await API.post(`addresses/${id}/set-default/`);
      toast.success("Default address updated");
      fetchAddresses();
    } catch (err) {
      console.error("Failed to set default address", err);
      toast.error("Failed to set default address");
    }
  };

  return (
    <div className="sz-profile-page container py-5">
      <div className="row g-4">
        {/* Left Sidebar Navigation */}
        <div className="col-lg-3">
          <div className="sz-profile-sidebar shadow-sm p-4">
            <div className="sz-profile-nav d-flex flex-column gap-2">
              <button
                className="sz-profile-nav-item active"
                onClick={() => navigate("/profile")}
              >
                <FaEnvelope size={16} />
                <span>My Addresses</span>
              </button>
              <button
                className="sz-profile-nav-item"
                onClick={() => navigate("/orders")}
              >
                <FaShoppingCart size={16} />
                <span>Orders & Returns</span>
              </button>
              <button
                className="sz-profile-nav-item"
                onClick={() => navigate("/help")}
              >
                <FaHeadset size={16} />
                <span>Support</span>
              </button>
              
              <div className="border-top my-2 pt-2">
                <button
                  className="sz-profile-nav-item text-danger w-100"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  <FaArrowLeft size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Dashboard Content */}
        <div className="col-lg-9">
          <div className="sz-profile-content shadow-sm p-4 p-md-5">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold mb-0">My Addresses</h3>
                {!showAddressForm && (
                  <button
                    className="btn btn-primary d-flex align-items-center gap-2 fw-bold"
                    onClick={() => {
                      resetAddressForm();
                      setShowAddressForm(true);
                    }}
                  >
                    <FaPlus size={14} /> Add New Address
                  </button>
                )}
              </div>

              {showAddressForm && (
                <div className="card border border-light-subtle bg-light p-4 mb-4 rounded-4 shadow-sm">
                  <h5 className="fw-bold mb-3">
                    {editingAddressId ? "Edit Address Details" : "New Address Details"}
                  </h5>
                  <form onSubmit={handleAddressSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Full Name *</label>
                        <input
                          type="text"
                          required
                          className="form-control"
                          value={addressForm.full_name}
                          onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Phone Number *</label>
                        <input
                          type="text"
                          required
                          className="form-control"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">House / Building Name *</label>
                        <input
                          type="text"
                          required
                          className="form-control"
                          value={addressForm.house_name}
                          onChange={(e) => setAddressForm({ ...addressForm, house_name: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Street / Area *</label>
                        <input
                          type="text"
                          required
                          className="form-control"
                          value={addressForm.area}
                          onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold">City *</label>
                        <input
                          type="text"
                          required
                          className="form-control"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold">District *</label>
                        <input
                          type="text"
                          required
                          className="form-control"
                          value={addressForm.district}
                          onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold">State *</label>
                        <input
                          type="text"
                          required
                          className="form-control"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Pincode *</label>
                        <input
                          type="text"
                          required
                          className="form-control"
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Landmark</label>
                        <input
                          type="text"
                          className="form-control"
                          value={addressForm.landmark}
                          onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Address Type</label>
                        <select
                          className="form-select"
                          value={addressForm.address_type}
                          onChange={(e) => setAddressForm({ ...addressForm, address_type: e.target.value })}
                        >
                          <option value="home">Home</option>
                          <option value="office">Office / Work</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="col-12 mt-4 d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          id="is_default"
                          className="form-check-input"
                          checked={addressForm.is_default}
                          onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                        />
                        <label htmlFor="is_default" className="form-check-label small fw-semibold">
                          Set as default shipping address
                        </label>
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-4">
                      <button type="submit" className="btn btn-primary px-4 fw-bold">
                        {editingAddressId ? "Save Changes" : "Save Address"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary px-4"
                        onClick={resetAddressForm}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {addressLoading ? (
                <div className="py-5 text-center text-muted">Loading address book...</div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-5 border border-dashed rounded-4 bg-white p-4">
                  <p className="text-muted mb-3">You don't have any saved shipping addresses yet.</p>
                  <button
                    className="btn btn-outline-primary fw-bold"
                    onClick={() => setShowAddressForm(true)}
                  >
                    Create First Address
                  </button>
                </div>
              ) : (
                <div className="row g-3">
                  {addresses.map((addr) => (
                    <div className="col-md-6" key={addr.id}>
                      <div className={`sz-address-card p-4 rounded-4 border position-relative h-100 ${addr.is_default ? "border-primary bg-primary-subtle-opacity" : "border-light-subtle bg-white"}`}>
                        
                        {addr.is_default && (
                          <span className="badge bg-primary text-white position-absolute top-0 end-0 m-3 px-3 py-1 rounded-pill small fw-bold">
                            Default
                          </span>
                        )}

                        <div className="d-flex align-items-center gap-2 mb-2">
                          {addr.address_type === "home" ? <FaHome className="text-primary" /> : <FaBriefcase className="text-primary" />}
                          <span className="text-uppercase small fw-bold text-primary tracking-wide">
                            {addr.address_type}
                          </span>
                        </div>

                        <h5 className="fw-bold mb-1 text-dark">{addr.full_name}</h5>
                        <p className="text-muted small mb-3">{addr.phone}</p>

                        <p className="text-dark mb-4 lh-sm small">
                          {addr.house_name}, {addr.area},<br />
                          {addr.city}, {addr.district}, {addr.state} - <strong>{addr.pincode}</strong>
                          {addr.landmark && (
                            <>
                              <br />
                              <span className="text-muted">Landmark: {addr.landmark}</span>
                            </>
                          )}
                        </p>

                        <div className="d-flex gap-2 border-top pt-3 mt-auto">
                          {!addr.is_default && (
                            <button
                              className="btn btn-sm btn-link text-primary p-0 me-3 text-decoration-none fw-bold"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-link text-secondary p-0 me-3 text-decoration-none d-flex align-items-center gap-1"
                            onClick={() => handleEditAddressClick(addr)}
                          >
                            <FaEdit size={12} /> Edit
                          </button>
                          <button
                            className="btn btn-sm btn-link text-danger p-0 text-decoration-none d-flex align-items-center gap-1"
                            onClick={() => handleDeleteAddress(addr.id)}
                          >
                            <FaTrash size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
