// ============================================================
// Vianova Presidio - Google Apps Script Backend
// Gestisce invio form e notifiche email
// ============================================================

var RECIPIENTS = ['psvianova@sitespa.it', 'supportops@sitespa.it', 'alessandro.mendola@vianova.it'];
var SENDER_NAME = 'Vianova Presidio';

// ------------------------------------
// GET - health check
// ------------------------------------
function doGet(e) {
  return ContentService
    .createTextOutput('Vianova Presidio API - OK')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ------------------------------------
// POST - riceve esito dal form HTML
// ------------------------------------
function doPost(e) {
  try {
    var params    = e.parameter;
    var tecnico   = (params.nomeTecnico   || '').trim() || 'N/D';
    var sede      = (params.codiceSede    || '').trim() || 'N/D';
    var esito     = (params.esito         || '').trim() || 'N/D';
    var note      = (params.note          || '').trim();
    var operatore = (params.nomeOperatore || '').trim() || 'N/D';

    var now     = new Date();
    var dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');

    var subject = '[Vianova] Esito Presidio – ' + sede + ' – ' + esito;

    // ---- corpo plain text ----
    var plain = [
      'ESITO INTERVENTO VIANOVA',
      '',
      'Data/Ora:         ' + dateStr,
      'Nome Tecnico:     ' + tecnico,
      'Codice Sede:      ' + sede,
      'Esito:            ' + esito,
      (esito === 'KO' && note ? 'Note:             ' + note : ''),
      'Nome Operatore:   ' + operatore,
      '',
      '— Vianova Presidio'
    ].filter(function(l){ return l !== false && l !== ''; }).join('\n');

    // ---- corpo HTML ----
    var noteRow = (esito === 'KO' && note)
      ? '<tr><td class="lbl">Note</td><td>' + _esc(note) + '</td></tr>'
      : '';

    var esitoColor = esito === 'OK' ? '#059669' : '#dc2626';

    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">'
      + '<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f5f5f5;padding:24px}'
      + '.card{background:#fff;border-radius:12px;padding:24px;max-width:480px;margin:0 auto;box-shadow:0 2px 12px rgba(0,0,0,.08)}'
      + 'h2{margin:0 0 20px;color:#1a1a1a;font-size:1.2rem}table{width:100%;border-collapse:collapse}'
      + 'td{padding:10px 12px;border:1px solid #e5e7eb;font-size:.95rem}.lbl{font-weight:600;color:#374151;width:40%}'
      + '.badge{display:inline-block;padding:2px 10px;border-radius:20px;font-weight:700;color:#fff}'
      + '.ok{background:#059669}.ko{background:#dc2626}'
      + '.footer{margin-top:16px;font-size:.8rem;color:#9ca3af;text-align:center}'
      + '</style></head><body><div class="card">'
      + '<h2>Esito Intervento Vianova</h2>'
      + '<table>'
      + '<tr><td class="lbl">Data/Ora</td><td>' + dateStr + '</td></tr>'
      + '<tr><td class="lbl">Nome Tecnico</td><td><strong>' + _esc(tecnico) + '</strong></td></tr>'
      + '<tr><td class="lbl">Codice Sede</td><td><strong>' + _esc(sede) + '</strong></td></tr>'
      + '<tr><td class="lbl">Esito</td><td><span class="badge ' + esito.toLowerCase() + '">' + _esc(esito) + '</span></td></tr>'
      + noteRow
      + '<tr><td class="lbl">Nome Operatore</td><td>' + _esc(operatore) + '</td></tr>'
      + '</table>'
      + '<div class="footer">Inviato automaticamente dal sistema Vianova Presidio</div>'
      + '</div></body></html>';

    GmailApp.sendEmail(
      RECIPIENTS[0],
      subject,
      plain,
      {
        cc:       RECIPIENTS.slice(1).join(','),
        htmlBody: html,
        name:     SENDER_NAME
      }
    );

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('doPost error: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ------------------------------------
// TEST - esegui dal editor per verificare email
// ------------------------------------
function testEmail() {
  var fakeParams = {
    codiceSede:      'TEST-001',
    esito:           'KO',
    note:            'Test automatico - verifica funzionamento email',
    chiamataVianova: 'SI'
  };

  var fakeEvent = { parameter: fakeParams };

  Logger.log('Avvio test email...');
  Logger.log('Destinatari: ' + RECIPIENTS.join(', '));

  try {
    var now     = new Date();
    var dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
    var subject = '[Vianova TEST] Esito Presidio – ' + fakeParams.codiceSede + ' – ' + fakeParams.esito;
    var plain   = 'TEST EMAIL VIANOVA\n\nData/Ora: ' + dateStr + '\nCodice Sede: ' + fakeParams.codiceSede + '\nEsito: ' + fakeParams.esito + '\nNote: ' + fakeParams.note + '\nChiamata Vianova: ' + fakeParams.chiamataVianova;

    GmailApp.sendEmail(
      RECIPIENTS[0],
      subject,
      plain,
      { cc: RECIPIENTS.slice(1).join(','), name: SENDER_NAME }
    );

    Logger.log('✅ Email inviata con successo a: ' + RECIPIENTS.join(', '));
  } catch (err) {
    Logger.log('❌ ERRORE: ' + err.toString());
  }
}

// ---- helper: escape HTML ----
function _esc(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}
