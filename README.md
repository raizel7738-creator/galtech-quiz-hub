# GALTech Quiz Hub - MERN Stack Quiz Application

A comprehensive quiz web application for students at GALTech School of Technology to assess their knowledge in General Mathematical Aptitude, Programming Aptitude, and Program-Based Questions.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd galtech-quiz-hub
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/galtech-quiz-hub
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

5. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # For local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in .env
   ```

6. **Run the Application**
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Test endpoint: http://localhost:5000/api/test
   - Health check: http://localhost:5000/api/health

## 📋 Project Structure

```
galtech-quiz-hub/
├── backend/
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── .gitignore         # Backend gitignore
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main App component
│   │   └── main.jsx       # React entry point
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
└── README.md              # This file
```

## 🎯 Development Roadmap

### ✅ Step 1: Basic Setup (COMPLETED)
- [x] Node.js + Express backend setup
- [x] MongoDB connection with Mongoose
- [x] React frontend with Vite
- [x] Frontend-backend API connection
- [x] Test endpoints and health checks

### ✅ Step 2: User Authentication (COMPLETED)
- [x] User registration and login system
- [x] JWT-based authentication
- [x] Password hashing with bcrypt
- [x] Role-based access (student/admin)
- [x] Protected routes and middleware
- [x] User profile management
- [x] Secure logout functionality

### ✅ Step 3: Quiz Categories Management (COMPLETED)
- [x] Category model with validation and relationships
- [x] CRUD operations for categories (admin only)
- [x] Category browsing for students with filters
- [x] Search and filter functionality
- [x] Difficulty-based categorization
- [x] Category status management (active/inactive)
- [x] Admin category management interface
- [x] Student category browsing interface
- [x] Sample data seeding script

### 🔄 Next Steps
- [ ] **Step 4:** MCQ System (Add/View Questions)
- [ ] **Step 5:** Quiz Attempt & Scoring
- [ ] **Step 6:** Attempt History Tracking
- [ ] **Step 7:** Program-Based Questions
- [ ] **Step 8:** Coding Challenges (Optional)
- [ ] **Step 9:** Admin Panel

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React.js** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library

## 🧪 Testing the Setup

1. **Backend Test:**
   ```bash
   curl http://localhost:5000/api/test
   ```

2. **Health Check:**
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Frontend Test:**
   - Visit http://localhost:3000
   - Click "Test Backend Connection" button
   - Verify connection status in header

## 📝 API Endpoints

### Current Endpoints
- `GET /api/test` - Test connection endpoint
- `GET /api/health` - Health check with database status

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change user password
- `POST /api/auth/logout` - Logout user

### Categories Endpoints
- `GET /api/categories` - Get all active categories (public)
- `GET /api/categories/all` - Get all categories including inactive (admin only)
- `GET /api/categories/:id` - Get single category by ID
- `POST /api/categories` - Create new category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)
- `PATCH /api/categories/:id/toggle-status` - Toggle category status (admin only)

### Upcoming Endpoints
- `GET /api/categories` - Get quiz categories
- `POST /api/categories` - Create quiz category (Admin)
- `GET /api/questions` - Get questions by category
- `POST /api/questions` - Add question (Admin)
- `POST /api/quiz/attempt` - Submit quiz attempt
- `GET /api/quiz/history` - Get user's quiz history

## 🎨 Features

### Current Features
- ✅ Responsive modern UI with gradient background
- ✅ Real-time backend connection status
- ✅ Connection testing interface
- ✅ Health monitoring
- ✅ Mobile-friendly design
- ✅ Complete user authentication system
- ✅ JWT-based secure login/logout
- ✅ Role-based access control (Student/Admin)
- ✅ User profile management
- ✅ Protected routes and middleware
- ✅ Password hashing and validation
- ✅ Quiz categories management system
- ✅ Admin category creation and management
- ✅ Student category browsing with filters
- ✅ Category status management (active/inactive)
- ✅ Difficulty-based categorization
- ✅ Search and filter functionality

### Planned Features
- 📚 Quiz categories management
- ❓ Multiple choice question system
- ⏱️ Timed quiz sessions
- 📊 Score tracking and analytics
- 📈 Performance history
- 👨‍💼 Admin dashboard
- 💻 Code-based questions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏫 About GALTech

GALTech School of Technology is committed to providing quality education in technology and programming. This quiz application is designed to enhance the learning experience of our students through interactive assessment tools.

---

**Happy Coding! 🚀**
