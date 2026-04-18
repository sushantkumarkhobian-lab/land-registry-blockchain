import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Home, PlusCircle, CheckCircle, ArrowRight, Wallet, Copy, ExternalLink, ShieldCheck, ShoppingBag } from 'lucide-react';

import { AuthContext } from '../../context/AuthContext';

import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = React.useContext(AuthContext);
  const [lands, setLands] = useState([]);
  const [showTokens, setShowTokens] = useState(false);

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const { data } = await axios.get('/api/land/my-lands');
        setLands(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load lands", error);
        setLoading(false);
      }
    };
    fetchLands();
  }, []);

  const handleSell = async (landId) => {
    const price = prompt('Enter sale price:');
    if (!price) return;
    try {
      await axios.post(`/api/land/sell/${landId}`, { price: Number(price) });
      alert('Land placed for sale!');
      window.location.reload();
    } catch(err) {
      alert(err.response?.data?.message || 'Error selling land');
    }
  };

  const handleRemoveSale = async (landId) => {
    if (!window.confirm('Are you sure you want to remove this property from the marketplace?')) return;
    try {
      await axios.post(`/api/land/remove-sale/${landId}`);
      alert('Property removed from marketplace!');
      window.location.reload();
    } catch(err) {
      alert(err.response?.data?.message || 'Error removing from sale');
    }
  };


  return (
    <div className="animate-fade-in" style={{ minHeight: '80vh', backgroundImage: "url('/dashboard-bg.png')", backgroundSize: 'cover', backgroundAttachment: 'fixed', padding: '2rem', borderRadius: '16px' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h2>My Properties</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={() => navigate('/search-land')} style={{ background: 'transparent', border: '1px solid var(--accent-secondary)', padding: '0.6rem 1rem' }}>
             Search System
          </button>
          <button className="btn-secondary" onClick={() => navigate('/map-selection')} style={{ background: 'transparent', border: '1px solid var(--accent-primary)', padding: '0.6rem 1rem' }}>
             Map Geography
          </button>
          <button className="btn-secondary" onClick={() => navigate('/marketplace')} style={{ background: 'var(--accent-secondary)', padding: '0.6rem 1rem' }}>
             <ShoppingBag size={18} style={{ marginRight: '8px' }} />
             Sales Marketplace
          </button>
          <button className="btn-primary" onClick={() => navigate('/register-land')} style={{ padding: '0.6rem 1.2rem' }}>
            <PlusCircle size={18} style={{ marginRight: '8px' }} />
            Register New Land
          </button>
        </div>

      </div>

      {user?.walletAddress && (
        <div 
          className="glass-card animate-fade-in" 
          onClick={() => setShowTokens(!showTokens)}
          style={{ 
            marginBottom: '2rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '2rem', 
            background: 'rgba(16, 185, 129, 0.05)', 
            borderColor: showTokens ? 'var(--accent-primary)' : 'rgba(16, 185, 129, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            borderWidth: showTokens ? '2px' : '1px'
          }}
        >
          <div style={{ background: 'var(--accent-primary)', padding: '1.25rem', borderRadius: '12px' }}>
            <Wallet size={32} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>System Wallet (Digital Identity)</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.5rem' }}>
              <code style={{ fontSize: '1rem', background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: '6px' }}>
                {user.walletAddress}
              </code>
              <button 
                onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(user.walletAddress); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                title="Copy Address"
              >
                <Copy size={16} />
              </button>
            </div>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Click to view your owned digital property tokens (NFTs).
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> Secured by Ethereum
            </span>
          </div>
        </div>
      )}

      {showTokens && (
        <div className="glass-card animate-slide-down" style={{ marginBottom: '2rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--accent-primary)' }}>
          <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <ShieldCheck size={20} /> Your Owned Land Tokens (ERC-721 NFTs)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {lands.filter(l => l.isVerified && l.tokenId !== undefined).length > 0 ? (
              lands.filter(l => l.isVerified && l.tokenId !== undefined).map(land => (
                <div key={land._id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--accent-primary)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Token ID</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>#{land.tokenId}</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--accent-secondary)' }}>Prop ID: {land.propertyID}</div>
                </div>
              ))
            ) : (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>
                No minted tokens found. Tokens are generated after agent approval.
              </p>
            )}
          </div>
        </div>
      )}


      {loading ? (
        <p>Loading your properties...</p>
      ) : lands.length === 0 ? (
        <div className="glass-card flex-center flex-col" style={{ padding: '4rem 2rem' }}>
          <Home size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-secondary)' }}>No Properties Found</h3>
          <p>You haven't registered any lands yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {lands.map((land) => (
            <div key={land._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: 'var(--accent-primary)' }}>ID: {land.propertyID}</h4>
                {land.isVerified ? 
                  <div style={{ display: 'flex', flexDirecton: 'column', alignItems: 'flex-end' }}>
                     <CheckCircle size={20} color="var(--success)" title="Verified" />
                     {land.tokenId !== undefined && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--accent-secondary)', fontWeight: 'bold', marginTop: '4px' }}>
                           NFT #{land.tokenId}
                        </span>
                     )}
                  </div>
                  : 
                  <span style={{ fontSize: '0.8rem', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                    {land.status}
                  </span>
                }
              </div>
              <p><strong>Address:</strong> {land.address}</p>
              <p><strong>Area:</strong> {land.area} sq ft</p>
              {land.metadataCID && (
                <p style={{ fontSize: '0.85rem', marginTop: '10px' }}>
                  <ExternalLink size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  <a href={`https://gateway.pinata.cloud/ipfs/${land.metadataCID}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-secondary)' }}>
                    Encrypted Blockchain Metadata
                  </a>
                </p>
              )}

              <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <a href={`https://gateway.pinata.cloud/ipfs/${land.documentCID}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem' }}>
                   View Document
                 </a>
                 {land.isVerified && land.status === 'Registered' && !land.isForSale && (
                   <div style={{display: 'flex', gap: '8px'}}>
                     <button 
                       className="btn-primary" 
                       style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                       onClick={() => navigate('/transfer-land', { state: { land } })}
                     >
                       Transfer
                     </button>
                     <button 
                       className="btn-secondary" 
                       style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: '#9333ea' }}
                       onClick={() => handleSell(land._id)}
                     >
                       Sell
                     </button>
                   </div>
                 )}
                 {land.isForSale && (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <span style={{color: '#9333ea', fontWeight: 'bold'}}>Listed for sale ({land.price} ETH)</span>
                     <button 
                       className="btn-secondary" 
                       style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', background: 'var(--error)' }}
                       onClick={() => handleRemoveSale(land._id)}
                     >
                       Remove
                     </button>
                   </div>
                 )}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
