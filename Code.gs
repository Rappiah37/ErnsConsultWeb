/**
 * Google Apps Script Web App to accept form POSTs and write to Google Sheets,
 * email the admin & student, then redirect.
 *
 * HOW TO USE:
 * 1) Put your Google Sheet ID below (SHEET_ID).
 * 2) Deploy as Web App: Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 3) Use the Web App URL as the <form action="..."> on your site.
 */
const SHEET_ID = 'YOUR_SHEET_ID_HERE';              // ← paste your Sheet ID
const SHEET_NAME = 'Registrations';                 // ← tab name (will be created if missing)
const ADMIN_EMAIL = 'ernsconsultantllc@gmail.com';  // ← where to notify
const THANK_YOU_URL = 'https://your-site.example/thankyou.html'; // default redirect (can be overridden by form 'redirect_url')

function doPost(e) {
  try {
    var p = e.parameter || {};

    // Honeypot: if filled, silently accept (likely bot)
    if (p.company) {
      return HtmlService.createHtmlOutput('<!doctype html><h2>Thank you!</h2><p>Your submission was received.</p>');
    }

    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // Initialize headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Full Name',
        'Email',
        'Phone',
        'Street Address',
        'Address Line 2',
        'City',
        'State/Province',
        'ZIP/Postal Code',
        'Country',
        'Course',
        'Notes',
        'Agree',
        'Payment Status',   // Admin column (default: Pending)
        'Email Sent'        // Admin column (Yes/No)
      ]);
    }

    // Build row values (make sure order matches headers above)
    var row = [
      new Date(),                       // Timestamp
      p.fullName || '',                 // Full Name
      p.email || '',                    // Email
      p.phone || '',                    // Phone
      p.address_street || '',           // Street Address
      p.address_line2 || '',            // Address Line 2
      p.address_city || '',             // City
      p.address_state || '',            // State/Province
      p.address_zip || '',              // ZIP/Postal Code
      p.address_country || '',          // Country
      p.course || '',                   // Course
      p.notes || '',                    // Notes
      p.agree ? 'Yes' : 'No',           // Agree
      'Pending',                        // Payment Status (default)
      ''                                // Email Sent (we will fill after email succeeds)
    ];

    // Append the row and capture the new row index
    sheet.appendRow(row);
    var lastRow = sheet.getLastRow(); // new row index

    // Email admin summary
    var adminHtml =
      'New Student Registration:<br><br>' +
      '<b>Name:</b> ' + esc(p.fullName) + '<br>' +
      '<b>Email:</b> ' + esc(p.email) + '<br>' +
      '<b>Phone:</b> ' + esc(p.phone) + '<br>' +
      '<b>Address:</b> ' + esc(p.address_street) + ' ' + esc(p.address_line2) + ', ' +
        esc(p.address_city) + ', ' + esc(p.address_state) + ' ' + esc(p.address_zip) + ', ' + esc(p.address_country) + '<br>' +
      '<b>Course:</b> ' + esc(p.course) + '<br>' +
      '<b>Notes:</b> ' + esc(p.notes) + '<br>' +
      '<b>Agree to terms:</b> ' + (p.agree ? 'Yes' : 'No') + '<br>';

    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: 'New Student Registration — Erns Consultant',
      htmlBody: adminHtml
    });

    // Email student confirmation
    var emailSent = false;
    if (p.email) {
      var studentHtml =
        'Hello ' + esc(p.fullName || 'Student') + ',<br><br>' +
        'We received your registration for <b>' + esc(p.course || 'SPT Course') + '</b>.<br>' +
        'Next step: please pay <b>$200 (non-refundable)</b> via PayPal, Zelle, or CashApp to confirm your spot.<br>' +
        'Questions? Email <a href="mailto:ernsconsultantllc@gmail.com">ernsconsultantllc@gmail.com</a>.<br><br>' +
        '— Erns Consultant';
      MailApp.sendEmail({
        to: p.email,
        subject: 'Registration Received — Erns Consultant',
        htmlBody: studentHtml
      });
      emailSent = true;
    }

    // Update "Email Sent" column for the new row
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var emailCol = headers.indexOf('Email Sent') + 1; // 1-based index
    if (emailSent && emailCol > 0) {
      sheet.getRange(lastRow, emailCol).setValue('Yes');
    }

    // Redirect to thank-you page (allow override from form)
    var redirectUrl = (p.redirect_url && safeUrl(p.redirect_url)) || THANK_YOU_URL;
    var html = '<!doctype html><meta http-equiv="refresh" content="0;url=' + redirectUrl + '">' +
               '<p>Thank you! If you are not redirected, <a href="' + redirectUrl + '">click here</a>.</p>';
    return HtmlService.createHtmlOutput(html);

  } catch (err) {
    return HtmlService.createHtmlOutput('<!doctype html><h2>Error</h2><pre>' + String(err) + '</pre>');
  }
}

// Escape minimal HTML
function esc(s){ return String(s||'').replace(/[<>&]/g, (c)=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c])); }
// Sanitize URL for redirect
function safeUrl(u){ return String(u||'').replace(/["<>]/g,''); }
