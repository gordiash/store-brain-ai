import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['debug_read_adapter2'])) {
        $file = WP_PLUGIN_DIR . '/google-listings-and-ads/src/Product/WCProductAdapter.php';
        $content = file_get_contents($file);
        preg_match_all('/function\\s+([a-zA-Z0-9_]*price[a-zA-Z0-9_]*)\\s*\\(/i', $content, $m);
        
        $price_code = '';
        if (!empty($m[1])) {
            foreach ($m[1] as $fn) {
                $pos = strpos($content, 'function ' . $fn);
                $price_code .= substr($content, $pos, 1000) . "\\n====================\\n";
            }
        }
        header('Content-Type: text/plain');
        echo $price_code;
        exit;
    }
});`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Read Adapter 2',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  try {
    const res = await axios.get('https://naturaintimo.com/?debug_read_adapter2=1');
    console.log('Adapter price functions:\n', res.data);
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }
}

main().catch(console.error);
