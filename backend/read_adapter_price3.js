import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['debug_read_adapter3'])) {
        $file = WP_PLUGIN_DIR . '/google-listings-and-ads/src/Product/WCProductAdapter.php';
        $content = file_get_contents($file);
        $pos = strpos($content, 'function map_wc_product_price');
        $code = substr($content, $pos, 2500);
        header('Content-Type: text/plain');
        echo $code;
        exit;
    }
});`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Read Adapter 3',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  try {
    const res = await axios.get('https://naturaintimo.com/?debug_read_adapter3=1');
    console.log('map_wc_product_price implementation:\n', res.data);
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }
}

main().catch(console.error);
