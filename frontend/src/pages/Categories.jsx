import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI } from '../services/api';
import '../styles/Categories.css';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Filter, 
  Search, 
  ArrowRight,
  TrendingUp,
  Award,
  Target,
  Zap,
  Star,
  Code,
  Calculator,
  Brain,
  ChevronDown,
  SortAsc,
  SortDesc
} from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    difficulty: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  useEffect(() => {
    fetchCategories();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoriesAPI.getCategories();
      
      if (response.success) {
        let filteredCategories = response.data.categories || response.data;
        
        // Apply search filter
        if (searchTerm.trim()) {
          filteredCategories = filteredCategories.filter(category =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        // Apply difficulty filter
        if (filters.difficulty) {
          filteredCategories = filteredCategories.filter(category =>
            category.difficulty === filters.difficulty
          );
        }
        
        // Apply sorting
        filteredCategories.sort((a, b) => {
          let aValue = a[filters.sortBy];
          let bValue = b[filters.sortBy];
          
          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }
          
          if (filters.sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
        
        setCategories(filteredCategories);
      } else {
        setError(response.message || 'Failed to fetch categories');
      }
    } catch (error) {
      setError('Failed to fetch categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getCategoryIcon = (name) => {
    if (name.toLowerCase().includes('math') || name.toLowerCase().includes('aptitude')) {
      return <Calculator size={24} />;
    }
    if (name.toLowerCase().includes('program') || name.toLowerCase().includes('coding')) {
      return <Code size={24} />;
    }
    if (name.toLowerCase().includes('logic') || name.toLowerCase().includes('reasoning')) {
      return <Brain size={24} />;
    }
    return <BookOpen size={24} />;
  };

  if (loading) {
    return (
      <div className="modern-categories">
        <div className="categories-hero">
          <div className="hero-background">
            <div className="hero-shapes">
              <div className="hero-shape hero-shape-1"></div>
              <div className="hero-shape hero-shape-2"></div>
            </div>
          </div>
          <div className="hero-content">
            <h1 className="hero-title">Quiz Categories</h1>
            <p className="hero-subtitle">
              Choose your learning path and start your quiz journey
            </p>
          </div>
        </div>
        <div className="categories-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading amazing categories...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modern-categories">
        <div className="categories-hero">
          <div className="hero-background">
            <div className="hero-shapes">
              <div className="hero-shape hero-shape-1"></div>
              <div className="hero-shape hero-shape-2"></div>
            </div>
          </div>
          <div className="hero-content">
            <h1 className="hero-title">Quiz Categories</h1>
            <p className="hero-subtitle">
              Choose your learning path and start your quiz journey
            </p>
          </div>
        </div>
        <div className="categories-container">
          <div className="error-state">
            <div className="error-icon">
              <Target size={48} />
            </div>
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button onClick={fetchCategories} className="retry-btn">
              <ArrowRight size={16} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-categories">
      <div className="categories-hero">
        <div className="hero-background">
          <div className="hero-shapes">
            <div className="hero-shape hero-shape-1"></div>
            <div className="hero-shape hero-shape-2"></div>
            <div className="hero-shape hero-shape-3"></div>
          </div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <Star size={16} />
            <span>Explore & Learn</span>
          </div>
          <h1 className="hero-title">Quiz Categories</h1>
          <p className="hero-subtitle">
            Choose your learning path from our curated collection of interactive quizzes
          </p>
        </div>
      </div>

      <div className="categories-container">
        {/* Search and Filter Controls */}
        <div className="controls-section">
          <div className="search-wrapper">
            <div className="search-container">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search categories..."
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
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <ChevronDown size={16} className="select-arrow" />
              </div>
            </div>

            <div className="filter-item">
              <label className="filter-label">
                {filters.sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                Sort By
              </label>
              <div className="select-wrapper">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="modern-select"
                >
                  <option value="name">Name</option>
                  <option value="questionCount">Questions</option>
                  <option value="difficulty">Difficulty</option>
                </select>
                <ChevronDown size={16} className="select-arrow" />
              </div>
            </div>

            <button
              onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="sort-toggle"
              title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {filters.sortOrder === 'asc' ? <SortAsc size={20} /> : <SortDesc size={20} />}
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Target size={64} />
            </div>
            <h3>No Categories Found</h3>
            <p>
              {searchTerm ? 
                `No categories match "${searchTerm}". Try a different search term.` :
                'No categories are available right now.'
              }
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="clear-search-btn"
              >
                <ArrowRight size={16} />
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="categories-section">
            <div className="section-header">
              <h2>Available Categories</h2>
              <p>{categories.length} categories found</p>
            </div>
            <div className="categories-grid">
              {categories.map((category, index) => (
                <div key={category._id} className={`category-card ${index === 0 ? 'featured' : ''}`}>
                  <div className="card-header">
                    <div className="category-icon">
                      {getCategoryIcon(category.name)}
                    </div>
                    <div className="difficulty-badge" data-difficulty={category.difficulty}>
                      {category.difficulty || 'beginner'}
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <h3 className="category-name">{category.name}</h3>
                    <p className="category-desc">{category.description}</p>
                    
                    <div className="category-meta">
                      <div className="meta-item">
                        <Target size={16} />
                        <span>{category.questionCount || 0} questions</span>
                      </div>
                      <div className="meta-item">
                        <Clock size={16} />
                        <span>~{Math.ceil((category.questionCount || 10) * 1.5)} min</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <Link 
                      to={`/quiz/${category._id}`}
                      className="start-quiz-btn"
                    >
                      <Zap size={16} />
                      <span>Start Quiz</span>
                      <ArrowRight size={16} className="btn-arrow" />
                    </Link>
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

export default Categories;