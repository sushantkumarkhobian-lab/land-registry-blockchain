import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

const Login = () => {
  const [step, setStep] = useState(1); // 1 = Login Init, 2 = Verify OTP
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // customer, agent, admin
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState(''); // Store email returned from init for OTP verify
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    let scanner = null;
    if (showScanner) {
      scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false);
      scanner.render(
        async (decodedText) => {
          // Success
          scanner.clear();
          setShowScanner(false);
          await submitLogin(decodedText);
        },
        (err) => {
          // Ignore scanning errors (happens when no QR in frame)
        }
      );
    }
    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error("Scanner clear error", e));
      }
    };
  }, [showScanner, username, password]); // Include credentials so latest state is used in callback

  const submitLogin = async (qrCodeData = null) => {
    setError('');
    setLoading(true);
    
    try {
      const payload = { username, password };
      if (role === 'agent' && qrCodeData) payload.qrCodeData = qrCodeData;

      const { data } = await axios.post('/api/auth/login-init', payload);
      
      // If admin, we already got the token and data in login-init (direct)
      if (role === 'admin' && data.token) {
        login(data);
        navigate('/admin-dashboard');
        return;
      }

      setEmail(data.email); // Save email for Step 2
      setStep(2); // Proceed to OTP step
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Login initialization failed');
      setLoading(false);
      setShowScanner(false);
    }
  };

  const handleInitLogin = async (e) => {
    e.preventDefault();
    if (role === 'agent') {
      setShowScanner(true);
    } else {
      await submitLogin(null);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post('/api/auth/login-verify', { email, otp });
      login(data);
      if (data.role === 'customer') {
        navigate('/dashboard');
      } else if (data.role === 'agent') {
        navigate('/agent-dashboard');
      } else {
        navigate('/admin-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
      setLoading(false);
    }
  };

  return (
    <div className="flex-center animate-fade-in" style={{ height: 'calc(100vh - 120px)', backgroundImage: "url('/login-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '16px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', backdropFilter: 'blur(20px)', background: 'rgba(11, 26, 20, 0.75)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {step === 1 ? 'Welcome Back' : 'Verify Identity'}
        </h2>

        {error && <div style={styles.error}>{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleInitLogin}>
            <div className="form-group" style={{ flexDirection: 'row', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  checked={role === 'customer'} 
                  onChange={() => setRole('customer')} 
                  style={{ marginRight: '8px' }}
                /> Customer
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  checked={role === 'agent'} 
                  onChange={() => setRole('agent')} 
                  style={{ marginRight: '8px' }}
                /> Gov Agent
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                   type="radio" 
                   checked={role === 'admin'} 
                   onChange={() => setRole('admin')} 
                   style={{ marginRight: '8px' }}
                /> Admin
              </label>
            </div>

            <div className="form-group">
              <label>Username</label>
              <input 
                type="text" 
                className="form-control" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            
            {showScanner && role === 'agent' && (
              <div className="form-group" style={{ background: '#fff', padding: '10px', borderRadius: '8px' }}>
                <p style={{ color: '#000', fontSize: '0.8rem', textAlign: 'center', marginBottom: '5px' }}>Position your QR inside the box</p>
                <div id="qr-reader" style={{ width: '100%' }}></div>
                <button type="button" onClick={() => setShowScanner(false)} style={{width: '100%', marginTop: '10px', background: 'transparent', color: 'red', border: 'none', cursor: 'pointer'}}>Cancel Camera</button>
              </div>
            )}

            {!showScanner && (
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Processing...' : (role === 'agent' ? 'Open Camera & Login' : 'Login')}
              </button>
            )}
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="animate-fade-in">
            <p style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              We've sent a 6-digit OTP to your registered email
            </p>
            <div className="form-group">
              <label>Enter OTP</label>
              <input 
                type="text" 
                className="form-control" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required 
                maxLength="6"
                style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Enter'}
            </button>
          </form>
        )}

        {step === 1 && (
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
            Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-secondary)' }}>Sign up here</Link>
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  error: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--error)',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
    border: '1px solid var(--error)'
  }
};

export default Login;
