import React, { useState } from 'react';
import { ChevronLeft, Edit3, FileCheck, Plus, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { fineService } from '../services/api';

export default function DisputeModal({ fine, onClose, onDisputeFiled }) {
  const [reasonCategory, setReasonCategory] = useState('not_my_vehicle');
  const [details, setDetails] = useState('I sold this vehicle on 10 June 2026. Ownership transfer document attached.');
  const [documents, setDocuments] = useState(['Deed.pdf']);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const reasons = [
    {
      id: 'not_my_vehicle',
      title: 'Not my vehicle',
      subtitle: 'Plate misread or vehicle sold/transferred'
    },
    {
      id: 'incorrect_speed',
      title: 'Incorrect speed reading',
      subtitle: 'Radar/camera error suspected'
    },
    {
      id: 'signage_hidden',
      title: 'Signage not visible',
      subtitle: 'Speed limit sign missing or obscured'
    },
    {
      id: 'other',
      title: 'Other reason',
      subtitle: 'Describe your case below'
    }
  ];

  const handleAddFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments([...documents, e.target.files[0].name]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dispute = await fineService.fileDispute(fine?.id || 'TX-88421', `${reasonCategory}: ${details}`);
      setSubmitted(dispute);
      if (onDisputeFiled) onDisputeFiled();
    } catch (err) {
      alert('Failed to submit dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page-screen" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#080d1a', overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '90px' }}>
      {/* Top Header Bar */}
      <div style={{
        padding: '16px 20px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
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
            Dispute Ticket
          </h1>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>
            Submit a formal review request
          </p>
        </div>
      </div>

      {submitted ? (
        <div style={{ padding: '30px 20px', textAlign: 'center' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <CheckCircle2 size={54} color="#60a5fa" style={{ margin: '0 auto 12px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Plus Jakarta Sans', color: '#ffffff' }}>
              Dispute Submitted!
            </h2>
            <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '8px 0 16px' }}>
              Reference Case #{submitted.id} has been logged with Sri Lanka Police Traffic Appeals Branch.
            </p>
            <button className="btn-primary" onClick={onClose}>
              Close Window
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ padding: '16px 20px 30px', flex: 1, overflowY: 'auto' }}>
          
          {/* Fine Ticket Summary Card */}
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            borderRadius: '16px',
            padding: '14px 16px',
            marginBottom: '20px',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(244, 63, 94, 0.2)',
              color: '#fda4af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Edit3 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', fontFamily: 'monospace' }}>
                {fine?.vehiclePlate || 'WP CAB-4521'} — {fine?.offence || 'Speeding 128 km/h'}
              </div>
              <div style={{ fontSize: '12px', color: '#fda4af', marginTop: '2px' }}>
                TICKET #{fine?.id || 'TX-88421'} &nbsp;·&nbsp; Rs. {fine?.amount ? fine.amount.toLocaleString() : '3,850'}
              </div>
            </div>
          </div>

          {/* Dispute Category Selection */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
              Why are you disputing this?
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
              Select the reason that best matches your case
            </p>

            {reasons.map((r) => {
              const isSelected = reasonCategory === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setReasonCategory(r.id)}
                  style={{
                    background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '16px',
                    padding: '14px',
                    marginBottom: '10px',
                    border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: isSelected ? '6px solid #3b82f6' : '2px solid rgba(255, 255, 255, 0.3)',
                    flexShrink: 0
                  }} />

                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>
                      {r.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
                      {r.subtitle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Details Textarea */}
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ fontSize: '13px', fontWeight: '800' }}>
              Additional details
            </label>
            <textarea
              className="glass-input"
              style={{ height: '90px', padding: '12px', lineHeight: '1.4' }}
              placeholder="Describe your case below..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          {/* Supporting Documents Upload Grid */}
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ fontSize: '13px', fontWeight: '800' }}>
              Supporting documents
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1.5px solid #3b82f6',
                    borderRadius: '14px',
                    height: '90px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#93c5fd',
                    padding: '8px',
                    textAlign: 'center'
                  }}
                >
                  <FileCheck size={24} style={{ marginBottom: '4px' }} />
                  <span style={{ fontSize: '11px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                    {doc}
                  </span>
                </div>
              ))}

              {[...Array(Math.max(0, 3 - documents.length))].map((_, i) => (
                <div
                  key={i}
                  onClick={() => document.getElementById('dispute-doc-input').click()}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1.5px dashed rgba(255, 255, 255, 0.2)',
                    borderRadius: '14px',
                    height: '90px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={20} style={{ marginBottom: '2px' }} />
                  <span style={{ fontSize: '11px', fontWeight: '600' }}>Add file</span>
                </div>
              ))}
            </div>

            <input type="file" id="dispute-doc-input" hidden onChange={handleAddFile} />
          </div>

          {/* Yellow Advisory Note */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '14px',
            padding: '12px 14px',
            marginBottom: '20px',
            fontSize: '12px',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600'
          }}>
            <AlertCircle size={16} /> Disputes are reviewed within 5-7 working days
          </div>

          {/* Submit Action Button */}
          <button type="submit" className="btn-primary" style={{ height: '52px', fontSize: '15px' }} disabled={loading}>
            {loading ? 'Submitting Dispute...' : 'Submit Formal Dispute'}
          </button>
        </form>
      )}
    </div>
  );
}
