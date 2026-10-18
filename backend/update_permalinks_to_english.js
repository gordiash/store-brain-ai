import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function updatePermalinksToEnglish() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const php = `
add_action('init', function() {
    if (isset($_GET['apply_english_permalinks'])) {
        $current = get_option('woocommerce_permalinks', array());
        $current['product_base'] = 'product';
        $current['category_base'] = 'product-category';
        $current['tag_base'] = 'product-tag';
        update_option('woocommerce_permalinks', $current);
        flush_rewrite_rules();
        header('Content-Type: application/json');
        echo json_encode(array(
            'success' => true,
            'updated' => get_option('woocommerce_permalinks')
        ));
        exit;
    }
});
`;

  console.log('Deploying permalinks updater snippet...');
  const res = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'English Permalinks Updater (One-Time)',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  const snippetId = res.data.id;

  try {
    const trigger = await axios.get('https://naturaintimo.com/?apply_english_permalinks=1');
    console.log('Permalinks update response:', trigger.data);
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${snippetId}`, { headers });
    console.log('Deleted updater snippet.');
  }
}

updatePermalinksToEnglish().catch(console.error);
