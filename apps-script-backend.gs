// DEPRECATED — superseded by functions/order.js (a Cloudflare Pages
// Function). The order form now POSTs same-origin to /order instead of this
// external Apps Script Web App. This file is kept only as a rollback
// reference in case the Cloudflare Function needs to be backed out —
// it is no longer deployed or referenced by src/config.js.
//
// Shelby's Cookie Co. — order intake backend
//
// Receives the multipart/form-data POST from the site's order form
// (src/components/OrderForm.jsx) and creates the Order + Item rows in
// Airtable. Inspiration photos are uploaded directly into Airtable's own
// attachment storage via its "Upload attachment" endpoint — nothing is
// ever written to Google Drive.
//
// SETUP
// 1. https://script.google.com → New project → paste this whole file in,
//    replacing the default Code.gs content.
// 2. Fill in AIRTABLE_TOKEN and AIRTABLE_BASE_ID below. Leave the table
//    names as-is if your Airtable tables are named "Orders" and "Items"
//    (matching SETUP.md) — only change them if you named yours differently.
// 3. Deploy → New deployment → Web app.
//      Execute as: Me
//      Who has access: Anyone
// 4. Copy the /exec URL into src/config.js as APPS_SCRIPT_URL.
// 5. Visit the /exec URL directly in a browser once — you should see the
//    doGet() health-check message. That confirms the deployment itself works
//    before you test a real order.
// 6. Submit one real test order from the site and check that a) a row shows
//    up in Airtable and b) a photo (if you attached one) shows up in the
//    "Photos" field. If the photo doesn't appear, check View → Logs in the
//    Apps Script editor for the error — the attachment upload is the one
//    part of this I couldn't test live myself.

const CONFIG = {
  AIRTABLE_TOKEN: 'YOUR_AIRTABLE_PERSONAL_ACCESS_TOKEN',
  AIRTABLE_BASE_ID: 'YOUR_BASE_ID',
  AIRTABLE_ORDERS_TABLE: 'Orders',
  AIRTABLE_ITEMS_TABLE: 'Items',
  AIRTABLE_PHOTOS_FIELD: 'Photos',
};

function doGet(e) {
  return ContentService.createTextOutput("Shelby's Cookie Co. order endpoint is running.");
}

function doPost(e) {
  try {
    const p = e.parameter;

    const orderFields = {
      'Name': p.name || '',
      'Email': p.email || '',
      'Phone': p.phone || '',
      'Event Date': p.eventDate || '',
      'Total': parseNumber(p.total),
      'Small Batch Fee': parseNumber(p.smallBatchFee),
      'Order Summary': p.orderSummary || '',
      'Device Type': p.deviceType || '',
      'Status': 'New',
      // No form UI sets these yet (that's the Phase 4 email-capture work) —
      // default them so the Orders schema is ready ahead of that.
      'Source': 'Website',
      'Marketing Opt In': false,
    };

    // Create the Order first — photos attach to it by record ID afterward,
    // and each Item row links back to it the same way.
    const orderRecord = createAirtableRecord(CONFIG.AIRTABLE_ORDERS_TABLE, orderFields);

    ['photo1', 'photo2', 'photo3'].forEach((key) => {
      const blob = p[key];
      // Empty file inputs still arrive as a part; guard for zero-byte blobs.
      if (blob && typeof blob.getBytes === 'function' && blob.getBytes().length > 0) {
        uploadAttachmentToAirtable(orderRecord.id, blob);
      }
    });

    parseItems(p.itemsJson).forEach((item) => {
      createAirtableRecord(CONFIG.AIRTABLE_ITEMS_TABLE, itemToAirtableFields(item, orderRecord.id));
    });

    return ContentService.createTextOutput('OK');
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput('Error: ' + err.message);
  }
}

function parseItems(json) {
  try {
    const arr = JSON.parse(json || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch (err) {
    return [];
  }
}

// itemsJson items come in two shapes depending on product — see OrderForm.jsx.
// Cookies: { product, shape, decoration, description, quantity, price }
// Pebbles: { product, size, dips, units, price }
// The Airtable Items.Product single-select also has a "Branded Client
// Gifting" option reserved for later — OrderForm.jsx doesn't send that
// product yet, so no extra handling is needed here until it does.
function itemToAirtableFields(item, orderRecordId) {
  const fields = {
    'Order': [orderRecordId],
    'Product': item.product || '',
    'Price': parseNumber(item.price),
  };
  if (item.product === 'Cookie Pebbles') {
    fields['Variant'] = item.size || '';
    fields['Details'] = Array.isArray(item.dips) ? item.dips.join(', ') : '';
    fields['Count'] = parseNumber(item.units);
  } else {
    fields['Variant'] = item.shape || '';
    fields['Details'] = item.decoration || '';
    fields['Description'] = item.description || '';
    fields['Count'] = parseNumber(item.quantity);
  }
  return fields;
}

// Uploads a file straight into Airtable's own attachment storage and
// attaches it to the given record — no external file hosting involved.
// https://airtable.com/developers/web/api/upload-attachment
function uploadAttachmentToAirtable(recordId, blob) {
  const url = 'https://content.airtable.com/v0/' + CONFIG.AIRTABLE_BASE_ID + '/' + recordId
    + '/' + encodeURIComponent(CONFIG.AIRTABLE_PHOTOS_FIELD) + '/uploadAttachment';
  const payload = {
    contentType: blob.getContentType(),
    filename: blob.getName(),
    file: Utilities.base64Encode(blob.getBytes()),
  };
  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + CONFIG.AIRTABLE_TOKEN },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  const code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('Airtable attachment upload error ' + code + ': ' + response.getContentText());
  }
}

function createAirtableRecord(tableName, fields) {
  const url = 'https://api.airtable.com/v0/' + CONFIG.AIRTABLE_BASE_ID + '/' + encodeURIComponent(tableName);
  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + CONFIG.AIRTABLE_TOKEN },
    payload: JSON.stringify({ fields: fields }),
    muteHttpExceptions: true,
  });
  const code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('Airtable error ' + code + ': ' + response.getContentText());
  }
  return JSON.parse(response.getContentText());
}

function parseNumber(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}
