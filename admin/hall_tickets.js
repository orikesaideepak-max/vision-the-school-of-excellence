import {
    createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";


// =====================================================
// SUPABASE
// =====================================================

const supabase = createClient(
    "https://gocoupvzzsgouwdkdmzu.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY291cHZ6enNnb3V3ZGtkbXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMDc2MTAsImV4cCI6MjA4NTU4MzYxMH0.XGxBzWLg9etqOo9NVAX5mrli2u-0dwEYGsVgwx4tXaw"
);


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let students = [];

let fees = [];

let selectedTerm = 1;

let selectedExam = "";

let selectedStudents = new Set();


// =====================================================
// A4 SETTINGS
// =====================================================

const PAGE_WIDTH = 297;

const PAGE_HEIGHT = 210;

const TICKET_WIDTH = 142;

const TICKET_HEIGHT = 64.67;

const MARGIN_X = 5;

const MARGIN_Y = 5;

const GAP_X = 3;

const GAP_Y = 3;


// =====================================================
// LOAD DATA
// =====================================================

async function loadHallTicketData() {

    try {

        document.getElementById(
            "loadingMessage"
        ).style.display = "block";


        // ---------------------------------------------
        // LOAD STUDENTS
        // ---------------------------------------------

        const studentResult =
            await supabase
                .from("profiles")
                .select(
                    "id,full_name,mobile,class_name"
                )
                .eq(
                    "role",
                    "student"
                );


        if (studentResult.error) {

            console.error(
                studentResult.error
            );

            alert(
                "Failed to load students."
            );

            return;
        }


        // ---------------------------------------------
        // LOAD FEES
        // ---------------------------------------------

        const feeResult =
            await supabase
                .from("fees")
                .select("*");


        if (feeResult.error) {

            console.error(
                feeResult.error
            );

            alert(
                "Failed to load fees."
            );

            return;
        }


        students =
            studentResult.data || [];


        fees =
            feeResult.data || [];


        displayHallTickets();

    } catch (error) {

        console.error(error);

        alert(
            "Something went wrong."
        );

    } finally {

        document.getElementById(
            "loadingMessage"
        ).style.display = "none";
    }
}


// =====================================================
// GET FEE
// =====================================================

function getFee(studentId) {

    const fee =
        fees.find(
            function(item) {

                return String(
                    item.student_id
                ) === String(
                    studentId
                );
            }
        );


    if (fee) {

        return fee;
    }


    return {
        total_fee: 0,
        paid_fee: 0
    };
}


// =====================================================
// CALCULATE TERMS
// =====================================================

function calculateTerms(
    totalFee,
    paidFee
) {

    totalFee =
        Number(totalFee) || 0;


    paidFee =
        Number(paidFee) || 0;


    // ---------------------------------------------
    // SPLIT TOTAL FEE INTO 3 TERMS
    // ---------------------------------------------

    const term1Total =
        Math.floor(
            totalFee / 3
        );


    const term2Total =
        Math.floor(
            totalFee / 3
        );


    const term3Total =
        totalFee -
        term1Total -
        term2Total;


    // ---------------------------------------------
    // DISTRIBUTE PAID AMOUNT
    // ---------------------------------------------

    let remainingPaid =
        Math.max(
            0,
            paidFee
        );


    const term1Paid =
        Math.min(
            remainingPaid,
            term1Total
        );


    remainingPaid =
        remainingPaid -
        term1Paid;


    const term2Paid =
        Math.min(
            remainingPaid,
            term2Total
        );


    remainingPaid =
        remainingPaid -
        term2Paid;


    const term3Paid =
        Math.min(
            remainingPaid,
            term3Total
        );


    // ---------------------------------------------
    // RETURN TERM DETAILS
    // ---------------------------------------------

    return {

        term1: {

            total: term1Total,

            paid: term1Paid,

            remaining:
                Math.max(
                    0,
                    term1Total -
                    term1Paid
                )
        },


        term2: {

            total: term2Total,

            paid: term2Paid,

            remaining:
                Math.max(
                    0,
                    term2Total -
                    term2Paid
                )
        },


        term3: {

            total: term3Total,

            paid: term3Paid,

            remaining:
                Math.max(
                    0,
                    term3Total -
                    term3Paid
                )
        }

    };
}


// =====================================================
// GET TERM DATA
// =====================================================

function getTermData(student) {

    const fee =
        getFee(student.id);


    const totalFee =
        Number(
            fee.total_fee ||
            fee.total ||
            fee.amount ||
            0
        );


    const paidFee =
        Number(
            fee.paid_fee ||
            fee.paid ||
            fee.amount_paid ||
            0
        );


    const terms =
        calculateTerms(
            totalFee,
            paidFee
        );


    if (selectedTerm === 1) {

        return terms.term1;
    }


    if (selectedTerm === 2) {

        return terms.term2;
    }


    return terms.term3;
}


// =====================================================
// CHECK CLEARED
// =====================================================

function isCleared(student) {

    const termData =
        getTermData(student);


    return Number(
        termData.remaining
    ) <= 0;
}


// =====================================================
// MONEY FORMAT
// =====================================================

function formatMoney(amount) {

    return Number(
        amount || 0
    ).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }
    );
}


// =====================================================
// TERM NAME
// =====================================================

function getTermName(term) {

    if (term === 1) {

        return "1st Term";
    }


    if (term === 2) {

        return "2nd Term";
    }


    return "3rd Term";
}


// =====================================================
// EXAM OPTIONS
// =====================================================

function getExamOptions() {

    if (selectedTerm === 1) {

        return [
            "FA - I",
            "FA - II"
        ];
    }


    if (selectedTerm === 2) {

        return [
            "SA - I",
            "FA - III"
        ];
    }


    return [
        "SA - II",
        "FA - IV"
    ];
}


// =====================================================
// DISPLAY EXAM BUTTONS
// =====================================================

function displayExamButtons() {

    const container =
        document.getElementById(
            "examButtons"
        );


    if (!container) {

        return;
    }


    const options =
        getExamOptions();


    container.innerHTML = "";


    for (
        let i = 0;
        i < options.length;
        i++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.className =
            "exam-button";


        button.textContent =
            options[i];


        if (
            selectedExam ===
            options[i]
        ) {

            button.classList.add(
                "active"
            );
        }


        button.onclick =
            function() {

                selectExam(
                    options[i]
                );
            };


        container.appendChild(
            button
        );
    }


    const selectedExamText =
        document.getElementById(
            "selectedExamText"
        );


    if (selectedExamText) {

        selectedExamText.textContent =
            selectedExam === ""
                ? "Not Selected"
                : selectedExam;
    }


    const examHelp =
        document.getElementById(
            "examHelp"
        );


    if (examHelp) {

        if (selectedExam === "") {

            examHelp.textContent =
                "Select an exam to enable hall-ticket downloads.";

        } else {

            examHelp.textContent =
                "Selected exam: " +
                selectedExam;
        }
    }
}


// =====================================================
// SELECT EXAM
// =====================================================

window.selectExam =
    function(exam) {

        selectedExam = exam;

        selectedStudents.clear();

        displayExamButtons();

        displayHallTickets();
    };


// =====================================================
// GET FILTERED STUDENTS
// =====================================================

function getFilteredStudents() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const classInput =
        document.getElementById(
            "classInput"
        );


    const search =
        String(
            searchInput
                ? searchInput.value
                : ""
        )
        .toLowerCase()
        .trim();


    const classSearch =
        String(
            classInput
                ? classInput.value
                : ""
        )
        .toLowerCase()
        .trim();


    let data =
        students.filter(
            function(student) {

                const name =
                    String(
                        student.full_name ||
                        ""
                    )
                    .toLowerCase();


                const mobile =
                    String(
                        student.mobile ||
                        ""
                    )
                    .toLowerCase();


                const className =
                    String(
                        student.class_name ||
                        ""
                    )
                    .toLowerCase();


                const matchStudent =
                    search === "" ||
                    name.includes(search) ||
                    mobile.includes(search);


                const matchClass =
                    classSearch === "" ||
                    className.includes(
                        classSearch
                    );


                return (
                    matchStudent &&
                    matchClass
                );
            }
        );


    return data;
}


// =====================================================
// CLASS ORDER
// =====================================================

function getClassOrder(
    className
) {

    const value =
        String(
            className || ""
        )
        .toLowerCase()
        .trim();


    if (
        value.includes(
            "nursery"
        )
    ) {

        return 0;
    }


    if (
        value.includes(
            "lkg"
        )
    ) {

        return 1;
    }


    if (
        value.includes(
            "ukg"
        )
    ) {

        return 2;
    }


    const match =
        value.match(
            /[0-9]+/
        );


    if (match) {

        return 2 +
            Number(
                match[0]
            );
    }


    return 999;
}


// =====================================================
// SORT STUDENTS
// =====================================================

function sortStudents(data) {

    return data.sort(
        function(a, b) {

            const classA =
                getClassOrder(
                    a.class_name
                );


            const classB =
                getClassOrder(
                    b.class_name
                );


            if (
                classA !== classB
            ) {

                return (
                    classA -
                    classB
                );
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
}


// =====================================================
// DISPLAY HALL TICKETS
// =====================================================

function displayHallTickets() {

    const container =
        document.getElementById(
            "studentsContainer"
        );


    const emptyMessage =
        document.getElementById(
            "emptyMessage"
        );


    if (!container) {

        return;
    }


    // ---------------------------------------------
    // TERM TEXT
    // ---------------------------------------------

    document.getElementById(
        "selectedTermText"
    ).textContent =
        getTermName(
            selectedTerm
        );


    // ---------------------------------------------
    // FILTER
    // ---------------------------------------------

    let data =
        getFilteredStudents();


    sortStudents(data);


    // ---------------------------------------------
    // STATISTICS
    // ---------------------------------------------

    const total =
        data.length;


    let clearedCount = 0;


    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        if (
            isCleared(
                data[i]
            )
        ) {

            clearedCount++;
        }
    }


    const pendingCount =
        total -
        clearedCount;


    const clearedPercentage =
        total === 0
            ? 0
            : Math.round(
                (
                    clearedCount /
                    total
                ) * 100
            );


    const pendingPercentage =
        total === 0
            ? 0
            : Math.round(
                (
                    pendingCount /
                    total
                ) * 100
            );


    document.getElementById(
        "totalStudents"
    ).textContent =
        total;


    document.getElementById(
        "clearedStudents"
    ).textContent =
        clearedCount;


    document.getElementById(
        "pendingStudents"
    ).textContent =
        pendingCount;


    document.getElementById(
        "clearedPercentage"
    ).textContent =
        clearedPercentage +
        "%";


    document.getElementById(
        "pendingPercentage"
    ).textContent =
        pendingPercentage +
        "%";


    document.getElementById(
        "eligibleCount"
    ).textContent =
        clearedCount;


    // ---------------------------------------------
    // EMPTY
    // ---------------------------------------------

    if (data.length === 0) {

        container.innerHTML = "";

        emptyMessage.style.display =
            "block";

        createSelectionToolbar();

        updateDownloadAllButton();

        return;
    }


    emptyMessage.style.display =
        "none";


    // ---------------------------------------------
    // SELECTION TOOLBAR
    // ---------------------------------------------

    createSelectionToolbar();


    // ---------------------------------------------
    // STUDENT CARDS
    // ---------------------------------------------

    container.innerHTML = "";


    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        const student =
            data[i];


        const cleared =
            isCleared(
                student
            );


        const termData =
            getTermData(
                student
            );


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "student-card";


        if (
            selectedStudents.has(
                String(
                    student.id
                )
            )
        ) {

            card.classList.add(
                "selected"
            );
        }


        // -----------------------------------------
        // CHECKBOX
        // -----------------------------------------

        const checkArea =
            document.createElement(
                "div"
            );


        checkArea.className =
            "student-check-area";


        const checkbox =
            document.createElement(
                "input"
            );


        checkbox.type =
            "checkbox";


        checkbox.className =
            "hall-ticket-checkbox";


        checkbox.checked =
            selectedStudents.has(
                String(
                    student.id
                )
            );


        checkbox.disabled =
            !cleared;


        checkbox.addEventListener(
            "change",
            function() {

                toggleStudentSelection(
                    student.id
                );

                if (
                    checkbox.checked
                ) {

                    card.classList.add(
                        "selected"
                    );

                } else {

                    card.classList.remove(
                        "selected"
                    );
                }
            }
        );


        checkArea.appendChild(
            checkbox
        );


        // -----------------------------------------
        // STUDENT INFO
        // -----------------------------------------

        const info =
            document.createElement(
                "div"
            );


        info.className =
            "student-info";


        const name =
            document.createElement(
                "div"
            );


        name.className =
            "student-name";


        name.textContent =
            student.full_name ||
            "Unknown Student";


        const classText =
            document.createElement(
                "div"
            );


        classText.className =
            "student-details";


        classText.textContent =
            "Class: " +
            (
                student.class_name ||
                "Not Available"
            );


        const mobileText =
            document.createElement(
                "div"
            );


        mobileText.className =
            "student-details";


        mobileText.textContent =
            "Mobile: " +
            (
                student.mobile ||
                "Not Available"
            );


        info.appendChild(
            name
        );


        info.appendChild(
            classText
        );


        info.appendChild(
            mobileText
        );


        // -----------------------------------------
        // STATUS
        // -----------------------------------------

        const status =
            document.createElement(
                "div"
            );


        status.className =
            "student-status";


        if (cleared) {

            status.classList.add(
                "status-cleared"
            );


            status.textContent =
                "✓ Cleared";

        } else {

            status.classList.add(
                "status-pending"
            );


            status.textContent =
                "Pending";
        }


        // -----------------------------------------
        // BALANCE
        // -----------------------------------------

        const balance =
            document.createElement(
                "div"
            );


        if (cleared) {

            balance.className =
                "cleared-balance";


            balance.textContent =
                "Balance: ₹0";

        } else {

            balance.className =
                "pending-balance";


            balance.textContent =
                "Pending: ₹" +
                formatMoney(
                    termData.remaining
                );
        }


        // -----------------------------------------
        // DOWNLOAD BUTTON
        // -----------------------------------------

        const downloadButton =
            document.createElement(
                "button"
            );


        downloadButton.className =
            "student-download-button";


        if (cleared) {

            downloadButton.textContent =
                "📥 Download";


            downloadButton.onclick =
                function() {

                    downloadHallTicket(
                        student.id
                    );
                };

        } else {

            downloadButton.textContent =
                "🔒 Download Disabled";


            downloadButton.disabled =
                true;
        }


        // -----------------------------------------
        // ADD TO CARD
        // -----------------------------------------

        card.appendChild(
            checkArea
        );


        card.appendChild(
            info
        );


        card.appendChild(
            status
        );


        card.appendChild(
            balance
        );


        card.appendChild(
            downloadButton
        );


        container.appendChild(
            card
        );
    }


    updateDownloadAllButton();
}


// =====================================================
// CREATE SELECTION TOOLBAR
// =====================================================

function createSelectionToolbar() {

    const container =
        document.getElementById(
            "studentsContainer"
        );


    if (!container) {

        return;
    }


    const oldToolbar =
        document.getElementById(
            "selectionToolbar"
        );


    if (oldToolbar) {

        oldToolbar.remove();
    }


    const toolbar =
        document.createElement(
            "div"
        );


    toolbar.id =
        "selectionToolbar";


    toolbar.className =
        "selection-toolbar";


    toolbar.innerHTML =
        '<button class="select-all-button" onclick="selectAllVisibleStudents()">☑ Select All</button>' +

        '<button class="clear-selection-button" onclick="clearSelectedStudents()">☐ Clear Selection</button>' +

        '<button class="download-selected-button" onclick="downloadSelectedHallTickets()">📥 Download Selected Hall Tickets</button>' +

        '<span id="selectedCountText">Selected: ' +

        selectedStudents.size +

        '</span>';


    container.parentNode.insertBefore(
        toolbar,
        container
    );
}


// =====================================================
// SELECT ALL
// =====================================================

window.selectAllVisibleStudents =
    function() {

        const data =
            getFilteredStudents();


        for (
            let i = 0;
            i < data.length;
            i++
        ) {

            if (
                isCleared(
                    data[i]
                )
            ) {

                selectedStudents.add(
                    String(
                        data[i].id
                    )
                );
            }
        }


        displayHallTickets();
    };


// =====================================================
// CLEAR SELECTION
// =====================================================

window.clearSelectedStudents =
    function() {

        selectedStudents.clear();

        displayHallTickets();
    };


// =====================================================
// TOGGLE SELECTION
// =====================================================

window.toggleStudentSelection =
    function(studentId) {

        const id =
            String(
                studentId
            );


        if (
            selectedStudents.has(id)
        ) {

            selectedStudents.delete(
                id
            );

        } else {

            selectedStudents.add(
                id
            );
        }


        updateSelectedCount();
    };


// =====================================================
// UPDATE SELECTED COUNT
// =====================================================

function updateSelectedCount() {

    const element =
        document.getElementById(
            "selectedCountText"
        );


    if (element) {

        element.textContent =
            "Selected: " +
            selectedStudents.size;
    }
}


// =====================================================
// SELECT TERM
// =====================================================

window.selectTerm =
    function(termNumber) {

        selectedTerm =
            Number(
                termNumber
            );


        // Reset exam
        selectedExam =
            "";


        // Reset selected students
        selectedStudents.clear();


        // Active button
        const buttons =
            document.querySelectorAll(
                ".term-button"
            );


        buttons.forEach(
            function(button) {

                button.classList.remove(
                    "active"
                );
            }
        );


        const selectedButton =
            document.getElementById(
                "termButton" +
                selectedTerm
            );


        if (selectedButton) {

            selectedButton.classList.add(
                "active"
            );
        }


        displayExamButtons();

        displayHallTickets();
    };


// =====================================================
// SEARCH
// =====================================================

window.filterHallTickets =
    function() {

        displayHallTickets();
    };


// =====================================================
// CLEAR SEARCH
// =====================================================

window.clearSearch =
    function() {

        document.getElementById(
            "searchInput"
        ).value = "";


        document.getElementById(
            "classInput"
        ).value = "";


        displayHallTickets();
    };


// =====================================================
// UPDATE DOWNLOAD ALL BUTTON
// =====================================================

function updateDownloadAllButton() {

    const button =
        document.getElementById(
            "downloadAllButton"
        );


    if (!button) {

        return;
    }


    const data =
        getFilteredStudents();


    let clearedCount = 0;


    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        if (
            isCleared(
                data[i]
            )
        ) {

            clearedCount++;
        }
    }


    if (
        selectedExam !== "" &&
        clearedCount > 0
    ) {

        button.disabled =
            false;

    } else {

        button.disabled =
            true;
    }
}


// =====================================================
// CREATE HALL TICKET
// =====================================================

function createHallTicket(
    student
) {

    const studentName =
        escapeHTML(
            student.full_name ||
            ""
        );


    const className =
        escapeHTML(
            student.class_name ||
            ""
        );


    const exam =
        escapeHTML(
            selectedExam
        );


    let html = "";


    html +=
        '<div class="hall-ticket">';


    // ---------------------------------------------
    // HEADER
    // ---------------------------------------------

    html +=
        '<div class="hall-header">';


    html +=
        '<img class="hall-logo" ' +
        'src="vision_school_logo.png" ' +
        'crossorigin="anonymous" ' +
        'alt="Vision School Logo">';


    html +=
        '<div class="hall-school-name">' +
        'VISION THE SCHOOL OF EXCELLENCE' +
        '</div>';


    html +=
        '<div class="hall-tagline">' +
        '“A NEW ERA OF EDUCATION AWAITS”' +
        '</div>';


    html +=
        '<div class="hall-address">' +
        'Sri ram colony, Jalapally, balapur (M), RR (Dist), Pincode 500005.' +
        '</div>';


    html +=
        '<div class="hall-title-box">' +
        'HALLTICKET' +
        '</div>';


    html +=
        '</div>';


    // ---------------------------------------------
    // BODY
    // ---------------------------------------------

    html +=
        '<div class="hall-body">';


    // NAME

    html +=
        '<div class="hall-name-label">' +
        'Name of the Student :' +
        '</div>';


    html +=
        '<div class="hall-name-value">' +
        studentName +
        '</div>';


    // ROLL

    html +=
        '<div class="hall-roll-label">' +
        'Roll No / VSX ID :' +
        '</div>';


    html +=
        '<div class="hall-roll-value">' +
        '________________' +
        '</div>';


    // EXAM

    html +=
        '<div class="hall-exam">' +
        'Exam : ' +
        exam +
        '</div>';


    // CLASS

    html +=
        '<div class="hall-class-label">' +
        'Class :' +
        '</div>';


    html +=
        '<div class="hall-class-value">' +
        className +
        '</div>';


    // SIGNATURE

    html +=
        '<div class="hall-signature">' +
        'Authorised Signature with Stamp' +
        '</div>';


    html +=
        '</div>';


    html +=
        '</div>';


    return html;
}


// =====================================================
// PREPARE PDF TICKET
// =====================================================

function preparePdfTicket(
    student
) {

    const container =
        document.getElementById(
            "pdfHallTicketContainer"
        );


    container.innerHTML =
        createHallTicket(
            student
        );


    container.style.display =
        "block";


    container.style.width =
        TICKET_WIDTH +
        "mm";


    container.style.height =
        TICKET_HEIGHT +
        "mm";


    const ticket =
        container.querySelector(
            ".hall-ticket"
        );


    ticket.style.width =
        TICKET_WIDTH +
        "mm";


    ticket.style.height =
        TICKET_HEIGHT +
        "mm";


    return ticket;
}


// =====================================================
// DOWNLOAD ONE
// TOP-LEFT POSITION
// =====================================================

window.downloadHallTicket =
    async function(studentId) {

        const student =
            students.find(
                function(item) {

                    return String(
                        item.id
                    ) === String(
                        studentId
                    );
                }
            );


        if (!student) {

            alert(
                "Student not found."
            );

            return;
        }


        // ---------------------------------------------
        // CHECK EXAM
        // ---------------------------------------------

        if (
            selectedExam === ""
        ) {

            alert(
                "Please select an exam first."
            );

            return;
        }


        // ---------------------------------------------
        // CHECK FEE
        // ---------------------------------------------

        if (
            !isCleared(
                student
            )
        ) {

            const termData =
                getTermData(
                    student
                );


            alert(
                "Hall ticket is disabled. Pending balance: ₹" +
                formatMoney(
                    termData.remaining
                )
            );


            return;
        }


        const ticket =
            preparePdfTicket(
                student
            );


        try {

            const canvas =
                await html2canvas(
                    ticket,
                    {
                        scale: 2,

                        useCORS: true,

                        backgroundColor:
                            "#ffffff"
                    }
                );


            const image =
                canvas.toDataURL(
                    "image/png"
                );


            const jsPDF =
                window.jspdf.jsPDF;


            const pdf =
                new jsPDF(
                    "landscape",
                    "mm",
                    "a4"
                );


            // -----------------------------------------
            // IMPORTANT
            // INDIVIDUAL TICKET = FIRST POSITION
            // -----------------------------------------

            pdf.addImage(
                image,
                "PNG",
                MARGIN_X,
                MARGIN_Y,
                TICKET_WIDTH,
                TICKET_HEIGHT
            );


            const studentName =
                String(
                    student.full_name ||
                    "Student"
                )
                .replace(
                    /[^a-zA-Z0-9]/g,
                    "_"
                );


            const examName =
                selectedExam
                .replace(
                    /[^a-zA-Z0-9]/g,
                    "_"
                );


            pdf.save(
                studentName +
                "_" +
                examName +
                "_Hall_Ticket.pdf"
            );


        } catch (error) {

            console.error(
                error
            );


            alert(
                "Failed to create hall ticket."
            );

        } finally {

            clearPdfContainer();
        }
    };


// =====================================================
// DOWNLOAD SELECTED
// =====================================================

window.downloadSelectedHallTickets =
    async function() {

        if (
            selectedExam === ""
        ) {

            alert(
                "Please select an exam first."
            );

            return;
        }


        if (
            selectedStudents.size === 0
        ) {

            alert(
                "Please select at least one student."
            );

            return;
        }


        let data =
            students.filter(
                function(student) {

                    return selectedStudents.has(
                        String(
                            student.id
                        )
                    );
                }
            );


        // ---------------------------------------------
        // ONLY CLEARED
        // ---------------------------------------------

        data =
            data.filter(
                function(student) {

                    return isCleared(
                        student
                    );
                }
            );


        sortStudents(data);


        if (
            data.length === 0
        ) {

            alert(
                "No selected students are eligible."
            );

            return;
        }


        const confirmed =
            confirm(
                "Download " +
                data.length +
                " selected hall tickets for " +
                selectedExam +
                "?"
            );


        if (!confirmed) {

            return;
        }


        const container =
            document.getElementById(
                "pdfHallTicketContainer"
            );


        try {

            const jsPDF =
                window.jspdf.jsPDF;


            const pdf =
                new jsPDF(
                    "landscape",
                    "mm",
                    "a4"
                );


            for (
                let i = 0;
                i < data.length;
                i++
            ) {

                const student =
                    data[i];


                const ticket =
                    preparePdfTicket(
                        student
                    );


                const canvas =
                    await html2canvas(
                        ticket,
                        {
                            scale: 2,

                            useCORS: true,

                            backgroundColor:
                                "#ffffff"
                        }
                    );


                const image =
                    canvas.toDataURL(
                        "image/png"
                    );


                // -----------------------------------------
                // POSITION
                // 2 COLUMNS × 3 ROWS
                // -----------------------------------------

                const position =
                    i % 6;


                const column =
                    position % 2;


                const row =
                    Math.floor(
                        position / 2
                    );


                const x =
                    MARGIN_X +
                    (
                        column *
                        (
                            TICKET_WIDTH +
                            GAP_X
                        )
                    );


                const y =
                    MARGIN_Y +
                    (
                        row *
                        (
                            TICKET_HEIGHT +
                            GAP_Y
                        )
                    );


                pdf.addImage(
                    image,
                    "PNG",
                    x,
                    y,
                    TICKET_WIDTH,
                    TICKET_HEIGHT
                );


                clearPdfContainer();


                // -----------------------------------------
                // NEW A4 PAGE AFTER 6 TICKETS
                // -----------------------------------------

                if (
                    i <
                        data.length - 1 &&
                    position === 5
                ) {

                    pdf.addPage();
                }
            }


            const examName =
                selectedExam
                .replace(
                    /[^a-zA-Z0-9]/g,
                    "_"
                );


            pdf.save(
                getTermName(
                    selectedTerm
                )
                .replace(
                    " ",
                    "_"
                ) +
                "_" +
                examName +
                "_Selected_Hall_Tickets.pdf"
            );


        } catch (error) {

            console.error(
                error
            );


            alert(
                "Failed to create selected hall tickets."
            );

        } finally {

            clearPdfContainer();
        }
    };


// =====================================================
// DOWNLOAD ALL
// =====================================================

window.downloadAllHallTickets =
    async function() {

        if (
            selectedExam === ""
        ) {

            alert(
                "Please select an exam first."
            );

            return;
        }


        let data =
            getFilteredStudents();


        // ---------------------------------------------
        // ONLY CLEARED STUDENTS
        // ---------------------------------------------

        data =
            data.filter(
                function(student) {

                    return isCleared(
                        student
                    );
                }
            );


        sortStudents(data);


        if (
            data.length === 0
        ) {

            alert(
                "No cleared students found."
            );

            return;
        }


        const confirmed =
            confirm(
                "Download " +
                data.length +
                " hall tickets for " +
                selectedExam +
                "?"
            );


        if (!confirmed) {

            return;
        }


        try {

            const jsPDF =
                window.jspdf.jsPDF;


            const pdf =
                new jsPDF(
                    "landscape",
                    "mm",
                    "a4"
                );


            for (
                let i = 0;
                i < data.length;
                i++
            ) {

                const student =
                    data[i];


                const ticket =
                    preparePdfTicket(
                        student
                    );


                const canvas =
                    await html2canvas(
                        ticket,
                        {
                            scale: 2,

                            useCORS: true,

                            backgroundColor:
                                "#ffffff"
                        }
                    );


                const image =
                    canvas.toDataURL(
                        "image/png"
                    );


                // -----------------------------------------
                // 2 COLUMNS
                // 3 ROWS
                // -----------------------------------------

                const position =
                    i % 6;


                const column =
                    position % 2;


                const row =
                    Math.floor(
                        position / 2
                    );


                const x =
                    MARGIN_X +
                    (
                        column *
                        (
                            TICKET_WIDTH +
                            GAP_X
                        )
                    );


                const y =
                    MARGIN_Y +
                    (
                        row *
                        (
                            TICKET_HEIGHT +
                            GAP_Y
                        )
                    );


                pdf.addImage(
                    image,
                    "PNG",
                    x,
                    y,
                    TICKET_WIDTH,
                    TICKET_HEIGHT
                );


                clearPdfContainer();


                // -----------------------------------------
                // NEW PAGE AFTER 6
                // -----------------------------------------

                if (
                    i <
                        data.length - 1 &&
                    position === 5
                ) {

                    pdf.addPage();
                }
            }


            const examName =
                selectedExam
                .replace(
                    /[^a-zA-Z0-9]/g,
                    "_"
                );


            pdf.save(
                getTermName(
                    selectedTerm
                )
                .replace(
                    " ",
                    "_"
                ) +
                "_" +
                examName +
                "_All_Hall_Tickets.pdf"
            );


        } catch (error) {

            console.error(
                error
            );


            alert(
                "Failed to create hall tickets."
            );

        } finally {

            clearPdfContainer();
        }
    };


// =====================================================
// CLEAR PDF CONTAINER
// =====================================================

function clearPdfContainer() {

    const container =
        document.getElementById(
            "pdfHallTicketContainer"
        );


    if (!container) {

        return;
    }


    container.innerHTML =
        "";


    container.style.display =
        "none";
}


// =====================================================
// BACK TO FEE COLLECTION
// =====================================================

window.goBackToFees =
    function() {

        window.location.href =
            "collection_fees.html";
    };


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(
    value
) {

    return String(
        value
    )
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


// =====================================================
// INITIAL LOAD
// =====================================================

displayExamButtons();

loadHallTicketData();