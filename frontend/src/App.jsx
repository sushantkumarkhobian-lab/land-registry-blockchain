import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/customer/Dashboard';
import RegisterLand from './pages/customer/RegisterLand';
import TransferLand from './pages/customer/TransferLand';
import SearchLand from './pages/customer/SearchLand';
import MapSelection from './pages/customer/MapSelection';
import Sales from './pages/customer/Sales';

import AgentDashboard from './pages/agent/AgentDashboard';
import Audit from './pages/agent/Audit';
import AdminDashboard from './pages/admin/AdminDashboard';

// Basic wrapper for protecting routes
const ProtectedRoute = ({ children, role }) => {
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
  
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }
  
  if (role && userInfo.role !== role) {
    return <Navigate to="/" replace />; // Or unauthorized page
  }
  
  return children;
};

const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="container" style={{ marginTop: '80px' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* Customer Routes */}
          <Route path="/dashboard" element={<ProtectedRoute role="customer"><Dashboard /></ProtectedRoute>} />
          <Route path="/register-land" element={<ProtectedRoute role="customer"><RegisterLand /></ProtectedRoute>} />
          <Route path="/transfer-land" element={<ProtectedRoute role="customer"><TransferLand /></ProtectedRoute>} />
          <Route path="/search-land" element={<ProtectedRoute role="customer"><SearchLand /></ProtectedRoute>} />
          <Route path="/map-selection" element={<ProtectedRoute role="customer"><MapSelection /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute role="customer"><Sales /></ProtectedRoute>} />


          {/* Agent Routes */}
          <Route path="/agent-dashboard" element={<ProtectedRoute role="agent"><AgentDashboard /></ProtectedRoute>} />
          <Route path="/agent-audit" element={<ProtectedRoute role="agent"><Audit /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin-dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
