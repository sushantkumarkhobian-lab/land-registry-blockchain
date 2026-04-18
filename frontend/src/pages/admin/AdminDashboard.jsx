import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Map, Clock, Shield, Trash2, CheckCircle, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const [tab, setTab] = useState('lands'); // lands, agents, requests, logs
  const [data, setData] = useState([]);
  const [portStatus, setPortStatus] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (tab === 'lands') endpoint = '/api/admin/lands';
      else if (tab === 'agents') endpoint = '/api/admin/agents';
      else if (tab === 'requests') endpoint = '/api/admin/agents'; // Filtered below
      else if (tab === 'logs') endpoint = '/api/admin/logs';

      const res = await axios.get(endpoint);
      if (tab === 'logs') {
        setData(res.data.logs);
        setPortStatus(res.data.portStatus);
      } else if (tab === 'requests') {
        setData(res.data.filter(a => a.status === 'pending'));
      } else {
        setData(res.data);
      }
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tab]);

  const handleRemoveAgent = async (id) => {
    if (!window.confirm("Are you sure you want to remove this agent?")) return;
    try {
      await axios.delete(`/api/admin/agents/${id}`);
      fetchData();
    } catch (err) {
      alert("Removal failed");
    }
  };

  const handleAcceptAgent = async (id) => {
    try {
      await axios.post(`/api/admin/agents/${id}/accept`);
      fetchData();
      alert("Agent accepted!");
    } catch (err) {
      alert("Acceptance failed");
    }
  };

  const handleRejectAgent = async (id) => {
    if (!window.confirm("Are you sure you want to reject this agent?")) return;
    try {
      await axios.post(`/api/admin/agents/${id}/reject`);
      fetchData();
      alert("Agent rejected!");
    } catch (err) {
      alert("Rejection failed");
    }
  };

  return (
    <div className="animate-fade-in" style={{ minHeight: '80vh', backgroundImage: "url('/dashboard-bg.png')", backgroundSize: 'cover', backgroundAttachment: 'fixed', padding: '2rem', borderRadius: '16px' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={32} color="var(--accent-secondary)" />
          System Administrator Panel
        </h2>
      </div>

      <div className="tabs" style={{ marginBottom: '2rem' }}>
        <div className={`tab ${tab === 'lands' ? 'active' : ''}`} onClick={() => setTab('lands')}>
          <Map size={18} style={{marginRight: '8px'}}/> All Lands
        </div>
        <div className={`tab ${tab === 'agents' ? 'active' : ''}`} onClick={() => setTab('agents')}>
          <Users size={18} style={{marginRight: '8px'}}/> Manage Agents
        </div>
        <div className={`tab ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')}>
          <Clock size={18} style={{marginRight: '8px'}}/> Agent Requests
        </div>
        <div className={`tab ${tab === 'logs' ? 'active' : ''}`} onClick={() => setTab('logs')}>
          <Activity size={18} style={{marginRight: '8px'}}/> System Logs
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: '200px' }}>Loading...</div>
      ) : (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          {tab === 'lands' && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Property ID</th>
                    <th>Owner</th>
                    <th>Address</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(land => (
                    <tr key={land._id}>
                      <td style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{land.propertyID}</td>
                      <td>{land.owner?.username} ({land.owner?.email})</td>
                      <td>{land.address}</td>
                      <td>{land.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'agents' && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(agent => (
                    <tr key={agent._id}>
                      <td>{agent.username}</td>
                      <td>{agent.email}</td>
                      <td>
                        <span style={{ 
                          color: agent.status === 'accepted' ? 'var(--success)' : (agent.status === 'rejected' ? 'var(--error)' : 'var(--accent-secondary)'),
                          background: agent.status === 'accepted' ? 'rgba(16, 185, 129, 0.1)' : (agent.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(236, 72, 153, 0.1)'),
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          {agent.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-secondary" 
                          style={{ 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            color: 'var(--error)', 
                            border: '1px solid var(--error)', 
                            padding: '8px',
                            minWidth: 'auto',
                            boxShadow: 'none'
                          }} 
                          onClick={() => handleRemoveAgent(agent._id)}
                          title="Remove Agent"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'requests' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {data.length === 0 ? <p>No pending requests.</p> : data.map(req => (
                <div key={req._id} className="glass-card" style={{ border: '1px solid var(--accent-secondary)' }}>
                  <h4>{req.username}</h4>
                  <p style={{ overflowWrap: 'anywhere', marginBottom: '1rem' }}>{req.email}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <a href={req.officialDocument} target="_blank" rel="noreferrer" style={{fontSize: '0.85rem', color: 'var(--accent-primary)'}}>View Official Document</a>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn-primary" onClick={() => handleAcceptAgent(req._id)} style={{ flex: 1, padding: '8px' }}>
                        <CheckCircle size={16} style={{marginRight: '5px'}}/> Accept
                      </button>
                      <button className="btn-secondary" onClick={() => handleRejectAgent(req._id)} style={{ flex: 1, padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid var(--error)' }}>
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'logs' && (
            <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }}>
               <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {portStatus.map(p => (
                    <div key={p.port} className="glass-card" style={{ flex: '1', minWidth: '150px', textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Port {p.port}</div>
                       <div style={{ fontWeight: 'bold' }}>{p.service}</div>
                       <div style={{ color: 'var(--success)', fontSize: '0.9rem' }}>● {p.status}</div>
                    </div>
                  ))}
               </div>
               <div className="table-container">
                  <table style={{ fontSize: '0.9rem' }}>
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>User</th>
                        <th>Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((log, i) => (
                        <tr key={i}>
                          <td>{new Date(log.createdAt).toLocaleString()}</td>
                          <td>{log.username || 'System'}</td>
                          <td>{log.activity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
