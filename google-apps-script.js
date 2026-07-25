/**
 * ============================================================
 *  GOOGLE APPS SCRIPT – Appointment Booking Backend
 * ============================================================
 *
 * HOW TO SET UP (5 minutes):
 *
 * 1. Create a new Google Sheet
 *    - Name it e.g. "Dental Appointments - Dr Loobna"
 *    - In the first row (headers) put exactly:
 *      A1: Date | B1: Time | C1: Name | D1: Phone | E1: Email | F1: Note | G1: Status | H1: Created
 *
 * 2. Go to Extensions → Apps Script
 * 3. Delete any default code and paste THIS entire file
 * 4. Click Save (disk icon)
 * 5. Click Deploy → New deployment
 *    - Type: Web app
 *    - Description: Dental Booking API
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Click Deploy → Copy the Web App URL
 * 7. Paste that URL into js/config.js → bookingScriptUrl
 *
 * The Sheet will automatically receive every new booking.
 * You can also manually add "booked" rows to block slots.
 */

// ========== CONFIG ==========
const SHEET_NAME = 'Sheet1';          // Change if your sheet tab has another name
const SLOT_DURATION = 30;             // minutes
const OPENING_HOURS = {
  1: { open: '09:00', close: '17:00' }, // Monday
  2: { open: '09:00', close: '17:00' },
  3: { open: '09:00', close: '17:00' },
  4: { open: '09:00', close: '17:00' },
  5: { open: '09:00', close: '17:00' },
  6: { open: '09:00', close: '13:00' }, // Saturday
  0: null                               // Sunday closed
};

// ========== ENTRY POINTS ==========

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const result = { success: false };

  try {
    const params = e.parameter || {};
    let body = {};

    // Support both GET query params and POST JSON body
    if (e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (err) {
        body = {};
      }
    }

    const action = body.action || params.action || 'getSlots';

    if (action === 'getSlots') {
      const date = body.date || params.date;
      if (!date) throw new Error('Missing date');
      result.slots = getAvailableSlots(date);
      result.success = true;
    }
    else if (action === 'book') {
      const booking = {
        date:  body.date  || params.date,
        time:  body.time  || params.time,
        name:  body.name  || params.name,
        phone: body.phone || params.phone,
        email: body.email || params.email || '',
        note:  body.note  || params.note  || ''
      };
      if (!booking.date || !booking.time || !booking.name || !booking.phone) {
        throw new Error('Missing required fields (date, time, name, phone)');
      }
      bookAppointment(booking);
      result.success = true;
      result.message = 'Appointment booked successfully';
    }
    else {
      throw new Error('Unknown action');
    }
  } catch (err) {
    result.error = err.message;
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========== CORE LOGIC ==========

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }
  return sheet;
}

function getBookedSlots(date) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const booked = new Set();

  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const rowDate = formatDate(data[i][0]);
    const rowTime = String(data[i][1]).substring(0, 5); // HH:MM
    const status  = String(data[i][6] || 'Booked').toLowerCase();

    if (rowDate === date && status !== 'cancelled') {
      booked.add(rowTime);
    }
  }
  return booked;
}

function getAvailableSlots(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay(); // 0 = Sunday
  const hours = OPENING_HOURS[day];

  if (!hours) return []; // closed

  const booked = getBookedSlots(dateStr);
  const slots = [];

  let [h, m] = hours.open.split(':').map(Number);
  const [endH, endM] = hours.close.split(':').map(Number);

  while (h < endH || (h === endH && m < endM)) {
    const time = pad(h) + ':' + pad(m);
    slots.push({
      time: time,
      available: !booked.has(time)
    });
    m += SLOT_DURATION;
    if (m >= 60) {
      h += 1;
      m -= 60;
    }
  }
  return slots;
}

function bookAppointment(booking) {
  // Double-check the slot is still free
  const booked = getBookedSlots(booking.date);
  if (booked.has(booking.time)) {
    throw new Error('This time slot was just taken. Please choose another.');
  }

  const sheet = getSheet();
  sheet.appendRow([
    booking.date,
    booking.time,
    booking.name,
    booking.phone,
    booking.email,
    booking.note,
    'Booked',
    new Date().toISOString()
  ]);
}

// ========== HELPERS ==========

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatDate(value) {
  // Handles both Date objects and string dates from the sheet
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(value).substring(0, 10);
}
