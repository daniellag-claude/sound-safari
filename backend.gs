/* ============================================================
   SOUND SAFARI - device-bound code backend
   Runs free on Google Apps Script. Paste this into the Apps Script
   editor of a Google Sheet, then Deploy as a Web app ("Anyone").
   See SETUP-BACKEND.txt for the click-by-click guide.

   The Sheet must have a tab called "Codes" with these headers in row 1:
     A: Code     B: Customer   C: Device   D: Active   E: RedeemedAt
   ============================================================ */

function doGet(e) {
  var action = (e.parameter.action || "").toLowerCase();
  var code   = (e.parameter.code   || "").trim().toUpperCase();
  var device = (e.parameter.device || "").trim();

  var out;
  if (action === "redeem")      out = redeem(code, device);
  else if (action === "check")  out = check(code, device);
  else                          out = { ok: false, reason: "bad-request" };

  return ContentService
    .createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheet_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Codes");
}

/* find the row index (1-based) for a code, or -1 */
function findRow_(sh, code) {
  var data = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 0), 1).getValues();
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0]).trim().toUpperCase() === code) return i + 2;
  }
  return -1;
}

function redeem(code, device) {
  if (!code || !device) return { ok: false, reason: "bad-request" };
  var sh = sheet_();
  var row = findRow_(sh, code);
  if (row === -1) return { ok: false, reason: "wrong-code" };

  var customer = sh.getRange(row, 2).getValue();
  var boundTo  = String(sh.getRange(row, 3).getValue()).trim();
  var active   = sh.getRange(row, 4).getValue();
  if (active === false || String(active).toUpperCase() === "FALSE")
    return { ok: false, reason: "disabled" };

  if (!boundTo) {
    // first activation: bind this device
    sh.getRange(row, 3).setValue(device);
    sh.getRange(row, 5).setValue(new Date());
    return { ok: true, customer: customer };
  }
  if (boundTo === device) return { ok: true, customer: customer };
  return { ok: false, reason: "used-elsewhere" };
}

function check(code, device) {
  if (!code || !device) return { ok: false, reason: "bad-request" };
  var sh = sheet_();
  var row = findRow_(sh, code);
  if (row === -1) return { ok: false, reason: "wrong-code" };

  var boundTo = String(sh.getRange(row, 3).getValue()).trim();
  var active  = sh.getRange(row, 4).getValue();
  if (active === false || String(active).toUpperCase() === "FALSE")
    return { ok: false, reason: "disabled" };
  if (boundTo === device) return { ok: true };
  return { ok: false, reason: "used-elsewhere" };
}
