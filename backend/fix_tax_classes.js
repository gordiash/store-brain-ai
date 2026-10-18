import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const wpAuth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

async function fixTaxClasses() {
  const code = `
add_action('rest_api_init', function() {
  register_rest_route('natura/v1', '/fix-tax-classes', array(
    'methods' => 'POST',
    'permission_callback' => '__return_true',
    'callback' => function() {
      global $wpdb;

      // 1. Sprawdz wartosci przed
      $before = $wpdb->get_results("SELECT tax_class, COUNT(*) as cnt FROM {$wpdb->wc_product_meta_lookup} GROUP BY tax_class", ARRAY_A);

      // 2. Zamien NULL na '' w wc_product_meta_lookup
      $updated = $wpdb->query("UPDATE {$wpdb->wc_product_meta_lookup} SET tax_class = '' WHERE tax_class IS NULL");

      // 3. Wyczysc cache filtrow
      $cache_key = WC_Cache_Helper::get_cache_prefix('filter_clauses') . 'tax_classes';
      wp_cache_delete($cache_key);

      // 4. Sprawdz wartosci po
      $after = $wpdb->get_results("SELECT tax_class, COUNT(*) as cnt FROM {$wpdb->wc_product_meta_lookup} GROUP BY tax_class", ARRAY_A);

      return array(
        'before' => $before,
        'updated_rows' => $updated,
        'after' => $after
      );
    }
  ));
});
`;

  const postData = JSON.stringify({ name: 'Fix Tax Classes Route', code: code, active: true });
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

  const res = await fetch('https://naturaintimo.com/wp-json/natura/v1/fix-tax-classes', { method: 'POST' });
  const data = await res.json();
  console.log('Fix result:', data);
}

fixTaxClasses().catch(console.error);
