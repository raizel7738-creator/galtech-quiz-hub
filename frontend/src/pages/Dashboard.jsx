import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Calendar, Award, BookOpen, Settings, LogOut, BarChart3, Code, TrendingUp, Zap, Target, Clock, Star, ArrowRight, Activity } from 'lucide-react';
import { attemptHistoryAPI, quizSessionAPI, codingSubmissionAPI } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout, isAdmin, isStudent } = useAuth();
  const [stats, setStats] = useState({
    quizzesTaken: 0,
    averageScore: 0,
    challengesCompleted: 0,
    totalPoints: 0
  });
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch quiz attempts from localStorage as fallback
      const quizAttempts = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
      let quizzesTaken = quizAttempts.length;
      let totalScore = 0;
      let totalPoints = 0;

      if (quizAttempts.length > 0) {
        totalScore = quizAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
        totalPoints = quizAttempts.reduce((sum, attempt) => sum + (attempt.points || 0), 0);
      }

      const averageScore = quizzesTaken > 0 ? Math.round(totalScore / quizzesTaken) : 0;

      setStats({
        quizzesTaken,
        averageScore,
        challengesCompleted: 0, // will update after API call
        totalPoints
      });

      // Build recent activity from local storage as an immediate fallback
      const localRecent = [...quizAttempts]
        .sort((a, b) => new Date(b.completedAt || b.createdAt || 0) - new Date(a.completedAt || a.createdAt || 0))
        .slice(0, 5)
        .map(a => ({
          id: a.sessionId || a._id || Math.random().toString(36).slice(2),
          date: new Date(a.completedAt || a.createdAt || Date.now()).toLocaleString(),
          title: a.category?.name || 'Quiz Attempt',
          subtitle: `${Math.round(a.score?.percentage ?? a.score ?? 0)}% score`,
          kind: 'quiz'
        }));
      setRecent(localRecent);

      // Fetch coding challenge submissions for the current user
      try {
        const codingRes = await codingSubmissionAPI.getMySubmissions();
        const codingAttempts = codingRes.data?.submissions || codingRes.data || [];
        // Count user's coding challenges submissions (include submitted and under_review as well)
        // We exclude only hard rejections if you prefer; include everything else so users see progress.
        const challengesCompleted = codingAttempts.filter(
          a => ['submitted', 'under_review', 'approved', 'needs_revision', 'completed', 'reviewed'].includes(a.status)
        ).length;

        setStats(prev => ({
          ...prev,
          challengesCompleted
        }));

        // Add coding challenges to recent activity (show all statuses to reflect latest action)
        const codingRecent = codingAttempts
          .sort((a, b) => new Date(b.submissionTime || b.createdAt || 0) - new Date(a.submissionTime || a.createdAt || 0))
          .slice(0, 5)
          .map(a => ({
            id: a._id,
            date: new Date(a.submissionTime || a.createdAt || Date.now()).toLocaleString(),
            title: a.challenge?.title || 'Coding Challenge',
            subtitle: `${a.language} • ${a.status}`,
            kind: 'challenge'
          }));

        setRecent(prev => [...codingRecent, ...prev].slice(0, 5));
      } catch (codingError) {
        // Ignore coding API errors, fallback to local
      }

      // Also try to fetch quiz stats from API as a secondary attempt
      try {
        const [quizHistoryResponse, attemptHistoryResponse] = await Promise.allSettled([
          quizSessionAPI.getQuizHistory(),
          attemptHistoryAPI.getAttemptHistory()
        ]);

        if (quizHistoryResponse.status === 'fulfilled' && quizHistoryResponse.value.success) {
          const quizSessions = quizHistoryResponse.value.data || [];
          if (quizSessions.length > 0) {
            const completedSessions = quizSessions.filter(session => session.status === 'completed');
            const apiTotalScore = completedSessions.reduce((sum, session) => sum + (session.score?.percentage || 0), 0);
            const apiAverageScore = completedSessions.length > 0 ? Math.round(apiTotalScore / completedSessions.length) : 0;

            setStats(prev => ({
              ...prev,
              quizzesTaken: quizSessions.length,
              averageScore: apiAverageScore
            }));
          }
        }

        if (attemptHistoryResponse.status === 'fulfilled' && attemptHistoryResponse.value.success) {
          const attemptsRaw = attemptHistoryResponse.value.data;
          const attempts = attemptsRaw?.attempts || attemptsRaw?.data?.attempts || attemptsRaw || [];
          if (attempts.length > 0) {
            const apiTotalPoints = attempts.reduce((sum, attempt) => sum + (attempt.score?.earnedPoints || 0), 0);

            setStats(prev => ({
              ...prev,
              totalPoints: apiTotalPoints
            }));

            // Prefer API attempts for recent activity if available
            const apiRecent = [...attempts]
              .sort((a, b) => new Date(b.completedAt || b.createdAt || 0) - new Date(a.completedAt || a.createdAt || 0))
              .slice(0, 5)
              .map(a => ({
                id: a._id,
                date: new Date(a.completedAt || a.createdAt || Date.now()).toLocaleString(),
                title: a.category?.name || 'Quiz Attempt',
                subtitle: `${Math.round(a.score?.percentage ?? 0)}% score`,
                kind: 'quiz'
              }));
            setRecent(apiRecent);
          }
        }
      } catch (apiError) {
        // Ignore API errors, fallback to local
      }

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="modern-dashboard">
      <div className="dashboard-hero">
        <div className="hero-background">
          <div className="hero-shapes">
            <div className="hero-shape hero-shape-1"></div>
            <div className="hero-shape hero-shape-2"></div>
            <div className="hero-shape hero-shape-3"></div>
          </div>
        </div>
        <div className="hero-content">
          <div className="welcome-section">
            <div className="welcome-badge">
              <Star size={16} className="badge-icon" />
              <span>Welcome back!</span>
            </div>
            <h1 className="hero-title">
              {getGreeting()}, <span className="name-highlight">{user?.name}</span>!
            </h1>
            <p className="hero-subtitle">
              Ready to continue your learning journey? Let's make today count.
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-container">

        {/* Quick Actions Grid */}
        <div className="quick-actions-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions-grid">
            <Link to="/categories" className="action-card featured">
              <div className="card-icon quiz-icon">
                <BookOpen size={24} />
              </div>
              <div className="card-content">
                <h3>Start Quiz</h3>
                <p>Browse categories and begin learning</p>
              </div>
              <ArrowRight size={20} className="card-arrow" />
            </Link>

            <Link to="/coding-challenges" className="action-card">
              <div className="card-icon code-icon">
                <Code size={24} />
              </div>
              <div className="card-content">
                <h3>Coding Challenges</h3>
                <p>Practice programming skills</p>
              </div>
              <ArrowRight size={20} className="card-arrow" />
            </Link>

            <Link to="/quiz-history" className="action-card">
              <div className="card-icon history-icon">
                <Calendar size={24} />
              </div>
              <div className="card-content">
                <h3>View History</h3>
                <p>Review past attempts</p>
              </div>
              <ArrowRight size={20} className="card-arrow" />
            </Link>

            {isStudent() && (
              <Link to="/analytics" className="action-card">
                <div className="card-icon analytics-icon">
                  <BarChart3 size={24} />
                </div>
                <div className="card-content">
                  <h3>Analytics</h3>
                  <p>Track your progress</p>
                </div>
                <ArrowRight size={20} className="card-arrow" />
              </Link>
            )}

            {isAdmin() && (
              <Link to="/admin/dashboard" className="action-card admin-card">
                <div className="card-icon admin-icon">
                  <Settings size={24} />
                </div>
                <div className="card-content">
                  <h3>Admin Panel</h3>
                  <p>Manage platform</p>
                </div>
                <ArrowRight size={20} className="card-arrow" />
              </Link>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <h2 className="section-title">Your Progress</h2>
          <div className="stats-grid">
            <div className="stat-card quizzes">
              <div className="stat-icon">
                <Target size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {loading ? '...' : stats.quizzesTaken}
                </div>
                <div className="stat-label">Quizzes Taken</div>
                <div className="stat-trend positive">
                  <TrendingUp size={16} />
                  <span>+12% this week</span>
                </div>
              </div>
            </div>

            <div className="stat-card score">
              <div className="stat-icon">
                <Award size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {loading ? '...' : `${stats.averageScore}%`}
                </div>
                <div className="stat-label">Average Score</div>
                <div className="stat-trend positive">
                  <TrendingUp size={16} />
                  <span>Improving!</span>
                </div>
              </div>
            </div>

            <div className="stat-card challenges">
              <div className="stat-icon">
                <Zap size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {loading ? '...' : stats.challengesCompleted}
                </div>
                <div className="stat-label">Challenges</div>
                <div className="stat-trend">
                  <Activity size={16} />
                  <span>Keep going!</span>
                </div>
              </div>
            </div>

            <div className="stat-card points">
              <div className="stat-icon">
                <Star size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {loading ? '...' : stats.totalPoints}
                </div>
                <div className="stat-label">Total Points</div>
                <div className="stat-trend positive">
                  <TrendingUp size={16} />
                  <span>Great work!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {recent.length > 0 && (
          <div className="activity-section">
            <div className="section-header">
              <h2 className="section-title">Recent Activity</h2>
              <Link to="/quiz-history" className="view-all-btn">
                View All
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="activity-list">
              {recent.map((item, index) => (
                <div key={item.id || index} className="activity-item">
                  <div className={`activity-icon ${item.kind}`}>
                    {item.kind === 'quiz' ? (
                      <BookOpen size={20} />
                    ) : (
                      <Code size={20} />
                    )}
                  </div>
                  <div className="activity-content">
                    <h4 className="activity-title">{item.title}</h4>
                    <p className="activity-subtitle">{item.subtitle}</p>
                    <div className="activity-meta">
                      <Clock size={14} />
                      <span>{item.date}</span>
                    </div>
                  </div>
                  <div className="activity-badge">
                    {item.kind === 'quiz' ? 'Quiz' : 'Challenge'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;