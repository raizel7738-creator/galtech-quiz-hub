import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Wifi, WifiOff, Loader, User, LogOut, Menu, X, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import '../styles/Header.css'

const Header = ({ isConnected, connectionStatus }) => {
  const { user, logout, isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  const handleLogout = async () => {
    await logout()
    setIsUserMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase() || 'U'
  }
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi size={16} />
      case 'disconnected':
        return <WifiOff size={16} />
      case 'checking':
        return <Loader size={16} className="animate-spin" />
      default:
        return <WifiOff size={16} />
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Backend Connected'
      case 'disconnected':
        return 'Backend Disconnected'
      case 'checking':
        return 'Checking Connection...'
      default:
        return 'Unknown Status'
    }
  }

  return (
    <header className="gradient-header">
      <div className="header-background">
        <div className="header-shapes">
          <div className="header-shape header-shape-1"></div>
          <div className="header-shape header-shape-2"></div>
        </div>
      </div>
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <div className="logo-icon">
            <BookOpen size={24} />
          </div>
          <span className="logo-text">GALTech Quiz Hub</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/categories" className="nav-link">Categories</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link">Register</Link>
              </>
            )}
          </div>

          {/* User Menu */}
          {isAuthenticated && (
            <div className="user-menu-container" ref={userMenuRef}>
              <button 
                onClick={toggleUserMenu}
                className="user-menu-trigger"
              >
                <div className="user-avatar">
                  <span>{getInitials(user?.name)}</span>
                </div>
                <div className="user-info">
                  <span className="user-name">{user?.name}</span>
                  <span className={`user-role ${user?.role}`}>{user?.role}</span>
                </div>
                <ChevronDown size={16} className={`chevron ${isUserMenuOpen ? 'open' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div 
                  style={{
                    position: 'fixed',
                    top: '70px',
                    right: '240px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    minWidth: '200px',
                    zIndex: 999999,
                    display: 'block',
                    visibility: 'visible',
                    opacity: '1',
                    overflow: 'hidden'
                  }}
                >
                  <Link 
                    to="/profile" 
                    onClick={() => setIsUserMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '16px 20px',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      color: '#374151',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      borderRadius: '0'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                      e.target.style.color = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#374151';
                    }}
                  >
                    <User size={16} />
                    Profile
                  </Link>
                  <button 
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '16px 20px',
                      background: 'transparent',
                      border: 'none',
                      borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                      textAlign: 'left',
                      color: '#ef4444',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      borderRadius: '0'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                      e.target.style.color = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#ef4444';
                    }}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Connection Status */}
          <div className={`connection-status ${connectionStatus}`}>
            {getStatusIcon()}
            <span className="status-text">{getStatusText()}</span>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMobileMenu}
          className="mobile-menu-btn"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-nav">
          <div className="mobile-nav-content">
            <Link to="/" className="mobile-nav-link" onClick={toggleMobileMenu}>
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="mobile-nav-link" onClick={toggleMobileMenu}>
                  Dashboard
                </Link>
                <Link to="/categories" className="mobile-nav-link" onClick={toggleMobileMenu}>
                  Categories
                </Link>
                <Link to="/profile" className="mobile-nav-link" onClick={toggleMobileMenu}>
                  Profile
                </Link>
                <button onClick={handleLogout} className="mobile-nav-link logout">
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-nav-link" onClick={toggleMobileMenu}>
                  Login
                </Link>
                <Link to="/register" className="mobile-nav-link" onClick={toggleMobileMenu}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
