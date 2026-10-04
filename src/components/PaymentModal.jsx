import React, { useState } from 'react';
import { ChevronLeft, Check, CheckCircle2, Download, ShieldCheck } from 'lucide-react';
import { fineService } from '../services/api';

export default function PaymentModal({ fine, onClose, onPaymentComplete }) {
  const [selectedTickets, setSelectedTickets] = useState({
    'TX-88421': true,
    'TX-87220': false
  });

  const ticketsData = [
    {
      id: 'TX-88421',
      plate: 'WP CAB-4521',
      offence: 'Speeding — 128 km/h in 100 km/h zone',
      amount: 3850,
      dueDate: '05 Aug 2026',
      lateFee: 500
    },
    {
      id: 'TX-87220',
      plate: 'WP CAB-4521',
      offence: 'Signal violation — Kottawa junction',
      amount: 2000,
      dueDate: '12 Aug 2026',
      lateFee: 300
    }
  ];

  const [paymentMethod, setPaymentMethod] = useState('visa');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [downloaded, setDownloaded] = useState(false);

  const toggleTicket = (id) => {
    setSelectedTickets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectAll = () => {
    setSelectedTickets({ 'TX-88421': true, 'TX-87220': true });
  };

  const selectedCount = Object.values(selectedTickets).filter(Boolean).length;
  const totalAmount = ticketsData.reduce((sum, t) => selectedTickets[t.id] ? sum + t.amount : sum, 0);

  const handlePay = async (e) => {
    e.preventDefault();
    if (totalAmount === 0) return;

    setLoading(true);
    setTimeout(async () => {
      try {
        const res = await fineService.payFine(fine?.id || 'TX-88421', { method: paymentMethod });
        setReceipt({
          receiptNo: res.receiptNo || 'RCP-991823',
          amount: totalAmount,
          date: new Date().toLocaleDateString(),
          ticketsCount: selectedCount
        });
        if (onPaymentComplete) onPaymentComplete();
      } catch (err) {
        alert('Payment processing failed');
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="app-page-screen" style={{ zIndex: 100, background: '#020617' }}>
      {/* Top Header Bar */}
      <div style={{
        padding: '14px 20px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexShrink: 0
      }}>
        <button
          onClick={onClose}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <ChevronLeft size={20} color="#ffffff" />
        </button>
        <div>
          <h1 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '18px', fontWeight: '800', color: '#ffffff', lineHeight: '1.2' }}>
            Pay Fines
          </h1>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>
            Secure payment via GovPay
          </p>
        </div>
      </div>

      <div className="app-page-content">
        {/* Animated Payment Success Confirmation Popup Overlay */}
        {receipt && (
          <div className="payment-success-overlay">
            <div className="payment-success-modal">
              {/* Party Sparkles Effect */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '25%', left: '12%', width: '8px', height: '8px', background: '#34d399', borderRadius: '50%', animation: 'confettiBurst 1.2s ease-out infinite' }} />
                <div style={{ position: 'absolute', top: '18%', right: '18%', width: '10px', height: '10px', background: '#fbbf24', borderRadius: '2px', animation: 'confettiBurst 1.5s ease-out infinite 0.2s' }} />
                <div style={{ position: 'absolute', top: '35%', left: '82%', width: '6px', height: '6px', background: '#60a5fa', borderRadius: '50%', animation: 'confettiBurst 1.3s ease-out infinite 0.4s' }} />
                <div style={{ position: 'absolute', top: '28%', left: '10%', width: '12px', height: '6px', background: '#f472b6', borderRadius: '2px', animation: 'confettiBurst 1.6s ease-out infinite 0.1s' }} />
              </div>

              {/* Animated Glowing Checkmark Badge */}
              <div className="success-badge-circle">
                <svg className="success-checkmark-svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>

              {/* Header Title & Subtitle */}
              <h2 style={{
                fontSize: '22px',
                fontWeight: '900',
                fontFamily: 'Plus Jakarta Sans',
                background: 'linear-gradient(135deg, #6ee7b7 0%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '4px',
                animation: 'itemSlideFadeIn 0.4s ease-out 0.2s both'
              }}>
                Payment Successful!
              </h2>

              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '18px', animation: 'itemSlideFadeIn 0.4s ease-out 0.3s both' }}>
                Traffic fine cleared & verified via GovPay
              </p>

              {/* Receipt Summary Details Card */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                borderRadius: '20px',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'left',
                animation: 'successGlowPulse 3s ease-in-out infinite, itemSlideFadeIn 0.4s ease-out 0.4s both'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Official Receipt</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#34d399', fontFamily: 'monospace' }}>
                      #{receipt.receiptNo}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', color: '#6ee7b7', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={12} /> VERIFIED
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Total Amount Paid:</span>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', fontFamily: 'monospace' }}>
                    Rs. {receipt.amount.toLocaleString()}.00
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '12px' }}>
                  <span style={{ color: '#94a3b8' }}>Tickets Settled:</span>
                  <span style={{ color: '#ffffff', fontWeight: '700' }}>{receipt.ticketsCount} Ticket(s)</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
                  <span>Transaction Time:</span>
                  <span>{new Date().toLocaleTimeString()} · {receipt.date}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', animation: 'itemSlideFadeIn 0.4s ease-out 0.5s both' }}>
                <button
                  className="btn-primary"
                  style={{
                    height: '48px',
                    fontSize: '14px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onClick={() => {
                    if (onPaymentComplete) onPaymentComplete();
                    onClose();
                  }}
                >
                  <CheckCircle2 size={18} /> Return to Dashboard
                </button>

                <button
                  className="btn-alt"
                  style={{
                    height: '42px',
                    fontSize: '13px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  onClick={() => {
                    setDownloaded(true);
                    setTimeout(() => setDownloaded(false), 3000);
                  }}
                >
                  <Download size={15} /> {downloaded ? 'Receipt Saved as PDF! ✓' : 'Save PDF Receipt'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Blue Summary Card Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.4) 0%, rgba(29, 78, 216, 0.3) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(147, 197, 253, 0.3)',
              borderRadius: '20px',
              padding: '18px',
              color: 'white',
              boxShadow: '0 12px 24px -6px rgba(0, 0, 0, 0.4)',
              marginBottom: '18px'
            }}>
              <div style={{ fontSize: '12px', opacity: 0.85, fontWeight: '600', color: '#93c5fd' }}>
                Total Amount Due
              </div>
              <div style={{
                fontFamily: 'Plus Jakarta Sans',
                fontSize: '26px',
                fontWeight: '800',
                margin: '4px 0 14px',
                letterSpacing: '-0.5px'
              }}>
                Rs. {totalAmount.toLocaleString()}.00
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '10px', fontSize: '11px' }}>
                <div>
                  <div style={{ opacity: 0.75 }}>Tickets</div>
                  <div style={{ fontWeight: '800', marginTop: '2px' }}>{selectedCount} selected</div>
                </div>
                <div>
                  <div style={{ opacity: 0.75 }}>Due date</div>
                  <div style={{ fontWeight: '800', marginTop: '2px' }}>05 Aug 2026</div>
                </div>
                <div>
                  <div style={{ opacity: 0.75 }}>Late fee after</div>
                  <div style={{ fontWeight: '800', marginTop: '2px' }}>Rs. 500</div>
                </div>
              </div>
            </div>

            {/* Select Tickets Section */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>
                  Select Tickets
                </h3>
                <button
                  onClick={selectAll}
                  style={{ background: 'none', border: 'none', color: '#93c5fd', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                >
                  Select all ({ticketsData.length})
                </button>
              </div>

              {ticketsData.map((t) => {
                const isSelected = !!selectedTickets[t.id];
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleTicket(t.id)}
                    style={{
                      background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: '16px',
                      padding: '12px 14px',
                      marginBottom: '10px',
                      border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: isSelected ? '#3b82f6' : 'transparent',
                        border: isSelected ? 'none' : '2px solid rgba(255, 255, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0
                      }}>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>

                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff', fontFamily: 'monospace' }}>
                          {t.plate} · #{t.id}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          {t.offence}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#93c5fd', fontFamily: 'monospace', flexShrink: 0 }}>
                      Rs. {t.amount.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Method Section */}
            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '15px', fontWeight: '800', color: '#ffffff', marginBottom: '10px' }}>
                Payment Method
              </h3>

              <div
                onClick={() => setPaymentMethod('visa')}
                style={{
                  background: paymentMethod === 'visa' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  padding: '12px 14px',
                  marginBottom: '8px',
                  border: paymentMethod === 'visa' ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#1d4ed8', color: 'white', fontWeight: '900', fontSize: '11px', padding: '6px 10px', borderRadius: '8px' }}>
                    VISA
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>Visa •••• 4471</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Expires 08/28</div>
                  </div>
                </div>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: paymentMethod === 'visa' ? '5px solid #3b82f6' : '2px solid rgba(255, 255, 255, 0.3)' }} />
              </div>

              <div
                onClick={() => setPaymentMethod('mastercard')}
                style={{
                  background: paymentMethod === 'mastercard' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  padding: '12px 14px',
                  marginBottom: '8px',
                  border: paymentMethod === 'mastercard' ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#ea580c', color: 'white', fontWeight: '900', fontSize: '11px', padding: '6px 10px', borderRadius: '8px' }}>
                    MC
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>Mastercard •••• 9021</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Expires 03/27</div>
                  </div>
                </div>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: paymentMethod === 'mastercard' ? '5px solid #3b82f6' : '2px solid rgba(255, 255, 255, 0.3)' }} />
              </div>

              <div
                onClick={() => setPaymentMethod('bank')}
                style={{
                  background: paymentMethod === 'bank' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  padding: '12px 14px',
                  border: paymentMethod === 'bank' ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#059669', color: 'white', fontWeight: '900', fontSize: '11px', padding: '6px 10px', borderRadius: '8px' }}>
                    🏦
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>Direct Bank Transfer</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>People's Bank · Online</div>
                  </div>
                </div>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: paymentMethod === 'bank' ? '5px solid #3b82f6' : '2px solid rgba(255, 255, 255, 0.3)' }} />
              </div>
            </div>

            {/* Subtotal & Fee */}
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '12px', marginBottom: '18px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Subtotal</span>
                <strong style={{ fontFamily: 'monospace', color: '#ffffff' }}>Rs. {totalAmount.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>GovPay processing fee</span>
                <strong style={{ color: '#34d399', fontFamily: 'monospace' }}>Rs. 0</strong>
              </div>
            </div>

            <button
              onClick={handlePay}
              className="btn-primary"
              style={{ height: '48px', fontSize: '15px' }}
              disabled={loading || totalAmount === 0}
            >
              {loading ? 'Processing Payment...' : (
                <>Pay Rs. {totalAmount.toLocaleString()}.00 Now <ShieldCheck size={18} /></>
              )}
            </button>
      </div>
    </div>
  );
}
