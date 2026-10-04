import React, { useState, useEffect, useRef } from 'react';
import { X, UserCheck, ShieldCheck, ArrowRight, Search, Check, AlertCircle, Loader2 } from 'lucide-react';
import { authService, vehicleService } from '../services/api';
import { formatSriLankanPlate } from '../utils/formatters';

/**
 * Validates Sri Lankan National Identity Card (NIC) format
 * - Old NIC: 9 digits followed by 'V' or 'X' (e.g. 901234567V)
 * - New NIC: 12 digits numeric only (e.g. 200012345678)
 */
export function isValidSriLankanNIC(nic) {
  if (!nic || typeof nic !== 'string') return false;
  const clean = nic.trim().toUpperCase();
  const oldNicRegex = /^[0-9]{9}[VX]$/;
  const newNicRegex = /^[0-9]{12}$/;
  return oldNicRegex.test(clean) || newNicRegex.test(clean);
}

export default function RegisterModal({ onClose, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    nic: '',
    name: '',
    mobile: '',
    email: '',
    password: '',
    vehiclePlate: ''
  });
  const [matchedVehicle, setMatchedVehicle] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [noMatchMessage, setNoMatchMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookupTimeoutRef = useRef(null);

  const handleChange = (e) => {
    let val = e.target.value;
    if (e.target.name === 'nic') {
      val = val.toUpperCase();
    }
    setFormData({ ...formData, [e.target.name]: val });
    if (error) setError('');
  };

  const handlePlateChange = (val) => {
    const formattedVal = formatSriLankanPlate(val);
    setFormData({ ...formData, vehiclePlate: formattedVal });
    setNoMatchMessage('');

    if (lookupTimeoutRef.current) clearTimeout(lookupTimeoutRef.current);

    const clean = formattedVal.replace(/[^A-Z0-9]/g, '');
    if (clean.length < 3) {
      setMatchedVehicle(null);
      setIsLookingUp(false);
      return;
    }

    setIsLookingUp(true);
    lookupTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await vehicleService.lookupPlate(formattedVal);
        setIsLookingUp(false);
        if (res && res.matched && res.vehicle) {
          setMatchedVehicle(res.vehicle);
          setNoMatchMessage('');
        } else {
          setMatchedVehicle(null);
          if (clean.length >= 4) {
            setNoMatchMessage('No vehicle found in the registry.');
          }
        }
      } catch (err) {
        setIsLookingUp(false);
        setMatchedVehicle(null);
        setNoMatchMessage('No vehicle found in the registry.');
      }
    }, 350);
  };

  useEffect(() => {
    return () => {
      if (lookupTimeoutRef.current) clearTimeout(lookupTimeoutRef.current);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanNic = formData.nic.trim().toUpperCase();

    if (!cleanNic || !formData.name.trim() || !formData.mobile.trim() || !formData.password) {
      setError('Please fill in all required fields (NIC, Full Name, Mobile, Password)');
      return;
    }

    if (!isValidSriLankanNIC(cleanNic)) {
      setError('Please enter a valid Sri Lankan NIC number.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register({
        ...formData,
        nic: cleanNic,
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim() || `${cleanNic.toLowerCase()}@emobility.lk`
      });

      if (formData.vehiclePlate.trim()) {
        try {
          await vehicleService.addVehicle({
            plate: formData.vehiclePlate.trim().toUpperCase(),
            make: matchedVehicle?.make || 'Electric Vehicle',
            model: matchedVehicle?.model || 'EV Portal Registered',
            year: matchedVehicle?.year || 2024,
            type: matchedVehicle?.bodyType || matchedVehicle?.fuelType || 'Electric Vehicle',
            vin: matchedVehicle?.vin || '',
            ownerNic: cleanNic,
            ownerName: formData.name.trim()
          });
        } catch (vErr) {
          console.warn('Vehicle registration warning:', vErr);
        }
      }

      onLoginSuccess(res.user || res);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={22} color="#2563eb" />
            <h3 className="modal-title">Create Citizen Account</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#fca5a5', padding: '10px 14px', borderRadius: '12px', fontSize: '12px', marginBottom: '12px', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">National Identity Card (NIC) *</label>
            <input
              type="text"
              name="nic"
              className="form-input"
              style={{ paddingLeft: '16px', textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: '600' }}
              placeholder="e.g. 200012345678 or 901234567V"
              value={formData.nic}
              onChange={handleChange}
            />
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
              9 digits + V/X (e.g. 901234567V) or 12 digits (e.g. 200012345678)
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              style={{ paddingLeft: '16px' }}
              placeholder="As on National ID"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number *</label>
            <input
              type="tel"
              name="mobile"
              className="form-input"
              style={{ paddingLeft: '16px' }}
              placeholder="07XXXXXXXX"
              value={formData.mobile}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Optional)</label>
            <input
              type="email"
              name="email"
              className="form-input"
              style={{ paddingLeft: '16px' }}
              placeholder="name@example.lk"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              name="password"
              className="form-input"
              style={{ paddingLeft: '16px' }}
              placeholder="Create password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Primary Vehicle License Plate (Optional)</label>
              {isLookingUp && (
                <span style={{ fontSize: '11px', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Loader2 size={11} className="animate-spin" /> Querying...
                </span>
              )}
            </div>
            <input
              type="text"
              name="vehiclePlate"
              className="form-input"
              style={{ paddingLeft: '16px', textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: '700' }}
              placeholder="e.g. NW-CAC-1860 or SB-KA-6734"
              value={formData.vehiclePlate}
              onChange={(e) => handlePlateChange(e.target.value)}
            />

            {matchedVehicle && (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '8px 10px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#059669" strokeWidth={3} />
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#064e3b' }}>
                  Matched: {matchedVehicle.make} {matchedVehicle.model} ({matchedVehicle.year}) — {matchedVehicle.color}
                </div>
              </div>
            )}

            {!matchedVehicle && noMatchMessage && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '8px 10px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={14} color="#d97706" />
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#b45309' }}>
                  {noMatchMessage}
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '16px' }} disabled={loading}>
            {loading ? 'Creating Account & Linking...' : <>Register & Continue <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
