import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function checkWCPermsStructure() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const php = `add_action('init', function() {
    if (isset($_GET['check_wc_structure'])) {
        header('Content-Type: application/json');
        echo json_encode(array(
            'structure' => wc_get_permalink_structure(),
            'product_post_type_rewrite' => get_post_type_object('product')->rewrite
        ));
        exit;
    }
});`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Check WC Structure',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  try {
    const r = await axios.get('https://naturaintimo.com/?check_wc_structure=1');
    console.log('Result:', JSON.stringify(r.data, null, 2));
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }
}

checkWCPermsStructure().catch(console.error);
