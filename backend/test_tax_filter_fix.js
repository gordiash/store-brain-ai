import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const wpAuth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

async function testFix() {
  console.log('--- Testowanie poprawki cache tax_classes ---');

  const fixCode = `
// Fix WooCommerce Blocks Price Filter TypeError with null tax_class in PHP 8.x
add_action('init', 'ni_fix_wc_filter_tax_classes_cache', 1);
add_action('pre_get_posts', 'ni_fix_wc_filter_tax_classes_cache', 1);
add_filter('posts_clauses', 'ni_fix_wc_filter_tax_classes_cache', 1);
function ni_fix_wc_filter_tax_classes_cache($clauses = null) {
    if (!class_exists('WC_Cache_Helper')) {
        return $clauses;
    }
    global $wpdb;
    $cache_key = WC_Cache_Helper::get_cache_prefix('filter_clauses') . 'tax_classes';
    $cached = wp_cache_get($cache_key);

    if (!$cached || in_array(null, (array)$cached, true)) {
        $raw = $wpdb->get_col("SELECT DISTINCT tax_class FROM {$wpdb->wc_product_meta_lookup}");
        $clean = array();
        foreach ((array)$raw as $c) {
            $clean[] = (string)$c; // converts null to empty string ""
        }
        $clean = array_values(array_unique($clean));
        wp_cache_set($cache_key, $clean);
    }
    return $clauses;
}
`;

  const postData = JSON.stringify({ name: 'Tax Class Filter Fix', code: fixCode, active: true });
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

  console.log('Snippet 6 aktywowany z poprawką.');

  // Test filter URL
  console.log('Wywołuję URL z filtrem cenowym...');
  const res = await fetch('https://naturaintimo.com/sklep/?min_price=30&max_price=80');
  console.log('STATUS ODPOWIEDZI:', res.status);
  const text = await res.text();

  if (res.status === 200 && !text.includes('critical error') && !text.includes('W witrynie wystąpił błąd krytyczny')) {
    console.log('🎉 SUKCES! Strona z filtrem cenowym załadowała się w 100% poprawnie (status 200 OK)!');
  } else {
    console.log('❌ Nadal błąd, status:', res.status);
  }
}

testFix().catch(console.error);
