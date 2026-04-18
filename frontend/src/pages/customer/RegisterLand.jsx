import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const RegisterLand = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialPropertyID = searchParams.get('propertyID') || '';
  const initialAddress = searchParams.get('address') || '';

  const [formData, setFormData] = useState({
    propertyID: initialPropertyID,
    address: initialAddress,
    area: ''
  });
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!document) return setError('Property Document is required');
    
    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('propertyID', formData.propertyID);
    data.append('address', formData.address);
    data.append('area', formData.area);
    data.append('document', document);

    try {
      await axios.post('/api/land/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register land');
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Register New Property</h2>
      <div className="glass-card">
        {error && <div style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Property ID (Unique identifier)</label>
            <input type="text" className="form-control" name="propertyID" value={formData.propertyID} onChange={handleChange} required readOnly={!!initialPropertyID} style={initialPropertyID ? { opacity: 0.7 } : {}}/>
          </div>
          <div className="form-group">
            <label>Physical Address</label>
            <textarea className="form-control" name="address" value={formData.address} onChange={handleChange} required rows={3}></textarea>
          </div>
          <div className="form-group">
            <label>Area (in sq ft)</label>
            <input type="number" className="form-control" name="area" value={formData.area} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Legal Document (PDF/Image will be stored on IPFS)</label>
            <input type="file" className="form-control" onChange={(e) => setDocument(e.target.files[0])} required accept=".pdf,image/*" />
          </div>
          <div className="flex gap-4">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Uploading to IPFS...' : 'Submit Registration'}
            </button>
            <button type="button" className="btn-secondary" style={{ background: 'transparent', border: '1px solid var(--card-border)'}} onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterLand;
