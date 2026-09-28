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
// SA SETTINGS
// =====================================================

const SA_SETTINGS_KEY =
    "vision_school_sa_exam_settings_v2";


// =====================================================
// DEFAULT SA SETTINGS
// =====================================================

const DEFAULT_SA_SETTINGS = {

    academicYear: "2026–27",

    "SA - I": {

        groupA: [
            "2026-10-05",
            "2026-10-06",
            "2026-10-07",
            "2026-10-08",
            "2026-10-09"
        ],

        groupB: [
            "2026-10-01",
            "2026-10-03",
            "2026-10-05",
            "2026-10-06",
            "2026-10-07",
            "2026-10-08",
            "2026-10-09"
        ],

        groupC: [
            "2026-10-01",
            "2026-10-03",
            "2026-10-05",
            "2026-10-06",
            "2026-10-07",
            "2026-10-08",
            "2026-10-09"
        ]
    },

    "SA - II": {

        groupA: [
            "2027-02-01",
            "2027-02-02",
            "2027-02-03",
            "2027-02-04",
            "2027-02-05"
        ],

        groupB: [
            "2027-02-01",
            "2027-02-03",
            "2027-02-05",
            "2027-02-06",
            "2027-02-08",
            "2027-02-09",
            "2027-02-10"
        ],

        groupC: [
            "2027-02-01",
            "2027-02-03",
            "2027-02-05",
            "2027-02-06",
            "2027-02-08",
            "2027-02-09",
            "2027-02-10"
        ]
    }
};


// =====================================================
// LOAD SA SETTINGS
// =====================================================

function loadSASettings() {

    try {

        const saved =
            localStorage.getItem(
                SA_SETTINGS_KEY
            );

        if (!saved) {

            return JSON.parse(
                JSON.stringify(
                    DEFAULT_SA_SETTINGS
                )
            );
        }

        const parsed =
            JSON.parse(saved);

        return {

            ...JSON.parse(
                JSON.stringify(
                    DEFAULT_SA_SETTINGS
                )
            ),

            ...parsed,

            "SA - I": {

                ...DEFAULT_SA_SETTINGS["SA - I"],

                ...(parsed["SA - I"] || {})
            },

            "SA - II": {

                ...DEFAULT_SA_SETTINGS["SA - II"],

                ...(parsed["SA - II"] || {})
            }
        };

    } catch (error) {

        console.error(
            "Failed to load SA settings:",
            error
        );

        return JSON.parse(
            JSON.stringify(
                DEFAULT_SA_SETTINGS
            )
        );
    }
}


let saSettings = loadSASettings();


// =====================================================
// SAVE SA SETTINGS
// =====================================================

function persistSASettings() {

    try {

        localStorage.setItem(
            SA_SETTINGS_KEY,
            JSON.stringify(
                saSettings
            )
        );

    } catch (error) {

        console.error(
            "Failed to save SA settings:",
            error
        );
    }
}


// =====================================================
// A4 SETTINGS
// =====================================================

// =====================================================
// FA SYSTEM
// DO NOT CHANGE THESE VALUES
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
// SA SYSTEM
// SEPARATE FROM FA
// =====================================================

const SA_PAGE_WIDTH = 210;

const SA_PAGE_HEIGHT = 297;

const SA_MARGIN_X = 3;

const SA_MARGIN_Y = 3;

const SA_TICKET_WIDTH = 204;

const SA_TICKET_HEIGHT = 95;

const SA_GAP_Y = 3;


// -------------------------------------------------
// PRINCIPAL SIGNATURE IMAGE (SA hall tickets)
// Put the principal's scanned signature image next
// to hall_tickets.html (e.g. "principal_signature.png")
// and set the file name here. Leave empty ("") to
// keep only the signature line.
// -------------------------------------------------
const SA_PRINCIPAL_SIGNATURE_IMAGE = "";


// -------------------------------------------------
// BATCH SIZE FOR BULK HALL TICKET DOWNLOADS
// Large downloads are split into separate PDF files
// of this many tickets each. Browsers / jsPDF fail
// with "RangeError: Invalid string length" when one
// PDF string gets too big (seen at 121 tickets), so
// keep this at 50 or lower.
// -------------------------------------------------
const HALL_TICKET_BATCH_SIZE = 50;


// =====================================================
// INJECT SA CSS
// THIS ALSO PREVENTS ORANGE BACKGROUND
// =====================================================

function injectSAStyles() {

    if (
        document.getElementById(
            "visionSAInjectedStyles"
        )
    ) {

        return;
    }


    const style =
        document.createElement(
            "style"
        );

    style.id =
        "visionSAInjectedStyles";


    style.textContent = `

        /* ==========================================
           SA EDITOR
           ========================================== */

        .sa-settings-panel {

            margin: 15px 0;

            padding: 18px;

            background: #ffffff !important;

            border: 1px solid #d1d5db;

            border-radius: 12px;

            box-shadow:
                0 3px 12px rgba(0,0,0,0.08);

        }

        .sa-settings-title {

            font-size: 20px;

            font-weight: 700;

            margin-bottom: 5px;

            color: #111827;

        }

        .sa-settings-description {

            font-size: 13px;

            color: #6b7280;

            margin-bottom: 15px;

        }

        .sa-settings-row {

            display: grid;

            grid-template-columns:
                repeat(auto-fit, minmax(170px, 1fr));

            gap: 12px;

            margin-bottom: 15px;

        }

        .sa-setting-group {

            border: 1px solid #dbeafe;

            border-radius: 10px;

            padding: 12px;

            background: #f8fbff !important;

        }

        .sa-setting-group h4 {

            margin: 0 0 10px 0;

            color: #1d4ed8;

            font-size: 15px;

        }

        .sa-date-row {

            display: flex;

            align-items: center;

            gap: 7px;

            margin-bottom: 7px;

        }

        .sa-date-number {

            width: 22px;

            font-size: 12px;

            color: #555;

        }

        .sa-date-input {

            width: 100%;

            box-sizing: border-box;

            padding: 7px;

            border: 1px solid #cbd5e1;

            border-radius: 6px;

            background: #fff !important;

        }

        .sa-settings-actions {

            display: flex;

            flex-wrap: wrap;

            gap: 10px;

            margin-top: 10px;

        }

        .sa-save-button {

            border: none;

            background: #2563eb;

            color: white;

            padding: 9px 16px;

            border-radius: 7px;

            cursor: pointer;

            font-weight: 600;

        }

        .sa-reset-button {

            border: 1px solid #dc2626;

            background: white !important;

            color: #dc2626;

            padding: 9px 16px;

            border-radius: 7px;

            cursor: pointer;

            font-weight: 600;

        }

        .sa-settings-status {

            font-size: 13px;

            color: #15803d;

            margin-top: 8px;

        }


        /* ==========================================
           SA HALL TICKET
           ========================================== */

        .sa-hall-ticket {

            width: 204mm !important;

            height: 95mm !important;

            min-width: 204mm !important;

            max-width: 204mm !important;

            min-height: 95mm !important;

            max-height: 95mm !important;

            box-sizing: border-box !important;

            position: relative !important;

            overflow: hidden !important;

            background: #ffffff !important;

            color: #111111 !important;

            border: 0.6mm solid #1e40af !important;

            font-family:
                Arial,
                Helvetica,
                sans-serif !important;

        }

        .sa-hall-ticket * {

            box-sizing: border-box;

        }

        .sa-frame {

            position: absolute;

            left: 1.4mm;

            top: 1.4mm;

            right: 1.4mm;

            bottom: 1.4mm;

            border: 0.45mm solid #d4a017;

            pointer-events: none;

            background: transparent !important;

        }

        .sa-header {

            position: absolute;

            left: 0;

            top: 0;

            width: 100%;

            height: 29mm;

            background: #ffffff !important;

        }

        .sa-logo {

            position: absolute;

            left: 7mm;

            top: 4mm;

            width: 21mm;

            height: 21mm;

            object-fit: contain;

            background: white !important;

        }

        .sa-school-name {

            position: absolute;

            left: 30mm;

            top: 2mm;

            width: 169mm;

            text-align: center;

            font-family:
                Georgia,
                "Times New Roman",
                serif;

            font-size: 7.2mm;

            line-height: 8mm;

            font-weight: 700;

            color: #0039d8;

            white-space: nowrap;

        }

        .sa-tagline {

            position: absolute;

            right: 7mm;

            top: 10.5mm;

            font-size: 2.4mm;

            font-weight: 700;

            color: #f59e0b;

            white-space: nowrap;

        }

        .sa-assessment-title {

            position: absolute;

            left: 0;

            top: 13mm;

            width: 100%;

            text-align: center;

            font-size: 4.7mm;

            line-height: 5.2mm;

            font-weight: 800;

            color: #111111;

        }

        .sa-hall-title {

            position: absolute;

            left: 0;

            top: 18mm;

            width: 100%;

            text-align: center;

            font-size: 4.5mm;

            line-height: 5mm;

            font-weight: 800;

            color: #111111;

        }

        .sa-academic-year {

            position: absolute;

            left: 0;

            top: 23mm;

            width: 100%;

            text-align: center;

            font-size: 3.2mm;

            font-weight: 700;

            color: #111111;

        }

        .sa-header-divider {

            position: absolute;

            left: 3mm;

            right: 3mm;

            top: 27.6mm;

            border-top: 0.4mm solid #1e40af;

        }


        /* ==========================================
           STUDENT DETAILS
           ========================================== */

        .sa-student-details {

            position: absolute;

            left: 3mm;

            top: 28mm;

            width: 198mm;

            height: 14mm;

            border: 0.25mm solid #222;

            display: grid;

            grid-template-columns:
                24mm 1fr 22mm 1fr;

            grid-template-rows:
                7mm 7mm;

            background: white !important;

            font-size: 2.6mm;

            font-weight: 700;

        }

        .sa-detail-label {

            display: flex;

            align-items: center;

            padding-left: 2mm;

            border-right: 0.2mm solid #555;

            border-bottom: 0.2mm solid #555;

            background: #ffffff !important;

        }

        .sa-detail-value {

            display: flex;

            align-items: center;

            padding-left: 2mm;

            border-right: 0.2mm solid #555;

            border-bottom: 0.2mm solid #555;

            font-weight: 400;

            background: #ffffff !important;

        }


        /* ==========================================
           SA EXAM TABLE
           ========================================== */

        .sa-exam-table {

            position: absolute;

            left: 3mm;

            top: 42mm;

            width: 198mm;

            border-collapse: collapse;

            table-layout: fixed;

            font-size: 2.35mm;

            background: #ffffff !important;

            color: #111111 !important;

        }

        .sa-exam-table th,

        .sa-exam-table td {

            border: 0.25mm solid #555;

            text-align: center;

            vertical-align: middle;

            padding: 0.8mm;

            background: #ffffff !important;

        }

        .sa-exam-table thead th {

            height: 8mm;

            background: #dff1ff !important;

            font-weight: 700;

        }

        .sa-exam-table .sa-left-header {

            width: 21mm;

            background: #dff1ff !important;

            font-weight: 700;

        }

        .sa-exam-table tbody td {

            height: 6mm;

        }

        .sa-exam-table .sa-subject-label {

            background: #dff1ff !important;

            font-weight: 700;

        }

        .sa-exam-table .sa-signature-row {

            height: 7mm;

        }


        /* ==========================================
           SIGNATURES
           ========================================== */

        .sa-signature-left {

            position: absolute;

            left: 12mm;

            bottom: 7mm;

            width: 72mm;

            text-align: center;

            font-size: 2.5mm;

            font-weight: 700;

            border-top: 0.25mm solid #222;

            padding-top: 1.5mm;

        }

        .sa-signature-right {

            position: absolute;

            right: 12mm;

            bottom: 7mm;

            width: 72mm;

            text-align: center;

            font-size: 2.5mm;

            font-weight: 700;

            border-top: 0.25mm solid #222;

            padding-top: 1.5mm;

        }

        .sa-principal-sign {

            position: absolute;

            right: 12mm;

            bottom: 12mm;

            width: 72mm;

            height: 6.5mm;

            text-align: center;

        }

        .sa-principal-sign img {

            height: 6.5mm;

            max-width: 60mm;

            object-fit: contain;

        }


        /* ==========================================
           CUT LINE
           ========================================== */

        .sa-cut-line {

            position: absolute;

            left: 2mm;

            right: 2mm;

            bottom: 0.8mm;

            height: 3mm;

            border-top: 0.25mm dashed #222;

            text-align: center;

            font-size: 2.1mm;

            line-height: 3mm;

            background: white !important;

        }

        .sa-cut-line::before {

            content: "✂";

            position: absolute;

            left: 0;

            top: -2mm;

            font-size: 3mm;

            background: white;

        }

        .sa-cut-line::after {

            content: "✂";

            position: absolute;

            right: 0;

            top: -2mm;

            font-size: 3mm;

            background: white;

        }


        /* ==========================================
           PRINT
           ========================================== */

        @media print {

            .sa-hall-ticket {

                background: white !important;

            }

        }

    `;

    document.head.appendChild(style);
}


// =====================================================
// DATE FORMAT
// =====================================================

function formatSADate(dateValue) {

    if (!dateValue) {

        return {
            date: "",
            day: ""
        };
    }


    const date =
        new Date(
            dateValue + "T00:00:00"
        );


    if (isNaN(date.getTime())) {

        return {
            date: dateValue,
            day: ""
        };
    }


    const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];


    const day =
        dayNames[
            date.getDay()
        ];


    const parts =
        dateValue.split("-");


    const formatted =
        parts[2] +
        "." +
        parts[1] +
        "." +
        parts[0];


    return {
        date: formatted,
        day: day
    };
}


// =====================================================
// GET SA GROUP
// =====================================================

function getSAGroup(student) {

    const className =
        String(
            student.class_name || ""
        )
        .toLowerCase()
        .trim();


    if (
        className.includes("nursery") ||
        className.includes("lkg") ||
        className.includes("ukg")
    ) {

        return "groupA";
    }


    const match =
        className.match(
            /[0-9]+/
        );


    if (match) {

        const classNumber =
            Number(
                match[0]
            );


        if (
            classNumber >= 1 &&
            classNumber <= 5
        ) {

            return "groupB";
        }


        if (
            classNumber >= 6 &&
            classNumber <= 10
        ) {

            return "groupC";
        }
    }


    // Default
    return "groupB";
}


// =====================================================
// GET SA DATES
// =====================================================

function getSADates(student) {

    const group =
        getSAGroup(
            student
        );


    const examSettings =
        saSettings[
            selectedExam
        ] ||
        saSettings["SA - I"];


    return (
        examSettings[group] ||
        []
    );
}


// =====================================================
// SA SUBJECTS - NURSERY/LKG/UKG
// (matches screenshot pattern 1)
// =====================================================

function getGroupASubjectRows() {

    return [

        {
            label: "Nursery",
            subjects: [
                "–",
                "English",
                "Mathematics",
                "EVS",
                "Drawing"
            ]
        },

        {
            label: "LKG",
            subjects: [
                "Telugu",
                "Hindi",
                "English",
                "Mathematics",
                "EVS"
            ]
        },

        {
            label: "UKG",
            subjects: [
                "Telugu",
                "Hindi",
                "English",
                "Mathematics",
                "EVS"
            ]
        },

        {
            label: "Invigilator<br>Signature",
            subjects: [
                "",
                "",
                "",
                "",
                ""
            ]
        }

    ];
}


// =====================================================
// SA SUBJECTS - CLASSES 1 TO 5
// (matches screenshot pattern 2)
// =====================================================

function getGroupBSubjectRows() {

    return [

        {
            label: "Subject",
            subjects: [
                "–",
                "Social Studies<br>(IV – V)",
                "Telugu<br>(I – V)",
                "English<br>(I – V)",
                "Mathematics<br>(I – V)",
                "EVS (I – III)<br>Science (IV – V)",
                "Hindi<br>(I – V)"
            ]
        },

        {
            label: "Invigilator<br>Signature",
            subjects: [
                "",
                "",
                "",
                "",
                "",
                "",
                ""
            ]
        }

    ];
}


// =====================================================
// SA SUBJECTS - CLASSES 6 TO 10
// (matches screenshot pattern 3)
// =====================================================

function getGroupCSubjectRows() {

    return [

        {
            label: "Subject<br>(VI – VII)",
            subjects: [
                "First Language<br>(Telugu / Hindi)",
                "Second Language<br>(Telugu / Hindi)",
                "English",
                "Mathematics",
                "General Science",
                "Social Studies",
                "–"
            ]
        },

        {
            label: "Subject<br>(VIII – X)",
            subjects: [
                "Mathematics",
                "Physical Science",
                "Biological Science",
                "Social Studies",
                "First Language<br>(Telugu / Hindi)",
                "Second Language<br>(Telugu / Hindi)",
                "English"
            ]
        },

        {
            label: "Invigilator<br>Signature",
            subjects: [
                "",
                "",
                "",
                "",
                "",
                "",
                ""
            ]
        }

    ];
}


// =====================================================
// GET ROMAN NUMBER
// SA - I -> I, SA - II -> II
// =====================================================

function getSARomanNumber() {

    if (
        selectedExam === "SA - II"
    ) {

        return "II";
    }


    return "I";
}


// =====================================================
// CREATE SA HEADER
// =====================================================

function createSAHeader() {

    const roman =
        getSARomanNumber();


    let html = "";


    html +=
        '<div class="sa-header">';


    html +=
        '<img ' +
        'class="sa-logo" ' +
        'src="vision_school_logo.png" ' +
        'crossorigin="anonymous" ' +
        'alt="Vision School Logo">';


    html +=
        '<div class="sa-school-name">' +
        escapeHTML(
            saSettings.schoolName ||
            "VISION – THE SCHOOL OF EXCELLENCE"
        ) +
        '</div>';


    html +=
        '<div class="sa-tagline">' +
        escapeHTML(
            saSettings.schoolTagline ||
            "A NEW ERA OF EDUCATION AWAITS"
        ) +
        '</div>';


    html +=
        '<div class="sa-assessment-title">' +
        'SUMMATIVE ASSESSMENT – ' +
        roman +
        '</div>';


    html +=
        '<div class="sa-hall-title">' +
        'HALL TICKET' +
        '</div>';


    html +=
        '<div class="sa-academic-year">' +
        'ACADEMIC YEAR: ' +
        escapeHTML(
            saSettings.academicYear
        ) +
        '</div>';


    html +=
        '<div class="sa-header-divider"></div>';


    html +=
        '</div>';


    return html;
}


// =====================================================
// CREATE SA STUDENT DETAILS
// =====================================================

function createSAStudentDetails(
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


    const rollNumber =
        escapeHTML(
            student.roll_number ||
            ""
        );


    const fatherName =
        escapeHTML(
            student.father_name ||
            ""
        );


    let html = "";


    html +=
        '<div class="sa-student-details">';


    html +=
        '<div class="sa-detail-label">' +
        'Student Name :' +
        '</div>';


    html +=
        '<div class="sa-detail-value">' +
        studentName +
        '</div>';


    html +=
        '<div class="sa-detail-label">' +
        'Class :' +
        '</div>';


    html +=
        '<div class="sa-detail-value">' +
        className +
        '</div>';


    html +=
        '<div class="sa-detail-label">' +
        'VSX ID / Roll No. :' +
        '</div>';


    html +=
        '<div class="sa-detail-value">' +
        (
            rollNumber !==
            "" ?
            rollNumber :
            "________________"
        ) +
        '</div>';


    html +=
        '<div class="sa-detail-label">' +
        'Parent Name :' +
        '</div>';


    html +=
        '<div class="sa-detail-value">' +
        (
            fatherName !==
            "" ?
            fatherName :
            "________________"
        ) +
        '</div>';


    html +=
        '</div>';


    return html;
}


// =====================================================
// CREATE SA TABLE
// =====================================================

function createSATable(
    student
) {

    const group =
        getSAGroup(
            student
        );


    const dates =
        getSADates(
            student
        );


    let rows;


    if (group === "groupA") {

        rows =
            getGroupASubjectRows();

    } else if (group === "groupC") {

        rows =
            getGroupCSubjectRows();

    } else {

        rows =
            getGroupBSubjectRows();
    }


    let html = "";


    html +=
        '<table class="sa-exam-table">';


    html +=
        '<thead>';


    html +=
        '<tr>';


    html +=
        '<th class="sa-left-header">' +
        'Date' +
        '</th>';


    for (
        let i = 0;
        i < dates.length;
        i++
    ) {

        const formatted =
            formatSADate(
                dates[i]
            );


        html +=
            '<th>' +
            escapeHTML(
                formatted.date
            ) +
            '<br>' +
            '(' +
            escapeHTML(
                formatted.day
            ) +
            ')' +
            '</th>';
    }


    html +=
        '</tr>';


    html +=
        '</thead>';


    html +=
        '<tbody>';


    for (
        let r = 0;
        r < rows.length;
        r++
    ) {

        const row =
            rows[r];


        const isSignature =
            row.label
                .toLowerCase()
                .includes(
                    "signature"
                );


        html +=
            '<tr class="' +
            (
                isSignature
                    ? "sa-signature-row"
                    : ""
            ) +
            '">';


        html +=
            '<td class="sa-subject-label">' +
            row.label +
            '</td>';


        for (
            let c = 0;
            c < dates.length;
            c++
        ) {

            html +=
                '<td>' +
                (
                    row.subjects[c] ||
                    ""
                ) +
                '</td>';
        }


        html +=
            '</tr>';
    }


    html +=
        '</tbody>';


    html +=
        '</table>';


    return html;
}


// =====================================================
// CREATE SA HALL TICKET
// =====================================================

function createSAHallTicket(
    student
) {

    let html = "";


    html +=
        '<div class="sa-hall-ticket">';


    html +=
        '<div class="sa-frame"></div>';


    html +=
        createSAHeader();


    html +=
        createSAStudentDetails(
            student
        );


    html +=
        createSATable(
            student
        );


    html +=
        '<div class="sa-signature-left">' +
        'Class Incharge Signature' +
        '</div>';


    html +=
        '<div class="sa-signature-right">' +
        'Principal Signature' +
        '</div>';


    if (
        typeof SA_PRINCIPAL_SIGNATURE_IMAGE !==
            "undefined" &&
        SA_PRINCIPAL_SIGNATURE_IMAGE !==
            ""
    ) {

        html +=
            '<div class="sa-principal-sign">' +
            '<img src="' +
            SA_PRINCIPAL_SIGNATURE_IMAGE +
            '" alt="">' +
            '</div>';
    }


    html +=
        '<div class="sa-cut-line">' +
        'CUT HERE' +
        '</div>';


    html +=
        '</div>';


    return html;
}


// =====================================================
// SA SETTINGS EDITOR
// =====================================================

function createSASettingsEditor() {

    const existing =
        document.getElementById(
            "saSettingsPanel"
        );


    if (existing) {

        existing.remove();
    }


    // If the page contains the modal-based SA settings UI,
    // drive that instead of injecting the floating panel.

    if (
        document.getElementById(
            "saSettingsModal"
        )
    ) {

        updateSASettingsSection();

        return;
    }


    if (
        selectedExam !== "SA - I" &&
        selectedExam !== "SA - II"
    ) {

        return;
    }


    const studentsContainer =
        document.getElementById(
            "studentsContainer"
        );


    if (!studentsContainer) {

        return;
    }


    const panel =
        document.createElement(
            "div"
        );


    panel.id =
        "saSettingsPanel";

    panel.className =
        "sa-settings-panel";


    const examSettings =
        saSettings[
            selectedExam
        ];


    let html = "";


    html +=
        '<div class="sa-settings-title">' +
        '⚙ SA Exam Settings' +
        '</div>';


    html +=
        '<div class="sa-settings-description">' +
        'Edit the Academic Year and examination dates for ' +
        escapeHTML(
            selectedExam
        ) +
        '. These settings are used when downloading SA hall tickets.' +
        '</div>';


    // Academic year

    html +=
        '<div class="sa-settings-row">';


    html +=
        '<div>' +
        '<label><strong>Academic Year</strong></label>' +
        '<input ' +
        'id="saAcademicYearInput" ' +
        'type="text" ' +
        'value="' +
        escapeHTML(
            saSettings.academicYear
        ) +
        '" ' +
        'style="width:100%;padding:8px;margin-top:5px;border:1px solid #cbd5e1;border-radius:6px;box-sizing:border-box;">' +
        '</div>';


    html +=
        '</div>';


    html +=
        '<div class="sa-settings-row">';


    html +=
        createSAEditorGroup(
            "Nursery / LKG / UKG",
            "groupA",
            examSettings.groupA
        );


    html +=
        createSAEditorGroup(
            "Classes 1 – 5",
            "groupB",
            examSettings.groupB
        );


    html +=
        createSAEditorGroup(
            "Classes 6 – 10",
            "groupC",
            examSettings.groupC
        );


    html +=
        '</div>';


    html +=
        '<div class="sa-settings-actions">' +

        '<button ' +
        'class="sa-save-button" ' +
        'onclick="saveSAExamSettings()">' +
        '💾 Save SA Settings' +
        '</button>' +

        '<button ' +
        'class="sa-reset-button" ' +
        'onclick="resetSAExamSettings()">' +
        '↻ Reset This Exam' +
        '</button>' +

        '</div>';


    html +=
        '<div id="saSettingsStatus" class="sa-settings-status"></div>';


    panel.innerHTML =
        html;


    studentsContainer.parentNode.insertBefore(
        panel,
        studentsContainer
    );
}


// =====================================================
// CREATE SA EDITOR GROUP
// =====================================================

function createSAEditorGroup(
    title,
    groupName,
    dates
) {

    let html = "";


    html +=
        '<div class="sa-setting-group">';


    html +=
        '<h4>' +
        title +
        '</h4>';


    for (
        let i = 0;
        i < dates.length;
        i++
    ) {

        html +=
            '<div class="sa-date-row">';


        html +=
            '<span class="sa-date-number">' +
            (i + 1) +
            '</span>';


        html +=
            '<input ' +
            'class="sa-date-input" ' +
            'data-sa-group="' +
            groupName +
            '" ' +
            'data-sa-index="' +
            i +
            '" ' +
            'type="date" ' +
            'value="' +
            escapeHTML(
                dates[i]
            ) +
            '">';


        html +=
            '</div>';
    }


    html +=
        '</div>';


    return html;
}


// =====================================================
// SA SETTINGS MODAL SUPPORT
// Used when the page contains #saSettingsModal
// =====================================================

function updateSASettingsSection() {

    const section =
        document.getElementById(
            "saSettingsSection"
        );


    if (section) {

        section.style.display =
            (
                selectedExam === "SA - I" ||
                selectedExam === "SA - II"
            )
                ? "block"
                : "none";
    }


    updateSASettingsSummary();
}


function updateSASettingsSummary() {

    const summary =
        document.getElementById(
            "saSettingsSummary"
        );


    if (!summary) {

        return;
    }


    if (
        selectedExam !== "SA - I" &&
        selectedExam !== "SA - II"
    ) {

        summary.innerHTML = "";

        return;
    }


    const examSettings =
        saSettings[selectedExam] ||
        {};


    const countDates =
        function(list) {

            return (
                list || []
            ).filter(
                function(d) {

                    return !!d;
                }
            ).length;
        };


    summary.innerHTML =
        "<strong>" +
        escapeHTML(
            selectedExam
        ) +
        "</strong> · Academic Year: " +
        escapeHTML(
            saSettings.academicYear ||
            ""
        ) +
        " &nbsp;|&nbsp; Nursery/LKG/UKG: " +
        countDates(
            examSettings.groupA
        ) +
        " dates &nbsp;|&nbsp; Classes 1–5: " +
        countDates(
            examSettings.groupB
        ) +
        " dates &nbsp;|&nbsp; Classes 6–10: " +
        countDates(
            examSettings.groupC
        ) +
        " dates";
}


function fillSADateInputs(
    prefix,
    dates
) {

    for (
        let i = 0;
        i < dates.length;
        i++
    ) {

        const input =
            document.getElementById(
                prefix +
                "Date" +
                (i + 1)
            );


        if (input) {

            input.value =
                dates[i] ||
                "";
        }


        updateDateDay(
            prefix +
            "Date" +
            (i + 1),
            prefix +
            "Day" +
            (i + 1)
        );
    }
}


function readSADateInputs(
    prefix,
    count
) {

    const dates = [];


    for (
        let i = 1;
        i <= count;
        i++
    ) {

        const input =
            document.getElementById(
                prefix +
                "Date" +
                i
            );


        dates.push(
            input
                ? input.value
                : ""
        );
    }


    return dates;
}


window.updateDateDay =
    function(
        dateInputId,
        daySpanId
    ) {

        const input =
            document.getElementById(
                dateInputId
            );


        const span =
            document.getElementById(
                daySpanId
            );


        if (
            !input ||
            !span
        ) {

            return;
        }


        if (!input.value) {

            span.textContent = "";

            return;
        }


        const formatted =
            formatSADate(
                input.value
            );


        span.textContent =
            formatted.day
                ? "(" +
                formatted.day +
                ")"
                : "";
    };


window.openSASettings =
    function() {

        if (
            selectedExam !== "SA - I" &&
            selectedExam !== "SA - II"
        ) {

            alert(
                "Please select SA - I or SA - II first."
            );

            return;
        }


        const modal =
            document.getElementById(
                "saSettingsModal"
            );


        if (!modal) {

            return;
        }


        const examSettings =
            saSettings[selectedExam] ||
            {};


        const nameEl =
            document.getElementById(
                "settingsExamName"
            );


        if (nameEl) {

            nameEl.textContent =
                selectedExam;
        }


        const yearInput =
            document.getElementById(
                "academicYearInput"
            );


        if (yearInput) {

            yearInput.value =
                saSettings.academicYear ||
                "";
        }


        const schoolInput =
            document.getElementById(
                "schoolNameInput"
            );


        if (schoolInput) {

            schoolInput.value =
                saSettings.schoolName ||
                "VISION – THE SCHOOL OF EXCELLENCE";
        }


        const taglineInput =
            document.getElementById(
                "schoolTaglineInput"
            );


        if (taglineInput) {

            taglineInput.value =
                saSettings.schoolTagline ||
                "A NEW ERA OF EDUCATION AWAITS";
        }


        fillSADateInputs(
            "t1",
            examSettings.groupA ||
            []
        );


        fillSADateInputs(
            "t2",
            examSettings.groupB ||
            []
        );


        fillSADateInputs(
            "t3",
            examSettings.groupC ||
            []
        );


        modal.style.display =
            "block";
    };


window.closeSASettings =
    function() {

        const modal =
            document.getElementById(
                "saSettingsModal"
            );


        if (modal) {

            modal.style.display =
                "none";
        }
    };


window.saveSASettings =
    function() {

        if (
            selectedExam !== "SA - I" &&
            selectedExam !== "SA - II"
        ) {

            return;
        }


        const yearInput =
            document.getElementById(
                "academicYearInput"
            );


        if (yearInput) {

            saSettings.academicYear =
                yearInput.value.trim() ||
                "2026–27";
        }


        const schoolInput =
            document.getElementById(
                "schoolNameInput"
            );


        if (schoolInput) {

            saSettings.schoolName =
                schoolInput.value.trim() ||
                "VISION – THE SCHOOL OF EXCELLENCE";
        }


        const taglineInput =
            document.getElementById(
                "schoolTaglineInput"
            );


        if (taglineInput) {

            saSettings.schoolTagline =
                taglineInput.value.trim() ||
                "A NEW ERA OF EDUCATION AWAITS";
        }


        saSettings[selectedExam] = {

            groupA:
                readSADateInputs(
                    "t1",
                    5
                ),

            groupB:
                readSADateInputs(
                    "t2",
                    7
                ),

            groupC:
                readSADateInputs(
                    "t3",
                    7
                )
        };


        persistSASettings();


        closeSASettings();

        updateSASettingsSection();

        displayHallTickets();
    };


// =====================================================
// SAVE SA EXAM SETTINGS
// =====================================================

window.saveSAExamSettings =
    function() {

        if (
            selectedExam !== "SA - I" &&
            selectedExam !== "SA - II"
        ) {

            return;
        }


        const yearInput =
            document.getElementById(
                "saAcademicYearInput"
            );


        if (yearInput) {

            saSettings.academicYear =
                yearInput.value.trim() ||
                "2026–27";
        }


        const inputs =
            document.querySelectorAll(
                ".sa-date-input"
            );


        inputs.forEach(
            function(input) {

                const group =
                    input.dataset.saGroup;

                const index =
                    Number(
                        input.dataset.saIndex
                    );


                if (
                    saSettings[selectedExam] &&
                    saSettings[selectedExam][group]
                ) {

                    saSettings[selectedExam][group][index] =
                        input.value;
                }
            }
        );


        persistSASettings();


        const status =
            document.getElementById(
                "saSettingsStatus"
            );


        if (status) {

            status.textContent =
                "✓ SA settings saved successfully.";

            setTimeout(
                function() {

                    status.textContent =
                        "";

                },
                2500
            );
        }


        displayHallTickets();
    };


// =====================================================
// RESET SA EXAM SETTINGS
// =====================================================

window.resetSAExamSettings =
    function() {

        if (
            selectedExam !== "SA - I" &&
            selectedExam !== "SA - II"
        ) {

            return;
        }


        const confirmed =
            confirm(
                "Reset " +
                selectedExam +
                " settings to the default dates?"
            );


        if (!confirmed) {

            return;
        }


        saSettings[selectedExam] =
            JSON.parse(
                JSON.stringify(
                    DEFAULT_SA_SETTINGS[
                        selectedExam
                    ]
                )
            );


        persistSASettings();


        createSASettingsEditor();

        displayHallTickets();
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

        let studentResult =
            await supabase
                .from("profiles")
                .select(
                    "id,full_name,mobile,class_name,roll_number,father_name"
                )
                .eq(
                    "role",
                    "student"
                );


        // Fallback: if roll_number / father_name columns
        // do not exist yet, load without them.

        if (studentResult.error) {

            studentResult =
                await supabase
                    .from("profiles")
                    .select(
                        "id,full_name,mobile,class_name"
                    )
                    .eq(
                        "role",
                        "student"
                    );
        }


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
        getFee(
            student.id
        );


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
        getTermData(
            student
        );


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
            "FA - II",
            "SA - I"
        ];
    }


    if (selectedTerm === 2) {

        return [
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


    // Show SA editor only for SA

    createSASettingsEditor();
}


// =====================================================
// SELECT EXAM
// =====================================================

window.selectExam =
    function(exam) {

        selectedExam =
            exam;


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

    injectSAStyles();


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


    document.getElementById(
        "selectedTermText"
    ).textContent =
        getTermName(
            selectedTerm
        );


    let data =
        getFilteredStudents();


    sortStudents(data);


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


    createSelectionToolbar();


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


        selectedExam =
            "";


        selectedStudents.clear();


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

        const search =
            document.getElementById(
                "searchInput"
            );


        const classInput =
            document.getElementById(
                "classInput"
            );


        if (search) {

            search.value = "";
        }


        if (classInput) {

            classInput.value = "";
        }


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
// CREATE FA HALL TICKET
// ORIGINAL FA SYSTEM - NOT CHANGED
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


    html +=
        '<div class="hall-body">';


    html +=
        '<div class="hall-name-label">' +
        'Name of the Student :' +
        '</div>';


    html +=
        '<div class="hall-name-value">' +
        studentName +
        '</div>';


    html +=
        '<div class="hall-roll-label">' +
        'Roll No / VSX ID :' +
        '</div>';


    html +=
        '<div class="hall-roll-value">' +
        '________________' +
        '</div>';


    html +=
        '<div class="hall-exam">' +
        'Exam : ' +
        exam +
        '</div>';


    html +=
        '<div class="hall-class-label">' +
        'Class :' +
        '</div>';


    html +=
        '<div class="hall-class-value">' +
        className +
        '</div>';


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


    // =================================================
    // SA
    // =================================================

    if (
        selectedExam === "SA - I" ||
        selectedExam === "SA - II"
    ) {

        container.innerHTML =
            createSAHallTicket(
                student
            );


        container.style.display =
            "block";


        container.style.width =
            SA_TICKET_WIDTH +
            "mm";


        container.style.height =
            SA_TICKET_HEIGHT +
            "mm";


        const ticket =
            container.querySelector(
                ".sa-hall-ticket"
            );


        ticket.style.width =
            SA_TICKET_WIDTH +
            "mm";


        ticket.style.height =
            SA_TICKET_HEIGHT +
            "mm";


        // IMPORTANT:
        // Force white background

        ticket.style.setProperty(
            "background",
            "#ffffff",
            "important"
        );


        ticket.style.setProperty(
            "background-color",
            "#ffffff",
            "important"
        );


        return ticket;
    }


    // =================================================
    // FA
    // ORIGINAL SYSTEM
    // =================================================

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


        if (
            selectedExam === ""
        ) {

            alert(
                "Please select an exam first."
            );

            return;
        }


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


            // =================================================
            // SA INDIVIDUAL
            // A4 PORTRAIT
            // =================================================

            if (
                selectedExam === "SA - I" ||
                selectedExam === "SA - II"
            ) {

                const pdf =
                    new jsPDF(
                        "portrait",
                        "mm",
                        "a4"
                    );


                pdf.addImage(
                    image,
                    "PNG",
                    SA_MARGIN_X,
                    SA_MARGIN_Y,
                    SA_TICKET_WIDTH,
                    SA_TICKET_HEIGHT
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
                    selectedExam.replace(
                        /[^a-zA-Z0-9]/g,
                        "_"
                    );


                pdf.save(
                    studentName +
                    "_" +
                    examName +
                    "_Hall_Ticket.pdf"
                );


                return;
            }


            // =================================================
            // FA INDIVIDUAL
            // ORIGINAL LANDSCAPE
            // =================================================

            const pdf =
                new jsPDF(
                    "landscape",
                    "mm",
                    "a4"
                );


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
                selectedExam.replace(
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

// =====================================================
// BATCH DOWNLOAD PROGRESS
// =====================================================

function showBatchProgress(
    current,
    total
) {

    let overlay =
        document.getElementById(
            "batchProgressOverlay"
        );


    if (!overlay) {

        overlay =
            document.createElement(
                "div"
            );

        overlay.id =
            "batchProgressOverlay";

        overlay.style.position =
            "fixed";

        overlay.style.top =
            "0";

        overlay.style.left =
            "0";

        overlay.style.width =
            "100%";

        overlay.style.height =
            "100%";

        overlay.style.backgroundColor =
            "rgba(0, 0, 0, 0.65)";

        overlay.style.zIndex =
            "99999";

        overlay.style.display =
            "flex";

        overlay.style.alignItems =
            "center";

        overlay.style.justifyContent =
            "center";


        const box =
            document.createElement(
                "div"
            );

        box.style.backgroundColor =
            "#ffffff";

        box.style.padding =
            "26px 34px";

        box.style.borderRadius =
            "12px";

        box.style.textAlign =
            "center";

        box.style.fontFamily =
            "Arial, sans-serif";

        box.style.color =
            "#1a1a1a";


        box.innerHTML =
            '<div style="font-size:17px;font-weight:bold;margin-bottom:10px;">' +
            'Preparing hall tickets...' +
            '</div>' +
            '<div id="batchProgressText" style="font-size:15px;">' +
            '</div>';


        overlay.appendChild(
            box
        );


        document.body.appendChild(
            overlay
        );
    }


    const label =
        document.getElementById(
            "batchProgressText"
        );


    if (label) {

        label.textContent =
            current +
            " / " +
            total;
    }
}


function hideBatchProgress() {

    const overlay =
        document.getElementById(
            "batchProgressOverlay"
        );


    if (overlay) {

        overlay.remove();
    }
}


function letUiPaint() {

    return new Promise(
        function(resolve) {

            setTimeout(
                resolve,
                30
            );
        }
    );
}


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


        const batchCount =
            Math.ceil(
                data.length /
                HALL_TICKET_BATCH_SIZE
            );


        const confirmed =
            confirm(
                "Download " +
                data.length +
                " selected hall tickets for " +
                selectedExam +
                (
                    batchCount > 1 ?
                    " (" + batchCount + " PDF files, 50 per file)?" :
                    "?"
                )
            );


        if (!confirmed) {

            return;
        }


        try {

            const jsPDF =
                window.jspdf.jsPDF;


            // =================================================
            // SA SELECTED
            // 3 PER A4 PORTRAIT
            // =================================================

            if (
                selectedExam === "SA - I" ||
                selectedExam === "SA - II"
            ) {

                const totalBatches =
                    Math.ceil(
                        data.length /
                        HALL_TICKET_BATCH_SIZE
                    );


                let doneCount =
                    0;


                showBatchProgress(
                    0,
                    data.length
                );


                for (
                    let b = 0;
                    b < totalBatches;
                    b++
                ) {

                    const pdf =
                        new jsPDF(
                            "portrait",
                            "mm",
                            "a4"
                        );


                    const batch =
                        data.slice(
                            b *
                            HALL_TICKET_BATCH_SIZE,
                            (b + 1) *
                            HALL_TICKET_BATCH_SIZE
                        );


                    for (
                        let i = 0;
                        i < batch.length;
                        i++
                    ) {

                        doneCount++;


                        showBatchProgress(
                            doneCount,
                            data.length
                        );


                        await letUiPaint();



                        const ticket =
                            preparePdfTicket(
                                batch[i]
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


                        const position =
                            i % 3;


                        const x =
                            SA_MARGIN_X;


                        const y =
                            SA_MARGIN_Y +
                            (
                                position *
                                (
                                    SA_TICKET_HEIGHT +
                                    SA_GAP_Y
                                )
                            );


                        pdf.addImage(
                            image,
                            "PNG",
                            x,
                            y,
                            SA_TICKET_WIDTH,
                            SA_TICKET_HEIGHT
                        );


                        clearPdfContainer();


                        if (
                            i <
                                batch.length - 1 &&
                            position === 2
                        ) {

                            pdf.addPage();
                        }
                    }


                    const examName =
                        selectedExam.replace(
                            /[^a-zA-Z0-9]/g,
                            "_"
                        );


                    const partSuffix =
                        totalBatches > 1 ?
                        "_Part" + (b + 1) :
                        "";


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
                        "_Selected_Hall_Tickets" +
                        partSuffix +
                        ".pdf"
                    );


                    await letUiPaint();
                }


                return;
            }


            // =================================================
            // FA SELECTED
            // ORIGINAL 6 PER A4 LANDSCAPE
            // =================================================

            const totalBatches =
                Math.ceil(
                    data.length /
                    HALL_TICKET_BATCH_SIZE
                );


            let doneCount =
                0;


            showBatchProgress(
                0,
                data.length
            );


            for (
                let b = 0;
                b < totalBatches;
                b++
            ) {

                const pdf =
                    new jsPDF(
                        "landscape",
                        "mm",
                        "a4"
                    );


                const batch =
                    data.slice(
                        b *
                        HALL_TICKET_BATCH_SIZE,
                        (b + 1) *
                        HALL_TICKET_BATCH_SIZE
                    );


                for (
                    let i = 0;
                    i < batch.length;
                    i++
                ) {

                    doneCount++;


                    showBatchProgress(
                        doneCount,
                        data.length
                    );


                    await letUiPaint();



                    const ticket =
                        preparePdfTicket(
                            batch[i]
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


                    if (
                        i <
                            batch.length - 1 &&
                            position === 5
                        ) {

                            pdf.addPage();
                        }
                }


                const examName =
                    selectedExam.replace(
                        /[^a-zA-Z0-9]/g,
                        "_"
                    );


                const partSuffix =
                    totalBatches > 1 ?
                    "_Part" + (b + 1) :
                    "";


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
                    "_Selected_Hall_Tickets" +
                    partSuffix +
                    ".pdf"
                );


                await letUiPaint();
            }

        } catch (error) {

            console.error(
                error
            );


            alert(
                "Failed to create selected hall tickets."
            );

        } finally {

            clearPdfContainer();
            hideBatchProgress();
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


        const batchCount =
            Math.ceil(
                data.length /
                HALL_TICKET_BATCH_SIZE
            );


        const confirmed =
            confirm(
                "Download " +
                data.length +
                " hall tickets for " +
                selectedExam +
                (
                    batchCount > 1 ?
                    " (" + batchCount + " PDF files, 50 per file)?" :
                    "?"
                )
            );


        if (!confirmed) {

            return;
        }


        try {

            const jsPDF =
                window.jspdf.jsPDF;


            // =================================================
            // SA ALL
            // 3 PER A4 PORTRAIT
            // =================================================

            if (
                selectedExam === "SA - I" ||
                selectedExam === "SA - II"
            ) {

                const totalBatches =
                    Math.ceil(
                        data.length /
                        HALL_TICKET_BATCH_SIZE
                    );


                let doneCount =
                    0;


                showBatchProgress(
                    0,
                    data.length
                );


                for (
                    let b = 0;
                    b < totalBatches;
                    b++
                ) {

                    const pdf =
                        new jsPDF(
                            "portrait",
                            "mm",
                            "a4"
                        );


                    const batch =
                        data.slice(
                            b *
                            HALL_TICKET_BATCH_SIZE,
                            (b + 1) *
                            HALL_TICKET_BATCH_SIZE
                        );


                    for (
                        let i = 0;
                        i < batch.length;
                        i++
                    ) {

                        doneCount++;


                        showBatchProgress(
                            doneCount,
                            data.length
                        );


                        await letUiPaint();



                        const student =
                            batch[i];



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


                        const position =
                            i % 3;


                        const x =
                            SA_MARGIN_X;


                        const y =
                            SA_MARGIN_Y +
                            (
                                position *
                                (
                                    SA_TICKET_HEIGHT +
                                    SA_GAP_Y
                                )
                            );


                        pdf.addImage(
                            image,
                            "PNG",
                            x,
                            y,
                            SA_TICKET_WIDTH,
                            SA_TICKET_HEIGHT
                        );


                        clearPdfContainer();


                        if (
                            i <
                                batch.length - 1 &&
                            position === 2
                        ) {

                            pdf.addPage();
                        }
                    }


                    const examName =
                        selectedExam.replace(
                            /[^a-zA-Z0-9]/g,
                            "_"
                        );


                    const partSuffix =
                        totalBatches > 1 ?
                        "_Part" + (b + 1) :
                        "";


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
                        "_All_Hall_Tickets" +
                        partSuffix +
                        ".pdf"
                    );


                    await letUiPaint();
                }


                return;
            }


            // =================================================
            // FA ALL
            // ORIGINAL 6 PER A4 LANDSCAPE
            // =================================================

            const totalBatches =
                Math.ceil(
                    data.length /
                    HALL_TICKET_BATCH_SIZE
                );


            let doneCount =
                0;


            showBatchProgress(
                0,
                data.length
            );


            for (
                let b = 0;
                b < totalBatches;
                b++
            ) {

                const pdf =
                    new jsPDF(
                        "landscape",
                        "mm",
                        "a4"
                    );


                const batch =
                    data.slice(
                        b *
                        HALL_TICKET_BATCH_SIZE,
                        (b + 1) *
                        HALL_TICKET_BATCH_SIZE
                    );


                for (
                    let i = 0;
                    i < batch.length;
                    i++
                ) {

                    doneCount++;


                    showBatchProgress(
                        doneCount,
                        data.length
                    );


                    await letUiPaint();



                    const student =
                        batch[i];



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


                    if (
                        i <
                            batch.length - 1 &&
                            position === 5
                        ) {

                            pdf.addPage();
                        }
                }


                const examName =
                    selectedExam.replace(
                        /[^a-zA-Z0-9]/g,
                        "_"
                    );


                const partSuffix =
                    totalBatches > 1 ?
                    "_Part" + (b + 1) :
                    "";


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
                    "_All_Hall_Tickets" +
                    partSuffix +
                    ".pdf"
                );


                await letUiPaint();
            }

        } catch (error) {

            console.error(
                error
            );


            alert(
                "Failed to create all hall tickets."
            );

        } finally {

            clearPdfContainer();
            hideBatchProgress();
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

injectSAStyles();

displayExamButtons();

loadHallTicketData();
