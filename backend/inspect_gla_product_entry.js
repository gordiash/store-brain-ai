import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['debug_gla_product_entry'])) {
        global $wpdb;
        $options = $wpdb->get_results("SELECT option_name, option_value FROM {$wpdb->options} WHERE option_name LIKE '%gla%'");
        $out = array();
        foreach ($options as $o) {
            $out[$o->option_name] = maybe_unserialize($o->option_value);
        }
        $out['wc_currency'] = get_woocommerce_currency();
        header('Content-Type: application/json');
        echo json_encode($out);
        exit;
    }
});`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Debug GLA Entry',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  try {
    const res = await axios.get('https://naturaintimo.com/?debug_gla_product_entry=1');
    console.log('Result:', JSON.stringify(res.data, null, 2));
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }
}

main().catch(console.error);
