/**
 * WERK Asset Management System - Main JavaScript
 */

// Import Bootstrap
const bootstrap = window.bootstrap

document.addEventListener("DOMContentLoaded", () => {
  // Sidebar toggle for mobile
  const sidebarToggle = document.getElementById("sidebarToggle")
  const sidebar = document.getElementById("sidebar")

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("show")
    })

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
          sidebar.classList.remove("show")
        }
      }
    })
  }

  // Auto-hide alerts after 5 seconds
  const alerts = document.querySelectorAll(".alert:not(.alert-permanent)")
  alerts.forEach((alert) => {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert)
      bsAlert.close()
    }, 5000)
  })

  // Confirm delete actions
  const deleteButtons = document.querySelectorAll("[data-confirm-delete]")
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      const message = this.getAttribute("data-confirm-delete") || "Are you sure you want to delete this item?"
      if (!confirm(message)) {
        e.preventDefault()
      }
    })
  })

  // Form validation
  const forms = document.querySelectorAll(".needs-validation")
  forms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      if (!form.checkValidity()) {
        e.preventDefault()
        e.stopPropagation()
      }
      form.classList.add("was-validated")
    })
  })

  // Auto-generate tag numbers
  const tagNumberInputs = document.querySelectorAll("[data-auto-tag]")
  tagNumberInputs.forEach((input) => {
    if (!input.value) {
      const prefix = input.getAttribute("data-auto-tag") || "WRK"
      const year = new Date().getFullYear()
      const random = Math.floor(Math.random() * 9999) + 1
      input.value = `${prefix}-${year}-${random.toString().padStart(4, "0")}`
    }
  })

  // Search functionality
  const searchInputs = document.querySelectorAll("[data-search-table]")
  searchInputs.forEach((input) => {
    const tableId = input.getAttribute("data-search-table")
    const table = document.getElementById(tableId)

    if (table) {
      input.addEventListener("keyup", function () {
        const searchTerm = this.value.toLowerCase()
        const rows = table.querySelectorAll("tbody tr")

        rows.forEach((row) => {
          const text = row.textContent.toLowerCase()
          row.style.display = text.includes(searchTerm) ? "" : "none"
        })
      })
    }
  })

  // Tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))

  // Popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
  popoverTriggerList.map((popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl))
})

// Utility functions
function showLoading(element) {
  if (element) {
    element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...'
    element.disabled = true
  }
}

function hideLoading(element, originalText) {
  if (element) {
    element.innerHTML = originalText
    element.disabled = false
  }
}

function showAlert(message, type = "info") {
  const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `

  const container = document.querySelector(".content-body")
  if (container) {
    container.insertAdjacentHTML("afterbegin", alertHtml)
  }
}

// Export functions
function exportTableToCSV(tableId, filename) {
  const table = document.getElementById(tableId)
  if (!table) return

  const csv = []
  const rows = table.querySelectorAll("tr")

  rows.forEach((row) => {
    const cols = row.querySelectorAll("td, th")
    const rowData = []

    cols.forEach((col) => {
      rowData.push('"' + col.textContent.replace(/"/g, '""') + '"')
    })

    csv.push(rowData.join(","))
  })

  const csvContent = csv.join("\n")
  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = filename || "export.csv"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

// AJAX helper
function makeRequest(url, options = {}) {
  const defaults = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  }

  const config = Object.assign(defaults, options)

  return fetch(url, config)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .catch((error) => {
      console.error("Request failed:", error)
      throw error
    })
}
