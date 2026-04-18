import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const verify = async () => {
      try {
        const { data } = await axios.get(`/api/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(data.message);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex-center animate-fade-in" style={{ height: 'calc(100vh - 120px)', backgroundImage: "url('/login-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '16px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', backdropFilter: 'blur(20px)', background: 'rgba(11, 26, 20, 0.75)' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Email Verification</h2>
        {status === 'verifying' && (
          <>
            <h2>Verifying Email...</h2>
            <p>Please wait while we confirm your email address.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ color: 'var(--success)' }}>Verified!</h2>
            <p style={{ marginBottom: '2rem' }}>{message}</p>
            <Link to="/login" className="btn-primary">Proceed to Login</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={64} color="var(--error)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ color: 'var(--error)' }}>Verification Failed</h2>
            <p style={{ marginBottom: '2rem' }}>{message}</p>
            <Link to="/signup" className="btn-secondary">Back to Signup</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
