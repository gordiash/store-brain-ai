import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const snippetPhp = `add_action('init', function() {
    if (isset($_GET['check_wc_perms'])) {
        header('Content-Type: application/json');
        echo json_encode(array(
            'wc_perms' => get_option('woocommerce_permalinks'),
            'permalink_structure' => get_option('permalink_structure')
        ));
        exit;
    }
});`;

  const res = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Temp Permalinks Inspector',
    code: snippetPhp,
    scope: 'global',
    active: true
  }, { headers });

  const snippetId = res.data.id;
  console.log('Created temp snippet ID:', snippetId);

  try {
    const checkRes = await axios.get('https://naturaintimo.com/?check_wc_perms=1');
    console.log('Permalinks configuration:', checkRes.data);
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${snippetId}`, { headers });
    console.log('Cleaned up temp snippet.');
  }
}

main().catch(console.error);
