import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const wpAuth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

async function findNulls() {
  const code = `
add_action('rest_api_init', function() {
  register_rest_route('natura/v1', '/find-nulls', array(
    'methods' => 'GET',
    'permission_callback' => '__return_true',
    'callback' => function() {
      global $wpdb;
      $rows = $wpdb->get_results("SELECT product_id, sku, tax_class, tax_status FROM {$wpdb->wc_product_meta_lookup} WHERE tax_class IS NULL OR tax_class = '' LIMIT 10", ARRAY_A);
      $allNulls = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->wc_product_meta_lookup} WHERE tax_class IS NULL");
      return array(
        'rows' => $rows,
        'allNulls' => $allNulls,
        'prefix' => $wpdb->prefix
      );
    }
  ));
});
`;

  const postData = JSON.stringify({ name: 'Find Nulls', code: code, active: true });
  await new Promise(resolve => {
    const req = https.request('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/6', {
      method: 'PUT',
      headers: { 'Authorization': 'Basic ' + wpAuth, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.write(postData);
    req.end();
  });

  const res = await fetch('https://naturaintimo.com/wp-json/natura/v1/find-nulls');
  const data = await res.json();
  console.log('Null rows:', data);
}

findNulls().catch(console.error);
