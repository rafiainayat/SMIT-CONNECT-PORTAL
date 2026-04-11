# SMIT Connect - Feature Walkthrough

## ✅ **Getting Started**

Your app now has all the following features implemented:

---

## 📚 **1. Student Features**

### ✅ Signup / Login
- **Signup Page**: `/signup`
- **Login Page**: `/login`
- Creates profile automatically
- Stores session in browser

### ✅ Student Dashboard
- **Route**: `/student/dashboard`
- Shows greeting with student name
- Displays stats: applications, pending leaves
- Recent applications list
- Recent leaves list
- Quick action buttons to browse courses and submit leaves

### ✅ Browse & Apply for Courses
- **Route**: `/courses`
- View all open courses
- Search courses by name
- Filter by status (open/closed)
- Apply for courses (1-click application)
- See application status

### ✅ Leave Management
- **Route**: `/student/leaves`
- Submit leave requests with:
  - Reason
  - Start date / End date
  - Optional image attachment (JPG, PNG, WEBP)
- View all submitted leaves
- See approval status
- Filter leaves by status

---

## 🛡️ **2. Admin Features**

### ✅ Admin Dashboard
- **Route**: `/admin/dashboard`  (restricted to admins only)
- Shows key statistics:
  - Total students
  - Total courses
  - Total applications
  - Pending leaves

### ✅ Student Management
- **Route**: `/admin/students`
- View all registered students
- Search students by name/email/CNIC
- Edit student details
- Bulk upload students via Excel
- Delete students

### ✅ Course Management
- **Route**: `/admin/courses`
- Create new courses
- Edit existing courses
- Change course status (open/closed)
- Delete courses
- View total applications per course

### ✅ Leave Approvals
- **Route**: `/admin/leaves`
- View all pending leave requests
- Approve or reject leaves
- See student details
- Filter by status (pending/approved/rejected)

### ✅ Admin Settings
- **Route**: `/admin/settings`
- Manage admin users
- System configuration

---

## 🗄️ **3. Add Sample Courses (IMPORTANT)**

Before testing, add sample courses to your database:

### **Step 1: Paste SQL in Supabase**
1. Go to **Supabase Dashboard → SQL Editor**
2. Click **New Query**
3. Copy this SQL:

```sql
INSERT INTO public.courses (name, status) VALUES
('Web Development Fundamentals', 'open'),
('React Advanced Patterns', 'open'),
('Database Design & Optimization', 'open'),
('Python for Data Science', 'closed'),
('Cloud Architecture with AWS', 'open'),
('Mobile App Development', 'open'),
('Machine Learning Basics', 'closed'),
('DevOps & CI/CD Pipeline', 'open');
```

4. Click **RUN**
5. Should show "8 rows inserted"

---

## 🧪 **4. Test Workflow**

### **Scenario 1: Student Signup → Browse Courses → Apply → Submit Leave**

1. Go to `/signup`
2. Create account with:
   - Name: `John Doe`
   - Email: `john.doe@example.com`
   - Password: `123456`
3. ✅ You should see **Student Dashboard**
4. Click **"Browse Courses"** button
5. See list of 8 courses
6. Click **"Apply Now"** on any open course
7. ✅ Button changes to "Already Applied"
8. Go to **"Submit a Leave"** or `/student/leaves`
9. Fill in:
   - Reason: `Medical appointment at hospital`
   - Start Date: Pick a date
   - End Date: Pick same or later date
   - Image: Optional (attach a JPG/PNG)
10. Click **"Submit Leave Request"**
11. ✅ See leave in "My Leave Requests" section

### **Scenario 2: Admin Panel**

1. Create admin user first:
   - Go to **Supabase Dashboard → Authentication → Users**
   - Click **Invite User**
   - Enter email: `admin@smit.com`
   - Uncheck "Auto confirm"
   - Click **Send Invite**
   - Open invite email, set password, confirm signup

2. Make them admin:
   - Go to **Supabase Dashboard → SQL Editor**
   - Run this:
   ```sql
   UPDATE public.users SET role = 'admin' WHERE email = 'admin@smit.com';
   ```

3. Login as admin with `admin@smit.com` / (your password)

4. You should see **Admin Dashboard** with:
   - Total Students count
   - Total Courses (8)
   - Total Applications
   - Pending Leaves count

5. Click on cards to manage:
   - Students: View/edit/delete students
   - Courses: Create/edit courses
   - Leaves: Approve or reject leave requests
   - Settings: Manage other admins

---

## 🔍 **5. Key Pages Reference**

### **Public Routes**
- `/` - Homepage
- `/login` - Login page
- `/signup` - Signup page
- `/courses` - Browse courses

### **Student Routes**
- `/student/dashboard` - Dashboard
- `/student/leaves` - Leave requests

### **Admin Routes**
- `/admin/dashboard` - Dashboard
- `/admin/students` - Student management
- `/admin/courses` - Course management
- `/admin/leaves` - Leave approvals
- `/admin/settings` - Settings

---

## 📝 **6. Database Tables Schema**

| Table | Columns | Relationships |
|-------|---------|---|
| **users** | id, name, email, cnic, roll_number, role | (has many) applications, leaves |
| **courses** | id, name, status, created_at | (has many) applications |
| **applications** | id, user_id, course_id, status | FK: users, courses |
| **leaves** | id, user_id, reason, start_date, end_date, image_url, status | FK: users |

---

## ⚙️ **7. Backend Functions (RLS Bypass)**

Two special database functions bypass RLS for authentication:

- `get_my_profile()` - Get current user profile
- `ensure_user_profile(id, name, email)` - Create profile if not exists

These are used automatically by signup/login.

---

## 🚀 **8. What's Next?**

After testing, you can:

1. **Enable Email Confirmation** - Supabase Settings → Email auth
2. **Add Password Reset** - Already built in authService
3. **Deploy to Vercel** - Build: `npm run build`
4. **Connect Custom Domain** - Update Supabase CORS settings
5. **Add Notifications** - React-hot-toast already integrated
6. **File Storage** - S3 bucket for leave image uploads

---

## 💡 **Tips**

- Use different emails for each test account
- Admin can see everything; Students only see their own data
- RLS policies enforce data security at database level
- All fields validated on both frontend and backend

---

## 📞 **Need Help?**

Check the console (F12) for detailed error messages.
All errors logged with context for debugging.

---

**Enjoy testing SMIT Connect! 🎉**
