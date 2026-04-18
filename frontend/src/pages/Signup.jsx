import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'customer',
    officialDocument: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const { username, email, password, role } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const { data } = await axios.post('/api/auth/register', formData);
      
      setStatus({ type: 'success', message: data.message });

      // Automatically download QR Code for Agent
      if (data.role === 'agent' && data.qrCode) {
        const link = document.createElement('a');
        link.href = data.qrCode;
        link.download = `Agent-QRCode-${data.username}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setStatus({ 
          type: 'success', 
          message: `${data.message} IMPORTANT: Your QR Code has been downloaded. You MUST keep it safe to login!` 
        });
      }

      setFormData({ username: '', email: '', password: '', role: 'customer', officialDocument: '' });
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Registration failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center animate-fade-in" style={{ height: 'calc(100vh - 120px)', backgroundImage: "url('/login-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '16px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', backdropFilter: 'blur(20px)', background: 'rgba(11, 26, 20, 0.75)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>

        {status.message && (
          <div style={{
            ...styles.alert,
            borderColor: status.type === 'error' ? 'var(--error)' : 'var(--accent-primary)',
            color: status.type === 'error' ? 'var(--error)' : 'var(--accent-primary)',
            background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'
          }}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ flexDirection: 'row', gap: '1rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="radio" name="role" value="customer"
                checked={role === 'customer'} 
                onChange={handleChange} 
                style={{ marginRight: '8px' }}
              /> Customer
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="radio" name="role" value="agent"
                checked={role === 'agent'} 
                onChange={handleChange} 
                style={{ marginRight: '8px' }}
              /> Gov Agent
            </label>
          </div>

          {role === 'agent' && (
            <div className="form-group animate-slide-up">
              <label>Official Document (Verification)</label>
              <input 
                type="file" 
                className="form-control" 
                onChange={(e) => setFormData({ ...formData, officialDocument: 'QmFakeCID' + Math.random().toString(36).substring(7) })}
                required 
              />
              <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '5px' }}>
                Please upload your government ID or official authorization.
              </small>
            </div>
          )}

          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" className="form-control" name="username"
              value={username} onChange={handleChange} required 
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" className="form-control" name="email"
              value={email} onChange={handleChange} required 
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" className="form-control" name="password"
              value={password} onChange={handleChange} required 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Processing...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-secondary)' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  alert: {
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
    border: '1px solid',
    textAlign: 'center'
  }
};

export default Signup;
