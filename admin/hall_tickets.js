import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";


// =====================================================
// SUPABASE
// =====================================================

const supabase = createClient(
    "https://gocoupvzzsgouwdkdmzu.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY291cHZ6enNnb3V3ZGtkbXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMDc2MTAsImV4cCI6MjA4NTU4MzYxMH0.XGxBzWLg9etqOo9NVAX5mrli2u-0dwEYGsVgwx4tXaw"
);


// =====================================================
// VARIABLES
// =====================================================

let students = [];

let fees = [];

let selectedTerm = 1;

let selectedExam = "";


// =====================================================
// EXAM OPTIONS
// =====================================================

const examOptions = {

    1: [
        "FA - I",
        "FA - II"
    ],

    2: [
        "SA - I",
        "FA - III"
    ],

    3: [
        "SA - II",
        "FA - IV"
    ]

};


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


        // ---------------------------------------------
        // INITIAL DISPLAY
        // ---------------------------------------------

        createExamButtons();

        updateStatistics();

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

    for (
        let i = 0;
        i < fees.length;
        i++
    ) {

        if (
            fees[i].student_id === studentId
        ) {

            return fees[i];
        }
    }


    return null;
}


// =====================================================
// CALCULATE THREE TERMS
// SAME LOGIC AS FEE COLLECTION
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
    // DIVIDE TOTAL FEE INTO 3 TERMS
    // ---------------------------------------------

    const term1 =
        Math.floor(
            totalFee / 3
        );


    const term2 =
        Math.floor(
            totalFee / 3
        );


    const term3 =
        totalFee -
        term1 -
        term2;


    let remainingPaid =
        Math.max(
            0,
            paidFee
        );


    // ---------------------------------------------
    // TERM 1
    // ---------------------------------------------

    const term1Paid =
        Math.min(
            remainingPaid,
            term1
        );


    remainingPaid -=
        term1Paid;


    const term1Remaining =
        term1 -
        term1Paid;


    // ---------------------------------------------
    // TERM 2
    // ---------------------------------------------

    const term2Paid =
        Math.min(
            remainingPaid,
            term2
        );


    remainingPaid -=
        term2Paid;


    const term2Remaining =
        term2 -
        term2Paid;


    // ---------------------------------------------
    // TERM 3
    // ---------------------------------------------

    const term3Paid =
        Math.min(
            remainingPaid,
            term3
        );


    const term3Remaining =
        term3 -
        term3Paid;


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


// =====================================================
// GET SELECTED TERM DATA
// =====================================================

function getTermData(student) {

    const fee =
        getFee(student.id);


    if (!fee) {

        return {

            total: 0,

            paid: 0,

            remaining: 0

        };
    }


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


    if (selectedTerm === 1) {

        return terms.term1;
    }


    if (selectedTerm === 2) {

        return terms.term2;
    }


    return terms.term3;
}


// =====================================================
// IS CLEARED
// =====================================================

function isCleared(student) {

    const termData =
        getTermData(student);


    return (
        termData.remaining <= 0
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
// GET EXAM OPTIONS
// =====================================================

function getCurrentExamOptions() {

    return examOptions[
        selectedTerm
    ];
}


// =====================================================
// CREATE EXAM BUTTONS
// =====================================================

function createExamButtons() {

    const container =
        document.getElementById(
            "examButtons"
        );


    container.innerHTML = "";


    const options =
        getCurrentExamOptions();


    selectedExam = "";


    document.getElementById(
        "selectedExamText"
    ).textContent =
        "Not Selected";


    for (
        let i = 0;
        i < options.length;
        i++
    ) {

        const exam =
            options[i];


        const button =
            document.createElement(
                "button"
            );


        button.className =
            "exam-button";


        button.textContent =
            exam;


        button.onclick =
            function() {

                selectExam(exam);
            };


        container.appendChild(
            button
        );
    }


    updateDownloadAllButton();
}


// =====================================================
// SELECT EXAM
// =====================================================

window.selectExam = function(exam) {

    selectedExam =
        exam;


    const buttons =
        document.querySelectorAll(
            ".exam-button"
        );


    for (
        let i = 0;
        i < buttons.length;
        i++
    ) {

        buttons[i].classList.remove(
            "active"
        );


        if (
            buttons[i].textContent === exam
        ) {

            buttons[i].classList.add(
                "active"
            );
        }
    }


    document.getElementById(
        "selectedExamText"
    ).textContent =
        exam;


    displayHallTickets();

    updateDownloadAllButton();
};


// =====================================================
// SELECT TERM
// =====================================================

window.selectTerm = function(term) {

    selectedTerm =
        Number(term);


    // ---------------------------------------------
    // ACTIVE TERM BUTTON
    // ---------------------------------------------

    const buttons =
        document.querySelectorAll(
            ".term-button"
        );


    for (
        let i = 0;
        i < buttons.length;
        i++
    ) {

        buttons[i].classList.remove(
            "active"
        );
    }


    const activeButton =
        document.getElementById(
            "termButton" +
            selectedTerm
        );


    if (activeButton) {

        activeButton.classList.add(
            "active"
        );
    }


    // ---------------------------------------------
    // CREATE NEW EXAM OPTIONS
    // ---------------------------------------------

    createExamButtons();


    // ---------------------------------------------
    // UPDATE PAGE
    // ---------------------------------------------

    updateStatistics();

    displayHallTickets();
};


// =====================================================
// UPDATE STATISTICS
// =====================================================

function updateStatistics() {

    const total =
        students.length;


    let cleared = 0;

    let pending = 0;


    for (
        let i = 0;
        i < students.length;
        i++
    ) {

        if (
            isCleared(
                students[i]
            )
        ) {

            cleared++;

        } else {

            pending++;
        }
    }


    let clearedPercentage = 0;

    let pendingPercentage = 0;


    if (total > 0) {

        clearedPercentage =
            (
                cleared /
                total
            ) *
            100;


        pendingPercentage =
            (
                pending /
                total
            ) *
            100;
    }


    document.getElementById(
        "totalStudents"
    ).textContent =
        total;


    document.getElementById(
        "clearedStudents"
    ).textContent =
        cleared;


    document.getElementById(
        "pendingStudents"
    ).textContent =
        pending;


    document.getElementById(
        "clearedPercentage"
    ).textContent =
        clearedPercentage.toFixed(1) +
        "%";


    document.getElementById(
        "pendingPercentage"
    ).textContent =
        pendingPercentage.toFixed(1) +
        "%";
}


// =====================================================
// CLASS ORDER
// =====================================================

function getClassOrder(
    className
) {

    if (!className) {

        return 999;
    }


    const value =
        String(className)
            .toLowerCase()
            .trim();


    if (
        value.includes(
            "nursery"
        )
    ) {

        return 1;
    }


    if (
        value.includes(
            "lkg"
        )
    ) {

        return 2;
    }


    if (
        value.includes(
            "ukg"
        )
    ) {

        return 3;
    }


    const number =
        value.match(
            /[0-9]+/
        );


    if (number) {

        return (
            3 +
            Number(
                number[0]
            )
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
                );


            const nameB =
                String(
                    b.full_name || ""
                );


            return nameA.localeCompare(
                nameB
            );
        }
    );
}


// =====================================================
// GET FILTERED STUDENTS
// =====================================================

function getFilteredStudents() {

    let data =
        students.slice();


    const searchElement =
        document.getElementById(
            "searchInput"
        );


    const classElement =
        document.getElementById(
            "classInput"
        );


    const search =
        String(
            searchElement.value || ""
        )
        .toLowerCase()
        .trim();


    const classSearch =
        String(
            classElement.value || ""
        )
        .toLowerCase()
        .trim();


    data =
        data.filter(
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


                const searchMatch =
                    search === "" ||
                    name.includes(search) ||
                    mobile.includes(search);


                const classMatch =
                    classSearch === "" ||
                    className.includes(
                        classSearch
                    );


                return (
                    searchMatch &&
                    classMatch
                );
            }
        );


    sortStudents(data);


    return data;
}


// =====================================================
// DISPLAY STUDENTS
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


    const termText =
        document.getElementById(
            "selectedTermText"
        );


    termText.textContent =
        getTermName(
            selectedTerm
        );


    const data =
        getFilteredStudents();


    document.getElementById(
        "eligibleCount"
    ).textContent =
        data.length;


    if (
        data.length === 0
    ) {

        container.innerHTML = "";

        emptyMessage.style.display =
            "block";

        updateDownloadAllButton();

        return;
    }


    emptyMessage.style.display =
        "none";


    let html = "";


    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        const student =
            data[i];


        const termData =
            getTermData(
                student
            );


        const cleared =
            termData.remaining <= 0;


        html +=
            '<div class="student-card">';


        // ---------------------------------------------
        // STUDENT HEADER
        // ---------------------------------------------

        html +=
            '<div class="student-header">';


        html +=
            '<div class="student-info">';


        html +=
            '<h2>' +
            escapeHTML(
                student.full_name ||
                "Unknown Student"
            ) +
            '</h2>';


        html +=
            '<p>📱 Mobile: ' +
            escapeHTML(
                student.mobile ||
                "-"
            ) +
            '</p>';


        html +=
            '<p>🎓 Class: ' +
            escapeHTML(
                student.class_name ||
                "-"
            ) +
            '</p>';


        html +=
            '</div>';


        html +=
            '</div>';


        // ---------------------------------------------
        // FEE DETAILS
        // ---------------------------------------------

        html +=
            '<div class="fee-details">';


        html +=
            '<div class="fee-box">';


        html +=
            '<span>' +
            getTermName(
                selectedTerm
            ) +
            ' Total' +
            '</span>';


        html +=
            '<strong>₹' +
            formatMoney(
                termData.total
            ) +
            '</strong>';


        html +=
            '</div>';


        html +=
            '<div class="fee-box">';


        html +=
            '<span>Paid</span>';


        html +=
            '<strong>₹' +
            formatMoney(
                termData.paid
            ) +
            '</strong>';


        html +=
            '</div>';


        if (cleared) {

            html +=
                '<div class="fee-box cleared-box">';


            html +=
                '<span>Balance</span>';


            html +=
                '<strong>₹0</strong>';


            html +=
                '</div>';

        } else {

            html +=
                '<div class="fee-box pending-box">';


            html +=
                '<span>Pending Balance</span>';


            html +=
                '<strong>₹' +
                formatMoney(
                    termData.remaining
                ) +
                '</strong>';


            html +=
                '</div>';
        }


        html +=
            '</div>';


        // ---------------------------------------------
        // STATUS
        // ---------------------------------------------

        html +=
            '<div class="status-row">';


        if (cleared) {

            html +=
                '<div class="status-cleared">' +
                '✓ FEE CLEARED' +
                '</div>';

        } else {

            html +=
                '<div class="status-pending">' +
                '⚠ PENDING ₹' +
                formatMoney(
                    termData.remaining
                ) +
                '</div>';
        }


        // ---------------------------------------------
        // DOWNLOAD
        // ---------------------------------------------

        if (cleared) {

            if (selectedExam !== "") {

                html +=
                    '<button ' +
                    'class="student-download-button" ' +
                    'onclick="downloadHallTicket(\'' +
                    student.id +
                    '\')">' +
                    '📥 Download Hall Ticket' +
                    '</button>';

            } else {

                html +=
                    '<button ' +
                    'class="student-download-button" ' +
                    'disabled>' +
                    'Select Exam First' +
                    '</button>';
            }

        } else {

            html +=
                '<button ' +
                'class="student-download-button" ' +
                'disabled>' +
                '🔒 Download Disabled' +
                '</button>';
        }


        html +=
            '</div>';


        html +=
            '</div>';
    }


    container.innerHTML =
        html;


    updateDownloadAllButton();
}


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
// UPDATE DOWNLOAD ALL
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


    const clearedStudents =
        data.filter(
            function(student) {

                return isCleared(
                    student
                );
            }
        );


    if (
        selectedExam !== "" &&
        clearedStudents.length > 0
    ) {

        button.disabled = false;

    } else {

        button.disabled = true;
    }
}


// =====================================================
// DOWNLOAD ONE HALL TICKET
// =====================================================

window.downloadHallTicket =
    async function(studentId) {

        const student =
            students.find(
                function(item) {

                    return (
                        item.id ===
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
            !isCleared(student)
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


        const container =
            document.getElementById(
                "pdfHallTicketContainer"
            );


        container.innerHTML =
            createHallTicket(
                student
            );


        const hallTicket =
            container.querySelector(
                ".hall-ticket"
            );


        try {

            const canvas =
                await html2canvas(
                    hallTicket,
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


            const pageWidth =
                pdf.internal.pageSize.getWidth();


            const pageHeight =
                pdf.internal.pageSize.getHeight();


            const ticketWidth =
                142;


            const ticketHeight =
                64.67;


            const x =
                (
                    pageWidth -
                    ticketWidth
                ) / 2;


            const y =
                (
                    pageHeight -
                    ticketHeight
                ) / 2;


            pdf.addImage(
                image,
                "PNG",
                x,
                y,
                ticketWidth,
                ticketHeight
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

            console.error(error);

            alert(
                "Failed to create hall ticket."
            );


        } finally {

            container.innerHTML = "";
        }
    };


// =====================================================
// DOWNLOAD ALL
// A4 LANDSCAPE
// 2 COLUMNS × 3 ROWS
// 6 HALL TICKETS
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


            // -----------------------------------------
            // A4 LANDSCAPE
            // 297 × 210 mm
            // -----------------------------------------

            const pageWidth = 297;

            const pageHeight = 210;


            // -----------------------------------------
            // EXACT TICKET SIZE
            // -----------------------------------------

            const ticketWidth = 142;

            const ticketHeight = 64.67;


            // -----------------------------------------
            // SPACING
            // -----------------------------------------

            const marginX = 5;

            const marginY = 5;

            const gapX = 3;

            const gapY = 3;


            // -----------------------------------------
            // POSITIONS
            // -----------------------------------------

            const x1 =
                marginX;


            const x2 =
                marginX +
                ticketWidth +
                gapX;


            const y1 =
                marginY;


            const y2 =
                marginY +
                ticketHeight +
                gapY;


            const y3 =
                marginY +
                (
                    ticketHeight +
                    gapY
                ) * 2;


            // -----------------------------------------
            // DOWNLOAD 6 PER PAGE
            // -----------------------------------------

            for (
                let i = 0;
                i < data.length;
                i++
            ) {

                const student =
                    data[i];


                container.innerHTML =
                    createHallTicket(
                        student
                    );


                const hallTicket =
                    container.querySelector(
                        ".hall-ticket"
                    );


                const canvas =
                    await html2canvas(
                        hallTicket,
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


                // -------------------------------------
                // PAGE NUMBER
                // -------------------------------------

                const position =
                    i % 6;


                if (
                    i > 0 &&
                    position === 0
                ) {

                    pdf.addPage();
                }


                let x = x1;

                let y = y1;


                // -------------------------------------
                // COLUMN
                // -------------------------------------

                if (
                    position === 1 ||
                    position === 3 ||
                    position === 5
                ) {

                    x = x2;
                }


                // -------------------------------------
                // ROW
                // -------------------------------------

                if (
                    position === 2 ||
                    position === 3
                ) {

                    y = y2;
                }


                if (
                    position === 4 ||
                    position === 5
                ) {

                    y = y3;
                }


                // -------------------------------------
                // ADD TICKET
                // -------------------------------------

                pdf.addImage(
                    image,
                    "PNG",
                    x,
                    y,
                    ticketWidth,
                    ticketHeight
                );
            }


            // -----------------------------------------
            // SAVE
            // -----------------------------------------

            const termName =
                getTermName(
                    selectedTerm
                )
                .replace(
                    " ",
                    "_"
                );


            const examName =
                selectedExam
                    .replace(
                        /[^a-zA-Z0-9]/g,
                        "_"
                    );


            pdf.save(
                termName +
                "_" +
                examName +
                "_All_Hall_Tickets.pdf"
            );


        } catch (error) {

            console.error(error);

            alert(
                "Failed to create hall tickets."
            );


        } finally {

            container.innerHTML = "";
        }
    };


// =====================================================
// CREATE HALL TICKET
// =====================================================

function createHallTicket(student) {

    const name =
        escapeHTML(
            student.full_name ||
            "________________"
        );


    const className =
        escapeHTML(
            student.class_name ||
            "________________"
        );


    const exam =
        escapeHTML(
            selectedExam ||
            "________________"
        );


    let html = "";


    // =================================================
    // OUTER
    // =================================================

    html +=
        '<div class="hall-ticket">';


    // =================================================
    // HEADER
    // =================================================

    html +=
        '<div class="hall-header">';


    // LOGO

    html +=
        '<img ' +
        'class="hall-logo" ' +
        'src="vision_school_logo.png" ' +
        'alt="Vision School Logo">';


    // SCHOOL NAME

    html +=
        '<div class="hall-school-name">' +
        'VISION THE SCHOOL OF EXCELLENCE' +
        '</div>';


    // TAGLINE

    html +=
        '<div class="hall-tagline">' +
        '"A NEW ERA OF EDUCATION AWAITS"' +
        '</div>';


    // ADDRESS

    html +=
        '<div class="hall-address">' +
        'Sri ram colony, Jalpally, balapur (M), RR (Dist), Pincode 500005.' +
        '</div>';


    // HALL TICKET

    html +=
        '<div class="hall-title-box">' +
        'HALLTICKET' +
        '</div>';


    html +=
        '</div>';


    // =================================================
    // BODY
    // =================================================

    html +=
        '<div class="hall-body">';


    // NAME LABEL

    html +=
        '<div class="hall-name-label">' +
        'Name of the Student :' +
        '</div>';


    // NAME VALUE

    html +=
        '<div class="hall-name-value">' +
        name +
        '</div>';


    // ROLL LABEL

    html +=
        '<div class="hall-roll-label">' +
        'Roll No / VSX ID :' +
        '</div>';


    // ROLL VALUE

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


    // CLASS LABEL

    html +=
        '<div class="hall-class-label">' +
        'Class :' +
        '</div>';


    // CLASS VALUE

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
// FORMAT MONEY
// =====================================================

function formatMoney(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "en-IN"
    );
}


// =====================================================
// ESCAPE HTML
// =====================================================

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


// =====================================================
// BACK
// =====================================================

window.goBackToFees =
    function() {

        window.location.href =
            "collection_fees.html";
    };


// =====================================================
// START
// =====================================================

loadHallTicketData();