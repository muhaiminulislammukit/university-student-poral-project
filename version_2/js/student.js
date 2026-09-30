/**
 * CSC 114 Student Portal - Version 2.0 Client Application Logic
 * Dedicated to student interactions, transcript generation, assignment submissions
 */

document.addEventListener("DOMContentLoaded", () => {
  // Guard route
  const studentUser = AuthV2.guardStudent();
  if (!studentUser) return;

  initStudentPortal(studentUser);
});

function initStudentPortal(currentUser) {
  // Populate UI with current student data
  updateStudentHeader(currentUser);
  renderAllStudentTabs(currentUser);

  // Cross-tab / reactive update listener
  window.addEventListener(V2_EVENT_KEY, () => {
    const freshUser = AuthV2.getStudent();
    if (freshUser) {
      updateStudentHeader(freshUser);
      renderAllStudentTabs(freshUser);
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

function updateStudentHeader(user) {
  const store = window.academicStore.get();
  const student = store.students.find(s => s.id === user.studentId || s.email === user.email) || user;

  document.querySelectorAll(".student-name-display").forEach(el => el.textContent = student.name);
  document.querySelectorAll(".student-id-display").forEach(el => el.textContent = student.id || user.studentId);
  document.querySelectorAll(".student-cgpa-display").forEach(el => el.textContent = (student.cgpa || 3.80).toFixed(2));
  document.querySelectorAll(".student-att-display").forEach(el => el.textContent = (student.attendance || 90) + "%");
  document.querySelectorAll(".student-section-display").forEach(el => el.textContent = `Section ${student.section || 'A'}`);

  const avatarImgs = document.querySelectorAll(".student-avatar-img");
  avatarImgs.forEach(img => {
    img.src = student.avatar || user.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80";
  });
}

function switchTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".nav-link").forEach(el => el.classList.remove("active"));

  const targetTab = document.getElementById(`tab-${tabId}`);
  const targetLink = document.getElementById(`nav-${tabId}`);

  if (targetTab) targetTab.classList.add("active");
  if (targetLink) targetLink.classList.add("active");

  // Close mobile sidebar if open
  document.querySelector(".app-sidebar").classList.remove("mobile-open");
}

function renderAllStudentTabs(user) {
  const store = window.academicStore.get();
  const studentId = user.studentId || "CSC114-001";
  const student = store.students.find(s => s.id === studentId) || user;

  renderStudentOverview(store, student);
  renderStudentCourses(store, student);
  renderStudentAttendance(store, student);
  renderStudentTranscript(store, student);
  renderStudentAssignments(store, student);
  renderStudentRoutine(store, student);
  renderStudentNotices(store);
  renderStudentProfile(store, student);
}

// 1. Overview Tab
function renderStudentOverview(store, student) {
  // Stat calculations
  const myResults = store.results.filter(r => r.studentId === student.id);
  const myAssignments = store.assignments.filter(a => a.status === "Active");
  
  let pendingSubmissions = 0;
  myAssignments.forEach(a => {
    const sub = (a.submissions || []).find(s => s.studentId === student.id);
    if (!sub) pendingSubmissions++;
  });

  const totalCredits = store.courses.reduce((acc, c) => acc + (c.credit || 3), 0);

  const container = document.getElementById("overviewStatGrid");
  if (container) {
    container.innerHTML = `
      <div class="metric-card">
        <div class="metric-data">
          <h4>Cumulative CGPA</h4>
          <div class="value" style="color: #38bdf8;">${(student.cgpa || 3.80).toFixed(2)}</div>
          <div class="note" style="color: #34d399;">★ Top 5% in 56th Batch</div>
        </div>
        <div class="metric-icon-wrap" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">🎓</div>
      </div>

      <div class="metric-card">
        <div class="metric-data">
          <h4>Overall Attendance</h4>
          <div class="value" style="color: ${student.attendance >= 75 ? '#34d399' : '#f87171'};">${student.attendance}%</div>
          <div class="note" style="color: ${student.attendance >= 75 ? '#34d399' : '#f87171'};">
            ${student.attendance >= 75 ? '✓ Compliant with 75% Rule' : '⚠ Below Required 75%'}
          </div>
        </div>
        <div class="metric-icon-wrap" style="background: rgba(52, 211, 153, 0.15); color: #34d399;">📅</div>
      </div>

      <div class="metric-card">
        <div class="metric-data">
          <h4>Registered Courses</h4>
          <div class="value">${store.courses.length}</div>
          <div class="note" style="color: #a5b4fc;">Total Credits: ${totalCredits} Credit Hours</div>
        </div>
        <div class="metric-icon-wrap" style="background: rgba(99, 102, 241, 0.15); color: #818cf8;">📚</div>
      </div>

      <div class="metric-card">
        <div class="metric-data">
          <h4>Pending Assignments</h4>
          <div class="value" style="color: ${pendingSubmissions > 0 ? '#fbbf24' : '#34d399'};">${pendingSubmissions}</div>
          <div class="note" style="color: #fbbf24;">Action required before deadlines</div>
        </div>
        <div class="metric-icon-wrap" style="background: rgba(251, 191, 36, 0.15); color: #fbbf24;">📝</div>
      </div>
    `;
  }

  // Today's Routine ticker
  const todayClassesContainer = document.getElementById("todayRoutinePreview");
  if (todayClassesContainer) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayRoutine = store.routine.filter(r => r.day.toLowerCase() === today.toLowerCase() || r.day === "Sunday"); // Demo fallback
    
    if (todayRoutine.length === 0) {
      todayClassesContainer.innerHTML = `<p style="color: var(--color-slate-400); font-size: 13px;">No scheduled classes for today.</p>`;
    } else {
      todayClassesContainer.innerHTML = todayRoutine.map(r => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(15, 23, 42, 0.6); border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.06); margin-bottom: 8px;">
          <div>
            <span class="course-code" style="font-size: 11px;">${r.course}</span>
            <strong style="margin-left: 8px; font-size: 14px;">${r.name}</strong>
            <div style="font-size: 12px; color: var(--color-slate-400); margin-top: 2px;">
              👨‍🏫 ${r.teacher} &nbsp;|&nbsp; 📍 ${r.room}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-family: var(--font-mono); font-size: 12px; color: #38bdf8; font-weight: bold;">${r.time}</div>
            <span class="badge ${r.type === 'Lab' ? 'badge-info' : 'badge-neutral'}" style="margin-top: 4px;">${r.type}</span>
          </div>
        </div>
      `).join('');
    }
  }
}

// 2. Enrolled Courses
function renderStudentCourses(store, student) {
  const container = document.getElementById("studentCoursesGrid");
  if (!container) return;

  container.innerHTML = store.courses.map(c => `
    <div class="course-card">
      <div>
        <div class="course-header">
          <span class="course-code">${c.code}</span>
          <span class="badge badge-info">${c.credit} Credits</span>
        </div>
        <h3 class="course-name">${c.name}</h3>
        <div class="course-instructor">
          <span>👨‍🏫 ${c.teacher}</span>
        </div>
        <p style="font-size: 13px; color: var(--color-slate-300); margin-bottom: 16px; line-height: 1.5;">
          ${c.description}
        </p>
      </div>

      <div class="course-meta-row">
        <span>📍 ${c.room}</span>
        <span>•</span>
        <span>🏷️ ${c.category || 'Core'}</span>
        <span>•</span>
        <span>📅 ${c.semester}</span>
      </div>
    </div>
  `).join('');
}

// 3. Attendance Tracker
function renderStudentAttendance(store, student) {
  const container = document.getElementById("studentAttendanceList");
  if (!container) return;

  // Compute course-level attendance from store.attendance
  const courseAttMap = {};
  store.courses.forEach(c => {
    courseAttMap[c.code] = { name: c.name, sessions: 0, present: 0, late: 0, absent: 0 };
  });

  (store.attendance || []).forEach(att => {
    if (courseAttMap[att.course] && att.records && att.records[student.id]) {
      const status = att.records[student.id];
      courseAttMap[att.course].sessions++;
      if (status === "present") courseAttMap[att.course].present++;
      else if (status === "late") courseAttMap[att.course].late++;
      else if (status === "absent") courseAttMap[att.course].absent++;
    }
  });

  let html = `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">`;

  Object.keys(courseAttMap).forEach(code => {
    const item = courseAttMap[code];
    const sessions = item.sessions || 1; // default preview
    const present = item.present || (sessions > 0 ? 1 : 0);
    const late = item.late || 0;
    const absent = item.absent || 0;
    const score = ((present + (late * 0.5)) / sessions) * 100;
    const pct = Math.min(100, Math.round(score));

    const statusClass = pct >= 75 ? 'attendance-safe' : 'attendance-danger';
    const badgeStatus = pct >= 75 ? 'badge-success' : 'badge-danger';
    const badgeText = pct >= 75 ? 'Eligible for Final' : 'Disbarment Risk (< 75%)';

    html += `
      <div class="glass-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div>
            <span class="course-code">${code}</span>
            <h4 style="margin-top: 6px; font-size: 16px;">${item.name}</h4>
          </div>
          <span class="badge ${badgeStatus}">${badgeText}</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 16px;">
          <span style="font-size: 12px; color: var(--color-slate-400);">Attendance Ratio</span>
          <span style="font-family: var(--font-display); font-size: 24px; font-weight: 800; color: ${pct >= 75 ? '#34d399' : '#f87171'};">${pct}%</span>
        </div>

        <div class="attendance-bar-wrap">
          <div class="attendance-bar-fill ${statusClass}" style="width: ${pct}%;"></div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 14px; font-size: 12px; color: var(--color-slate-400); border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 12px;">
          <span>Present: <strong style="color: #34d399;">${present}</strong></span>
          <span>Late: <strong style="color: #fbbf24;">${late}</strong></span>
          <span>Absent: <strong style="color: #f87171;">${absent}</strong></span>
          <span>Total: <strong>${sessions}</strong></span>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

// 4. Grades & Official Academic Transcript
function renderStudentTranscript(store, student) {
  const container = document.getElementById("transcriptContentWrap");
  if (!container) return;

  const myResults = store.results.filter(r => r.studentId === student.id);
  let totalGradePoints = 0;
  let totalCredits = 0;

  let tableRows = "";
  if (myResults.length === 0) {
    tableRows = `<tr><td colspan="8" style="text-align:center; padding: 24px;">No published examination results found.</td></tr>`;
  } else {
    myResults.forEach(r => {
      const courseObj = store.courses.find(c => c.code === r.course);
      const credit = courseObj ? courseObj.credit : 3;
      totalCredits += credit;
      totalGradePoints += (r.gpa * credit);

      tableRows += `
        <tr>
          <td><strong>${r.course}</strong></td>
          <td>${courseObj ? courseObj.name : r.course}</td>
          <td style="text-align: center;">${credit}</td>
          <td style="text-align: center;">${r.mid}</td>
          <td style="text-align: center;">${r.final}</td>
          <td style="text-align: center;">${r.quiz}</td>
          <td style="text-align: center;"><strong>${r.total}</strong></td>
          <td style="text-align: center; font-weight: bold; color: ${r.grade === 'F' ? '#ef4444' : '#10b981'};">${r.grade}</td>
          <td style="text-align: right; font-weight: bold;">${r.gpa.toFixed(2)}</td>
        </tr>
      `;
    });
  }

  const calculatedGPA = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : (student.cgpa || 3.82).toFixed(2);

  container.innerHTML = `
    <div class="transcript-container" id="printableTranscriptArea">
      <div class="transcript-header">
        <div style="font-size: 32px; margin-bottom: 4px;">🎓</div>
        <h2>DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</h2>
        <p>OFFICIAL UNDERGRADUATE ACADEMIC GRADE TRANSCRIPT</p>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">SEMESTER: FALL 2026 &nbsp;|&nbsp; BATCH: 56TH BATCH</div>
      </div>

      <div class="transcript-student-meta">
        <div><strong>Student Name:</strong> ${student.name}</div>
        <div><strong>Student ID:</strong> ${student.id}</div>
        <div><strong>Academic Section:</strong> Section ${student.section || 'A'}</div>
        <div><strong>Degree:</strong> B.Sc. in Computer Science</div>
        <div><strong>Department:</strong> CSE</div>
        <div><strong>Issue Date:</strong> ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
      </div>

      <table class="transcript-table">
        <thead>
          <tr>
            <th>Course Code</th>
            <th>Course Title</th>
            <th style="text-align: center;">Credit</th>
            <th style="text-align: center;">Mid (30)</th>
            <th style="text-align: center;">Final (50)</th>
            <th style="text-align: center;">Quiz (20)</th>
            <th style="text-align: center;">Total (100)</th>
            <th style="text-align: center;">Grade</th>
            <th style="text-align: right;">Point (GPA)</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="transcript-summary-box">
        <div>Total Enrolled Credits: <strong>${totalCredits}</strong></div>
        <div>Total Grade Points: <strong>${totalGradePoints.toFixed(2)}</strong></div>
        <div>Semester Grade Point Average (SGPA): <strong style="color: #0284c7; font-size: 18px;">${calculatedGPA}</strong></div>
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 60px; font-size: 12px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 20px;">
        <div style="text-align: center;">
          <div style="height: 35px;"></div>
          <div style="border-top: 1px solid #94a3b8; width: 160px; padding-top: 4px;">Student Signature</div>
        </div>
        <div style="text-align: center;">
          <div style="height: 35px; color: #0284c7; font-weight: bold; font-family: cursive;">Prof. Dr. M. Rahman</div>
          <div style="border-top: 1px solid #94a3b8; width: 180px; padding-top: 4px;">Controller of Examinations</div>
        </div>
      </div>
    </div>
  `;
}

function printStudentTranscript() {
  window.print();
}

// 5. Assignments & Submissions
function renderStudentAssignments(store, student) {
  const container = document.getElementById("studentAssignmentsList");
  if (!container) return;

  container.innerHTML = store.assignments.map(a => {
    const mySub = (a.submissions || []).find(s => s.studentId === student.id);
    let statusBadge = `<span class="badge badge-warning">Pending Submission</span>`;
    let actionBtn = `<button class="btn btn-sm btn-student-primary" onclick="openSubmitModal('${a.id}')">Submit Solution ➔</button>`;

    if (mySub) {
      if (mySub.status === "Graded") {
        statusBadge = `<span class="badge badge-success">Graded (${mySub.marks} / ${a.totalMarks})</span>`;
        actionBtn = `<button class="btn btn-sm btn-ghost" onclick="openSubmitModal('${a.id}')">Update Submission</button>`;
      } else {
        statusBadge = `<span class="badge badge-info">Submitted (${mySub.submittedAt})</span>`;
        actionBtn = `<button class="btn btn-sm btn-ghost" onclick="openSubmitModal('${a.id}')">Update Submission</button>`;
      }
    }

    return `
      <div class="glass-card" style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div>
            <span class="course-code">${a.course}</span>
            <h3 style="margin-top: 6px; font-size: 17px;">${a.title}</h3>
            <div style="font-size: 12.5px; color: var(--color-slate-400); margin-top: 2px;">
              👨‍🏫 Instructor: ${a.teacher || 'Course Faculty'} &nbsp;|&nbsp; 🎯 Total Points: ${a.totalMarks} Marks
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            ${statusBadge}
          </div>
        </div>

        <p style="font-size: 13.5px; color: var(--color-slate-300); margin-bottom: 16px; line-height: 1.5;">
          ${a.instructions || a.description || 'Complete the assignment as outlined in lectures.'}
        </p>

        ${mySub ? `
          <div style="background: rgba(15, 23, 42, 0.7); border-radius: var(--radius-md); padding: 14px 18px; border: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 16px;">
            <div style="font-size: 12px; color: #a5b4fc; font-weight: bold; margin-bottom: 6px;">YOUR SUBMITTED WORK:</div>
            <div style="font-size: 13px;">🔗 Link/File: <a href="${mySub.solutionLink || '#'}" target="_blank" style="color: #38bdf8; text-decoration: underline;">${mySub.solutionLink || mySub.fileName}</a></div>
            ${mySub.notes ? `<div style="font-size: 12.5px; color: var(--color-slate-400); margin-top: 4px;">Notes: ${mySub.notes}</div>` : ''}
            ${mySub.feedback ? `
              <div style="margin-top: 10px; padding: 10px; background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; border-radius: 4px;">
                <strong style="color: #34d399; font-size: 12px;">Teacher Feedback:</strong>
                <p style="font-size: 12.5px; color: #e2e8f0; margin-top: 2px;">"${mySub.feedback}"</p>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 12px; font-size: 12.5px; color: var(--color-slate-400);">
          <div>⏰ Deadline: <strong style="color: #fbbf24;">${a.deadline}</strong></div>
          <div>${actionBtn}</div>
        </div>
      </div>
    `;
  }).join('');
}

let activeSubmissionAssignmentId = null;

function openSubmitModal(assignmentId) {
  activeSubmissionAssignmentId = assignmentId;
  const store = window.academicStore.get();
  const student = AuthV2.getStudent();
  const assignment = store.assignments.find(a => a.id === assignmentId);
  if (!assignment) return;

  document.getElementById("submitModalTitle").textContent = `Submit: ${assignment.title}`;
  document.getElementById("submitModalCourse").textContent = `${assignment.course} | Due: ${assignment.deadline}`;

  const mySub = (assignment.submissions || []).find(s => s.studentId === (student.studentId || student.id));
  if (mySub) {
    document.getElementById("submitSolutionLink").value = mySub.solutionLink || mySub.fileName || "";
    document.getElementById("submitNotes").value = mySub.notes || mySub.comments || "";
  } else {
    document.getElementById("submitSolutionLink").value = "";
    document.getElementById("submitNotes").value = "";
  }

  document.getElementById("submissionModal").classList.add("active");
}

function closeSubmitModal() {
  document.getElementById("submissionModal").classList.remove("active");
  activeSubmissionAssignmentId = null;
}

function handleSaveSubmission(e) {
  e.preventDefault();
  if (!activeSubmissionAssignmentId) return;

  const store = window.academicStore.get();
  const student = AuthV2.getStudent();
  const studentId = student.studentId || student.id;

  const solutionLink = document.getElementById("submitSolutionLink").value.trim();
  const notes = document.getElementById("submitNotes").value.trim();

  const aIndex = store.assignments.findIndex(a => a.id === activeSubmissionAssignmentId);
  if (aIndex === -1) return;

  const assignment = store.assignments[aIndex];
  assignment.submissions = assignment.submissions || [];

  const existingSubIndex = assignment.submissions.findIndex(s => s.studentId === studentId);
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const newSubData = {
    studentId: studentId,
    studentName: student.name,
    submittedAt: nowStr,
    solutionLink: solutionLink,
    fileName: solutionLink.split('/').pop() || "project_solution.zip",
    notes: notes,
    status: existingSubIndex !== -1 ? assignment.submissions[existingSubIndex].status : "Submitted",
    marks: existingSubIndex !== -1 ? assignment.submissions[existingSubIndex].marks : null,
    feedback: existingSubIndex !== -1 ? assignment.submissions[existingSubIndex].feedback : null
  };

  if (existingSubIndex !== -1) {
    assignment.submissions[existingSubIndex] = newSubData;
  } else {
    assignment.submissions.push(newSubData);
  }

  window.academicStore.save(store);
  window.academicStore.logActivity(`${student.name} (Student)`, `Submitted assignment: ${assignment.title}`, 'assignment');

  AuthV2.showToast("Assignment submitted successfully!", "success");
  closeSubmitModal();
  renderStudentAssignments(store, student);
}

// 6. Routine
function renderStudentRoutine(store, student, filterDay = "all") {
  const container = document.getElementById("studentRoutineTableBody");
  if (!container) return;

  let filtered = store.routine;
  if (filterDay !== "all") {
    filtered = filtered.filter(r => r.day.toLowerCase() === filterDay.toLowerCase());
  }

  if (filtered.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px;">No class slots scheduled for ${filterDay}.</td></tr>`;
    return;
  }

  container.innerHTML = filtered.map(r => `
    <tr>
      <td><strong>${r.day}</strong></td>
      <td style="font-family: var(--font-mono); color: #38bdf8;">${r.time}</td>
      <td><span class="course-code">${r.course}</span> &nbsp;<strong>${r.name}</strong></td>
      <td>👨‍🏫 ${r.teacher}</td>
      <td>📍 ${r.room}</td>
      <td><span class="badge ${r.type === 'Lab' ? 'badge-info' : 'badge-neutral'}">${r.type}</span></td>
    </tr>
  `).join('');
}

function filterRoutineByDay(day, btn) {
  document.querySelectorAll(".routine-filter-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const store = window.academicStore.get();
  const student = AuthV2.getStudent();
  renderStudentRoutine(store, student, day);
}

// 7. Notices
function renderStudentNotices(store) {
  const container = document.getElementById("studentNoticesList");
  if (!container) return;

  const notices = store.notices || [];
  container.innerHTML = notices.map(n => `
    <div class="notice-card">
      <div class="notice-icon-box" style="background: ${n.category === 'Exam' ? 'rgba(239, 68, 68, 0.15)' : n.category === 'Urgent' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.15)'}; color: ${n.category === 'Exam' ? '#f87171' : n.category === 'Urgent' ? '#fbbf24' : '#818cf8'};">
        ${n.category === 'Exam' ? '📝' : n.category === 'Urgent' ? '🚨' : n.category === 'Event' ? '🏆' : '📢'}
      </div>
      <div class="notice-body" style="flex: 1;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <h4 style="font-size: 15px;">${n.title}</h4>
          ${n.isPinned ? `<span class="badge badge-warning">📌 Pinned</span>` : ''}
        </div>
        <p>${n.message}</p>
        <div class="notice-footer">
          <span>📅 Date: ${n.date}</span>
          <span>•</span>
          <span>✍️ Author: ${n.author}</span>
          <span>•</span>
          <span>🏷️ Category: <span class="badge badge-neutral" style="font-size: 10.5px;">${n.category}</span></span>
        </div>
      </div>
    </div>
  `).join('');
}

// 8. Student Profile & Settings
function renderStudentProfile(store, student) {
  document.getElementById("profileStudentName").value = student.name || "";
  document.getElementById("profileStudentId").value = student.id || student.studentId || "";
  document.getElementById("profileStudentEmail").value = student.email || "";
  document.getElementById("profileStudentPhone").value = student.phone || "";
  document.getElementById("profileStudentSection").value = student.section || "A";
  document.getElementById("profileStudentBatch").value = student.batch || "56th Batch";
  document.getElementById("profileStudentBlood").value = student.bloodGroup || "A+";
  document.getElementById("profileStudentAddress").value = student.address || "";
  document.getElementById("profileGuardianName").value = student.guardianName || "";
  document.getElementById("profileGuardianPhone").value = student.guardianPhone || "";
}

function handleSaveStudentProfile(e) {
  e.preventDefault();
  const store = window.academicStore.get();
  const sessionUser = AuthV2.getStudent();
  const studentId = sessionUser.studentId || sessionUser.id;

  const sIndex = store.students.findIndex(s => s.id === studentId);
  if (sIndex === -1) return;

  store.students[sIndex].phone = document.getElementById("profileStudentPhone").value.trim();
  store.students[sIndex].address = document.getElementById("profileStudentAddress").value.trim();
  store.students[sIndex].guardianName = document.getElementById("profileGuardianName").value.trim();
  store.students[sIndex].guardianPhone = document.getElementById("profileGuardianPhone").value.trim();
  store.students[sIndex].bloodGroup = document.getElementById("profileStudentBlood").value.trim();

  // Save to store
  window.academicStore.save(store);
  window.academicStore.logActivity(`${store.students[sIndex].name} (Student)`, `Updated student profile contact information.`, 'profile');

  // Update session
  sessionUser.phone = store.students[sIndex].phone;
  sessionUser.address = store.students[sIndex].address;
  localStorage.setItem(SESSION_STUDENT, JSON.stringify(sessionUser));

  AuthV2.showToast("Profile information updated successfully!", "success");
}
