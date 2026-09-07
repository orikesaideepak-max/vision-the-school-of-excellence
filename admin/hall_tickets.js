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


// =====================================================
// EXACT HALL TICKET DIMENSIONS
// =====================================================

// A4 Landscape
// Width  = 297 mm
// Height = 210 mm
//
// 2 Columns × 3 Rows
// 6 tickets per page
//
// Each ticket:
// Width  = 142 mm
// Height = 64.67 mm

const HALL_TICKET_WIDTH = 142;

const HALL_TICKET_HEIGHT = 64.67;


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

    for (
        let i = 0;
        i < fees.length;
        i++
    ) {

        if (
            fees[i].student_id ===
            studentId
        ) {

            return fees[i];
        }
    }


    return null;
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
    // DIVIDE TOTAL FEE INTO 3 TERMS
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
    // TERM 1
    // ---------------------------------------------

    const term1Paid =
        Math.min(
            paidFee,
            term1Total
        );


    let remaining =
        paidFee -
        term1Paid;


    if (remaining < 0) {

        remaining = 0;
    }


    // ---------------------------------------------
    // TERM 2
    // ---------------------------------------------

    const term2Paid =
        Math.min(
            remaining,
            term2Total
        );


    remaining =
        remaining -
        term2Paid;


    if (remaining < 0) {

        remaining = 0;
    }


    // ---------------------------------------------
    // TERM 3
    // ---------------------------------------------

    const term3Paid =
        Math.min(
            remaining,
            term3Total
        );


    // ---------------------------------------------
    // RETURN
    // ---------------------------------------------

    return {

        term1: {

            total:
                term1Total,

            paid:
                term1Paid,

            remaining:
                term1Total -
                term1Paid
        },


        term2: {

            total:
                term2Total,

            paid:
                term2Paid,

            remaining:
                term2Total -
                term2Paid
        },


        term3: {

            total:
                term3Total,

            paid:
                term3Paid,

            remaining:
                term3Total -
                term3Paid
        }
    };
}


// =====================================================
// GET TERM DATA
// =====================================================

function getTermData(
    student,
    termNumber
) {

    const fee =
        getFee(
            student.id
        );


    if (!fee) {

        return null;
    }


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


    if (termNumber === 1) {

        return terms.term1;
    }


    if (termNumber === 2) {

        return terms.term2;
    }


    return terms.term3;
}


// =====================================================
// CHECK CLEARED
// =====================================================

function isTermCleared(
    student,
    termNumber
) {

    const termData =
        getTermData(
            student,
            termNumber
        );


    if (!termData) {

        return false;
    }


    return (
        termData.remaining <= 0
    );
}


// =====================================================
// STATISTICS
// =====================================================

function updateStatistics() {

    const total =
        students.length;


    let cleared = 0;


    for (
        let i = 0;
        i < students.length;
        i++
    ) {

        if (
            isTermCleared(
                students[i],
                selectedTerm
            )
        ) {

            cleared++;
        }
    }


    const pending =
        total -
        cleared;


    let clearedPercentage = 0;

    let pendingPercentage = 0;


    if (total > 0) {

        clearedPercentage =
            (
                cleared /
                total
            ) * 100;


        pendingPercentage =
            (
                pending /
                total
            ) * 100;
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
        clearedPercentage.toFixed(2) +
        "%";


    document.getElementById(
        "pendingPercentage"
    ).textContent =
        pendingPercentage.toFixed(2) +
        "%";
}


// =====================================================
// GET CLEARED STUDENTS
// =====================================================

function getClearedStudents() {

    const result = [];


    for (
        let i = 0;
        i < students.length;
        i++
    ) {

        if (
            isTermCleared(
                students[i],
                selectedTerm
            )
        ) {

            result.push(
                students[i]
            );
        }
    }


    return result;
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
        String(
            className
        )
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
        value.includes("lkg")
    ) {

        return 2;
    }


    if (
        value.includes("ukg")
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
// SORT
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
// FILTERED STUDENTS
// =====================================================

function getFilteredStudents() {

    let data =
        getClearedStudents();


    const search =
        String(
            document.getElementById(
                "searchInput"
            ).value || ""
        )
        .toLowerCase()
        .trim();


    const classSearch =
        String(
            document.getElementById(
                "classInput"
            ).value || ""
        )
        .toLowerCase()
        .trim();


    data =
        data.filter(
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


                const searchMatch =
                    search === "" ||
                    name.includes(search) ||
                    mobile.includes(search) ||
                    className.includes(search);


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

    updateStatistics();


    const container =
        document.getElementById(
            "studentsContainer"
        );


    const emptyMessage =
        document.getElementById(
            "emptyMessage"
        );


    document.getElementById(
        "selectedTermText"
    ).textContent =
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


        html +=
            '<div class="student-card">';


        html +=
            '<div class="student-info">';


        html +=
            '<div class="student-name">' +
            escapeHTML(
                student.full_name ||
                "Unknown Student"
            ) +
            '</div>';


        html +=
            '<div class="student-details">' +
            'Class: ' +
            escapeHTML(
                student.class_name ||
                "Not Available"
            ) +
            '</div>';


        html +=
            '</div>';


        html +=
            '<button ' +
            'class="download-button" ' +
            'onclick="downloadHallTicket(\'' +
            student.id +
            '\')">' +
            '📥 Download Hall Ticket' +
            '</button>';


        html +=
            '</div>';
    }


    container.innerHTML =
        html;
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


        const buttons =
            document.querySelectorAll(
                ".term-button"
            );


        for (
            let i = 0;
            i < buttons.length;
            i++
        ) {

            buttons[i]
                .classList
                .remove(
                    "active"
                );
        }


        const selectedButton =
            document.getElementById(
                "termButton" +
                selectedTerm
            );


        if (selectedButton) {

            selectedButton
                .classList
                .add(
                    "active"
                );
        }


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
// TERM NAME
// =====================================================

function getTermName(
    termNumber
) {

    if (
        termNumber === 1
    ) {

        return "1st Term";
    }


    if (
        termNumber === 2
    ) {

        return "2nd Term";
    }


    return "3rd Term";
}


// =====================================================
// EXAM NAME
// =====================================================

function getExamName(
    termNumber
) {

    if (
        termNumber === 1
    ) {

        return "FA - I";
    }


    if (
        termNumber === 2
    ) {

        return "FA - II";
    }


    return "FA - III";
}


// =====================================================
// CREATE EXACT HALL TICKET
// =====================================================

function createHallTicket(
    student
) {

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
        getExamName(
            selectedTerm
        );


    let html = "";


    // =================================================
    // OUTER TICKET
    // EXACTLY 142mm × 64.67mm
    // =================================================

    html +=
        '<div class="hall-ticket" ' +
        'style="' +
        'width:142mm;' +
        'height:64.67mm;' +
        'min-width:142mm;' +
        'max-width:142mm;' +
        'min-height:64.67mm;' +
        'max-height:64.67mm;' +
        'background:#ffffff;' +
        'border:0.35mm solid #222222;' +
        'position:relative;' +
        'overflow:hidden;' +
        'font-family:Arial,Helvetica,sans-serif;' +
        'color:#111111;' +
        'box-sizing:border-box;' +
        '">' ;


    // =================================================
    // HEADER
    // =================================================

    html +=
        '<div style="' +
        'height:17mm;' +
        'border-bottom:0.25mm solid #777777;' +
        'position:relative;' +
        'text-align:center;' +
        'box-sizing:border-box;' +
        'padding-top:2.5mm;' +
        '">';


    // =================================================
    // LOGO
    // =================================================

    html +=
        '<img ' +
        'src="vision_school_logo.png" ' +
        'crossorigin="anonymous" ' +
        'style="' +
        'position:absolute;' +
        'left:5mm;' +
        'top:2.5mm;' +
        'width:13mm;' +
        'height:13mm;' +
        'object-fit:contain;' +
        '">' ;


    // =================================================
    // SCHOOL NAME
    // =================================================

    html +=
        '<div style="' +
        'color:#1c3c8d;' +
        'font-size:4.5mm;' +
        'font-weight:800;' +
        'line-height:1;' +
        'white-space:nowrap;' +
        'margin-left:12mm;' +
        '">' +
        'VISION THE SCHOOL OF EXCELLENCE' +
        '</div>';


    // =================================================
    // TAGLINE
    // =================================================

    html +=
        '<div style="' +
        'color:#e9a400;' +
        'font-size:2.1mm;' +
        'font-weight:700;' +
        'margin-top:0.8mm;' +
        'white-space:nowrap;' +
        'margin-left:12mm;' +
        '">' +
        '“A NEW ERA OF EDUCATION AWAITS”' +
        '</div>';


    // =================================================
    // ADDRESS
    // =================================================

    html +=
        '<div style="' +
        'font-size:1.9mm;' +
        'margin-top:0.8mm;' +
        'white-space:nowrap;' +
        'margin-left:12mm;' +
        '">' +
        'Sri ram colony, Jalpally, balapur (M), RR (Dist), Pincode 500005.' +
        '</div>';


    // =================================================
    // HALLTICKET BOX
    // =================================================

    html +=
        '<div style="' +
        'position:absolute;' +
        'left:50%;' +
        'transform:translateX(-50%);' +
        'bottom:-4mm;' +
        'width:43mm;' +
        'height:9mm;' +
        'background:#ffffff;' +
        'border:0.3mm solid #222222;' +
        'display:flex;' +
        'align-items:center;' +
        'justify-content:center;' +
        'font-size:3.5mm;' +
        'font-weight:800;' +
        'z-index:5;' +
        'box-sizing:border-box;' +
        '">' +
        'HALLTICKET' +
        '</div>';


    html +=
        '</div>';


    // =================================================
    // NAME
    // =================================================

    html +=
        '<div style="' +
        'position:absolute;' +
        'left:8mm;' +
        'top:25mm;' +
        'font-size:3mm;' +
        'font-weight:700;' +
        '">' +
        'Name of the Student :' +
        '</div>';


    // Student name

    html +=
        '<div style="' +
        'position:absolute;' +
        'left:50mm;' +
        'top:25mm;' +
        'font-size:3mm;' +
        'font-weight:400;' +
        'white-space:nowrap;' +
        '">' +
        name +
        '</div>';


    // =================================================
    // ROLL NUMBER
    // =================================================

    html +=
        '<div style="' +
        'position:absolute;' +
        'left:8mm;' +
        'top:36mm;' +
        'font-size:3mm;' +
        'font-weight:700;' +
        '">' +
        'Roll No / VSX ID :' +
        '</div>';


    // =================================================
    // EXAM
    // =================================================

    html +=
        '<div style="' +
        'position:absolute;' +
        'left:78mm;' +
        'top:36mm;' +
        'font-size:3mm;' +
        'font-weight:700;' +
        'white-space:nowrap;' +
        '">' +
        'Exam : ' +
        exam +
        '</div>';


    // =================================================
    // CLASS
    // =================================================

    html +=
        '<div style="' +
        'position:absolute;' +
        'left:8mm;' +
        'top:48mm;' +
        'font-size:3mm;' +
        'font-weight:700;' +
        '">' +
        'Class :' +
        '</div>';


    // Class value

    html +=
        '<div style="' +
        'position:absolute;' +
        'left:50mm;' +
        'top:48mm;' +
        'font-size:3mm;' +
        'font-weight:400;' +
        '">' +
        className +
        '</div>';


    // =================================================
    // SIGNATURE
    // =================================================

    html +=
        '<div style="' +
        'position:absolute;' +
        'left:78mm;' +
        'top:49mm;' +
        'font-size:2.7mm;' +
        'font-weight:700;' +
        'white-space:nowrap;' +
        '">' +
        'Authorised Signature with Stamp' +
        '</div>';


    // =================================================
    // CLOSE TICKET
    // =================================================

    html +=
        '</div>';


    return html;
}


// =====================================================
// WAIT FOR IMAGE
// =====================================================

function waitForImages(
    container
) {

    const images =
        container.querySelectorAll(
            "img"
        );


    const promises = [];


    for (
        let i = 0;
        i < images.length;
        i++
    ) {

        const image =
            images[i];


        if (
            image.complete
        ) {

            continue;
        }


        promises.push(
            new Promise(
                function(resolve) {

                    image.onload =
                        resolve;

                    image.onerror =
                        resolve;
                }
            )
        );
    }


    return Promise.all(
        promises
    );
}


// =====================================================
// CREATE CANVAS
// =====================================================

async function makeTicketCanvas(
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


    await waitForImages(
        container
    );


    const ticket =
        container.querySelector(
            ".hall-ticket"
        );


    return await html2canvas(
        ticket,
        {
            scale: 3,
            useCORS: true,
            allowTaint: false,
            backgroundColor: "#ffffff"
        }
    );
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


        // Check fee again

        if (
            !isTermCleared(
                student,
                selectedTerm
            )
        ) {

            alert(
                "This student's fee is not cleared for this term."
            );

            return;
        }


        try {

            const canvas =
                await makeTicketCanvas(
                    student
                );


            const image =
                canvas.toDataURL(
                    "image/png"
                );


            const jsPDF =
                window.jspdf.jsPDF;


            // A4 LANDSCAPE

            const pdf =
                new jsPDF(
                    "landscape",
                    "mm",
                    "a4"
                );


            const pageWidth =
                pdf.internal.pageSize
                    .getWidth();


            const pageHeight =
                pdf.internal.pageSize
                    .getHeight();


            // EXACT TICKET SIZE

            const ticketWidth =
                142;


            const ticketHeight =
                64.67;


            // Center the individual ticket

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


            pdf.save(
                studentName +
                "_" +
                getTermName(
                    selectedTerm
                ).replace(
                    " ",
                    "_"
                ) +
                "_Hall_Ticket.pdf"
            );


        } catch (error) {

            console.error(error);

            alert(
                "Failed to create hall ticket."
            );


        } finally {

            document.getElementById(
                "pdfHallTicketContainer"
            ).innerHTML = "";
        }
    };


// =====================================================
// DOWNLOAD ALL
//
// A4 LANDSCAPE
//
// 297mm × 210mm
//
// 2 COLUMNS × 3 ROWS
//
// 6 TICKETS
//
// EACH TICKET
// 142mm × 64.67mm
// =====================================================

window.downloadAllHallTickets =
    async function() {

        const data =
            getFilteredStudents();


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
                getTermName(
                    selectedTerm
                ) +
                "?"
            );


        if (!confirmed) {

            return;
        }


        try {

            // =========================================
            // A4 LANDSCAPE
            // =========================================

            const jsPDF =
                window.jspdf.jsPDF;


            const pdf =
                new jsPDF(
                    "landscape",
                    "mm",
                    "a4"
                );


            const pageWidth =
                pdf.internal.pageSize
                    .getWidth();


            const pageHeight =
                pdf.internal.pageSize
                    .getHeight();


            // =========================================
            // EXACT A4 LAYOUT
            // =========================================

            const marginX = 5;

            const marginY = 5;

            const gapX = 3;

            const gapY = 3;


            // =========================================
            // EXACT TICKET SIZE
            // =========================================

            const ticketWidth =
                (
                    pageWidth -
                    (marginX * 2) -
                    gapX
                ) / 2;


            const ticketHeight =
                (
                    pageHeight -
                    (marginY * 2) -
                    (gapY * 2)
                ) / 3;


            // This should be:
            //
            // Width  = 142 mm
            // Height = 64.67 mm


            console.log(
                "Ticket Width:",
                ticketWidth
            );


            console.log(
                "Ticket Height:",
                ticketHeight
            );


            const container =
                document.getElementById(
                    "pdfHallTicketContainer"
                );


            // =========================================
            // LOOP
            // =========================================

            for (
                let i = 0;
                i < data.length;
                i++
            ) {

                const student =
                    data[i];


                // -------------------------------------
                // CREATE TICKET
                // -------------------------------------

                container.innerHTML =
                    createHallTicket(
                        student
                    );


                await waitForImages(
                    container
                );


                const ticket =
                    container.querySelector(
                        ".hall-ticket"
                    );


                const canvas =
                    await html2canvas(
                        ticket,
                        {
                            scale: 3,
                            useCORS: true,
                            allowTaint: false,
                            backgroundColor:
                                "#ffffff"
                        }
                    );


                const image =
                    canvas.toDataURL(
                        "image/png"
                    );


                // =====================================
                // POSITION
                // =====================================

                const position =
                    i % 6;


                // -------------------------------------
                // COLUMN
                // -------------------------------------
                //
                // 0 = left
                // 1 = right
                // 2 = left
                // 3 = right
                // 4 = left
                // 5 = right

                const column =
                    position % 2;


                // -------------------------------------
                // ROW
                // -------------------------------------
                //
                // 0 = first row
                // 1 = second row
                // 2 = third row

                const row =
                    Math.floor(
                        position / 2
                    );


                // =====================================
                // NEW PAGE AFTER EVERY 6
                // =====================================

                if (
                    position === 0 &&
                    i !== 0
                ) {

                    pdf.addPage();
                }


                // =====================================
                // X POSITION
                // =====================================

                const x =
                    marginX +
                    column *
                    (
                        ticketWidth +
                        gapX
                    );


                // =====================================
                // Y POSITION
                // =====================================

                const y =
                    marginY +
                    row *
                    (
                        ticketHeight +
                        gapY
                    );


                // =====================================
                // ADD IMAGE
                // =====================================

                pdf.addImage(
                    image,
                    "PNG",
                    x,
                    y,
                    ticketWidth,
                    ticketHeight
                );


                // =====================================
                // BORDER
                // =====================================

                pdf.setDrawColor(
                    50,
                    50,
                    50
                );


                pdf.setLineWidth(
                    0.25
                );


                pdf.rect(
                    x,
                    y,
                    ticketWidth,
                    ticketHeight
                );
            }


            // =========================================
            // SAVE
            // =========================================

            pdf.save(
                getTermName(
                    selectedTerm
                ).replace(
                    " ",
                    "_"
                ) +
                "_All_Hall_Tickets.pdf"
            );


        } catch (error) {

            console.error(error);

            alert(
                "Failed to create hall tickets."
            );


        } finally {

            document.getElementById(
                "pdfHallTicketContainer"
            ).innerHTML = "";
        }
    };


// =====================================================
// BACK BUTTON
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
// START
// =====================================================

loadHallTicketData();