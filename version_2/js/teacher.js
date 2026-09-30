/**
 * CSC 114 Teacher & Faculty Portal - Version 2.0 Client Application Logic
 * Dedicated to roll call attendance, gradebook publishing, assignment grading, and circulars
 */

document.addEventListener("DOMContentLoaded", () => {
  // Guard route
  const teacherUser = AuthV2.guardTeacher();
  if (!teacherUser) return;

  initTeacherPortal(teacherUser);
});

function initTeacherPortal(currentUser) {
  updateTeacherHeader(currentUser);
  renderAllTeacherTabs(currentUser);

  // Cross-tab / reactive update listener
  window.addEventListener(V2_EVENT_KEY, () => {
    const freshUser = AuthV2.getTeacher();
    if (freshUser) {
      updateTeacherHeader(freshUser);
      renderAllTeacherTabs(freshUser);
    }
  });

  // Mobile menu toggle
  const mobileToggle = document.getElementById("mobileToggleBtn");
  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      document.querySelector(".app-sidebar").classList.toggle("mobile-open");
    });
  }
}

function updateTeacherHeader(user) {
  document.querySelectorAll(".teacher-name-display").forEach(el => el.textContent = user.name);
  document.querySelectorAll(".teacher-title-display").forEach(el => el.textContent = user.title || "Faculty Member");
  document.querySelectorAll(".teacher-dept-display").forEach(el => el.textContent = user.department || "Computer Science");

  const avatarImgs = document.querySelectorAll(".teacher-avatar-img");
  avatarImgs.forEach(img => {
    img.src = user.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80";
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

function renderAllTeacherTabs(user) {
  const store = window.academicStore.get();
  renderTeacherOverview(store, user);
  setupAttendanceEngine(store, user);
  setupGradebookEngine(store, user);
  renderTeacherAssignments(store, user);
  renderTeacherCourses(store, user);
  renderTeacherRoutine(store, user);
  renderTeacherProfile(store, user);
}

// 1. Overview Tab
function renderTeacherOverview(store, user) {
  const myCourses = store.courses.filter(c => c.teacher.toLowerCase().includes(user.name.split(' ').pop().toLowerCase()) || (user.assignedCourses && user.assignedCourses.includes(c.code)));
  const totalStudents = store.students.length;

  let pendingGradingCount = 0;
  store.assignments.forEach(a => {
    (a.submissions || []).forEach(sub => {
      if (sub.status !== "Graded") pendingGradingCount++;
    });
  });

  const grid = document.getElementById("teacherOverviewGrid");
  if (grid) {
    grid.innerHTML = `
      <div class="metric-card">
        <div class="metric-data">
          <h4>Assigned Courses</h4>
          <div class="value" style="color: #34d399;">${myCourses.length}</div>
          <div class="note" style="color: #6ee7b7;">Active Teaching Portfolio</div>
        </div>
        <div class="metric-icon-wrap" style="background: rgba(16, 185, 129, 0.15); color: #34d399;">📚</div>
      </div>

      <div class="metric-card">
        <div class="metric-data">
          <h4>Enrolled Batch Size</h4>
          <div class="value">${totalStudents}</div>
          <div class="note" style="color: #a7f3d0;">56th Batch Undergrads</div>
        </div>
        <div class="metric-icon-wrap" style="background: rgba(13, 148, 136, 0.15); color: #2dd4bf;">👥</div>
      </div>

      <div class="metric-card">
        <div class="metric-data">
          <h4>Pending Submissions to Grade</h4>
          <div class="value" style="color: ${pendingGradingCount > 0 ? '#fbbf24' : '#34d399'};">${pendingGradingCount}</div>
          <div class="note" style="color: #fbbf24;">Student solutions waiting for review</div>
        </div>
        <div class="metric-icon-wrap" style="background: rgba(251, 191, 36, 0.15); color: #fbbf24;">📑</div>
      </div>

      <div class="metric-card">
        <div class="metric-data">
          <h4>Average Attendance</h4>
          <div class="value" style="color: #38bdf8;">86%</div>
          <div class="note" style="color: #38bdf8;">Across all lecture modules</div>
        </div>
        <div class="metric-icon-wrap" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">📊</div>
      </div>
    `;
  }
}

// 2. Roll Call Attendance Engine
let currentRollCallMap = {}; // { studentId: "present" | "late" | "absent" }

function setupAttendanceEngine(store, user) {
  const courseSelect = document.getElementById("attCourseSelect");
  const sectionSelect = document.getElementById("attSectionSelect");
  const dateInput = document.getElementById("attDateInput");

  if (!courseSelect || !dateInput) return;

  // Set today's date if empty
  if (!dateInput.value) {
    dateInput.value = new Date().toISOString().substring(0, 10);
  }

  // Populate course dropdown
  courseSelect.innerHTML = store.courses.map(c => 
    `<option value="${c.code}">${c.code} - ${c.name}</option>`
  ).join('');

  loadAttendanceTable();
}

function loadAttendanceTable() {
  const store = window.academicStore.get();
  const courseCode = document.getElementById("attCourseSelect").value;
  const section = document.getElementById("attSectionSelect").value;
  const date = document.getElementById("attDateInput").value;

  const students = store.students.filter(s => section === "all" || s.section === section);
  
  // Look for existing session for this date & course & section
  const existingSession = store.attendance.find(a => 
    a.course === courseCode && 
    a.date === date && 
    (section === "all" || a.section === section)
  );

  currentRollCallMap = {};
  students.forEach(s => {
    if (existingSession && existingSession.records && existingSession.records[s.id]) {
      currentRollCallMap[s.id] = existingSession.records[s.id];
    } else {
      currentRollCallMap[s.id] = "present"; // Default to present
    }
  });

  renderRollCallRows(students);
  updateRollCallCounters();
}

function renderRollCallRows(students) {
  const tbody = document.getElementById("rollCallTableBody");
  if (!tbody) return;

  tbody.innerHTML = students.map(s => {
    const status = currentRollCallMap[s.id] || "present";
    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${s.avatar}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;" alt="">
            <div>
              <strong style="color: var(--color-white);">${s.name}</strong>
              <div style="font-size: 11.5px; color: var(--color-slate-400); font-family: var(--font-mono);">${s.id} | Sec ${s.section}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="badge ${s.attendance >= 75 ? 'badge-success' : 'badge-danger'}">
            ${s.attendance}% Total
          </span>
        </td>
        <td style="text-align: right;">
          <div class="att-toggle-group">
            <button 
              type="button" 
              class="att-toggle-btn ${status === 'present' ? 'active-present' : ''}" 
              onclick="setStudentAttStatus('${s.id}', 'present', this)"
            >
              ✓ Present
            </button>
            <button 
              type="button" 
              class="att-toggle-btn ${status === 'late' ? 'active-late' : ''}" 
              onclick="setStudentAttStatus('${s.id}', 'late', this)"
            >
              ⏰ Late
            </button>
            <button 
              type="button" 
              class="att-toggle-btn ${status === 'absent' ? 'active-absent' : ''}" 
              onclick="setStudentAttStatus('${s.id}', 'absent', this)"
            >
              ✕ Absent
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function setStudentAttStatus(studentId, status, btn) {
  currentRollCallMap[studentId] = status;
  const parent = btn.parentElement;
  parent.querySelectorAll(".att-toggle-btn").forEach(b => {
    b.classList.remove("active-present", "active-late", "active-absent");
  });
  btn.classList.add(`active-${status}`);
  updateRollCallCounters();
}

function markAllAttendance(status) {
  Object.keys(currentRollCallMap).forEach(sid => {
    currentRollCallMap[sid] = status;
  });
  const store = window.academicStore.get();
  const section = document.getElementById("attSectionSelect").value;
  const students = store.students.filter(s => section === "all" || s.section === section);
  renderRollCallRows(students);
  updateRollCallCounters();
}

function updateRollCallCounters() {
  let present = 0, late = 0, absent = 0;
  Object.values(currentRollCallMap).forEach(v => {
    if (v === "present") present++;
    else if (v === "late") late++;
    else if (v === "absent") absent++;
  });

  const total = present + late + absent;
  const rate = total > 0 ? Math.round(((present + (late * 0.5)) / total) * 100) : 0;

  document.getElementById("attCounterPresent").textContent = present;
  document.getElementById("attCounterLate").textContent = late;
  document.getElementById("attCounterAbsent").textContent = absent;
  document.getElementById("attCounterRate").textContent = `${rate}%`;
}

function saveRollCallAttendance() {
  const store = window.academicStore.get();
  const teacher = AuthV2.getTeacher();
  const courseCode = document.getElementById("attCourseSelect").value;
  const section = document.getElementById("attSectionSelect").value;
  const date = document.getElementById("attDateInput").value;

  if (!courseCode || !date) {
    AuthV2.showToast("Please specify both course and date.", "warning");
    return;
  }

  // Find or create session
  let sessionIndex = store.attendance.findIndex(a => 
    a.course === courseCode && 
    a.date === date && 
    (section === "all" || a.section === section)
  );

  if (sessionIndex === -1) {
    const newSession = {
      id: "ATT-" + Date.now(),
      date: date,
      course: courseCode,
      section: section === "all" ? "A" : section,
      takenBy: teacher.name,
      records: { ...currentRollCallMap }
    };
    store.attendance.push(newSession);
  } else {
    store.attendance[sessionIndex].records = {
      ...(store.attendance[sessionIndex].records || {}),
      ...currentRollCallMap
    };
    store.attendance[sessionIndex].takenBy = teacher.name;
  }

  window.academicStore.save(store);

  // Recalculate attendance for all affected students
  Object.keys(currentRollCallMap).forEach(sid => {
    window.academicStore.recalculateStudentAttendance(sid);
  });

  window.academicStore.logActivity(`${teacher.name} (Faculty)`, `Submitted attendance roll call for ${courseCode} (${date}).`, 'attendance');

  AuthV2.showToast("Attendance saved and student statistics updated!", "success");
  loadAttendanceTable();
}

// 3. Gradebook & Results Entry
function setupGradebookEngine(store, user) {
  const courseSelect = document.getElementById("gbCourseSelect");
  if (!courseSelect) return;

  courseSelect.innerHTML = store.courses.map(c => 
    `<option value="${c.code}">${c.code} - ${c.name}</option>`
  ).join('');

  loadGradebookTable();
}

function loadGradebookTable() {
  const store = window.academicStore.get();
  const courseCode = document.getElementById("gbCourseSelect").value;
  const section = document.getElementById("gbSectionSelect").value;

  const students = store.students.filter(s => section === "all" || s.section === section);
  const tbody = document.getElementById("gradebookTableBody");
  if (!tbody) return;

  tbody.innerHTML = students.map(s => {
    // Find existing result
    const existingResult = store.results.find(r => r.studentId === s.id && r.course === courseCode);
    const mid = existingResult ? existingResult.mid : 25;
    const final = existingResult ? existingResult.final : 42;
    const quiz = existingResult ? existingResult.quiz : 16;
    const calc = window.academicStore.calculateGrade(mid, final, quiz);

    return `
      <tr data-student-id="${s.id}">
        <td>
          <div style="font-weight: 700; color: #ffffff;">${s.name}</div>
          <div style="font-size: 11.5px; color: var(--color-slate-400); font-family: var(--font-mono);">${s.id} | Sec ${s.section}</div>
        </td>
        <td style="text-align: center;">
          <input 
            type="number" 
            class="grade-input-box gb-mid" 
            min="0" 
            max="30" 
            step="0.5" 
            value="${mid}" 
            oninput="handleGradebookCellInput(this)"
          >
        </td>
        <td style="text-align: center;">
          <input 
            type="number" 
            class="grade-input-box gb-final" 
            min="0" 
            max="50" 
            step="0.5" 
            value="${final}" 
            oninput="handleGradebookCellInput(this)"
          >
        </td>
        <td style="text-align: center;">
          <input 
            type="number" 
            class="grade-input-box gb-quiz" 
            min="0" 
            max="20" 
            step="0.5" 
            value="${quiz}" 
            oninput="handleGradebookCellInput(this)"
          >
        </td>
        <td style="text-align: center;">
          <strong class="gb-total" style="font-size: 15px; color: #ffffff;">${calc.total}</strong>
        </td>
        <td style="text-align: center;">
          <span class="badge grade-calc-badge gb-grade ${calc.grade === 'F' ? 'badge-danger' : 'badge-success'}">${calc.grade}</span>
        </td>
        <td style="text-align: center;">
          <strong class="gb-gpa" style="font-family: var(--font-mono); color: #34d399;">${calc.gpa.toFixed(2)}</strong>
        </td>
      </tr>
    `;
  }).join('');
}

function handleGradebookCellInput(inputEl) {
  const tr = inputEl.closest("tr");
  const mid = parseFloat(tr.querySelector(".gb-mid").value) || 0;
  const final = parseFloat(tr.querySelector(".gb-final").value) || 0;
  const quiz = parseFloat(tr.querySelector(".gb-quiz").value) || 0;

  const calc = window.academicStore.calculateGrade(mid, final, quiz);

  tr.querySelector(".gb-total").textContent = calc.total;
  const gradeBadge = tr.querySelector(".gb-grade");
  gradeBadge.textContent = calc.grade;
  gradeBadge.className = `badge grade-calc-badge gb-grade ${calc.grade === 'F' ? 'badge-danger' : 'badge-success'}`;
  tr.querySelector(".gb-gpa").textContent = calc.gpa.toFixed(2);
}

function saveAndPublishGrades() {
  const store = window.academicStore.get();
  const teacher = AuthV2.getTeacher();
  const courseCode = document.getElementById("gbCourseSelect").value;
  const rows = document.querySelectorAll("#gradebookTableBody tr");

  let updatedCount = 0;
  rows.forEach(tr => {
    const studentId = tr.getAttribute("data-student-id");
    const mid = parseFloat(tr.querySelector(".gb-mid").value) || 0;
    const final = parseFloat(tr.querySelector(".gb-final").value) || 0;
    const quiz = parseFloat(tr.querySelector(".gb-quiz").value) || 0;
    const calc = window.academicStore.calculateGrade(mid, final, quiz);

    const student = store.students.find(s => s.id === studentId);
    const existingIndex = store.results.findIndex(r => r.studentId === studentId && r.course === courseCode);

    const resultPayload = {
      id: existingIndex !== -1 ? store.results[existingIndex].id : "RES-" + Date.now() + "-" + studentId,
      studentId: studentId,
      studentName: student ? student.name : studentId,
      course: courseCode,
      mid: mid,
      final: final,
      quiz: quiz,
      total: calc.total,
      grade: calc.grade,
      gpa: calc.gpa,
      semester: "Fall 2026",
      remarks: "Graded by " + teacher.name
    };

    if (existingIndex !== -1) {
      store.results[existingIndex] = resultPayload;
    } else {
      store.results.push(resultPayload);
    }
    updatedCount++;
  });

  window.academicStore.save(store);
  window.academicStore.logActivity(`${teacher.name} (Faculty)`, `Published gradebook marks for ${courseCode} (${updatedCount} students).`, 'grade');

  AuthV2.showToast(`Published grades for ${updatedCount} students successfully!`, "success");
}

// 4. Assignments Management & Grading Console
function renderTeacherAssignments(store, user) {
  const container = document.getElementById("teacherAssignmentsList");
  if (!container) return;

  container.innerHTML = store.assignments.map(a => {
    const submissions = a.submissions || [];
    const gradedCount = submissions.filter(s => s.status === "Graded").length;

    return `
      <div class="glass-card" style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
          <div>
            <span class="course-code" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.3);">${a.course}</span>
            <h3 style="font-size: 18px; margin-top: 6px;">${a.title}</h3>
            <div style="font-size: 13px; color: var(--color-slate-400); margin-top: 4px;">
              ⏰ Deadline: <strong style="color: #fbbf24;">${a.deadline}</strong> &nbsp;|&nbsp; 🎯 Total Points: ${a.totalMarks} Marks
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span class="badge badge-info">${submissions.length} Total Submissions</span>
            <span class="badge ${gradedCount === submissions.length && submissions.length > 0 ? 'badge-success' : 'badge-warning'}">
              ${gradedCount}/${submissions.length} Graded
            </span>
          </div>
        </div>

        <p style="font-size: 13.5px; color: var(--color-slate-300); margin-bottom: 16px;">
          ${a.instructions || 'Standard assignment guidelines.'}
        </p>

        <!-- Submissions Roster -->
        <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 16px;">
          <h4 style="font-size: 13px; text-transform: uppercase; color: #a7f3d0; margin-bottom: 12px;">
            Student Submissions Review Drawer:
          </h4>

          ${submissions.length === 0 ? `
            <p style="font-size: 13px; color: var(--color-slate-400);">No student submissions recorded yet for this task.</p>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${submissions.map(sub => `
                <div class="submission-review-card">
                  <div class="submission-meta">
                    <div>
                      <strong style="color: #ffffff; font-size: 14px;">${sub.studentName}</strong>
                      <span style="font-size: 12px; color: var(--color-slate-400); font-family: var(--font-mono); margin-left: 6px;">(${sub.studentId})</span>
                      <div style="font-size: 11.5px; color: var(--color-slate-500); margin-top: 2px;">Submitted: ${sub.submittedAt}</div>
                    </div>
                    <span class="badge ${sub.status === 'Graded' ? 'badge-success' : 'badge-warning'}">${sub.status}</span>
                  </div>

                  <div style="margin-bottom: 10px;">
                    <a href="${sub.solutionLink || '#'}" target="_blank" class="submission-link-pill">
                      <span>🔗 Inspect Submission:</span> ${sub.solutionLink || sub.fileName}
                    </a>
                  </div>

                  ${sub.notes ? `<p style="font-size: 12.5px; color: var(--color-slate-300); margin-bottom: 12px;">Notes: "${sub.notes}"</p>` : ''}

                  <!-- Grading Form -->
                  <div style="display: flex; align-items: center; gap: 12px; background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: var(--radius-md); flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <label style="font-size: 12px; color: var(--color-slate-300);">Score (/${a.totalMarks}):</label>
                      <input 
                        type="number" 
                        class="form-control" 
                        style="width: 80px; padding: 6px 10px; font-size: 13px;" 
                        id="grade-marks-${a.id}-${sub.studentId}" 
                        value="${sub.marks !== null && sub.marks !== undefined ? sub.marks : ''}" 
                        min="0" 
                        max="${a.totalMarks}" 
                        step="0.5"
                      >
                    </div>

                    <div style="flex: 1; min-width: 200px;">
                      <input 
                        type="text" 
                        class="form-control" 
                        style="padding: 6px 10px; font-size: 13px;" 
                        id="grade-feedback-${a.id}-${sub.studentId}" 
                        placeholder="Faculty feedback / comments for student..." 
                        value="${sub.feedback || ''}"
                      >
                    </div>

                    <button 
                      class="btn btn-sm btn-teacher-primary" 
                      onclick="saveTeacherSubmissionGrade('${a.id}', '${sub.studentId}')"
                    >
                      ✓ Save Grade
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  }).join('');
}

function openCreateAssignmentModal() {
  const store = window.academicStore.get();
  const select = document.getElementById("newAsnCourse");
  if (select) {
    select.innerHTML = store.courses.map(c => `<option value="${c.code}">${c.code} - ${c.name}</option>`).join('');
  }
  document.getElementById("createAssignmentModal").classList.add("active");
}

function closeCreateAssignmentModal() {
  document.getElementById("createAssignmentModal").classList.remove("active");
}

function handleCreateNewAssignment(e) {
  e.preventDefault();
  const store = window.academicStore.get();
  const teacher = AuthV2.getTeacher();

  const title = document.getElementById("newAsnTitle").value.trim();
  const course = document.getElementById("newAsnCourse").value;
  const deadline = document.getElementById("newAsnDeadline").value;
  const marks = parseInt(document.getElementById("newAsnMarks").value) || 20;
  const instructions = document.getElementById("newAsnInstructions").value.trim();

  const newAsn = {
    id: "ASN-" + Date.now(),
    title,
    course,
    teacher: teacher.name,
    deadline,
    totalMarks: marks,
    status: "Active",
    instructions,
    submissions: []
  };

  store.assignments.unshift(newAsn);
  window.academicStore.save(store);
  window.academicStore.logActivity(`${teacher.name} (Faculty)`, `Created new assignment: ${title} (${course}).`, 'assignment');

  AuthV2.showToast("Assignment published successfully!", "success");
  closeCreateAssignmentModal();
  renderTeacherAssignments(store, teacher);
}

function saveTeacherSubmissionGrade(assignmentId, studentId) {
  const store = window.academicStore.get();
  const teacher = AuthV2.getTeacher();

  const marksInput = document.getElementById(`grade-marks-${assignmentId}-${studentId}`);
  const feedbackInput = document.getElementById(`grade-feedback-${assignmentId}-${studentId}`);

  if (!marksInput) return;
  const marks = parseFloat(marksInput.value);
  if (isNaN(marks)) {
    AuthV2.showToast("Please enter a valid numeric grade.", "warning");
    return;
  }
  const feedback = feedbackInput ? feedbackInput.value.trim() : "";

  const aIndex = store.assignments.findIndex(a => a.id === assignmentId);
  if (aIndex === -1) return;

  const subIndex = store.assignments[aIndex].submissions.findIndex(s => s.studentId === studentId);
  if (subIndex === -1) return;

  store.assignments[aIndex].submissions[subIndex].marks = marks;
  store.assignments[aIndex].submissions[subIndex].feedback = feedback;
  store.assignments[aIndex].submissions[subIndex].status = "Graded";

  window.academicStore.save(store);
  window.academicStore.logActivity(`${teacher.name} (Faculty)`, `Awarded grade (${marks}) to ${studentId} for ${store.assignments[aIndex].title}.`, 'grade');

  AuthV2.showToast("Student marks and feedback recorded!", "success");
  renderTeacherAssignments(store, teacher);
}

// 5. Courses & Syllabus
function renderTeacherCourses(store, user) {
  const container = document.getElementById("teacherCoursesGrid");
  if (!container) return;

  container.innerHTML = store.courses.map(c => `
    <div class="glass-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <span class="course-code" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.3);">${c.code}</span>
        <span class="badge badge-info">${c.credit} Credits</span>
      </div>
      <h3 style="font-size: 18px; margin-bottom: 6px;">${c.name}</h3>
      <p style="font-size: 13px; color: var(--color-slate-300); margin-bottom: 16px; line-height: 1.5;">${c.description}</p>
      
      <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 12px; font-size: 12px; color: var(--color-slate-400);">
        <span>📍 ${c.room}</span>
        <span>👥 ${store.students.length} Enrolled Students</span>
      </div>
    </div>
  `).join('');
}

// 6. Routine
function renderTeacherRoutine(store, user) {
  const container = document.getElementById("teacherRoutineTableBody");
  if (!container) return;

  container.innerHTML = store.routine.map(r => `
    <tr>
      <td><strong>${r.day}</strong></td>
      <td style="font-family: var(--font-mono); color: #34d399;">${r.time}</td>
      <td><strong>${r.course}</strong> - ${r.name}</td>
      <td>📍 ${r.room}</td>
      <td>${r.section || 'Section A'}</td>
      <td><span class="badge ${r.type === 'Lab' ? 'badge-info' : 'badge-neutral'}">${r.type}</span></td>
    </tr>
  `).join('');
}

// 7. Post Announcement
function handleTeacherPostNotice(e) {
  e.preventDefault();
  const store = window.academicStore.get();
  const teacher = AuthV2.getTeacher();

  const title = document.getElementById("teacherNoticeTitle").value.trim();
  const category = document.getElementById("teacherNoticeCategory").value;
  const message = document.getElementById("teacherNoticeMessage").value.trim();
  const isPinned = document.getElementById("teacherNoticePinned").checked;

  const newNotice = {
    id: "NTC-" + Date.now(),
    title,
    category,
    author: teacher.name,
    target: "Course Students",
    date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    isPinned,
    message
  };

  store.notices = [newNotice, ...(store.notices || [])];
  window.academicStore.save(store);
  window.academicStore.logActivity(`${teacher.name} (Faculty)`, `Published notice to students: ${title}.`, 'notice');

  AuthV2.showToast("Announcement published to student portal!", "success");
  e.target.reset();
}

// 8. Profile
function renderTeacherProfile(store, user) {
  document.getElementById("profileTeacherName").value = user.name || "";
  document.getElementById("profileTeacherEmail").value = user.email || "";
  document.getElementById("profileTeacherTitle").value = user.title || "";
  document.getElementById("profileTeacherDept").value = user.department || "CSE";
  document.getElementById("profileTeacherPhone").value = user.phone || "";
  document.getElementById("profileTeacherRoom").value = user.room || "Faculty Office 402";
}

function handleSaveTeacherProfile(e) {
  e.preventDefault();
  const store = window.academicStore.get();
  const sessionUser = AuthV2.getTeacher();

  const uIndex = store.users.findIndex(u => u.id === sessionUser.id || u.username === sessionUser.username);
  if (uIndex !== -1) {
    store.users[uIndex].phone = document.getElementById("profileTeacherPhone").value.trim();
    store.users[uIndex].room = document.getElementById("profileTeacherRoom").value.trim();
    window.academicStore.save(store);
  }

  sessionUser.phone = document.getElementById("profileTeacherPhone").value.trim();
  sessionUser.room = document.getElementById("profileTeacherRoom").value.trim();
  localStorage.setItem(SESSION_TEACHER, JSON.stringify(sessionUser));

  AuthV2.showToast("Faculty profile updated successfully!", "success");
}
