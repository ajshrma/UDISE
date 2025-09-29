# 🎓 UDISE Dashboard

A comprehensive full-stack dashboard for managing and analyzing school data across India, built with modern web technologies.

## 🚀 Live Demo

- **Frontend**: [Deployed on Vercel](https://udise-dashboard.vercel.app) (Coming Soon)
- **Backend**: [Deployed on Render](https://udise-backend.onrender.com) (Coming Soon)

## 📋 Features

### ✅ **Authentication & Security**
- JWT-based authentication with refresh tokens
- User registration and login
- Protected routes
- Secure password hashing with bcrypt

### ✅ **Data Management**
- Complete CRUD operations for schools
- Hierarchical filtering (State → District → Block → Village)
- Real-time data updates
- Pagination and search functionality

### ✅ **Analytics & Visualization**
- Interactive pie charts for data distribution
- Management type analysis (Government, Private, Aided)
- Location distribution (Rural/Urban)
- School type breakdown (Co-Ed, Girls, Boys)

### ✅ **User Experience**
- Responsive design for all devices
- Loading skeletons and states
- Toast notifications
- Error handling and boundaries
- Form validation with Zod

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN/UI
- **State Management**: React Query (TanStack Query)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT with refresh tokens
- **Validation**: Mongoose schemas
- **Email**: SendGrid integration

### **Deployment**
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- MongoDB Atlas account
- Git

### **1. Clone the Repository**
```bash
git clone https://github.com/ajshrma/UDISE.git
cd UDISE
```

### **2. Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/udise-dashboard
JWT_AUTH_SECRET=your-jwt-auth-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
JWT_AUTH_EXPIRATION=1d
JWT_REFRESH_EXPIRATION=7d
CLIENT_URL=http://localhost:3000
PORT=5000
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_EMAIL=your-email@domain.com
```

Start the backend:
```bash
node app.js
```

### **3. Frontend Setup**
```bash
cd frontend
npm install
```

Create `.env.local` file:
```env
NEXT_PUBLIC_SERVER_URL=http://localhost:5000/api/v1
```

Start the frontend:
```bash
npm run dev
```

### **4. Database Setup**
```bash
# Import sample data
cd backend
node quick-fix-data.js
```

## 📁 Project Structure

```
udise-dashboard/
├── backend/                     # Express backend
│   ├── src/
│   │   ├── controllers/         # API controllers
│   │   ├── models/             # MongoDB models
│   │   ├── routes/             # API routes
│   │   ├── middlewares/        # Auth middleware
│   │   ├── lib/                # Utilities
│   │   └── config/             # Database config
│   ├── data/                   # Kaggle dataset files
│   └── package.json
├── frontend/                   # Next.js frontend
│   ├── src/
│   │   ├── app/                # App router pages
│   │   ├── components/         # React components
│   │   ├── lib/                # Utilities
│   │   └── context/            # React context
│   └── package.json
├── docs/                       # Documentation and assignment files
├── schools.csv                 # Dataset file
└── README.md
```

## 🔧 API Endpoints

### **Authentication**
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/verify-email/:token` - Email verification

### **Schools Management**
- `GET /api/v1/schools` - List schools with filtering
- `GET /api/v1/schools/:id` - Get school by ID
- `POST /api/v1/schools` - Create new school (Auth required)
- `PUT /api/v1/schools/:id` - Update school (Auth required)
- `DELETE /api/v1/schools/:id` - Delete school (Auth required)

### **Analytics**
- `GET /api/v1/schools/distribution` - Get distribution data for charts
- `GET /api/v1/schools/filters` - Get filter options

## 🔒 Security Features

- JWT token-based authentication with refresh tokens
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting (production)
- Email verification system

## 📊 Data Schema

### **School Model**
```javascript
{
  udise_code: String (required, unique),
  school_name: String (required),
  state: String (required),
  district: String (required),
  block: String (required),
  village: String (required),
  management_type: String (enum),
  location: String (enum: Rural/Urban),
  school_type: String (enum: Co-Ed/Girls/Boys),
  total_students: Number,
  total_teachers: Number,
  establishment_year: Number,
  school_category: String,
  contact_number: String,
  address: String,
  pincode: String
}
```

## 🚀 Deployment

### **Backend (Render)**
1. Connect GitHub repository to Render
2. Set environment variables
3. Deploy automatically on push

### **Frontend (Vercel)**
1. Connect GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically on push

## 📈 Performance

- **Frontend**: Optimized with Next.js 15
- **Backend**: Efficient MongoDB queries with indexes
- **Database**: MongoDB Atlas with proper indexing
- **Caching**: React Query for client-side caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**ajshrma**
- GitHub: [@ajshrma](https://github.com/ajshrma)
- Repository: [https://github.com/ajshrma/UDISE](https://github.com/ajshrma/UDISE)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [ShadCN/UI](https://ui.shadcn.com/) for beautiful components
- [MongoDB Atlas](https://www.mongodb.com/atlas) for the database
- [Vercel](https://vercel.com/) and [Render](https://render.com/) for hosting

---

**🎯 Ready to explore the UDISE Dashboard? Start with the quick setup guide above!**