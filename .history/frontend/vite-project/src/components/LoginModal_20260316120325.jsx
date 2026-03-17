import React, { useState } from 'react';

const LoginModal = ({ show, handleClose, openSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt with', email);
    handleClose(); // In a real app, you would authenticate first
  };

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow-lg animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
          <div className="modal-header border-bottom-0 pb-0 px-4 pt-4">
            <h5 className="modal-title fw-bold fs-3 mt-2">Welcome Back</h5>
            <button type="button" className="btn-close shadow-none" onClick={handleClose} aria-label="Close"></button>
          </div>
          <div className="modal-body p-4 pt-2">
            <p className="text-muted small mb-4">Sign in to your SportZone account to continue shopping.</p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold small text-dark mb-1">Email address</label>
                <input 
                  type="email" 
                  className="form-control p-3 bg-light border-0 shadow-none" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ borderRadius: '0.75rem' }}
                  required 
                />
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-bold small text-dark mb-0">Password</label>
                  <a href="#" className="text-decoration-none small text-primary fw-medium">Forgot password?</a>
                </div>
                <input 
                  type="password" 
                  className="form-control p-3 bg-light border-0 shadow-none" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ borderRadius: '0.75rem' }}
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 p-3 rounded-pill fw-bold hover-lift shadow-sm mb-3">
                Sign In
              </button>
            </form>
            
            <div className="text-center mt-3 mb-2">
              <span className="text-muted small">Don't have an account? </span>
              <button 
                className="btn btn-link text-decoration-none p-0 text-primary fw-bold" 
                onClick={openSignup}
              >
                Create account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
