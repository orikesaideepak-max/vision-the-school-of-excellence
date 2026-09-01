import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";


// ======================================================
// SUPABASE
// ======================================================

const supabase = createClient(
    "https://gocoupvzzsgouwdkdmzu.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY291cHZ6enNnb3V3ZGtkbXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMDc2MTAsImV4cCI6MjA4NTU4MzYxMH0.XGxBzWLg9etqOo9NVAX5mrli2u-0dwEYGsVgwx4tXaw"
);


// ======================================================
// VARIABLES
// ======================================================

let students = [];
let fees = [];
let pendingStudents = [];


// ======================================================
// CLASS ORDER
// ======================================================

const classOrder = [
    "nursery",
    "lkg",
    "ukg",
    "1st",
    "2nd",
    "3rd",
    "4th",
    "5th",
    "6th",
    "7th",
    "8th",
    "9th",
    "10th"
];


// ======================================================
// NORMALIZE CLASS NAME
// ======================================================

function normalizeClass(className) {

    return String(className || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "");

}


// ======================================================
// GET CLASS ORDER NUMBER
// ======================================================

function getClassOrder(className) {

    const normalizedClass = normalizeClass(className);

    const index = classOrder.indexOf(normalizedClass);

    if (index === -1) {
        return 999;
    }

    return index;

}


// ======================================================
// LOAD PENDING FEE DATA
// ======================================================

async function loadPendingFees() {

    const table = document.getElementById("pendingTable");

    if (!table) {

        console.error("pendingTable not found");

        return;
    }


    table.innerHTML = `
        <tr>
            <td colspan="6" class="loading">
                Loading students...
            </td>
        </tr>
    `;


    // ==================================================
    // GET STUDENTS
    // ==================================================

    const {
        data: studentData,
        error: studentError
    } = await supabase

        .from("profiles")

        .select("id,full_name,mobile,class_name")

        .eq("role", "student");


    if (studentError) {

        console.error("Student Error:", studentError);

        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    Unable to load student data.
                </td>
            </tr>
        `;

        return;
    }


    // ==================================================
    // GET FEES
    // ==================================================

    const {
        data: feeData,
        error: feeError
    } = await supabase

        .from("fees")

        .select("*");


    if (feeError) {

        console.error("Fee Error:", feeError);

        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    Unable to load fee data.
                </td>
            </tr>
        `;

        return;
    }


    students = studentData || [];

    fees = feeData || [];


    // ==================================================
    // FIND STUDENTS WITH PENDING FEES
    // ==================================================

    pendingStudents = students.filter(function(student) {

        const fee = getFee(student.id);

        return Number(fee.due_fee || 0) > 0;

    });


    // ==================================================
    // SORT STUDENTS BY CLASS
    // ==================================================

    pendingStudents.sort(function(a, b) {

        const classA = getClassOrder(a.class_name);

        const classB = getClassOrder(b.class_name);


        // First sort by class

        if (classA !== classB) {

            return classA - classB;

        }


        // If same class, sort by student name

        const nameA =
            String(a.full_name || "")
                .toLowerCase()
                .trim();


        const nameB =
            String(b.full_name || "")
                .toLowerCase()
                .trim();


        return nameA.localeCompare(nameB);

    });


    displayStudents(pendingStudents);

}


// ======================================================
// GET FEE FOR STUDENT
// ======================================================

function getFee(studentId) {

    const fee = fees.find(function(item) {

        return item.student_id === studentId;

    });


    if (fee) {

        return fee;

    }


    return {

        total_fee: 0,

        paid_fee: 0,

        due_fee: 0

    };

}


// ======================================================
// DISPLAY STUDENTS
// ======================================================

function displayStudents(data) {

    const table =
        document.getElementById("pendingTable");


    const count =
        document.getElementById("pendingCount");


    if (!table) {

        return;

    }


    table.innerHTML = "";


    if (count) {

        count.innerText =
            data.length + " students";

    }


    if (data.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    No students with pending fees found.
                </td>
            </tr>
        `;

        return;

    }


    data.forEach(function(student) {

        const fee =
            getFee(student.id);


        const totalFee =
            Number(fee.total_fee || 0);


        const paidFee =
            Number(fee.paid_fee || 0);


        const dueFee =
            Number(fee.due_fee || 0);


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td class="student-name">
                ${escapeHTML(student.full_name || "-")}
            </td>

            <td>
                ${escapeHTML(student.mobile || "-")}
            </td>

            <td>
                ${escapeHTML(student.class_name || "-")}
            </td>

            <td>
                ₹${totalFee.toLocaleString("en-IN")}
            </td>

            <td>
                ₹${paidFee.toLocaleString("en-IN")}
            </td>

            <td class="pending-amount">
                ₹${dueFee.toLocaleString("en-IN")}
            </td>

        `;


        table.appendChild(row);

    });

}


// ======================================================
// SEARCH STUDENTS
// ======================================================

window.filterStudents = function() {

    const searchStudent =
        document.getElementById("searchStudent");


    const searchClass =
        document.getElementById("searchClass");


    const studentSearch =
        searchStudent
            ? searchStudent.value
                .toLowerCase()
                .trim()
            : "";


    const classSearch =
        searchClass
            ? searchClass.value
                .toLowerCase()
                .trim()
            : "";


    const filtered =
        pendingStudents.filter(function(student) {


            const name =
                String(student.full_name || "")
                    .toLowerCase();


            const mobile =
                String(student.mobile || "")
                    .toLowerCase();


            const className =
                String(student.class_name || "")
                    .toLowerCase();


            const studentMatch =
                name.includes(studentSearch) ||
                mobile.includes(studentSearch);


            const classMatch =
                className.includes(classSearch);


            return studentMatch && classMatch;

        });


    displayStudents(filtered);

};


// ======================================================
// CLEAR SEARCH
// ======================================================

window.clearSearch = function() {

    const searchStudent =
        document.getElementById("searchStudent");


    const searchClass =
        document.getElementById("searchClass");


    if (searchStudent) {

        searchStudent.value = "";

    }


    if (searchClass) {

        searchClass.value = "";

    }


    displayStudents(pendingStudents);

};


// ======================================================
// BACK BUTTON
// ======================================================

window.goBack = function() {

    window.location.href =
        "fee_management.html";

};


// ======================================================
// EXPORT PENDING STUDENTS
// ======================================================

window.exportPendingStudents = function() {

    if (pendingStudents.length === 0) {

        alert("No pending fee students to export.");

        return;

    }


    let csv =
        "Student Name,Mobile,Class,Total Fee,Paid,Pending Fee\n";


    pendingStudents.forEach(function(student) {

        const fee =
            getFee(student.id);


        const totalFee =
            Number(fee.total_fee || 0);


        const paidFee =
            Number(fee.paid_fee || 0);


        const dueFee =
            Number(fee.due_fee || 0);


        csv +=
            '"' +
            csvValue(student.full_name) +
            '",' +

            '"' +
            csvValue(student.mobile) +
            '",' +

            '"' +
            csvValue(student.class_name) +
            '",' +

            '"' +
            totalFee +
            '",' +

            '"' +
            paidFee +
            '",' +

            '"' +
            dueFee +
            '"\n';

    });


    // ==================================================
    // CREATE CSV FILE
    // ==================================================

    const blob =
        new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;


    link.download =
        "pending_fee_students.csv";


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);


    URL.revokeObjectURL(url);

};


// ======================================================
// CSV VALUE
// ======================================================

function csvValue(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/"/g, '""');

}


// ======================================================
// HTML SECURITY
// ======================================================

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// ======================================================
// INITIAL LOAD
// ======================================================

loadPendingFees();