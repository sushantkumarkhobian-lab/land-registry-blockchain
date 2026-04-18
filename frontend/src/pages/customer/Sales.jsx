import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Tag, User, MapPin, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sales = () => {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const { data } = await axios.get('/api/land/for-sale');
        setLands(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load marketplace", error);
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const filteredLands = lands.filter(land => 
    land.propertyID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    land.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ minHeight: '80vh', padding: '2rem' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag color="var(--accent-secondary)" />
            Land Marketplace
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Browse premium land parcels listed by other owners.</p>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search location or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        </div>
      </div>

      {loading ? (
        <p>Loading marketplace...</p>
      ) : filteredLands.length === 0 ? (
        <div className="glass-card flex-center flex-col" style={{ padding: '4rem 2rem' }}>
          <Tag size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-secondary)' }}>No Properties for Sale</h3>
          <p>Be the first to list a property or try a different search!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {filteredLands.map((land) => (
            <div key={land._id} className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', borderLeft: '4px solid var(--accent-secondary)' }}>
              <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <span style={{ 
                  background: 'rgba(236, 72, 153, 0.1)', 
                  color: 'var(--accent-secondary)', 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  FOR SALE
                </span>
                <h3 style={{ margin: 0, color: 'var(--accent-primary)', fontSize: '1.4rem' }}>
                  {land.price} ETH
                </h3>
              </div>

              <h4 style={{ marginBottom: '0.5rem' }}>{land.propertyID}</h4>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '0.5rem' }}>
                <MapPin size={16} color="var(--text-secondary)" style={{ marginTop: '4px' }} />
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{land.address}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                <User size={16} color="var(--text-secondary)" />
                <p style={{ fontSize: '0.9rem' }}>Owner: <strong>{land.owner.username}</strong></p>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                <button 
                  className="btn-primary" 
                  style={{ flex: 1 }}
                  onClick={() => navigate(`/search-land?query=${land._id}`)}
                >
                  View Details
                </button>
                <button 
                  className="btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => navigate('/transfer-land', { state: { land, initiatePurchase: true } })}
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sales;
