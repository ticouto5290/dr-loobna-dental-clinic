// ============================================================
//  Main Application Logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  applyConfig();
  initScrollAnimations();
  initMobileMenu();
  initBooking();
  initContactForm();
  injectChatbot();
});

/* ---------- Apply config values to the page ---------- */
function applyConfig() {
  const c = SITE_CONFIG;

  // Text content
  document.querySelectorAll('[data-clinic-name]').forEach(el => el.textContent = c.clinicName);
  document.querySelectorAll('[data-doctor-name]').forEach(el => el.textContent = c.doctorName);
  document.querySelectorAll('[data-tagline]').forEach(el => el.textContent = c.tagline);
  document.querySelectorAll('[data-phone]').forEach(el => {
    el.textContent = c.phone;
    if (el.tagName === 'A') el.href = `tel:${c.phone.replace(/\s/g, '')}`;
  });
  document.querySelectorAll('[data-email]').forEach(el => {
    el.textContent = c.email;
    if (el.tagName === 'A') el.href = `mailto:${c.email}`;
  });
  document.querySelectorAll('[data-address]').forEach(el => el.textContent = c.address);
  document.querySelectorAll('[data-whatsapp]').forEach(el => {
    el.href = `https://wa.me/${c.whatsapp}`;
  });

  // Theme colors
  if (c.colors) {
    document.documentElement.style.setProperty('--primary', c.colors.primary);
    document.documentElement.style.setProperty('--primary-dark', c.colors.primaryDark);
    document.documentElement.style.setProperty('--accent', c.colors.accent);
    document.documentElement.style.setProperty('--soft-bg', c.colors.softBg);
  }

  // Title
  document.title = c.clinicName + ' | Modern Dental Care';
}

/* ---------- Scroll animations ---------- */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('nav ul');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => menu.classList.toggle('open'));
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => menu.classList.remove('open'));
  });
}

/* ---------- Chatbot injection ---------- */
function injectChatbot() {
  const script = SITE_CONFIG.chatbotScript?.trim();
  if (!script || script.includes('<!--')) return;

  const container = document.createElement('div');
  container.innerHTML = script;
  document.body.appendChild(container);
}

/* ============================================================
   APPOINTMENT BOOKING (Google Sheet via Apps Script)
   ============================================================ */

let selectedDate = null;
let selectedSlot = null;
let currentStep = 1;

function initBooking() {
  const dateInput = document.getElementById('booking-date');
  if (!dateInput) return;

  // Set min date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = tomorrow.toISOString().split('T')[0];

  // Max date ~ 60 days ahead
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);
  dateInput.max = maxDate.toISOString().split('T')[0];

  dateInput.addEventListener('change', onDateSelected);

  document.getElementById('btn-book')?.addEventListener('click', submitBooking);
  document.getElementById('btn-back-slots')?.addEventListener('click', () => goToStep(2));
}

async function onDateSelected(e) {
  selectedDate = e.target.value;
  selectedSlot = null;

  if (!selectedDate) return;

  goToStep(2);
  const slotsContainer = document.getElementById('slots-container');
  slotsContainer.innerHTML = '<p class="booking-message loading">Loading available times...</p>';

  try {
    const slots = await fetchAvailableSlots(selectedDate);
    renderSlots(slots);
  } catch (err) {
    console.error(err);
    slotsContainer.innerHTML = `
      <p class="booking-message error">
        Could not load slots. Please check the booking system configuration or try again later.
      </p>`;
  }
}

async function fetchAvailableSlots(date) {
  const url = SITE_CONFIG.bookingScriptUrl;
  if (!url) {
    // Demo mode – generate fake slots when no script URL is set
    return generateDemoSlots(date);
  }

  const res = await fetch(`${url}?action=getSlots&date=${date}`);
  if (!res.ok) throw new Error('Network error');
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.slots || [];
}

function generateDemoSlots(date) {
  // Used only when bookingScriptUrl is empty (demo / testing)
  const day = new Date(date + 'T12:00:00').getDay(); // 0=Sun
  const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const hours = SITE_CONFIG.openingHours[dayNames[day]];

  if (!hours || !hours.open) return [];

  const slots = [];
  let [h, m] = hours.open.split(':').map(Number);
  const [endH, endM] = hours.close.split(':').map(Number);
  const duration = SITE_CONFIG.slotDuration || 30;

  while (h < endH || (h === endH && m < endM)) {
    const time = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    // Randomly mark some as booked for demo realism
    const available = Math.random() > 0.35;
    slots.push({ time, available });
    m += duration;
    if (m >= 60) { h++; m -= 60; }
  }
  return slots;
}

function renderSlots(slots) {
  const container = document.getElementById('slots-container');
  if (!slots.length) {
    container.innerHTML = '<p class="booking-message error">No available slots on this day. Please choose another date.</p>';
    return;
  }

  container.innerHTML = '<div class="slots-grid" id="slots-grid"></div>';
  const grid = document.getElementById('slots-grid');

  slots.forEach(slot => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'slot-btn';
    btn.textContent = slot.time;
    btn.disabled = !slot.available;
    if (slot.available) {
      btn.addEventListener('click', () => selectSlot(slot.time, btn));
    }
    grid.appendChild(btn);
  });
}

function selectSlot(time, btn) {
  selectedSlot = time;
  document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  goToStep(3);
}

function goToStep(step) {
  currentStep = step;
  document.querySelectorAll('.step').forEach((el, i) => {
    el.classList.remove('active', 'done');
    if (i + 1 < step) el.classList.add('done');
    if (i + 1 === step) el.classList.add('active');
  });

  document.getElementById('step-date').style.display  = step === 1 ? 'block' : 'none';
  document.getElementById('step-slots').style.display = step === 2 ? 'block' : 'none';
  document.getElementById('step-details').style.display = step === 3 ? 'block' : 'none';

  if (step === 3) {
    document.getElementById('selected-summary').textContent =
      `Selected: ${selectedDate} at ${selectedSlot}`;
  }
}

async function submitBooking() {
  const name  = document.getElementById('patient-name').value.trim();
  const phone = document.getElementById('patient-phone').value.trim();
  const email = document.getElementById('patient-email').value.trim();
  const note  = document.getElementById('patient-note').value.trim();
  const msgEl = document.getElementById('booking-result');

  if (!name || !phone) {
    msgEl.className = 'booking-message error';
    msgEl.textContent = 'Please enter your name and phone number.';
    return;
  }

  msgEl.className = 'booking-message loading';
  msgEl.textContent = 'Booking your appointment...';

  const payload = {
    action: 'book',
    date: selectedDate,
    time: selectedSlot,
    name,
    phone,
    email,
    note,
    clinic: SITE_CONFIG.clinicName
  };

  try {
    if (!SITE_CONFIG.bookingScriptUrl) {
      // Demo mode
      await new Promise(r => setTimeout(r, 900));
      msgEl.className = 'booking-message success';
      msgEl.innerHTML = `✅ Appointment requested for <strong>${selectedDate} at ${selectedSlot}</strong>.<br>
        (Demo mode – connect Google Sheet to make this real)`;
      resetBookingForm();
      return;
    }

    const res = await fetch(SITE_CONFIG.bookingScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // Apps Script prefers text/plain for CORS
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      msgEl.className = 'booking-message success';
      msgEl.innerHTML = `✅ Appointment confirmed for <strong>${selectedDate} at ${selectedSlot}</strong>.<br>
        We will contact you shortly on ${phone}.`;
      resetBookingForm();
    } else {
      throw new Error(data.error || 'Booking failed');
    }
  } catch (err) {
    console.error(err);
    msgEl.className = 'booking-message error';
    msgEl.textContent = 'Sorry, something went wrong. Please try again or call us directly.';
  }
}

function resetBookingForm() {
  selectedDate = null;
  selectedSlot = null;
  document.getElementById('booking-date').value = '';
  document.getElementById('patient-name').value = '';
  document.getElementById('patient-phone').value = '';
  document.getElementById('patient-email').value = '';
  document.getElementById('patient-note').value = '';
  setTimeout(() => goToStep(1), 4000);
}

/* ============================================================
   CONTACT FORM
   ============================================================ */

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Sending...';

    const data = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      message: form.message.value,
      _subject: `New enquiry – ${SITE_CONFIG.clinicName}`
    };

    try {
      if (SITE_CONFIG.formspreeId) {
        const res = await fetch(`https://formspree.io/f/${SITE_CONFIG.formspreeId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Formspree error');
      } else {
        // Fallback: open mailto
        const body = `Name: ${data.name}%0APhone: ${data.phone}%0AEmail: ${data.email}%0A%0A${data.message}`;
        window.location.href = `mailto:${SITE_CONFIG.email}?subject=${encodeURIComponent(data._subject)}&body=${body}`;
      }

      form.reset();
      alert('Thank you! Your message has been sent.');
    } catch (err) {
      alert('Could not send message. Please call or WhatsApp us instead.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  });
}
