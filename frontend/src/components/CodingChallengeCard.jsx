import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Code, 
  Clock, 
  Star, 
  Users, 
  TrendingUp,
  Award,
  Target,
  Zap
} from 'lucide-react';

const CodingChallengeCard = ({ challenge }) => {
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

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return <Target size={16} className="text-green-600" />;
      case 'intermediate':
        return <TrendingUp size={16} className="text-yellow-600" />;
      case 'advanced':
        return <Zap size={16} className="text-red-600" />;
      default:
        return <Star size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
              {challenge.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-3">
              {challenge.description}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <span className="text-2xl">
              {getLanguageIcon(challenge.language)}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(challenge.difficulty)}`}>
            {getDifficultyIcon(challenge.difficulty)}
            <span className="ml-1 capitalize">{challenge.difficulty}</span>
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <Code size={12} className="inline mr-1" />
            {challenge.language}
          </span>
          {challenge.tags && challenge.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={16} className="mr-2 text-blue-500" />
            <span>{challenge.formattedTimeLimit || `${challenge.timeLimit}m`}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Award size={16} className="mr-2 text-yellow-500" />
            <span>{challenge.points} points</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users size={16} className="mr-2 text-green-500" />
            <span>{challenge.totalSubmissions || 0} submissions</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <TrendingUp size={16} className="mr-2 text-purple-500" />
            <span>{Math.round(challenge.averageScore || 0)}% avg</span>
          </div>
        </div>

        {/* Category */}
        {challenge.category && (
          <div className="mb-4">
            <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              Category
            </span>
            <p className="text-sm text-gray-700 font-medium">
              {challenge.category.name}
            </p>
          </div>
        )}

        {/* Action Button */}
        <Link
          to={`/coding-challenges/${challenge._id}`}
          className="w-full btn btn-primary flex items-center justify-center group"
        >
          <Code size={16} className="mr-2 group-hover:animate-pulse" />
          Start Challenge
        </Link>
      </div>
    </div>
  );
};

export default CodingChallengeCard;

