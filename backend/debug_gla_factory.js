import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['debug_gla_factory'])) {
        try {
            $container = woogle_get_container();
            $service = $container->get(\\Automattic\\WooCommerce\\GoogleListingsAndAds\\API\\Google\\Mapi\\Services\\MapiDataSourcesService::class);
            $client = $container->get(\\Automattic\\WooCommerce\\GoogleListingsAndAds\\API\\Google\\Mapi\\MerchantApiClient::class);
            $service = $client->get_data_sources_service();
            $merchant_id = get_option('gla_merchant_id');
            $parent = "accounts/{$merchant_id}";
            $res = $service->listDataSources($parent);
            
            $out = [];
            foreach ($res->getDataSources() as $ds) {
                $p = $ds->getPrimaryProductDataSource();
                $out[] = [
                    'name' => $ds->getName(),
                    'displayName' => $ds->getDisplayName(),
                    'channel' => $p ? $p->getChannel() : null,
                    'feedLabel' => $p ? $p->getFeedLabel() : null,
                    'contentLanguage' => $p ? $p->getContentLanguage() : null,
                    'countries' => $p ? $p->getCountries() : null,
                    'defaultRule' => $p && $p->getDefaultRule() ? [
                        'takeFromDataSources' => $p->getDefaultRule()->getTakeFromDataSources()
                    ] : null
                ];
            }
            header('Content-Type: application/json');
            echo json_encode($out);
            exit;
        } catch (\\Throwable $e) {
            header('Content-Type: application/json');
            echo json_encode(['error' => $e->getMessage()]);
            exit;
        }
    }
});`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Debug GLA Factory',
    code: php,
    scope: 'global',
    active: true
  }, { headers });

  try {
    const res = await axios.get('https://naturaintimo.com/?debug_gla_factory=1');
    console.log('Google DataSources via API:');
    console.log(JSON.stringify(res.data, null, 2));
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }
}

main().catch(console.error);
