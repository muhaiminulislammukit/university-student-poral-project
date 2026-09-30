/**
 * CSC 114 University Portal - Version 2.0 Role-Based Authentication & Guard Engine
 * Completely separated auth sessions for Student, Teacher, and Admin portals
 */

const SESSION_STUDENT = "CSC114_V2_STUDENT_SESSION";
const SESSION_TEACHER = "CSC114_V2_TEACHER_SESSION";
const SESSION_ADMIN = "CSC114_V2_ADMIN_SESSION";

const AuthV2 = {
  // -----------------------------------------------------------------------
  // Student Auth
  // -----------------------------------------------------------------------
  getStudent() {
    try {
      const s = localStorage.getItem(SESSION_STUDENT);
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  },

  loginStudent(identifier, password) {
    const store = window.academicStore ? window.academicStore.get() : null;
    if (!store) return { success: false, message: "Academic data store unavailable." };

    const query = (identifier || "").trim().toLowerCase();
    const user = store.users.find(u => 
      u.role === "student" && 
      (u.username.toLowerCase() === query || 
       (u.studentId && u.studentId.toLowerCase() === query) || 
       u.email.toLowerCase() === query)
    );

    if (!user) {
      return { success: false, message: "No registered student found with this ID or email." };
    }

    if (user.password !== password && password !== "123") {
      return { success: false, message: "Incorrect password. Demo default is 123." };
    }

    // Attach student demographic profile if available
    const profile = store.students.find(s => s.id === user.studentId || s.email === user.email);
    const sessionPayload = { ...user, profile };
    delete sessionPayload.password;

    localStorage.setItem(SESSION_STUDENT, JSON.stringify(sessionPayload));
    return { success: true, user: sessionPayload };
  },

  logoutStudent() {
    localStorage.removeItem(SESSION_STUDENT);
    window.location.href = "login.html";
  },

  guardStudent() {
    const student = this.getStudent();
    if (!student) {
      window.location.href = "login.html";
      return null;
    }
    return student;
  },

  // -----------------------------------------------------------------------
  // Teacher / Faculty Auth
  // -----------------------------------------------------------------------
  getTeacher() {
    try {
      const t = localStorage.getItem(SESSION_TEACHER);
      return t ? JSON.parse(t) : null;
    } catch (e) {
      return null;
    }
  },

  loginTeacher(identifier, password) {
    const store = window.academicStore ? window.academicStore.get() : null;
    if (!store) return { success: false, message: "Academic data store unavailable." };

    const query = (identifier || "").trim().toLowerCase();
    const user = store.users.find(u => 
      u.role === "teacher" && 
      (u.username.toLowerCase() === query || u.email.toLowerCase() === query)
    );

    if (!user) {
      return { success: false, message: "No faculty account found with this username or official email." };
    }

    if (user.password !== password && password !== "123") {
      return { success: false, message: "Incorrect faculty credentials. Demo default is 123." };
    }

    const sessionPayload = { ...user };
    delete sessionPayload.password;

    localStorage.setItem(SESSION_TEACHER, JSON.stringify(sessionPayload));
    return { success: true, user: sessionPayload };
  },

  logoutTeacher() {
    localStorage.removeItem(SESSION_TEACHER);
    window.location.href = "login.html";
  },

  guardTeacher() {
    const teacher = this.getTeacher();
    if (!teacher) {
      window.location.href = "login.html";
      return null;
    }
    return teacher;
  },

  // -----------------------------------------------------------------------
  // Administrative Council Auth
  // -----------------------------------------------------------------------
  getAdmin() {
    try {
      const a = localStorage.getItem(SESSION_ADMIN);
      return a ? JSON.parse(a) : null;
    } catch (e) {
      return null;
    }
  },

  loginAdmin(identifier, password) {
    const store = window.academicStore ? window.academicStore.get() : null;
    if (!store) return { success: false, message: "Academic data store unavailable." };

    const query = (identifier || "").trim().toLowerCase();
    const user = store.users.find(u => 
      u.role === "admin" && 
      (u.username.toLowerCase() === query || u.email.toLowerCase() === query)
    );

    if (!user) {
      return { success: false, message: "Invalid Administrative Council credentials or unrecognized ID." };
    }

    if (user.password !== password && password !== "123") {
      return { success: false, message: "Incorrect master passcode. Demo default is 123." };
    }

    const sessionPayload = { ...user };
    delete sessionPayload.password;

    localStorage.setItem(SESSION_ADMIN, JSON.stringify(sessionPayload));
    return { success: true, user: sessionPayload };
  },

  logoutAdmin() {
    localStorage.removeItem(SESSION_ADMIN);
    window.location.href = "login.html";
  },

  guardAdmin() {
    const admin = this.getAdmin();
    if (!admin) {
      window.location.href = "login.html";
      return null;
    }
    return admin;
  },

  // -----------------------------------------------------------------------
  // UI Helpers (Toast notification & Dialogs)
  // -----------------------------------------------------------------------
  showToast(message, type = "info", duration = 3500) {
    let container = document.getElementById("v2-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "v2-toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast-item toast-${type}`;
    
    const iconMap = {
      success: "✓",
      error: "✕",
      warning: "⚠",
      info: "ℹ"
    };

    toast.innerHTML = `
      <div class="toast-icon">${iconMap[type] || "ℹ"}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("toast-fade-out");
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }
};

window.AuthV2 = AuthV2;
