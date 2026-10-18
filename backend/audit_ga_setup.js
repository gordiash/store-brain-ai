import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  console.log('1. Fetching live HTML...');
  const r = await axios.get('https://naturaintimo.com/?nocache=' + Date.now());
  const html = r.data;

  const gtmMatches = html.match(/GTM-W7KV37XX/g) || [];
  const ga4Matches = html.match(/G-BNFWRCF8KE/g) || [];
  const gtagConfigMatches = html.match(/gtag\(['"]config['"]/g) || [];
  const siteKitFound = html.includes('googlesitekit') || html.includes('google-site-kit');

  console.log(`- GTM occurrences: ${gtmMatches.length}`);
  console.log(`- G-BNFWRCF8KE occurrences: ${ga4Matches.length}`);
  console.log(`- gtag config calls: ${gtagConfigMatches.length}`);
  console.log(`- Site Kit detected: ${siteKitFound}`);

  console.log('\n2. Fetching active code snippets related to Google...');
  const snipRes = await axios.get('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', { headers });
  const googleSnippets = snipRes.data.filter(s => 
    s.name.toLowerCase().includes('google') || 
    s.name.toLowerCase().includes('gtm') || 
    s.name.toLowerCase().includes('analytics') || 
    s.name.toLowerCase().includes('tag')
  );
  googleSnippets.forEach(s => {
    console.log(`- Snippet #${s.id} (${s.active ? 'ACTIVE' : 'INACTIVE'}): ${s.name}`);
  });

  console.log('\n3. Checking Site Kit options in WP DB...');
  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['get_sitekit_options'])) {
      global $wpdb;
      $rows = $wpdb->get_results("SELECT option_name, option_value FROM {$wpdb->options} WHERE option_name LIKE '%googlesitekit%' ORDER BY option_name", ARRAY_A);
      $out = [];
      foreach ($rows as $r) {
        $out[$r['option_name']] = maybe_unserialize($r['option_value']);
      }
      header('Content-Type: application/json');
      echo json_encode($out);
      exit;
    }
  });`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Get SiteKit Options', code: php, scope: 'global', active: true
  }, { headers });

  try {
    const optRes = await axios.get('https://naturaintimo.com/?get_sitekit_options=1');
    console.log('Site Kit connected services:');
    const connected = optRes.data['googlesitekit_connected_services'] || [];
    console.log('Connected services:', connected);
    console.log('Analytics settings:', optRes.data['googlesitekit_analytics-4_settings'] || 'None');
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }
}

main().catch(console.error);
