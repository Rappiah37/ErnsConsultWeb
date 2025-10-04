
Erns Consultant – Static Site (Google Sheets Backend via Apps Script)
====================================================================

This site is fully static (HTML/CSS only). The registration form posts to your
Google Apps Script Web App, which writes to a Sheet and emails the admin/student.

Setup (Google Sheets + Apps Script)
-----------------------------------
1) Create a Google Sheet named "Student Registrations". Copy its SHEET_ID from the URL.
2) In the Sheet: Extensions → Apps Script. Replace contents with apps_script/Code.gs from this ZIP.
3) Edit Code.gs:
   - Set SHEET_ID = 'YOUR_SHEET_ID_HERE'
   - (Optional) Set ADMIN_EMAIL and THANK_YOU_URL
4) Deploy → New deployment → Web app
   - Execute as: Me
   - Who has access: Anyone
   - Authorize and copy the Web App URL

Wire the Site
-------------
1) Open register.html and replace:
     action="YOUR_APPS_SCRIPT_WEB_APP_URL"
   with the URL from step 4.
2) (Optional) Replace the redirect_url hidden field with your live GitHub Pages URL:
     <input type="hidden" name="redirect_url" value="https://YOUR_GITHUB_PAGES_URL/thankyou.html" />

PayPal (Optional)
-----------------
- The button on register.html charges $200 USD to: arichardkwaku@gmail.com
- If your PayPal business email is different, update:
     <input type="hidden" name="business" value="YOUR_PAYPAL_EMAIL">

Deploy
------
- Upload everything to GitHub Pages or any static hosting.
- No JavaScript is required on the site; no servers to manage.

Included
--------
- index.html, about.html, courses.html, tuition.html, register.html, contact.html, thankyou.html
- styles.css (deep blue theme; CSS-only responsive nav)
- images/logo.png (if provided)
- apps_script/Code.gs (paste this into Google Apps Script)
