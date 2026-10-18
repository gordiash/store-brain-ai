import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['debug_gla_tables'])) {
        global $wpdb;
        $tables = $wpdb->get_col("SHOW TABLES LIKE '%gla%'");
        $counts = array();
        foreach ($tables as $t) {
            $counts[$t] = $wpdb->get_var("SELECT COUNT(1) FROM {$t}");
        }
        header('Content-Type: application/json');
        echo json_encode(array('tables' => $counts));
        exit;
    }
});`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Debug GLA Tables',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  try {
    const res = await axios.get('https://naturaintimo.com/?debug_gla_tables=1');
    console.log('GLA Tables:', JSON.stringify(res.data, null, 2));
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }
}

main().catch(console.error);
