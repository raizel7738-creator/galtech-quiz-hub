import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Filter, Loader, AlertCircle, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { questionsAPI, categoriesAPI } from '../services/api';
import QuestionCard from '../components/QuestionCard';
import QuestionForm from '../components/QuestionForm';

const AdminQuestions = () => {
  const { isAdmin } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Filters and search
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty: '',
    type: '',
    status: 'active'
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalQuestions: 0,
    hasNext: false,
    hasPrev: false
  });

  // Statistics
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (isAdmin()) {
      fetchQuestions();
      fetchCategories();
      fetchStats();
    }
  }, [isAdmin, filters, pagination.currentPage]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.currentPage,
        limit: 10,
        ...filters
      };

      const response = await questionsAPI.getAllQuestions(params);
      
      if (response.success) {
        setQuestions(response.data.questions);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to fetch questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAllCategories();
      if (response.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await questionsAPI.getQuestionStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  const handleCreateQuestion = async (questionData) => {
    try {
      setFormLoading(true);
      const response = await questionsAPI.createQuestion(questionData);
      
      if (response.success) {
        setShowModal(false);
        setCurrentQuestion(null);
        setIsEditing(false);
        fetchQuestions();
        fetchStats();
      } else {
        setError(response.message || 'Failed to create question');
      }
    } catch (error) {
      console.error('Error creating question:', error);
      setError('Failed to create question. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateQuestion = async (questionData) => {
    try {
      setFormLoading(true);
      const response = await questionsAPI.updateQuestion(currentQuestion._id, questionData);
      
      if (response.success) {
        setShowModal(false);
        setCurrentQuestion(null);
        setIsEditing(false);
        fetchQuestions();
        fetchStats();
      } else {
        setError(response.message || 'Failed to update question');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      setError('Failed to update question. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditQuestion = (question) => {
    setCurrentQuestion(question);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      try {
        const response = await questionsAPI.deleteQuestion(questionId);
        
        if (response.success) {
          fetchQuestions();
          fetchStats();
        } else {
          setError(response.message || 'Failed to delete question');
        }
      } catch (error) {
        console.error('Error deleting question:', error);
        setError('Failed to delete question. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (questionId) => {
    try {
      const response = await questionsAPI.toggleQuestionStatus(questionId);
      
      if (response.success) {
        fetchQuestions();
        fetchStats();
      } else {
        setError(response.message || 'Failed to toggle question status');
      }
    } catch (error) {
      console.error('Error toggling question status:', error);
      setError('Failed to toggle question status. Please try again.');
    }
  };

  const openCreateModal = () => {
    setCurrentQuestion(null);
    setIsEditing(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentQuestion(null);
    setIsEditing(false);
  };

  if (!isAdmin() && !loading) {
    return (
      <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl max-w-4xl mt-10">
        <div className="text-center">
          <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl max-w-7xl mt-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
          <PlusCircle size={36} className="text-blue-600" />
          Manage Questions
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowStats(!showStats)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <BarChart3 size={20} />
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </button>
          <button
            onClick={openCreateModal}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Add Question
          </button>
        </div>
      </div>

      {/* Statistics */}
      {showStats && stats && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Question Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.overall.totalQuestions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.overall.activeQuestions}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.overall.draftQuestions}</div>
              <div className="text-sm text-gray-600">Draft</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.overall.inactiveQuestions}</div>
              <div className="text-sm text-gray-600">Inactive</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filter-panel">
        <div className="filter-title">
          <Filter size={16} /> Filters
        </div>
        <div className="filters">
          <div className="filter">
            <label>Search</label>
            <div className="input">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search questions..."
              />
            </div>
          </div>
          
          <div className="filter">
            <label>Category</label>
            <div className="input">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="filter">
            <label>Difficulty</label>
            <div className="input">
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          
          <div className="filter">
            <label>Type</label>
            <div className="input">
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="mcq">MCQ</option>
                <option value="program">Program-Based</option>
                <option value="coding">Coding</option>
              </select>
            </div>
          </div>
          
          <div className="filter">
            <label>Status</label>
            <div className="input">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin text-blue-600" size={48} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle size={20} className="text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Questions Grid */}
      {!loading && !error && questions.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Questions Found</h3>
          <p className="text-gray-500 mb-4">
            {Object.values(filters).some(f => f) 
              ? 'No questions match your current filters.' 
              : 'Get started by creating your first question.'
            }
          </p>
          <button
            onClick={openCreateModal}
            className="btn btn-primary flex items-center gap-2 mx-auto"
          >
            <PlusCircle size={20} />
            Create First Question
          </button>
        </div>
      )}

      {!loading && !error && questions.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {questions.map((question) => (
              <QuestionCard
                key={question._id}
                question={question}
                isAdmin={true}
                showStats={true}
                onEdit={handleEditQuestion}
                onDelete={handleDeleteQuestion}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Question Form Modal */}
      {showModal && (
        <QuestionForm
          question={currentQuestion}
          categories={categories}
          onSubmit={isEditing ? handleUpdateQuestion : handleCreateQuestion}
          onCancel={closeModal}
          loading={formLoading}
        />
      )}
    </div>
  );
};

export default AdminQuestions;

