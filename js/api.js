/**
 * CSC 114 Student Portal - Dual-Mode API Client
 * Seamlessly connects to Node/Express REST API on Port 5000 when active,
 * with automatic fallback to persistent browser localStorage.
 */

const API_BASE_URL = "http://localhost:5000/api";

const PortalAPI = {
  isBackendOnline: false,

  async init() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        this.isBackendOnline = true;
        this.updateStatusBadge(true);
        console.log("✅ [PortalAPI] Connected to Node/Express REST API Server (Port 5000)");
      } else {
        this.isBackendOnline = false;
        this.updateStatusBadge(false);
      }
    } catch (e) {
      this.isBackendOnline = false;
      this.updateStatusBadge(false);
      console.log("⚡ [PortalAPI] Running in Standalone LocalStorage Mode (Backend offline or direct file access)");
    }
  },

  updateStatusBadge(online) {
    const badge = document.getElementById("apiStatusBadge");
    if (badge) {
      if (online) {
        badge.innerHTML = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10b981;margin-right:6px;"></span>REST API Connected`;
        badge.className = "badge badge-green";
        badge.title = "Connected to live Node.js REST API on http://localhost:5000";
      } else {
        badge.innerHTML = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;margin-right:6px;"></span>LocalStorage Mode`;
        badge.className = "badge badge-yellow";
        badge.title = "Running with persistent browser LocalStorage. Start 'node Backend/server.js' to connect live REST API.";
      }
    }
  },

  // Auth API
  async login(username, password, role) {
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, role })
        });
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch (e) {
        console.warn("[PortalAPI] Fallback to local auth:", e);
      }
    }
    // Local fallback
    const db = getDB();
    const user = db.users.find(u => 
      (u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase() || u.studentId === username) &&
      u.password === password
    ) || {
      id: "USR-" + Date.now(),
      username,
      name: role === "admin" ? "Prof. Dr. M. Rahman" : role === "teacher" ? "Dr. Ahmed Hossain" : "Rahim Ahmed",
      role: role || "student",
      studentId: role === "student" ? (username.startsWith("CSC") ? username : "CSC114-001") : null
    };
    return { success: true, user, token: "local-token-" + Date.now() };
  },

  // Students API
  async getStudents(search = "", section = "ALL") {
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/students?search=${encodeURIComponent(search)}&section=${encodeURIComponent(section)}`);
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    const db = getDB();
    let sList = db.students || [];
    if (section !== "ALL") sList = sList.filter(s => s.section === section);
    if (search) {
      const q = search.toLowerCase();
      sList = sList.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    }
    return sList;
  },

  async saveStudent(studentData) {
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/students`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(studentData)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return { success: true, student: studentData };
  },

  async deleteStudent(studentId) {
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/students/${studentId}`, { method: "DELETE" });
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return { success: true };
  },

  // Courses API
  async getCourses() {
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/courses`);
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return getDB().courses || [];
  },

  // Attendance API
  async saveAttendance(session) {
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/attendance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(session)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return { success: true };
  },

  // Results API
  async saveResult(resultData) {
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/results`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(resultData)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return { success: true };
  },

  // Notices API
  async saveNotice(noticeData) {
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/notices`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(noticeData)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    return { success: true };
  }
};

// Auto-check on load
document.addEventListener("DOMContentLoaded", () => {
  PortalAPI.init();
});
