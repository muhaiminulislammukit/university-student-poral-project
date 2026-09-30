/**
 * CSC 114 University Portal - Version 2.0 Master Data Store & State Engine
 * Persistent LocalStorage Engine with Dynamic MySQL DDL/DML Generator & Event Bus
 */

const V2_STORE_KEY = "CSC114_V2_ACADEMIC_STORE";
const V2_EVENT_KEY = "csc114_v2_store_changed";

// Master Seed Data for Version 2.0
const defaultV2Data = {
  version: "2.0.0",
  lastUpdated: new Date().toISOString(),
  
  users: [
    // Administrators
    {
      id: "ADM-001",
      username: "admin",
      email: "admin@csc114.edu",
      password: "123",
      role: "admin",
      name: "Prof. Dr. M. Rahman",
      title: "Dean & Chief Academic Administrator",
      department: "Computer Science & Engineering",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      phone: "+880 1711-999001"
    },
    {
      id: "ADM-002",
      username: "registrar",
      email: "registrar@csc114.edu",
      password: "123",
      role: "admin",
      name: "Engr. Farhana Chowdhury",
      title: "Assistant Registrar (Academics)",
      department: "Office of the Registrar",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      phone: "+880 1711-999002"
    },

    // Faculty Members / Teachers
    {
      id: "TCH-001",
      username: "ahmed",
      email: "ahmed@csc114.edu",
      password: "123",
      role: "teacher",
      name: "Dr. Ahmed Hossain",
      title: "Associate Professor (Algorithms & Data Structures)",
      department: "Computer Science & Engineering",
      room: "Faculty Room 402",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      phone: "+880 1819-334455",
      assignedCourses: ["CSC 114", "CSC 116"]
    },
    {
      id: "TCH-002",
      username: "karim",
      email: "karim@csc114.edu",
      password: "123",
      role: "teacher",
      name: "Prof. Karim Ullah",
      title: "Professor & Database Systems Lead",
      department: "Computer Science & Engineering",
      room: "Faculty Room 405",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      phone: "+880 1819-556677",
      assignedCourses: ["CSC 115"]
    },
    {
      id: "TCH-003",
      username: "sadia",
      email: "sadia@csc114.edu",
      password: "123",
      role: "teacher",
      name: "Ms. Sadia Jahan",
      title: "Assistant Professor & Soft Skills Mentor",
      department: "Humanities & English",
      room: "Faculty Room 201",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
      phone: "+880 1819-778899",
      assignedCourses: ["ENG 101"]
    },

    // Students
    {
      id: "STU-001",
      username: "CSC114-001",
      studentId: "CSC114-001",
      email: "rahim@example.com",
      password: "123",
      role: "student",
      name: "Rahim Ahmed",
      title: "Batch Representative (Section A)",
      department: "CSE",
      section: "A",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: "STU-002",
      username: "CSC114-002",
      studentId: "CSC114-002",
      email: "nusrat@example.com",
      password: "123",
      role: "student",
      name: "Nusrat Jahan",
      title: "Undergraduate Scholar",
      department: "CSE",
      section: "A",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: "STU-003",
      username: "CSC114-003",
      studentId: "CSC114-003",
      email: "sakib@example.com",
      password: "123",
      role: "student",
      name: "Sakib Hasan",
      title: "Undergraduate Student",
      department: "CSE",
      section: "B",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: "STU-004",
      username: "CSC114-004",
      studentId: "CSC114-004",
      email: "tanvir@example.com",
      password: "123",
      role: "student",
      name: "Tanvir Islam",
      title: "Undergraduate Student",
      department: "CSE",
      section: "B",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80"
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
      address: "House 24, Road 7, Dhanmondi, Dhaka",
      guardianName: "M. A. Ahmed",
      guardianPhone: "+880 1819-111111",
      attendance: 94,
      cgpa: 3.82,
      status: "Active",
      creditsCompleted: 45,
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
      address: "Sector 4, Uttara, Dhaka",
      guardianName: "Md. J. Hossain",
      guardianPhone: "+880 1819-222222",
      attendance: 91,
      cgpa: 3.90,
      status: "Active",
      creditsCompleted: 45,
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
      address: "Mirpur-10, Block C, Dhaka",
      guardianName: "Hasan Ali",
      guardianPhone: "+880 1819-333333",
      attendance: 83,
      cgpa: 3.45,
      status: "Active",
      creditsCompleted: 42,
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: "CSC114-004",
      name: "Tanvir Islam",
      email: "tanvir@example.com",
      phone: "+880 1711-000004",
      section: "B",
      batch: "56th Batch",
      bloodGroup: "AB+",
      address: "Salimullah Road, Mohammadpur, Dhaka",
      guardianName: "Nurul Islam",
      guardianPhone: "+880 1819-444444",
      attendance: 72,
      cgpa: 3.12,
      status: "Warning",
      creditsCompleted: 39,
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
      address: "Block G, Bashundhara R/A, Dhaka",
      guardianName: "Kamal Uddin",
      guardianPhone: "+880 1819-555555",
      attendance: 96,
      cgpa: 3.95,
      status: "Active",
      creditsCompleted: 45,
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
      address: "South Badda, Gulshan, Dhaka",
      guardianName: "M. Rahman",
      guardianPhone: "+880 1819-666666",
      attendance: 68,
      cgpa: 2.88,
      status: "Warning",
      creditsCompleted: 36,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
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
      category: "Core Computer Science",
      description: "Comprehensive study of abstract data types, asymptotic complexity (Big-O), linear and non-linear data structures (Trees, Graphs), sorting algorithms and greedy paradigms."
    },
    {
      code: "CSC 115",
      name: "Database Management Systems",
      teacher: "Prof. Karim Ullah",
      credit: 3,
      department: "CSE",
      room: "Lab 2 (Server Center)",
      semester: "3rd Semester",
      category: "Core Computer Science",
      description: "Relational algebra, SQL programming, database schema normalization (1NF to BCNF), indexing, transaction management, ACID properties, and relational storage engines."
    },
    {
      code: "MAT 111",
      name: "Discrete Mathematics",
      teacher: "Dr. Rahman Khan",
      credit: 3,
      department: "Mathematics",
      room: "Room 204",
      semester: "3rd Semester",
      category: "Allied Science",
      description: "Propositional and predicate calculus, mathematical induction, combinatorics, graph theory principles, Boolean algebra, and recurrence relation solutions."
    },
    {
      code: "ENG 101",
      name: "Technical Communication & Writing",
      teacher: "Ms. Sadia Jahan",
      credit: 2,
      department: "English",
      room: "Room 105",
      semester: "3rd Semester",
      category: "General Education",
      description: "Engineering documentation, technical research report composition, academic seminar presentation skills, and professional email and interview etiquette."
    },
    {
      code: "EEE 103",
      name: "Electrical Circuits & Electronics",
      teacher: "Engr. Mostafa Kamal",
      credit: 3,
      department: "EEE",
      room: "Hardware Lab 1",
      semester: "3rd Semester",
      category: "Engineering Science",
      description: "DC/AC circuit theorems, Kirchhoff laws, semiconductor diodes, BJT and MOSFET amplifiers, operational amplifiers, and digital logic gates."
    },
    {
      code: "CSC 116",
      name: "Advanced Algorithm Engineering",
      teacher: "Dr. Ahmed Hossain",
      credit: 3,
      department: "CSE",
      room: "Room 304",
      semester: "3rd Semester",
      category: "Core Elective",
      description: "Dynamic programming optimizations, network flows, string matching (KMP, Rabin-Karp), computational geometry, and NP-completeness foundations."
    }
  ],

  attendance: [
    {
      id: "ATT-201",
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
      id: "ATT-202",
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
      id: "ATT-203",
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
      id: "ATT-204",
      date: "2026-09-30",
      course: "CSC 115",
      section: "A",
      takenBy: "Prof. Karim Ullah",
      records: {
        "CSC114-001": "present",
        "CSC114-002": "present",
        "CSC114-005": "present"
      }
    },
    {
      id: "ATT-205",
      date: "2026-09-30",
      course: "CSC 115",
      section: "B",
      takenBy: "Prof. Karim Ullah",
      records: {
        "CSC114-003": "present",
        "CSC114-004": "present",
        "CSC114-006": "absent"
      }
    }
  ],

  results: [
    {
      id: "RES-101",
      studentId: "CSC114-001",
      studentName: "Rahim Ahmed",
      course: "CSC 114",
      mid: 28,
      final: 48,
      quiz: 18,
      total: 94,
      grade: "A+",
      gpa: 4.00,
      semester: "Fall 2026",
      remarks: "Exemplary performance"
    },
    {
      id: "RES-102",
      studentId: "CSC114-001",
      studentName: "Rahim Ahmed",
      course: "CSC 115",
      mid: 26,
      final: 45,
      quiz: 17,
      total: 88,
      grade: "A",
      gpa: 3.75,
      semester: "Fall 2026",
      remarks: "Great database query skills"
    },
    {
      id: "RES-103",
      studentId: "CSC114-001",
      studentName: "Rahim Ahmed",
      course: "MAT 111",
      mid: 24,
      final: 43,
      quiz: 16,
      total: 83,
      grade: "A-",
      gpa: 3.50,
      semester: "Fall 2026",
      remarks: "Strong proof techniques"
    },
    {
      id: "RES-104",
      studentId: "CSC114-002",
      studentName: "Nusrat Jahan",
      course: "CSC 114",
      mid: 29,
      final: 49,
      quiz: 19,
      total: 97,
      grade: "A+",
      gpa: 4.00,
      semester: "Fall 2026",
      remarks: "Outstanding project design"
    },
    {
      id: "RES-105",
      studentId: "CSC114-002",
      studentName: "Nusrat Jahan",
      course: "CSC 115",
      mid: 28,
      final: 47,
      quiz: 18,
      total: 93,
      grade: "A+",
      gpa: 4.00,
      semester: "Fall 2026",
      remarks: "Top score in normalization"
    },
    {
      id: "RES-106",
      studentId: "CSC114-003",
      studentName: "Sakib Hasan",
      course: "CSC 114",
      mid: 23,
      final: 41,
      quiz: 15,
      total: 79,
      grade: "B+",
      gpa: 3.25,
      semester: "Fall 2026",
      remarks: "Good lab performance"
    },
    {
      id: "RES-107",
      studentId: "CSC114-004",
      studentName: "Tanvir Islam",
      course: "CSC 114",
      mid: 18,
      final: 36,
      quiz: 14,
      total: 68,
      grade: "B-",
      gpa: 2.75,
      semester: "Fall 2026",
      remarks: "Needs improvement in recursion"
    }
  ],

  assignments: [
    {
      id: "ASN-201",
      title: "AVL Tree Rotations & Balanced Search Implementation",
      course: "CSC 114",
      teacher: "Dr. Ahmed Hossain",
      deadline: "2026-10-08",
      totalMarks: 20,
      status: "Active",
      instructions: "Implement single and double rotations (LL, RR, LR, RL) in C++ or Java. Include unit test cases for node balancing factor checks and deletion balancing.",
      submissions: [
        {
          studentId: "CSC114-001",
          studentName: "Rahim Ahmed",
          submittedAt: "2026-09-29 19:15",
          solutionLink: "https://github.com/rahim-cse/avl-tree-benchmark",
          fileName: "avl_tree_engine_rahim.zip",
          notes: "Benchmarked 100,000 random insertions against standard red-black tree with execution charts.",
          status: "Graded",
          marks: 19.5,
          feedback: "Brilliant performance analysis and clean pointer manipulation."
        },
        {
          studentId: "CSC114-002",
          studentName: "Nusrat Jahan",
          submittedAt: "2026-09-30 11:40",
          solutionLink: "https://github.com/nusrat-codes/avl-tree-cpp",
          fileName: "avl_balanced_nusrat.cpp",
          notes: "Includes test cases for rebalancing after consecutive deletions.",
          status: "Submitted",
          marks: null,
          feedback: null
        }
      ]
    },
    {
      id: "ASN-202",
      title: "Hospital Management E-R Diagram & Normalization to BCNF",
      course: "CSC 115",
      teacher: "Prof. Karim Ullah",
      deadline: "2026-10-12",
      totalMarks: 15,
      status: "Active",
      instructions: "Perform functional dependency analysis on the provided clinical appointment schema. Show step-by-step decomposition to 3NF and BCNF.",
      submissions: [
        {
          studentId: "CSC114-001",
          studentName: "Rahim Ahmed",
          submittedAt: "2026-09-30 14:30",
          solutionLink: "https://drive.google.com/file/d/hosp-db-study",
          fileName: "hospital_bcnf_analysis.pdf",
          notes: "All functional dependencies and minimal covers mathematically proven.",
          status: "Submitted",
          marks: null,
          feedback: null
        }
      ]
    },
    {
      id: "ASN-203",
      title: "Divide & Conquer Recurrence Solution by Master Theorem",
      course: "MAT 111",
      teacher: "Dr. Rahman Khan",
      deadline: "2026-10-15",
      totalMarks: 10,
      status: "Active",
      instructions: "Solve the 5 recurrence equations using the 3 cases of the Master Theorem. Submit clean handwritten/typed solutions with recursion tree justifications.",
      submissions: []
    }
  ],

  routine: [
    {
      id: "RTN-201",
      day: "Sunday",
      time: "09:00 AM - 10:30 AM",
      course: "CSC 114",
      name: "Data Structures & Algorithms",
      teacher: "Dr. Ahmed Hossain",
      room: "Room 301",
      type: "Lecture",
      section: "Section A"
    },
    {
      id: "RTN-202",
      day: "Sunday",
      time: "10:45 AM - 12:15 PM",
      course: "MAT 111",
      name: "Discrete Mathematics",
      teacher: "Dr. Rahman Khan",
      room: "Room 204",
      type: "Lecture",
      section: "Section A & B"
    },
    {
      id: "RTN-203",
      day: "Monday",
      time: "10:00 AM - 01:00 PM",
      course: "CSC 114",
      name: "Algorithms Lab & Problem Solving",
      teacher: "Dr. Ahmed Hossain",
      room: "Software Lab 3",
      type: "Lab",
      section: "Section A"
    },
    {
      id: "RTN-204",
      day: "Tuesday",
      time: "09:00 AM - 10:30 AM",
      course: "CSC 115",
      name: "Database Systems",
      teacher: "Prof. Karim Ullah",
      room: "Room 302",
      type: "Lecture",
      section: "Section A & B"
    },
    {
      id: "RTN-205",
      day: "Tuesday",
      time: "11:00 AM - 12:30 PM",
      course: "ENG 101",
      name: "Technical Communication",
      teacher: "Ms. Sadia Jahan",
      room: "Room 105",
      type: "Lecture",
      section: "Section A"
    },
    {
      id: "RTN-206",
      day: "Wednesday",
      time: "09:00 AM - 12:00 PM",
      course: "CSC 115",
      name: "Database Systems Lab",
      teacher: "Prof. Karim Ullah",
      room: "Lab 2 (Server Room)",
      type: "Lab",
      section: "Section A"
    },
    {
      id: "RTN-207",
      day: "Thursday",
      time: "10:00 AM - 11:30 AM",
      course: "EEE 103",
      name: "Electrical Circuits & Electronics",
      teacher: "Engr. Mostafa Kamal",
      room: "Hardware Lab 1",
      type: "Lecture",
      section: "Section A & B"
    },
    {
      id: "RTN-208",
      day: "Thursday",
      time: "11:45 AM - 01:15 PM",
      course: "CSC 116",
      name: "Advanced Algorithm Engineering",
      teacher: "Dr. Ahmed Hossain",
      room: "Room 304",
      type: "Lecture",
      section: "Section A"
    }
  ],

  notices: [
    {
      id: "NTC-201",
      title: "CSC 114 Midterm Examination Schedule & Format",
      category: "Exam",
      author: "Dr. Ahmed Hossain",
      target: "All Students",
      date: "30 Sep 2026",
      isPinned: true,
      message: "The Midterm exam for CSC 114 is scheduled for October 18th in Central Examination Hall A (10:00 AM to 11:30 AM). Syllabus covers Chapters 1 through 5 (Arrays, Linked Lists, Stacks, Queues, Binary Trees). Calculators are permitted; electronic smartwatches are strictly prohibited."
    },
    {
      id: "NTC-202",
      title: "Mandatory 75% Attendance Requirement Notice",
      category: "Urgent",
      author: "Academic Registrar",
      target: "All Students",
      date: "29 Sep 2026",
      isPinned: true,
      message: "As per University Academic Code Article 14.3, students maintaining overall attendance below 75% will be strictly disbarred from sitting for the Final Semester Examinations. Students in warning status should immediately consult their course faculty."
    },
    {
      id: "NTC-203",
      title: "Lab 3 High Performance Workstations Deployed",
      category: "Academic",
      author: "System Administrator",
      target: "Computer Science Dept",
      date: "28 Sep 2026",
      isPinned: false,
      message: "Software Lab 3 has been fully outfitted with 32-core workstations, Ubuntu 24.04 LTS environments, and LLVM/Clang compiler toolchains for CSC 114 algorithm performance benchmarks."
    },
    {
      id: "NTC-204",
      title: "National Inter-University Coding Hackathon 2026",
      category: "Event",
      author: "CSE Club Advisor",
      target: "Undergraduate Batches",
      date: "26 Sep 2026",
      isPinned: false,
      message: "Registrations are now open for the 2026 National Collegiate Coding Championship. Teams representing the 56th Batch should register with Dr. Ahmed Hossain by October 5th."
    }
  ],

  auditLogs: [
    {
      id: "LOG-001",
      timestamp: "2026-09-30 09:12:00",
      actor: "Dr. Ahmed Hossain (Faculty)",
      action: "Submitted roll call attendance for CSC 114 (Section A).",
      type: "attendance"
    },
    {
      id: "LOG-002",
      timestamp: "2026-09-30 11:45:00",
      actor: "Prof. Dr. M. Rahman (Admin)",
      action: "Published Version 2.0 Academic Portal & updated Course Catalog.",
      type: "system"
    },
    {
      id: "LOG-003",
      timestamp: "2026-09-30 14:32:00",
      actor: "Rahim Ahmed (Student)",
      action: "Submitted solution for Assignment ASN-202 (BCNF Normalization).",
      type: "assignment"
    }
  ]
};

// -------------------------------------------------------------------------
// Core Store API
// -------------------------------------------------------------------------

class AcademicStoreV2 {
  constructor() {
    this.init();
    // Cross-tab reactive synchronization
    window.addEventListener("storage", (e) => {
      if (e.key === V2_STORE_KEY) {
        window.dispatchEvent(new CustomEvent(V2_EVENT_KEY, { detail: this.get() }));
      }
    });
  }

  init() {
    const raw = localStorage.getItem(V2_STORE_KEY);
    if (!raw) {
      this.save(defaultV2Data);
    } else {
      try {
        const parsed = JSON.parse(raw);
        if (!parsed.version || parsed.version !== "2.0.0") {
          // Merge or initialize
          this.save({ ...defaultV2Data, ...parsed, version: "2.0.0" });
        }
      } catch (err) {
        console.error("V2 Store corrupt, reinitializing:", err);
        this.save(defaultV2Data);
      }
    }
  }

  get() {
    try {
      const raw = localStorage.getItem(V2_STORE_KEY);
      return raw ? JSON.parse(raw) : structuredClone(defaultV2Data);
    } catch (e) {
      return structuredClone(defaultV2Data);
    }
  }

  save(data) {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(V2_STORE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(V2_EVENT_KEY, { detail: data }));
  }

  reset() {
    const cloned = structuredClone(defaultV2Data);
    this.save(cloned);
    return cloned;
  }

  logActivity(actor, action, type = "general") {
    const store = this.get();
    const newLog = {
      id: "LOG-" + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor,
      action,
      type
    };
    store.auditLogs = [newLog, ...(store.auditLogs || [])].slice(0, 50);
    this.save(store);
  }

  // Grade calculator helper
  calculateGrade(mid, final, quiz) {
    const m = Math.min(30, Math.max(0, parseFloat(mid) || 0));
    const f = Math.min(50, Math.max(0, parseFloat(final) || 0));
    const q = Math.min(20, Math.max(0, parseFloat(quiz) || 0));
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
    else { grade = "F"; gpa = 0.00; }

    return { total, grade, gpa, mid: m, final: f, quiz: q };
  }

  // Recalculate student attendance average across all attendance sessions
  recalculateStudentAttendance(studentId) {
    const store = this.get();
    let totalSessions = 0;
    let presentCount = 0;

    (store.attendance || []).forEach(att => {
      if (att.records && att.records[studentId] !== undefined) {
        totalSessions++;
        const status = att.records[studentId];
        if (status === "present") presentCount += 1.0;
        else if (status === "late") presentCount += 0.5;
      }
    });

    if (totalSessions > 0) {
      const percentage = Math.round((presentCount / totalSessions) * 100);
      const stuIndex = store.students.findIndex(s => s.id === studentId);
      if (stuIndex !== -1) {
        store.students[stuIndex].attendance = percentage;
        store.students[stuIndex].status = percentage >= 75 ? "Active" : "Warning";
        this.save(store);
      }
      return percentage;
    }
    return null;
  }

  // Dynamic MySQL 8.0+ Dump Generator
  generateMySQLDump() {
    const db = this.get();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    let sql = `-- =====================================================================\n`;
    sql += `-- CSC 114 ACADEMIC PORTAL VERSION 2.0 - PRODUCTION DATABASE DUMP\n`;
    sql += `-- Generated on: ${timestamp}\n`;
    sql += `-- Compatible with: MySQL 8.0+ / MariaDB 10.5+ / InnoDB\n`;
    sql += `-- =====================================================================\n\n`;
    sql += `CREATE DATABASE IF NOT EXISTS \`csc114_portal_v2\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
    sql += `USE \`csc114_portal_v2\`;\n\n`;

    // 1. Users Table
    sql += `-- -----------------------------------------------------\n`;
    sql += `-- Table: users\n`;
    sql += `-- -----------------------------------------------------\n`;
    sql += `DROP TABLE IF EXISTS \`users\`;\n`;
    sql += `CREATE TABLE \`users\` (\n`;
    sql += `  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,\n`;
    sql += `  \`username\` VARCHAR(50) NOT NULL UNIQUE,\n`;
    sql += `  \`email\` VARCHAR(100) NOT NULL UNIQUE,\n`;
    sql += `  \`password\` VARCHAR(255) NOT NULL,\n`;
    sql += `  \`role\` ENUM('admin', 'teacher', 'student') NOT NULL,\n`;
    sql += `  \`name\` VARCHAR(100) NOT NULL,\n`;
    sql += `  \`title\` VARCHAR(150) DEFAULT NULL,\n`;
    sql += `  \`department\` VARCHAR(100) DEFAULT 'CSE',\n`;
    sql += `  \`studentId\` VARCHAR(50) DEFAULT NULL,\n`;
    sql += `  \`phone\` VARCHAR(50) DEFAULT NULL,\n`;
    sql += `  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    if (db.users && db.users.length) {
      sql += `INSERT INTO \`users\` (\`id\`, \`username\`, \`email\`, \`password\`, \`role\`, \`name\`, \`title\`, \`department\`, \`studentId\`, \`phone\`) VALUES\n`;
      const rows = db.users.map(u => 
        `  ('${u.id}', '${u.username}', '${u.email}', '${u.password}', '${u.role}', '${(u.name || '').replace(/'/g, "''")}', '${(u.title || '').replace(/'/g, "''")}', '${(u.department || 'CSE').replace(/'/g, "''")}', ${u.studentId ? `'${u.studentId}'` : 'NULL'}, ${u.phone ? `'${u.phone}'` : 'NULL'})`
      );
      sql += rows.join(',\n') + ';\n\n';
    }

    // 2. Students Table
    sql += `-- -----------------------------------------------------\n`;
    sql += `-- Table: students\n`;
    sql += `-- -----------------------------------------------------\n`;
    sql += `DROP TABLE IF EXISTS \`students\`;\n`;
    sql += `CREATE TABLE \`students\` (\n`;
    sql += `  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,\n`;
    sql += `  \`name\` VARCHAR(100) NOT NULL,\n`;
    sql += `  \`email\` VARCHAR(100) NOT NULL,\n`;
    sql += `  \`phone\` VARCHAR(50) DEFAULT NULL,\n`;
    sql += `  \`section\` VARCHAR(10) NOT NULL DEFAULT 'A',\n`;
    sql += `  \`batch\` VARCHAR(50) NOT NULL DEFAULT '56th Batch',\n`;
    sql += `  \`bloodGroup\` VARCHAR(10) DEFAULT 'O+',\n`;
    sql += `  \`address\` TEXT DEFAULT NULL,\n`;
    sql += `  \`guardianName\` VARCHAR(100) DEFAULT NULL,\n`;
    sql += `  \`guardianPhone\` VARCHAR(50) DEFAULT NULL,\n`;
    sql += `  \`attendance\` INT NOT NULL DEFAULT 85,\n`;
    sql += `  \`cgpa\` DECIMAL(3,2) NOT NULL DEFAULT 3.50,\n`;
    sql += `  \`creditsCompleted\` INT NOT NULL DEFAULT 45,\n`;
    sql += `  \`status\` ENUM('Active', 'Warning', 'Suspended') NOT NULL DEFAULT 'Active',\n`;
    sql += `  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    if (db.students && db.students.length) {
      sql += `INSERT INTO \`students\` (\`id\`, \`name\`, \`email\`, \`phone\`, \`section\`, \`batch\`, \`bloodGroup\`, \`address\`, \`guardianName\`, \`guardianPhone\`, \`attendance\`, \`cgpa\`, \`creditsCompleted\`, \`status\`) VALUES\n`;
      const sRows = db.students.map(s => 
        `  ('${s.id}', '${s.name.replace(/'/g, "''")}', '${s.email}', '${s.phone || ''}', '${s.section}', '${s.batch}', '${s.bloodGroup || 'A+'}', '${(s.address || '').replace(/'/g, "''")}', '${(s.guardianName || '').replace(/'/g, "''")}', '${s.guardianPhone || ''}', ${s.attendance}, ${s.cgpa}, ${s.creditsCompleted || 45}, '${s.status}')`
      );
      sql += sRows.join(',\n') + ';\n\n';
    }

    // 3. Courses Table
    sql += `-- -----------------------------------------------------\n`;
    sql += `-- Table: courses\n`;
    sql += `-- -----------------------------------------------------\n`;
    sql += `DROP TABLE IF EXISTS \`courses\`;\n`;
    sql += `CREATE TABLE \`courses\` (\n`;
    sql += `  \`code\` VARCHAR(20) NOT NULL PRIMARY KEY,\n`;
    sql += `  \`name\` VARCHAR(100) NOT NULL,\n`;
    sql += `  \`teacher\` VARCHAR(100) NOT NULL,\n`;
    sql += `  \`credit\` INT NOT NULL DEFAULT 3,\n`;
    sql += `  \`department\` VARCHAR(50) DEFAULT 'CSE',\n`;
    sql += `  \`room\` VARCHAR(50) DEFAULT NULL,\n`;
    sql += `  \`semester\` VARCHAR(50) DEFAULT '3rd Semester',\n`;
    sql += `  \`category\` VARCHAR(50) DEFAULT 'Core',\n`;
    sql += `  \`description\` TEXT DEFAULT NULL\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    if (db.courses && db.courses.length) {
      sql += `INSERT INTO \`courses\` (\`code\`, \`name\`, \`teacher\`, \`credit\`, \`department\`, \`room\`, \`semester\`, \`category\`, \`description\`) VALUES\n`;
      const cRows = db.courses.map(c => 
        `  ('${c.code}', '${c.name.replace(/'/g, "''")}', '${c.teacher.replace(/'/g, "''")}', ${c.credit}, '${c.department}', '${c.room}', '${c.semester}', '${c.category || 'Core'}', '${(c.description || '').replace(/'/g, "''")}')`
      );
      sql += cRows.join(',\n') + ';\n\n';
    }

    // 4. Results Table
    sql += `-- -----------------------------------------------------\n`;
    sql += `-- Table: results\n`;
    sql += `-- -----------------------------------------------------\n`;
    sql += `DROP TABLE IF EXISTS \`results\`;\n`;
    sql += `CREATE TABLE \`results\` (\n`;
    sql += `  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,\n`;
    sql += `  \`studentId\` VARCHAR(50) NOT NULL,\n`;
    sql += `  \`studentName\` VARCHAR(100) NOT NULL,\n`;
    sql += `  \`course\` VARCHAR(20) NOT NULL,\n`;
    sql += `  \`mid\` DECIMAL(4,1) NOT NULL DEFAULT 0.0,\n`;
    sql += `  \`final\` DECIMAL(4,1) NOT NULL DEFAULT 0.0,\n`;
    sql += `  \`quiz\` DECIMAL(4,1) NOT NULL DEFAULT 0.0,\n`;
    sql += `  \`total\` DECIMAL(5,1) NOT NULL DEFAULT 0.0,\n`;
    sql += `  \`grade\` VARCHAR(5) NOT NULL DEFAULT 'F',\n`;
    sql += `  \`gpa\` DECIMAL(3,2) NOT NULL DEFAULT 0.00,\n`;
    sql += `  \`semester\` VARCHAR(50) DEFAULT 'Fall 2026',\n`;
    sql += `  \`remarks\` VARCHAR(255) DEFAULT NULL,\n`;
    sql += `  INDEX (\`studentId\`),\n`;
    sql += `  INDEX (\`course\`)\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    if (db.results && db.results.length) {
      sql += `INSERT INTO \`results\` (\`id\`, \`studentId\`, \`studentName\`, \`course\`, \`mid\`, \`final\`, \`quiz\`, \`total\`, \`grade\`, \`gpa\`, \`semester\`, \`remarks\`) VALUES\n`;
      const rRows = db.results.map(r => 
        `  ('${r.id}', '${r.studentId}', '${r.studentName.replace(/'/g, "''")}', '${r.course}', ${r.mid}, ${r.final}, ${r.quiz}, ${r.total}, '${r.grade}', ${r.gpa}, '${r.semester}', '${(r.remarks || '').replace(/'/g, "''")}')`
      );
      sql += rRows.join(',\n') + ';\n\n';
    }

    // 5. Assignments Table
    sql += `-- -----------------------------------------------------\n`;
    sql += `-- Table: assignments\n`;
    sql += `-- -----------------------------------------------------\n`;
    sql += `DROP TABLE IF EXISTS \`assignments\`;\n`;
    sql += `CREATE TABLE \`assignments\` (\n`;
    sql += `  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,\n`;
    sql += `  \`title\` VARCHAR(200) NOT NULL,\n`;
    sql += `  \`course\` VARCHAR(20) NOT NULL,\n`;
    sql += `  \`teacher\` VARCHAR(100) NOT NULL,\n`;
    sql += `  \`deadline\` DATE NOT NULL,\n`;
    sql += `  \`totalMarks\` INT NOT NULL DEFAULT 20,\n`;
    sql += `  \`status\` VARCHAR(50) DEFAULT 'Active',\n`;
    sql += `  \`instructions\` TEXT DEFAULT NULL,\n`;
    sql += `  \`submissions_json\` LONGTEXT DEFAULT NULL\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    if (db.assignments && db.assignments.length) {
      sql += `INSERT INTO \`assignments\` (\`id\`, \`title\`, \`course\`, \`teacher\`, \`deadline\`, \`totalMarks\`, \`status\`, \`instructions\`, \`submissions_json\`) VALUES\n`;
      const aRows = db.assignments.map(a => {
        const jsonSub = JSON.stringify(a.submissions || []).replace(/'/g, "''");
        return `  ('${a.id}', '${a.title.replace(/'/g, "''")}', '${a.course}', '${a.teacher.replace(/'/g, "''")}', '${a.deadline}', ${a.totalMarks}, '${a.status}', '${(a.instructions || '').replace(/'/g, "''")}', '${jsonSub}')`;
      });
      sql += aRows.join(',\n') + ';\n\n';
    }

    // 6. Routine Table
    sql += `-- -----------------------------------------------------\n`;
    sql += `-- Table: routine\n`;
    sql += `-- -----------------------------------------------------\n`;
    sql += `DROP TABLE IF EXISTS \`routine\`;\n`;
    sql += `CREATE TABLE \`routine\` (\n`;
    sql += `  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,\n`;
    sql += `  \`day\` VARCHAR(20) NOT NULL,\n`;
    sql += `  \`time\` VARCHAR(50) NOT NULL,\n`;
    sql += `  \`course\` VARCHAR(20) NOT NULL,\n`;
    sql += `  \`name\` VARCHAR(100) NOT NULL,\n`;
    sql += `  \`teacher\` VARCHAR(100) NOT NULL,\n`;
    sql += `  \`room\` VARCHAR(50) NOT NULL,\n`;
    sql += `  \`type\` VARCHAR(20) DEFAULT 'Lecture',\n`;
    sql += `  \`section\` VARCHAR(50) DEFAULT 'Section A'\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    if (db.routine && db.routine.length) {
      sql += `INSERT INTO \`routine\` (\`id\`, \`day\`, \`time\`, \`course\`, \`name\`, \`teacher\`, \`room\`, \`type\`, \`section\`) VALUES\n`;
      const rtnRows = db.routine.map(rt => 
        `  ('${rt.id}', '${rt.day}', '${rt.time}', '${rt.course}', '${rt.name.replace(/'/g, "''")}', '${rt.teacher.replace(/'/g, "''")}', '${rt.room}', '${rt.type}', '${rt.section}')`
      );
      sql += rtnRows.join(',\n') + ';\n\n';
    }

    // 7. Notices Table
    sql += `-- -----------------------------------------------------\n`;
    sql += `-- Table: notices\n`;
    sql += `-- -----------------------------------------------------\n`;
    sql += `DROP TABLE IF EXISTS \`notices\`;\n`;
    sql += `CREATE TABLE \`notices\` (\n`;
    sql += `  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,\n`;
    sql += `  \`title\` VARCHAR(200) NOT NULL,\n`;
    sql += `  \`category\` ENUM('Academic', 'Exam', 'Urgent', 'Event') DEFAULT 'Academic',\n`;
    sql += `  \`author\` VARCHAR(100) NOT NULL,\n`;
    sql += `  \`target\` VARCHAR(100) DEFAULT 'All',\n`;
    sql += `  \`date\` VARCHAR(50) NOT NULL,\n`;
    sql += `  \`isPinned\` BOOLEAN DEFAULT FALSE,\n`;
    sql += `  \`message\` TEXT NOT NULL\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n`;

    if (db.notices && db.notices.length) {
      sql += `INSERT INTO \`notices\` (\`id\`, \`title\`, \`category\`, \`author\`, \`target\`, \`date\`, \`isPinned\`, \`message\`) VALUES\n`;
      const nRows = db.notices.map(n => 
        `  ('${n.id}', '${n.title.replace(/'/g, "''")}', '${n.category}', '${n.author.replace(/'/g, "''")}', '${n.target}', '${n.date}', ${n.isPinned ? 1 : 0}, '${n.message.replace(/'/g, "''")}')`
      );
      sql += nRows.join(',\n') + ';\n\n';
    }

    return sql;
  }
}

// Global Singleton Instance
window.academicStore = new AcademicStoreV2();
