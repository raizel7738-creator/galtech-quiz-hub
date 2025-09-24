import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { codingChallengeAPI } from '../services/api';
import { 
  Code, 
  Search, 
  Filter, 
  Plus,
  Loader,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  BarChart3,
  Clock,
  Target,
  Users,
  Award,
  Calendar,
  Tag
} from 'lucide-react';

const AdminCodingChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    difficulty: '',
    language: '',
    status: 'all'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalChallenges: 0
  });
  const [selectedChallenges, setSelectedChallenges] = useState([]);

  useEffect(() => {
    fetchChallenges();
  }, [filters, pagination.currentPage]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 10,
        ...filters,
        search: searchTerm || undefined
      };

      const response = await codingChallengeAPI.getCodingChallenges(params);

      if (response.success) {
        const list = response.data?.challenges || response.data || [];
        const total = response.data?.total ?? list.length;
        const page = params.page || 1;
        const limit = params.limit || 10;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        setChallenges(list);
        setPagination({
          currentPage: page,
          totalPages,
          totalChallenges: total,
          hasPrev: page > 1,
          hasNext: page < totalPages
        });
      } else {
        setError(response.message || 'Failed to fetch challenges');
      }
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setError('Failed to fetch coding challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchChallenges();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleSelectChallenge = (challengeId) => {
    setSelectedChallenges(prev => 
      prev.includes(challengeId) 
        ? prev.filter(id => id !== challengeId)
        : [...prev, challengeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedChallenges.length === challenges.length) {
      setSelectedChallenges([]);
    } else {
      setSelectedChallenges(challenges.map(challenge => challenge._id));
    }
  };

  const handleToggleStatus = async (challengeId) => {
    try {
      await codingChallengeAPI.toggleChallengeStatus(challengeId);
      fetchChallenges(); // Refresh the list
    } catch (error) {
      console.error('Error toggling challenge status:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLanguageIcon = (language) => {
    const icons = {
      javascript: '🟨',
      python: '🐍',
      java: '☕',
      cpp: '⚡',
      c: '🔧',
      csharp: '💎',
      php: '🐘',
      ruby: '💎',
      go: '🐹',
      rust: '🦀'
    };
    return icons[language] || '💻';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && challenges.length === 0) {
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Challenges</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchChallenges}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl mt-10">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <Code className="mr-3 text-blue-600" size={32} />
              Coding Challenge Management
            </h1>
            <p className="text-gray-600">
              Create, edit, and manage coding challenges
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              to="/admin/dashboard"
              className="btn btn-secondary mr-3"
            >
              Back to Dashboard
            </Link>
            <Link
              to="/admin/coding-challenges/create"
              className="btn btn-primary"
            >
              <Plus size={20} className="mr-2" />
              Create Challenge
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search challenges by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Search
            </button>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <select
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Languages</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="csharp">C#</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Challenges Table */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Challenges ({pagination.totalChallenges})
            </h3>
            {selectedChallenges.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedChallenges.length} selected
                </span>
                <button className="btn btn-sm btn-secondary">
                  <Play size={16} className="mr-1" />
                  Activate
                </button>
                <button className="btn btn-sm btn-secondary">
                  <Pause size={16} className="mr-1" />
                  Deactivate
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedChallenges.length === challenges.length && challenges.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Challenge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {challenges.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-600">
                    No coding challenges yet.
                    <Link to="/admin/coding-challenges/create" className="btn btn-primary ml-2">Create one</Link>
                  </td>
                </tr>
              )}
              {challenges.map((challenge) => (
                <tr key={challenge._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedChallenges.includes(challenge._id)}
                      onChange={() => handleSelectChallenge(challenge._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <span className="text-lg">
                            {getLanguageIcon(challenge.language)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {challenge.title}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {challenge.description}
                        </div>
                        <div className="flex items-center mt-1">
                          <Clock size={12} className="mr-1 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {challenge.timeLimit}m
                          </span>
                          <Award size={12} className="ml-2 mr-1 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {challenge.points} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(challenge.difficulty)}`}>
                      <Target size={12} className="inline mr-1" />
                      {challenge.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">
                        {getLanguageIcon(challenge.language)}
                      </span>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {challenge.language}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <Users size={12} className="mr-1 text-gray-400" />
                        <span>{challenge.totalSubmissions || 0} submissions</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <BarChart3 size={12} className="mr-1 text-gray-400" />
                        <span>{Math.round(challenge.averageScore || 0)}% avg</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1 text-gray-400" />
                      {formatDate(challenge.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                        challenge.isActive 
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {challenge.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link to={`/coding-challenges/${challenge._id}`} className="text-blue-600 hover:text-blue-900" title="View">
                        <Eye size={16} />
                      </Link>
                      <Link to={`/admin/coding-challenges/${challenge._id}/edit`} className="text-green-600 hover:text-green-900" title="Edit">
                        <Edit size={16} />
                      </Link>
                      <button 
                        onClick={() => handleToggleStatus(challenge._id)}
                        className={challenge.isActive ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
                      >
                        {challenge.isActive ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 border rounded-lg ${
                    page === pagination.currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCodingChallenges;

