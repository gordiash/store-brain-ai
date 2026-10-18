import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['debug_read_adapter'])) {
        $file = WP_PLUGIN_DIR . '/google-listings-and-ads/src/Product/WCProductAdapter.php';
        $content = file_get_contents($file);
        // Find price methods
        $pos = strpos($content, 'function map_price');
        if ($pos === false) {
            $pos = strpos($content, 'price');
        }
        $sample = substr($content, $pos - 100, 1500);
        header('Content-Type: text/plain');
        echo $sample;
        exit;
    }
});`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Read Adapter',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  try {
    const res = await axios.get('https://naturaintimo.com/?debug_read_adapter=1');
    console.log('Adapter snippet:\n', res.data);
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }
}

main().catch(console.error);
