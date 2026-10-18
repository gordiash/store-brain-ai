import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['check_as_gla'])) {
        global $wpdb;
        $rows = $wpdb->get_results("SELECT hook, status, scheduled_date_gmt, args FROM {$wpdb->prefix}actionscheduler_actions WHERE hook LIKE '%gla%' ORDER BY action_id DESC LIMIT 10");
        header('Content-Type: application/json');
        echo json_encode($rows);
        exit;
    }
});`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Check AS Temp',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  try {
    const res = await axios.get('https://naturaintimo.com/?check_as_gla=1');
    console.log('ActionScheduler actions:', JSON.stringify(res.data, null, 2));
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }
}

main().catch(console.error);
