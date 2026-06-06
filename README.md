# Solvanta Learning

> Simple courses. Practical exercises. Support when it matters.

A lightweight learning and certification platform built on GitHub Pages, Google Apps Script, and Google Sheets.

---

## Overview

Solvanta Learning is a static website hosted on GitHub Pages. It connects to a Google Apps Script Web App to handle certificate verification, course enquiries, and learner registration. All data is stored in a Google Sheet.

No servers. No databases. No accounts required for public content.

---

## Architecture

```
GitHub Pages (Frontend)
        |
        | fetch() API calls
        v
Google Apps Script Web App (Backend)
        |
        | read / write
        v
Google Sheets (Database)
```

---

## Pages

| Page | Path | Purpose |
|------|------|---------|
| Home | / | Introduction, featured courses, CTAs |
| Courses | /courses/ | Course list loaded from Sheets via API |
| Verify | /verify/ | Certificate verification by ID |
| Contact | /contact/ | Enquiry and interest form |
| Privacy Policy | /privacy-policy/ | Privacy information |
| Terms of Use | /terms/ | Terms |
| Certificate Policy | /certificate-policy/ | Certificate terms |
| Data Deletion | /data-deletion/ | Deletion request process |

---

## Google Sheets Structure

Create a Google Sheet with the following tabs:

### Settings
| Key | Value | Notes |
|-----|-------|-------|
| Site Name | Solvanta Learning | |
| Support Email | helpdesk@solvantaconsulting.com | |

### Courses
| Course ID | Course Name | Short Description | Status | Display Order | Created At | Updated At |
|-----------|------------|-------------------|--------|---------------|------------|------------|
| SOLV-AI-001 | AI Prompting Basics | Learn to write better prompts | active | 1 | | |

**Status values:** `active` | `coming-soon` | `draft` | `archived`

### Learners
| Timestamp | Learner ID | Name | Email | Phone | Course Interest | Message | Source Page | Status |
|-----------|-----------|------|-------|-------|----------------|---------|-------------|--------|

### Certificates
| Certificate ID | Learner Name | Learner Email | Course ID | Course Name | Certificate Type | Issue Date | Expiry Date | Status | Score | Notes |
|---------------|-------------|--------------|-----------|------------|-----------------|------------|-------------|--------|-------|-------|

**Certificate ID format:** `SL-2026-000001`
**Certificate Type values:** `Certificate of Completion` | `Certificate of Assessment`
**Status values:** `Active` | `Revoked` | `Deleted`

### Enquiries
| Timestamp | Name | Email | Phone | Course Interest | Message | Source Page | Status |
|-----------|------|-------|-------|----------------|---------|-------------|--------|

**Status values:** `New` | `Replied` | `Resolved`

### Logs
| Timestamp | Action | Status | Message | Payload |
|-----------|--------|--------|---------|---------|

---

## Setup: Google Apps Script

### Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it **Solvanta Learning Data**
4. Copy the Sheet ID from the URL bar
   - URL looks like: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - The Sheet ID is the long string between `/d/` and `/edit`

### Step 2 — Set up Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click **New project**
3. Name it **Solvanta Learning Backend**
4. Delete the default code in Code.gs
5. Open the file `google-apps-script/Code.gs` from this repository
6. Copy the entire contents and paste it into Code.gs in Apps Script
7. Find this line at the top and replace the placeholder with your Sheet ID:
   ```
   const SPREADSHEET_ID = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE";
   ```

### Step 3 — Initialise the Sheets

1. In the Apps Script editor, select the function `initSheets` from the dropdown
2. Click **Run**
3. Approve any permissions that are requested
4. Check your Google Sheet — it should now have all 6 tabs with headers

### Step 4 — Deploy as a Web App

1. In Apps Script, click **Deploy** > **New deployment**
2. Click the gear icon next to **Type** and select **Web app**
3. Set **Execute as:** Me
4. Set **Who has access:** Anyone
5. Click **Deploy**
6. Copy the Web App URL (it will look like `https://script.google.com/macros/s/XXXXXX/exec`)

### Step 5 — Connect the frontend

1. Open `assets/js/config.js` in this repository
2. Find this line:
   ```
   API_URL: "PASTE_APPS_SCRIPT_URL_HERE",
   ```
3. Replace `PASTE_APPS_SCRIPT_URL_HERE` with the Web App URL you just copied
4. Commit the change

The site will immediately start connecting to the backend.

---

## Certificate Management

To issue a certificate:

1. Open the **Certificates** tab in your Google Sheet
2. Add a new row with:
   - **Certificate ID:** Follow the format `SL-YYYY-XXXXXX` (e.g. `SL-2026-000001`)
   - **Learner Name:** Full name exactly as it should appear on verification
   - **Learner Email:** Private — not shown on public verification page
   - **Course Name:** Matching the course name in the Courses sheet
   - **Certificate Type:** Certificate of Completion or Certificate of Assessment
   - **Issue Date:** In a date format (e.g. 15 June 2026)
   - **Status:** Active
   - **Score:** If applicable (e.g. 85 for 85%)

The certificate holder can verify their certificate at:
`https://solvantaconsulting.com/verify/?id=SL-2026-000001`

---

## Course Management

To add or update courses:

1. Open the **Courses** tab in your Google Sheet
2. Add or edit a row
3. Set **Status** to `active` for it to appear on the courses page
4. Set **Display Order** to control the order (lower number = shown first)

Courses are loaded live from the API each time the courses page loads.

---

## Updating the Apps Script

If you ever need to update the backend logic:

1. Make your changes in `google-apps-script/Code.gs` in this repository
2. Open [script.google.com](https://script.google.com) and open your project
3. Paste the updated code into Code.gs
4. Click **Deploy** > **Manage deployments**
5. Click the pencil (edit) icon next to your active deployment
6. Change **Version** to **New version**
7. Click **Deploy**

The Web App URL will stay the same — you do not need to update config.js.

---

## GitHub Pages Deployment

1. Go to your repository on GitHub
2. Click **Settings** > **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Select branch: `main`, folder: `/ (root)`
5. Click **Save**

The site will be live at your GitHub Pages URL within a few minutes.

If you have a custom domain (CNAME file already set to `solvantaconsulting.com`):
- Add a CNAME or A record at your domain registrar pointing to GitHub Pages
- GitHub will automatically provision an SSL certificate

---

## File Structure

```
/
├── index.html                    Homepage
├── courses/index.html            Courses page
├── verify/index.html             Certificate verification
├── contact/index.html            Contact / enquiry form
├── privacy-policy/index.html     Privacy Policy
├── terms/index.html              Terms of Use
├── certificate-policy/index.html Certificate Policy
├── data-deletion/index.html      Data Deletion
├── assets/
│   ├── css/styles.css            All shared styles
│   ├── js/
│   │   ├── config.js             Live configuration (API URL goes here)
│   │   ├── main.js               Shared site behaviour
│   │   ├── courses.js            Courses page logic
│   │   ├── verify.js             Certificate verification logic
│   │   └── contact.js            Contact form logic
│   └── img/                      Images
├── google-apps-script/
│   └── Code.gs                   Apps Script backend (paste into script.google.com)
├── config.example.js             Configuration template (for reference)
├── CNAME                         Custom domain
└── README.md                     This file
```

---

## API Reference

### GET verifyCertificate

```
GET {API_URL}?action=verifyCertificate&certificateId=SL-2026-000001
```

Response (valid):
```json
{
  "success": true,
  "valid": true,
  "certificateId": "SL-2026-000001",
  "learnerName": "Jane Smith",
  "courseName": "AI Prompting Basics",
  "certificateType": "Certificate of Completion",
  "issueDate": "15 June 2026",
  "status": "Active",
  "score": null
}
```

Response (not found):
```json
{ "success": true, "valid": false, "message": "No certificate found for this ID." }
```

### GET getCourses

```
GET {API_URL}?action=getCourses
```

Response:
```json
{
  "success": true,
  "courses": [
    {
      "courseId": "SOLV-AI-001",
      "courseName": "AI Prompting Basics",
      "shortDescription": "Learn to write better prompts.",
      "status": "active",
      "displayOrder": 1
    }
  ]
}
```

### POST submitEnquiry

```
POST {API_URL}
Content-Type: application/json

{
  "action": "submitEnquiry",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "",
  "courseInterest": "AI Prompting Basics",
  "message": "I would like to know when this course starts.",
  "sourcePage": "/contact/"
}
```

### POST registerInterest

```
POST {API_URL}
Content-Type: application/json

{
  "action": "registerInterest",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "courseInterest": "AI Prompting Basics",
  "sourcePage": "/courses/"
}
```

---

## Support

Email: helpdesk@solvantaconsulting.com
