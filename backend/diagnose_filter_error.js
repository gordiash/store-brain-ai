import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const wpAuth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

async function diagnose() {
  console.log('--- Diagnoza błędu 500 w filtrze cenowym ---');

  // 1. Zaktualizuj Snippet 6 z register_shutdown_function
  const diagCode = `
register_shutdown_function(function() {
    $err = error_get_last();
    if ($err && ($err['type'] === E_ERROR || $err['type'] === E_PARSE || $err['type'] === E_COMPILE_ERROR || $err['type'] === E_CORE_ERROR)) {
        header('Content-Type: text/plain; charset=utf-8', true, 500);
        echo "=== FATAL ERROR CAUGHT ===\\n";
        echo "Type: " . $err['type'] . "\\n";
        echo "Message: " . $err['message'] . "\\n";
        echo "File: " . $err['file'] . "\\n";
        echo "Line: " . $err['line'] . "\\n";
        exit;
    }
});
`;

  const put = (id, body) => new Promise(resolve => {
    const postData = JSON.stringify(body);
    const req = https.request('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/' + id, {
      method: 'PUT',
      headers: {
        'Authorization': 'Basic ' + wpAuth,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.write(postData);
    req.end();
  });

  console.log('Aktywacja snippetu diagnostycznego (ID 6)...');
  await put(6, {
    name: 'Diagnostic Error Catcher',
    code: diagCode,
    scope: 'global',
    active: true
  });

  // 2. Wywołaj URL z filtrem
  console.log('Wywołuję URL z filtrem...');
  const res = await fetch('https://naturaintimo.com/sklep/?min_price=30&max_price=80');
  const text = await res.text();
  console.log('Odpowiedź serwera:');
  const errIdx = text.indexOf('=== FATAL ERROR CAUGHT ===');
  if (errIdx !== -1) {
    console.log(text.substring(errIdx));
  } else {
    console.log('Nie znaleziono ciągu FATAL ERROR CAUGHT w tekście.');
    const dieIdx = text.indexOf('id="error-page"');
    if (dieIdx !== -1) {
      console.log('Error page context:\n', text.substring(dieIdx - 500, dieIdx + 500));
    }
  }

  // 3. Dezaktywuj Snippet 6
  console.log('Dezaktywacja snippetu diagnostycznego...');
  await put(6, { active: false });
  console.log('Gotowe.');
}

diagnose().catch(console.error);
