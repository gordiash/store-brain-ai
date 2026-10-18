import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import https from 'https';

async function flushCorrectly() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['flush_rewrite_proper'])) {
        // Force re-register CPT rules
        flush_rewrite_rules();
        header('Content-Type: application/json');
        echo json_encode(array('flushed' => true));
        exit;
    }
});`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Proper Flush',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  try {
    const r = await axios.get('https://naturaintimo.com/?flush_rewrite_proper=1');
    console.log('Result:', r.data);
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }

  // Now test both /product/ and /produkt/
  https.get('https://naturaintimo.com/product/bra-soft-ava-2271-divine-champagne-wine/', res => {
    console.log('/product/ status:', res.statusCode);
  });
}

flushCorrectly().catch(console.error);
