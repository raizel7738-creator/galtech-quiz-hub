const Question = require('../models/Question');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

// @desc    Get questions for a specific category (public - for students)
// @route   GET /api/questions/category/:categoryId
// @access  Public
const getQuestionsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { limit = 10, page = 1, difficulty, type, language } = req.query;

    // Validate category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Build query
    const query = {
      category: categoryId,
      status: 'active'
    };

    if (type) {
      query.type = type;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Add language filter for program-based questions
    let questions = [];
    let totalQuestions = 0;
    
    if (language && type === 'program') {
      // First try to get questions for the specific language
      const languageQuery = { ...query, 'programQuestion.language': language };
      questions = await Question.find(languageQuery)
        .select('-explanation -stats -createdBy')
        .populate('category', 'name description')
        .limit(parseInt(limit));
      
      totalQuestions = await Question.countDocuments(languageQuery);
      
      // If no questions found for specific language, fall back to all program questions
      if (questions.length === 0) {
        console.log(`No questions found for language: ${language}, falling back to all program questions`);
        questions = await Question.find(query)
          .select('-explanation -stats -createdBy')
          .populate('category', 'name description')
          .limit(parseInt(limit));
        
        totalQuestions = await Question.countDocuments(query);
      }
    } else {
      // No language filter, get all questions
      questions = await Question.find(query)
        .select('-explanation -stats -createdBy')
        .populate('category', 'name description')
        .limit(parseInt(limit));
      
      totalQuestions = await Question.countDocuments(query);
    }
    
    // Shuffle the questions array for random selection
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

    res.json({
      success: true,
      data: {
        questions: shuffledQuestions,
        totalQuestions: shuffledQuestions.length,
        category: {
          _id: category._id,
          name: category.name,
          description: category.description
        }
      }
    });
  } catch (error) {
    console.error('Error fetching questions by category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching questions'
    });
  }
};

// @desc    Get all questions (admin only)
// @route   GET /api/questions
// @access  Private (Admin)
const getAllQuestions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      difficulty, 
      type, 
      status = 'active',
      search 
    } = req.query;

    // Build query
    const query = {};
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (type) query.type = type;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get questions with pagination
    const questions = await Question.find(query)
      .populate('category', 'name description')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalQuestions = await Question.countDocuments(query);

    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalQuestions / parseInt(limit)),
          totalQuestions,
          hasNext: skip + questions.length < totalQuestions,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all questions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching questions'
    });
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Private (Admin)
const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('category', 'name description')
      .populate('createdBy', 'name email');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching question'
    });
  }
};

// @desc    Create new question
// @route   POST /api/questions
// @access  Private (Admin)
const createQuestion = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      question,
      type = 'mcq',
      category,
      difficulty = 'easy',
      points = 1,
      options = [],
      correctAnswer,
      explanation,
      tags = [],
      status = 'draft',
      programQuestion = {}
    } = req.body;

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

    // For MCQ, validate options and correct answer
    if (type === 'mcq') {
      if (options.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'MCQ questions must have at least 2 options'
        });
      }

      // Ensure exactly one correct option
      const correctOptions = options.filter(option => option.isCorrect);
      if (correctOptions.length !== 1) {
        return res.status(400).json({
          success: false,
          message: 'MCQ questions must have exactly one correct option'
        });
      }

      // Validate correct answer matches one of the options
      const correctOption = options.find(option => option.isCorrect);
      if (correctOption && correctAnswer !== correctOption.text) {
        return res.status(400).json({
          success: false,
          message: 'Correct answer must match one of the options'
        });
      }
    } else if (type === 'program') {
      // For program-based questions, validate program question fields
      if (!programQuestion.codeSnippet) {
        return res.status(400).json({
          success: false,
          message: 'Program-based questions must have a code snippet'
        });
      }

      if (!programQuestion.expectedOutput) {
        return res.status(400).json({
          success: false,
          message: 'Program-based questions must have expected output'
        });
      }

      if (!correctAnswer) {
        return res.status(400).json({
          success: false,
          message: 'Program-based questions must have a correct answer'
        });
      }
    }

    // Create question
    const newQuestion = new Question({
      question,
      type,
      category,
      difficulty,
      points,
      options,
      correctAnswer,
      explanation,
      tags,
      status,
      programQuestion,
      createdBy: req.user.id
    });

    await newQuestion.save();

    // Populate the response
    await newQuestion.populate('category', 'name description');
    await newQuestion.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: newQuestion
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating question'
    });
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private (Admin)
const updateQuestion = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      question,
      type,
      category,
      difficulty,
      points,
      options,
      correctAnswer,
      explanation,
      tags,
      status
    } = req.body;

    // Find question
    const existingQuestion = await Question.findById(req.params.id);
    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Validate category if provided
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // For MCQ, validate options and correct answer
    if (type === 'mcq' || existingQuestion.type === 'mcq') {
      const questionOptions = options || existingQuestion.options;
      const questionCorrectAnswer = correctAnswer || existingQuestion.correctAnswer;

      if (questionOptions.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'MCQ questions must have at least 2 options'
        });
      }

      // Ensure exactly one correct option
      const correctOptions = questionOptions.filter(option => option.isCorrect);
      if (correctOptions.length !== 1) {
        return res.status(400).json({
          success: false,
          message: 'MCQ questions must have exactly one correct option'
        });
      }

      // Validate correct answer matches one of the options
      const correctOption = questionOptions.find(option => option.isCorrect);
      if (correctOption && questionCorrectAnswer !== correctOption.text) {
        return res.status(400).json({
          success: false,
          message: 'Correct answer must match one of the options'
        });
      }
    }

    // Update question
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      {
        ...(question && { question }),
        ...(type && { type }),
        ...(category && { category }),
        ...(difficulty && { difficulty }),
        ...(points && { points }),
        ...(options && { options }),
        ...(correctAnswer && { correctAnswer }),
        ...(explanation !== undefined && { explanation }),
        ...(tags && { tags }),
        ...(status && { status })
      },
      { new: true, runValidators: true }
    ).populate('category', 'name description')
     .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: updatedQuestion
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating question'
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private (Admin)
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    await Question.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting question'
    });
  }
};

// @desc    Toggle question status
// @route   PATCH /api/questions/:id/toggle-status
// @access  Private (Admin)
const toggleQuestionStatus = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Toggle between active and inactive
    const newStatus = question.status === 'active' ? 'inactive' : 'active';
    
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      { status: newStatus },
      { new: true }
    ).populate('category', 'name description')
     .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: `Question ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: updatedQuestion
    });
  } catch (error) {
    console.error('Error toggling question status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling question status'
    });
  }
};

// @desc    Get question statistics
// @route   GET /api/questions/stats
// @access  Private (Admin)
const getQuestionStats = async (req, res) => {
  try {
    const stats = await Question.aggregate([
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: 1 },
          activeQuestions: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          draftQuestions: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          inactiveQuestions: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          totalAttempts: { $sum: '$stats.totalAttempts' },
          totalCorrectAttempts: { $sum: '$stats.correctAttempts' }
        }
      }
    ]);

    const difficultyStats = await Question.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await Question.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overall: stats[0] || {
          totalQuestions: 0,
          activeQuestions: 0,
          draftQuestions: 0,
          inactiveQuestions: 0,
          totalAttempts: 0,
          totalCorrectAttempts: 0
        },
        byDifficulty: difficultyStats,
        byType: typeStats
      }
    });
  } catch (error) {
    console.error('Error fetching question stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching question statistics'
    });
  }
};

module.exports = {
  getQuestionsByCategory,
  getAllQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  toggleQuestionStatus,
  getQuestionStats
};
