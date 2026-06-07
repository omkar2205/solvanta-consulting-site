/* =========================================================
  Solvanta Consulting
  Courses Page — Apps Script Integration
  ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  loadCourses();
});

async function loadCourses() {
  const courseList = document.getElementById("courseList");
  const statusEl = document.getElementById("courseLoadStatus");

  const apiUrl = getApiUrl();

  // If no API connected, leave the static placeholder cards as-is
  if (!apiUrl) {
    if (statusEl) {
      statusEl.textContent = "";
    }
    return;
  }

  try {
    const url = new URL(apiUrl);
    url.searchParams.set("action", "getCourses");

    const response = await fetch(url.toString(), { method: "GET" });

    if (!response.ok) {
      throw new Error("Server error loading courses.");
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.courses) && data.courses.length > 0) {
      renderCourses(courseList, data.courses);
      if (statusEl) statusEl.textContent = "";
    } else {
      // No courses from API — keep static placeholder cards
      if (statusEl) statusEl.textContent = "";
    }

  } catch (err) {
    console.error("Course load error:", err);
    // On error, keep static placeholder cards — don't show error to visitor
    if (statusEl) statusEl.textContent = "";
  }
}

function renderCourses(container, courses) {
  if (!container) return;

  container.innerHTML = courses.map(course => {
    const initials = getInitials(course.courseName || course.name);
    const name = escapeHtml(course.courseName || course.name || "Untitled Course");
    const desc = escapeHtml(course.shortDescription || course.description || "");
    const status = course.status || "coming-soon";

    return `<article class="card">
      <div class="card-icon" aria-hidden="true">${initials}</div>
      <h3>${name}</h3>
      ${desc ? `<p>${desc}</p>` : ""}
      <span class="status-badge ${escapeHtml(status.toLowerCase())}">${formatStatus(status)}</span>
    </article>`;
  }).join("");
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();
}

function formatStatus(status) {
  const map = {
    "active": "Available",
    "coming-soon": "Coming soon",
    "draft": "Coming soon",
    "archived": "Archived"
  };
  return map[status.toLowerCase()] || status;
}

function getApiUrl() {
  const config = window.SOLVANTA_CONFIG;
  if (!config || !config.API_URL || config.API_URL === "PASTE_APPS_SCRIPT_URL_HERE") {
    return null;
  }
  return config.API_URL;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
