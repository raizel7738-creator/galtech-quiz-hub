import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { codingChallengeAPI, challengesAPI } from '../services/api';
import CodingChallengeCard from '../components/CodingChallengeCard';
import { 
  Code, 
  Search, 
  Filter, 
  Plus,
  Loader,
  AlertCircle,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Star,
  Zap,
  Target,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import '../styles/CodingChallenges.css';

const CodingChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    difficulty: '',
    language: '',
    category: '',
    status: 'active'
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalChallenges: 0
  });

  const difficulties = ['beginner', 'intermediate', 'advanced'];
  const languages = ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'php', 'ruby', 'go', 'rust'];

  useEffect(() => {
    fetchChallenges();
  }, [filters, sortBy, sortOrder, pagination.currentPage]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      let list = [];
      try {
        const res = await challengesAPI.list();
        list = res.data || res;
      } catch (_) {
        const legacy = await codingChallengeAPI.getCodingChallenges({ page: 1, limit: 50 });
        list = legacy?.data?.challenges || legacy?.data || [];
      }
      setChallenges(Array.isArray(list) ? list : []);
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

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setFilters({
      difficulty: '',
      language: '',
      category: '',
      status: 'active'
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  if (loading && challenges.length === 0) {
    return (
      <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl max-w-7xl mt-10">
        <div className="flex justify-center items-center py-12">
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
    <div className="modern-coding-challenges">
      <div className="challenges-hero">
        <div className="hero-background">
          <div className="hero-shapes">
            <div className="hero-shape hero-shape-1"></div>
            <div className="hero-shape hero-shape-2"></div>
            <div className="hero-shape hero-shape-3"></div>
          </div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <Code size={20} />
            <span>Code & Create</span>
          </div>
          <h1 className="hero-title">Coding Challenges</h1>
          <p className="hero-subtitle">
            Master programming concepts through hands-on coding challenges
          </p>
        </div>
      </div>

      <div className="challenges-container">
        {/* Controls Section */}
        <div className="controls-section">
          <div className="search-wrapper">
            <div className="search-container">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="filters-wrapper">
            <div className="filter-item">
              <label className="filter-label">
                <Filter size={16} />
                Difficulty
              </label>
              <div className="select-wrapper">
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="modern-select"
                >
                  <option value="">All Levels</option>
                  {difficulties.map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="select-arrow" />
              </div>
            </div>

            <div className="filter-item">
              <label className="filter-label">
                <Code size={16} />
                Language
              </label>
              <div className="select-wrapper">
                <select
                  value={filters.language}
                  onChange={(e) => handleFilterChange('language', e.target.value)}
                  className="modern-select"
                >
                  <option value="">All Languages</option>
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="select-arrow" />
              </div>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="sort-toggle"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? <SortAsc size={20} /> : <SortDesc size={20} />}
            </button>
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
                placeholder="Search challenges..."
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
              {difficulties.map(diff => (
                <option key={diff} value={diff} className="capitalize">
                  {diff}
                </option>
              ))}
            </select>

            <select
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang} className="capitalize">
                  {lang}
                </option>
              ))}
            </select>

            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>

          {/* Sort and View Options */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <button
                onClick={() => handleSort('createdAt')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                  sortBy === 'createdAt' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Date
                {sortBy === 'createdAt' && (
                  sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                )}
              </button>
              <button
                onClick={() => handleSort('difficulty')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                  sortBy === 'difficulty' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Difficulty
                {sortBy === 'difficulty' && (
                  sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                )}
              </button>
              <button
                onClick={() => handleSort('points')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                  sortBy === 'points' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Points
                {sortBy === 'points' && (
                  sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">Showing {challenges.length} challenges</p>
          {loading && (
            <Loader className="animate-spin text-blue-600" size={20} />
          )}
        </div>

        {challenges.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-12 text-center">
            <Code size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Challenges Found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {challenges.map((challenge) => (
              <CodingChallengeCard key={challenge._id} challenge={challenge} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
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
      )}
    </div>
  );
};

export default CodingChallenges;

