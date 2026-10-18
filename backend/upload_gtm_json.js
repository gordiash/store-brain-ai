import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import fs from 'fs';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const content = fs.readFileSync('GTM-W7KV37XX_NaturaIntimo_Container.json', 'utf8');

  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['drop_gtm_json'])) {
      $upload_dir = wp_upload_dir();
      $file = $upload_dir['basedir'] . '/GTM-W7KV37XX_NaturaIntimo_Container.json';
      file_put_contents($file, wp_unslash($_POST['json_data']));
      header('Content-Type: application/json');
      echo json_encode(['url' => $upload_dir['baseurl'] . '/GTM-W7KV37XX_NaturaIntimo_Container.json']);
      exit;
    }
  });`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Drop GTM Json',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  try {
    const params = new URLSearchParams();
    params.append('json_data', content);
    const res = await axios.post('https://naturaintimo.com/?drop_gtm_json=1', params);
    console.log('Public download URL:', res.data.url);
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }
}

main().catch(console.error);
