import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import https from 'https';

async function hardFlush() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const php = `add_action('init', function() {
    if (isset($_GET['hard_flush'])) {
        global $wp_rewrite;
        $wp_rewrite->set_permalink_structure('/%postname%/');
        $wp_rewrite->flush_rules(true);
        header('Content-Type: application/json');
        echo json_encode(array('flushed' => true));
        exit;
    }
});`;

  console.log('Creating hard flush snippet...');
  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Hard Flush',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  try {
    const r = await axios.get('https://naturaintimo.com/?hard_flush=1');
    console.log('Hard flush result:', r.data);
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
    console.log('Deleted hard flush snippet.');
  }

  // Test /product/ URL
  https.get('https://naturaintimo.com/product/bra-soft-ava-2271-divine-champagne-wine/', res => {
    console.log('/product/ status after hard flush:', res.statusCode);
  });
}

hardFlush().catch(console.error);
