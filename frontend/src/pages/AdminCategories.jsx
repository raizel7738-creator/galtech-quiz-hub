import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { categoriesAPI } from '../services/api';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Loader, 
  AlertCircle, 
  BarChart3,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  X,
  Save,
  Target,
  Award,
  Settings
} from 'lucide-react';
import '../styles/CategoryForm.css';

const AdminCategories = () => {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Filters and search
  const [filters, setFilters] = useState({
    search: '',
    difficulty: '',
    status: 'all'
  });
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'beginner',
    isActive: true
  });

  // Statistics
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (isAdmin()) {
      fetchCategories();
      fetchStats();
    }
  }, [isAdmin, filters]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...filters
      };

      const response = await categoriesAPI.getAllCategories(params);
      
      if (response.success) {
        setCategories(response.data.categories);
      } else {
        setError(response.message || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await categoriesAPI.getAllCategories();
      if (response.success) {
        const categories = response.data.categories;
        const stats = {
          total: categories.length,
          active: categories.filter(c => c.isActive).length,
          inactive: categories.filter(c => !c.isActive).length,
          beginner: categories.filter(c => c.difficulty === 'beginner').length,
          intermediate: categories.filter(c => c.difficulty === 'intermediate').length,
          advanced: categories.filter(c => c.difficulty === 'advanced').length
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setFormLoading(true);
      
      if (isEditing) {
        const response = await categoriesAPI.updateCategory(currentCategory._id, formData);
        if (response.success) {
          await fetchCategories();
          await fetchStats();
          setShowModal(false);
          resetForm();
        } else {
          setError(response.message || 'Failed to update category');
        }
      } else {
        const response = await categoriesAPI.createCategory(formData);
        if (response.success) {
          await fetchCategories();
          await fetchStats();
          setShowModal(false);
          resetForm();
        } else {
          setError(response.message || 'Failed to create category');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to save category. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      difficulty: category.difficulty,
      isActive: category.isActive
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await categoriesAPI.deleteCategory(categoryId);
      if (response.success) {
        await fetchCategories();
        await fetchStats();
      } else {
        setError(response.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category. Please try again.');
    }
  };

  const handleToggleStatus = async (categoryId) => {
    try {
      const response = await categoriesAPI.toggleCategoryStatus(categoryId);
      if (response.success) {
        await fetchCategories();
        await fetchStats();
      } else {
        setError(response.message || 'Failed to toggle category status');
      }
    } catch (error) {
      console.error('Error toggling category status:', error);
      setError('Failed to toggle category status. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      difficulty: 'beginner',
      isActive: true
    });
    setCurrentCategory(null);
    setIsEditing(false);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         category.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesDifficulty = !filters.difficulty || category.difficulty === filters.difficulty;
    const matchesStatus = filters.status === 'all' || 
                         (filters.status === 'active' && category.isActive) ||
                         (filters.status === 'inactive' && !category.isActive);
    
    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  if (!isAdmin()) {
    return (
      <div className="container mx-auto p-6 max-w-7xl mt-10">
        <div className="text-center">
          <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl mt-10">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <BookOpen className="mr-3 text-blue-600" size={32} />
              Manage Categories
            </h1>
            <p className="text-gray-600">
              Create, edit, and manage quiz categories
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="btn btn-secondary"
            >
              <BarChart3 size={20} className="mr-2" />
              {showStats ? 'Hide' : 'Show'} Stats
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary"
            >
              <PlusCircle size={20} className="mr-2" />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {showStats && stats && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
              <div className="text-sm text-gray-600">Inactive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{stats.beginner}</div>
              <div className="text-sm text-gray-600">Beginner</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{stats.intermediate}</div>
              <div className="text-sm text-gray-600">Intermediate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{stats.advanced}</div>
              <div className="text-sm text-gray-600">Advanced</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle size={20} className="text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin text-blue-600" size={48} />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No categories found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.difficulty || filters.status !== 'all' 
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first category.'
              }
            </p>
            {!filters.search && !filters.difficulty && filters.status === 'all' && (
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary"
              >
                <PlusCircle size={20} className="mr-2" />
                Create Category
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {category.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        category.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        category.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {category.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleToggleStatus(category._id)}
                          className={`p-2 rounded-lg transition-colors ${
                            category.isActive 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={category.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {category.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modern Category Modal */}
      {showModal && (
        <div className="category-form-overlay">
          <div className="category-form-modal">
            {/* Header with Gradient */}
            <div className="form-header">
              <div className="header-background">
                <div className="header-shapes">
                  <div className="header-shape header-shape-1"></div>
                  <div className="header-shape header-shape-2"></div>
                </div>
              </div>
              <div className="header-content">
                <div className="header-icon">
                  <BookOpen size={24} />
                </div>
                <div className="header-text">
                  <h2>{isEditing ? 'Edit Category' : 'Create New Category'}</h2>
                  <p>Organize your quiz questions into meaningful categories</p>
                </div>
                <button onClick={handleModalClose} className="close-btn">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="form-content">
              <div className="form-grid">
                {/* Left Column - Main Content */}
                <div className="form-main">
                  {/* Category Details Section */}
                  <div className="form-section">
                    <div className="section-header">
                      <div className="section-icon">
                        <Target size={18} />
                      </div>
                      <h3>Category Details</h3>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label className="form-label">
                          Category Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="form-input"
                          placeholder="Enter category name"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">
                          Description *
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="form-textarea"
                          placeholder="Describe what this category covers..."
                        />
                      </div>
                    </form>
                  </div>
                </div>

                {/* Right Column - Settings */}
                <div className="form-sidebar">
                  {/* Category Settings */}
                  <div className="form-section">
                    <div className="section-header">
                      <div className="section-icon">
                        <Settings size={18} />
                      </div>
                      <h3>Category Settings</h3>
                    </div>
                    
                    <div className="settings-grid">
                      <div className="form-group">
                        <label className="form-label">Difficulty Level</label>
                        <select
                          value={formData.difficulty}
                          onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                          className="form-select"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <div className="status-toggle">
                          <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="status-checkbox"
                          />
                          <label htmlFor="isActive" className="status-label">
                            <span className="status-text">
                              {formData.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="status-description">
                              {formData.isActive 
                                ? 'Category is visible to students' 
                                : 'Category is hidden from students'
                              }
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="form-section">
                    <div className="section-header">
                      <div className="section-icon">
                        <Award size={18} />
                      </div>
                      <h3>Preview</h3>
                    </div>
                    
                    <div className="category-preview">
                      <div className="preview-card">
                        <div className="preview-header">
                          <div className="preview-title">
                            {formData.name || 'Category Name'}
                          </div>
                          <div className={`preview-difficulty ${formData.difficulty}`}>
                            {formData.difficulty}
                          </div>
                        </div>
                        <div className="preview-description">
                          {formData.description || 'Category description will appear here...'}
                        </div>
                        <div className="preview-status">
                          <span className={`status-badge ${formData.isActive ? 'active' : 'inactive'}`}>
                            {formData.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={handleModalClose}
                className="btn-secondary"
                disabled={formLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={formLoading}
                className="btn-primary"
              >
                {formLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {isEditing ? 'Update Category' : 'Create Category'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
