# SMIT Connect — Supabase Setup Guide

## Step-by-Step Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click **New Project**
3. Enter project name: `smit-connect`
4. Set password (save it!)
5. Choose region closest to you
6. Click **Create New Project** and wait for it to initialize

### 2. Get Your Credentials
After project is created:
1. Go to **Settings** → **API**
2. Copy the following and add to `.env` file:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 3. Create Database Schema
1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Copy the entire contents of `database.sql` from this project
4. Paste into the SQL editor
5. Click **Run**
6. Wait for it to complete (you should see ✅ success)

### 4. Create Admin User
1. Go to **Authentication** → **Users**
2. Click **Invite User**
3. Enter admin email: (use your email)
4. Uncheck "Auto confirm user sign up"
5. Click **Send Invite**
6. Open the invite email and set password (minimum 6 characters)
7. After signup, note the **UUID** from the Auth Users list

### 5. Add Admin Profile
1. Go to **SQL Editor**
2. Create a new query with this:
   ```sql
   INSERT INTO public.users (id, name, cnic, roll_number, role, email)
   VALUES (
     'PASTE-THE-UUID-HERE',
     'Admin User',
     '12345-1234567-1',
     'ADMIN-001',
     'admin',
     'admin@smit.com'
   );
   ```
3. Replace `PASTE-THE-UUID-HERE` with the UUID from step 7
4. Replace email, cnic, and roll_number with actual values
5. Click **Run**

### 6. Create Storage Bucket (Optional - for leave images)
1. Go to **Storage** in sidebar
2. Click **Create New Bucket**
3. Name: `leave-images`
4. Uncheck "Private bucket" (make it public)
5. Click **Create**

### 7. Test the Connection
1. Run your app: `npm run dev`
2. Try to sign up with:
   - Name: Test User
   - Email: test@example.com
   - Password: 123456 (min 6 characters)
3. You should be able to login successfully!

### 8. Create Sample Data (Optional)
In SQL Editor, run:
```sql
INSERT INTO public.courses (name, status) VALUES
('Web Development Fundamentals', 'open'),
('React Advanced Patterns', 'open'),
('Database Design & Optimization', 'closed');
```

## Key Features of This Schema

✅ **Free Signup** - No pre-registration needed (CNIC and Roll Number are optional)
✅ **Role-Based Access** - Student vs Admin with RLS policies
✅ **Course Management** - Add/close courses easily
✅ **Applications** - Track course applications with unique constraint
✅ **Leave Management** - Students submit leaves with optional image
✅ **Security** - Row Level Security (RLS) enforces permissions at DB level
✅ **Performance** - Indexes on frequently queried columns

## Database Structure

```
users (id, name, cnic, roll_number, role, email)
  ↓
  ├── applications → courses
  └── leaves
```

## Updating the Schema Later

If you need to add/modify the schema:
1. Go to Supabase Dashboard → **SQL Editor**
2. Write your SQL query
3. Test carefully before running in production

## Troubleshooting

**RLS blocking access?**
- Check the `get_my_role()` function is working
- Make sure user exists in `users` table with correct role

**Auth not syncing with users table?**
- After signup, verify entry in `users` table matches auth user ID

**Signup fails?**
- Check `.env` has correct credentials
- Verify users table RLS policy allows inserts

## Commands Reference

```bash
# Run app with Supabase
npm run dev

# Check for errors
# Look at browser console and Supabase logs
```

## Next Steps

1. ✅ Complete signup/login
2. Build student dashboard
3. Build course listing
4. Build course application flow
5. Build leave submission
6. Build admin panel
7. Deploy to production (Vercel)

Good to go! 🚀
