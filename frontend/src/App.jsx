import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Categories from './pages/Categories'
import AdminCategories from './pages/AdminCategories'
import AdminQuestions from './pages/AdminQuestions'
import Quiz from './pages/Quiz'
import QuizSession from './pages/QuizSession'
import QuizHistory from './pages/QuizHistory'
import EnhancedQuizHistory from './pages/EnhancedQuizHistory'
import CodingChallenges from './pages/CodingChallenges'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminCodingChallenges from './pages/AdminCodingChallenges'
import AdminChallengeForm from './pages/AdminChallengeForm'
import CodingChallenge from './pages/CodingChallenge'
import './App.css'

function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('checking')

  useEffect(() => {
    // Test backend connection on app load
    testBackendConnection()
  }, [])

  const testBackendConnection = async () => {
    try {
      const response = await fetch('/api/test')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Backend connection successful:', data)
        setIsConnected(true)
        setConnectionStatus('connected')
      } else {
        throw new Error('Backend not responding')
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error)
      setIsConnected(false)
      setConnectionStatus('disconnected')
    }
  }

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header isConnected={isConnected} connectionStatus={connectionStatus} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home isConnected={isConnected} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/categories" 
                element={
                  <ProtectedRoute>
                    <Categories />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/quiz-history" 
                element={
                  <ProtectedRoute>
                    <EnhancedQuizHistory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/enhanced-quiz-history" 
                element={
                  <ProtectedRoute>
                    <EnhancedQuizHistory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/coding-challenges" 
                element={
                  <ProtectedRoute>
                    <CodingChallenges />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/coding-challenges/:id" 
                element={
                  <ProtectedRoute>
                    <CodingChallenge />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/quiz/:categoryId" 
                element={
                  <ProtectedRoute>
                    <QuizSession />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/categories" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminCategories />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/questions" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminQuestions />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminUsers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/coding-challenges" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminCodingChallenges />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/coding-challenges/create" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminChallengeForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/coding-challenges/:id/edit" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminChallengeForm />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

