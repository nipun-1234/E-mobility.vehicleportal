import React, { useState } from 'react';
import LandingView from './components/LandingView';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import DashboardView from './components/DashboardView';
import OtpModal from './components/OtpModal';
import GovSsoModal from './components/GovSsoModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';

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
    <div className="mobile-web-wrapper">
      <div className={`mobile-web-shell ${currentScreen === 'landing' ? 'has-bg-image' : ''}`}>
        {/* Liquid / Fluid Background Ambient Glow Orbs */}
        <div style={{
          position: 'absolute', top: '-10%', left: '-10%', width: '320px', height: '320px',
          background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
          filter: 'blur(70px)', opacity: 0.5, animation: 'floatSlow 8s ease-in-out infinite', zIndex: 0, pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', top: '45%', right: '-20%', width: '380px', height: '380px',
          background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
          filter: 'blur(80px)', opacity: 0.45, animation: 'float 6s ease-in-out infinite', zIndex: 0, pointerEvents: 'none'
        }} />

        {/* Main Mobile Web Application Viewport */}
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

          {/* Native Mobile Floating Bottom Sheets / Modals */}
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
    </div>
  );
}
