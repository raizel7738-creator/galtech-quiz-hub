import React from 'react'
import { Link } from 'react-router-dom'
import { Calculator, Code, BookOpen, Award, Clock, ArrowRight, Users, TrendingUp, Shield, Zap, Star, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import '../styles/Landing.css'

const Home = ({ isConnected }) => {
	const { isAuthenticated, user } = useAuth()

	return (
		<div className="landing">
			{/* Hero Section */}
			<section className="hero-section">
				<div className="hero-container">
					<div className="hero-content">
						<div className="hero-badge">
							<Star size={16} className="star-icon" />
							<span>Trusted by 1000+ students</span>
						</div>
						<h1 className="hero-title">
							{isAuthenticated ? (
								<>Welcome back, <span className="highlight-text">{user?.name}</span>!</>
							) : (
								<>Master <span className="highlight-text">Programming & Aptitude</span> with Interactive Quizzes</>
							)}
						</h1>
						<p className="hero-description">
							Practice with carefully curated MCQs across aptitude and programming. 
							Track your progress, review detailed explanations, and build confidence step by step.
						</p>
						<div className="hero-cta">
							{isAuthenticated ? (
								<Link to="/categories" className="btn btn-primary btn-large">
									<Zap size={20} />
									Start Learning
									<ArrowRight size={18} />
								</Link>
							) : (
								<>
									<Link to="/register" className="btn btn-primary btn-large">
										<Zap size={20} />
										Get Started Free
										<ArrowRight size={18} />
									</Link>
									<Link to="/login" className="btn btn-secondary">
										Sign In
									</Link>
								</>
							)}
						</div>
						{isConnected === false && (
							<div className="connection-warning">
								<Shield size={16} />
								Backend disconnected. Some features may be limited.
							</div>
						)}
					</div>
					<div className="hero-visual">
						<div className="visual-grid">
							<div className="visual-card code-card">
								<div className="card-header">
									<div className="dots">
										<span></span><span></span><span></span>
									</div>
								</div>
								<div className="card-content">
									<div className="code-line">function solve() {'{'}</div>
									<div className="code-line indent">return answer;</div>
									<div className="code-line">{'}'}</div>
								</div>
							</div>
							<div className="visual-card stats-card">
								<div className="stats-header">
									<TrendingUp size={20} className="stats-icon" />
									<span>Progress</span>
								</div>
								<div className="progress-bar">
									<div className="progress-fill"></div>
								</div>
								<div className="stats-text">85% Complete</div>
							</div>
							<div className="visual-card quiz-card">
								<div className="quiz-question">What is 2 + 2?</div>
								<div className="quiz-options">
									<div className="option correct">✓ 4</div>
									<div className="option">3</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="features-section">
				<div className="container">
					<div className="section-header">
						<h2 className="section-title">Choose Your Learning Path</h2>
						<p className="section-subtitle">
							Master different skills with our carefully designed quiz categories
						</p>
					</div>
					<div className="features-grid">
						<div className="feature-card featured">
							<div className="feature-icon math-icon">
								<Calculator size={24} />
							</div>
							<h3>Mathematical Aptitude</h3>
							<p>Master percentages, ratios, profit & loss, time & work, and more with step-by-step explanations.</p>
							<div className="feature-stats">
								<span className="stat-item">20+ Questions</span>
								<span className="stat-item">Beginner Friendly</span>
							</div>
						</div>
						<div className="feature-card">
							<div className="feature-icon code-icon">
								<Code size={24} />
							</div>
							<h3>Programming Logic</h3>
							<p>Sharpen your algorithmic thinking with logic puzzles and programming fundamentals.</p>
							<div className="feature-stats">
								<span className="stat-item">Multiple Languages</span>
								<span className="stat-item">Logic Focus</span>
							</div>
						</div>
						<div className="feature-card">
							<div className="feature-icon program-icon">
								<BookOpen size={24} />
							</div>
							<h3>Code Analysis</h3>
							<p>Analyze code snippets and predict outputs across Python, Java, C++, and JavaScript.</p>
							<div className="feature-stats">
								<span className="stat-item">4 Languages</span>
								<span className="stat-item">Output Prediction</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Benefits Section */}
			<section className="benefits-section">
				<div className="container">
					<div className="benefits-grid">
						<div className="benefit-item">
							<div className="benefit-icon">
								<CheckCircle size={20} />
							</div>
							<div className="benefit-content">
								<h4>Instant Feedback</h4>
								<p>Get detailed explanations for every answer</p>
							</div>
						</div>
						<div className="benefit-item">
							<div className="benefit-icon">
								<TrendingUp size={20} />
							</div>
							<div className="benefit-content">
								<h4>Track Progress</h4>
								<p>Monitor your improvement over time</p>
							</div>
						</div>
						<div className="benefit-item">
							<div className="benefit-icon">
								<Clock size={20} />
							</div>
							<div className="benefit-content">
								<h4>Timed Challenges</h4>
								<p>Practice under realistic exam conditions</p>
							</div>
						</div>
						<div className="benefit-item">
							<div className="benefit-icon">
								<Users size={20} />
							</div>
							<div className="benefit-content">
								<h4>Trusted Platform</h4>
								<p>Used by students and professionals</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="cta-section">
				<div className="container">
					<div className="cta-content">
						<h2>Ready to Start Your Learning Journey?</h2>
						<p>Join thousands of students who are already improving their skills with our interactive quizzes.</p>
						<div className="cta-buttons">
							{isAuthenticated ? (
								<Link to="/categories" className="btn btn-primary btn-large">
									<BookOpen size={20} />
									Browse Categories
									<ArrowRight size={18} />
								</Link>
							) : (
								<>
									<Link to="/register" className="btn btn-primary btn-large">
										<Zap size={20} />
										Start Learning Now
										<ArrowRight size={18} />
									</Link>
									<Link to="/categories" className="btn btn-outline">
										Explore Categories
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}

export default Home
