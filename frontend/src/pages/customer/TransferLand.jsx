import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const TransferLand = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [toUserId, setToUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const land = state?.land;
  const isPurchase = state?.initiatePurchase;

  useEffect(() => {
    if (isPurchase && user?._id) {
       setToUserId(user._id);
    }
  }, [isPurchase, user]);

  if (!land) {
    return <div>Invalid access. Please initiate transfer from your dashboard.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isPurchase ? '/api/land/purchase' : '/api/land/transfer';
      const payload = isPurchase ? { landId: land._id } : { landId: land._id, toUserId };
      
      await axios.post(endpoint, payload);
      alert(isPurchase ? 'Purchase request submitted!' : 'Transfer request submitted!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request');
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>{isPurchase ? 'Purchase Property' : 'Transfer Property Ownership'}</h2>
      <div className="glass-card">
        {error && <div style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</div>}
        
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <h4>Property: {land.propertyID}</h4>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>{land.address}</p>
          {isPurchase && <p style={{ marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>Price: {land.price} ETH</p>}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{isPurchase ? 'Confirm Your Buyer ID (Auto-filled)' : 'Buyer User ID (Destination Object ID)'}</label>
            <input 
              type="text" className="form-control" 
              value={toUserId} onChange={(e) => setToUserId(e.target.value)} required 
              placeholder="e.g. 64b73b5e4c6e9a0f..."
              readOnly={isPurchase}
              style={isPurchase ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', background: isPurchase ? 'linear-gradient(135deg, var(--accent-secondary), var(--accent-secondary-hover))' : '' }}>
            {loading ? 'Processing...' : (isPurchase ? 'Submit Purchase Request' : 'Request Transfer via Agent')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransferLand;
