import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ============================
// SUPABASE INIT
// ============================

const supabase = createClient(
    "https://gocoupvzzsgouwdkdmzu.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY291cHZ6enNnb3V3ZGtkbXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMDc2MTAsImV4cCI6MjA4NTU4MzYxMH0.XGxBzWLg9etqOo9NVAX5mrli2u-0dwEYGsVgwx4tXaw"
);
// ============================
// GET HTML ELEMENTS
// ============================

const logoutBtn = document.getElementById("logoutBtn");
const searchInput = document.getElementById("searchInput");
// ============================================
// CHECK LOGIN
// ============================================

async function checkLogin() {

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;
    }

}
// ============================================
// LOAD ADMIN COUNT
// ============================================

async function loadAdminCount() {

    const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");

    if (error) {
        console.log("Admin count error:", error);
        return;
    }

    // You can use this later in dashboard card if you have it
    console.log("Admins:", count);
}
// ============================================
// LOAD DASHBOARD COUNTS
// ============================================

async function loadDashboardCounts() {

    // Students
    const { count: studentCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "student");

    // Teachers
    const { count: teacherCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "teacher");

    const studentElement = document.getElementById("studentCount");
    const teacherElement = document.getElementById("teacherCount");

    if (studentElement)
        studentElement.textContent = studentCount || 0;

    if (teacherElement)
        teacherElement.textContent = teacherCount || 0;

}
// ============================================
// LOAD ADMIN PROFILE
// ============================================

async function loadProfile() {

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) return;

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

    if (!profile) return;

    const adminName = document.getElementById("adminName");
    const profilePhoto = document.getElementById("profilePhoto");

    if (adminName)
        adminName.textContent = profile.full_name || "Administrator";

    if (profilePhoto)
        profilePhoto.src = profile.profile_photo_url || "admin.png";

}
// ============================================
// LOGOUT FUNCTION
// ============================================

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        const { error } = await supabase.auth.signOut();

        if (error) {
            alert("Logout failed!");
            return;
        }

        window.location.href = "login.html";
    });
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

if (searchInput) {

    searchInput.addEventListener("input", (e) => {

        const value = e.target.value.toLowerCase();

        const cards = document.querySelectorAll(".card, .department-card, .staff-card, .facility-card, .portal-card");

        cards.forEach(card => {

            const text = card.innerText.toLowerCase();

            if (text.includes(value)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
}

// ============================================
// AUTO REFRESH DASHBOARD DATA
// ============================================



// ============================================
// CLICK EFFECT (OPTIONAL UI POLISH)
// ============================================

document.querySelectorAll(".icon, .card, .department-card").forEach(el => {

    el.addEventListener("click", () => {

        el.style.transform = "scale(0.97)";

        setTimeout(() => {
            el.style.transform = "scale(1)";
        }, 150);

    });

});
// ============================================
// STUDENT MANAGEMENT - LOAD STUDENTS
// ============================================

async function loadStudents() {

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student");

    if (error) {
        console.log("Student fetch error:", error);
        return;
    }

    const container = document.getElementById("studentList");

    if (!container) return;

    container.innerHTML = "";

    data.forEach(student => {

        const card = document.createElement("div");

        card.classList.add("student-card");

        card.innerHTML = `
            <div class="student-header">
                <img src="${student.profile_photo_url || 'images/user.png'}" />
                <h3>${student.full_name}</h3>
            </div>

            <p><b>Class:</b> ${student.class || '-'}</p>
            <p><b>Section:</b> ${student.section || '-'}</p>
            <p><b>Roll No:</b> ${student.roll_number || '-'}</p>
            <p><b>Email:</b> ${student.email}</p>

            <div class="student-actions">
                <button onclick="deleteStudent('${student.id}')">Delete</button>
                <button onclick="editStudent('${student.id}')">Edit</button>
            </div>
        `;

        container.appendChild(card);
    });
}

// ============================================
// DELETE STUDENT
// ============================================

async function deleteStudent(id) {

    const confirmDelete = confirm("Are you sure you want to delete this student?");

    if (!confirmDelete) return;

    const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);

    if (error) {
        alert("Delete failed!");
        return;
    }

    alert("Student deleted successfully");

    loadStudents();
}

// ============================================
// EDIT STUDENT (BASIC VERSION)
// ============================================

async function editStudent(id) {

    const newName = prompt("Enter new name:");

    if (!newName) return;

    const { error } = await supabase
        .from("profiles")
        .update({ full_name: newName })
        .eq("id", id);

    if (error) {
        alert("Update failed!");
        return;
    }

    alert("Student updated successfully");

    loadStudents();
}

// ============================================
// AUTO LOAD STUDENTS
// ============================================

window.addEventListener("DOMContentLoaded", () => {

    loadStudents();

});
// ============================================
// TEACHER MANAGEMENT - LOAD TEACHERS
// ============================================

async function loadTeachers() {

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "teacher");

    if (error) {
        console.log("Teacher fetch error:", error);
        return;
    }

    const container = document.getElementById("teacherList");

    if (!container) return;

    container.innerHTML = "";

    data.forEach(teacher => {

        const card = document.createElement("div");

        card.classList.add("teacher-card");

        card.innerHTML = `
            <div class="teacher-header">
                <img src="${teacher.profile_photo_url || 'images/user.png'}" />
                <h3>${teacher.full_name}</h3>
            </div>

            <p><b>Email:</b> ${teacher.email}</p>
            <p><b>Mobile:</b> ${teacher.mobile || '-'}</p>
            <p><b>Subject:</b> ${teacher.username || '-'}</p>

            <div class="teacher-actions">
                <button onclick="deleteTeacher('${teacher.id}')">Delete</button>
                <button onclick="editTeacher('${teacher.id}')">Edit</button>
            </div>
        `;

        container.appendChild(card);
    });
}

// ============================================
// DELETE TEACHER
// ============================================

async function deleteTeacher(id) {

    const confirmDelete = confirm("Are you sure you want to delete this teacher?");

    if (!confirmDelete) return;

    const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);

    if (error) {
        alert("Delete failed!");
        return;
    }

    alert("Teacher deleted successfully");

    loadTeachers();
}

// ============================================
// EDIT TEACHER (BASIC)
// ============================================

async function editTeacher(id) {

    const newName = prompt("Enter new teacher name:");

    if (!newName) return;

    const { error } = await supabase
        .from("profiles")
        .update({ full_name: newName })
        .eq("id", id);

    if (error) {
        alert("Update failed!");
        return;
    }

    alert("Teacher updated successfully");

    loadTeachers();
}

// ============================================
// AUTO LOAD TEACHERS
// ============================================

window.addEventListener("DOMContentLoaded", () => {

    loadTeachers();

});
// ============================================
// DASHBOARD CONTROLLER (MAIN ENGINE)
// ============================================

async function initDashboard() {

    try {

        // STEP 1: Check login
        await checkLogin();

        // STEP 2: Load admin profile
        await loadProfile();

        // STEP 3: Load dashboard counts
        await loadDashboardCounts();

        // STEP 4: Load students
        await loadStudents();

        // STEP 5: Load teachers
        await loadTeachers();

        // STEP 6: Load admin count
        await loadAdminCount();

        console.log("Dashboard loaded successfully");

    } catch (error) {

        console.error("Dashboard init error:", error);

    }
}

// ============================================
// REPLACE OLD DOMContentLoaded EVENTS
// ============================================

window.addEventListener("DOMContentLoaded", initDashboard);

// ============================================
// REAL-TIME AUTO REFRESH SYSTEM
// ============================================

setInterval(() => {

    loadDashboardCounts();

}, 15000); // every 15 seconds

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

window.addEventListener("error", (event) => {

    console.log("JS Error:", event.message);

});
// ============================================
// ATTENDANCE SYSTEM - LOAD STUDENTS
// ============================================

async function loadAttendance() {

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student");

    if (error) {
        console.log("Attendance load error:", error);
        return;
    }

    const container = document.getElementById("attendanceList");

    if (!container) return;

    container.innerHTML = "";

    data.forEach(student => {

        const row = document.createElement("div");

        row.classList.add("attendance-row");

        row.innerHTML = `
            <div class="att-info">
                <h3>${student.full_name}</h3>
                <p>Class: ${student.class || '-'} | Roll: ${student.roll_number || '-'}</p>
            </div>

            <div class="att-actions">

                <button class="present-btn" onclick="markAttendance('${student.id}', 'Present')">
                    Present
                </button>

                <button class="absent-btn" onclick="markAttendance('${student.id}', 'Absent')">
                    Absent
                </button>

                <span class="att-status">
                    ${student.attendance || 'Not Marked'}
                </span>

            </div>
        `;

        container.appendChild(row);
    });
}

// ============================================
// MARK ATTENDANCE
// ============================================

async function markAttendance(id, status) {

    const { error } = await supabase
        .from("profiles")
        .update({ attendance: status })
        .eq("id", id);

    if (error) {
        alert("Failed to update attendance");
        return;
    }

    alert("Attendance marked: " + status);

    loadAttendance();
}

// ============================================
// AUTO LOAD ATTENDANCE
// ============================================

window.addEventListener("DOMContentLoaded", () => {

    loadAttendance();

});

// ============================================
// FEE MANAGEMENT - LOAD STUDENTS
// ============================================

async function loadFees() {

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student");

    if (error) {
        console.log("Fee load error:", error);
        return;
    }

    const container = document.getElementById("feeList");

    if (!container) return;

    container.innerHTML = "";

    data.forEach(student => {

        const card = document.createElement("div");

        card.classList.add("fee-card");

        card.innerHTML = `
            <div class="fee-header">
                <h3>${student.full_name}</h3>
                <p>Class: ${student.class || '-'}</p>
            </div>

            <div class="fee-status">
                <span>Status: <b>${student.fee_status || 'Unpaid'}</b></span>
            </div>

            <div class="fee-actions">

                <button onclick="updateFeeStatus('${student.id}', 'Paid')" class="paid-btn">
                    Mark Paid
                </button>

                <button onclick="updateFeeStatus('${student.id}', 'Unpaid')" class="unpaid-btn">
                    Mark Unpaid
                </button>

            </div>
        `;

        container.appendChild(card);
    });
}

// ============================================
// UPDATE FEE STATUS
// ============================================

async function updateFeeStatus(id, status) {

    const { error } = await supabase
        .from("profiles")
        .update({ fee_status: status })
        .eq("id", id);

    if (error) {
        alert("Fee update failed!");
        return;
    }

    alert("Fee status updated: " + status);

    loadFees();
}

// ============================================
// AUTO LOAD FEES
// ============================================

window.addEventListener("DOMContentLoaded", () => {

    loadFees();

});
// ============================================
// EXAM MANAGEMENT - LOAD STUDENTS
// ============================================

async function loadExams() {

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student");

    if (error) {
        console.log("Exam load error:", error);
        return;
    }

    const container = document.getElementById("examList");

    if (!container) return;

    container.innerHTML = "";

    data.forEach(student => {

        const card = document.createElement("div");

        card.classList.add("exam-card");

        card.innerHTML = `
            <div class="exam-header">
                <h3>${student.full_name}</h3>
                <p>Class: ${student.class || '-'}</p>
            </div>

            <div class="exam-info">
                <p><b>Exam:</b> ${student.exam_name || 'Not Assigned'}</p>
                <p><b>Marks:</b> ${student.marks || 'Not Entered'}</p>
            </div>

            <div class="exam-actions">

                <button onclick="assignExam('${student.id}')">
                    Assign Exam
                </button>

                <button onclick="addMarks('${student.id}')">
                    Add Marks
                </button>

            </div>
        `;

        container.appendChild(card);
    });
}

// ============================================
// ASSIGN EXAM
// ============================================

async function assignExam(id) {

    const exam = prompt("Enter Exam Name (e.g. Mid Term):");

    if (!exam) return;

    const { error } = await supabase
        .from("profiles")
        .update({ exam_name: exam })
        .eq("id", id);

    if (error) {
        alert("Failed to assign exam");
        return;
    }

    alert("Exam assigned successfully");

    loadExams();
}

// ============================================
// ADD MARKS
// ============================================

async function addMarks(id) {

    const marks = prompt("Enter Marks (out of 100):");

    if (!marks) return;

    const { error } = await supabase
        .from("profiles")
        .update({ marks: marks })
        .eq("id", id);

    if (error) {
        alert("Failed to add marks");
        return;
    }

    alert("Marks updated successfully");

    loadExams();
}

// ============================================
// AUTO LOAD EXAMS
// ============================================

window.addEventListener("DOMContentLoaded", () => {

    loadExams();

});
// ============================================
// RESULTS SYSTEM - LOAD STUDENTS
// ============================================

async function loadResults() {

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student");

    if (error) {
        console.log("Results load error:", error);
        return;
    }

    const container = document.getElementById("resultsList");

    if (!container) return;

    container.innerHTML = "";

    data.forEach(student => {

        const marks = parseInt(student.marks || 0);

        let grade = "N/A";

        if (marks >= 90) grade = "A+";
        else if (marks >= 75) grade = "A";
        else if (marks >= 60) grade = "B";
        else if (marks >= 40) grade = "C";
        else if (marks > 0) grade = "F";

        const card = document.createElement("div");

        card.classList.add("result-card");

        card.innerHTML = `
            <div class="result-header">
                <h3>${student.full_name}</h3>
                <p>Class: ${student.class || '-'}</p>
            </div>

            <div class="result-body">

                <p><b>Exam:</b> ${student.exam_name || 'Not Assigned'}</p>
                <p><b>Marks:</b> ${marks}</p>
                <p><b>Grade:</b> ${grade}</p>

            </div>

            <div class="result-actions">

                <button onclick="updateResult('${student.id}', '${grade}')">
                    Save Result
                </button>

            </div>
        `;

        container.appendChild(card);
    });
}

// ============================================
// SAVE RESULT TO DATABASE
// ============================================

async function updateResult(id, grade) {

    const total = prompt("Enter Total Marks (optional):");

    const { error } = await supabase
        .from("profiles")
        .update({
            grade: grade,
            total_marks: total || null
        })
        .eq("id", id);

    if (error) {
        alert("Failed to update result");
        return;
    }

    alert("Result saved successfully");

    loadResults();
}

// ============================================
// AUTO LOAD RESULTS
// ============================================

window.addEventListener("DOMContentLoaded", () => {

    loadResults();

});
// ============================================
// LIBRARY SYSTEM
// ============================================

async function loadLibrary() {

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student");

    if (error) {
        console.log("Library error:", error);
        return;
    }

    const container = document.getElementById("libraryList");

    if (!container) return;

    container.innerHTML = "";

    data.forEach(student => {

        const card = document.createElement("div");

        card.classList.add("library-card");

        card.innerHTML = `
            <h3>${student.full_name}</h3>

            <p><b>Library Status:</b> ${student.library_status || "No Data"}</p>

            <button onclick="updateLibrary('${student.id}', 'Issued')">
                Issue Book
            </button>

            <button onclick="updateLibrary('${student.id}', 'Returned')">
                Return Book
            </button>
        `;

        container.appendChild(card);
    });
}

// Update Library Status
async function updateLibrary(id, status) {

    const { error } = await supabase
        .from("profiles")
        .update({ library_status: status })
        .eq("id", id);

    if (error) {
        alert("Library update failed");
        return;
    }

    loadLibrary();
}

// ============================================
// TRANSPORT SYSTEM
// ============================================

async function loadTransport() {

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student");

    if (error) {
        console.log("Transport error:", error);
        return;
    }

    const container = document.getElementById("transportList");

    if (!container) return;

    container.innerHTML = "";

    data.forEach(student => {

        const card = document.createElement("div");

        card.classList.add("transport-card");

        card.innerHTML = `
            <h3>${student.full_name}</h3>

            <p><b>Bus Route:</b> ${student.bus_route || "Not Assigned"}</p>

            <button onclick="assignBus('${student.id}')">
                Assign Route
            </button>
        `;

        container.appendChild(card);
    });
}

// Assign Bus Route
async function assignBus(id) {

    const route = prompt("Enter Bus Route:");

    if (!route) return;

    const { error } = await supabase
        .from("profiles")
        .update({ bus_route: route })
        .eq("id", id);

    if (error) {
        alert("Failed to assign route");
        return;
    }

    loadTransport();
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

async function loadNotifications() {

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student");

    if (error) {
        console.log("Notification error:", error);
        return;
    }

    const container = document.getElementById("notificationPanel");

    if (!container) return;

    container.innerHTML = "";

    data.forEach(student => {

        const card = document.createElement("div");

        card.classList.add("notification-card");

        card.innerHTML = `
            <h3>${student.full_name}</h3>

            <p>${student.notifications || "No notifications"}</p>

            <button onclick="sendNotification('${student.id}')">
                Send Notification
            </button>
        `;

        container.appendChild(card);
    });
}

// Send Notification
async function sendNotification(id) {

    const msg = prompt("Enter message:");

    if (!msg) return;

    const { error } = await supabase
        .from("profiles")
        .update({ notifications: msg })
        .eq("id", id);

    if (error) {
        alert("Failed to send notification");
        return;
    }

    loadNotifications();
}