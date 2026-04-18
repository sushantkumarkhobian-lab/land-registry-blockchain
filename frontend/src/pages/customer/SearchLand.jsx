import React, { useState } from 'react';
import axios from 'axios';
import { Search, Link as LinkIcon, ShieldCheck } from 'lucide-react';

const SearchLand = () => {
  const [query, setQuery] = useState('');
  const [land, setLand] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlQuery = params.get('query');
    if (urlQuery) {
      setQuery(urlQuery);
      performSearch(urlQuery);
    }
  }, []);

  const performSearch = async (searchTerm) => {
    setLoading(true);
    setError('');
    setLand(null);
    try {
      const { data } = await axios.get(`/api/land/${searchTerm}`);
      setLand(data);
    } catch (err) {
      setError('Land not found or invalid ID');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Search & Verify Property</h2>
      
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input 
          type="text" className="form-control" 
          value={query} onChange={(e) => setQuery(e.target.value)} 
          placeholder="Enter System ID, CID, or Property ID..." required 
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          <Search size={18} style={{ marginRight: '8px' }} />
          Search
        </button>
      </form>

      {error && <div style={{ color: 'var(--error)', textAlign: 'center' }}>{error}</div>}

      {land && (
        <div className="glass-card animate-fade-in">
          <div className="flex-between" style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <h3>Property ID: {land.propertyID}</h3>
            {land.isVerified ? (
              <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center' }}>
                <ShieldCheck size={20} style={{ marginRight: '4px' }} /> Verified
              </span>
            ) : (
               <span style={{ color: '#fbbf24' }}>Pending Verification</span>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p><strong>System Land ID:</strong> {land._id}</p>
              <p><strong>Owner Name:</strong> {land.owner?.username || 'Unknown'}</p>
              <p><strong>Owner Email:</strong> {land.owner?.email || 'N/A'}</p>
              <p><strong>Address:</strong> {land.address}</p>
              <p><strong>Area:</strong> {land.area} sq ft</p>
            </div>
            <div>
              <p><strong>Current Status:</strong> {land.status}</p>
              <p><strong>Registration Date:</strong> {new Date(land.createdAt).toLocaleDateString()}</p>
              <div style={{ marginTop: '1rem' }}>
                <a href={`https://gateway.pinata.cloud/ipfs/${land.documentCID}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  <LinkIcon size={16} style={{ marginRight: '6px' }} /> View Original Document
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchLand;
