import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['run_gla_sync_now'])) {
        if (class_exists('ActionScheduler_QueueRunner')) {
            ActionScheduler_QueueRunner::instance()->run();
            header('Content-Type: application/json');
            echo json_encode(array('ran' => true));
            exit;
        }
    }
});`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Run Action Scheduler Temp',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  try {
    const res = await axios.get('https://naturaintimo.com/?run_gla_sync_now=1');
    console.log('ActionScheduler run result:', res.data);
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }

  // Check sync status of product 3674
  const check = await axios.get('https://naturaintimo.com/wp-json/wc/v3/products/3674', { headers });
  const syncStatus = check.data.meta_data.find(m => m.key === '_wc_gla_sync_status')?.value;
  console.log('Current sync status of product 3674:', syncStatus);
}

main().catch(console.error);
