import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Eye, EyeOff, ArrowRight, CreditCard, Shield } from 'lucide-react';
import { authService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function LoginView({ onLoginSuccess, onOpenOtp, onOpenGovSso, onOpenRegister, onOpenForgot }) {
  const { t } = useLanguage();
  const [nicOrMobile, setNicOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nicOrMobile.trim() || !password.trim()) {
      setError('Please enter your NIC / Mobile number and password');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const data = await authService.login(nicOrMobile, password);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page-screen">
      <div className="app-page-content">
        {/* Brand Header */}
        <div className="brand-header">
          <div className="brand-icon-wrapper">
            <ShieldCheck size={36} strokeWidth={2.2} />
          </div>
          <div className="brand-tag">{t('heroSubheading')}</div>
          <h1 className="brand-title">{t('portalTitle')}</h1>
          <p className="brand-subtitle">
            {t('portalSubtitle')}
          </p>
        </div>

        {/* Main Login Card */}
        <div className="auth-card">
          <h2 className="card-title">{t('welcomeBack')}</h2>
          <p className="card-subtitle">
            {t('loginSubtitle')}
          </p>

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

          <form onSubmit={handleSubmit}>
            {/* NIC / Mobile Number Field */}
            <div className="form-group">
              <label className="form-label">{t('nicOrMobile')}</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder={t('nicPlaceholder')}
                  value={nicOrMobile}
                  onChange={(e) => setNicOrMobile(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">{t('password')}</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="•••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot Password */}
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>{t('rememberMe')}</span>
              </label>
              <button
                type="button"
                className="forgot-link"
                onClick={onOpenForgot}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {t('forgotPassword')}
              </button>
            </div>

            {/* Sign In Button */}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('signingIn') : (
                <>
                  {t('signIn')} <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span>{t('orContinueWith')}</span>
          </div>

          {/* Alternative Auth Buttons */}
          <div className="auth-alt-grid">
            <button className="btn-alt" onClick={onOpenOtp}>
              <CreditCard size={16} /> {t('otpLogin')}
            </button>
            <button className="btn-alt" onClick={onOpenGovSso}>
              <Shield size={16} /> {t('govSsoLogin')}
            </button>
          </div>

          {/* Registration Link */}
          <div className="signup-prompt">
            {t('newHere')}{' '}
            <button onClick={onOpenRegister}>
              {t('createAccount')}
            </button>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="security-note">
          <Lock size={14} /> {t('secNote')}
        </div>
      </div>
    </div>
  );
}
