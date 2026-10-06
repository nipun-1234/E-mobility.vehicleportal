// API service for E-Mobility Sri Lanka Vehicle Portal connected to Shared Backend API

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const host = typeof window !== 'undefined' && window.location && window.location.hostname ? window.location.hostname : 'localhost';
  return `http://${host}:5000/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Helper for HTTP requests
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('accessToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// Fallback in-memory datasets if backend is unreachable
const MOCK_VEHICLES = [
  {
    id: 'veh_01',
    plate: 'WP-CBM-4821',
    make: 'Nissan',
    model: 'Leaf ZE1',
    year: 2022,
    type: 'Electric Car (BEV)',
    color: 'Silver Metallic',
    batteryLevel: 84,
    revenueLicenseStatus: 'Valid',
    licenseExpiry: '2027-03-31',
    qrCode: 'EM-LK-4821-VERIFIED',
    ownerNic: '200012345678',
    ownerName: 'Kavinda Perera'
  },
  {
    id: 'veh_02',
    plate: 'CP-BEG-1092',
    make: 'BYD',
    model: 'Atto 3',
    year: 2024,
    type: 'Electric SUV',
    color: 'Ski White',
    batteryLevel: 92,
    revenueLicenseStatus: 'Valid',
    licenseExpiry: '2027-11-15',
    qrCode: 'EM-LK-1092-VERIFIED',
    ownerNic: '198512345678',
    ownerName: 'Admin Commander'
  }
];

const MOCK_FINES = [
  {
    id: 'TX-88421',
    policeStation: 'Southern Expressway Division',
    offence: 'Speeding — 128 km/h in 100 km/h zone',
    date: '2026-03-10',
    dueDate: '25 Mar 2026',
    amount: 3850,
    demeritPoints: 3,
    vehiclePlate: 'WP CAB-4521',
    status: 'Unpaid',
    dueDays: 11,
    locationCoords: '6.0329° N, 80.2168° E (Km 68.4 Southern Expressway)',
    evidenceImage: true,
    speedRecorded: '128 km/h',
    speedLimit: '100 km/h',
    officerBadge: 'PO-8819 (Sgt. Jayawardena)'
  },
  {
    id: 'FINE-2026-891',
    policeStation: 'Colombo Expressway Division',
    offence: 'Speeding — 112 km/h in 100 km/h zone',
    date: '2026-03-01',
    dueDate: '16 Mar 2026',
    amount: 3500,
    demeritPoints: 2,
    vehiclePlate: 'WP CBM-4821',
    status: 'Unpaid',
    dueDays: 2,
    locationCoords: '6.9271° N, 79.8612° E (Outer Circular Expressway)',
    evidenceImage: true,
    speedRecorded: '112 km/h',
    speedLimit: '100 km/h',
    officerBadge: 'PO-4412 (Sgt. Perera)'
  },
  {
    id: 'FINE-2026-724',
    policeStation: 'Central Expressway Division',
    offence: 'Lane Violation — Improper lane change without signaling',
    date: '2026-02-18',
    dueDate: '05 Mar 2026',
    amount: 2500,
    demeritPoints: 1,
    vehiclePlate: 'WP CBM-4821',
    status: 'Unpaid',
    dueDays: -9,
    locationCoords: '7.2906° N, 80.6337° E (Mirigama Interchange)',
    evidenceImage: true,
    speedRecorded: 'N/A',
    speedLimit: 'N/A',
    officerBadge: 'PO-3109 (Const. Silva)'
  },
  {
    id: 'FINE-2026-502',
    policeStation: 'Southern Expressway Division',
    offence: 'Speeding — 108 km/h in 100 km/h zone',
    date: '2026-01-14',
    dueDate: '29 Jan 2026',
    amount: 1000,
    demeritPoints: 1,
    vehiclePlate: 'CP BEG-1092',
    status: 'Paid',
    dueDays: 0,
    locationCoords: '6.0329° N, 80.2168° E',
    evidenceImage: true,
    speedRecorded: '108 km/h',
    speedLimit: '100 km/h',
    officerBadge: 'PO-8819 (Sgt. Jayawardena)',
    paidAt: '2026-01-20',
    receiptNo: 'RCP-2026-88102'
  }
];

const MOCK_STATIONS = [
  {
    id: 'st_01',
    name: 'Colombo Port City EV Superhub',
    location: 'Financial District, Colombo 01',
    distance: '3.2 km',
    availablePlugs: 4,
    totalPlugs: 6,
    power: '150 kW DC Fast',
    pricePerKwh: 'LKR 85 / kWh',
    status: 'Available'
  },
  {
    id: 'st_02',
    name: 'Kottawa Expressway Interchange Station',
    location: 'Southern Expressway, Kottawa',
    distance: '8.5 km',
    availablePlugs: 2,
    totalPlugs: 4,
    power: '120 kW Super Fast',
    pricePerKwh: 'LKR 95 / kWh',
    status: 'Available'
  },
  {
    id: 'st_03',
    name: 'Kandy City Center Charging Plaza',
    location: 'Dalada Veediya, Kandy',
    distance: '115 km',
    availablePlugs: 1,
    totalPlugs: 2,
    power: '22 kW AC',
    pricePerKwh: 'LKR 60 / kWh',
    status: 'Busy'
  }
];

export const authService = {
  async login(nicOrMobile, password) {
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ nicOrMobile, password })
      });
      if (data?.token) {
        localStorage.setItem('accessToken', data.token);
      }
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (e) {
      console.warn('Backend login request error, falling back:', e.message);
      if (nicOrMobile && password) {
        const mockUser = {
          token: 'mock-jwt-token-98765',
          user: {
            nic: nicOrMobile,
            name: 'Kavinda Perera',
            mobile: '0771234567',
            email: 'kavinda.perera@example.lk',
            registeredDate: '2025-01-15'
          }
        };
        localStorage.setItem('accessToken', mockUser.token);
        localStorage.setItem('user', JSON.stringify(mockUser.user));
        return mockUser;
      }
      throw e;
    }
  },

  async requestOtp(mobile) {
    try {
      return await request('/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({ mobile })
      });
    } catch (e) {
      console.warn('Backend OTP request fallback:', e.message);
      return { success: true, message: `OTP sent to ${mobile}` };
    }
  },

  async verifyOtp(otp, mobile) {
    try {
      const data = await request('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ otp, mobile })
      });
      if (data?.token) {
        localStorage.setItem('accessToken', data.token);
      }
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (e) {
      console.warn('Backend OTP verify fallback:', e.message);
      if (otp === '123456' || (otp && otp.length === 6)) {
        const mockUser = {
          token: 'mock-otp-jwt-token',
          user: {
            nic: '199518901234',
            name: 'Saman Silva (OTP User)',
            mobile: mobile || '0719876543',
            email: 'saman.silva@example.lk'
          }
        };
        localStorage.setItem('accessToken', mockUser.token);
        localStorage.setItem('user', JSON.stringify(mockUser.user));
        return mockUser;
      }
      throw new Error('Invalid OTP code. Please enter 123456');
    }
  },

  async govSso(govId) {
    try {
      const data = await request('/auth/gov-sso', {
        method: 'POST',
        body: JSON.stringify({ govId })
      });
      if (data?.token) {
        localStorage.setItem('accessToken', data.token);
      }
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (e) {
      console.warn('Backend GovSSO fallback:', e.message);
      const mockUser = {
        token: 'mock-gov-token',
        user: {
          nic: '198810293847',
          name: 'Dr. Nimal Wickramasinghe (Gov-SSO)',
          mobile: '0712345678',
          email: 'nimal.w@gov.lk'
        }
      };
      localStorage.setItem('accessToken', mockUser.token);
      localStorage.setItem('user', JSON.stringify(mockUser.user));
      return mockUser;
    }
  },

  async register(data) {
    try {
      console.log('🚀 Dispatching register payload to shared backend:', data);
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (res?.token) {
        localStorage.setItem('accessToken', res.token);
      }
      if (res?.user) {
        localStorage.setItem('user', JSON.stringify(res.user));
      }
      return res;
    } catch (e) {
      console.warn('Backend register error, proceeding with local registered session:', e.message);
      const mockUser = {
        token: `mock-reg-token-${Date.now()}`,
        user: {
          nic: data.nic,
          name: data.name || 'Citizen User',
          mobile: data.mobile || '0771234567',
          email: data.email || `${data.nic.toLowerCase()}@emobility.lk`,
          district: data.district || 'Western',
          registeredDate: new Date().toISOString().split('T')[0]
        }
      };
      localStorage.setItem('accessToken', mockUser.token);
      localStorage.setItem('user', JSON.stringify(mockUser.user));
      return mockUser;
    }
  }
};

export const vehicleService = {
  /**
   * Query the National Vehicle Registry through the shared backend or local registry dataset
   */
  async lookupPlate(plate) {
    if (!plate || plate.trim().length < 3) {
      return { matched: false, message: 'No vehicle found in the registry.' };
    }
    try {
      const clean = encodeURIComponent(plate.trim());
      const res = await request(`/vehicles/lookup/${clean}`);
      if (res && res.matched) return res;
    } catch (e) {
      console.warn('Backend lookupPlate error, checking local registry:', e.message);
    }

    const cleanUpper = plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const allVehicles = [
      ...MOCK_VEHICLES,
      { plate: 'WP-CAB-4521', make: 'Tesla', model: 'Model 3 Standard', year: 2023, color: 'Solid Black', type: 'Electric Sedan', vin: '5YJ3E1EB8NF109281' },
      { plate: 'NW-CAC-1860', make: 'Hyundai', model: 'Ioniq 5 AWD', year: 2024, color: 'Gravity Gold', type: 'Electric SUV', vin: 'KM8KRDAF8NU049281' },
      { plate: 'SB-KA-6734', make: 'MG', model: 'ZS EV Trophy', year: 2023, color: 'Dynamic Red', type: 'Electric Crossover', vin: 'LSJA24U95P001928' }
    ];
    const localMatch = allVehicles.find(v => v.plate.replace(/[^A-Z0-9]/g, '').includes(cleanUpper) || cleanUpper.includes(v.plate.replace(/[^A-Z0-9]/g, '')));
    if (localMatch) {
      return {
        matched: true,
        vehicle: {
          plate: localMatch.plate,
          make: localMatch.make,
          model: localMatch.model,
          year: localMatch.year,
          color: localMatch.color,
          vin: localMatch.vin || ('1HGCR2F83HA' + Math.floor(100000 + Math.random() * 900000)),
          fuelType: localMatch.type,
          bodyType: localMatch.type
        }
      };
    }
    return { matched: false, message: 'No vehicle found in the registry.' };
  },

  async getVehicles(ownerNic) {
    try {
      const url = ownerNic ? `/vehicles?ownerNic=${encodeURIComponent(ownerNic)}` : '/vehicles';
      const data = await request(url);
      if (Array.isArray(data) && data.length > 0) return data;
    } catch (e) {
      console.warn('Backend vehicles request error, using local fallback:', e.message);
    }
    const localSaved = JSON.parse(localStorage.getItem('portal_vehicles') || '[]');
    return [...localSaved, ...MOCK_VEHICLES];
  },

  async addVehicle(vehicleData) {
    try {
      console.log('🚗 Submitting add vehicle payload to shared backend:', vehicleData);
      const res = await request('/vehicles', {
        method: 'POST',
        body: JSON.stringify(vehicleData)
      });
      return res;
    } catch (e) {
      console.warn('Backend addVehicle error, saving to local state:', e.message);
      const localSaved = JSON.parse(localStorage.getItem('portal_vehicles') || '[]');
      const newVeh = {
        id: `veh_${Date.now()}`,
        batteryLevel: 92,
        revenueLicenseStatus: 'Valid',
        licenseExpiry: '2027-12-31',
        qrCode: `EM-LK-${(vehicleData.plate || 'EV').replace(/[^A-Z0-9]/g, '')}-VERIFIED`,
        ...vehicleData
      };
      localSaved.unshift(newVeh);
      localStorage.setItem('portal_vehicles', JSON.stringify(localSaved));
      return newVeh;
    }
  },

  async getVehicleDetails(plate) {
    try {
      const vehicles = await this.getVehicles();
      return vehicles.find(v => v.plate === plate) || MOCK_VEHICLES[0];
    } catch (e) {
      return MOCK_VEHICLES[0];
    }
  }
};

export const fineService = {
  async getFines(vehiclePlate) {
    try {
      const url = vehiclePlate ? `/fines?plate=${encodeURIComponent(vehiclePlate)}` : '/fines';
      const data = await request(url);
      if (Array.isArray(data) && data.length > 0) return data;
    } catch (e) {
      console.warn('Backend fines request error, using fallback:', e.message);
    }
    return MOCK_FINES;
  },

  async getDisputes() {
    try {
      const data = await request('/disputes');
      if (Array.isArray(data)) return data;
    } catch (e) {
      console.warn('Backend disputes request error:', e.message);
    }
    return JSON.parse(localStorage.getItem('portal_disputes') || '[]');
  },

  async payFine(fineId, paymentMethod = 'Online Gateway') {
    try {
      return await request('/fines/pay', {
        method: 'POST',
        body: JSON.stringify({ fineId, method: paymentMethod })
      });
    } catch (e) {
      console.warn('Backend payFine fallback:', e.message);
      const fine = MOCK_FINES.find(f => f.id === fineId);
      if (fine) {
        fine.status = 'Paid';
        fine.paidAt = new Date().toISOString().split('T')[0];
        fine.receiptNo = `RCP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      }
      return { success: true, message: 'Fine payment processed (fallback mode).' };
    }
  },

  async submitDispute(fineId, reason, evidence) {
    try {
      return await request('/disputes', {
        method: 'POST',
        body: JSON.stringify({ fineId, reason, evidence })
      });
    } catch (e) {
      console.warn('Backend dispute fallback:', e.message);
      const disputes = JSON.parse(localStorage.getItem('portal_disputes') || '[]');
      disputes.unshift({
        id: `DSP-${Date.now()}`,
        fineId,
        reason,
        status: 'Under Review',
        submittedAt: new Date().toISOString().split('T')[0]
      });
      localStorage.setItem('portal_disputes', JSON.stringify(disputes));
      return { success: true, message: 'Dispute submitted successfully (fallback mode).' };
    }
  }
};

export const stationService = {
  async getStations() {
    try {
      const data = await request('/stations');
      if (Array.isArray(data) && data.length > 0) return data;
    } catch (e) {
      console.warn('Backend stations request error, using fallback:', e.message);
    }
    return MOCK_STATIONS;
  }
};
