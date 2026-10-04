import React, { useState } from 'react';
import { X, KeyRound, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordModal({ onClose }) {
  const [nic, setNic] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nic) setSent(true);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={22} color="#60a5fa" />
            <h3 className="modal-title">Reset Password</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <CheckCircle2 size={48} color="#34d399" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>Reset SMS Link Sent!</h4>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '16px' }}>
              A password reset link has been dispatched to your mobile number registered with NIC <strong>{nic}</strong>.
            </p>
            <button className="btn-primary" onClick={onClose}>Close Window</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '16px' }}>
              Enter your registered National Identity Card (NIC) or Mobile Number to receive a reset link.
            </p>
            <div className="form-group">
              <label className="form-label">NIC / Mobile Number</label>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '16px' }}
                placeholder="200012345678 or 07XXXXXXXX"
                value={nic}
                onChange={(e) => setNic(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Send Reset Instructions</button>
          </form>
        )}
      </div>
    </div>
  );
}
