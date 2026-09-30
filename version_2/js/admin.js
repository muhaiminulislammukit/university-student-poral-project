/**
 * CSC 114 Administrative Council Portal - Version 2.0 Client Application Logic
 * Dedicated to master student CRUD, faculty registry, curriculum, database dumps
 */

document.addEventListener("DOMContentLoaded", () => {
  // Guard route
  const adminUser = AuthV2.guardAdmin();
  if (!adminUser) return;

  initAdminPortal(adminUser);
});

function initAdminPortal(currentUser) {
  updateAdminHeader(currentUser);
  renderAllAdminTabs(currentUser);

  // Cross-tab / reactive update listener
  window.addEventListener(V2_EVENT_KEY, () => {
    const freshUser = AuthV2.getAdmin();
    if (freshUser) {
      updateAdminHeader(freshUser);
      renderAllAdminTabs(freshUser);
    }
  });

  const mobileToggle = document.getElementById("mobileToggleBtn");
  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      document.querySelector(".app-sidebar").classList.toggle("mobile-open");
    });
  }
}

function updateAdminHeader(user) {
  document.querySelectorAll(".admin-name-display").forEach(el => el.textContent = user.name);
  document.querySelectorAll(".admin-title-display").forEach(el => el.textContent = user.title || "Academic Administrator");

  const avatarImgs = document.querySelectorAll(".admin-avatar-img");
  avatarImgs.forEach(img => {
    img.src = user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";
  });
}

function switchTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".nav-link").forEach(el => el.classList.remove("active"));

  const targetTab = document.getElementById(`tab-${tabId}`);
  const targetLink = document.getElementById(`nav-${tabId}`);

  if (targetTab) targetTab.classList.add("active");
  if (targetLink) targetLink.classList.add("active");

  document.querySelector(".app-sidebar").classList.remove("mobile-open");
}

function renderAllAdminTabs(user) {
  const store = window.academicStore.get();
  renderAdminOverview(store, user);
  renderAdminStudents(store);
  renderAdminFaculty(store);
  renderAdminCourses(store);
  renderAdminRoutine(store);
  renderAdminNotices(store);
  renderAdminDatabaseConsole(store);
  renderAdminAuditLogs(store);
}

// 1. Overview Tab
function renderAdminOverview(store, user) {
  const totalStudents = store.students.length;
  const facultyMembers = store.users.filter(u => u.role === "teacher");
  const totalCourses = store.courses.length;
  
  const avgCgpa = (store.students.reduce((acc, s) => acc + (s.cgpa || 3.0), 0) / (totalStudents || 1)).toFixed(2);
  const avgAtt = Math.round(store.students.reduce((acc, s) => acc + (s.attendance || 80), 0) / (totalStudents || 1));

  const grid = document.getElementById("adminOverviewGrid");
  if (grid) {
    grid.innerHTML = `
      <div class="metric-card">
        <div class="metric-data">
          <h4>Enrolled Students</h4>
          <div class="value" style="color: #fbbf24;">${totalStudents}</div>
          <div class="note" style="color: #fde68a;">Active Undergrads</div>
        </div>
        <div class="metric-icon-wrap" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24;">👥</div>
      </div>

      <div class="metric-card">
        <div class="metric-data">
          <h4>Academic Faculty</h4>
          <div class="value" style="color: #38bdf8;">${facultyMembers.length}</div>
          <div class="note" style="color: #7dd3fc;">Professors & Lecturers</div>
        </div>
        <div class="metric-icon-wrap" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">👨‍🏫</div>
      </div>

      <div class="metric-card">
        <div class="metric-data">
          <h4>Curriculum Offerings</h4>
          <div class="value" style="color: #34d399;">${totalCourses}</div>
          <div class="note" style="color: #86efac;">Active Course Codes</div>
        </div>
        <div class="metric-icon-wrap" style="background: rgba(52, 211, 153, 0.15); color: #34d399;">📚</div>
      </div>

      <div class="metric-card">
        <div class="metric-data">
          <h4>Batch Average CGPA</h4>
          <div class="value" style="color: #a78bfa;">${avgCgpa}</div>
          <div class="note" style="color: #c4b5fd;">Overall Attendance: ${avgAtt}%</div>
        </div>
        <div class="metric-icon-wrap" style="background: rgba(167, 139, 250, 0.15); color: #a78bfa;">🎓</div>
      </div>
    `;
  }
}

// 2. Student Directory (Full CRUD)
let currentStudentFilter = { query: "", section: "all", status: "all" };

function renderAdminStudents(store) {
  const tbody = document.getElementById("adminStudentsTableBody");
  if (!tbody) return;

  let list = store.students || [];

  if (currentStudentFilter.query) {
    const q = currentStudentFilter.query.toLowerCase();
    list = list.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.id.toLowerCase().includes(q) || 
      s.email.toLowerCase().includes(q) ||
      (s.phone && s.phone.includes(q))
    );
  }

  if (currentStudentFilter.section !== "all") {
    list = list.filter(s => s.section === currentStudentFilter.section);
  }

  if (currentStudentFilter.status !== "all") {
    list = list.filter(s => s.status === currentStudentFilter.status);
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px;">No student records match filter criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(s => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${s.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;" alt="">
          <div>
            <strong style="color: #ffffff;">${s.name}</strong>
            <div style="font-size: 11.5px; color: var(--color-slate-400);">${s.email}</div>
          </div>
        </div>
      </td>
      <td><span style="font-family: var(--font-mono); font-weight: 700; color: #fbbf24;">${s.id}</span></td>
      <td>Section ${s.section}</td>
      <td><strong>${(s.cgpa || 3.5).toFixed(2)}</strong></td>
      <td>
        <span class="badge ${s.attendance >= 75 ? 'badge-success' : 'badge-danger'}">
          ${s.attendance}%
        </span>
      </td>
      <td>
        <span class="badge ${s.status === 'Active' ? 'badge-success' : 'badge-warning'}">
          ${s.status}
        </span>
      </td>
      <td style="text-align: right;">
        <div style="display: inline-flex; gap: 6px;">
          <button class="btn btn-sm btn-ghost" onclick="inspectStudentDossier('${s.id}')" title="Inspect Dossier">🔍</button>
          <button class="btn btn-sm btn-ghost" onclick="openEditStudentModal('${s.id}')" title="Edit Student">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="confirmDeleteStudent('${s.id}')" title="Delete Student">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function handleStudentSearchInput(input) {
  currentStudentFilter.query = input.value.trim();
  const store = window.academicStore.get();
  renderAdminStudents(store);
}

function handleStudentSectionFilter(select) {
  currentStudentFilter.section = select.value;
  const store = window.academicStore.get();
  renderAdminStudents(store);
}

function handleStudentStatusFilter(select) {
  currentStudentFilter.status = select.value;
  const store = window.academicStore.get();
  renderAdminStudents(store);
}

function openAddStudentModal() {
  document.getElementById("studentFormTitle").textContent = "Admit New Student";
  document.getElementById("studentEditModeId").value = "";
  document.getElementById("studentFormInputId").removeAttribute("readonly");
  document.getElementById("studentFormInputId").value = "CSC114-00" + (window.academicStore.get().students.length + 1);
  document.getElementById("studentFormInputName").value = "";
  document.getElementById("studentFormInputEmail").value = "";
  document.getElementById("studentFormInputPhone").value = "";
  document.getElementById("studentFormInputSection").value = "A";
  document.getElementById("studentFormInputBlood").value = "A+";
  document.getElementById("studentFormInputAddress").value = "";
  document.getElementById("studentFormInputGuardian").value = "";
  document.getElementById("studentFormInputGuardianPhone").value = "";
  document.getElementById("studentFormModal").classList.add("active");
}

function openEditStudentModal(studentId) {
  const store = window.academicStore.get();
  const s = store.students.find(stu => stu.id === studentId);
  if (!s) return;

  document.getElementById("studentFormTitle").textContent = `Edit Student: ${s.name}`;
  document.getElementById("studentEditModeId").value = s.id;
  document.getElementById("studentFormInputId").setAttribute("readonly", true);
  document.getElementById("studentFormInputId").value = s.id;
  document.getElementById("studentFormInputName").value = s.name;
  document.getElementById("studentFormInputEmail").value = s.email;
  document.getElementById("studentFormInputPhone").value = s.phone || "";
  document.getElementById("studentFormInputSection").value = s.section || "A";
  document.getElementById("studentFormInputBlood").value = s.bloodGroup || "A+";
  document.getElementById("studentFormInputAddress").value = s.address || "";
  document.getElementById("studentFormInputGuardian").value = s.guardianName || "";
  document.getElementById("studentFormInputGuardianPhone").value = s.guardianPhone || "";
  document.getElementById("studentFormModal").classList.add("active");
}

function closeStudentFormModal() {
  document.getElementById("studentFormModal").classList.remove("active");
}

function handleSaveStudentForm(e) {
  e.preventDefault();
  const store = window.academicStore.get();
  const admin = AuthV2.getAdmin();

  const editId = document.getElementById("studentEditModeId").value;
  const id = document.getElementById("studentFormInputId").value.trim();
  const name = document.getElementById("studentFormInputName").value.trim();
  const email = document.getElementById("studentFormInputEmail").value.trim();
  const phone = document.getElementById("studentFormInputPhone").value.trim();
  const section = document.getElementById("studentFormInputSection").value;
  const blood = document.getElementById("studentFormInputBlood").value;
  const address = document.getElementById("studentFormInputAddress").value.trim();
  const guardian = document.getElementById("studentFormInputGuardian").value.trim();
  const guardianPhone = document.getElementById("studentFormInputGuardianPhone").value.trim();

  if (editId) {
    // Update existing student
    const index = store.students.findIndex(s => s.id === editId);
    if (index !== -1) {
      store.students[index] = {
        ...store.students[index],
        name,
        email,
        phone,
        section,
        bloodGroup: blood,
        address,
        guardianName: guardian,
        guardianPhone: guardianPhone
      };
      window.academicStore.logActivity(`${admin.name} (Admin)`, `Updated student record for ${name} (${id}).`, 'student');
      AuthV2.showToast(`Updated student profile for ${name}`, "success");
    }
  } else {
    // Create new student
    const existing = store.students.find(s => s.id === id || s.email === email);
    if (existing) {
      AuthV2.showToast("Student with this ID or Email already exists.", "error");
      return;
    }

    const newStudent = {
      id,
      name,
      email,
      phone,
      section,
      batch: "56th Batch",
      bloodGroup: blood,
      address,
      guardianName: guardian,
      guardianPhone: guardianPhone,
      attendance: 85,
      cgpa: 3.50,
      creditsCompleted: 45,
      status: "Active",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
    };

    store.students.push(newStudent);

    // Also create login user credentials for this student
    const newUser = {
      id: "STU-" + Date.now(),
      username: id,
      studentId: id,
      email: email,
      password: "123",
      role: "student",
      name: name,
      title: `Undergraduate Student (Sec ${section})`,
      department: "CSE",
      section: section,
      avatar: newStudent.avatar
    };
    store.users.push(newUser);

    window.academicStore.logActivity(`${admin.name} (Admin)`, `Enrolled new student: ${name} (${id}).`, 'student');
    AuthV2.showToast(`Enrolled new student ${name} successfully!`, "success");
  }

  window.academicStore.save(store);
  closeStudentFormModal();
  renderAdminStudents(store);
}

function confirmDeleteStudent(studentId) {
  const store = window.academicStore.get();
  const admin = AuthV2.getAdmin();
  const s = store.students.find(stu => stu.id === studentId);
  if (!s) return;

  if (confirm(`Are you sure you want to completely deregister and remove student ${s.name} (${s.id})?`)) {
    store.students = store.students.filter(stu => stu.id !== studentId);
    store.users = store.users.filter(u => u.studentId !== studentId && u.username !== studentId);
    store.results = store.results.filter(r => r.studentId !== studentId);

    window.academicStore.save(store);
    window.academicStore.logActivity(`${admin.name} (Admin)`, `Deregistered student: ${s.name} (${studentId}).`, 'student');

    AuthV2.showToast(`Student ${s.name} deregistered.`, "info");
    renderAdminStudents(store);
  }
}

function inspectStudentDossier(studentId) {
  const store = window.academicStore.get();
  const s = store.students.find(stu => stu.id === studentId);
  if (!s) return;

  const myResults = store.results.filter(r => r.studentId === studentId);
  let resRows = myResults.length > 0 ? myResults.map(r => `
    <tr>
      <td><strong>${r.course}</strong></td>
      <td>Mid: ${r.mid} | Final: ${r.final} | Quiz: ${r.quiz}</td>
      <td><strong>${r.total}</strong></td>
      <td><span class="badge ${r.grade === 'F' ? 'badge-danger' : 'badge-success'}">${r.grade}</span></td>
      <td>${r.gpa.toFixed(2)}</td>
    </tr>
  `).join('') : `<tr><td colspan="5" style="text-align:center;">No published marks yet.</td></tr>`;

  document.getElementById("dossierModalTitle").textContent = `Academic Dossier: ${s.name}`;
  document.getElementById("dossierModalContent").innerHTML = `
    <div style="display: flex; gap: 20px; align-items: center; background: rgba(15, 23, 42, 0.7); padding: 16px; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 20px;">
      <img src="${s.avatar}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover;" alt="">
      <div>
        <h3 style="font-size: 18px;">${s.name}</h3>
        <div style="font-family: var(--font-mono); color: #fbbf24; font-size: 13px;">${s.id} | Section ${s.section} | ${s.batch}</div>
        <div style="font-size: 12.5px; color: var(--color-slate-400); margin-top: 4px;">📧 ${s.email} | 📞 ${s.phone || 'N/A'}</div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
      <div style="background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: var(--radius-sm); text-align: center;">
        <div style="font-size: 11px; color: var(--color-slate-400);">CGPA</div>
        <div style="font-size: 20px; font-weight: bold; color: #38bdf8;">${s.cgpa.toFixed(2)}</div>
      </div>
      <div style="background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: var(--radius-sm); text-align: center;">
        <div style="font-size: 11px; color: var(--color-slate-400);">Attendance</div>
        <div style="font-size: 20px; font-weight: bold; color: ${s.attendance >= 75 ? '#34d399' : '#f87171'};">${s.attendance}%</div>
      </div>
      <div style="background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: var(--radius-sm); text-align: center;">
        <div style="font-size: 11px; color: var(--color-slate-400);">Blood Group</div>
        <div style="font-size: 20px; font-weight: bold; color: #fbbf24;">${s.bloodGroup || 'O+'}</div>
      </div>
    </div>

    <div style="margin-bottom: 16px;">
      <h4 style="font-size: 13px; text-transform: uppercase; color: #fbbf24; margin-bottom: 8px;">Exam Results Record</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th>Course</th>
            <th>Breakdown</th>
            <th>Total</th>
            <th>Grade</th>
            <th>GPA</th>
          </tr>
        </thead>
        <tbody>${resRows}</tbody>
      </table>
    </div>

    <div style="font-size: 12.5px; color: var(--color-slate-400); border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 12px;">
      <div>Guardian: <strong>${s.guardianName || 'N/A'}</strong> (Phone: ${s.guardianPhone || 'N/A'})</div>
      <div style="margin-top: 4px;">Address: ${s.address || 'N/A'}</div>
    </div>
  `;

  document.getElementById("dossierModal").classList.add("active");
}

function closeDossierModal() {
  document.getElementById("dossierModal").classList.remove("active");
}

// Export Students to CSV
function exportStudentsCSV() {
  const store = window.academicStore.get();
  const students = store.students || [];

  const headers = ["Student ID", "Name", "Email", "Phone", "Section", "Batch", "Blood Group", "Attendance %", "CGPA", "Status"];
  const rows = students.map(s => [
    `"${s.id}"`,
    `"${s.name.replace(/"/g, '""')}"`,
    `"${s.email}"`,
    `"${s.phone || ''}"`,
    `"${s.section}"`,
    `"${s.batch}"`,
    `"${s.bloodGroup || ''}"`,
    s.attendance,
    s.cgpa,
    `"${s.status}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `csc114_students_${new Date().toISOString().substring(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();

  AuthV2.showToast("Student CSV roster downloaded!", "success");
}

// 3. Faculty Registry
function renderAdminFaculty(store) {
  const tbody = document.getElementById("adminFacultyTableBody");
  if (!tbody) return;

  const faculty = store.users.filter(u => u.role === "teacher");
  tbody.innerHTML = faculty.map(f => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${f.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;" alt="">
          <div>
            <strong style="color: #ffffff;">${f.name}</strong>
            <div style="font-size: 11.5px; color: var(--color-slate-400);">${f.title}</div>
          </div>
        </div>
      </td>
      <td>${f.email}</td>
      <td>${f.department || 'CSE'}</td>
      <td>${f.phone || '+880 1819-334455'}</td>
      <td>
        ${(f.assignedCourses || ['CSC 114']).map(c => `<span class="course-code" style="font-size: 10px; margin-right: 4px;">${c}</span>`).join('')}
      </td>
    </tr>
  `).join('');
}

function openAddFacultyModal() {
  document.getElementById("facultyFormModal").classList.add("active");
}

function closeFacultyFormModal() {
  document.getElementById("facultyFormModal").classList.remove("active");
}

function handleSaveFacultyForm(e) {
  e.preventDefault();
  const store = window.academicStore.get();
  const admin = AuthV2.getAdmin();

  const name = document.getElementById("facultyInputName").value.trim();
  const username = document.getElementById("facultyInputUsername").value.trim().toLowerCase();
  const email = document.getElementById("facultyInputEmail").value.trim();
  const title = document.getElementById("facultyInputTitle").value.trim();
  const dept = document.getElementById("facultyInputDept").value.trim();
  const phone = document.getElementById("facultyInputPhone").value.trim();
  const coursesStr = document.getElementById("facultyInputCourses").value.trim();
  const courses = coursesStr.split(',').map(s => s.trim()).filter(Boolean);

  const existing = store.users.find(u => u.username === username || u.email === email);
  if (existing) {
    AuthV2.showToast("Faculty with this username or email already exists.", "error");
    return;
  }

  const newFaculty = {
    id: "TCH-" + Date.now(),
    username,
    email,
    password: "123",
    role: "teacher",
    name,
    title,
    department: dept,
    phone,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    assignedCourses: courses.length > 0 ? courses : ["CSC 114"]
  };

  store.users.push(newFaculty);
  window.academicStore.save(store);
  window.academicStore.logActivity(`${admin.name} (Admin)`, `Added new faculty member: ${name} (${username}).`, 'faculty');

  AuthV2.showToast(`Faculty ${name} registered successfully!`, "success");
  closeFacultyFormModal();
  renderAdminFaculty(store);
}

// 4. Course Catalog Management
function renderAdminCourses(store) {
  const tbody = document.getElementById("adminCoursesTableBody");
  if (!tbody) return;

  tbody.innerHTML = store.courses.map(c => `
    <tr>
      <td><span class="course-code">${c.code}</span></td>
      <td><strong>${c.name}</strong></td>
      <td>${c.credit} Credits</td>
      <td>👨‍🏫 ${c.teacher}</td>
      <td>📍 ${c.room}</td>
      <td>${c.semester}</td>
      <td style="text-align: right;">
        <button class="btn btn-sm btn-danger" onclick="confirmDeleteCourse('${c.code}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function openAddCourseModal() {
  document.getElementById("courseFormModal").classList.add("active");
}

function closeCourseFormModal() {
  document.getElementById("courseFormModal").classList.remove("active");
}

function handleSaveCourseForm(e) {
  e.preventDefault();
  const store = window.academicStore.get();
  const admin = AuthV2.getAdmin();

  const code = document.getElementById("courseInputCode").value.trim().toUpperCase();
  const name = document.getElementById("courseInputName").value.trim();
  const credit = parseInt(document.getElementById("courseInputCredit").value) || 3;
  const teacher = document.getElementById("courseInputTeacher").value.trim();
  const room = document.getElementById("courseInputRoom").value.trim();
  const desc = document.getElementById("courseInputDesc").value.trim();

  const existing = store.courses.find(c => c.code === code);
  if (existing) {
    AuthV2.showToast("Course code already exists.", "error");
    return;
  }

  const newCourse = {
    code,
    name,
    credit,
    teacher,
    department: "CSE",
    room,
    semester: "3rd Semester",
    category: "Core Computer Science",
    description: desc
  };

  store.courses.push(newCourse);
  window.academicStore.save(store);
  window.academicStore.logActivity(`${admin.name} (Admin)`, `Created new course: ${code} - ${name}.`, 'course');

  AuthV2.showToast(`Course ${code} created successfully!`, "success");
  closeCourseFormModal();
  renderAdminCourses(store);
}

function confirmDeleteCourse(courseCode) {
  const store = window.academicStore.get();
  const admin = AuthV2.getAdmin();
  if (confirm(`Are you sure you want to remove course offering ${courseCode}?`)) {
    store.courses = store.courses.filter(c => c.code !== courseCode);
    window.academicStore.save(store);
    window.academicStore.logActivity(`${admin.name} (Admin)`, `Deleted course: ${courseCode}.`, 'course');
    AuthV2.showToast(`Course ${courseCode} removed.`, "info");
    renderAdminCourses(store);
  }
}

// 5. Timetable / Routine
function renderAdminRoutine(store) {
  const tbody = document.getElementById("adminRoutineTableBody");
  if (!tbody) return;

  tbody.innerHTML = store.routine.map(r => `
    <tr>
      <td><strong>${r.day}</strong></td>
      <td style="font-family: var(--font-mono); color: #fbbf24;">${r.time}</td>
      <td><strong>${r.course}</strong> - ${r.name}</td>
      <td>👨‍🏫 ${r.teacher}</td>
      <td>📍 ${r.room}</td>
      <td>${r.section}</td>
      <td style="text-align: right;">
        <button class="btn btn-sm btn-danger" onclick="confirmDeleteRoutineSlot('${r.id}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function openAddRoutineModal() {
  const store = window.academicStore.get();
  const courseSel = document.getElementById("routineInputCourse");
  if (courseSel) {
    courseSel.innerHTML = store.courses.map(c => `<option value="${c.code}">${c.code} - ${c.name}</option>`).join('');
  }
  document.getElementById("routineFormModal").classList.add("active");
}

function closeAddRoutineModal() {
  document.getElementById("routineFormModal").classList.remove("active");
}

function handleSaveRoutineSlot(e) {
  e.preventDefault();
  const store = window.academicStore.get();
  const admin = AuthV2.getAdmin();

  const day = document.getElementById("routineInputDay").value;
  const time = document.getElementById("routineInputTime").value.trim();
  const courseCode = document.getElementById("routineInputCourse").value;
  const room = document.getElementById("routineInputRoom").value.trim();
  const section = document.getElementById("routineInputSection").value;
  const type = document.getElementById("routineInputType").value;

  const courseObj = store.courses.find(c => c.code === courseCode);

  const newSlot = {
    id: "RTN-" + Date.now(),
    day,
    time,
    course: courseCode,
    name: courseObj ? courseObj.name : courseCode,
    teacher: courseObj ? courseObj.teacher : "Department Faculty",
    room,
    type,
    section
  };

  store.routine.push(newSlot);
  window.academicStore.save(store);
  window.academicStore.logActivity(`${admin.name} (Admin)`, `Added routine slot for ${courseCode} (${day} ${time}).`, 'routine');

  AuthV2.showToast("Routine schedule slot added!", "success");
  closeAddRoutineModal();
  renderAdminRoutine(store);
}

function confirmDeleteRoutineSlot(slotId) {
  const store = window.academicStore.get();
  const admin = AuthV2.getAdmin();
  store.routine = store.routine.filter(r => r.id !== slotId);
  window.academicStore.save(store);
  window.academicStore.logActivity(`${admin.name} (Admin)`, `Removed routine slot ${slotId}.`, 'routine');
  AuthV2.showToast("Routine slot deleted.", "info");
  renderAdminRoutine(store);
}

// 6. University Notices
function renderAdminNotices(store) {
  const container = document.getElementById("adminNoticesList");
  if (!container) return;

  container.innerHTML = store.notices.map(n => `
    <div class="glass-card" style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge ${n.category === 'Exam' ? 'badge-danger' : n.category === 'Urgent' ? 'badge-warning' : 'badge-info'}">${n.category}</span>
          ${n.isPinned ? `<span class="badge badge-warning">📌 Pinned</span>` : ''}
          <strong style="font-size: 15px; color: #ffffff;">${n.title}</strong>
        </div>
        <p style="font-size: 13px; color: var(--color-slate-300); margin: 8px 0;">${n.message}</p>
        <div style="font-size: 11.5px; color: var(--color-slate-500);">
          By: ${n.author} &nbsp;|&nbsp; Date: ${n.date}
        </div>
      </div>
      <button class="btn btn-sm btn-danger" onclick="confirmDeleteNotice('${n.id}')">🗑️</button>
    </div>
  `).join('');
}

function openAddNoticeModal() {
  document.getElementById("noticeFormModal").classList.add("active");
}

function closeNoticeFormModal() {
  document.getElementById("noticeFormModal").classList.remove("active");
}

function handleSaveNoticeForm(e) {
  e.preventDefault();
  const store = window.academicStore.get();
  const admin = AuthV2.getAdmin();

  const title = document.getElementById("noticeInputTitle").value.trim();
  const category = document.getElementById("noticeInputCategory").value;
  const message = document.getElementById("noticeInputMessage").value.trim();
  const isPinned = document.getElementById("noticeInputPinned").checked;

  const newNotice = {
    id: "NTC-" + Date.now(),
    title,
    category,
    author: admin.name,
    target: "All University Members",
    date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    isPinned,
    message
  };

  store.notices = [newNotice, ...(store.notices || [])];
  window.academicStore.save(store);
  window.academicStore.logActivity(`${admin.name} (Admin)`, `Broadcasted university notice: ${title}.`, 'notice');

  AuthV2.showToast("Notice published to all portals!", "success");
  closeNoticeFormModal();
  renderAdminNotices(store);
}

function confirmDeleteNotice(noticeId) {
  const store = window.academicStore.get();
  const admin = AuthV2.getAdmin();
  store.notices = store.notices.filter(n => n.id !== noticeId);
  window.academicStore.save(store);
  window.academicStore.logActivity(`${admin.name} (Admin)`, `Deleted notice ${noticeId}.`, 'notice');
  AuthV2.showToast("Notice removed.", "info");
  renderAdminNotices(store);
}

// 7. Database Console & MySQL Dump Generator
function renderAdminDatabaseConsole(store) {
  document.getElementById("dbCountUsers").textContent = store.users.length;
  document.getElementById("dbCountStudents").textContent = store.students.length;
  document.getElementById("dbCountCourses").textContent = store.courses.length;
  document.getElementById("dbCountAttendance").textContent = store.attendance.length;
  document.getElementById("dbCountResults").textContent = store.results.length;
  document.getElementById("dbCountAssignments").textContent = store.assignments.length;
}

function downloadLiveMySQLDump() {
  const sql = window.academicStore.generateMySQLDump();
  const blob = new Blob([sql], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `csc114_portal_v2_database_dump_${new Date().toISOString().substring(0, 10)}.sql`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  AuthV2.showToast("Complete MySQL 8.0+ SQL dump script downloaded!", "success");
}

function exportJSONBackup() {
  const store = window.academicStore.get();
  const jsonStr = JSON.stringify(store, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `csc114_v2_backup_${new Date().toISOString().substring(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  AuthV2.showToast("JSON database backup file created!", "success");
}

function triggerImportJSONBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed.users || !parsed.students) {
        throw new Error("Invalid schema structure in backup JSON.");
      }
      window.academicStore.save(parsed);
      AuthV2.showToast("Database restored successfully from backup!", "success");
      setTimeout(() => location.reload(), 800);
    } catch (err) {
      AuthV2.showToast("Failed to restore JSON database: " + err.message, "error");
    }
  };
  reader.readAsText(file);
}

function triggerFactoryReset() {
  if (confirm("WARNING: This will reset all students, grades, attendance, and courses to default factory state! Proceed?")) {
    window.academicStore.reset();
    AuthV2.showToast("Database reset to initial factory seed.", "warning");
    setTimeout(() => location.reload(), 600);
  }
}

// 8. Audit Logs
function renderAdminAuditLogs(store) {
  const container = document.getElementById("adminAuditLogsList");
  if (!container) return;

  const logs = store.auditLogs || [];
  container.innerHTML = logs.map(l => `
    <div class="audit-item">
      <div>
        <div class="audit-actor">${l.actor}</div>
        <div class="audit-action">${l.action}</div>
      </div>
      <div class="audit-time">${l.timestamp}</div>
    </div>
  `).join('');
}
