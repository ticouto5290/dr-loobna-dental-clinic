// ============================================================
//  CLINIC CONFIGURATION - Edit this file for each new website
// ============================================================

const SITE_CONFIG = {
  // Basic Info
  clinicName: "Dr. Loobna Boodoo Niamut Dental Clinic",
  doctorName: "Dr. Loobna Boodoo Niamut",
  tagline: "Gentle, modern dental care in Triolet",
  phone: "+230 5793 0699",
  email: "info@drloobnadental.mu",          // Display email
  address: "Sajeewanlall Road, Triolet, Mauritius",
  whatsapp: "23057930699",                  // Without + for wa.me link

  // Contact Form - uses Formspree (free) or any endpoint
  // 1. Go to https://formspree.io → create form → paste the form ID below
  // 2. Or leave empty and the form will use mailto fallback
  formspreeId: "",                          // e.g. "xpwzgkqr"

  // From email shown in contact form notifications (used by Formspree / your backend)
  fromEmail: "noreply@yourdomain.com",

  // Google Apps Script Web App URL for Appointment Booking
  // Deploy the provided Apps Script as Web App (Anyone access) and paste URL here
  bookingScriptUrl: "",                     // e.g. "https://script.google.com/macros/s/AKfycb.../exec"

  // Opening hours (used by the booking system + display)
  openingHours: {
    monday:    { open: "09:00", close: "17:00" },
    tuesday:   { open: "09:00", close: "17:00" },
    wednesday: { open: "09:00", close: "17:00" },
    thursday:  { open: "09:00", close: "17:00" },
    friday:    { open: "09:00", close: "17:00" },
    saturday:  { open: "09:00", close: "13:00" },
    sunday:    { open: null,    close: null }   // closed
  },

  // Slot duration in minutes
  slotDuration: 30,

  // Chatbot / AI Agent code
  // Paste any chatbot script here (Tidio, Crisp, custom agent, etc.)
  // It will be injected automatically
  chatbotScript: `
    <!-- Example: paste your chatbot code between the backticks -->
    <!-- 
    <script>
      // Your AI agent / chatbot embed code goes here
    </script>
    -->
  `,

  // Theme colors (optional override)
  colors: {
    primary: "#0d6efd",
    primaryDark: "#0a58ca",
    accent: "#20c997",
    softBg: "#f0f7ff"
  }
};
