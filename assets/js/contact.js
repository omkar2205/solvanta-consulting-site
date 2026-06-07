/* =========================================================
  Solvanta Consulting
  Contact Form — Apps Script Integration
  ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const statusEl = document.getElementById("contactStatus");
  const submitBtn = document.getElementById("contactSubmit");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("contactName")?.value.trim();
    const email = document.getElementById("contactEmail")?.value.trim();
    const phone = document.getElementById("contactPhone")?.value.trim();
    const courseInterest = document.getElementById("contactCourseInterest")?.value.trim();
    const message = document.getElementById("contactMessage")?.value.trim();
    const consent = document.getElementById("contactConsent")?.checked;

    // Validation
    if (!name) {
      showStatus("Please enter your full name.", "error");
      return;
    }

    if (!email || !isValidEmail(email)) {
      showStatus("Please enter a valid email address.", "error");
      return;
    }

    if (!message) {
      showStatus("Please enter a message.", "error");
      return;
    }

    if (!consent) {
      showStatus("Please confirm your consent before submitting.", "error");
      return;
    }

    const apiUrl = getApiUrl();

    // If no API connected, fall back to mailto guidance
    if (!apiUrl) {
      showStatus(
        'Thank you for your message. The contact system is being set up. ' +
        'For now, please email us at <a href="mailto:helpdesk@solvantaconsulting.com">helpdesk@solvantaconsulting.com</a>.',
        "success"
      );
      return;
    }

    // Disable button during submission
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }
    showStatus("Sending your message...", "");

    try {
      const payload = {
        action: "submitEnquiry",
        name,
        email,
        phone: phone || "",
        courseInterest: courseInterest || "",
        message,
        sourcePage: window.location.pathname,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Server error. Please try again.");
      }

      const data = await response.json();

      if (data.success) {
        showStatus(
          "Thank you, " + escapeHtml(name) + ". Your message has been received. " +
          "We aim to respond as soon as reasonably possible.",
          "success"
        );
        form.reset();
      } else {
        showStatus(data.message || "Something went wrong. Please try again.", "error");
      }

    } catch (err) {
      console.error("Contact form error:", err);
      showStatus(
        'Unable to send your message right now. Please email us at ' +
        '<a href="mailto:helpdesk@solvantaconsulting.com">helpdesk@solvantaconsulting.com</a>.',
        "error"
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send message";
      }
    }
  });

  function showStatus(message, type) {
    if (!statusEl) return;
    statusEl.innerHTML = message;
    statusEl.className = "form-status" + (type ? " " + type : "");
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
