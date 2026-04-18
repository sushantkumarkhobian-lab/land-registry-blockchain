import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AgentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState('registrations'); // registrations, transfers
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setDataList([]); // Clear previous data to prevent layout/data mismatch
    try {
      const endpoint = tab === 'registrations' ? '/api/agent/pending-registrations' : '/api/agent/pending-transfers';
      const { data } = await axios.get(endpoint);
      setDataList(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tab]);

  const handleApproveRegistration = async (id) => {
    try {
      await axios.post(`/api/agent/approve-registration/${id}`);
      fetchData(); // Refresh list
      alert('Registration approved and added to blockchain!');
    } catch (err) {
      alert('Error approving registration');
    }
  };

  const handleApproveTransfer = async (id) => {
    try {
      await axios.post(`/api/agent/approve-transfer/${id}`);
      fetchData();
      alert('Transfer approved and blockchain entry created!');
    } catch (err) {
      alert('Error approving transfer');
    }
  };

  return (
    <div className="animate-fade-in" style={{ minHeight: '80vh', backgroundImage: "url('/dashboard-bg.png')", backgroundSize: 'cover', backgroundAttachment: 'fixed', padding: '2rem', borderRadius: '16px' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h2>Government Agent Portal</h2>
        <button className="btn-secondary" onClick={() => navigate('/agent-audit')}>
          <CheckCircle size={16} style={{ marginRight: '8px' }} /> Ensure Blockchain Integrity
        </button>
      </div>

      <div className="tabs" style={{ maxWidth: '400px' }}>
        <div className={`tab ${tab === 'registrations' ? 'active' : ''}`} onClick={() => setTab('registrations')}>
          Pending Registrations
        </div>
        <div className={`tab ${tab === 'transfers' ? 'active' : ''}`} onClick={() => setTab('transfers')}>
          Pending Transfers
        </div>
      </div>

      {loading ? (
        <div className="flex-center flex-col" style={{ padding: '3rem' }}>
          <div className="spinner" style={{ marginBottom: '1rem' }}></div>
          <p>Fetching records...</p>
        </div>
      ) : dataList.length === 0 ? (
        <div className="glass-card flex-center flex-col" style={{ padding: '3rem' }}>
          <Clock size={40} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
          <p>All clear. No pending {tab} found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {dataList.map((item) => (
            <div key={item._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>

              {tab === 'registrations' ? (
                <>
                  <h4 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', overflowWrap: 'anywhere' }}>Property: {item.propertyID}</h4>
                  <p style={{ overflowWrap: 'anywhere' }}><strong>Owner:</strong> {item.owner?.username} ({item.owner?.email})</p>
                  <p><strong>Address:</strong> {item.address}</p>
                  <p><strong>Area:</strong> {item.area} sq ft</p>
                  <a href={`/api/agent/view-document/${item.documentCID}?token=${user?.token}`} target="_blank" rel="noreferrer" style={{ margin: '1rem 0', display: 'inline-flex', alignItems: 'center', color: 'var(--accent-secondary)' }}>
                    Review Original (Decrypted) Document
                  </a>
                  <button className="btn-primary" style={{ marginTop: 'auto' }} onClick={() => handleApproveRegistration(item._id)}>
                    Approve & Finalize Block
                  </button>
                </>
              ) : (
                <>
                  <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '1rem' }}>Transfer Request</h4>
                  <p style={{ overflowWrap: 'anywhere' }}><strong>Property ID:</strong> {item.landId?.propertyID || 'N/A'}</p>
                  <p><strong>Land Internal ID:</strong> {item.landId?._id || 'N/A'}</p>
                  <p><strong>From:</strong> {item.fromUser?.username || 'Unknown'}</p>
                  <p><strong>To:</strong> {item.toUser?.username || 'Unknown'}</p>
                  <p style={{ margin: '1rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Ensure both parties have authorized the transfer via out-of-band communication.
                  </p>
                  <button className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-secondary-hover))', marginTop: 'auto' }} onClick={() => handleApproveTransfer(item._id)}>
                    Approve Transfer Request
                  </button>
                </>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
