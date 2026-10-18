import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['debug_plugin_methods'])) {
        try {
            $container = woogle_get_container();
            $client = $container->get(\\Automattic\\WooCommerce\\GoogleListingsAndAds\\API\\Google\\Mapi\\MerchantApiClient::class);
            global $wpdb;
            $modules = get_option('googlesitekit_active_modules');
            $tm = get_option('googlesitekit_tagmanager_settings');
            $a4 = get_option('googlesitekit_analytics-4_settings');
            header('Content-Type: application/json');
            echo json_encode([
                'modules' => $modules,
                'tagmanager' => $tm,
                'a4_use_snippet' => $a4['useSnippet'] ?? null
            ]);
            exit;
        } catch (\\Throwable $e) {
            $details = null;
            if ($e instanceof \\Automattic\\WooCommerce\\GoogleListingsAndAds\\API\\Google\\Mapi\\MerchantApiException) {
                $details = [
                    'status' => $e->get_http_status(),
                    'body' => $e->get_response_body(),
                    'errors' => $e->get_errors()
                ];
            }
            header('Content-Type: application/json');
            echo json_encode([
                'error' => $e->getMessage(),
                'details' => $details
            ]);
            exit;
        }
    }
});`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Debug Plugin Methods',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  try {
    const res = await axios.get('https://naturaintimo.com/?debug_plugin_methods=1');
    console.log(JSON.stringify(res.data, null, 2));
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }
}

main().catch(console.error);
