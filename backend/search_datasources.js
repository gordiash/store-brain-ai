import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['debug_read_datasources'])) {
        $file_matches = array();
        $dir = WP_PLUGIN_DIR . '/google-listings-and-ads/src';
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
        foreach ($iterator as $f) {
            if ($f->isFile() && $f->getExtension() === 'php') {
                $c = file_get_contents($f->getPathname());
                if (strpos($c, 'gla_mapi_data_sources') !== false || strpos($c, 'dataSources') !== false) {
                    $file_matches[] = str_replace(WP_PLUGIN_DIR, '', $f->getPathname());
                }
            }
        }
        header('Content-Type: application/json');
        echo json_encode($file_matches);
        exit;
    }
});`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Read DataSources Files',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  try {
    const res = await axios.get('https://naturaintimo.com/?debug_read_datasources=1');
    console.log('Files with dataSources:\n', JSON.stringify(res.data, null, 2));
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }
}

main().catch(console.error);
