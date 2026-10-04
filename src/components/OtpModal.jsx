import React, { useState } from 'react';
import { X, Smartphone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/api';

export default function OtpModal({ onClose, onLoginSuccess }) {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.length < 9) {
      setError('Please enter a valid Sri Lankan mobile number (e.g., 0771234567)');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.requestOtp(mobile);
      setStep(2);
    } catch (err) {
      setError('Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the 6-digit OTP code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await authService.verifyOtp(code);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto advance focus
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={20} color="#60a5fa" />
            <h3 className="modal-title">OTP Quick Login</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: '12px', fontSize: '12px', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '16px' }}>
              We will send a 6-digit verification code to your registered mobile number.
            </p>
            <div className="form-group">
              <label className="form-label">Sri Lanka Mobile Number</label>
              <input
                type="tel"
                className="form-input"
                style={{ paddingLeft: '16px' }}
                placeholder="077XXXXXXX"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending Code...' : <>Send Verification Code <ArrowRight size={16} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '16px' }}>
              Enter the 6-digit code sent to <strong>{mobile}</strong> (Demo code: <strong>123456</strong>):
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  style={{
                    width: '42px',
                    height: '50px',
                    textAlign: 'center',
                    fontSize: '18px',
                    fontWeight: '700',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    backdropFilter: 'blur(8px)'
                  }}
                />
              ))}
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : <>Verify & Sign In <CheckCircle2 size={16} /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
