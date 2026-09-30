/**
 * CSC 114 Student Portal - Comprehensive Database & State Management
 * Persistent localStorage Data Store with MySQL Export Capability
 */

const DB_KEY = "CSC114_PORTAL_DATABASE_V2";
const AUTH_KEY = "CSC114_AUTH_USER_V2";
const THEME_KEY = "CSC114_THEME_PREF";

// Master Seed Data
const defaultDB = {
  users: [
    {
      id: "USR-001",
      username: "admin",
      email: "admin@csc114.edu",
      password: "123",
      role: "admin",
      name: "Prof. Dr. M. Rahman",
      title: "Head of Dept & Admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      department: "Computer Science & Engineering"
    },
    {
      id: "USR-002",
      username: "ahmed",
      email: "ahmed@csc114.edu",
      password: "123",
      role: "teacher",
      name: "Dr. Ahmed Hossain",
      title: "Associate Professor (CSC 114)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      department: "CSE"
    },
    {
      id: "USR-003",
      username: "CSC114-001",
      email: "rahim@example.com",
      password: "123",
      role: "student",
      studentId: "CSC114-001",
      name: "Rahim Ahmed",
      title: "Batch Representative (Section A)",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80",
      department: "CSE"
    },
    {
      id: "USR-004",
      username: "CSC114-002",
      email: "nusrat@example.com",
      password: "123",
      role: "student",
      studentId: "CSC114-002",
      name: "Nusrat Jahan",
      title: "Undergraduate Student",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      department: "CSE"
    }
  ],

  students: [
    {
      id: "CSC114-001",
      name: "Rahim Ahmed",
      email: "rahim@example.com",
      phone: "+880 1711-000001",
      section: "A",
      batch: "56th Batch",
      bloodGroup: "A+",
      address: "Dhanmondi, Dhaka",
      guardianPhone: "+880 1819-111111",
      attendance: 92,
      cgpa: 3.78,
      status: "Active",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: "CSC114-002",
      name: "Nusrat Jahan",
      email: "nusrat@example.com",
      phone: "+880 1711-000002",
      section: "A",
      batch: "56th Batch",
      bloodGroup: "O+",
      address: "Uttara, Dhaka",
      guardianPhone: "+880 1819-222222",
      attendance: 88,
      cgpa: 3.85,
      status: "Active",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: "CSC114-003",
      name: "Sakib Hasan",
      email: "sakib@example.com",
      phone: "+880 1711-000003",
      section: "B",
      batch: "56th Batch",
      bloodGroup: "B+",
      address: "Mirpur-10, Dhaka",
      guardianPhone: "+880 1819-333333",
      attendance: 81,
      cgpa: 3.42,
      status: "Active",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: "CSC114-004",
      name: "Tanvir Islam",
      email: "tanvir@example.com",
      phone: "+880 1711-000004",
      section: "B",
      batch: "56th Batch",
      bloodGroup: "AB+",
      address: "Mohammadpur, Dhaka",
      guardianPhone: "+880 1819-444444",
      attendance: 74,
      cgpa: 3.15,
      status: "Warning",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: "CSC114-005",
      name: "Farzana Akter",
      email: "farzana@example.com",
      phone: "+880 1711-000005",
      section: "A",
      batch: "56th Batch",
      bloodGroup: "O-",
      address: "Bashundhara R/A, Dhaka",
      guardianPhone: "+880 1819-555555",
      attendance: 95,
      cgpa: 3.92,
      status: "Active",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: "CSC114-006",
      name: "Mahmudur Rahman",
      email: "mahmud@example.com",
      phone: "+880 1711-000006",
      section: "B",
      batch: "56th Batch",
      bloodGroup: "A-",
      address: "Badda, Dhaka",
      guardianPhone: "+880 1819-666666",
      attendance: 68,
      cgpa: 2.89,
      status: "Warning",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80"
    }
  ],

  courses: [
    {
      code: "CSC 114",
      name: "Data Structures & Algorithms",
      teacher: "Dr. Ahmed Hossain",
      credit: 3,
      department: "CSE",
      room: "Room 301 / Lab 3",
      semester: "3rd Semester",
      description: "Arrays, Linked Lists, Stacks, Queues, Binary Trees, Graph Traversal, Sorting and Searching complexity."
    },
    {
      code: "CSC 115",
      name: "Database Management Systems",
      teacher: "Prof. Karim Ullah",
      credit: 3,
      department: "CSE",
      room: "Lab 2 (Server Room)",
      semester: "3rd Semester",
      description: "Relational Algebra, SQL Queries, Normalization (1NF to BCNF), Transaction ACID properties, and Indexing."
    },
    {
      code: "MAT 111",
      name: "Discrete Mathematics",
      teacher: "Dr. Rahman Khan",
      credit: 3,
      department: "Mathematics",
      room: "Room 204",
      semester: "3rd Semester",
      description: "Propositional Logic, Set Theory, Combinatorics, Graph Theory, and Recurrence Relations."
    },
    {
      code: "ENG 101",
      name: "Technical Communication",
      teacher: "Ms. Sadia Jahan",
      credit: 2,
      department: "English",
      room: "Room 105",
      semester: "3rd Semester",
      description: "Technical writing, research report drafting, academic presentations, and professional interview etiquette."
    },
    {
      code: "EEE 103",
      name: "Electrical Circuits & Electronics",
      teacher: "Engr. Mostafa Kamal",
      credit: 3,
      department: "EEE",
      room: "Hardware Lab 1",
      semester: "3rd Semester",
      description: "Ohm's Law, Kirchhoff's laws, Thevenin theorem, Diodes, Transistors, and Operational Amplifiers."
    }
  ],

  attendance: [
    {
      id: "ATT-101",
      date: "2026-09-28",
      course: "CSC 114",
      section: "A",
      takenBy: "Dr. Ahmed Hossain",
      records: {
        "CSC114-001": "present",
        "CSC114-002": "present",
        "CSC114-005": "present"
      }
    },
    {
      id: "ATT-102",
      date: "2026-09-28",
      course: "CSC 114",
      section: "B",
      takenBy: "Dr. Ahmed Hossain",
      records: {
        "CSC114-003": "present",
        "CSC114-004": "late",
        "CSC114-006": "absent"
      }
    },
    {
      id: "ATT-103",
      date: "2026-09-30",
      course: "CSC 114",
      section: "A",
      takenBy: "Dr. Ahmed Hossain",
      records: {
        "CSC114-001": "present",
        "CSC114-002": "present",
        "CSC114-005": "present"
      }
    },
    {
      id: "ATT-104",
      date: "2026-09-30",
      course: "CSC 115",
      section: "A",
      takenBy: "Prof. Karim Ullah",
      records: {
        "CSC114-001": "present",
        "CSC114-002": "present",
        "CSC114-005": "present"
      }
    }
  ],

  results: [
    {
      id: "RES-001",
      studentId: "CSC114-001",
      studentName: "Rahim Ahmed",
      course: "CSC 114",
      mid: 28,
      final: 48,
      quiz: 18,
      total: 94,
      grade: "A+",
      gpa: 4.00,
      semester: "Fall 2026"
    },
    {
      id: "RES-002",
      studentId: "CSC114-001",
      studentName: "Rahim Ahmed",
      course: "CSC 115",
      mid: 26,
      final: 44,
      quiz: 17,
      total: 87,
      grade: "A",
      gpa: 3.75,
      semester: "Fall 2026"
    },
    {
      id: "RES-003",
      studentId: "CSC114-001",
      studentName: "Rahim Ahmed",
      course: "MAT 111",
      mid: 24,
      final: 43,
      quiz: 16,
      total: 83,
      grade: "A-",
      gpa: 3.50,
      semester: "Fall 2026"
    },
    {
      id: "RES-004",
      studentId: "CSC114-002",
      studentName: "Nusrat Jahan",
      course: "CSC 114",
      mid: 29,
      final: 49,
      quiz: 19,
      total: 97,
      grade: "A+",
      gpa: 4.00,
      semester: "Fall 2026"
    },
    {
      id: "RES-005",
      studentId: "CSC114-002",
      studentName: "Nusrat Jahan",
      course: "CSC 115",
      mid: 27,
      final: 46,
      quiz: 18,
      total: 91,
      grade: "A+",
      gpa: 4.00,
      semester: "Fall 2026"
    },
    {
      id: "RES-006",
      studentId: "CSC114-003",
      studentName: "Sakib Hasan",
      course: "CSC 114",
      mid: 22,
      final: 40,
      quiz: 15,
      total: 77,
      grade: "B+",
      gpa: 3.25,
      semester: "Fall 2026"
    },
    {
      id: "RES-007",
      studentId: "CSC114-004",
      studentName: "Tanvir Islam",
      course: "CSC 114",
      mid: 18,
      final: 36,
      quiz: 14,
      total: 68,
      grade: "B-",
      gpa: 2.75,
      semester: "Fall 2026"
    }
  ],

  assignments: [
    {
      id: "ASN-001",
      title: "Binary Search Tree & AVL Balancing Implementation",
      course: "CSC 114",
      deadline: "2026-10-06",
      totalMarks: 20,
      status: "Active",
      description: "Implement AVL Tree rotation (LL, RR, LR, RL) in C++ or Java. Submit clean commented source code with test cases.",
      submissions: [
        {
          studentId: "CSC114-001",
          studentName: "Rahim Ahmed",
          submittedAt: "2026-09-29 18:42",
          fileLink: "avl_tree_solution_rahim.zip",
          comments: "Implemented all 4 rotations and benchmarked against standard BST.",
          status: "Graded",
          marks: 19.5,
          feedback: "Outstanding work on height balance recalculation."
        },
        {
          studentId: "CSC114-002",
          studentName: "Nusrat Jahan",
          submittedAt: "2026-09-30 11:20",
          fileLink: "tree_nusrat.cpp",
          comments: "Includes unit tests for duplicate key insertion.",
          status: "Submitted",
          marks: null,
          feedback: null
        }
      ]
    },
    {
      id: "ASN-002",
      title: "Normalization to 3NF & BCNF Case Study",
      course: "CSC 115",
      deadline: "2026-10-10",
      totalMarks: 15,
      status: "Active",
      description: "Identify functional dependencies in the provided Hospital Management dataset and decompose into Boyce-Codd Normal Form.",
      submissions: [
        {
          studentId: "CSC114-001",
          studentName: "Rahim Ahmed",
          submittedAt: "2026-09-30 14:10",
          fileLink: "normalization_casestudy.pdf",
          comments: "Proof of lossless join and dependency preservation provided.",
          status: "Submitted",
          marks: null,
          feedback: null
        }
      ]
    },
    {
      id: "ASN-003",
      title: "Recurrence Relation Solution by Master Theorem",
      course: "MAT 111",
      deadline: "2026-10-14",
      totalMarks: 10,
      status: "Active",
      description: "Solve the set of 5 divide-and-conquer recurrence relations using recursion trees and the master method.",
      submissions: []
    }
  ],

  routine: [
    {
      id: "RTN-001",
      day: "Sunday",
      time: "09:00 AM - 10:30 AM",
      course: "CSC 114",
      name: "Data Structures & Algorithms",
      teacher: "Dr. Ahmed Hossain",
      room: "Room 301",
      type: "Lecture"
    },
    {
      id: "RTN-002",
      day: "Sunday",
      time: "10:45 AM - 12:15 PM",
      course: "MAT 111",
      name: "Discrete Mathematics",
      teacher: "Dr. Rahman Khan",
      room: "Room 204",
      type: "Lecture"
    },
    {
      id: "RTN-003",
      day: "Monday",
      time: "10:00 AM - 01:00 PM",
      course: "CSC 114",
      name: "Data Structures Lab",
      teacher: "Dr. Ahmed Hossain",
      room: "Software Lab 3",
      type: "Lab"
    },
    {
      id: "RTN-004",
      day: "Tuesday",
      time: "09:00 AM - 10:30 AM",
      course: "CSC 115",
      name: "Database Systems",
      teacher: "Prof. Karim Ullah",
      room: "Room 302",
      type: "Lecture"
    },
    {
      id: "RTN-005",
      day: "Tuesday",
      time: "11:00 AM - 12:30 PM",
      course: "ENG 101",
      name: "Technical Communication",
      teacher: "Ms. Sadia Jahan",
      room: "Room 105",
      type: "Lecture"
    },
    {
      id: "RTN-006",
      day: "Wednesday",
      time: "09:00 AM - 12:00 PM",
      course: "CSC 115",
      name: "Database Systems Lab",
      teacher: "Prof. Karim Ullah",
      room: "Lab 2 (Server Room)",
      type: "Lab"
    },
    {
      id: "RTN-007",
      day: "Thursday",
      time: "10:00 AM - 11:30 AM",
      course: "EEE 103",
      name: "Electrical Circuits",
      teacher: "Engr. Mostafa Kamal",
      room: "Hardware Lab 1",
      type: "Lecture"
    },
    {
      id: "RTN-008",
      day: "Thursday",
      time: "11:45 AM - 01:15 PM",
      course: "CSC 114",
      name: "Algorithms Problem Solving",
      teacher: "Dr. Ahmed Hossain",
      room: "Room 301",
      type: "Lecture"
    }
  ],

  notices: [
    {
      id: "NTC-001",
      title: "CSC 114 Midterm Examination Schedule & Syllabus",
      category: "Exam",
      author: "Dr. Ahmed Hossain",
      date: "30 Sep 2026",
      isPinned: true,
      message: "The Midterm exam for CSC 114 will cover Chapters 1 through 5 (Arrays, Linked Lists, Stacks, Queues, Binary Trees). Exam date is set for October 18th in Hall A. Bring student ID cards."
    },
    {
      id: "NTC-002",
      title: "Lab 3 High-Performance Server Upgrade Complete",
      category: "Academic",
      author: "System Administrator",
      date: "29 Sep 2026",
      isPinned: false,
      message: "Software Lab 3 is now equipped with upgraded 32GB RAM workstations and GCC 14 compiler environment for algorithm benchmarking. Please report any hardware issues to lab proctors."
    },
    {
      id: "NTC-003",
      title: "Inter-University Hackathon 2026 Batch Nominations",
      category: "Event",
      author: "CSE Club Advisor",
      date: "27 Sep 2026",
      isPinned: true,
      message: "Students with CGPA >= 3.50 who wish to represent the CSC 114 batch in the upcoming national programming hackathon must submit their team rosters by October 5th."
    },
    {
      id: "NTC-004",
      title: "Notice regarding 75% Attendance Requirement",
      category: "Urgent",
      author: "Head of Dept",
      date: "25 Sep 2026",
      isPinned: false,
      message: "Students having attendance below 75% will be strictly barred from sitting for final semester examinations as per University Academic Regulations Article 14.3."
    }
  ]
};

// Database Access Layer
function getDB() {
  const saved = localStorage.getItem(DB_KEY);
  if (!saved) {
    localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
    return structuredClone(defaultDB);
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error("Corrupted DB in localStorage, resetting to default:", e);
    localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
    return structuredClone(defaultDB);
  }
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent("portal_db_updated", { detail: db }));
}

function resetDB() {
  localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
  return structuredClone(defaultDB);
}

// Authentication & Session
function getCurrentUser() {
  const auth = localStorage.getItem(AUTH_KEY);
  if (!auth) {
    // Default to Rahim Ahmed (Student) for quick demo access if not logged in
    const defaultUser = defaultDB.users.find(u => u.username === "admin") || defaultDB.users[0];
    localStorage.setItem(AUTH_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  }
  try {
    return JSON.parse(auth);
  } catch (e) {
    return defaultDB.users[0];
  }
}

function setCurrentUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent("portal_auth_changed", { detail: user }));
}

function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
}

// Grade calculation helper
function calculateGrade(mid, final, quiz) {
  const m = parseFloat(mid) || 0;
  const f = parseFloat(final) || 0;
  const q = parseFloat(quiz) || 0;
  const total = Math.min(100, Math.round(m + f + q));
  
  let grade = "F";
  let gpa = 0.00;
  
  if (total >= 80) { grade = "A+"; gpa = 4.00; }
  else if (total >= 75) { grade = "A";  gpa = 3.75; }
  else if (total >= 70) { grade = "A-"; gpa = 3.50; }
  else if (total >= 65) { grade = "B+"; gpa = 3.25; }
  else if (total >= 60) { grade = "B";  gpa = 3.00; }
  else if (total >= 55) { grade = "B-"; gpa = 2.75; }
  else if (total >= 50) { grade = "C+"; gpa = 2.50; }
  else if (total >= 45) { grade = "C";  gpa = 2.25; }
  else if (total >= 40) { grade = "D";  gpa = 2.00; }
  else { grade = "F";  gpa = 0.00; }
  
  return { total, grade, gpa };
}

// Dynamic MySQL SQL Generator
function generateMySQLDump(db) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  let sql = `-- ========================================================\n`;
  sql += `-- CSC-114 STUDENT PORTAL - DYNAMIC MYSQL DATABASE DUMP\n`;
  sql += `-- Generated on: ${now}\n`;
  sql += `-- Database Engine: MySQL 8.0+ / InnoDB\n`;
  sql += `-- ========================================================\n\n`;
  sql += `CREATE DATABASE IF NOT EXISTS \`csc114_portal\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
  sql += `USE \`csc114_portal\`;\n\n`;

  // 1. Users Table
  sql += `-- Table: users\n`;
  sql += `DROP TABLE IF EXISTS \`users\`;\n`;
  sql += `CREATE TABLE \`users\` (\n`;
  sql += `  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,\n`;
  sql += `  \`username\` VARCHAR(50) NOT NULL UNIQUE,\n`;
  sql += `  \`email\` VARCHAR(100) NOT NULL UNIQUE,\n`;
  sql += `  \`password\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`role\` ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',\n`;
  sql += `  \`name\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`studentId\` VARCHAR(50) DEFAULT NULL,\n`;
  sql += `  \`department\` VARCHAR(100) DEFAULT 'CSE',\n`;
  sql += `  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
  sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

  if (db.users && db.users.length) {
    sql += `INSERT INTO \`users\` (\`id\`, \`username\`, \`email\`, \`password\`, \`role\`, \`name\`, \`studentId\`, \`department\`) VALUES\n`;
    const userRows = db.users.map(u => 
      `  ('${u.id}', '${u.username}', '${u.email}', '${u.password}', '${u.role}', '${u.name.replace(/'/g, "''")}', ${u.studentId ? `'${u.studentId}'` : 'NULL'}, '${(u.department || 'CSE').replace(/'/g, "''")}')`
    );
    sql += userRows.join(',\n') + ';\n\n';
  }

  // 2. Students Table
  sql += `-- Table: students\n`;
  sql += `DROP TABLE IF EXISTS \`students\`;\n`;
  sql += `CREATE TABLE \`students\` (\n`;
  sql += `  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,\n`;
  sql += `  \`name\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`email\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`phone\` VARCHAR(30) DEFAULT NULL,\n`;
  sql += `  \`section\` VARCHAR(10) NOT NULL DEFAULT 'A',\n`;
  sql += `  \`batch\` VARCHAR(30) DEFAULT '56th Batch',\n`;
  sql += `  \`bloodGroup\` VARCHAR(10) DEFAULT 'A+',\n`;
  sql += `  \`address\` TEXT DEFAULT NULL,\n`;
  sql += `  \`guardianPhone\` VARCHAR(30) DEFAULT NULL,\n`;
  sql += `  \`attendance\` DECIMAL(5,2) DEFAULT 0.00,\n`;
  sql += `  \`cgpa\` DECIMAL(4,2) DEFAULT 0.00,\n`;
  sql += `  \`status\` VARCHAR(20) DEFAULT 'Active'\n`;
  sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

  if (db.students && db.students.length) {
    sql += `INSERT INTO \`students\` (\`id\`, \`name\`, \`email\`, \`phone\`, \`section\`, \`batch\`, \`bloodGroup\`, \`address\`, \`guardianPhone\`, \`attendance\`, \`cgpa\`, \`status\`) VALUES\n`;
    const rows = db.students.map(s => 
      `  ('${s.id}', '${s.name.replace(/'/g, "''")}', '${s.email}', '${s.phone || ''}', '${s.section}', '${s.batch || ''}', '${s.bloodGroup || ''}', '${(s.address || '').replace(/'/g, "''")}', '${s.guardianPhone || ''}', ${s.attendance || 0}, ${s.cgpa || 0}, '${s.status || 'Active'}')`
    );
    sql += rows.join(',\n') + ';\n\n';
  }

  // 3. Courses Table
  sql += `-- Table: courses\n`;
  sql += `DROP TABLE IF EXISTS \`courses\`;\n`;
  sql += `CREATE TABLE \`courses\` (\n`;
  sql += `  \`code\` VARCHAR(30) NOT NULL PRIMARY KEY,\n`;
  sql += `  \`name\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`teacher\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`credit\` INT NOT NULL DEFAULT 3,\n`;
  sql += `  \`department\` VARCHAR(50) DEFAULT 'CSE',\n`;
  sql += `  \`room\` VARCHAR(50) DEFAULT NULL,\n`;
  sql += `  \`semester\` VARCHAR(50) DEFAULT NULL,\n`;
  sql += `  \`description\` TEXT DEFAULT NULL\n`;
  sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

  if (db.courses && db.courses.length) {
    sql += `INSERT INTO \`courses\` (\`code\`, \`name\`, \`teacher\`, \`credit\`, \`department\`, \`room\`, \`semester\`, \`description\`) VALUES\n`;
    const rows = db.courses.map(c => 
      `  ('${c.code}', '${c.name.replace(/'/g, "''")}', '${c.teacher.replace(/'/g, "''")}', ${c.credit}, '${c.department}', '${c.room}', '${c.semester}', '${(c.description || '').replace(/'/g, "''")}')`
    );
    sql += rows.join(',\n') + ';\n\n';
  }

  // 4. Attendance Table
  sql += `-- Table: attendance\n`;
  sql += `DROP TABLE IF EXISTS \`attendance\`;\n`;
  sql += `CREATE TABLE \`attendance\` (\n`;
  sql += `  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,\n`;
  sql += `  \`date\` DATE NOT NULL,\n`;
  sql += `  \`course\` VARCHAR(30) NOT NULL,\n`;
  sql += `  \`section\` VARCHAR(10) NOT NULL,\n`;
  sql += `  \`takenBy\` VARCHAR(100) DEFAULT NULL,\n`;
  sql += `  \`records_json\` JSON NOT NULL\n`;
  sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

  if (db.attendance && db.attendance.length) {
    sql += `INSERT INTO \`attendance\` (\`id\`, \`date\`, \`course\`, \`section\`, \`takenBy\`, \`records_json\`) VALUES\n`;
    const rows = db.attendance.map(a => 
      `  ('${a.id}', '${a.date}', '${a.course}', '${a.section}', '${(a.takenBy || '').replace(/'/g, "''")}', '${JSON.stringify(a.records || {})}')`
    );
    sql += rows.join(',\n') + ';\n\n';
  }

  // 5. Results Table
  sql += `-- Table: results\n`;
  sql += `DROP TABLE IF EXISTS \`results\`;\n`;
  sql += `CREATE TABLE \`results\` (\n`;
  sql += `  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,\n`;
  sql += `  \`studentId\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`course\` VARCHAR(30) NOT NULL,\n`;
  sql += `  \`mid\` DECIMAL(5,2) DEFAULT 0.00,\n`;
  sql += `  \`final\` DECIMAL(5,2) DEFAULT 0.00,\n`;
  sql += `  \`quiz\` DECIMAL(5,2) DEFAULT 0.00,\n`;
  sql += `  \`total\` DECIMAL(5,2) DEFAULT 0.00,\n`;
  sql += `  \`grade\` VARCHAR(5) NOT NULL,\n`;
  sql += `  \`gpa\` DECIMAL(3,2) NOT NULL,\n`;
  sql += `  \`semester\` VARCHAR(50) DEFAULT 'Fall 2026'\n`;
  sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

  if (db.results && db.results.length) {
    sql += `INSERT INTO \`results\` (\`id\`, \`studentId\`, \`course\`, \`mid\`, \`final\`, \`quiz\`, \`total\`, \`grade\`, \`gpa\`, \`semester\`) VALUES\n`;
    const rows = db.results.map(r => 
      `  ('${r.id}', '${r.studentId}', '${r.course}', ${r.mid}, ${r.final}, ${r.quiz}, ${r.total}, '${r.grade}', ${r.gpa}, '${r.semester}')`
    );
    sql += rows.join(',\n') + ';\n\n';
  }

  // 6. Assignments Table
  sql += `-- Table: assignments\n`;
  sql += `DROP TABLE IF EXISTS \`assignments\`;\n`;
  sql += `CREATE TABLE \`assignments\` (\n`;
  sql += `  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,\n`;
  sql += `  \`title\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`course\` VARCHAR(30) NOT NULL,\n`;
  sql += `  \`deadline\` DATE NOT NULL,\n`;
  sql += `  \`totalMarks\` INT DEFAULT 20,\n`;
  sql += `  \`status\` VARCHAR(20) DEFAULT 'Active',\n`;
  sql += `  \`description\` TEXT DEFAULT NULL,\n`;
  sql += `  \`submissions_json\` JSON DEFAULT NULL\n`;
  sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

  if (db.assignments && db.assignments.length) {
    sql += `INSERT INTO \`assignments\` (\`id\`, \`title\`, \`course\`, \`deadline\`, \`totalMarks\`, \`status\`, \`description\`, \`submissions_json\`) VALUES\n`;
    const rows = db.assignments.map(a => 
      `  ('${a.id}', '${a.title.replace(/'/g, "''")}', '${a.course}', '${a.deadline}', ${a.totalMarks}, '${a.status}', '${(a.description || '').replace(/'/g, "''")}', '${JSON.stringify(a.submissions || [])}')`
    );
    sql += rows.join(',\n') + ';\n\n';
  }

  // 7. Routine Table
  sql += `-- Table: routine\n`;
  sql += `DROP TABLE IF EXISTS \`routine\`;\n`;
  sql += `CREATE TABLE \`routine\` (\n`;
  sql += `  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,\n`;
  sql += `  \`day\` VARCHAR(20) NOT NULL,\n`;
  sql += `  \`time\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`course\` VARCHAR(30) NOT NULL,\n`;
  sql += `  \`name\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`teacher\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`room\` VARCHAR(50) NOT NULL,\n`;
  sql += `  \`type\` VARCHAR(20) DEFAULT 'Lecture'\n`;
  sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

  if (db.routine && db.routine.length) {
    sql += `INSERT INTO \`routine\` (\`id\`, \`day\`, \`time\`, \`course\`, \`name\`, \`teacher\`, \`room\`, \`type\`) VALUES\n`;
    const rows = db.routine.map(rt => 
      `  ('${rt.id}', '${rt.day}', '${rt.time}', '${rt.course}', '${rt.name.replace(/'/g, "''")}', '${rt.teacher.replace(/'/g, "''")}', '${rt.room}', '${rt.type}')`
    );
    sql += rows.join(',\n') + ';\n\n';
  }

  // 8. Notices Table
  sql += `-- Table: notices\n`;
  sql += `DROP TABLE IF EXISTS \`notices\`;\n`;
  sql += `CREATE TABLE \`notices\` (\n`;
  sql += `  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,\n`;
  sql += `  \`title\` VARCHAR(255) NOT NULL,\n`;
  sql += `  \`category\` VARCHAR(30) NOT NULL DEFAULT 'Academic',\n`;
  sql += `  \`author\` VARCHAR(100) NOT NULL,\n`;
  sql += `  \`date\` VARCHAR(30) NOT NULL,\n`;
  sql += `  \`isPinned\` TINYINT(1) DEFAULT 0,\n`;
  sql += `  \`message\` TEXT NOT NULL\n`;
  sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

  if (db.notices && db.notices.length) {
    sql += `INSERT INTO \`notices\` (\`id\`, \`title\`, \`category\`, \`author\`, \`date\`, \`isPinned\`, \`message\`) VALUES\n`;
    const rows = db.notices.map(n => 
      `  ('${n.id}', '${n.title.replace(/'/g, "''")}', '${n.category}', '${n.author.replace(/'/g, "''")}', '${n.date}', ${n.isPinned ? 1 : 0}, '${(n.message || '').replace(/'/g, "''")}')`
    );
    sql += rows.join(',\n') + ';\n\n';
  }

  return sql;
}

// Download file utility
function downloadTextFile(filename, content, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
