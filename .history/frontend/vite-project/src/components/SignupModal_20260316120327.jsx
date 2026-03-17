import React, { useState } from 'react';

const SignupModal = ({ show, handleClose, openLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  if (!show) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log('Signup attempt with', formData);
    handleClose();
  };

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto', zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow-lg my-4 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
          <div className="modal-header border-bottom-0 pb-0 px-4 pt-4">
            <h5 className="modal-title fw-bold fs-3 mt-2">Create Account</h5>
            <button type="button" className="btn-close shadow-none" onClick={handleClose} aria-label="Close"></button>
          </div>
          <div className="modal-body p-4 pt-2">
            <p className="text-muted small mb-4">Join SportZone for exclusive deals and faster checkout.</p>
            
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-bold small text-dark mb-1">First Name</label>
                  <input 
                    type="text" 
                    className="form-control p-3 bg-light border-0 shadow-none" 
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    style={{ borderRadius: '0.75rem' }}
                    required 
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-bold small text-dark mb-1">Last Name</label>
                  <input 
                    type="text" 
                    className="form-control p-3 bg-light border-0 shadow-none" 
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    style={{ borderRadius: '0.75rem' }}
                    required 
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold small text-dark mb-1">Email address</label>
                <input 
                  type="email" 
                  className="form-control p-3 bg-light border-0 shadow-none" 
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ borderRadius: '0.75rem' }}
                  required 
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold small text-dark mb-1">Password</label>
                <input 
                  type="password" 
                  className="form-control p-3 bg-light border-0 shadow-none" 
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ borderRadius: '0.75rem' }}
                  required 
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold small text-dark mb-1">Confirm Password</label>
                <input 
                  type="password" 
                  className="form-control p-3 bg-light border-0 shadow-none" 
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{ borderRadius: '0.75rem' }}
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 p-3 rounded-pill fw-bold hover-lift shadow-sm mb-3">
                Create Account
              </button>
            </form>
            
            <div className="text-center mt-3 mb-2">
              <span className="text-muted small">Already have an account? </span>
              <button 
                className="btn btn-link text-decoration-none p-0 text-primary fw-bold" 
                onClick={openLogin}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;
