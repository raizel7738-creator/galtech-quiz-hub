# GALTech Quiz Hub - Setup Instructions

## 🚀 Quick Setup Guide

### 1. Install Dependencies
```bash
# Install all dependencies (root, backend, and frontend)
npm run install-all
```

### 2. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas (update MONGODB_URI in backend/.env)
```

### 3. Run the Application
```bash
# Start both backend and frontend simultaneously
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend app on http://localhost:3000

### 4. Test the Setup
1. Open http://localhost:3000 in your browser
2. You should see the GALTech Quiz Hub homepage
3. Click "Test Backend Connection" to verify everything is working
4. The header should show "Backend Connected" status

## 🔧 Individual Commands

### Backend Only
```bash
cd backend
npm install
npm run dev
```

### Frontend Only
```bash
cd frontend
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 🐛 Troubleshooting

### Backend Connection Issues
1. Ensure MongoDB is running
2. Check if port 5000 is available
3. Verify backend server logs for errors

### Frontend Issues
1. Check if port 3000 is available
2. Ensure backend is running first
3. Clear browser cache if needed

### Environment Variables
Create `backend/.env` file with:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/galtech-quiz-hub
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

## ✅ Success Indicators

- ✅ Backend shows "Connected to MongoDB successfully"
- ✅ Frontend displays "Backend Connected" in header
- ✅ Test connection returns success message
- ✅ Health check shows database as "connected"

## 🎯 Next Steps

Once setup is complete, you're ready to proceed with:
- Step 2: User Authentication
- Step 3: Quiz Categories
- And beyond...

Happy coding! 🚀

