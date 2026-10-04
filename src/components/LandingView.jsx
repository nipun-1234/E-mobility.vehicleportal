import React, { useState, useRef } from 'react';
import { ArrowRight, Droplet, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LandingView({ onNext }) {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('home');
  const scrollContainerRef = useRef(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const scrollTop = scrollContainerRef.current.scrollTop;
    
    if (scrollTop > 150) {
      setActiveSection('features');
    } else {
      setActiveSection('home');
    }
  };

  const scrollToSection = (sectionId) => {
    if (!scrollContainerRef.current) return;
    if (sectionId === 'home') {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId === 'features') {
      scrollContainerRef.current.scrollTo({ top: 380, behavior: 'smooth' });
    }
  };

  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="no-scrollbar"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowY: 'auto',
        overflowX: 'hidden',
        color: 'white',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* Sticky Navigation Bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        padding: '16px 24px',
        background: 'rgba(2, 6, 23, 0.4)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'all 0.3s ease'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '10px', padding: '6px', display: 'flex', alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <ShieldCheck size={18} color="#93c5fd" />
          </div>
          <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: '800', fontSize: '15px', letterSpacing: '-0.5px' }}>
            E-Mobility
          </span>
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
            onClick={() => scrollToSection('home')}
          >
            {t('home')}
          </button>
          <button 
            className={`nav-link ${activeSection === 'features' ? 'active' : ''}`}
            onClick={() => scrollToSection('features')}
          >
            {t('features')}
          </button>
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 20px 60px',
        zIndex: 10
      }}>
        
        {/* Hero Section: Liquid Glass Main Card */}
        <div style={{
          width: '100%',
          maxWidth: '400px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: '32px',
          padding: '42px 26px 36px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 0 32px rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          marginBottom: '36px',
          position: 'relative'
        }}>
          
          {/* Concise Top Subheading */}
          <div style={{
            fontSize: '11px',
            fontWeight: '800',
            color: '#93c5fd',
            textTransform: 'uppercase',
            letterSpacing: '1.8px',
            marginBottom: '14px',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            background: 'rgba(147, 197, 253, 0.12)',
            padding: '4px 12px',
            borderRadius: '20px',
            border: '1px solid rgba(147, 197, 253, 0.25)',
            userSelect: 'none'
          }}>
            {t('heroSubheading')}
          </div>

          {/* Main Heading: Bold, Punchy Focal Title */}
          <h1 style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '24px',
            fontWeight: '800',
            lineHeight: '1.35',
            textAlign: 'center',
            marginBottom: '32px',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #93c5fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.4px'
          }}>
            {t('heroFocalTitle')}
          </h1>

          {/* Call to Action Button */}
          <button 
            onClick={onNext}
            className="hero-cta-btn"
          >
            <span>{t('getStarted')}</span>
            <ArrowRight size={18} className="cta-arrow" />
          </button>
        </div>

        {/* Premium Features Section */}
        <div style={{ width: '100%', maxWidth: '400px', animation: 'fadeInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '18px' }}>
            <Sparkles size={16} color="#93c5fd" />
            <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '18px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.3px' }}>
              {t('premiumFeatures')}
            </h2>
          </div>
          
          <div style={{ display: 'flex', gap: '14px', flexDirection: 'column', width: '100%' }}>
            
            {/* Feature 1: Bank-Grade Security */}
            <div className="feature-card">
              <div className="feature-icon-box">
                <ShieldCheck size={24} color="#93c5fd" />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: '4px' }}>
                  {t('bankSecurityTitle')}
                </div>
                <div style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.45' }}>
                  {t('bankSecurityDesc')}
                </div>
              </div>
            </div>

            {/* Feature 2: Lightning Fast */}
            <div className="feature-card">
              <div className="feature-icon-box">
                <Zap size={24} color="#93c5fd" />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: '4px' }}>
                  {t('lightningFastTitle')}
                </div>
                <div style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.45' }}>
                  {t('lightningFastDesc')}
                </div>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
