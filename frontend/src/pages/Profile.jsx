import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Edit3, Save, X, Camera, Award, Calendar, Target } from 'lucide-react';
import '../styles/Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || ''
    });
  };

  const handleSave = () => {
    // Here you would typically make an API call to update the user profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase() || 'U';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'student': return '#667eea';
      default: return '#6b7280';
    }
  };

  return (
    <div className="modern-profile-page">
      <div className="profile-hero">
        <div className="hero-background">
          <div className="hero-shapes">
            <div className="hero-shape hero-shape-1"></div>
            <div className="hero-shape hero-shape-2"></div>
          </div>
        </div>
        <div className="hero-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <span>{getInitials(user?.name)}</span>
              <button className="avatar-edit-btn">
                <Camera size={16} />
              </button>
            </div>
            <h1 className="profile-name">{user?.name}</h1>
            <div className="profile-role-badge" style={{ backgroundColor: getRoleColor(user?.role) }}>
              <Shield size={16} />
              <span>{user?.role}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-container">
        <div className="profile-grid">
          {/* Profile Information Card */}
          <div className="profile-card">
            <div className="card-header">
              <h2>Profile Information</h2>
              {!isEditing ? (
                <button onClick={handleEdit} className="edit-btn">
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button onClick={handleSave} className="save-btn">
                    <Save size={16} />
                    Save
                  </button>
                  <button onClick={handleCancel} className="cancel-btn">
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="profile-form">
              <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="form-value">{user?.name}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="form-value">{user?.email}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Shield size={16} />
                  Account Type
                </label>
                <div className="form-value">
                  <span className="role-badge" style={{ backgroundColor: getRoleColor(user?.role) }}>
                    {user?.role}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} />
                  Member Since
                </label>
                <div className="form-value">
                  {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="profile-card">
            <div className="card-header">
              <h2>Quick Stats</h2>
            </div>

            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-icon quizzes-icon">
                  <Target size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-number">12</div>
                  <div className="stat-label">Quizzes Taken</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon score-icon">
                  <Award size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-number">85%</div>
                  <div className="stat-label">Average Score</div>
                </div>
              </div>
            </div>

            <div className="achievements-section">
              <h3>Recent Achievements</h3>
              <div className="achievements-list">
                <div className="achievement-item">
                  <div className="achievement-icon">
                    <Award size={20} />
                  </div>
                  <div className="achievement-content">
                    <h4>Quiz Master</h4>
                    <p>Completed 10 quizzes</p>
                  </div>
                </div>
                <div className="achievement-item">
                  <div className="achievement-icon">
                    <Target size={20} />
                  </div>
                  <div className="achievement-content">
                    <h4>High Scorer</h4>
                    <p>Achieved 90%+ score</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


