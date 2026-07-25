# Dr. Loobna Boodoo Niamut Dental Clinic – Simple Website

A clean, modern, mobile-friendly website with:

- Animated elements
- Online appointment scheduler linked to **Google Sheets**
- Contact form
- Central `config.js` so you can clone this for many small client sites
- Ready for GitHub Pages or Railway (static)
- Placeholder for chatbot / AI agent code

---

## Quick Start (Demo mode – no Google Sheet needed)

1. Open `index.html` in a browser, **or**
2. Put the whole folder on GitHub Pages / any static host.

The booking system works in **demo mode** (fake available slots) until you connect a real Google Sheet.

---

## Connect Real Appointment Booking (Google Sheet)

### Step 1 – Create the Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com) → Blank spreadsheet
2. Name it e.g. `Dental Appointments – Dr Loobna`
3. In **row 1** put these exact headers:

| A       | B    | C    | D     | E     | F    | G      | H       |
|---------|------|------|-------|-------|------|--------|---------|
| Date    | Time | Name | Phone | Email | Note | Status | Created |

### Step 2 – Add the Apps Script
1. In the Sheet go to **Extensions → Apps Script**
2. Delete everything in the editor
3. Copy the entire content of `google-apps-script.js` and paste it
4. Click the **Save** icon (or Ctrl+S)
5. Click **Deploy → New deployment**
   - Select type: **Web app**
   - Description: `Booking API`
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy**
7. Copy the **Web App URL** (looks like `https://script.google.com/macros/s/AKfycb.../exec`)

### Step 3 – Paste the URL into the website
Open `js/config.js` and set:

```js
bookingScriptUrl: "https://script.google.com/macros/s/AKfycb.../exec",
```

Save and refresh the website. Booking is now live!

> Tip: Every new booking appears automatically as a new row in your Google Sheet.  
> You can also manually type a Date + Time + Status “Booked” to block a slot.

---

## Contact Form

Two options:

**A. Formspree (recommended – free)**
1. Go to [formspree.io](https://formspree.io) → create a form
2. Copy the form ID
3. In `js/config.js` set:
   ```js
   formspreeId: "yourFormIdHere",
   ```

**B. Mailto fallback**  
Leave `formspreeId` empty. The form will open the visitor’s email client.

---

## Add a Chatbot / AI Agent later

In `js/config.js` find the `chatbotScript` field and paste any embed code (Tidio, Crisp, custom agent, etc.) between the backticks.

Example:
```js
chatbotScript: `
  <script src="https://your-agent-provider.com/widget.js"></script>
`,
```

The script is injected automatically on every page load.

---

## Customise for a new client (multiple websites)

1. Duplicate the whole `dental-clinic` folder
2. Edit **only** `js/config.js`:
   - clinicName, doctorName, phone, email, address, whatsapp
   - bookingScriptUrl (new Sheet for that client)
   - formspreeId
   - openingHours, colors, chatbotScript
3. Change texts/images in `index.html` if needed
4. Deploy the new folder as a separate site

This keeps every client site independent and easy to maintain.

---

## Hosting options

### GitHub Pages (completely free)
1. Create a new GitHub repository
2. Upload all files
3. Settings → Pages → Source: main branch → Save
4. Site will be live at `https://yourusername.github.io/repo-name`

### Railway (free tier)
1. Create a new project → Deploy from GitHub or upload
2. Use a simple static server (or just serve the folder)
3. Railway can also host multiple services if you later add databases

### Other free options
- Netlify, Vercel, Cloudflare Pages – all work with this static site

---

## File structure

```
dental-clinic/
├── index.html              ← Main page
├── css/
│   └── style.css           ← All styles + animations
├── js/
│   ├── config.js           ← ★ Edit this for every new client
│   └── main.js             ← Booking + form logic
├── google-apps-script.js   ← Copy this into your Google Sheet
├── assets/                 ← Put images/logo here later
└── README.md
```

---

## Next steps you asked for
- Chatbot will later use the same Google Sheet connection (the Apps Script can be extended)
- You can add more fields or services easily
- When a client says “I want this website”, just duplicate the folder, change `config.js`, connect their Sheet, and hand it over.

Need any change (colours, extra services, logo, multi-language, etc.) just tell me!
