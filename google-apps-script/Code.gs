// =============================================================
// Solvanta Learning — Google Apps Script Backend
// =============================================================
//
// SETUP INSTRUCTIONS:
// 1. Open Google Apps Script: https://script.google.com
// 2. Create a new project and name it "Solvanta Learning Backend"
// 3. Paste this entire file into the Code.gs editor
// 4. Update the SPREADSHEET_ID constant below with your Sheet ID
// 5. Run initSheets() once to create all tabs and headers
// 6. Deploy as a Web App:
//    - Execute as: Me
//    - Who has access: Anyone
// 7. Copy the Web App URL
// 8. Paste it into assets/js/config.js as the API_URL value
//
// =============================================================

// =============================================================
// CONFIGURATION — update this before deploying
// =============================================================

const SPREADSHEET_ID = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE";

// Sheet tab names — do not change these after initial setup
const SHEETS = {
  SETTINGS:     "Settings",
  COURSES:      "Courses",
  LEARNERS:     "Learners",
  CERTIFICATES: "Certificates",
  ENQUIRIES:    "Enquiries",
  LOGS:         "Logs"
};

// =============================================================
// ENTRY POINTS
// =============================================================

function doGet(e) {
  try {
    const action = e.parameter.action;

    if (!action) {
      return jsonResponse({ success: false, message: "Missing action parameter." });
    }

    switch (action) {
      case "verifyCertificate":
        return handleVerifyCertificate(e.parameter);
      case "getCourses":
        return handleGetCourses();
      default:
        return jsonResponse({ success: false, message: "Unknown action: " + action });
    }

  } catch (err) {
    logError("doGet", err);
    return jsonResponse({ success: false, message: "An unexpected error occurred." });
  }
}

function doPost(e) {
  try {
    let body = {};

    try {
      body = JSON.parse(e.postData.contents);
    } catch {
      return jsonResponse({ success: false, message: "Invalid request body. JSON expected." });
    }

    const action = body.action;

    if (!action) {
      return jsonResponse({ success: false, message: "Missing action parameter." });
    }

    switch (action) {
      case "submitEnquiry":
        return handleSubmitEnquiry(body);
      case "registerInterest":
        return handleRegisterInterest(body);
      default:
        return jsonResponse({ success: false, message: "Unknown action: " + action });
    }

  } catch (err) {
    logError("doPost", err);
    return jsonResponse({ success: false, message: "An unexpected error occurred." });
  }
}

// =============================================================
// GET: verifyCertificate
// =============================================================

function handleVerifyCertificate(params) {
  const certId = (params.certificateId || "").trim().toUpperCase();

  if (!certId) {
    return jsonResponse({ success: false, message: "Certificate ID is required." });
  }

  try {
    const sheet = getSheet(SHEETS.CERTIFICATES);
    const data = sheet.getDataRange().getValues();

    if (data.length < 2) {
      logAction("verifyCertificate", "MISS", certId);
      return jsonResponse({ success: true, valid: false, message: "No certificates found." });
    }

    const headers = data[0].map(h => h.toString().trim().toLowerCase());
    const rows = data.slice(1);

    // Column index lookup
    const col = {
      certificateId:    headers.indexOf("certificate id"),
      learnerName:      headers.indexOf("learner name"),
      learnerEmail:     headers.indexOf("learner email"),
      courseId:         headers.indexOf("course id"),
      courseName:       headers.indexOf("course name"),
      issueDate:        headers.indexOf("issue date"),
      expiryDate:       headers.indexOf("expiry date"),
      status:           headers.indexOf("status"),
      certificateType:  headers.indexOf("certificate type"),
      score:            headers.indexOf("score")
    };

    for (const row of rows) {
      const rowCertId = (row[col.certificateId] || "").toString().trim().toUpperCase();

      if (rowCertId === certId) {
        const status = (row[col.status] || "").toString().trim().toLowerCase();

        if (status === "revoked" || status === "deleted") {
          logAction("verifyCertificate", "REVOKED", certId);
          return jsonResponse({
            success: true,
            valid: false,
            message: "This certificate has been revoked or removed."
          });
        }

        logAction("verifyCertificate", "FOUND", certId);
        return jsonResponse({
          success: true,
          valid: true,
          certificateId:   rowCertId,
          learnerName:     row[col.learnerName] || "",
          courseName:      row[col.courseName] || "",
          certificateType: row[col.certificateType] || "Certificate of Completion",
          issueDate:       formatDate(row[col.issueDate]),
          expiryDate:      row[col.expiryDate] ? formatDate(row[col.expiryDate]) : null,
          status:          row[col.status] || "Active",
          score:           row[col.score] ? row[col.score].toString() : null
        });
      }
    }

    logAction("verifyCertificate", "NOT_FOUND", certId);
    return jsonResponse({ success: true, valid: false, message: "No certificate found for this ID." });

  } catch (err) {
    logError("verifyCertificate", err);
    return jsonResponse({ success: false, message: "Error during verification. Please try again." });
  }
}

// =============================================================
// GET: getCourses
// =============================================================

function handleGetCourses() {
  try {
    const sheet = getSheet(SHEETS.COURSES);
    const data = sheet.getDataRange().getValues();

    if (data.length < 2) {
      return jsonResponse({ success: true, courses: [] });
    }

    const headers = data[0].map(h => h.toString().trim().toLowerCase());
    const rows = data.slice(1);

    const col = {
      courseId:      headers.indexOf("course id"),
      courseName:    headers.indexOf("course name"),
      description:   headers.indexOf("short description"),
      status:        headers.indexOf("status"),
      displayOrder:  headers.indexOf("display order")
    };

    const courses = rows
      .filter(row => {
        const status = (row[col.status] || "").toString().trim().toLowerCase();
        return status === "active" || status === "coming-soon";
      })
      .map(row => ({
        courseId:         (row[col.courseId] || "").toString(),
        courseName:       (row[col.courseName] || "").toString(),
        shortDescription: (row[col.description] || "").toString(),
        status:           (row[col.status] || "coming-soon").toString(),
        displayOrder:     Number(row[col.displayOrder]) || 99
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder);

    return jsonResponse({ success: true, courses });

  } catch (err) {
    logError("getCourses", err);
    return jsonResponse({ success: false, message: "Unable to load courses." });
  }
}

// =============================================================
// POST: submitEnquiry
// =============================================================

function handleSubmitEnquiry(body) {
  const name          = (body.name || "").trim();
  const email         = (body.email || "").trim();
  const phone         = (body.phone || "").trim();
  const courseInterest = (body.courseInterest || "").trim();
  const message       = (body.message || "").trim();
  const sourcePage    = (body.sourcePage || "").trim();

  // Validation
  if (!name) {
    return jsonResponse({ success: false, message: "Name is required." });
  }
  if (!email || !isValidEmail(email)) {
    return jsonResponse({ success: false, message: "A valid email address is required." });
  }
  if (!message) {
    return jsonResponse({ success: false, message: "Message is required." });
  }

  try {
    const sheet = getSheet(SHEETS.ENQUIRIES);
    const timestamp = new Date().toISOString();

    sheet.appendRow([
      timestamp,
      name,
      email,
      phone,
      courseInterest,
      message,
      sourcePage,
      "New"
    ]);

    logAction("submitEnquiry", "SUCCESS", email);

    return jsonResponse({
      success: true,
      message: "Thank you for your message. We aim to respond within two business days."
    });

  } catch (err) {
    logError("submitEnquiry", err);
    return jsonResponse({ success: false, message: "Unable to submit your enquiry. Please try again." });
  }
}

// =============================================================
// POST: registerInterest
// =============================================================

function handleRegisterInterest(body) {
  const name           = (body.name || "").trim();
  const email          = (body.email || "").trim();
  const phone          = (body.phone || "").trim();
  const courseInterest = (body.courseInterest || "").trim();
  const message        = (body.message || "").trim();
  const sourcePage     = (body.sourcePage || "").trim();

  // Validation
  if (!name) {
    return jsonResponse({ success: false, message: "Name is required." });
  }
  if (!email || !isValidEmail(email)) {
    return jsonResponse({ success: false, message: "A valid email address is required." });
  }
  if (!courseInterest) {
    return jsonResponse({ success: false, message: "Please select a course interest." });
  }

  try {
    const sheet = getSheet(SHEETS.LEARNERS);
    const timestamp = new Date().toISOString();
    const learnerId = generateLearnerId();

    sheet.appendRow([
      timestamp,
      learnerId,
      name,
      email,
      phone,
      courseInterest,
      message,
      sourcePage,
      "Interested"
    ]);

    logAction("registerInterest", "SUCCESS", email);

    return jsonResponse({
      success: true,
      message: "Thank you. We will notify you when this course becomes available."
    });

  } catch (err) {
    logError("registerInterest", err);
    return jsonResponse({ success: false, message: "Unable to register your interest. Please try again." });
  }
}

// =============================================================
// SETUP: initSheets()
// Run this once manually from the Apps Script editor
// =============================================================

function initSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  ensureSheet(ss, SHEETS.SETTINGS, [
    "Key", "Value", "Notes"
  ]);

  ensureSheet(ss, SHEETS.COURSES, [
    "Course ID", "Course Name", "Short Description", "Status",
    "Display Order", "Created At", "Updated At"
  ]);

  ensureSheet(ss, SHEETS.LEARNERS, [
    "Timestamp", "Learner ID", "Name", "Email", "Phone",
    "Course Interest", "Message", "Source Page", "Status"
  ]);

  ensureSheet(ss, SHEETS.CERTIFICATES, [
    "Certificate ID", "Learner Name", "Learner Email", "Course ID",
    "Course Name", "Certificate Type", "Issue Date", "Expiry Date",
    "Status", "Score", "Notes"
  ]);

  ensureSheet(ss, SHEETS.ENQUIRIES, [
    "Timestamp", "Name", "Email", "Phone",
    "Course Interest", "Message", "Source Page", "Status"
  ]);

  ensureSheet(ss, SHEETS.LOGS, [
    "Timestamp", "Action", "Status", "Message", "Payload"
  ]);

  Logger.log("All sheets initialised successfully.");
}

function ensureSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    Logger.log("Created sheet: " + name);
  }
  // Only write headers if the sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    // Style the header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#f3eadf");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// =============================================================
// UTILITIES
// =============================================================

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(name);
  if (!sheet) {
    throw new Error("Sheet not found: " + name + ". Run initSheets() first.");
  }
  return sheet;
}

function jsonResponse(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatDate(value) {
  if (!value) return null;
  try {
    const d = new Date(value);
    return Utilities.formatDate(d, Session.getScriptTimeZone(), "d MMMM yyyy");
  } catch {
    return value ? value.toString() : null;
  }
}

function generateLearnerId() {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 900000) + 100000;
  return "SL-" + year + "-L" + rand;
}

function logAction(action, status, message) {
  try {
    const sheet = getSheet(SHEETS.LOGS);
    sheet.appendRow([
      new Date().toISOString(),
      action,
      status,
      message,
      ""
    ]);
  } catch (err) {
    Logger.log("Log write failed: " + err.message);
  }
}

function logError(action, err) {
  try {
    const sheet = getSheet(SHEETS.LOGS);
    sheet.appendRow([
      new Date().toISOString(),
      action,
      "ERROR",
      err.message || "Unknown error",
      err.stack || ""
    ]);
  } catch (logErr) {
    Logger.log("Error logging failed: " + logErr.message);
  }
}
