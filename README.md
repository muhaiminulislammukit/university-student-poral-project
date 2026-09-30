# 🎓 CSC-114-Student-Portal

A complete, modern, dynamic academic batch management web application for the **CSC 114** department. Built with responsive glassmorphism aesthetics, real-time client-side `localStorage` data persistence, on-demand **MySQL database dump generator**, and an **Express.js REST API** backend.

---

## 📁 Project Architecture

```
CSC-114-Student-Portal/
│
├── Frontend
│   ├── Index.html          # Unified Master Academic Portal (All 10 modules + Role Switcher)
│   ├── Admin.html          # Executive Administrative Control Panel
│   ├── Student.html        # Personalized Student Dashboard & Transcript
│   ├── css/
│   │   └── style.css       # Complete modern responsive design system & dark/light mode
│   └── js/
│       ├── app.js          # Core routing, CRUD operations, state handling & modals
│       └── data.js         # LocalStorage persistence engine & dynamic MySQL DDL/DML generator
│
├── Backend
│   ├── server.js           # Express.js REST API Server
│   ├── package.json        # Backend dependencies (express, cors, mysql2, dotenv)
│   └── db.js               # MySQL connection pool configuration
│
└── Database
    └── schema.sql          # Production-ready MySQL 8.0+ schema with relational tables & seed data
```

---

## 🌟 Key Features & Modules

1. **Authentication & Role-Based Access Control (RBAC)**:
   - Supports **Student**, **Teacher**, and **Admin** roles.
   - Built-in **1-Click Quick Demo Login** chips.
   - Live role switcher in the top navigation bar for testing permissions on the fly.

2. **Dashboard**:
   - Executive statistics: *Total Students*, *Active Courses*, *Batch Attendance %*, and *Average CGPA*.
   - Interactive Section Analytics chart (Section A vs Section B performance).
   - "Today's Routine" timetable ticker.
   - Recent departmental announcements and urgent alert banners.

3. **Student Management (Full CRUD & Export)**:
   - Add, edit, and delete student records with custom confirmation modals.
   - Live search (by Name, Student ID, Email, Phone).
   - Filter by Section (`Section A`, `Section B`).
   - Student Academic Dossier: Detailed modal with personal data, enrolled courses, attendance, and exam grades.
   - Export students directly to **CSV** (`.csv`) or **JSON** (`.json`).

4. **Course Management**:
   - Course cards displaying Credit Hours, Teacher, Department, Classroom, and detailed syllabus description.
   - Add / Edit / Delete course offerings.

5. **Daily Attendance Tracker**:
   - Filter by Course, Section, and Date picker.
   - Roll-call table with 3-state toggles: `[Present]`, `[Late]`, `[Absent]`.
   - Batch actions: `Mark All Present`, `Mark All Absent`.
   - Real-time Present / Late / Absent counters and attendance percentage calculation.
   - Automatically recalculates students' overall attendance rate into memory and `localStorage`.

6. **Results & Gradebook**:
   - Exam mark recording: Midterm (30), Final (50), Continuous/Quiz (20).
   - Live auto-calculation of total score, letter grade (`A+`, `A`, `A-`, `B+`, `B`, `B-`, `C+`, `C`, `D`, `F`), and Grade Point Average (GPA).
   - Official Printable Academic Transcript format.

7. **Assignments**:
   - Post assignments with deadlines, course tags, and max points.
   - Student submission portal (mock file / GitHub repository submission with notes).
   - Teacher grading console (review student submissions, award marks and feedback).

8. **Class Routine / Timetable**:
   - Weekly interactive schedule view with day filters (`Sunday` to `Thursday`).
   - Live "Up Next" tag for today's classes.
   - Admin controls to add/edit timetable slots.

9. **Notice Board**:
   - Categorized notices (`Academic`, `Exam`, `Urgent`, `Event`).
   - Pin important notices to the top.
   - Read full circulars in dedicated modal view.

10. **Student Profile**:
    - Editable profile (Phone, Address, Emergency Contact, Guardian Phone).
    - Academic badges: Student ID, Section, Batch, Current CGPA, and Attendance compliance.

11. **Database Console & MySQL Exporter**:
    - Live table record counters for all 8 entities.
    - **1-Click "Download MySQL Dump (.sql)"**: Dynamically compiles all live data currently in `localStorage` into a complete MySQL SQL script with `CREATE TABLE` DDL and `INSERT INTO` DML statements!
    - Full JSON database backup and restore via file upload.
    - Factory reset option.

---

## 🚀 How to Run

### Method 1: Open in Any Browser (Zero Installation)
Simply double click or open **[Index.html](file:///c:/Users/USER/Desktop/university/Index.html)** in Google Chrome, Microsoft Edge, Firefox, or Safari. Everything runs standalone with `localStorage`!

### Method 2: Local HTTP Server (Already active)
```bash
# Serves frontend on port 3000
http://localhost:3000/Index.html
```

### Method 3: Express Backend API Server
```bash
cd Backend
npm install
node server.js
```
The REST API will be accessible on `http://localhost:5000/api/...`.

---

## 🔑 Demo Credentials

| Role | Username / ID | Password | Name |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `123` | Prof. Dr. M. Rahman (Head of Dept) |
| **Teacher** | `ahmed` | `123` | Dr. Ahmed Hossain (Course Teacher) |
| **Student 1** | `CSC114-001` | `123` | Rahim Ahmed (Section A) |
| **Student 2** | `CSC114-002` | `123` | Nusrat Jahan (Section A) |
| **Student 3** | `CSC114-003` | `123` | Sakib Hasan (Section B) |
