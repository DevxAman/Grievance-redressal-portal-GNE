# GNDEC Grievance Redressal Portal

A modern web application for handling grievances at Guru Nanak Dev Engineering College.

## 🚀 Features

- **User Authentication**: Role-based login system (Student, Clerk, DSW, Admin)
- **Grievance Filing**: Easy submission of grievances with file attachments
- **Status Tracking**: Real-time tracking of grievance status
- **Admin Dashboard**: Comprehensive management for administrators
- **Email Notifications**: Updates at each step of the grievance process

## 🔑 Authentication System

The portal uses a Supabase database with role-based authentication:

- **User Roles**:
  - **Student** (user_id prefix: S) - Can file and track grievances
  - **Clerk** (user_id prefix: C) - First level of grievance processing
  - **DSW** (user_id prefix: D) - Dean Student Welfare, higher authority
  - **Admin** (user_id prefix: A) - System administrators

- **Login Process**:
  1. Enter your user_id (e.g., S123 for students)
  2. Enter your password
  3. System automatically detects your role from user_id prefix
  4. Redirected to role-specific dashboard

- **Signup Process**:
  1. Enter your user_id (following the S/C/D/A prefix convention)
  2. Enter your GNDEC email (@gndec.ac.in)
  3. Create a password
  4. Verify email with OTP sent to your email
  5. Account created with role determined by user_id prefix

## 💻 Development

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account with project setup

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/gndec-grievance-portal.git
   cd gndec-grievance-portal
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment variables
   Create a `.env` file with the following:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start development server
   ```bash
   npm run dev
   ```

### Database Setup

The project requires a Supabase database with the following tables:

1. **users** - For authentication and user profile
   - `id` - Auto-incrementing primary key
   - `user_id` - Unique identifier with role prefix (e.g., S123)
   - `password` - Bcrypt hashed password
   - `role` - User role (student, clerk, dsw, admin)
   - `email` - GNDEC email address
   - `created_at` - Timestamp

2. A SQL migration is included in `supabase/migrations/20230601_init_users.sql` with 50 pre-populated user entries.

## 🔧 API Endpoints

### Authentication Endpoints

- **POST /api/auth/login**
  - Request: `{ "user_id": "S123", "password": "password123" }`
  - Response: `{ "success": true, "user": {...}, "redirectPath": "/dashboard" }`

- **POST /api/auth/signup**
  - Request: `{ "user_id": "S123", "email": "student@gndec.ac.in", "password": "password123" }`
  - Response: `{ "success": true, "message": "Verification code sent to your email..." }`

- **POST /api/auth/verify**
  - Request: `{ "email": "student@gndec.ac.in", "otp": "123456" }`
  - Response: `{ "success": true, "message": "Email verified successfully!", "user": {...} }`

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 👥 Contributors

- [Your Name](https://github.com/yourusername)

## Tech Stack

- React.js + TypeScript + Vite
- Supabase for backend (Authentication, Database, Storage)
- Tailwind CSS for styling
- React Router for navigation
- GSAP and React Spring for animations

## Setup Instructions

### Prerequisites

- Node.js and npm
- A Supabase account

### Setting up Supabase

1. Create a new project in Supabase
2. Run the SQL migrations in `supabase/migrations/20230101000000_initial_schema.sql`
3. Set up storage buckets:
   - Create a bucket named `grievance-documents` with public access

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

## Database Schema

### Tables

- **users**: User profiles
  - id (UUID, PK)
  - email (TEXT)
  - name (TEXT)
  - role (TEXT) - 'student', 'clerk', 'admin', 'dsw'
  - phone_number (TEXT)
  - college_roll_number (TEXT, optional)
  - created_at (TIMESTAMP)

- **grievances**: Grievance records
  - id (UUID, PK)
  - user_id (UUID, FK to users)
  - title (TEXT)
  - description (TEXT)
  - category (TEXT) - 'academic', 'infrastructure', 'administrative', 'financial', 'other'
  - status (TEXT) - 'pending', 'under-review', 'in-progress', 'resolved', 'rejected'
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
  - assigned_to (UUID, FK to users, optional)
  - documents (TEXT[])
  - feedback (TEXT, optional)

- **responses**: Admin responses to grievances
  - id (UUID, PK)
  - grievance_id (UUID, FK to grievances)
  - admin_id (UUID, FK to users)
  - response_text (TEXT)
  - created_at (TIMESTAMP)

- **statistics**: System statistics
  - id (UUID, PK)
  - resolution_rate (NUMERIC)
  - avg_response_time (NUMERIC)
  - grievances_resolved (INTEGER)
  - user_satisfaction (NUMERIC)
  - last_updated (TIMESTAMP)

## Row-Level Security (RLS) Policies

- Users can only access their own profiles and grievances
- Admins and DSW can view all users
- Staff (admin, clerk, DSW) can manage all grievances
- Statistics are read-only for regular users

## API Endpoints

All API interactions are handled through Supabase client functions:

- Authentication: signIn, signUp, signOut
- Grievances: fetchGrievances, submitGrievance, updateGrievanceStatus
- Responses: addResponse
- Statistics: fetchStatistics

## Real-time Features

The application uses Supabase Realtime to automatically update:

- Grievance statuses
- Statistics
- Admin responses

## Deployment

1. Build the application:
   ```
   npm run build
   ```

2. Deploy the `dist` folder to your preferred hosting service (Vercel, Netlify, etc.)

3. Ensure environment variables are set on your hosting platform 