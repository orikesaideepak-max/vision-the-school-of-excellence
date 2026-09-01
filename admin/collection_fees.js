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

let collectionStudents = [];

let charts = [];

let firstTermPieChart = null;
let secondTermPieChart = null;
let thirdTermPieChart = null;


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
// NORMALIZE CLASS
// ======================================================

function normalizeClass(className) {

    return String(className || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "");

}



// ======================================================
// GET CLASS ORDER
// ======================================================

function getClassOrder(className) {

    const value = String(className || "")
        .toLowerCase()
        .trim();

    if (value.includes("nursery")) return 0;
    if (value === "lkg" || value.includes("lkg")) return 1;
    if (value === "ukg" || value.includes("ukg")) return 2;

    if (value.includes("10")) return 12;
    if (value.includes("9")) return 11;
    if (value.includes("8")) return 10;
    if (value.includes("7")) return 9;
    if (value.includes("6")) return 8;
    if (value.includes("5")) return 7;
    if (value.includes("4")) return 6;
    if (value.includes("3")) return 5;
    if (value.includes("2")) return 4;
    if (value.includes("1")) return 3;

    return 999;
}


// ======================================================
// LOAD DATA
// ======================================================

async function loadCollectionData() {

    const container =
        document.getElementById("studentsContainer");


    container.innerHTML = `
        <div class="loading">
            Loading students...
        </div>
    `;


    // ==================================================
    // GET STUDENTS
    // ==================================================

    const {
        data: studentData,
        error: studentError
    } = await supabase

        .from("profiles")

        .select(
            "id,full_name,mobile,class_name"
        )

        .eq("role", "student");


    if (studentError) {

        console.error(
            "Student Error:",
            studentError
        );


        container.innerHTML = `
            <div class="empty-message">
                Unable to load student data.
            </div>
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

        console.error(
            "Fee Error:",
            feeError
        );


        container.innerHTML = `
            <div class="empty-message">
                Unable to load fee data.
            </div>
        `;

        return;

    }


    students =
        studentData || [];


    fees =
        feeData || [];


    // ==================================================
    // STUDENTS WHO HAVE PAID SOMETHING
    // ==================================================

    collectionStudents =
        students.filter(function(student) {

            const fee =
                getFee(student.id);


            return Number(
                fee.paid_fee || 0
            ) > 0;

        });


    // ==================================================
    // SORT BY CLASS
    // ==================================================

    collectionStudents.sort(
        function(a, b) {

            const classA =
                getClassOrder(
                    a.class_name
                );


            const classB =
                getClassOrder(
                    b.class_name
                );


            if (classA !== classB) {

                return classA - classB;

            }


            const nameA =
                String(
                    a.full_name || ""
                )
                .toLowerCase();


            const nameB =
                String(
                    b.full_name || ""
                )
                .toLowerCase();


            return nameA.localeCompare(
                nameB
            );

        }
    );


    updateSummary();
    updateTermPieCharts();
    displayStudents(
        collectionStudents
    );

}


// ======================================================
// GET FEE
// ======================================================

function getFee(studentId) {

    const fee =
        fees.find(function(item) {

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
// CALCULATE THREE TERMS
// ======================================================

function calculateTerms(totalFee, paidFee) {

    /*
        Example:

        Total = 9000

        Term 1 = 3000
        Term 2 = 3000
        Term 3 = 3000
    */


    const term1 =
        Math.floor(totalFee / 3);


    const term2 =
        Math.floor(totalFee / 3);


    const term3 =
        totalFee - term1 - term2;


    let remainingPaid =
        Math.max(0, paidFee);


    // ==================================================
    // TERM 1
    // ==================================================

    const term1Paid =
        Math.min(
            remainingPaid,
            term1
        );


    remainingPaid -=
        term1Paid;


    const term1Remaining =
        term1 - term1Paid;


    // ==================================================
    // TERM 2
    // ==================================================

    const term2Paid =
        Math.min(
            remainingPaid,
            term2
        );


    remainingPaid -=
        term2Paid;


    const term2Remaining =
        term2 - term2Paid;


    // ==================================================
    // TERM 3
    // ==================================================

    const term3Paid =
        Math.min(
            remainingPaid,
            term3
        );


    const term3Remaining =
        term3 - term3Paid;


    return {

        term1: {
            total: term1,
            paid: term1Paid,
            remaining: term1Remaining
        },

        term2: {
            total: term2,
            paid: term2Paid,
            remaining: term2Remaining
        },

        term3: {
            total: term3,
            paid: term3Paid,
            remaining: term3Remaining
        }

    };

}


// ======================================================
// GET CLEARED TERM COUNT
// ======================================================

function getClearedTerms(terms) {

    let count = 0;


    if (terms.term1.remaining <= 0) {

        count++;

    }


    if (terms.term2.remaining <= 0) {

        count++;

    }


    if (terms.term3.remaining <= 0) {

        count++;

    }


    return count;

}


// ======================================================
// UPDATE SUMMARY
// ======================================================

function updateSummary() {

    const totalStudents =
        collectionStudents.length;


    let totalCollection = 0;

    let totalRemaining = 0;

    let totalClearedTerms = 0;


    collectionStudents.forEach(
        function(student) {

            const fee =
                getFee(student.id);


            const total =
                Number(
                    fee.total_fee || 0
                );


            const paid =
                Number(
                    fee.paid_fee || 0
                );


            const due =
                Number(
                    fee.due_fee || 0
                );


            totalCollection += paid;

            totalRemaining += due;


            const terms =
                calculateTerms(
                    total,
                    paid
                );


            totalClearedTerms +=
                getClearedTerms(terms);

        }
    );


    document.getElementById(
        "totalStudents"
    ).innerText =
        totalStudents;


    document.getElementById(
        "totalCollection"
    ).innerText =
        "₹" +
        totalCollection.toLocaleString(
            "en-IN"
        );


    document.getElementById(
        "remainingFee"
    ).innerText =
        "₹" +
        totalRemaining.toLocaleString(
            "en-IN"
        );


    document.getElementById(
        "termsCleared"
    ).innerText =
        totalClearedTerms;

}

function updateTermPieCharts() {

    let firstTermTotal = 0;
    let firstTermPaid = 0;

    let secondTermTotal = 0;
    let secondTermPaid = 0;

    let thirdTermTotal = 0;
    let thirdTermPaid = 0;


    students.forEach(function(student) {

        const fee = getFee(student.id);

        const totalFee =
            Number(fee.total_fee || 0);

        const paidFee =
            Number(fee.paid_fee || 0);

        const terms =
            calculateTerms(
                totalFee,
                paidFee
            );


        firstTermTotal += terms.term1.total;
        firstTermPaid += terms.term1.paid;

        secondTermTotal += terms.term2.total;
        secondTermPaid += terms.term2.paid;

        thirdTermTotal += terms.term3.total;
        thirdTermPaid += terms.term3.paid;

    });


    const firstTermRemaining =
        Math.max(
            0,
            firstTermTotal - firstTermPaid
        );


    const secondTermRemaining =
        Math.max(
            0,
            secondTermTotal - secondTermPaid
        );


    const thirdTermRemaining =
        Math.max(
            0,
            thirdTermTotal - thirdTermPaid
        );


    document.getElementById(
        "firstTermCollected"
    ).innerText =
        "₹" +
        firstTermPaid.toLocaleString("en-IN");


    document.getElementById(
        "firstTermRemaining"
    ).innerText =
        "₹" +
        firstTermRemaining.toLocaleString("en-IN");


    document.getElementById(
        "secondTermCollected"
    ).innerText =
        "₹" +
        secondTermPaid.toLocaleString("en-IN");


    document.getElementById(
        "secondTermRemaining"
    ).innerText =
        "₹" +
        secondTermRemaining.toLocaleString("en-IN");


    document.getElementById(
        "thirdTermCollected"
    ).innerText =
        "₹" +
        thirdTermPaid.toLocaleString("en-IN");


    document.getElementById(
        "thirdTermRemaining"
    ).innerText =
        "₹" +
        thirdTermRemaining.toLocaleString("en-IN");


    createSchoolPieChart(
        "firstTermPie",
        firstTermPaid,
        firstTermRemaining
    );


    createSchoolPieChart(
        "secondTermPie",
        secondTermPaid,
        secondTermRemaining
    );


    createSchoolPieChart(
        "thirdTermPie",
        thirdTermPaid,
        thirdTermRemaining
    );

}
function createSchoolPieChart(
    canvasId,
    paid,
    remaining
) {

    const canvas =
        document.getElementById(canvasId);

    if (!canvas) {
        return;
    }


    let oldChart = null;


    if (canvasId === "firstTermPie") {
        oldChart = firstTermPieChart;
    }

    if (canvasId === "secondTermPie") {
        oldChart = secondTermPieChart;
    }

    if (canvasId === "thirdTermPie") {
        oldChart = thirdTermPieChart;
    }


    if (oldChart) {
        oldChart.destroy();
    }


    const total =
        paid + remaining;


    const chart =
        new Chart(
            canvas,
            {
                type: "pie",

                data: {

                    labels: [
                        "Collected",
                        "Remaining"
                    ],

                    datasets: [

                        {
                            data: [
                                paid,
                                remaining
                            ],

                            borderWidth: 2
                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            position: "bottom"
                        },

                        tooltip: {

                            callbacks: {

                                label: function(context) {

                                    if (total === 0) {

                                        return " No data";

                                    }

                                    const value =
                                        Number(
                                            context.raw
                                        );

                                    const percentage =
                                        (
                                            value /
                                            total
                                        ) * 100;


                                    return (
                                        context.label +
                                        ": ₹" +
                                        value.toLocaleString(
                                            "en-IN"
                                        ) +
                                        " (" +
                                        percentage.toFixed(1) +
                                        "%)"
                                    );

                                }

                            }

                        }

                    }

                }

            }
        );


    if (canvasId === "firstTermPie") {

        firstTermPieChart = chart;

    }


    if (canvasId === "secondTermPie") {

        secondTermPieChart = chart;

    }


    if (canvasId === "thirdTermPie") {

        thirdTermPieChart = chart;

    }

}


// ======================================================
// DISPLAY STUDENTS
// ======================================================

function displayStudents(data) {

    const container =
        document.getElementById(
            "studentsContainer"
        );


    // Destroy old charts

    charts.forEach(function(chart) {

        chart.destroy();

    });


    charts = [];


    container.innerHTML = "";


    document.getElementById(
        "studentCount"
    ).innerText =
        data.length + " students";


    if (data.length === 0) {

        container.innerHTML = `
            <div class="empty-message">
                No students found.
            </div>
        `;

        return;

    }


    data.forEach(
        function(student, studentIndex) {

            const fee =
                getFee(student.id);


            const totalFee =
                Number(
                    fee.total_fee || 0
                );


            const paidFee =
                Number(
                    fee.paid_fee || 0
                );


            const dueFee =
                Number(
                    fee.due_fee || 0
                );


            const terms =
                calculateTerms(
                    totalFee,
                    paidFee
                );


            const clearedTerms =
                getClearedTerms(
                    terms
                );


            const card =
                document.createElement("div");


            card.className =
                "student-card";


            card.innerHTML = `

                <div class="student-header">

                    <div class="student-info">

                        <h2>
                            ${escapeHTML(
                                student.full_name || "-"
                            )}
                        </h2>

                        <p>
                            📱 Mobile:
                            ${escapeHTML(
                                student.mobile || "-"
                            )}
                        </p>

                        <p>
                            🎓 Class:
                            ${escapeHTML(
                                student.class_name || "-"
                            )}
                        </p>

                    </div>


                    <div class="student-summary">

                        <div class="info-box">

                            <span>
                                Total Fee
                            </span>

                            <strong>
                                ₹${totalFee.toLocaleString("en-IN")}
                            </strong>

                        </div>


                        <div class="info-box">

                            <span>
                                Paid
                            </span>

                            <strong>
                                ₹${paidFee.toLocaleString("en-IN")}
                            </strong>

                        </div>


                        <div class="info-box">

                            <span>
                                Remaining
                            </span>

                            <strong>
                                ₹${dueFee.toLocaleString("en-IN")}
                            </strong>

                        </div>


                        <div class="info-box">

                            <span>
                                Terms Cleared
                            </span>

                            <strong>
                                ${clearedTerms}/3
                            </strong>

                        </div>

                    </div>

                </div>


                <div class="terms-container">

                    <div class="term-card">

                        <h3>
                            📘 1st Term
                        </h3>

                        <div
                            class="term-status ${
                                terms.term1.remaining <= 0
                                    ? "cleared"
                                    : "pending"
                            }"
                        >
                            ${
                                terms.term1.remaining <= 0
                                    ? "✓ Cleared"
                                    : "⏳ Pending"
                            }
                        </div>


                        <div class="term-amounts">

                            <div>

                                <span>
                                    Term Fee
                                </span>

                                <strong>
                                    ₹${terms.term1.total.toLocaleString("en-IN")}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Paid
                                </span>

                                <strong>
                                    ₹${terms.term1.paid.toLocaleString("en-IN")}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Remaining
                                </span>

                                <strong>
                                    ₹${terms.term1.remaining.toLocaleString("en-IN")}
                                </strong>

                            </div>

                        </div>


                        <div class="chart-wrapper">

                            <canvas
                                id="term1-${studentIndex}"
                            ></canvas>

                        </div>

                    </div>



                    <div class="term-card">

                        <h3>
                            📗 2nd Term
                        </h3>

                        <div
                            class="term-status ${
                                terms.term2.remaining <= 0
                                    ? "cleared"
                                    : "pending"
                            }"
                        >
                            ${
                                terms.term2.remaining <= 0
                                    ? "✓ Cleared"
                                    : "⏳ Pending"
                            }
                        </div>


                        <div class="term-amounts">

                            <div>

                                <span>
                                    Term Fee
                                </span>

                                <strong>
                                    ₹${terms.term2.total.toLocaleString("en-IN")}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Paid
                                </span>

                                <strong>
                                    ₹${terms.term2.paid.toLocaleString("en-IN")}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Remaining
                                </span>

                                <strong>
                                    ₹${terms.term2.remaining.toLocaleString("en-IN")}
                                </strong>

                            </div>

                        </div>


                        <div class="chart-wrapper">

                            <canvas
                                id="term2-${studentIndex}"
                            ></canvas>

                        </div>

                    </div>



                    <div class="term-card">

                        <h3>
                            📙 3rd Term
                        </h3>

                        <div
                            class="term-status ${
                                terms.term3.remaining <= 0
                                    ? "cleared"
                                    : "pending"
                            }"
                        >
                            ${
                                terms.term3.remaining <= 0
                                    ? "✓ Cleared"
                                    : "⏳ Pending"
                            }
                        </div>


                        <div class="term-amounts">

                            <div>

                                <span>
                                    Term Fee
                                </span>

                                <strong>
                                    ₹${terms.term3.total.toLocaleString("en-IN")}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Paid
                                </span>

                                <strong>
                                    ₹${terms.term3.paid.toLocaleString("en-IN")}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Remaining
                                </span>

                                <strong>
                                    ₹${terms.term3.remaining.toLocaleString("en-IN")}
                                </strong>

                            </div>

                        </div>


                        <div class="chart-wrapper">

                            <canvas
                                id="term3-${studentIndex}"
                            ></canvas>

                        </div>

                    </div>

                </div>

            `;


            container.appendChild(card);


            // ==================================================
            // CREATE CHARTS
            // ==================================================

            createTermChart(
                "term1-" + studentIndex,
                terms.term1
            );


            createTermChart(
                "term2-" + studentIndex,
                terms.term2
            );


            createTermChart(
                "term3-" + studentIndex,
                terms.term3
            );

        }
    );

}


// ======================================================
// CREATE TERM BAR GRAPH
// ======================================================

function createTermChart(canvasId, term) {

    const canvas =
        document.getElementById(canvasId);


    if (!canvas) {

        return;

    }


    const chart =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels: [
                        "Paid",
                        "Remaining"
                    ],

                    datasets: [

                        {
                            label: "Amount",

                            data: [
                                term.paid,
                                term.remaining
                            ],

                            borderWidth: 1
                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                callback: function(value) {

                                    return "₹" +
                                        Number(value)
                                            .toLocaleString(
                                                "en-IN"
                                            );

                                }

                            }

                        }

                    }

                }

            }
        );


    charts.push(chart);

}


// ======================================================
// SEARCH
// ======================================================

window.filterStudents = function() {

    const searchStudent =
        document.getElementById(
            "searchStudent"
        );


    const searchClass =
        document.getElementById(
            "searchClass"
        );


    const studentText =
        searchStudent
            ? searchStudent.value
                .toLowerCase()
                .trim()
            : "";


    const classText =
        searchClass
            ? searchClass.value
                .toLowerCase()
                .trim()
            : "";


    const filtered =
        collectionStudents.filter(
            function(student) {


                const name =
                    String(
                        student.full_name || ""
                    )
                    .toLowerCase();


                const mobile =
                    String(
                        student.mobile || ""
                    )
                    .toLowerCase();


                const className =
                    String(
                        student.class_name || ""
                    )
                    .toLowerCase();


                const studentMatch =
                    name.includes(studentText) ||
                    mobile.includes(studentText);


                const classMatch =
                    className.includes(classText);


                return (
                    studentMatch &&
                    classMatch
                );

            }
        );


    displayStudents(filtered);

};


// ======================================================
// CLEAR SEARCH
// ======================================================

window.clearSearch = function() {

    document.getElementById(
        "searchStudent"
    ).value = "";


    document.getElementById(
        "searchClass"
    ).value = "";


    displayStudents(
        collectionStudents
    );

};


// ======================================================
// EXPORT
// ======================================================

window.exportCollectionStudents =
function() {

    if (
        collectionStudents.length === 0
    ) {

        alert(
            "No collection data to export."
        );

        return;

    }


    let csv =
        "Student Name,Mobile,Class,Total Fee,Paid,Remaining,1st Term,1st Term Paid,1st Term Remaining,2nd Term,2nd Term Paid,2nd Term Remaining,3rd Term,3rd Term Paid,3rd Term Remaining,Terms Cleared\n";


    collectionStudents.forEach(
        function(student) {

            const fee =
                getFee(student.id);


            const totalFee =
                Number(
                    fee.total_fee || 0
                );


            const paidFee =
                Number(
                    fee.paid_fee || 0
                );


            const dueFee =
                Number(
                    fee.due_fee || 0
                );


            const terms =
                calculateTerms(
                    totalFee,
                    paidFee
                );


            const cleared =
                getClearedTerms(
                    terms
                );


            csv +=
                '"' +
                csvValue(
                    student.full_name
                ) +
                '",' +

                '"' +
                csvValue(
                    student.mobile
                ) +
                '",' +

                '"' +
                csvValue(
                    student.class_name
                ) +
                '",' +

                '"' +
                totalFee +
                '",' +

                '"' +
                paidFee +
                '",' +

                '"' +
                dueFee +
                '",' +

                '"' +
                terms.term1.total +
                '",' +

                '"' +
                terms.term1.paid +
                '",' +

                '"' +
                terms.term1.remaining +
                '",' +

                '"' +
                terms.term2.total +
                '",' +

                '"' +
                terms.term2.paid +
                '",' +

                '"' +
                terms.term2.remaining +
                '",' +

                '"' +
                terms.term3.total +
                '",' +

                '"' +
                terms.term3.paid +
                '",' +

                '"' +
                terms.term3.remaining +
                '",' +

                '"' +
                cleared +
                "/3" +
                '"\n';

        }
    );


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;


    link.download =
        "fee_collection_terms.csv";


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
// EXPORT STUDENTS WITH PENDING FEE FOR SPECIFIC TERM
// ======================================================

window.exportTermStudents = function(termNumber) {

    let termName = "";

    if (termNumber === 1) {
        termName = "1st Term";
    }

    else if (termNumber === 2) {
        termName = "2nd Term";
    }

    else if (termNumber === 3) {
        termName = "3rd Term";
    }

    else {
        alert("Invalid term.");
        return;
    }


    // ==================================================
    // FIND STUDENTS WHO HAVE PENDING FEE FOR THIS TERM
    // ==================================================

    const pendingTermStudents =
        students.filter(function(student) {

            const fee =
                getFee(student.id);


            const totalFee =
                Number(
                    fee.total_fee || 0
                );


            const paidFee =
                Number(
                    fee.paid_fee || 0
                );


            const terms =
                calculateTerms(
                    totalFee,
                    paidFee
                );


            let term;


            if (termNumber === 1) {
                term = terms.term1;
            }

            else if (termNumber === 2) {
                term = terms.term2;
            }

            else {
                term = terms.term3;
            }


            return Number(
                term.remaining || 0
            ) > 0;

        });


    // ==================================================
    // NO STUDENTS
    // ==================================================

    if (pendingTermStudents.length === 0) {

        alert(
            "No students have pending fees for " +
            termName +
            "."
        );

        return;

    }



// ======================================================
// SORT BY CLASS - NURSERY TO 10TH
// ======================================================

pendingTermStudents.sort(function(a, b) {

    const classA = normalizeClass(a.class_name);
    const classB = normalizeClass(b.class_name);

    const orderA = getClassOrder(classA);
    const orderB = getClassOrder(classB);

    // Different classes
    if (orderA !== orderB) {
        return orderA - orderB;
    }

    // Same class → alphabetical student name
    const nameA = String(a.full_name || "")
        .toLowerCase()
        .trim();

    const nameB = String(b.full_name || "")
        .toLowerCase()
        .trim();

    return nameA.localeCompare(nameB);

});

    // ==================================================
    // CSV HEADER
    // ==================================================

    let csv =
        "Student,Mobile,Class,Total Fee,Paid,Pending\n";


    // ==================================================
    // ADD STUDENTS
    // ==================================================

    pendingTermStudents.forEach(
        function(student) {

            const fee =
                getFee(student.id);


            const totalFee =
                Number(
                    fee.total_fee || 0
                );


            const paidFee =
                Number(
                    fee.paid_fee || 0
                );


            const terms =
                calculateTerms(
                    totalFee,
                    paidFee
                );


            let term;


            if (termNumber === 1) {

                term = terms.term1;

            }

            else if (termNumber === 2) {

                term = terms.term2;

            }

            else {

                term = terms.term3;

            }


            // ------------------------------------------
            // ADD ROW
            // ------------------------------------------

            csv +=
                '"' +
                csvValue(
                    student.full_name
                ) +
                '",' +

                '"' +
                csvValue(
                    student.mobile
                ) +
                '",' +

                '"' +
                csvValue(
                    student.class_name
                ) +
                '",' +

                '"' +
                term.total +
                '",' +

                '"' +
                term.paid +
                '",' +

                '"' +
                term.remaining +
                '"\n';

        }
    );


    // ==================================================
    // CREATE CSV
    // ==================================================

    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;


    // ==================================================
    // FILE NAME
    // ==================================================

    let fileName = "";


    if (termNumber === 1) {

        fileName =
            "1st_term_pending_students.csv";

    }

    else if (termNumber === 2) {

        fileName =
            "2nd_term_pending_students.csv";

    }

    else {

        fileName =
            "3rd_term_pending_students.csv";

    }


    link.download = fileName;


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);


    URL.revokeObjectURL(url);

};

// ======================================================
// HTML SECURITY
// ======================================================

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ======================================================
// BACK BUTTON
// ======================================================

window.goBack = function() {

    window.location.href =
        "fee_management.html";

};


// ======================================================
// INITIAL LOAD
// ======================================================

loadCollectionData();