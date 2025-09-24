import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, LogIn, Mail, Lock, ArrowLeft, Sparkles } from 'lucide-react';
import '../styles/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear errors when component mounts or form changes
  useEffect(() => {
    clearError();
    setErrors({});
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const result = await login(formData);
    setIsLoading(false);

    if (result.success) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="modern-auth-page">
      <div className="auth-background">
        <div className="auth-background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <Link to="/" className="auth-back-btn">
        <ArrowLeft size={20} />
        Back to Home
      </Link>

      <div className="modern-auth-container">
        <div className="modern-auth-card">
          <div className="auth-card-header">
            <div className="auth-icon-wrapper">
              <LogIn size={28} />
            </div>
            <h1 className="auth-main-title">Welcome Back!</h1>
            <p className="auth-main-subtitle">
              Sign in to continue your learning journey with GALTech Quiz Hub
            </p>
          </div>

          {error && (
            <div className="modern-auth-error">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="modern-auth-form">
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className={`modern-input ${errors.email ? 'error' : ''}`}
                />
              </div>
              {errors.email && (
                <span className="input-error">{errors.email}</span>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`modern-input ${errors.password ? 'error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <span className="input-error">{errors.password}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`modern-submit-btn ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Signing you in...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                  <Sparkles size={16} className="btn-sparkle" />
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>New to GALTech Quiz Hub?</span>
          </div>

          <Link to="/register" className="auth-switch-btn">
            Create your account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
