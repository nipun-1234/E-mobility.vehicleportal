import React, { useState } from 'react';
import LandingView from './components/LandingView';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import DashboardView from './components/DashboardView';
import OtpModal from './components/OtpModal';
import GovSsoModal from './components/GovSsoModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import { Signal, BatteryCharging } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentScreen, setCurrentScreen] = useState('landing'); // 'landing' | 'login' | 'register'
  const [activeModal, setActiveModal] = useState(null); // 'otp' | 'gov' | 'forgot' | null

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveModal(null);
    setCurrentScreen('login');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    setCurrentScreen('login');
  };

  return (
    <div className={`device-shell ${currentScreen === 'landing' ? 'has-bg-image' : ''}`}>
      {/* Liquid / Fluid Background Orbs - Only on Landing Page */}
      {currentScreen === 'landing' && (
        <>
          <div style={{
            position: 'absolute', top: '-10%', left: '-10%', width: '300px', height: '300px',
            background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
            filter: 'blur(60px)', opacity: 0.6, animation: 'floatSlow 8s ease-in-out infinite', zIndex: 1, pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', top: '40%', right: '-20%', width: '400px', height: '400px',
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            filter: 'blur(80px)', opacity: 0.5, animation: 'float 6s ease-in-out infinite', zIndex: 1, pointerEvents: 'none'
          }} />
        </>
      )}

      {/* Persistent Top Mobile Status Bar (Flagship iOS/Android Dynamic Island) */}
      <div className="status-bar">
        <span>14:44</span>
        <div className="status-bar-island">
          <div className="island-lens-dot" />
          <div className="island-sensor-dot" />
        </div>
        <div className="icons">
          <Signal size={13} />
          <span>5G</span>
          <div className="battery-pill">
            <div className="battery-fill" style={{ width: '91%' }} />
          </div>
        </div>
      </div>

      {/* Main Inner Viewport (Guaranteed identical height and width for every page) */}
      <div className="app-viewport-container">
        {currentUser ? (
          <DashboardView user={currentUser} onLogout={handleLogout} />
        ) : currentScreen === 'landing' ? (
          <LandingView onNext={() => setCurrentScreen('login')} />
        ) : currentScreen === 'register' ? (
          <RegisterView
            onBackToLogin={() => setCurrentScreen('login')}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            onOpenOtp={() => setActiveModal('otp')}
            onOpenGovSso={() => setActiveModal('gov')}
            onOpenRegister={() => setCurrentScreen('register')}
            onOpenForgot={() => setActiveModal('forgot')}
          />
        )}

        {/* Floating Modals inside viewport container */}
        {activeModal === 'otp' && (
          <OtpModal
            onClose={() => setActiveModal(null)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {activeModal === 'gov' && (
          <GovSsoModal
            onClose={() => setActiveModal(null)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {activeModal === 'forgot' && (
          <ForgotPasswordModal
            onClose={() => setActiveModal(null)}
          />
        )}
      </div>
    </div>
  );
}
