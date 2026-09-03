import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";


const SUPABASE_URL =
    "https://gocoupvzzsgouwdkdmzu.supabase.co";


const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY291cHZ6enNnb3V3ZGtkbXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMDc2MTAsImV4cCI6MjA4NTU4MzYxMH0.XGxBzWLg9etqOo9NVAX5mrli2u-0dwEYGsVgwx4tXaw";


const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


let students = [];
let fees = [];
let busStudents = [];
let filteredBusStudents = [];

let busFeeChart = null;


/* =========================================================
   CLASS ORDER
========================================================= */

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


function normalizeClass(className) {

    return String(className || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "");

}


function getClassOrder(className) {

    const normalized = normalizeClass(className);

    const index =
        classOrder.indexOf(normalized);

    return index === -1 ? 999 : index;

}


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        document
            .getElementById("busStudentForm")
            .addEventListener(
                "submit",
                saveBusFee
            );


        document
            .getElementById("studentSelect")
            .addEventListener(
                "change",
                studentSelected
            );


        document
            .getElementById("busFee")
            .addEventListener(
                "input",
                calculatePending
            );


        document
            .getElementById("busPaidFee")
            .addEventListener(
                "input",
                calculatePending
            );


        loadData();

    }
);


/* =========================================================
   LOAD STUDENTS + FEES
========================================================= */

async function loadData() {

    try {

        const studentsResult =
            await supabase
                .from("profiles")
                .select(
                    "id, full_name, mobile, class_name"
                )
                .eq("role", "student");


        if (studentsResult.error) {
            throw studentsResult.error;
        }


        const feesResult =
            await supabase
                .from("fees")
                .select("*");


        if (feesResult.error) {
            throw feesResult.error;
        }


        students =
            studentsResult.data || [];


        fees =
            feesResult.data || [];


        buildBusStudents();

        populateStudentDropdown();

        updatePage();

    } catch (error) {

        console.error(
            "Error loading bus fee data:",
            error
        );


        alert(
            "Unable to load bus fee data.\n\n" +
            error.message
        );

    }

}


/* =========================================================
   BUILD BUS STUDENTS
========================================================= */

function buildBusStudents() {

    busStudents =
        students
            .map(function (student) {

                const fee =
                    fees.find(function (item) {

                        return item.student_id === student.id;

                    });


                if (!fee) {
                    return null;
                }


                const busFee =
                    Number(fee.bus_fee || 0);


                const busPaid =
                    Number(fee.bus_paid_fee || 0);


                const busDue =
                    Number(
                        fee.bus_due_fee ??
                        Math.max(
                            0,
                            busFee - busPaid
                        )
                    );


                /*
                 * A student is considered a bus student
                 * if bus fee or bus route or bus number
                 * has been entered.
                 */

                const isBusStudent =
                    busFee > 0 ||
                    busPaid > 0 ||
                    busDue > 0 ||
                    Boolean(fee.bus_route) ||
                    Boolean(fee.bus_number);


                if (!isBusStudent) {
                    return null;
                }


                return {

                    id: fee.id,

                    student_id:
                        student.id,

                    full_name:
                        student.full_name || "",

                    mobile:
                        student.mobile || "",

                    class_name:
                        student.class_name || "",

                    bus_route:
                        fee.bus_route || "",

                    bus_number:
                        fee.bus_number || "",

                    bus_fee:
                        busFee,

                    bus_paid_fee:
                        busPaid,

                    bus_due_fee:
                        busDue

                };

            })
            .filter(Boolean);


    sortBusStudents();

}


/* =========================================================
   SORT BUS STUDENTS
========================================================= */

function sortBusStudents() {

    busStudents.sort(function (a, b) {

        const classA =
            getClassOrder(a.class_name);


        const classB =
            getClassOrder(b.class_name);


        if (classA !== classB) {
            return classA - classB;
        }


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

}


/* =========================================================
   STUDENT DROPDOWN
========================================================= */

function populateStudentDropdown() {

    const select =
        document.getElementById(
            "studentSelect"
        );


    select.innerHTML =
        `<option value="">Select Student</option>`;


    const sortedStudents =
        [...students].sort(function (a, b) {

            const classA =
                getClassOrder(a.class_name);


            const classB =
                getClassOrder(b.class_name);


            if (classA !== classB) {
                return classA - classB;
            }


            return String(
                a.full_name || ""
            ).localeCompare(
                String(b.full_name || "")
            );

        });


    sortedStudents.forEach(function (student) {

        const alreadyAdded =
            busStudents.some(function (item) {

                return item.student_id === student.id;

            });


        const option =
            document.createElement("option");


        option.value =
            student.id;


        option.textContent =
            `${student.full_name || "Unnamed"} - ` +
            `${student.class_name || ""}` +
            (alreadyAdded
                ? " (Bus Student)"
                : "");


        select.appendChild(option);

    });

}


/* =========================================================
   STUDENT SELECTED
========================================================= */

function studentSelected() {

    const studentId =
        document.getElementById(
            "studentSelect"
        ).value;


    if (!studentId) {

        document.getElementById(
            "studentClass"
        ).value = "";


        document.getElementById(
            "studentMobile"
        ).value = "";


        return;

    }


    const student =
        students.find(function (item) {

            return item.id === studentId;

        });


    if (!student) {
        return;
    }


    document.getElementById(
        "studentClass"
    ).value =
        student.class_name || "";


    document.getElementById(
        "studentMobile"
    ).value =
        student.mobile || "";


    const existing =
        busStudents.find(function (item) {

            return item.student_id === studentId;

        });


    if (existing) {

        document.getElementById(
            "busRoute"
        ).value =
            existing.bus_route;


        document.getElementById(
            "busNumber"
        ).value =
            existing.bus_number;


        document.getElementById(
            "busFee"
        ).value =
            existing.bus_fee;


        document.getElementById(
            "busPaidFee"
        ).value =
            existing.bus_paid_fee;


        document.getElementById(
            "busDueFee"
        ).value =
            existing.bus_due_fee;

    }

}


/* =========================================================
   UPDATE PAGE
========================================================= */

function updatePage() {

    filteredBusStudents =
        [...busStudents];


    updateSummary();

    displayBusStudents(
        filteredBusStudents
    );

    updateChart();

}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary() {

    let totalFee = 0;

    let totalCollected = 0;

    let totalPending = 0;


    busStudents.forEach(function (student) {

        totalFee +=
            Number(student.bus_fee || 0);


        totalCollected +=
            Number(
                student.bus_paid_fee || 0
            );


        totalPending +=
            Number(
                student.bus_due_fee || 0
            );

    });


    document.getElementById(
        "totalBusStudents"
    ).textContent =
        busStudents.length;


    document.getElementById(
        "totalBusFee"
    ).textContent =
        "₹" + formatNumber(totalFee);


    document.getElementById(
        "totalCollected"
    ).textContent =
        "₹" + formatNumber(
            totalCollected
        );


    document.getElementById(
        "totalPending"
    ).textContent =
        "₹" + formatNumber(
            totalPending
        );

}


/* =========================================================
   CALCULATE PENDING
========================================================= */

function calculatePending() {

    const total =
        Number(
            document.getElementById(
                "busFee"
            ).value || 0
        );


    const paid =
        Number(
            document.getElementById(
                "busPaidFee"
            ).value || 0
        );


    let pending =
        total - paid;


    if (pending < 0) {
        pending = 0;
    }


    document.getElementById(
        "busDueFee"
    ).value =
        pending.toFixed(2);

}


/* =========================================================
   SAVE BUS FEE
========================================================= */

async function saveBusFee(event) {

    event.preventDefault();


    const studentId =
        document.getElementById(
            "studentSelect"
        ).value;


    const busRoute =
        document.getElementById(
            "busRoute"
        ).value.trim();


    const busNumber =
        document.getElementById(
            "busNumber"
        ).value.trim();


    const busFee =
        Number(
            document.getElementById(
                "busFee"
            ).value || 0
        );


    const busPaidFee =
        Number(
            document.getElementById(
                "busPaidFee"
            ).value || 0
        );


    let busDueFee =
        busFee - busPaidFee;


    if (busDueFee < 0) {
        busDueFee = 0;
    }


    if (!studentId) {

        alert(
            "Please select a student."
        );

        return;

    }


    if (busPaidFee > busFee) {

        alert(
            "Paid bus fee cannot be greater than total bus fee."
        );

        return;

    }


    const existingFee =
        fees.find(function (fee) {

            return fee.student_id === studentId;

        });


    if (!existingFee) {

        alert(
            "Fee record not found for this student."
        );

        return;

    }


    const data = {

        bus_fee: busFee,

        bus_paid_fee: busPaidFee,

        bus_due_fee: busDueFee,

        bus_route: busRoute,

        bus_number: busNumber

    };


    try {

        const result =
            await supabase
                .from("fees")
                .update(data)
                .eq(
                    "student_id",
                    studentId
                );


        if (result.error) {
            throw result.error;
        }


        alert(
            "Bus fee saved successfully."
        );


        resetForm();

        await loadData();

    } catch (error) {

        console.error(
            "Save error:",
            error
        );


        alert(
            "Unable to save bus fee.\n\n" +
            error.message
        );

    }

}


/* =========================================================
   EDIT
========================================================= */

window.editBusStudent =
    function (id) {

        const busStudent =
            busStudents.find(function (item) {

                return String(item.id) ===
                    String(id);

            });


        if (!busStudent) {
            return;
        }


        document.getElementById(
            "editingStudentId"
        ).value =
            busStudent.student_id;


        document.getElementById(
            "studentSelect"
        ).value =
            busStudent.student_id;


        studentSelected();


        document.getElementById(
            "busRoute"
        ).value =
            busStudent.bus_route;


        document.getElementById(
            "busNumber"
        ).value =
            busStudent.bus_number;


        document.getElementById(
            "busFee"
        ).value =
            busStudent.bus_fee;


        document.getElementById(
            "busPaidFee"
        ).value =
            busStudent.bus_paid_fee;


        document.getElementById(
            "busDueFee"
        ).value =
            busStudent.bus_due_fee;


        document.getElementById(
            "formTitle"
        ).textContent =
            "✏️ Edit Bus Student";


        document.querySelector(
            ".save-btn"
        ).textContent =
            "💾 Update Bus Fee";


        document.getElementById(
            "cancelEditBtn"
        ).style.display =
            "inline-block";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };


/* =========================================================
   RESET FORM
========================================================= */

function resetForm() {

    document.getElementById(
        "busStudentForm"
    ).reset();


    document.getElementById(
        "editingStudentId"
    ).value = "";


    document.getElementById(
        "studentClass"
    ).value = "";


    document.getElementById(
        "studentMobile"
    ).value = "";


    document.getElementById(
        "busDueFee"
    ).value = "0";


    document.getElementById(
        "formTitle"
    ).textContent =
        "➕ Add Bus Student";


    document.querySelector(
        ".save-btn"
    ).textContent =
        "💾 Save Bus Fee";


    document.getElementById(
        "cancelEditBtn"
    ).style.display =
        "none";

}


window.cancelEdit =
    function () {

        resetForm();

    };


/* =========================================================
   DELETE BUS DETAILS
========================================================= */

window.deleteBusStudent =
    async function (id) {

        const student =
            busStudents.find(function (item) {

                return String(item.id) ===
                    String(id);

            });


        if (!student) {
            return;
        }


        const confirmed =
            confirm(
                `Remove ${student.full_name} from bus management?`
            );


        if (!confirmed) {
            return;
        }


        try {

            /*
             * We don't delete the student's
             * entire fees row.
             *
             * We only clear bus-related columns.
             */

            const result =
                await supabase
                    .from("fees")
                    .update({

                        bus_fee: 0,

                        bus_paid_fee: 0,

                        bus_due_fee: 0,

                        bus_route: null,

                        bus_number: null

                    })
                    .eq(
                        "student_id",
                        student.student_id
                    );


            if (result.error) {
                throw result.error;
            }


            alert(
                "Student removed from bus management."
            );


            await loadData();

        } catch (error) {

            console.error(
                "Delete error:",
                error
            );


            alert(
                "Unable to remove bus student.\n\n" +
                error.message
            );

        }

    };


/* =========================================================
   DISPLAY
========================================================= */

function displayBusStudents(data) {

    const table =
        document.getElementById(
            "busStudentsTable"
        );


    if (!data.length) {

        table.innerHTML = `
            <tr>
                <td colspan="11" class="no-data">
                    No bus students found.
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML = "";


    data.forEach(function (student) {

        const pending =
            Number(
                student.bus_due_fee || 0
            );


        const status =
            pending > 0

                ? `<span class="status status-pending">
                    Pending
                   </span>`

                : `<span class="status status-paid">
                    Paid
                   </span>`;


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <input
                    type="checkbox"
                    class="student-checkbox"
                    data-id="${student.id}"
                >
            </td>


            <td class="student-name">
                ${escapeHTML(
                    student.full_name
                )}
            </td>


            <td>
                ${escapeHTML(
                    student.mobile || "-"
                )}
            </td>


            <td>
                ${escapeHTML(
                    student.class_name || "-"
                )}
            </td>


            <td>
                ${escapeHTML(
                    student.bus_route || "-"
                )}
            </td>


            <td>
                ${escapeHTML(
                    student.bus_number || "-"
                )}
            </td>


            <td>
                ₹${formatNumber(
                    student.bus_fee
                )}
            </td>


            <td class="paid-amount">
                ₹${formatNumber(
                    student.bus_paid_fee
                )}
            </td>


            <td class="pending-amount">
                ₹${formatNumber(
                    student.bus_due_fee
                )}
            </td>


            <td>
                ${status}
            </td>


            <td>

                <div class="action-buttons">

                    <button
                        class="edit-btn"
                        onclick="editBusStudent('${student.id}')"
                        title="Edit"
                    >
                        ✏️
                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteBusStudent('${student.id}')"
                        title="Remove"
                    >
                        🗑️
                    </button>


                    <button
                        class="whatsapp-small-btn"
                        onclick="sendWhatsApp('${student.id}')"
                        title="WhatsApp"
                    >
                        💬
                    </button>


                    <button
                        class="sms-small-btn"
                        onclick="sendSMS('${student.id}')"
                        title="SMS"
                    >
                        📱
                    </button>

                </div>

            </td>

        `;


        table.appendChild(row);

    });


    updateSelectAllState();

}


/* =========================================================
   SEARCH
========================================================= */

window.filterStudents =
    function () {

        const search =
            document.getElementById(
                "searchInput"
            )
            .value
            .toLowerCase()
            .trim();


        if (!search) {

            filteredBusStudents =
                [...busStudents];

            displayBusStudents(
                filteredBusStudents
            );

            return;

        }


        filteredBusStudents =
            busStudents.filter(
                function (student) {

                    const values = [

                        student.full_name,

                        student.mobile,

                        student.class_name,

                        student.bus_route,

                        student.bus_number

                    ];


                    return values.some(
                        function (value) {

                            return String(
                                value || ""
                            )
                            .toLowerCase()
                            .includes(search);

                        }
                    );

                }
            );


        displayBusStudents(
            filteredBusStudents
        );

    };


window.clearSearch =
    function () {

        document.getElementById(
            "searchInput"
        ).value = "";


        filteredBusStudents =
            [...busStudents];


        displayBusStudents(
            filteredBusStudents
        );

    };


/* =========================================================
   SELECT ALL
========================================================= */

window.toggleSelectAll =
    function () {

        const selectAll =
            document.getElementById(
                "selectAll"
            );


        const checkboxes =
            document.querySelectorAll(
                ".student-checkbox"
            );


        checkboxes.forEach(
            function (checkbox) {

                checkbox.checked =
                    selectAll.checked;

            }
        );

    };


function updateSelectAllState() {

    const selectAll =
        document.getElementById(
            "selectAll"
        );


    const checkboxes =
        document.querySelectorAll(
            ".student-checkbox"
        );


    if (!checkboxes.length) {

        selectAll.checked = false;

        return;

    }


    const checked =
        document.querySelectorAll(
            ".student-checkbox:checked"
        );


    selectAll.checked =
        checked.length ===
        checkboxes.length;

}


/* =========================================================
   GET SELECTED
========================================================= */

function getSelectedStudents() {

    const checkboxes =
        document.querySelectorAll(
            ".student-checkbox:checked"
        );


    const ids =
        Array.from(checkboxes)
            .map(function (checkbox) {

                return checkbox.dataset.id;

            });


    return busStudents.filter(
        function (student) {

            return ids.includes(
                String(student.id)
            );

        }
    );

}


/* =========================================================
   MESSAGE
========================================================= */

function createMessage(student) {

    return (
        `Hello ${student.full_name},\n\n` +

        `This is a reminder regarding your school bus fee.\n\n` +

        `Bus Route: ${student.bus_route || "-"}\n` +

        `Bus Number: ${student.bus_number || "-"}\n` +

        `Total Bus Fee: ₹${formatNumber(student.bus_fee)}\n` +

        `Paid Bus Fee: ₹${formatNumber(student.bus_paid_fee)}\n` +

        `Pending Bus Fee: ₹${formatNumber(student.bus_due_fee)}\n\n` +

        `Please clear the pending bus fee at the earliest.\n\n` +

        `Thank you.`
    );

}


/* =========================================================
   WHATSAPP SINGLE
========================================================= */

window.sendWhatsApp =
    function (id) {

        const student =
            busStudents.find(
                function (item) {

                    return String(item.id) ===
                        String(id);

                }
            );


        if (!student) {
            return;
        }


        if (!student.mobile) {

            alert(
                "Mobile number is not available."
            );

            return;

        }


        const phone =
            cleanPhoneNumber(
                student.mobile
            );


        if (!phone) {

            alert(
                "Invalid mobile number."
            );

            return;

        }


        const message =
            encodeURIComponent(
                createMessage(student)
            );


        window.open(
            `https://wa.me/91${phone}?text=${message}`,
            "_blank"
        );

    };


/* =========================================================
   WHATSAPP SELECTED
========================================================= */

window.sendWhatsAppSelected =
    function () {

        const selected =
            getSelectedStudents();


        if (!selected.length) {

            alert(
                "Please select at least one student."
            );

            return;

        }


        let count = 0;


        selected.forEach(
            function (student, index) {

                if (!student.mobile) {
                    return;
                }


                const phone =
                    cleanPhoneNumber(
                        student.mobile
                    );


                if (!phone) {
                    return;
                }


                const message =
                    encodeURIComponent(
                        createMessage(student)
                    );


                setTimeout(
                    function () {

                        window.open(
                            `https://wa.me/91${phone}?text=${message}`,
                            "_blank"
                        );

                    },
                    index * 800
                );


                count++;

            }
        );


        alert(
            `${count} WhatsApp message(s) prepared.\n\n` +
            `Review and send each message from WhatsApp.`
        );

    };


/* =========================================================
   SMS SINGLE
========================================================= */

window.sendSMS =
    function (id) {

        const student =
            busStudents.find(
                function (item) {

                    return String(item.id) ===
                        String(id);

                }
            );


        if (!student) {
            return;
        }


        if (!student.mobile) {

            alert(
                "Mobile number is not available."
            );

            return;

        }


        const phone =
            cleanPhoneNumber(
                student.mobile
            );


        const message =
            encodeURIComponent(
                createMessage(student)
            );


        window.location.href =
            `sms:${phone}?body=${message}`;

    };


/* =========================================================
   SMS SELECTED
========================================================= */

window.sendSMSSelected =
    function () {

        const selected =
            getSelectedStudents();


        if (!selected.length) {

            alert(
                "Please select at least one student."
            );

            return;

        }


        const validStudents =
            selected.filter(
                function (student) {

                    return Boolean(
                        student.mobile
                    );

                }
            );


        if (!validStudents.length) {

            alert(
                "Selected students do not have mobile numbers."
            );

            return;

        }


        if (validStudents.length === 1) {

            sendSMS(
                validStudents[0].id
            );

            return;

        }


        alert(
            "Multiple SMS messages cannot be silently sent by a normal browser.\n\n" +
            "The SMS composer will need to be opened for each selected student."
        );


        validStudents.forEach(
            function (student, index) {

                const phone =
                    cleanPhoneNumber(
                        student.mobile
                    );


                const message =
                    encodeURIComponent(
                        createMessage(student)
                    );


                setTimeout(
                    function () {

                        window.open(
                            `sms:${phone}?body=${message}`,
                            "_blank"
                        );

                    },
                    index * 1000
                );

            }
        );

    };


/* =========================================================
   EXPORT PENDING
========================================================= */

window.exportPendingStudents =
    function () {

        let pendingStudents =
            busStudents.filter(
                function (student) {

                    return Number(
                        student.bus_due_fee || 0
                    ) > 0;

                }
            );


        pendingStudents.sort(
            function (a, b) {

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


                return String(
                    a.full_name || ""
                )
                .toLowerCase()
                .localeCompare(
                    String(
                        b.full_name || ""
                    )
                    .toLowerCase()
                );

            }
        );


        if (!pendingStudents.length) {

            alert(
                "No pending bus fees found."
            );

            return;

        }


        const rows = [];


        rows.push([
            "Student",
            "Mobile",
            "Class",
            "Bus Route",
            "Bus Number",
            "Total Fee",
            "Paid",
            "Pending"
        ]);


        pendingStudents.forEach(
            function (student) {

                rows.push([

                    student.full_name,

                    student.mobile,

                    student.class_name,

                    student.bus_route,

                    student.bus_number,

                    student.bus_fee,

                    student.bus_paid_fee,

                    student.bus_due_fee

                ]);

            }
        );


        const csv =
            rows
                .map(function (row) {

                    return row
                        .map(csvValue)
                        .join(",");

                })
                .join("\n");


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
            "bus_pending_students.csv";


        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

    };


/* =========================================================
   CHART
========================================================= */

function updateChart() {

    let totalCollected = 0;

    let totalPending = 0;


    busStudents.forEach(
        function (student) {

            totalCollected +=
                Number(
                    student.bus_paid_fee || 0
                );


            totalPending +=
                Number(
                    student.bus_due_fee || 0
                );

        }
    );


    const canvas =
        document.getElementById(
            "busFeeChart"
        );


    if (busFeeChart) {

        busFeeChart.destroy();

    }


    busFeeChart =
        new Chart(
            canvas,
            {

                type: "pie",

                data: {

                    labels: [
                        "Collected",
                        "Pending"
                    ],

                    datasets: [
                        {
                            data: [
                                totalCollected,
                                totalPending
                            ]
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

                                label:
                                    function (
                                        context
                                    ) {

                                        const value =
                                            Number(
                                                context.raw || 0
                                            );


                                        return (
                                            " ₹" +
                                            formatNumber(
                                                value
                                            )
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   HELPERS
========================================================= */

function formatNumber(number) {

    return Number(
        number || 0
    ).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );

}


function cleanPhoneNumber(number) {

    let phone =
        String(number || "")
            .replace(/\D/g, "");


    if (phone.startsWith("91") &&
        phone.length === 12) {

        phone =
            phone.substring(2);

    }


    if (phone.length !== 10) {
        return "";
    }


    return phone;

}


function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function csvValue(value) {

    const text =
        String(value ?? "");


    return `"${text.replace(
        /"/g,
        '""'
    )}"`;

}


/* =========================================================
   BACK
========================================================= */

window.goBack =
    function () {

        window.location.href =
            "fee_management.html";

    };