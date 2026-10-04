import React, { useState, useEffect } from 'react';
import {
  Bell, Car, AlertTriangle, ShieldCheck, Zap, LogOut, Plus,
  CreditCard, QrCode, Battery, CheckCircle2, Clock, MapPin,
  Search, ShieldAlert, FileText, ChevronRight, Home, User, Check,
  Edit3, Shield, Globe, HelpCircle, X, ChevronDown, Lock, PhoneCall,
  Calendar, Camera, Download, AlertOctagon, FileCheck
} from 'lucide-react';
import { vehicleService, fineService, stationService } from '../services/api';
import PaymentModal from './PaymentModal';
import DisputeModal from './DisputeModal';
import AddVehicleModal from './AddVehicleModal';
import { useLanguage } from '../context/LanguageContext';

function SriLankaPlate({ plate, compact = false }) {
  let province = 'WP';
  let number = plate || 'CAB-4521';
  
  if (plate) {
    const clean = plate.trim();
    const match = clean.match(/^([A-Za-z]{2})[\s-]+(.*)$/);
    if (match) {
      province = match[1].toUpperCase();
      number = match[2].toUpperCase();
    } else {
      number = clean.toUpperCase();
    }
  }

  return (
    <div className={`sl-plate-container ${compact ? 'plate-compact' : ''}`}>
      <div className="sl-plate-province">{province}</div>
      <div className="sl-plate-number">{number}</div>
    </div>
  );
}

export default function DashboardView({ user, onLogout }) {
  const { language, setLanguage, t } = useLanguage();
  const [activeBottomNav, setActiveBottomNav] = useState('home'); // 'home' | 'garage' | 'tickets' | 'profile'
  const [vehicles, setVehicles] = useState([]);
  const [fines, setFines] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [stations, setStations] = useState([]);

  // Active Modals
  const [selectedFineForPay, setSelectedFineForPay] = useState(null);
  const [selectedFineForDispute, setSelectedFineForDispute] = useState(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showQrModal, setShowQrModal] = useState(null);

  // Tickets View Filter, Search, and Evidence Expand State
  const [ticketFilter, setTicketFilter] = useState('All'); // 'All' | 'Unpaid' | 'Paid' | 'Disputed'
  const [ticketSearch, setTicketSearch] = useState('');
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState('WP CAB-4521');

  // Profile Settings Modals & User State
  const [activeProfileModal, setActiveProfileModal] = useState(null);
  const [selectedLang, setSelectedLang] = useState('English');
  const [userData, setUserData] = useState(() => user || {
    name: 'Kavinda Perera',
    nic: '200012345678',
    mobile: '0771234567',
    email: 'kavinda.perera@example.lk',
    licenseNo: 'B-9918231',
    district: 'Colombo'
  });

  // Edit Profile Form State
  const [editName, setEditName] = useState(userData?.name || '');
  const [editMobile, setEditMobile] = useState(userData?.mobile || '');
  const [editEmail, setEditEmail] = useState(userData?.email || '');
  const [editLicense, setEditLicense] = useState(userData?.licenseNo || 'B-9918231');

  // Notifications Toggle State
  const [notifSettings, setNotifSettings] = useState({
    fines: true,
    license: true,
    evStations: true,
    news: false
  });

  // Security Form State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [twoFactor, setTwoFactor] = useState(true);
  const [securitySuccess, setSecuritySuccess] = useState('');

  // Help Center FAQ State
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    if (user) {
      setUserData(user);
      setEditName(user.name || '');
      setEditMobile(user.mobile || '');
      setEditEmail(user.email || '');
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const currentNic = userData?.nic || user?.nic;
      const [vList, fList, dList, sList] = await Promise.allSettled([
        vehicleService.getVehicles(currentNic),
        fineService.getFines(),
        fineService.getDisputes ? fineService.getDisputes() : Promise.resolve([]),
        stationService.getStations()
      ]);

      if (vList.status === 'fulfilled' && Array.isArray(vList.value)) {
        setVehicles(vList.value);
      }
      if (fList.status === 'fulfilled' && Array.isArray(fList.value)) {
        setFines(fList.value);
      }
      if (dList.status === 'fulfilled' && Array.isArray(dList.value)) {
        setDisputes(dList.value);
      }
      if (sList.status === 'fulfilled' && Array.isArray(sList.value)) {
        setStations(sList.value);
      }
    } catch (err) {
      console.warn('fetchData warning:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  
  // Dynamic display vehicles linked to user
  const displayVehicles = React.useMemo(() => {
    if (vehicles && vehicles.length > 0) {
      return vehicles.map((v, idx) => {
        const plateNorm = (v.plate || '').replace(/[^A-Z0-9]/g, '');
        const matchingFine = (fines || []).find(f => 
          f.status !== 'Paid' && 
          (f.vehiclePlate || '').replace(/[^A-Z0-9]/g, '') === plateNorm
        );
        const displayName = v.make && v.model 
          ? `${v.make} ${v.model}` 
          : (v.model || v.make || 'Toyota Aqua');
        const displayYear = v.year ? `• ${v.year}` : '';

        return {
          id: v.id || `v_${idx}`,
          make: v.make || '',
          model: v.model || displayName,
          displayName: `${displayName} ${displayYear}`.trim(),
          year: v.year || '',
          plate: v.plate || 'WP CAB-4521',
          type: v.type || v.powertrain || 'Electric Vehicle (BEV)',
          status: matchingFine ? 'Pending Fine' : 'Clear',
          statusType: matchingFine ? 'warning' : 'success',
          batteryLevel: v.batteryLevel || v.battery_level || 90,
          revenueLicenseStatus: v.revenueLicenseStatus || v.revenue_license_status || 'License Valid'
        };
      });
    }
    return [
      {
        id: 'g_01',
        make: 'Toyota',
        model: 'Aqua',
        displayName: 'Toyota Aqua • 2020',
        year: '2020',
        plate: 'WP CAB-4521',
        type: 'Hybrid 1.5L Synergy',
        status: (fines || []).some(f => f.status !== 'Paid' && (f.vehiclePlate || '').includes('CAB-4521')) ? 'Pending Fine' : 'Clear',
        statusType: (fines || []).some(f => f.status !== 'Paid' && (f.vehiclePlate || '').includes('CAB-4521')) ? 'warning' : 'success',
        batteryLevel: 92,
        revenueLicenseStatus: 'License Valid'
      },
      {
        id: 'g_02',
        make: 'Suzuki',
        model: 'Wagon R',
        displayName: 'Suzuki Wagon R • 2021',
        year: '2021',
        plate: 'SP KY-3390',
        type: 'Mild Hybrid 660cc',
        status: (fines || []).some(f => f.status !== 'Paid' && (f.vehiclePlate || '').includes('KY-3390')) ? 'Pending Fine' : 'Clear',
        statusType: (fines || []).some(f => f.status !== 'Paid' && (f.vehiclePlate || '').includes('KY-3390')) ? 'warning' : 'success',
        batteryLevel: 85,
        revenueLicenseStatus: 'License Valid'
      }
    ];
  }, [vehicles, fines]);

  // Dynamically resolve the high-speed ticket evidence for the active vehicle
  const activeEvidenceFine = React.useMemo(() => {
    const defaultEvidence = {
      id: 'TX-92603',
      vehiclePlate: selectedVehiclePlate || 'WP CAB-4521',
      violationType: 'Speed Violation (Exceeding 100 km/h Highway Limit)',
      capturedSpeed: 115,
      speedRecorded: '115 km/h',
      postedLimit: 100,
      speedLimit: '100 km/h',
      excessSpeed: '+15 km/h',
      amount: 3850,
      amountFormatted: 'LKR 3,850',
      dateTime: '2026-10-02 14:32:18 IST',
      location: 'Southern Expressway - Km 68.4 (Galle Bound)',
      locationCoords: '6.0329° N, 80.2168° E (Km 68.4 Southern Expressway)',
      cameraSource: 'Cam-01 (Southern Expressway, Km 68.4)',
      policeStation: 'Southern Expressway Division',
      officerBadge: 'PO-8819 (Sgt. Jayawardena)',
      radarCalibration: 'Doppler 77GHz (Radar-Cal: 99.8%)',
      status: 'Unpaid',
      evidenceImage: '/speed_violation_evidence.png'
    };

    if (!fines || fines.length === 0) return defaultEvidence;
    const cleanSelected = (selectedVehiclePlate || 'WP CAB-4521').replace(/[^A-Z0-9]/g, '');

    // 1. Try unpaid fine matching selected vehicle
    const unpaidMatch = fines.find(f => 
      f.status !== 'Paid' && 
      (f.vehiclePlate || f.vehicle_plate || '').replace(/[^A-Z0-9]/g, '').includes(cleanSelected)
    );
    if (unpaidMatch) {
      const sp = parseInt((unpaidMatch.speedRecorded || unpaidMatch.speed_recorded || '115').toString().replace(/[^0-9]/g, '')) || 115;
      const lim = parseInt((unpaidMatch.speedLimit || unpaidMatch.speed_limit || '100').toString().replace(/[^0-9]/g, '')) || 100;
      return {
        ...defaultEvidence,
        ...unpaidMatch,
        id: unpaidMatch.id || defaultEvidence.id,
        vehiclePlate: unpaidMatch.vehiclePlate || unpaidMatch.vehicle_plate || defaultEvidence.vehiclePlate,
        capturedSpeed: sp,
        speedRecorded: sp + " km/h",
        postedLimit: lim,
        speedLimit: lim + " km/h",
        excessSpeed: "+" + Math.max(0, sp - lim) + " km/h",
        locationCoords: unpaidMatch.locationCoords || unpaidMatch.location_coords || defaultEvidence.locationCoords,
        policeStation: unpaidMatch.policeStation || unpaidMatch.police_station || defaultEvidence.policeStation,
        status: unpaidMatch.status || 'Unpaid',
        evidenceImage: '/speed_violation_evidence.png'
      };
    }

    // 2. Try any fine matching selected vehicle
    const anyMatch = fines.find(f => 
      (f.vehiclePlate || f.vehicle_plate || '').replace(/[^A-Z0-9]/g, '').includes(cleanSelected)
    );
    if (anyMatch) {
      const sp = parseInt((anyMatch.speedRecorded || anyMatch.speed_recorded || '115').toString().replace(/[^0-9]/g, '')) || 115;
      const lim = parseInt((anyMatch.speedLimit || anyMatch.speed_limit || '100').toString().replace(/[^0-9]/g, '')) || 100;
      return {
        ...defaultEvidence,
        ...anyMatch,
        id: anyMatch.id || defaultEvidence.id,
        vehiclePlate: anyMatch.vehiclePlate || anyMatch.vehicle_plate || defaultEvidence.vehiclePlate,
        capturedSpeed: sp,
        speedRecorded: sp + " km/h",
        postedLimit: lim,
        speedLimit: lim + " km/h",
        excessSpeed: "+" + Math.max(0, sp - lim) + " km/h",
        locationCoords: anyMatch.locationCoords || anyMatch.location_coords || defaultEvidence.locationCoords,
        policeStation: anyMatch.policeStation || anyMatch.police_station || defaultEvidence.policeStation,
        status: anyMatch.status || 'Unpaid',
        evidenceImage: '/speed_violation_evidence.png'
      };
    }

    // 3. Fallback to first fine
    const firstFine = fines.find(f => f.status !== 'Paid') || fines[0];
    const sp = parseInt((firstFine.speedRecorded || firstFine.speed_recorded || '115').toString().replace(/[^0-9]/g, '')) || 115;
    const lim = parseInt((firstFine.speedLimit || firstFine.speed_limit || '100').toString().replace(/[^0-9]/g, '')) || 100;
    return {
      ...defaultEvidence,
      ...firstFine,
      id: firstFine.id || defaultEvidence.id,
      vehiclePlate: firstFine.vehiclePlate || firstFine.vehicle_plate || defaultEvidence.vehiclePlate,
      capturedSpeed: sp,
      speedRecorded: sp + " km/h",
      postedLimit: lim,
      speedLimit: lim + " km/h",
      excessSpeed: "+" + Math.max(0, sp - lim) + " km/h",
      locationCoords: firstFine.locationCoords || firstFine.location_coords || defaultEvidence.locationCoords,
      policeStation: firstFine.policeStation || firstFine.police_station || defaultEvidence.policeStation,
      status: firstFine.status || 'Unpaid',
      evidenceImage: '/speed_violation_evidence.png'
    };
  }, [fines, selectedVehiclePlate]);

  return (
    <div className="app-page-screen">
      {/* Top Pro-Tier Government Glass Header */}
      <div className="portal-header-pro">
        <div className="gov-branding-row">
          <div className="gov-emblem-badge">
            <div className="gov-crest-icon">
              <ShieldCheck size={22} />
            </div>
            <div className="gov-text-col">
              <span className="gov-super-title">Democratic Socialist Republic of Sri Lanka</span>
              <span className="gov-main-title">
                {activeBottomNav === 'home' && 'E-Mobility Portal'}
                {activeBottomNav === 'garage' && 'Digital Garage & Fleet'}
                {activeBottomNav === 'tickets' && 'Traffic Citations & Fines'}
                {activeBottomNav === 'profile' && 'National Driver Identity'}
              </span>
            </div>
          </div>

          <div className="header-action-group">
            <button
              className="lang-pill-btn"
              onClick={() => setActiveProfileModal('language')}
              title="Switch Language"
            >
              <Globe size={13} />
              <span>{language === 'English' ? 'EN' : language === 'Sinhala' ? 'සිං' : 'த'}</span>
            </button>

            <button
              className="notif-bell-btn"
              onClick={() => setActiveProfileModal('notifications')}
              title="Notifications"
            >
              <Bell size={18} />
              <span className="notif-badge-dot" />
            </button>
          </div>
        </div>

        {/* Dynamic Context Header Sub-row depending on Tab */}
        {activeBottomNav === 'home' && (
          <div className="citizen-welcome-row">
            <div>
              <div className="citizen-greeting-label">{t('welcome')}</div>
              <div className="citizen-name-title">
                <span>{userData?.name || user?.name || 'Kavinda Perera'}</span>
                <span className="citizen-verified-pill">
                  <Check size={11} strokeWidth={3} /> Verified ID
                </span>
              </div>
            </div>

            <div className="citizen-avatar-box">
              {userData?.name ? userData.name.charAt(0) : (user?.name ? user.name.charAt(0) : 'K')}
            </div>
          </div>
        )}

        {activeBottomNav === 'garage' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>REGISTERED FLEET</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', fontFamily: 'Plus Jakarta Sans' }}>
                {(vehicles && vehicles.length > 0) ? vehicles.length : 2} Vehicles Connected
              </div>
            </div>
            <span className="status-pill-success">
              <span className="live-dot-pulse" /> Live DMT Sync
            </span>
          </div>
        )}

        {activeBottomNav === 'tickets' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>POLICE CITATIONS</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#fda4af', fontFamily: 'Plus Jakarta Sans' }}>
                1 Active Violation (Rs. 3,850)
              </div>
            </div>
            <span className="status-pill-warning">
              <span className="live-dot-pulse" /> Action Required
            </span>
          </div>
        )}

        {activeBottomNav === 'profile' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>SMART CREDENTIALS</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', fontFamily: 'Plus Jakarta Sans' }}>
                {userData?.name || 'Kavinda Perera'}
              </div>
            </div>
            <span className="citizen-verified-pill">
              <Check size={11} strokeWidth={3} /> Gov-SSO Linked
            </span>
          </div>
        )}
      </div>

      {/* App Page Content */}
      <div className="app-page-content" style={{ paddingBottom: '110px' }}>

        {/* TAB 1: HOME VIEW */}
        {activeBottomNav === 'home' && (
          <>
            {/* Executive 3-Column Summary Metrics */}
            <div className="summary-metrics-strip">
              <div className="metric-mini-box" style={{ '--top-accent': '#3b82f6' }}>
                <span className="metric-mini-label">Registered Fleet</span>
                <span className="metric-mini-val">{(vehicles && vehicles.length > 0) ? vehicles.length : 2} Vehicles</span>
                <span className="metric-mini-sub" style={{ '--sub-color': '#60a5fa' }}>● 100% Tax Compliant</span>
              </div>

              <div className="metric-mini-box" style={{ '--top-accent': '#f43f5e' }}>
                <span className="metric-mini-label">Pending Fine</span>
                <span className="metric-mini-val" style={{ color: '#fda4af' }}>Rs. 3,850</span>
                <span className="metric-mini-sub" style={{ '--sub-color': '#fca5a5' }}>● 1 Violation Unpaid</span>
              </div>

              <div className="metric-mini-box" style={{ '--top-accent': '#10b981' }}>
                <span className="metric-mini-label">Demerit Record</span>
                <span className="metric-mini-val" style={{ color: '#34d399' }}>3 / 24 pts</span>
                <span className="metric-mini-sub" style={{ '--sub-color': '#6ee7b7' }}>● License Active</span>
              </div>
            </div>

            {/* My Garage Section */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '17px', fontWeight: '800', color: '#ffffff' }}>
                  {t('myGarage')}
                </h2>
                <button
                  onClick={() => setActiveBottomNav('garage')}
                  style={{ background: 'none', border: 'none', color: '#60a5fa', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {t('manage')} <ChevronRight size={14} />
                </button>
              </div>

              {displayVehicles.map((v) => {
                const isSelected = (selectedVehiclePlate || '').replace(/[^A-Z0-9]/g, '') === (v.plate || '').replace(/[^A-Z0-9]/g, '');
                return (
                  <div
                    key={v.id}
                    className="vehicle-card-pro"
                    onClick={() => setSelectedVehiclePlate(v.plate)}
                    style={{
                      cursor: 'pointer',
                      border: isSelected ? '1.5px solid rgba(59, 130, 246, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelected ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.3) 0%, rgba(15, 23, 42, 0.8) 100%)' : undefined,
                      boxShadow: isSelected ? '0 8px 24px rgba(59, 130, 246, 0.2)' : undefined,
                      transition: 'all 0.25s ease'
                    }}
                  >
                    <div className="vehicle-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                        <div className="vehicle-icon-bubble" style={{ background: isSelected ? 'rgba(59, 130, 246, 0.3)' : undefined }}>
                          <Car size={22} color={isSelected ? '#60a5fa' : undefined} />
                        </div>
                        <div className="vehicle-main-info">
                          <div className="vehicle-model-text">
                            {v.model}
                          </div>
                          <div className="vehicle-meta-sub">
                            <SriLankaPlate plate={v.plate} compact={true} />
                            <span style={{ fontSize: '10.5px', color: '#64748b' }}>•</span>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                              {v.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className={v.statusType === 'warning' ? 'status-pill-warning' : 'status-pill-success'}>
                        <span className="live-dot-pulse" />
                        {v.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

                        {/* Ticket Evidence Section */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '17px', fontWeight: '800', color: '#ffffff' }}>
                  {t('ticketEvidence')}
                </h2>
                {activeEvidenceFine && (
                  <span style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: '600' }}>
                    Linked Vehicle: <strong style={{ color: '#93c5fd' }}>{activeEvidenceFine.vehiclePlate}</strong>
                  </span>
                )}
              </div>

              {activeEvidenceFine ? (
                <div className="radar-evidence-card">
                  <div className="radar-header-row">
                    <div className="citation-ref-badge">
                      <span style={{ color: '#64748b' }}>CITATION:</span>
                      <span style={{ color: '#ffffff' }}>#{activeEvidenceFine.id}</span>
                    </div>
                    <span className={activeEvidenceFine.status === 'Paid' ? 'citation-paid-pill' : activeEvidenceFine.status === 'Disputed' ? 'citation-disputed-pill' : 'citation-unpaid-pill'} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '800',
                      background: activeEvidenceFine.status === 'Paid' ? 'rgba(16, 185, 129, 0.15)' : activeEvidenceFine.status === 'Disputed' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: activeEvidenceFine.status === 'Paid' ? '#34d399' : activeEvidenceFine.status === 'Disputed' ? '#fbbf24' : '#fca5a5',
                      border: `1px solid ${activeEvidenceFine.status === 'Paid' ? 'rgba(16, 185, 129, 0.3)' : activeEvidenceFine.status === 'Disputed' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeEvidenceFine.status === 'Paid' ? '#34d399' : activeEvidenceFine.status === 'Disputed' ? '#fbbf24' : '#f43f5e', display: 'inline-block' }} />
                      {activeEvidenceFine.status === 'Paid' ? 'Paid Citation' : activeEvidenceFine.status === 'Disputed' ? 'Under Dispute' : 'Unpaid Citation'}
                    </span>
                  </div>

                  {/* Real-Time Live Vehicle Screenshot from Cam-01 (Southern Expressway, Km 68.4) */}
                  <div className="cctv-frame-pro" style={{ position: 'relative', overflow: 'hidden', height: '175px', borderRadius: '18px', background: '#020617', border: '1px solid rgba(59, 130, 246, 0.25)', marginBottom: '16px' }}>
                    <img
                      src={activeEvidenceFine.evidenceImage || "/speed_violation_evidence.png"}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/camera_01_live.jpg";
                      }}
                      alt="Cam-01 (Southern Expressway, Km 68.4) Live Vehicle Screenshot"
                      className="cctv-bg-img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    <div className="cctv-vignette-overlay" />
                    <div className="cctv-scanline-laser" />

                    {/* Top Camera Metadata HUD */}
                    <div className="cctv-rec-pill">
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 8px #ef4444' }} />
                      <span>RADAR EVIDENCE SNAPSHOT • 115 KM/H</span>
                    </div>

                    <div className="cctv-cam-id-pill">
                      CAM-01 • SOUTHERN EXPY KM 68.4
                    </div>
                  </div>

                {/* Speed Radar Telemetry & Radial SVG Gauge */}
                  <div className="speed-telemetry-container">
                    <div className="speedometer-visual-box">
                      <svg className="gauge-svg-circle" viewBox="0 0 82 82">
                        <circle className="gauge-track-bg" cx="41" cy="41" r="36" />
                        <circle
                          className="gauge-track-fill"
                          cx="41"
                          cy="41"
                          r="36"
                          stroke={activeEvidenceFine.status === 'Paid' ? '#10b981' : '#f43f5e'}
                          strokeDasharray="226.195"
                          strokeDashoffset={Math.max(0, 226.195 - ((activeEvidenceFine.capturedSpeed || 115) / 160) * 226.195)}
                        />
                      </svg>
                      <div className="gauge-inner-content">
                        <span className="gauge-speed-val" style={{ color: activeEvidenceFine.status === 'Paid' ? '#34d399' : '#ffffff' }}>
                          {activeEvidenceFine.capturedSpeed || 115}
                        </span>
                        <span className="gauge-speed-unit">KM/H</span>
                      </div>
                    </div>

                    <div className="telemetry-data-col">
                      <div className="telemetry-row-item">
                        <span className="telemetry-row-label">Captured Speed</span>
                        <span className="telemetry-row-val" style={{ color: '#f43f5e' }}>
                          {activeEvidenceFine.speedRecorded || `${activeEvidenceFine.capturedSpeed || 115} km/h`}
                        </span>
                      </div>
                      <div className="telemetry-row-item">
                        <span className="telemetry-row-label">Posted Limit</span>
                        <span className="telemetry-row-val" style={{ color: '#e2e8f0' }}>
                          {activeEvidenceFine.speedLimit || `${activeEvidenceFine.postedLimit || 100} km/h`}
                        </span>
                      </div>
                      <div className="telemetry-row-item">
                        <span className="telemetry-row-label">Excess Speed</span>
                        <span className="telemetry-row-val" style={{ color: '#fbbf24' }}>
                          {activeEvidenceFine.excessSpeed || `+${(activeEvidenceFine.capturedSpeed || 115) - (activeEvidenceFine.postedLimit || 100)} km/h`}
                        </span>
                      </div>
                      <div className="telemetry-row-item">
                        <span className="telemetry-row-label">Radar Calibration</span>
                        <span className="telemetry-row-val" style={{ color: '#38bdf8', fontSize: '11px' }}>
                          {activeEvidenceFine.radarCalibration || 'Doppler 77GHz'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location & Time Sub-HUD */}
                  <div style={{
                    marginTop: '12px',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '11.5px',
                    color: '#94a3b8'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                      <MapPin size={13} color="#60a5fa" />
                      <span>{activeEvidenceFine.locationCoords || '6.0329° N, 80.2168° E (Km 68.4 Southern Expressway)'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748b' }}>
                      <span>Division: <strong style={{ color: '#94a3b8' }}>{activeEvidenceFine.policeStation}</strong></span>
                      <span>Date: <strong style={{ color: '#94a3b8' }}>{activeEvidenceFine.dateTime || activeEvidenceFine.date}</strong></span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {activeEvidenceFine.status === 'Unpaid' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', marginTop: '16px' }}>
                      <button
                        className="btn-primary"
                        style={{ height: '46px', fontSize: '13px' }}
                        onClick={() => setSelectedFineForPay(activeEvidenceFine)}
                      >
                        <CreditCard size={16} /> Pay Fine (Rs. {activeEvidenceFine.amount?.toLocaleString()})
                      </button>

                      <button
                        className="btn-alt"
                        style={{ height: '46px', fontSize: '13px', border: '1px solid rgba(244, 63, 94, 0.35)', color: '#fda4af', background: 'rgba(244, 63, 94, 0.1)' }}
                        onClick={() => setSelectedFineForDispute(activeEvidenceFine)}
                      >
                        <ShieldAlert size={16} /> Dispute Ticket
                      </button>
                    </div>
                  )}

                  {activeEvidenceFine.status === 'Paid' && (
                    <div style={{ marginTop: '14px' }}>
                      <button
                        className="btn-alt"
                        style={{ width: '100%', height: '44px', fontSize: '13px', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        onClick={() => alert(`Official Sri Lanka Police Fine Receipt (PDF)\nCitation: #${activeEvidenceFine.id}\nReceipt No: ${activeEvidenceFine.receiptNo || 'RCP-982314'}\nVehicle: ${activeEvidenceFine.vehiclePlate}\nAmount Settled: Rs. ${activeEvidenceFine.amount?.toLocaleString()}\nStatus: Verified Paid`)}
                      >
                        <Download size={16} /> Download Official Receipt ({activeEvidenceFine.receiptNo || 'RCP-982314'})
                      </button>
                    </div>
                  )}

                  {activeEvidenceFine.status === 'Disputed' && (
                    <div style={{
                      marginTop: '14px',
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#fbbf24',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: '700'
                    }}>
                      <Clock size={16} /> Case Under Review with Traffic Appeals Branch
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  padding: '24px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  textAlign: 'center'
                }}>
                  <ShieldCheck size={36} color="#34d399" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>Safe Driving Record</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    No recorded high-speed violations for this vehicle.
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 2: GARAGE VIEW */}
        {activeBottomNav === 'garage' && (
          <div style={{ animation: 'fadeInRight 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '19px', fontWeight: '800', color: '#ffffff' }}>
                  {t('garageTitle')}
                </h2>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  Manage connected EV and ICE registered vehicles
                </p>
              </div>
              <button
                onClick={() => setShowAddVehicle(true)}
                style={{
                  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.3) 0%, rgba(29, 78, 216, 0.15) 100%)',
                  border: '1px solid rgba(147, 197, 253, 0.4)',
                  color: '#93c5fd',
                  borderRadius: '14px',
                  padding: '8px 14px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)'
                }}
              >
                <Plus size={16} /> Add Vehicle
              </button>
            </div>

            {/* Garage Fleet List */}
            {displayVehicles.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {displayVehicles.map((v) => (
                  <div key={v.id || v.plate} className="vehicle-card-pro" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="vehicle-icon-bubble">
                          <Car size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', fontFamily: 'Plus Jakarta Sans' }}>
                            {v.displayName || (v.make ? `${v.make} ${v.model}` : v.model)}
                          </div>
                          <div style={{ marginTop: '4px' }}>
                            <SriLankaPlate plate={v.plate} compact={true} />
                          </div>
                        </div>
                      </div>

                      <span className="status-pill-success">
                        <span className="live-dot-pulse" />
                        {v.revenueLicenseStatus || 'License Valid'}
                      </span>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: '#94a3b8', marginBottom: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div>
                        <span>Powertrain: </span>
                        <strong style={{ color: '#e2e8f0' }}>{v.type || 'Electric Vehicle (BEV)'}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34d399', fontWeight: '700' }}>
                        <Battery size={13} />
                        <span>Battery: {v.batteryLevel || 88}%</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        className="btn-alt"
                        style={{ height: '38px', fontSize: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                        onClick={() => setShowQrModal(v)}
                      >
                        <QrCode size={14} /> Digital Pass
                      </button>
                      <button
                        className="btn-alt"
                        style={{ height: '38px', fontSize: '12px', borderRadius: '10px', border: '1px solid rgba(147, 197, 253, 0.3)', color: '#93c5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                        onClick={() => {
                          setActiveBottomNav('tickets');
                          setTicketSearch(v.plate || '');
                        }}
                      >
                        <FileText size={14} /> Citations
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
                borderRadius: '20px',
                marginTop: '10px'
              }}>
                <Car size={38} color="#60a5fa" style={{ margin: '0 auto 12px', opacity: 0.8 }} />
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', marginBottom: '6px' }}>
                  No Vehicles in Garage Yet
                </h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '280px', margin: '0 auto 16px' }}>
                  Link your electric or standard vehicle to check traffic fines, digital license pass, and charging status.
                </p>
                <button
                  onClick={() => setShowAddVehicle(true)}
                  className="btn-primary"
                  style={{ height: '40px', fontSize: '13px', width: 'auto', padding: '0 20px', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={16} /> Add Vehicle
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TICKETS VIEW */}
        {activeBottomNav === 'tickets' && (() => {
          const filteredFines = fines.filter((fine) => {
            if (ticketFilter === 'Unpaid' && fine.status !== 'Unpaid' && fine.status !== 'Pending') return false;
            if (ticketFilter === 'Paid' && fine.status !== 'Paid') return false;
            if (ticketFilter === 'Disputed' && fine.status !== 'Disputed' && fine.status !== 'Under Dispute') return false;

            if (ticketSearch.trim()) {
              const q = ticketSearch.toLowerCase();
              const matchPlate = fine.vehiclePlate?.toLowerCase().includes(q);
              const matchId = fine.id?.toLowerCase().includes(q);
              const matchOffence = fine.offence?.toLowerCase().includes(q);
              const matchStation = fine.policeStation?.toLowerCase().includes(q);
              return matchPlate || matchId || matchOffence || matchStation;
            }
            return true;
          });

          return (
            <div style={{ paddingBottom: '20px', animation: 'fadeInRight 0.3s ease-out' }}>
              {/* View Title */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '20px', fontWeight: '800', color: '#ffffff' }}>
                    {t('trafficTicketsTitle')}
                  </h2>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    Track, pay, or dispute your registered vehicle traffic fines
                  </p>
                </div>
              </div>

              {/* Search / Reference Quick View Bar */}
              <div style={{ position: 'relative', marginBottom: '14px' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search vehicle (e.g. WP CAB-4521), ticket ID..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  className="form-input"
                  style={{
                    paddingLeft: '40px',
                    height: '42px',
                    fontSize: '13px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}
                />
                {ticketSearch && (
                  <button
                    onClick={() => setTicketSearch('')}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Filter Tabs: All, Unpaid, Paid, Disputed */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
                {[
                  { id: 'All', label: 'All Records', count: fines.length },
                  { id: 'Unpaid', label: 'Unpaid Fines', count: fines.filter(f => f.status === 'Unpaid' || f.status === 'Pending').length },
                  { id: 'Paid', label: 'Paid History', count: fines.filter(f => f.status === 'Paid').length },
                  { id: 'Disputed', label: 'Disputed', count: fines.filter(f => f.status === 'Disputed' || f.status === 'Under Dispute').length }
                ].map((tab) => {
                  const isActive = ticketFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setTicketFilter(tab.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        border: isActive ? '1px solid rgba(147, 197, 253, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: isActive ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.35) 0%, rgba(29, 78, 216, 0.15) 100%)' : 'rgba(255, 255, 255, 0.05)',
                        color: isActive ? '#ffffff' : '#94a3b8',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease',
                        boxShadow: isActive ? '0 4px 14px rgba(37, 99, 235, 0.3)' : 'none'
                      }}
                    >
                      <span>{tab.label}</span>
                      <span style={{
                        background: isActive ? '#3b82f6' : 'rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        borderRadius: '10px',
                        padding: '1px 7px',
                        fontSize: '10.5px',
                        fontWeight: '800'
                      }}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Ticket List or Empty State */}
              {filteredFines.length === 0 ? (
                <div className="glass-card" style={{ padding: '36px 20px', textAlign: 'center', margin: '20px 0' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: '#60a5fa' }}>
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>
                    {ticketFilter === 'Paid' ? 'No Payment History' : ticketFilter === 'Disputed' ? 'No Disputed Fines' : 'No Traffic Tickets Found'}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#94a3b8', maxWidth: '280px', margin: '0 auto', lineHeight: '1.45' }}>
                    {ticketFilter === 'Paid'
                      ? 'Your settled fines and payment receipt history will be archived here.'
                      : ticketSearch
                      ? `No records matching "${ticketSearch}".`
                      : 'You have zero active traffic violations on your registered vehicles.'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {filteredFines.map((fine) => {
                    const isExpanded = expandedTicketId === fine.id;
                    const isPaid = fine.status === 'Paid';
                    const isDisputed = fine.status === 'Disputed' || fine.status === 'Under Dispute';

                    return (
                      <div
                        key={fine.id}
                        className="vehicle-card-pro"
                        style={{
                          borderLeft: isPaid ? '4px solid #10b981' : isDisputed ? '4px solid #f59e0b' : '4px solid #ef4444',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {/* Header Info */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', fontFamily: 'monospace' }}>
                                TICKET #{fine.id}
                              </span>
                              <SriLankaPlate plate={fine.vehiclePlate} compact={true} />
                            </div>

                            <div style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', marginBottom: '2px' }}>
                              {fine.offence}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                              {fine.policeStation}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '17px', fontWeight: '800', color: isPaid ? '#10b981' : isDisputed ? '#f59e0b' : '#ef4444', fontFamily: 'Plus Jakarta Sans' }}>
                              Rs. {fine.amount?.toLocaleString()}
                            </div>
                            
                            <span style={{
                              fontSize: '10px',
                              fontWeight: '800',
                              padding: '3px 8px',
                              borderRadius: '10px',
                              display: 'inline-block',
                              marginTop: '4px',
                              background: isPaid ? 'rgba(16, 185, 129, 0.15)' : isDisputed ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: isPaid ? '#34d399' : isDisputed ? '#fbbf24' : '#fca5a5',
                              border: `1px solid ${isPaid ? 'rgba(16, 185, 129, 0.3)' : isDisputed ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                            }}>
                              {isPaid ? 'PAID' : isDisputed ? 'UNDER DISPUTE' : 'UNPAID'}
                            </span>
                          </div>
                        </div>

                        {/* Due Date & Demerit Points Bar */}
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          borderRadius: '12px',
                          padding: '8px 12px',
                          margin: '12px 0 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: '1px solid rgba(255, 255, 255, 0.06)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: isPaid ? '#94a3b8' : '#fca5a5', fontWeight: '700' }}>
                            <Calendar size={13} color={isPaid ? '#94a3b8' : '#f43f5e'} />
                            <span>{isPaid ? `Settled on: ${fine.paidAt || '15 Feb 2026'}` : `Due by: ${fine.dueDate || '25 Mar 2026'}`}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: fine.demeritPoints > 0 ? '#f59e0b' : '#34d399', fontWeight: '800' }}>
                            <AlertOctagon size={13} color={fine.demeritPoints > 0 ? '#f59e0b' : '#34d399'} />
                            <span>Demerit: {fine.demeritPoints || 0} pts</span>
                          </div>
                        </div>

                        {/* Action Buttons: Pay / Dispute / Download Receipt */}
                        {!isPaid && !isDisputed && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                            <button
                              className="btn-primary"
                              style={{ height: '38px', fontSize: '12px' }}
                              onClick={() => setSelectedFineForPay(fine)}
                            >
                              Pay Fine
                            </button>
                            <button
                              className="btn-alt"
                              style={{ height: '38px', fontSize: '12px', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                              onClick={() => setSelectedFineForDispute(fine)}
                            >
                              Dispute Ticket
                            </button>
                          </div>
                        )}

                        {isPaid && (
                          <div style={{ marginBottom: '10px' }}>
                            <button
                              className="btn-alt"
                              style={{ width: '100%', height: '38px', fontSize: '12px', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                              onClick={() => alert(`Downloading Official Sri Lanka Police Fine Receipt: ${fine.receiptNo || 'RCP-982314'} (PDF)...`)}
                            >
                              <Download size={14} /> Download Receipt ({fine.receiptNo || 'RCP-982314'})
                            </button>
                          </div>
                        )}

                        {/* Evidence / Details Expansion Toggle */}
                        <button
                          onClick={() => setExpandedTicketId(isExpanded ? null : fine.id)}
                          style={{
                            width: '100%',
                            background: 'none',
                            border: 'none',
                            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                            paddingTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            color: '#93c5fd',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          <Camera size={14} />
                          <span>{isExpanded ? 'Hide Evidence' : 'View Speed Camera Evidence & Location'}</span>
                          <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                        </button>

                        {/* Expanded Evidence Preview Box */}
                        {isExpanded && (
                          <div style={{
                            marginTop: '10px',
                            padding: '14px',
                            background: 'rgba(2, 6, 23, 0.7)',
                            borderRadius: '16px',
                            border: '1px solid rgba(147, 197, 253, 0.2)',
                            animation: 'fadeInUp 0.3s ease-out'
                          }}>
                            {/* Speed Camera Photographic Evidence Overlay */}
                            <div className="cctv-frame-pro" style={{ height: '150px', marginBottom: '10px', position: 'relative', overflow: 'hidden', borderRadius: '14px', background: '#020617', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                              <img
                                src={activeEvidenceFine.evidenceImage || "/speed_violation_evidence.png"}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/camera_01_live.jpg";
                                }}
                                alt="Cam-01 (Southern Expressway, Km 68.4) Live Evidence"
                                className="cctv-bg-img"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              <div className="cctv-vignette-overlay" />
                              <div className="cctv-scanline-laser" />

                              <div className="cctv-rec-pill" style={{ fontSize: '9px' }}>
                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                                <span>EVIDENCE SNAPSHOT</span>
                              </div>

                              <div className="cctv-cam-id-pill" style={{ fontSize: '9px' }}>
                                CAM-01 • SOUTHERN EXPY KM 68.4
                              </div>
                            </div>

                            {/* Location Map Coordinates & Officer Info */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: '#cbd5e1' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MapPin size={14} color="#60a5fa" />
                                <span><strong>GPS Location:</strong> {fine.locationCoords || '6.0329° N, 80.2168° E (Southern Expy)'}</span>
                              </div>
                              {fine.officerBadge && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Shield size={14} color="#a78bfa" />
                                  <span><strong>Issuing Officer:</strong> {fine.officerBadge}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 4: PROFILE & NATIONAL DRIVER IDENTITY */}
        {activeBottomNav === 'profile' && (
          <div style={{ animation: 'fadeInRight 0.3s ease-out' }}>
            {/* 1. Hero Sri Lanka Smart Driving License Card */}
            <div className="smart-license-card">
              {/* Header Strip */}
              <div className="license-header-strip">
                <div>
                  <div className="license-republic-text">Democratic Socialist Republic of Sri Lanka</div>
                  <div className="license-title-text">National Digital Driving License</div>
                </div>
                <div className="license-flag-badge">
                  <ShieldCheck size={12} color="#fbbf24" />
                  <span>DMT OFFICIAL</span>
                </div>
              </div>

              {/* Metallic Chip & Card ID */}
              <div className="license-chip-row">
                <div className="smart-chip-graphic" />
                <span style={{ fontSize: '10.5px', color: '#93c5fd', fontFamily: 'monospace', fontWeight: '800' }}>
                  CHIP ID: SL-DMT-9918231
                </span>
              </div>

              {/* Driver Photo Frame & Primary Credentials */}
              <div className="license-holder-main">
                <div className="license-avatar-frame">
                  {userData?.name ? userData.name.charAt(0) : 'K'}
                </div>
                <div className="license-holder-details">
                  <div className="license-name-h3">{userData?.name || 'Kavinda Perera'}</div>
                  <div className="license-nic-tag">NIC: {userData?.nic || '200012345678'}</div>
                  <div className="license-no-tag">LIC NO: {userData?.licenseNo || 'B-9918231'}</div>
                </div>
              </div>

              {/* Specs Matrix */}
              <div className="license-specs-grid">
                <div className="license-spec-item">
                  <span className="license-spec-label">Classes</span>
                  <span className="license-spec-val" style={{ color: '#60a5fa' }}>A, B, B1</span>
                </div>
                <div className="license-spec-item">
                  <span className="license-spec-label">Validity</span>
                  <span className="license-spec-val" style={{ color: '#34d399' }}>28 OCT 2030</span>
                </div>
                <div className="license-spec-item">
                  <span className="license-spec-label">Demerit Pts</span>
                  <span className="license-spec-val" style={{ color: '#fbbf24' }}>03 / 24 PTS</span>
                </div>
              </div>

              {/* Police Enforcement QR Verification Pass */}
              <button
                onClick={() => setShowQrModal({ plate: `SL-LIC-${userData?.licenseNo || 'B-9918231'}` })}
                style={{
                  width: '100%',
                  height: '38px',
                  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.3) 0%, rgba(29, 78, 216, 0.15) 100%)',
                  border: '1px solid rgba(147, 197, 253, 0.35)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                }}
              >
                <QrCode size={15} color="#fbbf24" />
                <span>Show Police Spot Verification QR Pass</span>
              </button>
            </div>

            {/* SECTION 1: CITIZEN REGISTRY & DOCUMENTS */}
            <div className="settings-section-title">
              Citizen Registry & Credentials
            </div>
            <div className="settings-card-group">
              <div
                className="settings-row-item"
                onClick={() => setActiveProfileModal('personalInfo')}
              >
                <div className="settings-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                  <User size={18} />
                </div>
                <div className="settings-text-col">
                  <div className="settings-main-label">{t('personalInfo')}</div>
                  <div className="settings-sub-label">NIC {userData?.nic || '200012345678'} • {userData?.mobile || '0771234567'}</div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>

              <div
                className="settings-row-item"
                onClick={() => setActiveBottomNav('garage')}
              >
                <div className="settings-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <Car size={18} />
                </div>
                <div className="settings-text-col">
                  <div className="settings-main-label">Registered Vehicle Fleet</div>
                  <div className="settings-sub-label">2 Active Vehicles • Revenue License Sync</div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>

              <div
                className="settings-row-item"
                onClick={() => setActiveBottomNav('tickets')}
              >
                <div className="settings-icon-box" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>
                  <FileCheck size={18} />
                </div>
                <div className="settings-text-col">
                  <div className="settings-main-label">Police Fines & Citation History</div>
                  <div className="settings-sub-label">1 Active Speed Violation • Pay or Dispute</div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>
            </div>

            {/* SECTION 2: SECURITY & GOV-SSO */}
            <div className="settings-section-title">
              Security & Verification
            </div>
            <div className="settings-card-group">
              <div
                className="settings-row-item"
                onClick={() => setActiveProfileModal('privacy')}
              >
                <div className="settings-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <Shield size={18} />
                </div>
                <div className="settings-text-col">
                  <div className="settings-main-label">{t('privacySecurity')}</div>
                  <div className="settings-sub-label">2-Factor Authentication (2FA) • Password</div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>

              <div
                className="settings-row-item"
                onClick={() => setActiveProfileModal('notifications')}
              >
                <div className="settings-icon-box" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>
                  <Bell size={18} />
                </div>
                <div className="settings-text-col">
                  <div className="settings-main-label">{t('notifications')}</div>
                  <div className="settings-sub-label">Instant SMS on Speed Radar Trigger</div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>

              <div
                className="settings-row-item"
                onClick={() => setActiveProfileModal('language')}
              >
                <div className="settings-icon-box" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
                  <Globe size={18} />
                </div>
                <div className="settings-text-col">
                  <div className="settings-main-label">{t('language')}</div>
                  <div className="settings-sub-label">{language} (Default Official)</div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>
            </div>

            {/* SECTION 3: CITIZEN HELPLINE & POLICE ASSISTANCE */}
            <div className="settings-section-title">
              Police & Citizen Support
            </div>
            <div className="settings-card-group">
              <div
                className="settings-row-item"
                onClick={() => setActiveProfileModal('help')}
              >
                <div className="settings-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd' }}>
                  <HelpCircle size={18} />
                </div>
                <div className="settings-text-col">
                  <div className="settings-main-label">{t('helpCenter')}</div>
                  <div className="settings-sub-label">Hotline 1919 • FAQ & Demerit Rules</div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>
            </div>

            {/* Logout Button */}
            <button
              className="btn-alt"
              style={{
                width: '100%',
                color: '#fda4af',
                height: '48px',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                background: 'rgba(244, 63, 94, 0.12)',
                fontSize: '13.5px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                marginBottom: '16px'
              }}
              onClick={onLogout}
            >
              <LogOut size={17} /> {t('logOut')}
            </button>

            <div style={{ textAlign: 'center', fontSize: '10.5px', color: '#64748b', fontWeight: '800', letterSpacing: '0.8px' }}>
              DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA • DMT v2.4
            </div>
          </div>
        )}
      </div>

      {/* Floating Liquid Glass Bottom Navigation Dock */}
      <div className="floating-dock-nav">
        <button
          onClick={() => setActiveBottomNav('home')}
          className={`dock-tab-btn ${activeBottomNav === 'home' ? 'active' : ''}`}
        >
          <Home size={19} />
          <span>{t('home')}</span>
        </button>

        <button
          onClick={() => setActiveBottomNav('garage')}
          className={`dock-tab-btn ${activeBottomNav === 'garage' ? 'active' : ''}`}
        >
          <Car size={19} />
          <span>{t('garage')}</span>
        </button>

        <button
          onClick={() => setActiveBottomNav('tickets')}
          className={`dock-tab-btn ${activeBottomNav === 'tickets' ? 'active' : ''}`}
        >
          <FileText size={19} />
          <span>{t('tickets')}</span>
          <span className="dock-notif-dot" />
        </button>

        <button
          onClick={() => setActiveBottomNav('profile')}
          className={`dock-tab-btn ${activeBottomNav === 'profile' ? 'active' : ''}`}
        >
          <User size={19} />
          <span>{t('profile')}</span>
        </button>
      </div>

      {/* Pay Fines Modal */}
      {selectedFineForPay && (
        <PaymentModal
          fine={selectedFineForPay}
          onClose={() => setSelectedFineForPay(null)}
          onPaymentComplete={() => fetchData()}
        />
      )}

      {/* Dispute Ticket Modal */}
      {selectedFineForDispute && (
        <DisputeModal
          fine={selectedFineForDispute}
          onClose={() => setSelectedFineForDispute(null)}
          onDisputeFiled={() => fetchData()}
        />
      )}

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
          <AddVehicleModal
            user={userData || user}
            onClose={() => setShowAddVehicle(false)}
            onVehicleAdded={async (newVeh) => {
              await fetchData();
              if (newVeh) {
                setVehicles((prev) => {
                  const exists = prev.some((v) => v.plate === newVeh.plate);
                  return exists ? prev : [newVeh, ...prev];
                });
              }
            }}
          />
        )}

      {/* Digital QR Pass Modal */}
      {showQrModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <div className="modal-header">
              <h3 className="modal-title">E-Mobility Digital Pass</h3>
              <button className="close-btn" onClick={() => setShowQrModal(null)}>
                ×
              </button>
            </div>
            <div style={{ background: '#ffffff', border: '2px solid #3b82f6', borderRadius: '20px', padding: '20px', display: 'inline-block', margin: '12px 0', boxShadow: '0 0 25px rgba(59, 130, 246, 0.4)' }}>
              <QrCode size={160} color="#0f172a" />
              <div style={{ fontSize: '15px', fontWeight: '800', marginTop: '10px', color: '#0f172a', fontFamily: 'monospace' }}>{showQrModal.plate}</div>
            </div>
            <button className="btn-primary" onClick={() => setShowQrModal(null)}>Close Pass</button>
          </div>
        </div>
      )}

      {/* Profile Setting Modal 1: Edit Profile */}
      {activeProfileModal === 'editProfile' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={20} color="#60a5fa" />
                <h3 className="modal-title">Edit Profile Information</h3>
              </div>
              <button className="close-btn" onClick={() => setActiveProfileModal(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const updated = { ...userData, name: editName, mobile: editMobile, email: editEmail, licenseNo: editLicense };
              setUserData(updated);
              localStorage.setItem('user', JSON.stringify(updated));
              setActiveProfileModal(null);
            }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className="form-input" style={{ paddingLeft: '14px' }} value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input type="tel" className="form-input" style={{ paddingLeft: '14px' }} value={editMobile} onChange={(e) => setEditMobile(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input type="email" className="form-input" style={{ paddingLeft: '14px' }} value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Driving License Number</label>
                <input type="text" className="form-input" style={{ paddingLeft: '14px' }} value={editLicense} onChange={(e) => setEditLicense(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary">
                Save Profile Changes <Check size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Setting Modal 2: Personal Information */}
      {activeProfileModal === 'personalInfo' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="#60a5fa" />
                <h3 className="modal-title">Personal Information</h3>
              </div>
              <button className="close-btn" onClick={() => setActiveProfileModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="glass-card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>FULL NAME</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', marginTop: '2px' }}>{userData?.name}</div>
              </div>

              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>NATIONAL IDENTITY CARD (NIC)</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#60a5fa', fontFamily: 'monospace', marginTop: '2px' }}>{userData?.nic}</div>
              </div>

              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>REGISTERED MOBILE PHONE</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', marginTop: '2px' }}>{userData?.mobile}</div>
              </div>

              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>EMAIL ADDRESS</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', marginTop: '2px' }}>{userData?.email}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>DRIVING LICENSE NUMBER</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#34d399', fontFamily: 'monospace', marginTop: '2px' }}>{userData?.licenseNo || 'B-9918231'}</div>
              </div>
            </div>

            <button className="btn-primary" onClick={() => setActiveProfileModal('editProfile')}>
              <Edit3 size={16} /> Edit Details
            </button>
          </div>
        </div>
      )}

      {/* Profile Setting Modal 3: Privacy & Security */}
      {activeProfileModal === 'privacy' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="#34d399" />
                <h3 className="modal-title">Privacy & Security</h3>
              </div>
              <button className="close-btn" onClick={() => { setActiveProfileModal(null); setSecuritySuccess(''); }}>
                <X size={18} />
              </button>
            </div>

            {securitySuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', padding: '12px 14px', borderRadius: '14px', fontSize: '12px', marginBottom: '16px', fontWeight: '600' }}>
                {securitySuccess}
              </div>
            )}

            {/* 2FA Toggle */}
            <div className="glass-card" style={{ padding: '14px 16px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>Two-Factor Authentication (2FA)</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>SMS OTP verification required on login</div>
              </div>
              <button 
                type="button"
                onClick={() => setTwoFactor(!twoFactor)}
                style={{
                  width: '46px',
                  height: '26px',
                  borderRadius: '20px',
                  background: twoFactor ? '#3b82f6' : 'rgba(255,255,255,0.2)',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  flexShrink: 0
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: '3px',
                  left: twoFactor ? '23px' : '3px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  transition: 'all 0.3s ease'
                }} />
              </button>
            </div>

            {/* Change Password Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newPass !== confirmPass) {
                alert('New passwords do not match');
                return;
              }
              setSecuritySuccess('Security preferences and password updated successfully!');
              setCurrentPass('');
              setNewPass('');
              setConfirmPass('');
            }}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" style={{ paddingLeft: '14px' }} value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} placeholder="••••••••" />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" style={{ paddingLeft: '14px' }} value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="••••••••" />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-input" style={{ paddingLeft: '14px' }} value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="••••••••" />
              </div>

              <button type="submit" className="btn-primary">Update Security Settings</button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Setting Modal 4: Notifications */}
      {activeProfileModal === 'notifications' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={20} color="#f43f5e" />
                <h3 className="modal-title">Notification Preferences</h3>
              </div>
              <button className="close-btn" onClick={() => setActiveProfileModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {[
                { id: 'fines', label: 'Traffic Fine Alerts (SMS & In-App)', desc: 'Instant alerts when a fine ticket is issued' },
                { id: 'license', label: 'Revenue License Reminders', desc: 'Alerts 30 days before license expiration' },
                { id: 'evStations', label: 'EV Station Availability', desc: 'Real-time charging port status updates' },
                { id: 'news', label: 'Government Transport News', desc: 'Updates on Sri Lanka EV policy & tariffs' }
              ].map((item) => {
                const enabled = notifSettings[item.id];
                return (
                  <div key={item.id} className="glass-card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#ffffff' }}>{item.label}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{item.desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifSettings(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                      style={{
                        width: '46px',
                        height: '26px',
                        borderRadius: '20px',
                        background: enabled ? '#3b82f6' : 'rgba(255,255,255,0.2)',
                        border: 'none',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        flexShrink: 0
                      }}
                    >
                      <span style={{
                        position: 'absolute',
                        top: '3px',
                        left: enabled ? '23px' : '3px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        transition: 'all 0.3s ease'
                      }} />
                    </button>
                  </div>
                );
              })}
            </div>

            <button className="btn-primary" onClick={() => setActiveProfileModal(null)}>Save Notification Preferences</button>
          </div>
        </div>
      )}

      {/* Profile Setting Modal 5: Language */}
      {activeProfileModal === 'language' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={20} color="#a78bfa" />
                <h3 className="modal-title">{t('selectLang')}</h3>
              </div>
              <button className="close-btn" onClick={() => setActiveProfileModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {[
                { id: 'English', native: 'English', label: 'English (Default)' },
                { id: 'Sinhala', native: 'සිංහල', label: 'Sinhala' },
                { id: 'Tamil', native: 'தமிழ்', label: 'Tamil' }
              ].map((lang) => {
                const isSelected = language === lang.id;
                return (
                  <div
                    key={lang.id}
                    onClick={() => { setLanguage(lang.id); setActiveProfileModal(null); }}
                    style={{
                      background: isSelected ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected ? '2px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '16px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>{lang.native}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{lang.label}</div>
                    </div>
                    {isSelected && <CheckCircle2 size={20} color="#a78bfa" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Profile Setting Modal 6: Help Center */}
      {activeProfileModal === 'help' && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxHeight: '90%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={20} color="#60a5fa" />
                <h3 className="modal-title">Help Center & Support</h3>
              </div>
              <button className="close-btn" onClick={() => setActiveProfileModal(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Call Hotline Banner */}
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '16px', padding: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>Sri Lanka Traffic Police Helpline</div>
                <div style={{ fontSize: '11px', color: '#93c5fd' }}>Available 24/7 for emergency traffic assistance</div>
              </div>
              <button 
                onClick={() => alert('Dialing Sri Lanka Police Traffic Helpline 1919...')}
                style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 12px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
              >
                <PhoneCall size={14} /> 1919
              </button>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', marginBottom: '10px' }}>Frequently Asked Questions</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {[
                { id: 'q1', q: 'How do I pay traffic fines online?', a: 'Go to Tickets tab or click Pay Fines from home. Select the fine ticket and choose Visa, Mastercard, or Direct Bank Transfer via GovPay.' },
                { id: 'q2', q: 'How to dispute an incorrect fine?', a: 'Click Dispute on the ticket in the Tickets tab. Select the reason, add details/documents, and submit to the Appeals Branch.' },
                { id: 'q3', q: 'How do I add a new EV to my Garage?', a: 'Tap "+ Add Vehicle" in My Garage, enter your License Plate, model, manufacture year, and powertrain type.' },
                { id: 'q4', q: 'Where can I find EV Charging Stations?', a: 'Navigate to Garage and tap "EV Charging Map" to view live port availability across Sri Lanka.' }
              ].map((faq) => {
                const isOpen = activeFaq === faq.id;
                return (
                  <div 
                    key={faq.id} 
                    className="glass-card" 
                    style={{ padding: '12px 14px', cursor: 'pointer' }}
                    onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>{faq.q}</div>
                      <ChevronDown size={16} color="#94a3b8" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                    </div>
                    {isOpen && (
                      <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', lineHeight: '1.4' }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button className="btn-primary" onClick={() => setActiveProfileModal(null)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
