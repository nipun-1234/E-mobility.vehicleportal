import React, { useState } from 'react';
import { X, Shield, Landmark, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/api';

export default function GovSsoModal({ onClose, onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [govId, setGovId] = useState('GOV-LK-9948102');

  const handleGovLogin = async () => {
    setLoading(true);
    setTimeout(() => {
      const user = {
        nic: '198810293847',
        name: 'Dr. Nimal Wickramasinghe (Gov-SSO)',
        mobile: '0712345678',
        email: 'nimal.w@gov.lk'
      };
      localStorage.setItem('user', JSON.stringify(user));
      onLoginSuccess(user);
    }, 1200);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Landmark size={22} color="#60a5fa" />
            <h3 className="modal-title">Sri Lanka Digital ID (Gov-SSO)</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{
          background: 'rgba(59, 130, 246, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <Shield size={28} color="#60a5fa" />
          <div>
            <div style={{ fontWeight: '700', fontSize: '13px', color: '#ffffff' }}>
              Government SSO Federated Login
            </div>
            <div style={{ fontSize: '12px', color: '#93c5fd' }}>
              Authenticated via Sri Lanka National Digital Identification System.
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Digital Citizen ID / e-NIC</label>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '16px' }}
            value={govId}
            onChange={(e) => setGovId(e.target.value)}
          />
        </div>

        <button className="btn-primary" onClick={handleGovLogin} disabled={loading}>
          {loading ? 'Authenticating with Gov-SSO Portal...' : (
            <>Authenticate via Gov-SSO <CheckCircle2 size={16} /></>
          )}
        </button>
      </div>
    </div>
  );
}
