import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Save, AlertCircle, BookOpen, Target, Award, Hash, Eye } from 'lucide-react';
import '../styles/QuestionForm.css';

const QuestionForm = ({ 
  question = null, 
  categories = [], 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    question: '',
    type: 'mcq',
    category: '',
    difficulty: 'easy',
    points: 1,
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    correctAnswer: '',
    explanation: '',
    tags: [],
    status: 'draft'
  });

  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const questionRef = useRef(null);

  // Initialize form data when question prop changes
  useEffect(() => {
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) {}

    if (question) {
      setFormData({
        question: question.question || '',
        type: question.type || 'mcq',
        category: question.category?._id || question.category || '',
        difficulty: question.difficulty || 'easy',
        points: question.points || 1,
        options: question.options || [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ],
        correctAnswer: question.correctAnswer || '',
        explanation: question.explanation || '',
        tags: question.tags || [],
        status: question.status || 'draft'
      });
    }
    setTimeout(() => {
      try { questionRef.current?.focus(); } catch(_) {}
    }, 0);
  }, [question]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value
    };
    
    if (field === 'isCorrect' && value) {
      newOptions.forEach((option, i) => {
        if (i !== index) {
          option.isCorrect = false;
        }
      });
    }
    
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, { text: '', isCorrect: false }]
      }));
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.question.trim()) {
      newErrors.question = 'Question is required';
    } else if (formData.question.trim().length < 10) {
      newErrors.question = 'Question must be at least 10 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.type === 'mcq') {
      const validOptions = formData.options.filter(option => option.text.trim());
      if (validOptions.length < 2) {
        newErrors.options = 'At least 2 options are required';
      }

      const correctOptions = formData.options.filter(option => option.isCorrect);
      if (correctOptions.length !== 1) {
        newErrors.options = 'Exactly one option must be marked as correct';
      }

      if (!formData.correctAnswer.trim()) {
        newErrors.correctAnswer = 'Correct answer is required';
      }
    }

    if (formData.points < 1 || formData.points > 100) {
      newErrors.points = 'Points must be between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      options: formData.options.filter(option => option.text.trim())
    };

    onSubmit(submitData);
  };

  const modal = (
    <div className="question-form-overlay">
      <div className="question-form-modal">
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
              <h2>{question ? 'Edit Question' : 'Create New Question'}</h2>
              <p>Build engaging quiz questions for your students</p>
            </div>
            <button onClick={onCancel} className="close-btn">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="form-content">
          <div className="form-grid">
            {/* Left Column - Main Content */}
            <div className="form-main">
              {/* Question Text Section */}
              <div className="form-section">
                <div className="section-header">
                  <div className="section-icon">
                    <Target size={18} />
                  </div>
                  <h3>Question Content</h3>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Question Text *
                  </label>
                  <textarea
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    ref={questionRef}
                    rows={4}
                    className={`form-textarea ${errors.question ? 'error' : ''}`}
                    placeholder="Enter your question here..."
                  />
                  {errors.question && (
                    <div className="error-message">
                      <AlertCircle size={14} />
                      <span>{errors.question}</span>
                    </div>
                  )}
                </div>

                {/* Correct Answer */}
                <div className="form-group">
                  <label className="form-label">
                    Correct Answer *
                  </label>
                  <input
                    type="text"
                    name="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={handleInputChange}
                    className={`form-input ${errors.correctAnswer ? 'error' : ''}`}
                    placeholder="Enter the correct answer"
                  />
                  {errors.correctAnswer && (
                    <div className="error-message">
                      <AlertCircle size={14} />
                      <span>{errors.correctAnswer}</span>
                    </div>
                  )}
                </div>

                {/* Explanation */}
                <div className="form-group">
                  <label className="form-label">
                    Explanation (Optional)
                  </label>
                  <textarea
                    name="explanation"
                    value={formData.explanation}
                    onChange={handleInputChange}
                    rows={3}
                    className="form-textarea"
                    placeholder="Explain why this is the correct answer..."
                  />
                </div>
              </div>

          {/* Type and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="program">Program-Based</option>
                <option value="coding">Coding Challenge</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          {/* Difficulty and Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points *
              </label>
              <input
                type="number"
                name="points"
                value={formData.points}
                onChange={handleInputChange}
                min="1"
                max="100"
                className={`w-full h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.points ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.points && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.points}
                </p>
              )}
            </div>
          </div>

              {/* MCQ Options */}
              {formData.type === 'mcq' && (
                <div className="form-section">
                  <div className="section-header">
                    <div className="section-icon">
                      <Award size={18} />
                    </div>
                    <h3>Answer Options</h3>
                  </div>
                  <div className="options-list">
                    {formData.options.map((option, index) => (
                      <div key={index} className="option-item">
                        <div className="option-input">
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            className="form-input"
                          />
                        </div>
                        <label className="correct-checkbox">
                          <input
                            type="radio"
                            name="correctOption"
                            checked={option.isCorrect}
                            onChange={() => handleOptionChange(index, 'isCorrect', true)}
                          />
                          <span>Correct</span>
                        </label>
                        {formData.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="remove-option-btn"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    
                    {formData.options.length < 6 && (
                      <button
                        type="button"
                        onClick={addOption}
                        className="add-option-btn"
                      >
                        <Plus size={16} />
                        Add Option
                      </button>
                    )}
                  </div>
                  {errors.options && (
                    <div className="error-message">
                      <AlertCircle size={14} />
                      <span>{errors.options}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Settings */}
            <div className="form-sidebar">
              {/* Question Settings */}
              <div className="form-section">
                <div className="section-header">
                  <div className="section-icon">
                    <Award size={18} />
                  </div>
                  <h3>Question Settings</h3>
                </div>
                
                <div className="settings-grid">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="mcq">Multiple Choice (MCQ)</option>
                      <option value="program">Program-Based</option>
                      <option value="coding">Coding Challenge</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`form-select ${errors.category ? 'error' : ''}`}
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <div className="error-message">
                        <AlertCircle size={14} />
                        <span>{errors.category}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Difficulty</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Points *</label>
                    <input
                      type="number"
                      name="points"
                      value={formData.points}
                      onChange={handleInputChange}
                      min="1"
                      max="100"
                      className={`form-input ${errors.points ? 'error' : ''}`}
                    />
                    {errors.points && (
                      <div className="error-message">
                        <AlertCircle size={14} />
                        <span>{errors.points}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tags Section */}
              <div className="form-section">
                <div className="section-header">
                  <div className="section-icon">
                    <Hash size={18} />
                  </div>
                  <h3>Tags</h3>
                </div>
                
                <div className="tags-container">
                  <div className="tags-list">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="tag-item">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleTagRemove(tag)}
                          className="tag-remove"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="tag-input-group">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                      placeholder="Add a tag"
                      className="form-input"
                    />
                    <button
                      type="button"
                      onClick={handleTagAdd}
                      className="tag-add-btn"
                    >
                      Add
                    </button>
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
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                {question ? 'Update Question' : 'Create Question'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default QuestionForm;

