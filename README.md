# Mentor-Student Management Web App

A React + TypeScript + Supabase web app for mentors to manage their students.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase
The `.env` file contains Supabase credentials. To use your own Supabase project:
1. Create a project at https://supabase.com
2. Update `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`

### 3. Run Database Migration
1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Copy and run the contents of `supabase/migrations/20260313140154_create_mentor_student_schema.sql`

### 4. Start Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

## Features
- Mentor authentication (sign up / sign in)
- Add, view, edit, and delete students
- Dashboard with stats (total students, arrears, low CGPA, scholarships)
- Search students by name or register number
- Download student list as CSV
- Download individual student profile as text file

## Tech Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Supabase (Authentication + Database)
- Lucide React (Icons)
