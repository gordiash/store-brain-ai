import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['debug_gla_files'])) {
        $plugin_dir = WP_PLUGIN_DIR . '/google-listings-and-ads';
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($plugin_dir));
        $matches = array();
        foreach ($iterator as $file) {
            if ($file->isFile() && $file->getExtension() === 'php') {
                $content = file_get_contents($file->getPathname());
                if (strpos($content, 'setPrice') !== false || strpos($content, 'getPrice') !== false) {
                    $rel_path = str_replace(WP_PLUGIN_DIR, '', $file->getPathname());
                    $matches[] = $rel_path;
                }
            }
        }
        header('Content-Type: application/json');
        echo json_encode($matches);
        exit;
    }
});`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Debug GLA Files',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  try {
    const res = await axios.get('https://naturaintimo.com/?debug_gla_files=1');
    console.log('Files with setPrice/getPrice:');
    console.log(JSON.stringify(res.data, null, 2));
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }
}

main().catch(console.error);
