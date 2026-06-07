/* =========================================================
  Solvanta Consulting
  Certificate Verification
  ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("verifyForm");
  const certInput = document.getElementById("certificateId");
  const statusEl = document.getElementById("verifyStatus");
  const resultBox = document.getElementById("verifyResult");
  const resultLabel = document.getElementById("verifyResultLabel");
  const resultTitle = document.getElementById("verifyResultTitle");
  const resultBody = document.getElementById("verifyResultBody");

  if (!form || !certInput) return;

  // Pre-fill from URL parameter (?id=SOLV-AIP-2026-000001)
  const urlParams = new URLSearchParams(window.location.search);
  const certFromUrl = urlParams.get("id");
  if (certFromUrl) {
    certInput.value = certFromUrl.trim();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const certId = certInput.value.trim();

    if (!certId) {
      showStatus("Please enter a certificate ID.", "error");
      return;
    }

    const apiUrl = getApiUrl();
    if (!apiUrl) {
      showStatus("Verification system is not yet connected. Please try again later.", "error");
      return;
    }

    showStatus("Checking certificate...", "");
    hideResult();

    try {
      const url = new URL(apiUrl);
      url.searchParams.set("action", "verifyCertificate");
      url.searchParams.set("certificateId", certId);

      const response = await fetch(url.toString(), { method: "GET" });

      if (!response.ok) {
        throw new Error("Server returned an error. Please try again.");
      }

      const data = await response.json();

      if (data.success && data.valid) {
        showStatus("", "");
        showResult("valid", data);
      } else if (data.success && !data.valid) {
        showStatus("", "");
        showResult("invalid", data);
      } else {
        showStatus(data.message || "Verification failed. Please try again.", "error");
      }

    } catch (err) {
      console.error("Verification error:", err);
      showStatus("Unable to reach the verification system. Please try again later.", "error");
    }
  });

  function showStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = "form-status" + (type ? " " + type : "");
  }

  function hideResult() {
    if (!resultBox) return;
    resultBox.classList.add("hidden");
    resultBox.classList.remove("valid", "invalid", "error");
  }

  function showResult(status, data) {
    if (!resultBox) return;

    resultBox.classList.remove("hidden", "valid", "invalid", "error");
    resultBox.classList.add(status);

    if (resultLabel) {
      resultLabel.textContent = status === "valid" ? "Valid certificate" : "Certificate not found";
      resultLabel.className = "status-label " + status;
    }

    if (resultTitle) {
      resultTitle.textContent = status === "valid"
        ? "This certificate is valid."
        : "No certificate found for this ID.";
    }

    if (resultBody) {
      if (status === "valid") {
        resultBody.innerHTML = buildResultRows([
          { label: "Learner name", value: data.learnerName },
          { label: "Course", value: data.courseName },
          { label: "Certificate type", value: data.certificateType },
          { label: "Issue date", value: formatDate(data.issueDate) },
          { label: "Status", value: data.status },
          { label: "Score", value: data.score ? data.score + "%" : null },
          { label: "Certificate ID", value: data.certificateId },
          { label: "Issued by", value: "Solvanta Consulting" }
        ]);
      } else {
        resultBody.innerHTML =
          '<p class="muted">No certificate record was found for the ID you entered. ' +
          'Please check the certificate ID and try again. If you believe this is an error, ' +
          'contact us at <a href="/contact/">the contact page</a>.</p>' +
          '<p class="muted">Entered ID: <strong>' + escapeHtml(certInput.value.trim()) + '</strong></p>';
      }
    }

    resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function buildResultRows(rows) {
    return rows
      .filter(row => row.value)
      .map(row =>
        '<div class="result-row">' +
        '<span class="result-label">' + escapeHtml(row.label) + '</span>' +
        '<span class="result-value">' + escapeHtml(String(row.value)) + '</span>' +
        '</div>'
      )
      .join("");
  }

  function formatDate(dateStr) {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return dateStr;
    }
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
});
