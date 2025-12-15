# Digital Complaint Management & Grievance Portal

A full-stack web application for complaint registration, tracking, and management built with Angular 16, Node.js (TypeScript), Express, and MySQL.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [User Roles](#user-roles)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)

## ✨ Features

### User Features
- User registration with role selection (User/Staff/Admin)
- Secure login with JWT authentication
- Submit complaints with title, description, category, and file attachments
- Track complaint status in real-time
- View resolution notes and updates

### Staff Features
- View all assigned complaints
- Update complaint status (In-progress, Resolved)
- Add resolution notes
- Contact information of complainants

### Admin Features
- Dashboard with analytics (status counts, category breakdown, user statistics)
- View all complaints in the system
- Assign complaints to staff members
- Filter complaints by status
- Monitor overall system activity

### General Features
- Role-based access control with Angular route guards
- Responsive design with Angular Material
- Modern UI/UX with gradient themes
- Real-time status tracking with visual timeline
- File attachment support
- Form validation on frontend and backend
- Error handling and user-friendly messages

## 🛠 Tech Stack

### Frontend
- **Angular 16** - Frontend framework
- **Angular Material** - UI component library
- **TypeScript** - Programming language
- **RxJS** - Reactive programming

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Programming language
- **MySQL** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts        # MySQL connection & schema initialization
│   │   ├── middleware/
│   │   │   └── auth.ts            # JWT authentication & role authorization
│   │   ├── routes/
│   │   │   ├── auth.ts            # Login & registration endpoints
│   │   │   ├── complaints.ts      # Complaint CRUD operations
│   │   │   └── users.ts           # User management & analytics
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript interfaces
│   │   └── index.ts               # Express server entry point
│   ├── uploads/                   # File attachments storage
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── admin-dashboard/    # Admin analytics & management
│   │   │   │   ├── complaint-details/  # New complaint form
│   │   │   │   ├── complaint-list/     # User's complaints view
│   │   │   │   ├── login/              # Login page
│   │   │   │   ├── navbar/             # Navigation bar
│   │   │   │   ├── registration/       # Registration page
│   │   │   │   ├── staff-dashboard/    # Staff complaint management
│   │   │   │   └── unauthorized/       # Access denied page
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts       # Route protection
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts # JWT token injection
│   │   │   ├── models/
│   │   │   │   └── index.ts            # TypeScript interfaces
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts     # Authentication service
│   │   │   │   └── complaint.service.ts # Complaint API service
│   │   │   ├── app.module.ts
│   │   │   ├── app.component.ts
│   │   │   └── app-routing.module.ts
│   │   ├── environments/
│   │   │   └── environment.ts          # API URL configuration
│   │   ├── styles.css                  # Global styles
│   │   └── index.html
│   ├── package.json
│   ├── angular.json
│   └── tsconfig.json
│
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd complaint-portal
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd frontend
npm install
```

## ⚙️ Configuration

### Backend Configuration
1. Create a `.env` file in the `backend` directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=complaint_portal
JWT_SECRET=your_secret_key_here
PORT=3000
```

2. Make sure MySQL server is running

### Frontend Configuration
The API URL is configured in `frontend/src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

## ▶️ Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```
The backend will start on `http://localhost:3000`

### Start Frontend Server
```bash
cd frontend
ng serve
```
The frontend will start on `http://localhost:4200`

### Build for Production
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
ng build --configuration=production
```

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **User** | Register, login, submit complaints, track status, view resolution |
| **Staff** | View assigned complaints, update status, add resolution notes |
| **Admin** | View all complaints, assign to staff, view analytics, manage system |

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |

#### Register Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "User",
  "contact_info": "1234567890"
}
```

#### Login Request Body
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login Response
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "User"
  }
}
```

### Complaint Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/complaints` | Create new complaint | User |
| GET | `/api/complaints/my` | Get user's complaints | User |
| GET | `/api/complaints/assigned` | Get assigned complaints | Staff |
| GET | `/api/complaints/all` | Get all complaints | Admin |
| GET | `/api/complaints/:id` | Get single complaint | Authenticated |
| PATCH | `/api/complaints/:id/assign` | Assign complaint to staff | Admin |
| PATCH | `/api/complaints/:id/status` | Update complaint status | Staff |

#### Create Complaint (multipart/form-data)
```
title: "Water leakage in bathroom"
description: "There is water leaking from the ceiling..."
category: "plumbing"
attachment: [file]
```

#### Assign Complaint Request Body
```json
{
  "staff_id": 2
}
```

#### Update Status Request Body
```json
{
  "status": "Resolved",
  "resolution_notes": "Fixed the leaking pipe and replaced damaged tiles."
}
```

### User Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users/staff` | Get all staff members | Admin |
| GET | `/api/users/analytics` | Get system analytics | Admin |

#### Analytics Response
```json
{
  "statusCounts": [
    { "status": "Open", "count": 5 },
    { "status": "Assigned", "count": 3 },
    { "status": "In-progress", "count": 2 },
    { "status": "Resolved", "count": 10 }
  ],
  "categoryCounts": [
    { "category": "plumbing", "count": 8 },
    { "category": "electrical", "count": 6 },
    { "category": "facility", "count": 4 },
    { "category": "other", "count": 2 }
  ],
  "totalUsers": [
    { "role": "User", "count": 15 },
    { "role": "Staff", "count": 5 },
    { "role": "Admin", "count": 2 }
  ]
}
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('User', 'Staff', 'Admin') NOT NULL DEFAULT 'User',
  contact_info VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Complaints Table
```sql
CREATE TABLE complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  staff_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('plumbing', 'electrical', 'facility', 'other') NOT NULL,
  status ENUM('Open', 'Assigned', 'In-progress', 'Resolved') DEFAULT 'Open',
  attachments VARCHAR(500),
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL
);
```

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Route guards protect unauthorized access
- **Input Validation**: Both frontend and backend validation
- **SQL Injection Prevention**: Parameterized queries with mysql2

## 📱 Application Routes

| Path | Component | Description | Access |
|------|-----------|-------------|--------|
| `/login` | LoginComponent | User login page | Public |
| `/register` | RegistrationComponent | User registration | Public |
| `/complaints` | ComplaintListComponent | View user's complaints | User |
| `/complaints/new` | ComplaintDetailsComponent | Submit new complaint | User |
| `/staff/dashboard` | StaffDashboardComponent | Manage assigned complaints | Staff |
| `/admin/dashboard` | AdminDashboardComponent | System overview & management | Admin |
| `/unauthorized` | UnauthorizedComponent | Access denied page | Public |

## 🎨 UI/UX Features

- Modern gradient color scheme (Purple/Indigo)
- Responsive design for mobile and desktop
- Visual status timeline for complaint tracking
- Category icons and color-coded badges
- Loading spinners and skeleton states
- Toast notifications for actions
- Form validation with error messages
- Split-screen authentication pages

## 📝 Complaint Lifecycle

```
Open → Assigned → In-progress → Resolved
```

1. **Open**: User submits a new complaint
2. **Assigned**: Admin assigns complaint to a staff member
3. **In-progress**: Staff starts working on the complaint
4. **Resolved**: Staff marks complaint as resolved with notes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
