// ======================================================
// Vision School ERP
// Student Master
// Part 1/4
// ======================================================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ======================================================
// SUPABASE CONFIG
// ======================================================

const SUPABASE_URL =
  "https://gocoupvzzsgouwdkdmzu.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY291cHZ6enNnb3V3ZGtkbXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMDc2MTAsImV4cCI6MjA4NTU4MzYxMH0.XGxBzWLg9etqOo9NVAX5mrli2u-0dwEYGsVgwx4tXaw";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

window.supabase = supabase;

// ======================================================
// GLOBAL VARIABLES
// ======================================================

let profiles = [];

let selectedPhoto = null;

// ======================================================
// DOM ELEMENTS
// ======================================================

const table =
  document.getElementById("studentTable");

const loading =
  document.getElementById("loading");

const emptyMessage =
  document.getElementById("emptyMessage");

// ======================================================
// HELPER FUNCTIONS
// ======================================================

// Return safe value

function safe(value) {

  return value ?? "";

}

// Format date nicely

function formatDate(value) {

  if (!value) return "";

  return new Date(value).toLocaleDateString();

}

// Find student by ID

function getStudent(id) {

  return profiles.find(

    student =>

      String(student.id) === String(id)

  );

}

// ======================================================
// LOADING INDICATOR
// ======================================================

function showLoading() {

  if (loading) {

    loading.classList.remove("hidden");

  }

}

function hideLoading() {

  if (loading) {

    loading.classList.add("hidden");

  }

}

// ======================================================
// EMPTY STATE
// ======================================================

function showEmpty() {

  if (emptyMessage) {

    emptyMessage.classList.remove("hidden");

  }

}

function hideEmpty() {

  if (emptyMessage) {

    emptyMessage.classList.add("hidden");

  }

}

// ======================================================
// LOAD STUDENTS
// ======================================================

async function loadStudents() {

  showLoading();

  hideEmpty();

  try {

    const { data, error } = await supabase

      .from("profiles")

      .select("*")

      .order(

        "created_at",

        {

          ascending: false

        }

      );

    if (error) throw error;

    profiles = data || [];

    renderTable(profiles);

  }

  catch (error) {

    console.error(error);

    alert(

      "Unable to load students.\n\n"

      + error.message

    );

  }

  finally {

    hideLoading();

  }

}

// ======================================================
// PHOTO PREVIEW
// ======================================================

window.addEventListener(

  "DOMContentLoaded",

  () => {

    const input =

      document.getElementById(

        "edit_photo_file"

      );

    const preview =

      document.getElementById(

        "edit_photo_preview"

      );

    if (!input || !preview)

      return;

    input.addEventListener(

      "change",

      e => {

        const file =

          e.target.files[0];

        selectedPhoto =

          file || null;

        if (file) {

          preview.src =

            URL.createObjectURL(file);

        }

        else {

          preview.src = "";

        }

      }

    );

  }

);
// ======================================================
// Vision School ERP
// Student Master
// Part 2/4
// ======================================================

// ======================================================
// RENDER TABLE
// ======================================================

function renderTable(data) {

    if (!table) return;

    // Empty State
    if (data.length === 0) {

        table.innerHTML = `
        <tr>
            <td colspan="20" class="text-center">
                No Students Found
            </td>
        </tr>
        `;

        updateStats([]);

        showEmpty();

        return;

    }

    hideEmpty();

    let rows = "";

    data.forEach(student => {

        const statusClass =
            student.status === "Active"
                ? "status-active"
                : "status-inactive";

        rows += `

<tr>

<td>

<img
src="${student.profile_photo_url || ""}"
alt="Student Photo">

</td>

<td>${safe(student.id)}</td>

<td>${safe(student.roll_number)}</td>

<td>${safe(student.full_name)}</td>

<td>${safe(student.username)}</td>

<td>${safe(student.email)}</td>

<td>${safe(student.mobile)}</td>

<td>${safe(student.class_name)}</td>

<td>${safe(student.section)}</td>

<td>${safe(student.gender)}</td>

<td>${formatDate(student.dob)}</td>

<td>${safe(student.father_name)}</td>

<td>${safe(student.mother_name)}</td>

<td>${safe(student.blood_group)}</td>

<td>${formatDate(student.admission_date)}</td>

<td>${safe(student.address)}</td>

<td>

<span class="${statusClass}">

${safe(student.status)}

</span>

</td>

<td>${formatDate(student.last_login)}</td>

<td>${formatDate(student.created_at)}</td>

<td>

    <button 
        class="action view"
        onclick="viewProfile('${student.id}')">

        👁 View

    </button>

    <button 
        class="action edit"
        onclick="editProfile('${student.id}')">

        ✏ Edit

    </button>

    <button 
        class="action delete"
        onclick="deleteStudent('${student.id}')">

        🗑 Delete

    </button>

</td>

</tr>

`;

    });

    table.innerHTML = rows;

    updateStats(data);

}

// ======================================================
// UPDATE DASHBOARD COUNTS
// ======================================================

function updateStats(data) {

    let male = 0;
    let female = 0;
    let active = 0;

    data.forEach(student => {

        if (student.gender === "Male")
            male++;

        if (student.gender === "Female")
            female++;

        if (student.status === "Active")
            active++;

    });

    document.getElementById("totalCount").innerText =
        data.length;

    document.getElementById("maleCount").innerText =
        male;

    document.getElementById("femaleCount").innerText =
        female;

    document.getElementById("activeCount").innerText =
        active;

}

// ======================================================
// APPLY FILTERS
// ======================================================

function applyFilters() {

    const name =
        document.getElementById("nameSearch")
        .value
        .trim()
        .toLowerCase();

    const roll =
        document.getElementById("rollSearch")
        .value
        .trim();

    const mobile =
        document.getElementById("mobileSearch")
        .value
        .trim();

    const username =
        document.getElementById("usernameSearch")
        .value
        .trim()
        .toLowerCase();

    const className =
        document.getElementById("classSearch")
        .value
        .trim();

    const section =
        document.getElementById("sectionSearch")
        .value
        .trim();

    const gender =
        document.getElementById("genderFilter")
        .value;

    const status =
        document.getElementById("statusFilter")
        .value;

    const filtered = profiles.filter(student => {

        return (

            (!name ||

                safe(student.full_name)
                    .toLowerCase()
                    .includes(name))

            &&

            (!roll ||

                safe(student.roll_number)
                    .includes(roll))

            &&

            (!mobile ||

                safe(student.mobile)
                    .includes(mobile))

            &&

            (!username ||

                safe(student.username)
                    .toLowerCase()
                    .includes(username))

            &&

            (!className ||

                safe(student.class_name)
                    .includes(className))

            &&

            (!section ||

                safe(student.section)
                    .includes(section))

            &&

            (!gender ||

                student.gender === gender)

            &&

            (!status ||

                student.status === status)

        );

    });

    renderTable(filtered);

}

// ======================================================
// RESET FILTERS
// ======================================================

function resetFilters() {

    document
        .querySelectorAll(".filters input")
        .forEach(input => {

            input.value = "";

        });

    document
        .querySelectorAll(".filters select")
        .forEach(select => {

            select.value = "";

        });

    hideEmpty();

    renderTable(profiles);

}
// ======================================================
// EDIT STUDENT PROFILE
// ======================================================

async function editProfile(id) {

    try {

        const student = getStudent(id);

        if (!student) {

            alert("Student not found.");

            return;

        }

        // Reset selected photo

        selectedPhoto = null;

        // Store ID

        document.getElementById("edit_id").value =
            student.id;

        // ----------------------------
        // PHOTO
        // ----------------------------

        const preview =
            document.getElementById("edit_photo_preview");

        preview.src =
            student.profile_photo_url || "";

        document.getElementById(
            "edit_photo_file"
        ).value = "";

        // ----------------------------
        // BASIC DETAILS
        // ----------------------------

        document.getElementById("edit_roll").value =
            safe(student.roll_number);

        document.getElementById("edit_name").value =
            safe(student.full_name);

        document.getElementById("edit_username").value =
            safe(student.username);

        document.getElementById("edit_email").value =
            safe(student.email);

        document.getElementById("edit_mobile").value =
            safe(student.mobile);

        // ----------------------------
        // ACADEMIC DETAILS
        // ----------------------------

        document.getElementById("edit_class").value =
            safe(student.class_name);

        document.getElementById("edit_section").value =
            safe(student.section);

        document.getElementById("edit_gender").value =
            safe(student.gender);

        document.getElementById("edit_dob").value =
            student.dob || "";

        // ----------------------------
        // PARENTS DETAILS
        // ----------------------------

        document.getElementById("edit_father").value =
            safe(student.father_name);

        document.getElementById("edit_mother").value =
            safe(student.mother_name);

        document.getElementById("edit_blood").value =
            safe(student.blood_group);

        // ----------------------------
        // ADMISSION DETAILS
        // ----------------------------

        document.getElementById("edit_admission").value =
            student.admission_date || "";

        document.getElementById("edit_address").value =
            safe(student.address);

        document.getElementById("edit_status").value =
            safe(student.status);

        // ----------------------------
        // READ ONLY DETAILS
        // ----------------------------

        document.getElementById("edit_lastlogin").value =
            student.last_login
                ? formatDate(student.last_login)
                : "";

        document.getElementById("edit_created").value =
            student.created_at
                ? formatDate(student.created_at)
                : "";

        // Optional (recommended)

        document.getElementById("edit_lastlogin")
            .readOnly = true;

        document.getElementById("edit_created")
            .readOnly = true;

        // ----------------------------
        // OPEN MODAL
        // ----------------------------

        document.getElementById("editModal")
            .style.display = "flex";

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to open student profile."
        );

    }

}
// ======================================================
// VIEW STUDENT PROFILE
// ======================================================

function viewProfile(id) {

    try {

        const student = getStudent(id);

        if (!student) {

            alert("Student not found.");

            return;

        }

        // ----------------------------
        // PHOTO
        // ----------------------------

        document.getElementById("view_photo").src =
            student.profile_photo_url || "";

        // ----------------------------
        // BASIC DETAILS
        // ----------------------------

        document.getElementById("v_id").textContent =
            safe(student.id);

        document.getElementById("v_name").textContent =
            safe(student.full_name);

        document.getElementById("v_email").textContent =
            safe(student.email);

        document.getElementById("v_mobile").textContent =
            safe(student.mobile);

        // If your HTML contains these IDs

        const roll = document.getElementById("v_roll");
        if (roll)
            roll.textContent =
                safe(student.roll_number);

        const username =
            document.getElementById("v_username");

        if (username)
            username.textContent =
                safe(student.username);

        // ----------------------------
        // ACADEMIC DETAILS
        // ----------------------------

        document.getElementById("v_class").textContent =
            safe(student.class_name);

        document.getElementById("v_section").textContent =
            safe(student.section);

        document.getElementById("v_gender").textContent =
            safe(student.gender);

        document.getElementById("v_dob").textContent =
            student.dob
                ? formatDate(student.dob)
                : "";

        // ----------------------------
        // PARENT DETAILS
        // ----------------------------

        document.getElementById("v_father").textContent =
            safe(student.father_name);

        document.getElementById("v_mother").textContent =
            safe(student.mother_name);

        document.getElementById("v_blood").textContent =
            safe(student.blood_group);

        // ----------------------------
        // OTHER DETAILS
        // ----------------------------

        document.getElementById("v_address").textContent =
            safe(student.address);

        document.getElementById("v_status").textContent =
            safe(student.status);

        const admission =
            document.getElementById("v_admission");

        if (admission)
            admission.textContent =
                student.admission_date
                    ? formatDate(student.admission_date)
                    : "";

        const created =
            document.getElementById("v_created");

        if (created)
            created.textContent =
                student.created_at
                    ? formatDate(student.created_at)
                    : "";

        const login =
            document.getElementById("v_lastlogin");

        if (login)
            login.textContent =
                student.last_login
                    ? formatDate(student.last_login)
                    : "";

        // ----------------------------
        // OPEN MODAL
        // ----------------------------

        document.getElementById("viewModal")
            .style.display = "flex";

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to open profile."
        );

    }

}

// ======================================================
// CLOSE EDIT MODAL
// ======================================================

function closeModal() {

    document.getElementById("editModal")
        .style.display = "none";

    selectedPhoto = null;

    document.getElementById(
        "edit_photo_file"
    ).value = "";

}

// ======================================================
// CLOSE VIEW MODAL
// ======================================================

function closeViewModal() {

    document.getElementById("viewModal")
        .style.display = "none";

}

// ======================================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ======================================================

window.addEventListener("click", function (event) {

    const editModal =
        document.getElementById("editModal");

    const viewModal =
        document.getElementById("viewModal");

    if (event.target === editModal) {

        closeModal();

    }

    if (event.target === viewModal) {

        closeViewModal();

    }

});

// ======================================================
// CLOSE MODALS WITH ESC KEY
// ======================================================

window.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        closeModal();

        closeViewModal();

    }

});
// ======================================================
// UPDATE STUDENT PROFILE
// ======================================================

async function updateProfile() {

    try {

        const id =
            document.getElementById("edit_id").value;

        const currentStudent =
            getStudent(id);

        if (!currentStudent) {

            alert("Student not found.");

            return;

        }

        //-------------------------------------------------
        // Preserve Existing Photo
        //-------------------------------------------------

        let photoURL =
            currentStudent.profile_photo_url || "";

        //-------------------------------------------------
        // Upload New Photo (if selected)
        //-------------------------------------------------

        if (selectedPhoto) {

            const extension =
                selectedPhoto.name
                    .split(".")
                    .pop();

            const fileName =

                `${id}_${Date.now()}.${extension}`;

            const {

                error: uploadError

            } = await supabase.storage

                .from("student-photos")

               .upload(
                fileName,
                selectedPhoto
                );

            if (uploadError) {

    console.error("UPLOAD ERROR:", uploadError);

    alert(JSON.stringify(uploadError, null, 2));

    throw uploadError;

}

            const {

                data: photoData

            } = supabase.storage

                .from("student-photos")

                .getPublicUrl(fileName);

            photoURL =
                photoData.publicUrl;

        }

        //-------------------------------------------------
        // CALL RPC
        //-------------------------------------------------

        const {

            error

        } = await supabase.rpc(

            "update_student_profile",

            {

                uid: id,

                p_profile_photo_url:
                    photoURL,

                p_roll_number:
                    document.getElementById("edit_roll").value,

                p_full_name:
                    document.getElementById("edit_name").value,

                p_username:
                    document.getElementById("edit_username").value,

                p_email:
                    document.getElementById("edit_email").value,

                p_mobile:
                    document.getElementById("edit_mobile").value,

                p_class_name:
                    document.getElementById("edit_class").value,

                p_section:
                    document.getElementById("edit_section").value,

                p_gender:
                    document.getElementById("edit_gender").value,

                p_dob:
                    document.getElementById("edit_dob").value || null,

                p_father_name:
                    document.getElementById("edit_father").value,

                p_mother_name:
                    document.getElementById("edit_mother").value,

                p_blood_group:
                    document.getElementById("edit_blood").value,

                p_admission_date:
                    document.getElementById("edit_admission").value || null,

                p_address:
                    document.getElementById("edit_address").value,

                p_status:
                    document.getElementById("edit_status").value

            }

        );

        if (error)
            throw error;

        //-------------------------------------------------
        // SUCCESS
        //-------------------------------------------------

        alert(
            "Student updated successfully."
        );

        closeModal();

        await loadStudents();

    }

    catch (error) {

        console.error(error);

        alert(

            "Update Failed\n\n"

            + error.message

        );

    }

}
// ======================================================
// DELETE STUDENT
// ======================================================

async function deleteStudent(id) {

    try {

        // Find the student from our loaded student list
        const student = getStudent(id);

        // If student does not exist
        if (!student) {

            alert("Student not found.");

            return;
        }

        // Show confirmation message
        const confirmDelete = confirm(
            "Are you sure you want to delete this student?\n\n" +
            "Name: " + safe(student.full_name) + "\n" +
            "Roll Number: " + safe(student.roll_number) + "\n\n" +
            "This action cannot be undone."
        );

        // User clicked Cancel
        if (!confirmDelete) {

            return;
        }

        // Show loading
        showLoading();

        // Delete student from Supabase profiles table
        const { error } = await supabase
            .from("profiles")
            .delete()
            .eq("id", id);

        // If Supabase gives an error
        if (error) {

            console.error("DELETE ERROR:", error);

            throw error;
        }

        // Remove student from local JavaScript array
        profiles = profiles.filter(
            student => String(student.id) !== String(id)
        );

        // Refresh the table
        renderTable(profiles);

        // Success message
        alert(
            "Student deleted successfully."
        );

    }
    catch (error) {

        console.error(error);

        alert(
            "Delete Failed\n\n" +
            error.message
        );

    }
    finally {

        hideLoading();

    }
}
// ======================================================
// EXPORT STUDENTS TO CSV
// ======================================================

function exportCSV() {

    if (!profiles.length) {

        alert("No student data available.");

        return;

    }

    const headers = [

        "Roll Number",
        "Full Name",
        "Username",
        "Email",
        "Mobile",
        "Class",
        "Section",
        "Gender",
        "DOB",
        "Father Name",
        "Mother Name",
        "Blood Group",
        "Admission Date",
        "Address",
        "Status"

    ];

    const rows = profiles.map(student => [

        safe(student.roll_number),
        safe(student.full_name),
        safe(student.username),
        safe(student.email),
        safe(student.mobile),
        safe(student.class_name),
        safe(student.section),
        safe(student.gender),
        safe(student.dob),
        safe(student.father_name),
        safe(student.mother_name),
        safe(student.blood_group),
        safe(student.admission_date),
        safe(student.address),
        safe(student.status)

    ]);

    const csv = [

        headers.join(","),

        ...rows.map(row =>

            row.map(value =>

                `"${String(value).replace(/"/g, '""')}"`

            ).join(",")

        )

    ].join("\n");

    const blob = new Blob(

        [csv],

        {

            type: "text/csv;charset=utf-8;"

        }

    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download =

        "students.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}

// ======================================================
// REFRESH TABLE
// ======================================================

async function refreshTable() {

    await loadStudents();

}

// ======================================================
// KEYBOARD SHORTCUTS
// ======================================================

window.addEventListener(

    "keydown",

    e => {

        // Ctrl + R

        if (e.ctrlKey && e.key === "r") {

            e.preventDefault();

            refreshTable();

        }

        // Ctrl + E

        if (e.ctrlKey && e.key === "e") {

            e.preventDefault();

            exportCSV();

        }

    }

);

// ======================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ======================================================

window.loadStudents = loadStudents;

window.applyFilters = applyFilters;

window.resetFilters = resetFilters;

window.exportCSV = exportCSV;

window.viewProfile = viewProfile;

window.editProfile = editProfile;

window.updateProfile = updateProfile;

window.deleteStudent = deleteStudent;

window.closeModal = closeModal;

window.closeViewModal = closeViewModal;


// ======================================================
// INITIALIZE PAGE
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        await loadStudents();

    }

);

// ======================================================
// END OF FILE
// ======================================================