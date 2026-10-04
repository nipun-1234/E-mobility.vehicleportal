import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft, User, CreditCard, Smartphone, Mail, Lock, Check,
  ArrowRight, Upload, CheckCircle2, ShieldCheck, Search, Loader2, AlertCircle
} from 'lucide-react';
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

export default function RegisterView({ onBackToLogin, onLoginSuccess }) {
  const [step, setStep] = useState(1); // 1: IDENTITY, 2: VEHICLE, 3: VERIFY

  // Step 1 State: Identity
  const [fullName, setFullName] = useState('');
  const [nic, setNic] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms1, setAgreedTerms1] = useState(false);

  // Step 2 State: Vehicle
  const [plate, setPlate] = useState('');
  const [matchedVehicle, setMatchedVehicle] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [noMatchMessage, setNoMatchMessage] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [province, setProvince] = useState('Western');
  const [revenueFile, setRevenueFile] = useState(null);
  const [agreedTerms2, setAgreedTerms2] = useState(false);

  // Step 3 State: OTP Verification
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookupTimeoutRef = useRef(null);

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Too short', color: '#cbd5e1' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: '#ef4444' };
    if (pass.length < 8) return { score: 2, label: 'Medium', color: '#f59e0b' };
    const hasNum = /\d/.test(pass);
    const hasSym = /[^a-zA-Z0-9]/.test(pass);
    if (hasNum && hasSym) return { score: 4, label: 'Strong — includes numbers and symbols', color: '#10b981' };
    return { score: 3, label: 'Good', color: '#10b981' };
  };

  const passStrength = getPasswordStrength(password);

  // Real-time dynamic database lookup when user types number plate
  const handlePlateChange = (val) => {
    const formattedVal = formatSriLankanPlate(val);
    setPlate(formattedVal);
    setNoMatchMessage('');

    if (lookupTimeoutRef.current) {
      clearTimeout(lookupTimeoutRef.current);
    }

    const cleanInput = formattedVal.replace(/[^A-Z0-9]/g, '');
    if (cleanInput.length < 3) {
      setMatchedVehicle(null);
      setIsLookingUp(false);
      setNoMatchMessage('');
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
          if (res.vehicle.vin) {
            setChassisNumber(res.vehicle.vin);
          }
          // Infer province if plate starts with province code
          const prefix = formattedVal.substring(0, 2);
          const provinceMap = {
            'WP': 'Western', 'CP': 'Central', 'SP': 'Southern', 'NW': 'North Western',
            'SG': 'Sabaragamuwa', 'NP': 'Northern', 'EP': 'Eastern', 'NC': 'North Central',
            'UV': 'Uva', 'SB': 'Sabaragamuwa'
          };
          if (provinceMap[prefix]) {
            setProvince(provinceMap[prefix]);
          }
        } else {
          setMatchedVehicle(null);
          if (cleanInput.length >= 4) {
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

  const handleStep1Next = (e) => {
    e.preventDefault();
    const cleanNic = nic.trim().toUpperCase();

    // 1. Mandatory Fields Check
    if (!fullName.trim() || !cleanNic || !mobile.trim() || !password) {
      setError('Please fill in all required identity details (Name, NIC, Mobile, Password)');
      return;
    }

    // 2. Strict Sri Lankan NIC Format Validation
    if (!isValidSriLankanNIC(cleanNic)) {
      setError('Please enter a valid Sri Lankan NIC number.');
      return;
    }

    // 3. Password Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // 4. Terms Agreement Check
    if (!agreedTerms1) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    setNic(cleanNic);
    setError('');
    setStep(2);
  };

  const handleStep2Next = (e) => {
    e.preventDefault();
    if (plate.trim() && !agreedTerms2) {
      setError('Please confirm vehicle ownership and terms');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setRevenueFile(e.target.files[0].name);
    }
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanNic = nic.trim().toUpperCase();
    if (!isValidSriLankanNIC(cleanNic)) {
      setError('Please enter a valid Sri Lankan NIC number.');
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 Dispatching user registration to shared backend:', { nic: cleanNic, name: fullName, mobile, email });
      const res = await authService.register({
        nic: cleanNic,
        name: fullName.trim(),
        mobile: mobile.trim(),
        email: email.trim() || `${cleanNic.toLowerCase()}@emobility.lk`,
        password,
        district: province
      });

      if (plate.trim()) {
        try {
          await vehicleService.addVehicle({
            plate: plate.trim().toUpperCase(),
            make: matchedVehicle?.make || 'Electric Vehicle',
            model: matchedVehicle?.model || 'EV Portal Registered',
            year: matchedVehicle?.year || 2024,
            type: matchedVehicle?.bodyType || matchedVehicle?.fuelType || 'Electric Car (BEV)',
            color: matchedVehicle?.color || 'Pearl White',
            vin: matchedVehicle?.vin || chassisNumber.trim(),
            ownerNic: cleanNic,
            ownerName: fullName.trim()
          });
        } catch (vehErr) {
          console.warn('Vehicle registration warning:', vehErr);
        }
      }

      console.log('✅ Registration successful:', res);
      onLoginSuccess(res.user || res);
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page-screen">
      <div className="app-page-content">
        {/* Top Title Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <button
            onClick={step === 1 ? onBackToLogin : () => setStep(step - 1)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '1.5px solid #e2e8f0',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Create Citizen Account
            </h1>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Step {step} of 3 — {step === 1 ? 'Personal Identity' : step === 2 ? 'Vehicle Details' : 'Mobile Verification'}
            </div>
          </div>
        </div>

        {/* Multi-Step Progress Indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '22px' }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: '5px',
                borderRadius: '99px',
                background: s <= step ? 'var(--primary, #2563eb)' : '#e2e8f0',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#fca5a5',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '12px',
            marginBottom: '16px',
            fontWeight: '600'
          }}>
            {error}
          </div>
        )}

        {/* STEP 1: IDENTITY */}
        {step === 1 && (
          <form onSubmit={handleStep1Next} className="step-container">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Kasun Bandara"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">National Identity Card (NIC) *</label>
              <div className="input-wrapper">
                <CreditCard size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: '600' }}
                  placeholder="e.g. 200012345678 or 901234567V"
                  value={nic}
                  onChange={(e) => {
                    setNic(e.target.value.toUpperCase());
                    if (error === 'Please enter a valid Sri Lankan NIC number.') {
                      setError('');
                    }
                  }}
                  required
                />
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', marginLeft: '2px' }}>
                Format: 9 digits + V/X (e.g. 901234567V) or 12 digits (e.g. 200012345678)
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Sri Lanka Mobile Number *</label>
              <div className="input-wrapper">
                <Smartphone size={18} className="input-icon" />
                <input
                  type="tel"
                  className="form-input"
                  placeholder="077XXXXXXX"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Optional)</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@example.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Create Password *</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {password && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px' }}>
                  <span style={{ color: passStrength.color, fontWeight: '700' }}>Strength: {passStrength.label}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-options" style={{ marginBottom: '16px' }}>
              <label className="checkbox-label" style={{ alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  checked={agreedTerms1}
                  onChange={(e) => setAgreedTerms1(e.target.checked)}
                  style={{ marginTop: '2px' }}
                />
                <span style={{ fontSize: '12px', lineHeight: '1.4' }}>
                  I agree to the <strong style={{ color: 'var(--primary)' }}>Terms of Service</strong> and <strong style={{ color: 'var(--primary)' }}>Privacy Policy</strong>.
                </span>
              </label>
            </div>

            <button type="submit" className="btn-primary" style={{ height: '48px', fontSize: '14px' }}>
              Continue to Vehicle Details <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* STEP 2: VEHICLE DETAILS */}
        {step === 2 && (
          <form onSubmit={handleStep2Next} className="step-container">
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                Add your vehicle (Optional)
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                We'll match this to the national vehicle registry (7,000 records) automatically
              </p>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Number Plate</label>
                {isLookingUp && (
                  <span style={{ fontSize: '11px', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                    <Loader2 size={12} className="animate-spin" /> Querying National Registry...
                  </span>
                )}
              </div>
              <div className="input-wrapper">
                <Search size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '40px', fontFamily: 'monospace', fontWeight: '700', fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}
                  placeholder="e.g. NW-CAC-1860 or SB-KA-6734"
                  value={plate}
                  onChange={(e) => handlePlateChange(e.target.value)}
                />
              </div>
            </div>

            {/* MATCH FOUND IN NATIONAL REGISTRY */}
            {matchedVehicle && (
              <div style={{
                background: '#ecfdf5',
                border: '1.5px solid #6ee7b7',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
              }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={18} strokeWidth={3} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '10px', fontWeight: '800', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Official Match in Registry
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#064e3b', fontFamily: 'monospace' }}>
                    {matchedVehicle.make} {matchedVehicle.model} — {matchedVehicle.year} — {matchedVehicle.color}
                  </div>
                  <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span><strong>Type:</strong> {matchedVehicle.fuelType || matchedVehicle.bodyType || 'Electric'}</span>
                    <span><strong>VIN:</strong> <code style={{ fontFamily: 'monospace' }}>{matchedVehicle.vin}</code></span>
                  </div>
                </div>
              </div>
            )}

            {/* NO MATCH FOUND */}
            {!matchedVehicle && noMatchMessage && (
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                padding: '10px 14px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <AlertCircle size={16} color="#d97706" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#b45309' }}>
                  {noMatchMessage}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Chassis Number / VIN</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '12px', fontFamily: 'monospace' }}
                  placeholder="e.g. 1HGCR2F83HA000001"
                  value={chassisNumber}
                  onChange={(e) => setChassisNumber(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Province</label>
                <select
                  className="form-input"
                  style={{ paddingLeft: '12px' }}
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                >
                  <option value="Western">Western</option>
                  <option value="Central">Central</option>
                  <option value="Southern">Southern</option>
                  <option value="North Western">North Western</option>
                  <option value="Sabaragamuwa">Sabaragamuwa</option>
                  <option value="Northern">Northern</option>
                  <option value="Eastern">Eastern</option>
                  <option value="North Central">North Central</option>
                  <option value="Uva">Uva</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <div
                style={{ border: '2px dashed #cbd5e1', borderRadius: '14px', padding: '18px 12px', textAlign: 'center', background: '#ffffff', cursor: 'pointer' }}
                onClick={() => document.getElementById('revenue-file-input').click()}
              >
                <Upload size={18} color="var(--primary)" style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>
                  {revenueFile ? `Selected: ${revenueFile}` : 'Upload Revenue License'}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>JPG, PNG or PDF — Max 5MB</div>
                <input type="file" id="revenue-file-input" hidden onChange={handleFileUpload} />
              </div>
            </div>

            <div className="form-options" style={{ marginBottom: '16px' }}>
              <label className="checkbox-label" style={{ alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  checked={agreedTerms2}
                  onChange={(e) => setAgreedTerms2(e.target.checked)}
                  style={{ marginTop: '2px' }}
                />
                <span style={{ fontSize: '12px', lineHeight: '1.4' }}>
                  I confirm vehicle ownership and agree to the <strong style={{ color: 'var(--primary)' }}>Terms of Service</strong>.
                </span>
              </label>
            </div>

            <button type="submit" className="btn-primary" style={{ height: '48px', fontSize: '14px' }}>
              Continue to Verification <ArrowRight size={16} />
            </button>

            <div style={{ marginTop: '8px' }}>
              <button
                type="button"
                className="btn-alt"
                style={{ width: '100%', height: '42px', color: '#64748b', fontSize: '12px' }}
                onClick={() => setStep(3)}
              >
                Add this vehicle later
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: VERIFY OTP */}
        {step === 3 && (
          <form onSubmit={handleCompleteRegistration} className="step-container">
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: '#eff6ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <ShieldCheck size={28} />
              </div>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                Verify Mobile Number
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Enter code sent to <strong>{mobile || '07XXXXXXXX'}</strong> (Demo code: <strong>123456</strong>)
              </p>
            </div>

            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '20px' }}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`reg-otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const newOtp = [...otp];
                    newOtp[idx] = e.target.value.slice(-1);
                    setOtp(newOtp);
                    if (e.target.value && idx < 5) {
                      const next = document.getElementById(`reg-otp-${idx + 1}`);
                      if (next) next.focus();
                    }
                  }}
                  style={{
                    width: '40px',
                    height: '48px',
                    textAlign: 'center',
                    fontSize: '18px',
                    fontWeight: '800',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    background: '#f8fafc'
                  }}
                />
              ))}
            </div>

            <button type="submit" className="btn-primary" style={{ height: '48px' }} disabled={loading}>
              {loading ? 'Creating Account & Linking Vehicle...' : (
                <>Complete Account Registration <CheckCircle2 size={16} /></>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
