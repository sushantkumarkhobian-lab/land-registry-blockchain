import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Home, User, Wallet } from 'lucide-react';


const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav} className="glass-card">
      <div className="container flex-between" style={{ padding: '0 2rem' }}>
        <Link to="/" style={styles.logo}>
          <Home style={{ marginRight: '8px' }} />
          Land Registry System
        </Link>
        <div style={styles.links}>
          {user ? (
            <>
              <span style={{ color: 'var(--text-secondary)', marginRight: '20px' }}>
                <User size={18} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> 
                {user.username} ({user.role})
              </span>
              {user.walletAddress && (
                <span style={{ 
                  color: 'var(--accent-primary)', 
                  marginRight: '20px', 
                  fontSize: '0.85rem', 
                  display: 'flex', 
                  alignItems: 'center',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  <Wallet size={14} style={{ marginRight: '6px' }} />
                  {`${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(38)}`}
                </span>
              )}

              <button className="btn-primary" onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>
                <LogOut size={16} style={{ marginRight: '6px' }} />
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 1000,
    borderRadius: 0,
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    height: '70px',
    display: 'flex',
    alignItems: 'center'
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center'
  },
  links: {
    display: 'flex',
    alignItems: 'center'
  }
};

export default Navbar;
