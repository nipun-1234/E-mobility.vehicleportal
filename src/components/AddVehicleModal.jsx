import React, { useState, useEffect, useRef } from 'react';
import { X, Car, Plus, CheckCircle2, Search, Check, AlertCircle, Loader2 } from 'lucide-react';
import { vehicleService } from '../services/api';
import { formatSriLankanPlate } from '../utils/formatters';

export default function AddVehicleModal({ onClose, onVehicleAdded, user }) {
  const [plate, setPlate] = useState('');
  const [make, setMake] = useState('Nissan');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2023');
  const [type, setType] = useState('Electric Car (BEV)');
  const [color, setColor] = useState('Pearl White');
  const [matchedVehicle, setMatchedVehicle] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [noMatchMessage, setNoMatchMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookupTimeoutRef = useRef(null);

  const handlePlateChange = (val) => {
    const formattedVal = formatSriLankanPlate(val);
    setPlate(formattedVal);
    setNoMatchMessage('');
    setError('');

    if (lookupTimeoutRef.current) clearTimeout(lookupTimeoutRef.current);

    const cleanInput = formattedVal.replace(/[^A-Z0-9]/g, '');
    if (cleanInput.length < 3) {
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
          const v = res.vehicle;
          setMatchedVehicle(v);
          setMake(v.make || 'Other');
          setModel(v.model || '');
          setYear(String(v.year || 2023));
          setType(v.bodyType || v.fuelType || 'Electric Car (BEV)');
          setColor(v.color || 'Pearl White');
          setNoMatchMessage('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!plate.trim() || !model.trim()) {
      setError('Please provide license plate and vehicle model');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const cleanPlate = plate.trim().toUpperCase();
      const payload = {
        plate: cleanPlate,
        make: matchedVehicle?.make || make,
        model: matchedVehicle?.model || model.trim(),
        year: matchedVehicle?.year || parseInt(year, 10) || 2023,
        type: matchedVehicle?.bodyType || matchedVehicle?.fuelType || type,
        color: matchedVehicle?.color || color,
        vin: matchedVehicle?.vin || '',
        ownerNic: user?.nic || '',
        ownerName: user?.name || ''
      };

      console.log('🚗 Adding vehicle to garage:', payload);
      const newVeh = await vehicleService.addVehicle(payload);
      if (onVehicleAdded) onVehicleAdded(newVeh);
      onClose();
    } catch (err) {
      console.error('Failed to add vehicle:', err);
      setError('Failed to register vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Car size={22} color="#60a5fa" />
            <h3 className="modal-title">Register New Vehicle to Garage</h3>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">License Plate Number *</label>
              {isLookingUp && (
                <span style={{ fontSize: '11px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                  <Loader2 size={12} className="animate-spin" /> Querying Registry...
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
                required
              />
            </div>
          </div>

          {matchedVehicle && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '10px',
              padding: '10px 12px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={16} strokeWidth={3} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#34d399', textTransform: 'uppercase' }}>
                  Official Match in Registry
                </div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff', fontFamily: 'monospace' }}>
                  {matchedVehicle.make} {matchedVehicle.model} — {matchedVehicle.year} — {matchedVehicle.color}
                </div>
              </div>
            </div>
          )}

          {!matchedVehicle && noMatchMessage && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '10px',
              padding: '8px 12px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={14} color="#f59e0b" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#f59e0b' }}>
                {noMatchMessage}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Manufacturer</label>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '12px' }}
                placeholder="e.g. Hyundai / Toyota"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Model *</label>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '12px' }}
                placeholder="e.g. Tucson / Aqua"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Manufacture Year</label>
              <input
                type="number"
                className="form-input"
                style={{ paddingLeft: '12px' }}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Powertrain / Body</label>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '12px' }}
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '12px' }}>
            {loading ? 'Registering...' : <>Add to My Garage <CheckCircle2 size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
