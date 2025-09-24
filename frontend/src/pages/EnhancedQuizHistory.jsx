import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { attemptHistoryAPI } from '../services/api';
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
  TrendingDown,
  Filter,
  Eye,
  Star,
  Download,
  Search,
  Users,
  BookOpen,
  TrendingUp,
  Activity
} from 'lucide-react';
import '../styles/QuizHistory.css';

const EnhancedQuizHistory = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('history');
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    page: 1,
    limit: 10,
    sortBy: 'completedAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (activeTab === 'history') {
        const response = await attemptHistoryAPI.getAttemptHistory(filters).catch(err => {
          // Force rendering of error UI inside the component instead of blank page
          const message = err?.response?.data?.message || err.message || 'Failed to fetch attempt history';
          return { success: false, message };
        });
        if (response.success) {
          setAttempts(response.data.attempts);
          setPagination(response.data.pagination);
        } else {
          throw new Error(response.message || 'Failed to fetch attempt history');
        }
      } else if (activeTab === 'stats') {
        const response = await attemptHistoryAPI.getUserStats();
        if (response.success) {
          setStats(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch user statistics');
        }
      } else if (activeTab === 'analytics') {
        const response = await attemptHistoryAPI.getPerformanceAnalytics();
        if (response.success) {
          setAnalytics(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch performance analytics');
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleExport = async (format = 'json') => {
    try {
      const response = await attemptHistoryAPI.exportAttemptHistory({ format });
      if (format === 'csv') {
        // Handle CSV download
        const blob = new Blob([response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quiz-attempts.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // Handle JSON download
        const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quiz-attempts.json';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    try {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return '-';
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (percentage) => {
    if (percentage >= 90) return <Trophy className="text-yellow-500" size={20} />;
    if (percentage >= 80) return <Award className="text-green-500" size={20} />;
    if (percentage >= 60) return <Target className="text-blue-500" size={20} />;
    return <AlertCircle className="text-red-500" size={20} />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'abandoned':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'abandoned':
        return <XCircle size={16} />;
      case 'expired':
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getPerformanceGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    if (percentage >= 45) return 'D+';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl max-w-7xl mt-10">
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin text-blue-600" size={48} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl max-w-7xl mt-10">
        <div className="text-center">
          <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl max-w-7xl mt-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <BarChart3 size={32} />
            Enhanced Quiz History
          </h1>
          <p className="text-gray-600 mt-2">Detailed analytics and performance tracking</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Single Tab Header */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Eye size={16} className="inline mr-2" />
          History
        </button>
      </div>

      {/* History Tab */}
      {activeTab === 'history' && (
        <>
          {/* Filters */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="form-select w-full"
                >
                  <option value="">All Categories</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="form-select w-full"
                >
                  <option value="">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="abandoned">Abandoned</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="form-select w-full"
                >
                  <option value="completedAt">Date</option>
                  <option value="score.percentage">Score</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Results per page
                </label>
                <select
                  name="limit"
                  value={filters.limit}
                  onChange={handleFilterChange}
                  className="form-select w-full"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Attempts List */}
          {attempts.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Attempt History</h3>
              <p className="text-gray-500 mb-6">You haven't completed any quizzes yet.</p>
              <button
                onClick={() => navigate('/categories')}
                className="btn btn-primary"
              >
                Take Your First Quiz
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {attempts.map((attempt) => (
                  <div
                    key={attempt._id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {attempt.category?.name || 'Unknown Category'}
                          </h3>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                            {attempt.user?.name || 'Unknown User'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(attempt.status)}`}>
                            {getStatusIcon(attempt.status)}
                            {attempt.status.charAt(0).toUpperCase() + attempt.status.slice(1)}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            Grade: {getPerformanceGrade(attempt.score.percentage)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                          <div className="text-center">
                            <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${getScoreColor(attempt.score.percentage)}`}>
                              {getScoreIcon(attempt.score.percentage)}
                              {attempt.score.percentage}%
                            </div>
                            <div className="text-xs text-gray-600">Score</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-blue-600">
                              {attempt.score.correctAnswers}/{attempt.score.totalQuestions}
                            </div>
                            <div className="text-xs text-gray-600">Correct</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-green-600">
                              {attempt.score.earnedPoints}/{attempt.score.totalPoints}
                            </div>
                            <div className="text-xs text-gray-600">Points</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-purple-600">
                              {formatTime(attempt.duration)}
                            </div>
                            <div className="text-xs text-gray-600">Duration</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-orange-600">
                              {attempt.performance?.averageTimePerQuestion || 0}s
                            </div>
                            <div className="text-xs text-gray-600">Avg/Question</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-sm text-gray-500 mb-2">
                          <Calendar size={16} className="inline mr-1" />
                          {formatDate(attempt.completedAt)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Session: {(attempt.sessionId || '').slice(-8) || '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            pageNum === pagination.currentPage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Attempts</p>
                  <p className="text-3xl font-bold text-blue-800">{stats.totalAttempts}</p>
                </div>
                <BarChart3 className="text-blue-600" size={32} />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Average Score</p>
                  <p className="text-3xl font-bold text-green-800">{stats.averageScore.toFixed(1)}%</p>
                </div>
                <Target className="text-green-600" size={32} />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Best Score</p>
                  <p className="text-3xl font-bold text-yellow-800">{stats.bestScore}%</p>
                </div>
                <Trophy className="text-yellow-600" size={32} />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Total Time</p>
                  <p className="text-3xl font-bold text-purple-800">{formatTime(stats.totalTimeSpent)}</p>
                </div>
                <Clock className="text-purple-600" size={32} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Completion Rate</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">{stats.completedAttempts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Abandoned</span>
                  <span className="font-semibold text-yellow-600">{stats.abandonedAttempts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Expired</span>
                  <span className="font-semibold text-red-600">{stats.expiredAttempts}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Range</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Best Score</span>
                  <span className="font-semibold text-green-600">{stats.bestScore}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Score</span>
                  <span className="font-semibold text-blue-600">{stats.averageScore.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Worst Score</span>
                  <span className="font-semibold text-red-600">{stats.worstScore}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Time Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg per Attempt</span>
                  <span className="font-semibold text-blue-600">{formatTime(stats.averageTimePerAttempt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Time</span>
                  <span className="font-semibold text-purple-600">{formatTime(stats.totalTimeSpent)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Trends</h3>
            {analytics.trends && analytics.trends.length > 0 ? (
              <div className="space-y-4">
                {analytics.trends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="text-sm text-gray-600">
                        {new Date(trend._id.year, trend._id.month - 1, trend._id.day).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">Avg Score: {trend.averageScore.toFixed(1)}%</span>
                      <span className="text-sm text-gray-600">Attempts: {trend.attemptCount}</span>
                      <span className="text-sm text-gray-600">Avg Time: {formatTime(trend.averageTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No trend data available</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Difficulty Analysis</h3>
              {analytics.difficultyAnalysis && analytics.difficultyAnalysis.length > 0 ? (
                <div className="space-y-3">
                  {analytics.difficultyAnalysis.map((diff, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium capitalize">{diff._id || 'Unknown'}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          {diff.correctAnswers}/{diff.totalQuestions}
                        </span>
                        <span className="text-sm text-gray-600">
                          {((diff.correctAnswers / diff.totalQuestions) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No difficulty data available</p>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Time Analysis</h3>
              {analytics.timeAnalysis && Object.keys(analytics.timeAnalysis).length > 0 ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Avg per Attempt</span>
                    <span className="font-semibold">{formatTime(analytics.timeAnalysis.averageTimePerAttempt || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Fastest Attempt</span>
                    <span className="font-semibold">{formatTime(analytics.timeAnalysis.fastestAttempt || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Slowest Attempt</span>
                    <span className="font-semibold">{formatTime(analytics.timeAnalysis.slowestAttempt || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Avg per Question</span>
                    <span className="font-semibold">{analytics.timeAnalysis.averageTimePerQuestion?.toFixed(1 || 0)}s</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No time data available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedQuizHistory;

