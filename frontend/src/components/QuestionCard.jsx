import React from 'react';
import { Clock, Star, Tag, Eye, EyeOff, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const QuestionCard = ({ 
  question, 
  isAdmin = false, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  showStats = false 
}) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'mcq': return 'text-blue-600 bg-blue-100';
      case 'program': return 'text-purple-600 bg-purple-100';
      case 'coding': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {question.question}
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(question.type)}`}>
              {question.type.toUpperCase()}
            </span>
            {isAdmin && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(question.status)}`}>
                {question.status}
              </span>
            )}
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => onEdit(question)}
              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
              title="Edit question"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onToggleStatus(question._id)}
              className={`p-2 rounded-full transition-colors ${
                question.status === 'active' 
                  ? 'text-green-500 hover:text-green-700 hover:bg-green-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              title={question.status === 'active' ? 'Deactivate question' : 'Activate question'}
            >
              {question.status === 'active' ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <button
              onClick={() => onDelete(question._id)}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
              title="Delete question"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Question Details */}
      <div className="space-y-3">
        {/* Category */}
        {question.category && (
          <div className="flex items-center text-sm text-gray-600">
            <Tag size={14} className="mr-2" />
            <span className="font-medium">{question.category.name}</span>
          </div>
        )}

        {/* Points and Time */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Star size={14} className="mr-1" />
            <span>{question.points} point{question.points !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            <span>~{question.estimatedTime || 2} min</span>
          </div>
        </div>

        {/* Options Preview (for MCQ) */}
        {question.type === 'mcq' && question.options && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
            <div className="space-y-1">
              {question.options.slice(0, 2).map((option, index) => (
                <div key={index} className="text-sm text-gray-600 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium mr-2">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="line-clamp-1">{option.text}</span>
                  {option.isCorrect && (
                    <span className="ml-2 text-green-600 text-xs">✓</span>
                  )}
                </div>
              ))}
              {question.options.length > 2 && (
                <div className="text-sm text-gray-500 ml-8">
                  +{question.options.length - 2} more option{question.options.length - 2 !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {question.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {question.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                  +{question.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Statistics (for admin) */}
        {isAdmin && showStats && question.stats && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-800">{question.stats.totalAttempts}</div>
                <div className="text-gray-500">Attempts</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-800">
                  {question.stats.totalAttempts > 0 
                    ? Math.round((question.stats.correctAttempts / question.stats.totalAttempts) * 100)
                    : 0}%
                </div>
                <div className="text-gray-500">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-800">
                  {Math.round(question.stats.averageTime / 60)}m
                </div>
                <div className="text-gray-500">Avg Time</div>
              </div>
            </div>
          </div>
        )}

        {/* Created Info */}
        {isAdmin && question.createdBy && (
          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
            Created by {question.createdBy.name} on {new Date(question.createdAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;

