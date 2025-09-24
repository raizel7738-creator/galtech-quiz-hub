import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { categoriesAPI, questionsAPI, attemptHistoryAPI } from '../services/api';
import { Settings, BookOpen, FilePlus2, Users, BarChart3, Filter, Calendar, Loader, Shield, TrendingUp, Award, Target, Zap, Star, Plus, Eye, Edit } from 'lucide-react';
import '../styles/AdminDashboard.css';
import AdminCategories from './AdminCategories';
import AdminQuestions from './AdminQuestions';
import AdminCodingChallenges from './AdminCodingChallenges';
import AdminUsers from './AdminUsers';
import EnhancedQuizHistory from './EnhancedQuizHistory';
import ErrorBoundary from '../components/ErrorBoundary';
import AdminCodingSubmissions from './AdminCodingSubmissions';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [attempts, setAttempts] = useState([]);
  const [filters, setFilters] = useState({ beginDate: '', endDate: '', status: 'any', client: 'any' });
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => { loadData(); }, []);
  useEffect(() => { fetchAttempts(); }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, qs, atts] = await Promise.allSettled([
        categoriesAPI.getAllCategories(),
        questionsAPI.getAllQuestions({ page: 1, limit: 1 }),
        attemptHistoryAPI.getAttemptHistory({ limit: 20 })
      ]);
      if (cats.status === 'fulfilled') setCategories(cats.value.data.categories || []);
      if (qs.status === 'fulfilled') setQuestionCount(qs.value.data?.pagination?.totalQuestions || qs.value.data?.data?.pagination?.totalQuestions || 0);
      if (atts.status === 'fulfilled') {
        const a = atts.value.data?.data?.attempts || atts.value.data?.attempts || atts.value.data || [];
        setAttempts(a);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAttempts = async () => {
    try {
      const params = { limit: 50 };
      if (filters.beginDate) params.startDate = filters.beginDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.status !== 'any') params.status = filters.status;
      if (filters.client !== 'any') params.categoryId = filters.client;
      
      const response = await attemptHistoryAPI.getAttemptHistory(params);
      const a = response.data?.data?.attempts || response.data?.attempts || response.data || [];
      setAttempts(a);
    } catch (error) {
      console.error('Error fetching attempts:', error);
    }
  };

  const filteredAttempts = useMemo(() => {
    return attempts.filter(a => {
      const t = new Date(a.completedAt || a.createdAt || Date.now());
      const after = filters.beginDate ? t >= new Date(filters.beginDate) : true;
      const before = filters.endDate ? t <= new Date(filters.endDate) : true;
      return after && before;
    });
  }, [attempts, filters]);

  if (loading) {
    return (
      <div className="modern-admin-dashboard">
        <div className="admin-hero">
          <div className="hero-background">
            <div className="hero-shapes">
              <div className="hero-shape hero-shape-1"></div>
              <div className="hero-shape hero-shape-2"></div>
            </div>
          </div>
          <div className="hero-content">
            <h1 className="hero-title">Admin Dashboard</h1>
            <p className="hero-subtitle">Managing your quiz platform</p>
          </div>
        </div>
        <div className="admin-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-admin-dashboard">
      <div className="admin-hero">
        <div className="hero-background">
          <div className="hero-shapes">
            <div className="hero-shape hero-shape-1"></div>
            <div className="hero-shape hero-shape-2"></div>
            <div className="hero-shape hero-shape-3"></div>
          </div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <Shield size={20} />
            <span>Admin Panel</span>
          </div>
          <h1 className="hero-title">Admin Dashboard</h1>
          <p className="hero-subtitle">
            Manage categories, questions, users, and monitor quiz performance
          </p>
        </div>
      </div>

      <div className="admin-layout">
        <aside className="modern-sidebar">
          <div className="sidebar-header">
            <div className="brand-logo">
              <BookOpen size={24} />
              <span>GALTech Admin</span>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <BarChart3 size={20} />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveTab('categories')} 
              className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            >
              <BookOpen size={20} />
              <span>Categories</span>
            </button>
            <button 
              onClick={() => setActiveTab('questions')} 
              className={`nav-item ${activeTab === 'questions' ? 'active' : ''}`}
            >
              <Target size={20} />
              <span>Questions</span>
            </button>
            <button 
              onClick={() => setActiveTab('attempts')} 
              className={`nav-item ${activeTab === 'attempts' ? 'active' : ''}`}
            >
              <TrendingUp size={20} />
              <span>Quiz Attempts</span>
            </button>
            <button 
              onClick={() => setActiveTab('coding')} 
              className={`nav-item ${activeTab === 'coding' ? 'active' : ''}`}
            >
              <Zap size={20} />
              <span>Coding Challenges</span>
            </button>
            <button 
              onClick={() => setActiveTab('coding_submissions')} 
              className={`nav-item ${activeTab === 'coding_submissions' ? 'active' : ''}`}
            >
              <Award size={20} />
              <span>Submissions</span>
            </button>
            <button 
              onClick={() => setActiveTab('users')} 
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            >
              <Users size={20} />
              <span>Users</span>
            </button>
            <Link to="/dashboard" className="nav-item">
              <Settings size={20} />
              <span>Settings</span>
            </Link>
          </nav>
        </aside>

        <main className="admin-main">
          <div className="admin-header">
            <div className="header-content">
              <h2>Welcome back, {user?.name}!</h2>
              <p>Here's what's happening with your quiz platform today.</p>
            </div>
            <div className="header-actions">
              <button className="action-btn secondary">
                <Eye size={16} />
                View Reports
              </button>
              <button className="action-btn primary">
                <Plus size={16} />
                Create New
              </button>
            </div>
          </div>

          {activeTab === 'dashboard' && (
            <div className="dashboard-content">
              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card categories">
                  <div className="stat-icon">
                    <BookOpen size={20} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{categories.length}</div>
                    <div className="stat-label">Categories</div>
                  </div>
                </div>

                <div className="stat-card questions">
                  <div className="stat-icon">
                    <Target size={20} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{questionCount}</div>
                    <div className="stat-label">Questions</div>
                  </div>
                </div>

                <div className="stat-card attempts">
                  <div className="stat-icon">
                    <BarChart3 size={20} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{attempts.length}</div>
                    <div className="stat-label">Quiz Attempts</div>
                  </div>
                </div>

                <div className="stat-card users">
                  <div className="stat-icon">
                    <Users size={20} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">24</div>
                    <div className="stat-label">Active Users</div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="main-content-grid">
                {/* Filters Section */}
                <div className="filters-section compact">
                  <div className="section-header compact">
                    <h3>
                      <Filter size={18} />
                      Reports & Analytics
                    </h3>
                  </div>
                  <div className="filters-grid compact">
                    <div className="filter-group">
                      <label>Begin Date</label>
                      <div className="date-input">
                        <Calendar size={14} />
                        <input 
                          type="date" 
                          value={filters.beginDate} 
                          onChange={e => setFilters({...filters, beginDate: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div className="filter-group">
                      <label>End Date</label>
                      <div className="date-input">
                        <Calendar size={14} />
                        <input 
                          type="date" 
                          value={filters.endDate} 
                          onChange={e => setFilters({...filters, endDate: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div className="filter-group">
                      <label>Status</label>
                      <select 
                        value={filters.status} 
                        onChange={e => setFilters({...filters, status: e.target.value})}
                        className="filter-select"
                      >
                        <option value="any">Any Status</option>
                        <option value="completed">Completed</option>
                        <option value="in_progress">In Progress</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Category</label>
                      <select 
                        value={filters.client} 
                        onChange={e => setFilters({...filters, client: e.target.value})}
                        className="filter-select"
                      >
                        <option value="any">Any Category</option>
                        {categories.map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Recent Attempts - Compact Table */}
                <div className="attempts-section compact">
                  <div className="section-header compact">
                    <h3>Recent Quiz Attempts</h3>
                    <button className="view-all-btn">View All</button>
                  </div>
                  <div className="attempts-table compact">
                    <div className="table-header">
                      <div className="table-cell">Student</div>
                      <div className="table-cell">Category</div>
                      <div className="table-cell">Date</div>
                      <div className="table-cell">Score</div>
                      <div className="table-cell">Status</div>
                    </div>
                    <div className="table-body">
                      {filteredAttempts.length > 0 ? (
                        filteredAttempts.slice(0, 5).map((attempt, index) => (
                          <div key={attempt._id || index} className="table-row compact">
                            <div className="table-cell">
                              <div className="student-info compact">
                                <div className="student-avatar small">
                                  {(attempt.user?.name || 'S').charAt(0).toUpperCase()}
                                </div>
                                <div className="student-name">{attempt.user?.name || 'Anonymous'}</div>
                              </div>
                            </div>
                            <div className="table-cell">
                              <div className="category-badge small">
                                {attempt.category?.name || 'Unknown'}
                              </div>
                            </div>
                            <div className="table-cell">
                              <div className="date compact">
                                {new Date(attempt.completedAt || attempt.createdAt || Date.now()).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="table-cell">
                              <div className="score compact">{Math.round(attempt.score?.percentage || 0)}%</div>
                            </div>
                            <div className="table-cell">
                              <span className={`status-badge small ${attempt.status || 'draft'}`}>
                                {attempt.status === 'completed' ? 'Done' : 
                                 attempt.status === 'in_progress' ? 'Progress' : 'Draft'}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="table-empty compact">
                          <div className="empty-title">No attempts found</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <ErrorBoundary>
              <AdminCategories />
            </ErrorBoundary>
          )}

          {activeTab === 'questions' && (
            <ErrorBoundary>
              <AdminQuestions />
            </ErrorBoundary>
          )}

          {activeTab === 'attempts' && (
            <ErrorBoundary>
              <EnhancedQuizHistory />
            </ErrorBoundary>
          )}

          {activeTab === 'coding' && (
            <ErrorBoundary>
              <AdminCodingChallenges />
            </ErrorBoundary>
          )}

          {activeTab === 'coding_submissions' && (
            <ErrorBoundary>
              <AdminCodingSubmissions />
            </ErrorBoundary>
          )}

          {activeTab === 'users' && (
            <ErrorBoundary>
              <AdminUsers />
            </ErrorBoundary>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;