// ==========================================================
// VISION SCHOOL ERP
// ADMIN DASHBOARD
// dashboard.js
// PART A1
// ==========================================================

// ==========================================================
// SUPABASE
// ==========================================================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(

    "https://gocoupvzzsgouwdkdmzu.supabase.co",

    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY291cHZ6enNnb3V3ZGtkbXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMDc2MTAsImV4cCI6MjA4NTU4MzYxMH0.XGxBzWLg9etqOo9NVAX5mrli2u-0dwEYGsVgwx4tXaw"

);

// ==========================================================
// GLOBAL VARIABLES
// ==========================================================

let students = [];
let teachers = [];
let chart = null;

// ==========================================================
// DOM
// ==========================================================

const loader =
document.getElementById("loader");

const searchBox =
document.getElementById("searchBox");

const recentStudents =
document.getElementById("recentStudents");

const teacherTable =
document.getElementById("teacherTable");

const toast =
document.getElementById("toast");

const toastMessage =
document.getElementById("toastMessage");

const studentModal =
document.getElementById("studentModal");

const teacherModal =
document.getElementById("teacherModal");

// ==========================================================
// CARD ELEMENTS
// ==========================================================

const totalStudents =
document.getElementById("totalStudents");

const totalTeachers =
document.getElementById("totalTeachers");

const totalClasses =
document.getElementById("totalClasses");

const todayAttendance =
document.getElementById("todayAttendance");

const activeStudents =
document.getElementById("activeStudents");

const feeCollection =
document.getElementById("feeCollection");

const totalBoys =
document.getElementById("totalBoys");

const totalGirls =
document.getElementById("totalGirls");

const inactiveStudents =
document.getElementById("inactiveStudents");

const totalStaff =
document.getElementById("totalStaff");

// ==========================================================
// LOADER
// ==========================================================

function showLoader(){

    loader.style.display="flex";

}

function hideLoader(){

    loader.style.display="none";

}

// ==========================================================
// TOAST
// ==========================================================



// ==========================================================
// DATE
// ==========================================================

function loadTodayDate(){

    const box =
    document.getElementById("todayDate");

    if(!box) return;

    const now = new Date();

    box.innerHTML =
    now.toLocaleDateString(

        "en-IN",

        {

            weekday:"long",

            day:"numeric",

            month:"long",

            year:"numeric"

        }

    );

}

// ==========================================================
// INITIALIZE
// ==========================================================

window.addEventListener(

"DOMContentLoaded",

async()=>{

    loadTodayDate();

    await loadDashboard();

}

);
// ==========================================================
// PART A2
// LOAD DASHBOARD DATA
// ==========================================================

// ----------------------------------------------------------
// LOAD DASHBOARD
// ----------------------------------------------------------

async function loadDashboard(){

    showLoader();

    try{

        await Promise.all([

            loadStudents(),

            loadTeachers()

        ]);

        updateDashboardCards();

        renderRecentStudents();

        renderTeachers();

        createStudentsChart();

    }

    catch(error){

        console.error(error);

        showToast(
            "Failed to load dashboard",
            "#d32f2f"
        );

    }

    finally{

        hideLoader();

    }

}

// ----------------------------------------------------------
// LOAD STUDENTS
// ----------------------------------------------------------

async function loadStudents(){

    const { data, error } = await supabase

        .from("profiles")

        .select("*")

        .eq("role","student")

        .order("created_at",{

            ascending:false

        });

    if(error) throw error;

    students = data || [];

}

// ----------------------------------------------------------
// LOAD TEACHERS
// ----------------------------------------------------------

async function loadTeachers(){

    const { data, error } = await supabase

        .from("profiles")

        .select("*")

        .eq("role","teacher")

        .order("created_at",{

            ascending:false

        });

    if(error) throw error;

    teachers = data || [];

}

// ----------------------------------------------------------
// UPDATE DASHBOARD CARDS
// ----------------------------------------------------------

function updateDashboardCards(){

    const boys = students.filter(

        s => s.gender === "Male"

    ).length;

    const girls = students.filter(

        s => s.gender === "Female"

    ).length;

    const active = students.filter(

        s => s.status === "Active"

    ).length;

    const inactive = students.filter(

        s => s.status !== "Active"

    ).length;

    const classes = [

        ...new Set(

            students

            .map(s=>s.class_name)

            .filter(Boolean)

        )

    ];

    totalStudents.textContent =
    students.length;

    totalTeachers.textContent =
    teachers.length;

    totalClasses.textContent =
    classes.length;

    activeStudents.textContent =
    active;

    inactiveStudents.textContent =
    inactive;

    totalBoys.textContent =
    boys;

    totalGirls.textContent =
    girls;

    totalStaff.textContent =
    teachers.length;

    // Demo values (replace later)

    todayAttendance.textContent =
    "96%";

    feeCollection.textContent =
    "₹0";

    document.getElementById(
        "attendanceCard"
    ).textContent = "96%";

    document.getElementById(
        "newAdmissions"
    ).textContent = students.length;

    document.getElementById(
        "pendingFees"
    ).textContent = "₹0";

    document.getElementById(
        "announcementCount"
    ).textContent = "0";

    document.getElementById(
        "statStudents"
    ).textContent = students.length;

    document.getElementById(
        "statTeachers"
    ).textContent = teachers.length;

    document.getElementById(
        "statActive"
    ).textContent = active;

    document.getElementById(
        "statClasses"
    ).textContent = classes.length;

}

// ----------------------------------------------------------
// REFRESH DASHBOARD
// ----------------------------------------------------------

window.refreshDashboard = async function(){

    await loadDashboard();

    showToast("Dashboard refreshed");

};

// ----------------------------------------------------------
// REFRESH STUDENTS
// ----------------------------------------------------------

window.refreshStudents = async function(){

    await loadStudents();

    updateDashboardCards();

    renderRecentStudents();

    createStudentsChart();

    showToast("Students refreshed");

};

// ----------------------------------------------------------
// REFRESH TEACHERS
// ----------------------------------------------------------

window.refreshTeachers = async function(){

    await loadTeachers();

    updateDashboardCards();

    renderTeachers();

    showToast("Teachers refreshed");

};

// ----------------------------------------------------------
// AUTO REFRESH EVERY 60 SECONDS
// ----------------------------------------------------------

setInterval(async ()=>{

    await loadDashboard();

},60000);
// ==========================================================
// PART A3
// RENDER TABLES
// ==========================================================


// ----------------------------------------------------------
// DEFAULT PHOTO
// ----------------------------------------------------------

function getPhoto(profile){

    if(profile.profile_photo_url){

        return profile.profile_photo_url;

    }

    return "https://ui-avatars.com/api/?background=1565c0&color=fff&name="+
    encodeURIComponent(profile.full_name || profile.teacher_name || "User");

}


// ----------------------------------------------------------
// STATUS BADGE
// ----------------------------------------------------------

function getStatusBadge(status){

    if(status==="Active"){

        return `<span class="status active">Active</span>`;

    }

    return `<span class="status inactive">Inactive</span>`;

}


// ==========================================================
// RECENT STUDENTS
// ==========================================================

function renderRecentStudents(){

    if(!recentStudents) return;

    if(students.length===0){

        recentStudents.innerHTML=`

        <tr>

            <td colspan="8">

                No Students Found

            </td>

        </tr>

        `;

        return;

    }

    recentStudents.innerHTML="";

    students.slice(0,10).forEach(student=>{

        recentStudents.innerHTML+=`

        <tr>

            <td>

                <img
                src="${getPhoto(student)}"
                class="table-photo">

            </td>

            <td>

                ${student.full_name || "-"}

            </td>

            <td>

                ${student.roll_number || "-"}

            </td>

            <td>

                ${student.class_name || "-"}

            </td>

            <td>

                ${student.section || "-"}

            </td>

            <td>

                ${student.gender || "-"}

            </td>

            <td>

                ${getStatusBadge(student.status)}

            </td>

            <td>

                <button
                class="table-btn"
                onclick="location.href='student_profile.html'">

                View

                </button>

            </td>

        </tr>

        `;

    });

}


// ==========================================================
// TEACHERS TABLE
// ==========================================================

function renderTeachers(){

    if(!teacherTable) return;

    if(teachers.length===0){

        teacherTable.innerHTML=`

        <tr>

            <td colspan="6">

                No Teachers Found

            </td>

        </tr>

        `;

        return;

    }

    teacherTable.innerHTML="";

    teachers.slice(0,10).forEach(teacher=>{

        teacherTable.innerHTML+=`

        <tr>

            <td>

                <img
                src="${getPhoto(teacher)}"
                class="table-photo">

            </td>

            <td>

                ${teacher.full_name || "-"}

            </td>

            <td>

                ${teacher.subject || "-"}

            </td>

            <td>

                ${teacher.mobile || "-"}

            </td>

            <td>

                ${getStatusBadge(teacher.status)}

            </td>

            <td>

                <button
                class="table-btn">

                View

                </button>

            </td>

        </tr>

        `;

    });

}


// ==========================================================
// SEARCH STUDENTS
// ==========================================================

searchBox.addEventListener("keyup",function(){

    const keyword=

    this.value

    .toLowerCase()

    .trim();

    const rows=

    recentStudents.querySelectorAll("tr");

    rows.forEach(row=>{

        if(

            row.innerText

            .toLowerCase()

            .includes(keyword)

        ){

            row.style.display="";

        }

        else{

            row.style.display="none";

        }

    });

});


// ==========================================================
// MENU
// ==========================================================

document

.getElementById("menuBtn")

.addEventListener("click",function(){

    document

    .getElementById("sidebar")

    .classList

    .toggle("collapse");

});
// ==========================================================
// PART A4
// CHART + PANELS + MODALS + LOGOUT
// ==========================================================


// ==========================================================
// STUDENT CHART
// ==========================================================

function createStudentsChart(){

    const canvas =
    document.getElementById("studentsChart");

    if(!canvas) return;

    const boys = students.filter(
        s => s.gender === "Male"
    ).length;

    const girls = students.filter(
        s => s.gender === "Female"
    ).length;

    if(chart){

        chart.destroy();

    }

    chart = new Chart(canvas,{

        type:"doughnut",

        data:{

            labels:[

                "Boys",

                "Girls"

            ],

            datasets:[{

                data:[

                    boys,

                    girls

                ],

                backgroundColor:[

                    "#2196f3",

                    "#e91e63"

                ],

                borderWidth:2

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{

                    position:"bottom"

                }

            }

        }

    });

}


// ==========================================================
// NOTIFICATIONS
// ==========================================================

function loadNotifications(){

    const list =
    document.getElementById(
        "notificationList"
    );

    if(!list) return;

    list.innerHTML = "";

    list.innerHTML +=
    `<li>✅ Dashboard Loaded Successfully</li>`;

    list.innerHTML +=
    `<li>👨‍🎓 Total Students : ${students.length}</li>`;

    list.innerHTML +=
    `<li>👨‍🏫 Total Teachers : ${teachers.length}</li>`;

}


// ==========================================================
// BIRTHDAYS
// ==========================================================

function loadBirthdays(){

    const list =
    document.getElementById(
        "birthdayList"
    );

    if(!list) return;

    list.innerHTML = "";

    const today =

    new Date()

    .toISOString()

    .slice(5,10);

    const birthdays =

    students.filter(student=>{

        if(!student.dob)

            return false;

        return student.dob.slice(5,10)

        === today;

    });

    if(birthdays.length===0){

        list.innerHTML=
        "<li>No Birthdays Today</li>";

        return;

    }

    birthdays.forEach(student=>{

        list.innerHTML+=`

        <li>

        🎂 ${student.full_name}

        </li>

        `;

    });

}


// ==========================================================
// ANNOUNCEMENTS
// ==========================================================

function loadAnnouncements(){

    const list =
    document.getElementById(
        "announcementList"
    );

    if(!list) return;

    list.innerHTML="";

    list.innerHTML+=
    "<li>📢 Welcome to Vision School ERP</li>";

    list.innerHTML+=
    "<li>📚 New Academic Year Started</li>";

    list.innerHTML+=
    "<li>📝 Monthly Exams Coming Soon</li>";

}


// ==========================================================
// STUDENT MODAL
// ==========================================================

window.openStudentModal=function(){

    studentModal.style.display="flex";

};

window.closeStudentModal=function(){

    studentModal.style.display="none";

};


// ==========================================================
// TEACHER MODAL
// ==========================================================

window.openTeacherModal=function(){

    teacherModal.style.display="flex";

};

window.closeTeacherModal=function(){

    teacherModal.style.display="none";

};


// ==========================================================
// BUTTON EVENTS
// ==========================================================

document

.getElementById("addStudentBtn")

.addEventListener(

"click",

openStudentModal

);

document

.getElementById("addTeacherBtn")

.addEventListener(

"click",

openTeacherModal

);


// ==========================================================
// CLICK OUTSIDE MODAL
// ==========================================================

window.addEventListener(

"click",

function(e){

    if(e.target===studentModal){

        closeStudentModal();

    }

    if(e.target===teacherModal){

        closeTeacherModal();

    }

}

);


// ==========================================================
// ESC CLOSE
// ==========================================================

window.addEventListener(

"keydown",

function(e){

    if(e.key==="Escape"){

        closeStudentModal();

        closeTeacherModal();

    }

}

);


// ==========================================================
// LOGOUT
// ==========================================================

window.logout = async function(){

    const ok = confirm(

        "Logout from Dashboard?"

    );

    if(!ok) return;

    await supabase.auth.signOut();

    location.href="../index.html";

};


// ==========================================================
// AFTER DASHBOARD LOAD
// ==========================================================

async function afterDashboardLoaded(){

    loadNotifications();

    loadBirthdays();

    loadAnnouncements();

}


// ==========================================================
// OVERRIDE LOAD DASHBOARD
// ==========================================================

const oldDashboard = loadDashboard;

loadDashboard = async function(){

    await oldDashboard();

    afterDashboardLoaded();

};


// ==========================================================
// END OF PART A
// ==========================================================
// ==========================================================
// PART B1
// STUDENT / TEACHER HELPERS
// ==========================================================


// ==========================================================
// STUDENT FORM ELEMENTS
// ==========================================================

const studentForm =
document.getElementById("studentForm");

const saveStudentBtn =
document.getElementById("saveStudentBtn");


// ==========================================================
// TEACHER FORM ELEMENTS
// ==========================================================

const teacherForm =
document.getElementById("teacherForm");

const saveTeacherBtn =
document.getElementById("saveTeacherBtn");


// ==========================================================
// IMAGE PREVIEW
// ==========================================================

const studentPhoto =
document.getElementById("studentPhoto");

const studentPreview =
document.getElementById("studentPreview");


// ==========================================================
// PHOTO PREVIEW
// ==========================================================

if(studentPhoto){

    studentPhoto.addEventListener(

        "change",

        function(e){

            const file = e.target.files[0];

            if(!file){

                studentPreview.src =
                "https://ui-avatars.com/api/?background=1565c0&color=fff&name=Student";

                return;

            }

            const reader = new FileReader();

            reader.onload = function(event){

                studentPreview.src =
                event.target.result;

            };

            reader.readAsDataURL(file);

        }

    );

}


// ==========================================================
// VALIDATE STUDENT
// ==========================================================

function validateStudent(){

    if(

        document.getElementById("full_name").value.trim()===""

    ){

        showToast("Enter student name","#e53935");

        return false;

    }

    if(

        document.getElementById("roll_number").value.trim()===""

    ){

        showToast("Enter roll number","#e53935");

        return false;

    }

    if(

        document.getElementById("class_name").value===""

    ){

        showToast("Select class","#e53935");

        return false;

    }

    if(

        document.getElementById("section").value===""

    ){

        showToast("Select section","#e53935");

        return false;

    }

    if(

        document.getElementById("gender").value===""

    ){

        showToast("Select gender","#e53935");

        return false;

    }

    return true;

}


// ==========================================================
// VALIDATE TEACHER
// ==========================================================

function validateTeacher(){

    if(

        document.getElementById("teacher_name").value.trim()===""

    ){

        showToast("Enter teacher name","#e53935");

        return false;

    }

    if(

        document.getElementById("teacher_subject").value.trim()===""

    ){

        showToast("Enter subject","#e53935");

        return false;

    }

    return true;

}


// ==========================================================
// RESET STUDENT FORM
// ==========================================================

function resetStudentForm(){

    studentForm.reset();

    studentPreview.src =
    "https://ui-avatars.com/api/?background=1565c0&color=fff&name=Student";

}


// ==========================================================
// RESET TEACHER FORM
// ==========================================================

function resetTeacherForm(){

    teacherForm.reset();

}


// ==========================================================
// DEFAULT STUDENT PHOTO
// ==========================================================

function getDefaultStudentPhoto(name){

    return

    "https://ui-avatars.com/api/?background=1565c0&color=fff&name="

    +

    encodeURIComponent(name);

}
// ==========================================================
// PART B2
// SAVE STUDENT
// ==========================================================


// ----------------------------------------------------------
// SAVE STUDENT BUTTON
// ----------------------------------------------------------

if(saveStudentBtn){

    saveStudentBtn.addEventListener(

        "click",

        saveStudent

    );

}


// ----------------------------------------------------------
// SAVE STUDENT
// ----------------------------------------------------------

async function saveStudent(){

    // Validate

    if(!validateStudent()){

        return;

    }

    saveStudentBtn.disabled = true;

    saveStudentBtn.innerHTML = "Saving...";


    // --------------------------------------------------
    // Collect Form Data
    // --------------------------------------------------

    const studentData = {

        role : "student",

        full_name :
        document.getElementById("full_name").value.trim(),

        roll_number :
        document.getElementById("roll_number").value.trim(),

        class_name :
        document.getElementById("class_name").value,

        section :
        document.getElementById("section").value,

        gender :
        document.getElementById("gender").value,

        dob :
        document.getElementById("dob").value || null,

        mobile :
        document.getElementById("mobile").value.trim(),

        blood_group :
        document.getElementById("blood_group").value.trim(),

        admission_date :
        document.getElementById("admission_date").value || null,

        father_name :
        document.getElementById("father_name").value.trim(),

        mother_name :
        document.getElementById("mother_name").value.trim(),

        address :
        document.getElementById("address").value.trim(),

        attendance : 0,

        status :
        document.getElementById("status").value

    };


    // --------------------------------------------------
    // DEFAULT PHOTO
    // --------------------------------------------------

    studentData.profile_photo_url =

    getDefaultStudentPhoto(

        studentData.full_name

    );


    // --------------------------------------------------
    // INSERT
    // --------------------------------------------------

    const {

        data,

        error

    } = await supabase

    .from("profiles")

    .insert(studentData)

    .select()

    .single();


    // --------------------------------------------------
    // ERROR
    // --------------------------------------------------

    if(error){

        console.error(error);

        showToast(

            error.message,

            "#e53935"

        );

        saveStudentBtn.disabled = false;

        saveStudentBtn.innerHTML =

        "💾 Save Student";

        return;

    }


    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    showToast(

        "Student Added Successfully",

        "#2e7d32"

    );


    resetStudentForm();

    closeStudentModal();


    // Reload Dashboard

    await loadDashboard();


    saveStudentBtn.disabled = false;

    saveStudentBtn.innerHTML =

    "💾 Save Student";

}
// ==========================================================
// PART B3
// SAVE TEACHER
// ==========================================================


// ----------------------------------------------------------
// SAVE TEACHER BUTTON
// ----------------------------------------------------------

if(saveTeacherBtn){

    saveTeacherBtn.addEventListener(

        "click",

        saveTeacher

    );

}


// ----------------------------------------------------------
// SAVE TEACHER
// ----------------------------------------------------------

async function saveTeacher(){

    if(!validateTeacher()){

        return;

    }

    saveTeacherBtn.disabled = true;

    saveTeacherBtn.innerHTML = "Saving...";


    // --------------------------------------------------
    // Teacher Object
    // --------------------------------------------------

    const teacherData = {

        role : "teacher",

        full_name :
        document.getElementById("teacher_name").value.trim(),

        mobile :
        document.getElementById("teacher_mobile").value.trim(),

        subject :
        document.getElementById("teacher_subject").value.trim(),

        qualification :
        document.getElementById("teacher_qualification").value.trim(),

        experience :
        document.getElementById("teacher_experience").value.trim(),

        status :
        document.getElementById("teacher_status").value,

        profile_photo_url :
        getDefaultStudentPhoto(
            document.getElementById("teacher_name").value.trim()
        )

    };


    // --------------------------------------------------
    // INSERT
    // --------------------------------------------------

    const {

        data,

        error

    } = await supabase

    .from("profiles")

    .insert(teacherData)

    .select()

    .single();


    // --------------------------------------------------
    // ERROR
    // --------------------------------------------------

    if(error){

        console.error(error);

        showToast(

            error.message,

            "#e53935"

        );

        saveTeacherBtn.disabled = false;

        saveTeacherBtn.innerHTML =

        "💾 Save Teacher";

        return;

    }


    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    showToast(

        "Teacher Added Successfully",

        "#2e7d32"

    );

    resetTeacherForm();

    closeTeacherModal();

    await loadDashboard();

    saveTeacherBtn.disabled = false;

    saveTeacherBtn.innerHTML =

    "💾 Save Teacher";

}
// ==========================================================
// PART B5
// MODALS + TOAST + REFRESH HELPERS
// ==========================================================


// ----------------------------------------------------------
// STUDENT MODAL
// ----------------------------------------------------------

function openStudentModal(){

    document
        .getElementById("studentModal")
        .classList.add("show");

}

function closeStudentModal(){

    document
        .getElementById("studentModal")
        .classList.remove("show");

}


// ----------------------------------------------------------
// TEACHER MODAL
// ----------------------------------------------------------

function openTeacherModal(){

    document
        .getElementById("teacherModal")
        .classList.add("show");

}

function closeTeacherModal(){

    document
        .getElementById("teacherModal")
        .classList.remove("show");

}


// ----------------------------------------------------------
// BUTTON EVENTS
// ----------------------------------------------------------

document
.getElementById("addStudentBtn")
?.addEventListener(
    "click",
    openStudentModal
);

document
.getElementById("addTeacherBtn")
?.addEventListener(
    "click",
    openTeacherModal
);


// ----------------------------------------------------------
// TOAST
// ----------------------------------------------------------

function showToast(message,color="#2e7d32"){

    const toast =
    document.getElementById("toast");

    const text =
    document.getElementById("toastMessage");

    text.textContent = message;

    toast.style.background = color;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

}


// ----------------------------------------------------------
// REFRESH
// ----------------------------------------------------------

async function refreshDashboard(){

    await loadDashboard();

    showToast("Dashboard Refreshed");

}

async function refreshStudents(){

    await loadRecentStudents();

    showToast("Students Updated");

}

async function refreshTeachers(){

    await loadRecentTeachers();

    showToast("Teachers Updated");

}


// ----------------------------------------------------------
// WINDOW FUNCTIONS
// ----------------------------------------------------------

window.refreshDashboard =
refreshDashboard;

window.refreshStudents =
refreshStudents;

window.refreshTeachers =
refreshTeachers;

window.closeStudentModal =
closeStudentModal;

window.closeTeacherModal =
closeTeacherModal;