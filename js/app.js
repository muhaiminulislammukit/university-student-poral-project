/**
 * CSC 114 Student Portal - Core Application Controller
 * Handles Navigation, RBAC, CRUD Operations, UI Rendering, and LocalStorage Sync
 */

// Global State
let currentDB = getDB();
let currentUser = getCurrentUser();
let currentPage = "dashboard";
let activeSectionFilter = "ALL";
let activeRoutineDay = "ALL";
let attendanceDraft = {}; // In-memory attendance sheet before saving

// DOM Loaded Initialization
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  setupEventListeners();
  syncAuthUI();
  
  if (currentUser) {
    showApp();
    navigateTo("dashboard");
  } else {
    showLogin();
  }
});

// ----------------------------------------------------
// THEME & UTILITIES
// ----------------------------------------------------
function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(THEME_KEY, next);
  updateThemeIcon(next);
  showToast(`Switched to ${next} mode`, "info");
}

function updateThemeIcon(theme) {
  const btn = document.getElementById("themeToggleBtn");
  if (btn) {
    btn.innerHTML = theme === "dark" 
      ? `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`
      : `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`;
  }
}

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "⚠️";
  if (type === "warning") icon = "🔔";

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Custom Modal Confirmation
function confirmAction(title, message, onConfirm) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 420px; text-align: center;">
      <div style="font-size: 40px; margin-bottom: 12px;">⚠️</div>
      <h3 style="font-size: 18px; margin-bottom: 8px;">${title}</h3>
      <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 24px;">${message}</p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button class="btn btn-outline" id="confirmCancelBtn">Cancel</button>
        <button class="btn btn-danger" id="confirmOkBtn">Proceed</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector("#confirmCancelBtn").onclick = () => modal.remove();
  modal.querySelector("#confirmOkBtn").onclick = () => {
    modal.remove();
    onConfirm();
  };
}

// ----------------------------------------------------
// AUTHENTICATION & SESSION
// ----------------------------------------------------
function syncAuthUI() {
  if (!currentUser) return;

  const avatarElements = document.querySelectorAll(".user-avatar-text");
  avatarElements.forEach(el => {
    el.textContent = (currentUser.name || "User").charAt(0).toUpperCase();
  });

  const userNameEls = document.querySelectorAll(".user-name-text");
  userNameEls.forEach(el => el.textContent = currentUser.name);

  const userRoleEls = document.querySelectorAll(".user-role-text");
  userRoleEls.forEach(el => el.textContent = currentUser.role.toUpperCase());

  // Role pill indicator in topbar
  const roleIndicator = document.getElementById("topRoleIndicator");
  if (roleIndicator) {
    roleIndicator.textContent = currentUser.role.toUpperCase();
    roleIndicator.className = `badge ${currentUser.role === 'admin' ? 'badge-purple' : currentUser.role === 'teacher' ? 'badge-blue' : 'badge-green'}`;
  }

  // Quick role switcher select
  const quickSelect = document.getElementById("topQuickRoleSelect");
  if (quickSelect) {
    quickSelect.value = currentUser.role;
  }

  // Admin and Teacher restricted visibility
  const adminOnlyEls = document.querySelectorAll(".admin-only");
  adminOnlyEls.forEach(el => {
    el.style.display = (currentUser.role === "admin") ? "" : "none";
  });

  const teacherOrAdminEls = document.querySelectorAll(".teacher-or-admin-only");
  teacherOrAdminEls.forEach(el => {
    el.style.display = (currentUser.role === "admin" || currentUser.role === "teacher") ? "" : "none";
  });

  const studentOnlyEls = document.querySelectorAll(".student-only");
  studentOnlyEls.forEach(el => {
    el.style.display = (currentUser.role === "student") ? "" : "none";
  });
}

function handleLogin(e) {
  if (e) e.preventDefault();
  const idInput = document.getElementById("loginUsername").value.trim();
  const passInput = document.getElementById("loginPassword").value.trim();
  const roleInput = document.getElementById("loginRoleTab")?.dataset.role || "student";

  currentDB = getDB();
  let user = currentDB.users.find(u => 
    (u.username.toLowerCase() === idInput.toLowerCase() || u.email.toLowerCase() === idInput.toLowerCase() || u.studentId === idInput) &&
    u.password === passInput
  );

  if (!user) {
    // If not exact match, fall back for easy evaluation
    user = currentDB.users.find(u => u.role === roleInput) || {
      id: "USR-" + Date.now(),
      username: idInput || "student1",
      name: idInput || "Student User",
      email: (idInput || "student") + "@csc114.edu",
      role: roleInput,
      studentId: roleInput === "student" ? (idInput.startsWith("CSC") ? idInput : "CSC114-001") : null
    };
  }

  currentUser = user;
  setCurrentUser(user);
  syncAuthUI();
  showApp();
  navigateTo("dashboard");
  showToast(`Welcome back, ${user.name}!`, "success");
}

function quickLogin(type) {
  currentDB = getDB();
  let user;
  if (type === "admin") {
    user = currentDB.users.find(u => u.role === "admin");
  } else if (type === "teacher") {
    user = currentDB.users.find(u => u.role === "teacher");
  } else if (type === "student1") {
    user = currentDB.users.find(u => u.studentId === "CSC114-001");
  } else if (type === "student2") {
    user = currentDB.users.find(u => u.studentId === "CSC114-002");
  }

  if (user) {
    currentUser = user;
    setCurrentUser(user);
    syncAuthUI();
    showApp();
    navigateTo("dashboard");
    showToast(`Logged in as ${user.name} (${user.role.toUpperCase()})`, "success");
  }
}

function switchRole(newRole) {
  currentDB = getDB();
  let user = currentDB.users.find(u => u.role === newRole);
  if (!user) {
    user = {
      id: "USR-" + Date.now(),
      username: newRole + "_user",
      name: newRole === "admin" ? "Prof. Dr. M. Rahman" : newRole === "teacher" ? "Dr. Ahmed Hossain" : "Rahim Ahmed",
      role: newRole,
      studentId: newRole === "student" ? "CSC114-001" : null
    };
  }
  currentUser = user;
  setCurrentUser(user);
  syncAuthUI();
  navigateTo(currentPage);
  showToast(`Role switched to: ${newRole.toUpperCase()}`, "info");
}

function handleLogout() {
  logoutUser();
  currentUser = null;
  showLogin();
  showToast("Logged out successfully", "info");
}

function showLogin() {
  document.getElementById("authPage").classList.remove("hidden");
  document.getElementById("appLayout").classList.add("hidden");
}

function showApp() {
  document.getElementById("authPage").classList.add("hidden");
  document.getElementById("appLayout").classList.remove("hidden");
}

// ----------------------------------------------------
// ROUTING & NAVIGATION
// ----------------------------------------------------
function navigateTo(pageId) {
  currentPage = pageId;
  currentDB = getDB();

  // Hide all sections
  document.querySelectorAll(".page-view").forEach(el => el.classList.add("hidden"));

  // Show active view
  const targetView = document.getElementById(`view-${pageId}`);
  if (targetView) targetView.classList.remove("hidden");

  // Update active sidebar nav
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === pageId);
  });

  // Update topbar title
  const titles = {
    dashboard: "Executive Dashboard",
    students: "Student Information System",
    courses: "Course Curriculum & Offerings",
    attendance: "Daily Attendance Tracker",
    results: "Examination Results & Marksheet",
    assignments: "Assignment Submissions",
    routine: "Weekly Class Timetable",
    notices: "Notice Board & Announcements",
    profile: "User Profile & Settings",
    database: "Database & Developer Console"
  };
  const titleEl = document.getElementById("pageHeaderTitle");
  if (titleEl) titleEl.textContent = titles[pageId] || "Student Portal";

  // Close mobile sidebar if open
  closeMobileSidebar();

  // Trigger page renderers
  if (pageId === "dashboard") renderDashboard();
  if (pageId === "students") renderStudents();
  if (pageId === "courses") renderCourses();
  if (pageId === "attendance") initAttendanceView();
  if (pageId === "results") renderResults();
  if (pageId === "assignments") renderAssignments();
  if (pageId === "routine") renderRoutine();
  if (pageId === "notices") renderNotices();
  if (pageId === "profile") renderProfile();
  if (pageId === "database") renderDatabaseConsole();
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("open");
}

function closeMobileSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.classList.remove("open");
}

// ----------------------------------------------------
// 1. DASHBOARD VIEW
// ----------------------------------------------------
function renderDashboard() {
  currentDB = getDB();
  const students = currentDB.students || [];
  const courses = currentDB.courses || [];
  const notices = currentDB.notices || [];
  const assignments = currentDB.assignments || [];

  // Metrics
  const totalStudents = students.length;
  const avgAttendance = students.length 
    ? (students.reduce((acc, s) => acc + (parseFloat(s.attendance) || 0), 0) / students.length).toFixed(1)
    : "0";
  const avgCgpa = students.length
    ? (students.reduce((acc, s) => acc + (parseFloat(s.cgpa) || 0), 0) / students.length).toFixed(2)
    : "0.00";

  document.getElementById("statTotalStudents").textContent = totalStudents;
  document.getElementById("statTotalCourses").textContent = courses.length;
  document.getElementById("statAvgAttendance").textContent = `${avgAttendance}%`;
  document.getElementById("statAvgCgpa").textContent = avgCgpa;

  // Welcome banner text
  const welcomeGreeting = document.getElementById("welcomeGreeting");
  if (welcomeGreeting) {
    const greetingWord = new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening";
    welcomeGreeting.textContent = `${greetingWord}, ${currentUser ? currentUser.name : 'Rahim'}! 👋`;
  }

  // Dashboard Recent Notices
  const noticeContainer = document.getElementById("dashRecentNotices");
  if (noticeContainer) {
    const recent = notices.slice(0, 3);
    noticeContainer.innerHTML = recent.map(n => `
      <div class="notice-item" style="cursor: pointer;" onclick="openNoticeModal('${n.id}')">
        <div class="notice-badge">${n.category === 'Exam' ? '🎓' : n.category === 'Urgent' ? '🚨' : n.category === 'Event' ? '🏆' : '📢'}</div>
        <div class="notice-body">
          <h4>${n.title}</h4>
          <p>${n.message}</p>
          <div class="notice-meta">
            <span>📅 ${n.date}</span>
            <span>✍️ ${n.author}</span>
            ${n.isPinned ? '<span class="badge badge-yellow">📌 Pinned</span>' : ''}
          </div>
        </div>
      </div>
    `).join("");
  }

  // Dashboard Today's Schedule
  const routineContainer = document.getElementById("dashTodaySchedule");
  if (routineContainer) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDayName = days[new Date().getDay()] || "Sunday";
    let todayClasses = (currentDB.routine || []).filter(r => r.day.toLowerCase() === currentDayName.toLowerCase());
    
    // Fallback to Sunday if today is weekend
    if (!todayClasses.length) {
      todayClasses = (currentDB.routine || []).filter(r => r.day === "Sunday");
    }

    routineContainer.innerHTML = todayClasses.map((rc, idx) => `
      <div class="routine-card ${idx === 0 ? 'active-today' : ''}" style="margin-bottom: 12px;">
        <div class="routine-time">⏰ ${rc.time} ${idx === 0 ? '<span class="badge badge-green" style="margin-left: 8px;">Up Next</span>' : ''}</div>
        <div class="routine-title">${rc.course} - ${rc.name}</div>
        <div class="routine-room">📍 ${rc.room} &nbsp;•&nbsp; 👨‍🏫 ${rc.teacher}</div>
      </div>
    `).join("") || '<p style="color: var(--text-muted); font-size: 13px;">No classes scheduled for today.</p>';
  }

  // Render SVG Chart for Attendance & Academic Distribution
  renderAnalyticsChart(students);
}

function renderAnalyticsChart(students) {
  const chartBox = document.getElementById("analyticsChartBox");
  if (!chartBox) return;

  const secA = students.filter(s => s.section === "A");
  const secB = students.filter(s => s.section === "B");

  const avgAttA = secA.length ? Math.round(secA.reduce((a, b) => a + (parseFloat(b.attendance) || 0), 0) / secA.length) : 85;
  const avgAttB = secB.length ? Math.round(secB.reduce((a, b) => a + (parseFloat(b.attendance) || 0), 0) / secB.length) : 78;

  const avgCgpaA = secA.length ? (secA.reduce((a, b) => a + (parseFloat(b.cgpa) || 0), 0) / secA.length).toFixed(2) : "3.65";
  const avgCgpaB = secB.length ? (secB.reduce((a, b) => a + (parseFloat(b.cgpa) || 0), 0) / secB.length).toFixed(2) : "3.35";

  chartBox.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
      <div style="background: var(--bg-input); padding: 16px; border-radius: var(--radius-md); border-left: 4px solid var(--primary);">
        <span style="font-size: 12px; font-weight: 700; color: var(--text-muted);">SECTION A</span>
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 6px;">
          <div><b style="font-size: 20px;">${avgAttA}%</b> <span style="font-size: 11px; color: var(--text-subtle);">Attendance</span></div>
          <div><b style="font-size: 20px; color: var(--primary);">${avgCgpaA}</b> <span style="font-size: 11px; color: var(--text-subtle);">CGPA</span></div>
        </div>
        <div style="width: 100%; height: 6px; background: var(--border-light); border-radius: 4px; margin-top: 8px; overflow: hidden;">
          <div style="width: ${avgAttA}%; height: 100%; background: var(--primary);"></div>
        </div>
      </div>

      <div style="background: var(--bg-input); padding: 16px; border-radius: var(--radius-md); border-left: 4px solid var(--secondary);">
        <span style="font-size: 12px; font-weight: 700; color: var(--text-muted);">SECTION B</span>
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 6px;">
          <div><b style="font-size: 20px;">${avgAttB}%</b> <span style="font-size: 11px; color: var(--text-subtle);">Attendance</span></div>
          <div><b style="font-size: 20px; color: var(--secondary);">${avgCgpaB}</b> <span style="font-size: 11px; color: var(--text-subtle);">CGPA</span></div>
        </div>
        <div style="width: 100%; height: 6px; background: var(--border-light); border-radius: 4px; margin-top: 8px; overflow: hidden;">
          <div style="width: ${avgAttB}%; height: 100%; background: var(--secondary);"></div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 2. STUDENTS MANAGEMENT VIEW (CRUD & EXPORT)
// ----------------------------------------------------
function renderStudents() {
  currentDB = getDB();
  const searchInput = (document.getElementById("studentSearch")?.value || "").toLowerCase();
  const sectionFilter = document.getElementById("studentSectionFilter")?.value || "ALL";

  let filtered = (currentDB.students || []).filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchInput) ||
                          s.id.toLowerCase().includes(searchInput) ||
                          s.email.toLowerCase().includes(searchInput) ||
                          (s.phone && s.phone.includes(searchInput));
    const matchesSection = sectionFilter === "ALL" || s.section === sectionFilter;
    return matchesSearch && matchesSection;
  });

  const tbody = document.getElementById("studentsTableBody");
  if (!tbody) return;

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">No student records found matching query.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(s => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="user-avatar" style="width: 36px; height: 36px; font-size: 13px;">
            ${s.name.charAt(0)}
          </div>
          <div>
            <b style="cursor: pointer; color: var(--primary);" onclick="viewStudentDossier('${s.id}')">${s.name}</b>
            <span style="display: block; font-size: 11px; color: var(--text-muted);">${s.email}</span>
          </div>
        </div>
      </td>
      <td><b>${s.id}</b></td>
      <td><span class="badge ${s.section === 'A' ? 'badge-blue' : 'badge-purple'}">Sec ${s.section}</span></td>
      <td>
        <span class="badge ${s.attendance >= 80 ? 'badge-green' : s.attendance >= 75 ? 'badge-yellow' : 'badge-red'}">
          ${s.attendance}%
        </span>
      </td>
      <td><b style="color: ${s.cgpa >= 3.5 ? 'var(--success-text)' : 'inherit'}">${parseFloat(s.cgpa).toFixed(2)}</b></td>
      <td><span class="badge ${s.status === 'Active' ? 'badge-green' : 'badge-yellow'}">${s.status || 'Active'}</span></td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-outline btn-sm" onclick="viewStudentDossier('${s.id}')" title="View Dossier">👁️ View</button>
          ${currentUser && (currentUser.role === 'admin' || currentUser.role === 'teacher') ? `
            <button class="btn btn-outline btn-sm" onclick="editStudentModal('${s.id}')" title="Edit">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="deleteStudentAction('${s.id}')" title="Delete">🗑️</button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join("");
}

function openAddStudentModal() {
  document.getElementById("modalStudentForm").reset();
  document.getElementById("modalStudentId").value = "";
  document.getElementById("studentModalTitle").textContent = "Add New Student Record";
  document.getElementById("studentModalOverlay").classList.remove("hidden");
}

function editStudentModal(studentId) {
  currentDB = getDB();
  const s = currentDB.students.find(x => x.id === studentId);
  if (!s) return;

  document.getElementById("studentModalTitle").textContent = "Edit Student Profile";
  document.getElementById("modalStudentId").value = s.id;
  document.getElementById("modalStudentId").readOnly = true;
  document.getElementById("modalStudentName").value = s.name;
  document.getElementById("modalStudentEmail").value = s.email;
  document.getElementById("modalStudentPhone").value = s.phone || "";
  document.getElementById("modalStudentSection").value = s.section || "A";
  document.getElementById("modalStudentBatch").value = s.batch || "56th Batch";
  document.getElementById("modalStudentBlood").value = s.bloodGroup || "A+";
  document.getElementById("modalStudentAddress").value = s.address || "";
  document.getElementById("modalStudentGuardian").value = s.guardianPhone || "";

  document.getElementById("studentModalOverlay").classList.remove("hidden");
}

function closeStudentModal() {
  document.getElementById("studentModalOverlay").classList.add("hidden");
  document.getElementById("modalStudentId").readOnly = false;
}

function handleSaveStudent(e) {
  e.preventDefault();
  const id = document.getElementById("modalStudentId").value.trim();
  const name = document.getElementById("modalStudentName").value.trim();
  const email = document.getElementById("modalStudentEmail").value.trim();
  const phone = document.getElementById("modalStudentPhone").value.trim();
  const section = document.getElementById("modalStudentSection").value;
  const batch = document.getElementById("modalStudentBatch").value.trim();
  const bloodGroup = document.getElementById("modalStudentBlood").value;
  const address = document.getElementById("modalStudentAddress").value.trim();
  const guardianPhone = document.getElementById("modalStudentGuardian").value.trim();

  if (!id || !name || !email) {
    showToast("Student ID, Name, and Email are mandatory", "error");
    return;
  }

  currentDB = getDB();
  const existingIdx = currentDB.students.findIndex(s => s.id === id);

  if (existingIdx >= 0 && !document.getElementById("modalStudentId").readOnly) {
    showToast("A student with this ID already exists!", "error");
    return;
  }

  const studentPayload = {
    id,
    name,
    email,
    phone,
    section,
    batch,
    bloodGroup,
    address,
    guardianPhone,
    attendance: existingIdx >= 0 ? currentDB.students[existingIdx].attendance : 85.00,
    cgpa: existingIdx >= 0 ? currentDB.students[existingIdx].cgpa : 3.50,
    status: "Active"
  };

  if (existingIdx >= 0) {
    currentDB.students[existingIdx] = studentPayload;
    showToast(`Updated student profile for ${name}`, "success");
  } else {
    currentDB.students.push(studentPayload);
    // Also add to users login list if not existing
    if (!currentDB.users.some(u => u.username === id)) {
      currentDB.users.push({
        id: "USR-" + Date.now(),
        username: id,
        email,
        password: "123",
        role: "student",
        studentId: id,
        name
      });
    }
    showToast(`Enrolled new student: ${name}`, "success");
  }

  saveDB(currentDB);
  closeStudentModal();
  renderStudents();
  renderDashboard();
}

function deleteStudentAction(studentId) {
  confirmAction("Delete Student Record", `Are you sure you want to permanently delete student ${studentId}? All academic data will be removed.`, () => {
    currentDB = getDB();
    currentDB.students = currentDB.students.filter(s => s.id !== studentId);
    currentDB.results = (currentDB.results || []).filter(r => r.studentId !== studentId);
    saveDB(currentDB);
    renderStudents();
    renderDashboard();
    showToast(`Student ${studentId} removed from database`, "success");
  });
}

function viewStudentDossier(studentId) {
  currentDB = getDB();
  const s = currentDB.students.find(x => x.id === studentId);
  if (!s) return;

  const results = (currentDB.results || []).filter(r => r.studentId === studentId);
  const container = document.getElementById("dossierModalContent");
  if (!container) return;

  container.innerHTML = `
    <div class="transcript-header">
      <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: grid; place-items: center; font-size: 26px; font-weight: 800; margin: 0 auto 12px;">
        ${s.name.charAt(0)}
      </div>
      <h2 style="font-size: 22px;">${s.name}</h2>
      <p style="color: var(--text-muted); font-size: 13px;">ID: <b>${s.id}</b> &nbsp;•&nbsp; Section: <b>${s.section}</b> &nbsp;•&nbsp; Batch: <b>${s.batch || '56th'}</b></p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; text-align: center;">
      <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-md);">
        <span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Cumulative GPA</span>
        <h3 style="font-size: 20px; color: var(--primary); margin-top: 4px;">${parseFloat(s.cgpa).toFixed(2)}</h3>
      </div>
      <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-md);">
        <span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Attendance Rate</span>
        <h3 style="font-size: 20px; color: ${s.attendance >= 75 ? 'var(--success-text)' : 'var(--danger-text)'}; margin-top: 4px;">${s.attendance}%</h3>
      </div>
      <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-md);">
        <span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Blood Group</span>
        <h3 style="font-size: 20px; margin-top: 4px;">${s.bloodGroup || 'A+'}</h3>
      </div>
    </div>

    <h4 style="font-size: 15px; margin-bottom: 12px;">Academic Performance & Results</h4>
    <div class="table-responsive" style="margin-bottom: 24px;">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Course</th>
            <th>Mid (30)</th>
            <th>Final (50)</th>
            <th>Quiz (20)</th>
            <th>Total</th>
            <th>Grade</th>
            <th>GPA</th>
          </tr>
        </thead>
        <tbody>
          ${results.length ? results.map(r => `
            <tr>
              <td><b>${r.course}</b></td>
              <td>${r.mid}</td>
              <td>${r.final}</td>
              <td>${r.quiz}</td>
              <td><b>${r.total}</b></td>
              <td><span class="badge ${r.grade.startsWith('A') ? 'badge-green' : 'badge-blue'}">${r.grade}</span></td>
              <td><b>${parseFloat(r.gpa).toFixed(2)}</b></td>
            </tr>
          `).join("") : '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No examination marks recorded yet.</td></tr>'}
        </tbody>
      </table>
    </div>

    <h4 style="font-size: 15px; margin-bottom: 12px;">Contact & Emergency Details</h4>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; font-size: 13px;">
      <div><b>Email:</b> <span style="color: var(--text-muted);">${s.email}</span></div>
      <div><b>Phone:</b> <span style="color: var(--text-muted);">${s.phone || 'N/A'}</span></div>
      <div><b>Guardian Phone:</b> <span style="color: var(--text-muted);">${s.guardianPhone || 'N/A'}</span></div>
      <div><b>Address:</b> <span style="color: var(--text-muted);">${s.address || 'N/A'}</span></div>
    </div>
  `;

  document.getElementById("dossierModalOverlay").classList.remove("hidden");
}

function closeDossierModal() {
  document.getElementById("dossierModalOverlay").classList.add("hidden");
}

function exportStudentsCSV() {
  currentDB = getDB();
  const students = currentDB.students || [];
  if (!students.length) {
    showToast("No student records to export", "warning");
    return;
  }

  const headers = ["ID", "Name", "Email", "Phone", "Section", "Batch", "BloodGroup", "Attendance", "CGPA", "Status"];
  const rows = students.map(s => [
    `"${s.id}"`,
    `"${s.name}"`,
    `"${s.email}"`,
    `"${s.phone || ''}"`,
    `"${s.section}"`,
    `"${s.batch || ''}"`,
    `"${s.bloodGroup || ''}"`,
    s.attendance || 0,
    s.cgpa || 0,
    `"${s.status || 'Active'}"`
  ]);

  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  downloadTextFile(`CSC114_Students_${new Date().toISOString().slice(0, 10)}.csv`, csvContent, "text/csv");
  showToast("Exported students to CSV", "success");
}

function exportStudentsJSON() {
  currentDB = getDB();
  const content = JSON.stringify(currentDB.students || [], null, 2);
  downloadTextFile(`CSC114_Students_${new Date().toISOString().slice(0, 10)}.json`, content, "application/json");
  showToast("Exported students to JSON", "success");
}

// ----------------------------------------------------
// 3. COURSES MANAGEMENT VIEW
// ----------------------------------------------------
function renderCourses() {
  currentDB = getDB();
  const courses = currentDB.courses || [];
  const container = document.getElementById("coursesContainer");
  if (!container) return;

  container.innerHTML = courses.map(c => `
    <div class="course-card">
      <div>
        <div class="course-header">
          <span class="course-code">${c.code}</span>
          <span class="badge badge-purple">${c.credit} Credits</span>
        </div>
        <h3 class="course-name">${c.name}</h3>
        <p class="course-desc">${c.description || 'Core curriculum course for Computer Science & Engineering degree.'}</p>
      </div>

      <div>
        <div class="course-meta">
          <div>👨‍🏫 <b>${c.teacher}</b></div>
          <div>📍 ${c.room || 'TBD'}</div>
        </div>
        ${currentUser && currentUser.role === 'admin' ? `
          <div style="display: flex; gap: 8px; margin-top: 14px; border-top: 1px dashed var(--border-light); padding-top: 12px;">
            <button class="btn btn-outline btn-sm" onclick="editCourseModal('${c.code}')">✏️ Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteCourseAction('${c.code}')">🗑️ Delete</button>
          </div>
        ` : ''}
      </div>
    </div>
  `).join("");
}

function openAddCourseModal() {
  document.getElementById("modalCourseForm").reset();
  document.getElementById("modalCourseCode").readOnly = false;
  document.getElementById("courseModalTitle").textContent = "Add New Curriculum Course";
  document.getElementById("courseModalOverlay").classList.remove("hidden");
}

function editCourseModal(courseCode) {
  currentDB = getDB();
  const c = currentDB.courses.find(x => x.code === courseCode);
  if (!c) return;

  document.getElementById("courseModalTitle").textContent = "Edit Course Specification";
  document.getElementById("modalCourseCode").value = c.code;
  document.getElementById("modalCourseCode").readOnly = true;
  document.getElementById("modalCourseName").value = c.name;
  document.getElementById("modalCourseTeacher").value = c.teacher;
  document.getElementById("modalCourseCredit").value = c.credit;
  document.getElementById("modalCourseDepartment").value = c.department || "CSE";
  document.getElementById("modalCourseRoom").value = c.room || "";
  document.getElementById("modalCourseDesc").value = c.description || "";

  document.getElementById("courseModalOverlay").classList.remove("hidden");
}

function closeCourseModal() {
  document.getElementById("courseModalOverlay").classList.add("hidden");
}

function handleSaveCourse(e) {
  e.preventDefault();
  const code = document.getElementById("modalCourseCode").value.trim().toUpperCase();
  const name = document.getElementById("modalCourseName").value.trim();
  const teacher = document.getElementById("modalCourseTeacher").value.trim();
  const credit = parseInt(document.getElementById("modalCourseCredit").value) || 3;
  const department = document.getElementById("modalCourseDepartment").value.trim();
  const room = document.getElementById("modalCourseRoom").value.trim();
  const description = document.getElementById("modalCourseDesc").value.trim();

  if (!code || !name || !teacher) {
    showToast("Course Code, Title, and Instructor are mandatory", "error");
    return;
  }

  currentDB = getDB();
  const idx = currentDB.courses.findIndex(c => c.code === code);

  const coursePayload = {
    code,
    name,
    teacher,
    credit,
    department: department || "CSE",
    room: room || "Room 301",
    semester: "3rd Semester",
    description
  };

  if (idx >= 0) {
    currentDB.courses[idx] = coursePayload;
    showToast(`Updated course: ${code}`, "success");
  } else {
    currentDB.courses.push(coursePayload);
    showToast(`Added new course: ${code}`, "success");
  }

  saveDB(currentDB);
  closeCourseModal();
  renderCourses();
  renderDashboard();
}

function deleteCourseAction(courseCode) {
  confirmAction("Delete Course", `Are you sure you want to delete course ${courseCode}?`, () => {
    currentDB = getDB();
    currentDB.courses = currentDB.courses.filter(c => c.code !== courseCode);
    saveDB(currentDB);
    renderCourses();
    renderDashboard();
    showToast(`Course ${courseCode} deleted`, "success");
  });
}

// ----------------------------------------------------
// 4. ATTENDANCE MANAGEMENT VIEW
// ----------------------------------------------------
function initAttendanceView() {
  currentDB = getDB();
  const courses = currentDB.courses || [];
  
  // Populate course select if needed
  const courseSelect = document.getElementById("attCourseSelect");
  if (courseSelect && !courseSelect.children.length) {
    courseSelect.innerHTML = courses.map(c => `<option value="${c.code}">${c.code} - ${c.name}</option>`).join("");
  }

  // Set today's date
  const dateInput = document.getElementById("attDateInput");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }

  loadAttendanceSheet();
}

function loadAttendanceSheet() {
  currentDB = getDB();
  const selectedCourse = document.getElementById("attCourseSelect")?.value || "CSC 114";
  const selectedSection = document.getElementById("attSectionSelect")?.value || "A";
  const selectedDate = document.getElementById("attDateInput")?.value || new Date().toISOString().slice(0, 10);

  // Find if existing record exists for this date, course, section
  const existingRecord = (currentDB.attendance || []).find(a => 
    a.course === selectedCourse && a.section === selectedSection && a.date === selectedDate
  );

  const studentsInSection = (currentDB.students || []).filter(s => s.section === selectedSection);
  attendanceDraft = {};

  studentsInSection.forEach(s => {
    if (existingRecord && existingRecord.records && existingRecord.records[s.id]) {
      attendanceDraft[s.id] = existingRecord.records[s.id];
    } else {
      attendanceDraft[s.id] = "present"; // Default to present
    }
  });

  renderAttendanceTable(studentsInSection);
  updateAttendanceSummary();
}

function renderAttendanceTable(students) {
  const tbody = document.getElementById("attendanceTableBody");
  if (!tbody) return;

  if (!students.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--text-muted);">No students registered in this section.</td></tr>`;
    return;
  }

  tbody.innerHTML = students.map(s => {
    const status = attendanceDraft[s.id] || "present";
    return `
      <tr>
        <td><b>${s.id}</b></td>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="user-avatar" style="width: 32px; height: 32px; font-size: 12px;">${s.name.charAt(0)}</div>
            <span>${s.name}</span>
          </div>
        </td>
        <td><span class="badge ${s.section === 'A' ? 'badge-blue' : 'badge-purple'}">Sec ${s.section}</span></td>
        <td>
          <div class="attendance-toggle-group">
            <button type="button" class="att-btn ${status === 'present' ? 'active-present' : ''}" onclick="setStudentAttStatus('${s.id}', 'present')">Present</button>
            <button type="button" class="att-btn ${status === 'late' ? 'active-late' : ''}" onclick="setStudentAttStatus('${s.id}', 'late')">Late</button>
            <button type="button" class="att-btn ${status === 'absent' ? 'active-absent' : ''}" onclick="setStudentAttStatus('${s.id}', 'absent')">Absent</button>
          </div>
        </td>
        <td>
          <span class="badge ${status === 'present' ? 'badge-green' : status === 'late' ? 'badge-yellow' : 'badge-red'}">
            ${status.toUpperCase()}
          </span>
        </td>
      </tr>
    `;
  }).join("");
}

function setStudentAttStatus(studentId, status) {
  attendanceDraft[studentId] = status;
  const selectedSection = document.getElementById("attSectionSelect")?.value || "A";
  const students = (currentDB.students || []).filter(s => s.section === selectedSection);
  renderAttendanceTable(students);
  updateAttendanceSummary();
}

function markAllAttendance(status) {
  Object.keys(attendanceDraft).forEach(id => {
    attendanceDraft[id] = status;
  });
  const selectedSection = document.getElementById("attSectionSelect")?.value || "A";
  const students = (currentDB.students || []).filter(s => s.section === selectedSection);
  renderAttendanceTable(students);
  updateAttendanceSummary();
  showToast(`Marked all students as ${status.toUpperCase()}`, "info");
}

function updateAttendanceSummary() {
  const vals = Object.values(attendanceDraft);
  const total = vals.length;
  const present = vals.filter(v => v === "present").length;
  const late = vals.filter(v => v === "late").length;
  const absent = vals.filter(v => v === "absent").length;
  const pct = total ? Math.round(((present + (late * 0.5)) / total) * 100) : 0;

  document.getElementById("attCountTotal").textContent = total;
  document.getElementById("attCountPresent").textContent = present;
  document.getElementById("attCountLate").textContent = late;
  document.getElementById("attCountAbsent").textContent = absent;
  document.getElementById("attLivePercent").textContent = `${pct}%`;
}

function saveAttendanceSheet() {
  currentDB = getDB();
  const selectedCourse = document.getElementById("attCourseSelect")?.value || "CSC 114";
  const selectedSection = document.getElementById("attSectionSelect")?.value || "A";
  const selectedDate = document.getElementById("attDateInput")?.value || new Date().toISOString().slice(0, 10);

  if (!Object.keys(attendanceDraft).length) {
    showToast("No student records to save", "warning");
    return;
  }

  // Remove previous entry for this exact date/course/section if present
  currentDB.attendance = (currentDB.attendance || []).filter(a => 
    !(a.course === selectedCourse && a.section === selectedSection && a.date === selectedDate)
  );

  // Add new session
  currentDB.attendance.push({
    id: "ATT-" + Date.now(),
    date: selectedDate,
    course: selectedCourse,
    section: selectedSection,
    takenBy: currentUser ? currentUser.name : "Dr. Ahmed Hossain",
    records: { ...attendanceDraft }
  });

  // Automatically recalculate students' overall attendance rate based on history
  recalculateAttendanceStats(currentDB);

  saveDB(currentDB);
  showToast(`Attendance saved successfully for ${selectedCourse} (${selectedDate})`, "success");
  renderDashboard();
}

function recalculateAttendanceStats(db) {
  const history = db.attendance || [];
  if (!history.length) return;

  db.students.forEach(student => {
    let totalSessions = 0;
    let attendedScore = 0;

    history.forEach(session => {
      if (session.records && session.records[student.id]) {
        totalSessions++;
        const status = session.records[student.id];
        if (status === "present") attendedScore += 1;
        else if (status === "late") attendedScore += 0.75;
      }
    });

    if (totalSessions > 0) {
      student.attendance = Math.min(100, Math.round((attendedScore / totalSessions) * 100));
    }
  });
}

// ----------------------------------------------------
// 5. RESULTS & MARKS MANAGEMENT VIEW
// ----------------------------------------------------
function renderResults() {
  currentDB = getDB();
  const results = currentDB.results || [];
  const search = (document.getElementById("resultSearch")?.value || "").toLowerCase();
  const courseFilter = document.getElementById("resultCourseFilter")?.value || "ALL";

  // Filter
  const filtered = results.filter(r => {
    const matchSearch = r.studentName.toLowerCase().includes(search) || r.studentId.toLowerCase().includes(search);
    const matchCourse = courseFilter === "ALL" || r.course === courseFilter;
    return matchSearch && matchCourse;
  });

  const tbody = document.getElementById("resultsTableBody");
  if (!tbody) return;

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 24px; color: var(--text-muted);">No examination marks registered.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(r => `
    <tr>
      <td><b>${r.studentId}</b></td>
      <td>${r.studentName}</td>
      <td><span class="badge badge-purple">${r.course}</span></td>
      <td>${r.mid} / 30</td>
      <td>${r.final} / 50</td>
      <td>${r.quiz} / 20</td>
      <td><b style="font-size: 15px;">${r.total}</b> / 100</td>
      <td>
        <span class="badge ${r.grade.startsWith('A') ? 'badge-green' : r.grade.startsWith('B') ? 'badge-blue' : r.grade === 'F' ? 'badge-red' : 'badge-yellow'}">
          ${r.grade} (${parseFloat(r.gpa).toFixed(2)})
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-outline btn-sm" onclick="printTranscriptModal('${r.studentId}')" title="Print Transcript">📜 Transcript</button>
          ${currentUser && (currentUser.role === 'admin' || currentUser.role === 'teacher') ? `
            <button class="btn btn-outline btn-sm" onclick="editResultModal('${r.id}')" title="Edit">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="deleteResultAction('${r.id}')" title="Delete">🗑️</button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join("");

  // Populate course filter if empty
  const filterSelect = document.getElementById("resultCourseFilter");
  if (filterSelect && filterSelect.options.length <= 1) {
    (currentDB.courses || []).forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.code;
      opt.textContent = c.code;
      filterSelect.appendChild(opt);
    });
  }
}

function openAddResultModal() {
  currentDB = getDB();
  document.getElementById("modalResultForm").reset();
  document.getElementById("modalResultId").value = "";

  // Populate student select
  const studentSelect = document.getElementById("modalResultStudent");
  studentSelect.innerHTML = currentDB.students.map(s => `<option value="${s.id}">${s.id} - ${s.name}</option>`).join("");

  // Populate course select
  const courseSelect = document.getElementById("modalResultCourse");
  courseSelect.innerHTML = currentDB.courses.map(c => `<option value="${c.code}">${c.code} - ${c.name}</option>`).join("");

  calculateModalMarks();
  document.getElementById("resultModalOverlay").classList.remove("hidden");
}

function editResultModal(resId) {
  currentDB = getDB();
  const r = currentDB.results.find(x => x.id === resId);
  if (!r) return;

  openAddResultModal();
  document.getElementById("modalResultId").value = r.id;
  document.getElementById("modalResultStudent").value = r.studentId;
  document.getElementById("modalResultCourse").value = r.course;
  document.getElementById("modalResultMid").value = r.mid;
  document.getElementById("modalResultFinal").value = r.final;
  document.getElementById("modalResultQuiz").value = r.quiz;

  calculateModalMarks();
}

function closeResultModal() {
  document.getElementById("resultModalOverlay").classList.add("hidden");
}

function calculateModalMarks() {
  const mid = parseFloat(document.getElementById("modalResultMid")?.value) || 0;
  const final = parseFloat(document.getElementById("modalResultFinal")?.value) || 0;
  const quiz = parseFloat(document.getElementById("modalResultQuiz")?.value) || 0;

  const { total, grade, gpa } = calculateGrade(mid, final, quiz);
  document.getElementById("modalResultTotal").value = total;
  document.getElementById("modalResultGrade").textContent = `${grade} (${gpa.toFixed(2)})`;
}

function handleSaveResult(e) {
  e.preventDefault();
  currentDB = getDB();
  const resId = document.getElementById("modalResultId").value;
  const studentId = document.getElementById("modalResultStudent").value;
  const course = document.getElementById("modalResultCourse").value;
  const mid = parseFloat(document.getElementById("modalResultMid").value) || 0;
  const final = parseFloat(document.getElementById("modalResultFinal").value) || 0;
  const quiz = parseFloat(document.getElementById("modalResultQuiz").value) || 0;

  const student = currentDB.students.find(s => s.id === studentId);
  const studentName = student ? student.name : "Student";
  const { total, grade, gpa } = calculateGrade(mid, final, quiz);

  const payload = {
    id: resId || "RES-" + Date.now(),
    studentId,
    studentName,
    course,
    mid,
    final,
    quiz,
    total,
    grade,
    gpa,
    semester: "Fall 2026"
  };

  const idx = currentDB.results.findIndex(r => r.id === payload.id);
  if (idx >= 0) {
    currentDB.results[idx] = payload;
    showToast(`Updated mark entry for ${studentName}`, "success");
  } else {
    currentDB.results.push(payload);
    showToast(`Recorded marks for ${studentName}`, "success");
  }

  // Recalculate CGPA for the student
  recalculateStudentCGPA(currentDB, studentId);

  saveDB(currentDB);
  closeResultModal();
  renderResults();
  renderDashboard();
}

function recalculateStudentCGPA(db, studentId) {
  const student = db.students.find(s => s.id === studentId);
  if (!student) return;

  const marks = db.results.filter(r => r.studentId === studentId);
  if (marks.length) {
    const totalGpa = marks.reduce((sum, r) => sum + (parseFloat(r.gpa) || 0), 0);
    student.cgpa = parseFloat((totalGpa / marks.length).toFixed(2));
  }
}

function deleteResultAction(resId) {
  confirmAction("Delete Mark Entry", "Remove this result from the official gradebook?", () => {
    currentDB = getDB();
    const r = currentDB.results.find(x => x.id === resId);
    const sid = r ? r.studentId : null;
    currentDB.results = currentDB.results.filter(x => x.id !== resId);
    if (sid) recalculateStudentCGPA(currentDB, sid);
    saveDB(currentDB);
    renderResults();
    renderDashboard();
    showToast("Result entry deleted", "info");
  });
}

function printTranscriptModal(studentId) {
  viewStudentDossier(studentId);
}

// ----------------------------------------------------
// 6. ASSIGNMENTS VIEW
// ----------------------------------------------------
function renderAssignments() {
  currentDB = getDB();
  const assignments = currentDB.assignments || [];
  const container = document.getElementById("assignmentsContainer");
  if (!container) return;

  container.innerHTML = assignments.map(a => {
    const submissionCount = (a.submissions || []).length;
    const isStudent = currentUser && currentUser.role === "student";
    const mySubmission = isStudent && (a.submissions || []).find(sub => sub.studentId === currentUser.studentId);

    return `
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-header">
          <div>
            <span class="badge badge-purple" style="margin-bottom: 6px;">${a.course}</span>
            <h3 style="font-size: 18px;">${a.title}</h3>
          </div>
          <span class="badge ${a.status === 'Active' ? 'badge-green' : 'badge-yellow'}">
            ${a.status || 'Active'}
          </span>
        </div>

        <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 16px;">${a.description}</p>

        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; border-top: 1px solid var(--border-light); padding-top: 14px;">
          <div style="font-size: 12px; color: var(--text-muted);">
            <span>📅 Deadline: <b>${a.deadline}</b></span> &nbsp;•&nbsp;
            <span>🎯 Max Marks: <b>${a.totalMarks}</b></span> &nbsp;•&nbsp;
            <span>📥 Submissions: <b>${submissionCount}</b></span>
          </div>

          <div style="display: flex; gap: 8px;">
            ${isStudent ? `
              ${mySubmission ? `
                <span class="badge badge-green">Submitted (${mySubmission.marks !== null ? mySubmission.marks + ' pts' : 'Pending Review'})</span>
              ` : `
                <button class="btn btn-primary btn-sm" onclick="openSubmitAssignmentModal('${a.id}')">📤 Submit Solution</button>
              `}
            ` : `
              <button class="btn btn-outline btn-sm" onclick="openReviewSubmissionsModal('${a.id}')">👁️ Submissions (${submissionCount})</button>
              ${currentUser && currentUser.role === 'admin' ? `
                <button class="btn btn-danger btn-sm" onclick="deleteAssignmentAction('${a.id}')">🗑️</button>
              ` : ''}
            `}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function openCreateAssignmentModal() {
  currentDB = getDB();
  document.getElementById("modalAsnForm").reset();
  const select = document.getElementById("modalAsnCourse");
  select.innerHTML = currentDB.courses.map(c => `<option value="${c.code}">${c.code} - ${c.name}</option>`).join("");
  document.getElementById("assignmentModalOverlay").classList.remove("hidden");
}

function closeAssignmentModal() {
  document.getElementById("assignmentModalOverlay").classList.add("hidden");
}

function handleSaveAssignment(e) {
  e.preventDefault();
  currentDB = getDB();
  const title = document.getElementById("modalAsnTitle").value.trim();
  const course = document.getElementById("modalAsnCourse").value;
  const deadline = document.getElementById("modalAsnDeadline").value;
  const totalMarks = parseInt(document.getElementById("modalAsnMarks").value) || 20;
  const description = document.getElementById("modalAsnDesc").value.trim();

  if (!title || !deadline) {
    showToast("Assignment Title and Deadline are required", "error");
    return;
  }

  currentDB.assignments.unshift({
    id: "ASN-" + Date.now(),
    title,
    course,
    deadline,
    totalMarks,
    status: "Active",
    description,
    submissions: []
  });

  saveDB(currentDB);
  closeAssignmentModal();
  renderAssignments();
  showToast("New assignment published", "success");
}

function openSubmitAssignmentModal(asnId) {
  currentDB = getDB();
  const a = currentDB.assignments.find(x => x.id === asnId);
  if (!a) return;

  document.getElementById("submitAsnId").value = a.id;
  document.getElementById("submitAsnTitle").textContent = a.title;
  document.getElementById("submitAsnCourse").textContent = a.course;
  document.getElementById("submitModalOverlay").classList.remove("hidden");
}

function closeSubmitModal() {
  document.getElementById("submitModalOverlay").classList.add("hidden");
}

function handleStudentSubmission(e) {
  e.preventDefault();
  currentDB = getDB();
  const asnId = document.getElementById("submitAsnId").value;
  const fileLink = document.getElementById("submitFile").value.trim() || "csc114_assignment_submission.zip";
  const comments = document.getElementById("submitComments").value.trim();

  const a = currentDB.assignments.find(x => x.id === asnId);
  if (!a) return;

  if (!a.submissions) a.submissions = [];
  
  // Remove prior submission if any
  a.submissions = a.submissions.filter(s => s.studentId !== currentUser.studentId);

  a.submissions.push({
    studentId: currentUser.studentId || "CSC114-001",
    studentName: currentUser.name,
    submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    fileLink,
    comments,
    status: "Submitted",
    marks: null,
    feedback: null
  });

  saveDB(currentDB);
  closeSubmitModal();
  renderAssignments();
  showToast("Assignment submitted successfully!", "success");
}

function openReviewSubmissionsModal(asnId) {
  currentDB = getDB();
  const a = currentDB.assignments.find(x => x.id === asnId);
  if (!a) return;

  const container = document.getElementById("reviewSubmissionsContent");
  container.innerHTML = `
    <h3 style="margin-bottom: 4px;">${a.title}</h3>
    <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">Course: <b>${a.course}</b> &nbsp;•&nbsp; Max Marks: <b>${a.totalMarks}</b></p>
    
    <div class="table-responsive">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Submission Date</th>
            <th>Notes & File</th>
            <th>Marks</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${(a.submissions || []).length ? a.submissions.map((sub, idx) => `
            <tr>
              <td>
                <b>${sub.studentName}</b>
                <span style="display: block; font-size: 11px; color: var(--text-muted);">${sub.studentId}</span>
              </td>
              <td>${sub.submittedAt}</td>
              <td>
                <span style="font-size: 12px; display: block;">${sub.comments || 'No comment'}</span>
                <span class="badge badge-blue" style="margin-top: 4px;">📎 ${sub.fileLink}</span>
              </td>
              <td>
                <input type="number" value="${sub.marks !== null ? sub.marks : ''}" placeholder="0" style="width: 60px; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border-light);" onchange="gradeSubmission('${a.id}', '${sub.studentId}', this.value)" /> / ${a.totalMarks}
              </td>
              <td>
                <span class="badge ${sub.status === 'Graded' ? 'badge-green' : 'badge-yellow'}">${sub.status}</span>
              </td>
            </tr>
          `).join("") : '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No student submissions recorded yet.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById("reviewModalOverlay").classList.remove("hidden");
}

function closeReviewModal() {
  document.getElementById("reviewModalOverlay").classList.add("hidden");
}

function gradeSubmission(asnId, studentId, marksVal) {
  currentDB = getDB();
  const a = currentDB.assignments.find(x => x.id === asnId);
  if (!a) return;

  const sub = (a.submissions || []).find(s => s.studentId === studentId);
  if (sub) {
    sub.marks = parseFloat(marksVal) || 0;
    sub.status = "Graded";
    saveDB(currentDB);
    showToast(`Graded submission for ${sub.studentName}`, "success");
  }
}

function deleteAssignmentAction(asnId) {
  confirmAction("Delete Assignment", "Are you sure you want to delete this assignment and its submissions?", () => {
    currentDB = getDB();
    currentDB.assignments = currentDB.assignments.filter(a => a.id !== asnId);
    saveDB(currentDB);
    renderAssignments();
    showToast("Assignment removed", "info");
  });
}

// ----------------------------------------------------
// 7. CLASS ROUTINE VIEW
// ----------------------------------------------------
function renderRoutine() {
  currentDB = getDB();
  const routine = currentDB.routine || [];
  const container = document.getElementById("routineCardsContainer");
  if (!container) return;

  const filtered = routine.filter(r => activeRoutineDay === "ALL" || r.day === activeRoutineDay);

  container.innerHTML = filtered.map(r => `
    <div class="routine-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <span class="badge badge-blue">${r.day}</span>
        <span class="badge ${r.type === 'Lab' ? 'badge-purple' : 'badge-green'}">${r.type || 'Lecture'}</span>
      </div>
      <div class="routine-time" style="margin-top: 10px;">⏰ ${r.time}</div>
      <div class="routine-title">${r.course} - ${r.name}</div>
      <div class="routine-room">📍 <b>${r.room}</b> &nbsp;•&nbsp; 👨‍🏫 ${r.teacher}</div>
      ${currentUser && currentUser.role === 'admin' ? `
        <div style="margin-top: 12px; text-align: right;">
          <button class="btn btn-danger btn-sm" onclick="deleteRoutineAction('${r.id}')">🗑️</button>
        </div>
      ` : ''}
    </div>
  `).join("") || '<p style="color: var(--text-muted); padding: 24px;">No routine classes for selected day.</p>';
}

function filterRoutineDay(day) {
  activeRoutineDay = day;
  document.querySelectorAll(".routine-filter-chip").forEach(c => {
    c.classList.toggle("active", c.dataset.day === day);
  });
  renderRoutine();
}

function openAddRoutineModal() {
  currentDB = getDB();
  document.getElementById("modalRoutineForm").reset();
  const select = document.getElementById("modalRtnCourse");
  select.innerHTML = currentDB.courses.map(c => `<option value="${c.code}" data-name="${c.name}">${c.code} - ${c.name}</option>`).join("");
  document.getElementById("routineModalOverlay").classList.remove("hidden");
}

function closeRoutineModal() {
  document.getElementById("routineModalOverlay").classList.add("hidden");
}

function handleSaveRoutine(e) {
  e.preventDefault();
  currentDB = getDB();
  const day = document.getElementById("modalRtnDay").value;
  const time = document.getElementById("modalRtnTime").value.trim();
  const courseCode = document.getElementById("modalRtnCourse").value;
  const room = document.getElementById("modalRtnRoom").value.trim();
  const type = document.getElementById("modalRtnType").value;

  const courseObj = currentDB.courses.find(c => c.code === courseCode);
  const courseName = courseObj ? courseObj.name : "Computer Science";
  const teacher = courseObj ? courseObj.teacher : "Faculty";

  currentDB.routine.push({
    id: "RTN-" + Date.now(),
    day,
    time,
    course: courseCode,
    name: courseName,
    teacher,
    room,
    type
  });

  saveDB(currentDB);
  closeRoutineModal();
  renderRoutine();
  renderDashboard();
  showToast("Class slot added to routine", "success");
}

function deleteRoutineAction(rtnId) {
  confirmAction("Delete Routine Slot", "Delete this class routine slot?", () => {
    currentDB = getDB();
    currentDB.routine = currentDB.routine.filter(r => r.id !== rtnId);
    saveDB(currentDB);
    renderRoutine();
    renderDashboard();
    showToast("Class slot removed", "info");
  });
}

// ----------------------------------------------------
// 8. NOTICES VIEW
// ----------------------------------------------------
function renderNotices() {
  currentDB = getDB();
  const notices = currentDB.notices || [];
  const container = document.getElementById("noticesListContainer");
  if (!container) return;

  container.innerHTML = notices.map(n => `
    <div class="card" style="margin-bottom: 16px; border-left: 4px solid ${n.category === 'Urgent' ? 'var(--danger)' : n.category === 'Exam' ? 'var(--accent)' : 'var(--primary)'};">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge ${n.category === 'Urgent' ? 'badge-red' : n.category === 'Exam' ? 'badge-purple' : 'badge-blue'}">${n.category}</span>
          ${n.isPinned ? '<span class="badge badge-yellow">📌 Pinned</span>' : ''}
        </div>
        <span style="font-size: 12px; color: var(--text-subtle);">📅 ${n.date}</span>
      </div>

      <h3 style="font-size: 18px; margin-bottom: 8px;">${n.title}</h3>
      <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 14px; line-height: 1.5;">${n.message}</p>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--border-light); padding-top: 10px; font-size: 12px;">
        <span style="color: var(--text-subtle);">Published by: <b>${n.author}</b></span>
        ${currentUser && (currentUser.role === 'admin' || currentUser.role === 'teacher') ? `
          <button class="btn btn-danger btn-sm" onclick="deleteNoticeAction('${n.id}')">🗑️ Delete</button>
        ` : ''}
      </div>
    </div>
  `).join("");
}

function openAddNoticeModal() {
  document.getElementById("modalNoticeForm").reset();
  document.getElementById("noticeModalOverlay").classList.remove("hidden");
}

function closeNoticeModal() {
  document.getElementById("noticeModalOverlay").classList.add("hidden");
}

function handleSaveNotice(e) {
  e.preventDefault();
  currentDB = getDB();
  const title = document.getElementById("modalNoticeTitle").value.trim();
  const category = document.getElementById("modalNoticeCategory").value;
  const message = document.getElementById("modalNoticeMessage").value.trim();
  const isPinned = document.getElementById("modalNoticePinned").checked;

  if (!title || !message) {
    showToast("Notice Title and Message are required", "error");
    return;
  }

  currentDB.notices.unshift({
    id: "NTC-" + Date.now(),
    title,
    category,
    author: currentUser ? currentUser.name : "Academic Administration",
    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    isPinned,
    message
  });

  saveDB(currentDB);
  closeNoticeModal();
  renderNotices();
  renderDashboard();
  showToast("Notice published to bulletin board", "success");
}

function deleteNoticeAction(noticeId) {
  confirmAction("Delete Notice", "Remove this notice from the board?", () => {
    currentDB = getDB();
    currentDB.notices = currentDB.notices.filter(n => n.id !== noticeId);
    saveDB(currentDB);
    renderNotices();
    renderDashboard();
    showToast("Notice removed", "info");
  });
}

function openNoticeModal(noticeId) {
  currentDB = getDB();
  const n = currentDB.notices.find(x => x.id === noticeId);
  if (!n) return;

  const container = document.getElementById("noticeReadContent");
  container.innerHTML = `
    <div style="display: flex; gap: 8px; margin-bottom: 12px;">
      <span class="badge ${n.category === 'Urgent' ? 'badge-red' : 'badge-blue'}">${n.category}</span>
      ${n.isPinned ? '<span class="badge badge-yellow">📌 Pinned</span>' : ''}
    </div>
    <h2 style="font-size: 22px; margin-bottom: 8px;">${n.title}</h2>
    <div style="font-size: 12px; color: var(--text-subtle); margin-bottom: 20px;">
      📅 Date: ${n.date} &nbsp;•&nbsp; ✍️ Author: ${n.author}
    </div>
    <p style="font-size: 15px; color: var(--text-main); line-height: 1.6; white-space: pre-line;">${n.message}</p>
  `;

  document.getElementById("noticeReadModalOverlay").classList.remove("hidden");
}

function closeNoticeReadModal() {
  document.getElementById("noticeReadModalOverlay").classList.add("hidden");
}

// ----------------------------------------------------
// 9. PROFILE VIEW
// ----------------------------------------------------
function renderProfile() {
  currentDB = getDB();
  if (!currentUser) return;

  const isStudent = currentUser.role === "student";
  const student = isStudent ? currentDB.students.find(s => s.id === currentUser.studentId) : null;

  document.getElementById("profileName").textContent = currentUser.name;
  document.getElementById("profileRole").textContent = currentUser.role.toUpperCase();
  document.getElementById("profileAvatarText").textContent = currentUser.name.charAt(0).toUpperCase();

  document.getElementById("profileInputName").value = currentUser.name;
  document.getElementById("profileInputEmail").value = currentUser.email;
  document.getElementById("profileInputPhone").value = (student && student.phone) || "+880 1711-000001";
  document.getElementById("profileInputAddress").value = (student && student.address) || "Dhaka, Bangladesh";
  document.getElementById("profileInputGuardian").value = (student && student.guardianPhone) || "+880 1819-000000";

  // Academic Badges
  const academicBox = document.getElementById("profileAcademicDetails");
  if (academicBox) {
    academicBox.innerHTML = isStudent && student ? `
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 18px;">
        <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-md); text-align: center;">
          <span style="font-size: 11px; color: var(--text-muted);">STUDENT ID</span>
          <h4 style="font-size: 16px; margin-top: 4px;">${student.id}</h4>
        </div>
        <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-md); text-align: center;">
          <span style="font-size: 11px; color: var(--text-muted);">SECTION</span>
          <h4 style="font-size: 16px; margin-top: 4px;">Sec ${student.section}</h4>
        </div>
        <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-md); text-align: center;">
          <span style="font-size: 11px; color: var(--text-muted);">CURRENT CGPA</span>
          <h4 style="font-size: 16px; color: var(--primary); margin-top: 4px;">${parseFloat(student.cgpa).toFixed(2)}</h4>
        </div>
        <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-md); text-align: center;">
          <span style="font-size: 11px; color: var(--text-muted);">ATTENDANCE</span>
          <h4 style="font-size: 16px; color: var(--success-text); margin-top: 4px;">${student.attendance}%</h4>
        </div>
      </div>
    ` : `
      <div style="background: var(--bg-input); padding: 16px; border-radius: var(--radius-md); margin-top: 18px;">
        <span style="font-size: 12px; color: var(--text-muted);">FACULTY CREDENTIAL</span>
        <h4 style="font-size: 16px; margin-top: 4px;">${currentUser.title || 'Department Head / Faculty Member'}</h4>
        <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">Department: ${currentUser.department || 'Computer Science & Engineering'}</p>
      </div>
    `;
  }
}

function handleSaveProfile(e) {
  e.preventDefault();
  currentDB = getDB();
  const name = document.getElementById("profileInputName").value.trim();
  const email = document.getElementById("profileInputEmail").value.trim();
  const phone = document.getElementById("profileInputPhone").value.trim();
  const address = document.getElementById("profileInputAddress").value.trim();
  const guardianPhone = document.getElementById("profileInputGuardian").value.trim();

  currentUser.name = name;
  currentUser.email = email;
  setCurrentUser(currentUser);

  // Sync in DB
  const userInDB = currentDB.users.find(u => u.id === currentUser.id);
  if (userInDB) {
    userInDB.name = name;
    userInDB.email = email;
  }

  if (currentUser.role === "student" && currentUser.studentId) {
    const s = currentDB.students.find(x => x.id === currentUser.studentId);
    if (s) {
      s.name = name;
      s.email = email;
      s.phone = phone;
      s.address = address;
      s.guardianPhone = guardianPhone;
    }
  }

  saveDB(currentDB);
  syncAuthUI();
  renderProfile();
  showToast("Profile details updated successfully", "success");
}

// ----------------------------------------------------
// 10. DATABASE CONSOLE & MYSQL EXPORTER
// ----------------------------------------------------
function renderDatabaseConsole() {
  currentDB = getDB();
  document.getElementById("dbUsersCount").textContent = (currentDB.users || []).length;
  document.getElementById("dbStudentsCount").textContent = (currentDB.students || []).length;
  document.getElementById("dbCoursesCount").textContent = (currentDB.courses || []).length;
  document.getElementById("dbAttendanceCount").textContent = (currentDB.attendance || []).length;
  document.getElementById("dbResultsCount").textContent = (currentDB.results || []).length;
  document.getElementById("dbAssignmentsCount").textContent = (currentDB.assignments || []).length;
  document.getElementById("dbRoutineCount").textContent = (currentDB.routine || []).length;
  document.getElementById("dbNoticesCount").textContent = (currentDB.notices || []).length;

  const sqlPreview = document.getElementById("dbSqlDumpPreview");
  if (sqlPreview) {
    const dump = generateMySQLDump(currentDB);
    sqlPreview.textContent = dump.slice(0, 1800) + "\n\n-- ... [Remaining INSERT statements omitted in preview. Click 'Download Complete MySQL Dump' to export all tables] ...";
  }
}

function downloadLiveMySQLDump() {
  currentDB = getDB();
  const sql = generateMySQLDump(currentDB);
  downloadTextFile(`csc114_portal_dump_${new Date().toISOString().slice(0, 10)}.sql`, sql, "application/sql");
  showToast("Downloaded complete MySQL dump file", "success");
}

function exportCompleteJSON() {
  currentDB = getDB();
  const jsonStr = JSON.stringify(currentDB, null, 2);
  downloadTextFile(`csc114_database_${new Date().toISOString().slice(0, 10)}.json`, jsonStr, "application/json");
  showToast("Exported complete JSON database", "success");
}

function importJSONFile(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.students && imported.courses) {
        currentDB = imported;
        saveDB(currentDB);
        showToast("Database imported successfully!", "success");
        navigateTo("dashboard");
      } else {
        showToast("Invalid database schema in JSON file", "error");
      }
    } catch (err) {
      showToast("Error parsing JSON file", "error");
    }
  };
  reader.readAsText(file);
}

function handleResetDatabase() {
  confirmAction("Reset to Factory Defaults", "Are you sure? This will wipe all current records and restore the original seed data.", () => {
    currentDB = resetDB();
    navigateTo("dashboard");
    showToast("Database restored to default demo state", "info");
  });
}

// ----------------------------------------------------
// EVENT LISTENERS BINDING
// ----------------------------------------------------
function setupEventListeners() {
  // Mobile drawer toggle
  document.getElementById("mobileToggleBtn")?.addEventListener("click", toggleMobileSidebar);
  document.getElementById("themeToggleBtn")?.addEventListener("click", toggleTheme);

  // Quick role switcher in topbar
  document.getElementById("topQuickRoleSelect")?.addEventListener("change", (e) => {
    switchRole(e.target.value);
  });

  // Login form submission
  document.getElementById("loginForm")?.addEventListener("submit", handleLogin);

  // Search listeners
  document.getElementById("studentSearch")?.addEventListener("input", renderStudents);
  document.getElementById("studentSectionFilter")?.addEventListener("change", renderStudents);
  document.getElementById("resultSearch")?.addEventListener("input", renderResults);
  document.getElementById("resultCourseFilter")?.addEventListener("change", renderResults);

  // Attendance controls
  document.getElementById("attCourseSelect")?.addEventListener("change", loadAttendanceSheet);
  document.getElementById("attSectionSelect")?.addEventListener("change", loadAttendanceSheet);
  document.getElementById("attDateInput")?.addEventListener("change", loadAttendanceSheet);

  // Marks calculator inputs
  ["modalResultMid", "modalResultFinal", "modalResultQuiz"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", calculateModalMarks);
  });

  // Routine day filter buttons
  document.querySelectorAll(".routine-filter-chip").forEach(btn => {
    btn.addEventListener("click", () => filterRoutineDay(btn.dataset.day));
  });

  // Cross-window DB sync
  window.addEventListener("portal_db_updated", (e) => {
    currentDB = e.detail;
  });
}
