import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizSessionAPI } from '../services/api';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader, 
  Trophy,
  Award,
  Target,
  Calendar,
  BarChart3,
  Star,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import '../styles/QuizHistory.css';

const QuizHistory = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchQuizHistory();
  }, [filters]);

  const fetchQuizHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await quizSessionAPI.getQuizHistory(filters);
      if (response.success) {
        setSessions(response.data.sessions);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.message || 'Failed to fetch quiz history');
      }
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      setError(error.message || 'Failed to load quiz history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const formatTime = (seconds) => {
    if (typeof seconds !== 'number' || isNaN(seconds)) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreClass = (percentage) => {
    if (percentage >= 90) return 'excellent';
    if (percentage >= 70) return 'good';
    return 'poor';
  };

  const getScoreIcon = (percentage) => {
    if (percentage >= 90) return <Trophy size={20} />;
    if (percentage >= 80) return <Award size={20} />;
    if (percentage >= 60) return <Target size={20} />;
    return <AlertCircle size={20} />;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'completed';
      case 'abandoned': return 'abandoned';
      case 'expired': return 'expired';
      default: return 'completed';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'abandoned': return <XCircle size={16} />;
      case 'expired': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="modern-quiz-history">
        <div className="history-hero">
          <div className="hero-background">
            <div className="hero-shapes">
              <div className="hero-shape hero-shape-1"></div>
              <div className="hero-shape hero-shape-2"></div>
            </div>
          </div>
          <div className="hero-content">
            <h1 className="hero-title">Quiz History</h1>
            <p className="hero-subtitle">Track your learning progress and achievements</p>
          </div>
        </div>
        <div className="history-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your quiz history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modern-quiz-history">
        <div className="history-hero">
          <div className="hero-background">
            <div className="hero-shapes">
              <div className="hero-shape hero-shape-1"></div>
              <div className="hero-shape hero-shape-2"></div>
            </div>
          </div>
          <div className="hero-content">
            <h1 className="hero-title">Quiz History</h1>
            <p className="hero-subtitle">Track your learning progress and achievements</p>
          </div>
        </div>
        <div className="history-container">
          <div className="error-state">
            <div className="error-icon">
              <AlertCircle size={64} />
            </div>
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={() => navigate('/dashboard')} className="secondary-btn">
                <ArrowLeft size={16} />
                Back to Dashboard
              </button>
              <button onClick={fetchQuizHistory} className="primary-btn">
                <Target size={16} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-quiz-history">
      <div className="history-hero">
        <div className="hero-background">
          <div className="hero-shapes">
            <div className="hero-shape hero-shape-1"></div>
            <div className="hero-shape hero-shape-2"></div>
          </div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <BarChart3 size={20} />
            <span>Track Progress</span>
          </div>
          <h1 className="hero-title">Quiz History</h1>
          <p className="hero-subtitle">
            Review your quiz attempts and track your learning progress
          </p>
        </div>
      </div>

      <div className="history-container">
        {/* Header */}
        <div className="history-header">
          <div className="header-content">
            <h1>Your Quiz Journey</h1>
            <p>View your past quiz attempts and performance metrics</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Categories</option>
                <option value="math">Math</option>
                <option value="science">Science</option>
                <option value="history">History</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="abandoned">Abandoned</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Results per page</label>
              <select
                name="limit"
                value={filters.limit}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quiz Sessions List */}
        {sessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <BarChart3 size={64} />
            </div>
            <h3>No Quiz History</h3>
            <p>You haven't taken any quizzes yet. Start your learning journey today!</p>
            <button
              onClick={() => navigate('/categories')}
              className="start-quiz-btn"
            >
              Take Your First Quiz
            </button>
          </div>
        ) : (
          <>
            <div className="history-list">
              {sessions.map((session) => (
                <div key={session.sessionId} className="history-item">
                  <div className="item-header">
                    <div className="item-title">
                      <h3>
                        {session.category?.name || "Unknown Category"}
                      </h3>
                      <span className={`status-badge ${getStatusClass(session.status)}`}>
                        {getStatusIcon(session.status)}
                        {session.status?.charAt(0).toUpperCase() + session.status?.slice(1) || "Unknown"}
                      </span>
                    </div>
                    <div className="item-date">
                      <Calendar size={16} />
                      {formatDate(session.completedAt)}
                    </div>
                  </div>
                  
                  <div className="item-stats">
                    <div className="stat-item">
                      <div className={`stat-value ${getScoreClass(session.score?.percentage || 0)}`}>
                        {getScoreIcon(session.score?.percentage || 0)}
                        {session.score?.percentage || 0}%
                      </div>
                      <div className="stat-label">Score</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">
                        {session.score?.correctAnswers || 0}/{session.score?.totalQuestions || 0}
                      </div>
                      <div className="stat-label">Correct</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">
                        {session.score?.earnedPoints || 0}/{session.score?.totalPoints || 0}
                      </div>
                      <div className="stat-label">Points</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">
                        {formatTime(session.duration)}
                      </div>
                      <div className="stat-label">Duration</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="pagination-btn"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`pagination-btn ${pageNum === pagination.currentPage ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuizHistory;