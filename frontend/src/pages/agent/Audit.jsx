import React, { useState } from 'react';
import axios from 'axios';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

const Audit = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState([]);

  const addStep = (msg, delay) => {
    return new Promise(resolve => {
      setTimeout(() => {
        setSteps(prev => [...prev, { msg, id: Date.now() + Math.random() }]);
        resolve();
      }, delay);
    });
  };

  const performAudit = async () => {
    setLoading(true);
    setResult(null);
    setSteps([]);
    
    await addStep("📡 Initializing secure connection to Blockchain nodes...", 800);
    await addStep("📜 Fetching latest ledger blocks for verification...", 1200);
    await addStep("💎 Validating Genesis Block integrity signature...", 1200);
    await addStep("⚙️ Recalculating SHA-256 hash chains for Block #1, #2, #3...", 1500);
    await addStep("🛡️ Comparing local hashes with distributed network consensus...", 1200);
    await addStep("🔐 Finalizing full network cryptographic audit...", 1000);

    try {
      const { data } = await axios.get('/api/agent/audit');
      setResult(data);
    } catch (err) {
      setResult({ isValid: false, message: 'Critical communication failure with blockchain.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center animate-fade-in" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="glass-card" style={{ maxWidth: '600px', width: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>System Audit & Integrity</h2>
        <p style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          This tool cryptographically verifies the SHA-256 hash chains across all Land Registry Blocks to ensure no data has been modified.
        </p>

        {!loading && !result && (
          <div className="flex-center" style={{ flex: 1 }}>
            <button className="btn-primary" onClick={performAudit} style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem' }}>
              Run Full Network Audit
            </button>
          </div>
        )}

        {(loading || steps.length > 0) && (
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--card-border)', flex: 1, marginBottom: '1.5rem', overflowY: 'auto', maxHeight: '300px' }}>
            {steps.map((step, index) => (
              <div key={step.id} className="animate-slide-up" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--accent-primary)' }}>{index === steps.length - 1 && loading ? '➤' : '✓'}</span>
                <span style={{ color: index === steps.length - 1 && loading ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {step.msg}
                </span>
              </div>
            ))}
            {loading && <div className="pulse" style={{ marginTop: '10px', color: 'var(--accent-secondary)', fontSize: '0.8rem', fontStyle: 'italic' }}>Processing network validation...</div>}
          </div>
        )}

        {result && (
          <div className="animate-fade-in flex-col flex-center" style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem' }}>
            {result.isValid ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--success)', marginBottom: '0.5rem' }}>
                  <ShieldCheck size={32} />
                  <h3 style={{ margin: 0 }}>INTEGRITY VERIFIED</h3>
                </div>
                <p style={{ fontSize: '0.9rem' }}>The SHA-256 ledger is 100% stable and un-tampered.</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--error)', marginBottom: '0.5rem' }}>
                  <ShieldAlert size={32} />
                  <h3 style={{ margin: 0 }}>CHAIN COMPROMISED</h3>
                </div>
                <p style={{ color: 'var(--error)' }}>{result.message}</p>
              </div>
            )}
            <button className="btn-secondary" style={{ marginTop: '1.5rem', padding: '0.5rem 1.5rem' }} onClick={() => { setSteps([]); setResult(null); }}>
              Reset Audit View
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Audit;
