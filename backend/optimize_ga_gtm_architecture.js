import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  console.log('1. Deactivating duplicate hardcoded GA/GTM snippets...');
  // Deactivate snippet 10 (hardcoded gtag) and 74 (duplicate GTM)
  const snippetsRes = await axios.get('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', { headers });
  const snip10 = snippetsRes.data.find(s => s.id === 10);
  const snip74 = snippetsRes.data.find(s => s.id === 74);

  if (snip10 && snip10.active) {
    await axios.put(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/10`, { active: false }, { headers });
    console.log('Snippet #10 (Google tag gtag.js GA4) deactivated to prevent duplicate hits.');
  }

  if (snip74 && snip74.active) {
    await axios.put(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/74`, { active: false }, { headers });
    console.log('Snippet #74 (Google Tag Manager) deactivated because Site Kit already manages GTM-W7KV37XX.');
  }

  console.log('2. Configuring Site Kit to prevent duplicate gtag.js (letting GTM manage GA4)...');
  const php = `add_action('wp_loaded', function() {
    if (isset($_GET['clean_sitekit_snippet'])) {
      $a4 = get_option('googlesitekit_analytics-4_settings', []);
      $a4['useSnippet'] = false;
      update_option('googlesitekit_analytics-4_settings', $a4);

      $tm = get_option('googlesitekit_tagmanager_settings', []);
      $tm['useSnippet'] = true;
      $tm['containerID'] = 'GTM-W7KV37XX';
      update_option('googlesitekit_tagmanager_settings', $tm);

      header('Content-Type: application/json');
      echo json_encode(['success' => true, 'a4' => get_option('googlesitekit_analytics-4_settings'), 'tm' => get_option('googlesitekit_tagmanager_settings')]);
      exit;
    }
  });`;

  const s = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
    name: 'Clean SiteKit Snippet', code: php, scope: 'global', active: true
  }, { headers });

  try {
    const res = await axios.get('https://naturaintimo.com/?clean_sitekit_snippet=1');
    console.log('Site Kit updated: GA4 useSnippet is now false, GTM useSnippet is true.');
  } finally {
    await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
  }

  // Purge LiteSpeed Cache
  try {
    await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
      name: 'Temp Flush LS',
      code: `add_action('init', function() { if (defined('LSCWP_V')) { do_action('litespeed_purge_all'); } });`,
      scope: 'global', active: true
    }, { headers }).then(async (temp) => {
      await axios.get('https://naturaintimo.com/');
      await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${temp.data.id}`, { headers });
    });
  } catch (e) {}

  // Verify on live site
  console.log('3. Verifying live site HTML tags...');
  const checkRes = await axios.get('https://naturaintimo.com/?nocache=' + Date.now());
  const html = checkRes.data;

  const gtmMatches = html.match(/GTM-W7KV37XX/g) || [];
  const ga4DirectMatches = html.match(/googletagmanager\.com\/gtag\/js\?id=G-BNFWRCF8KE/g) || [];
  const hasDataLayer = html.includes('view_item') || html.includes('dataLayer.push');

  console.log('--- Post-Optimization Verification ---');
  console.log(`- GTM occurrences (should be exactly 2: 1 head script + 1 body noscript): ${gtmMatches.length}`);
  console.log(`- Direct unmanaged gtag.js for GA4 (should be 0, handled via GTM): ${ga4DirectMatches.length}`);
  console.log(`- WooCommerce E-commerce DataLayer active: ${hasDataLayer}`);
}

main().catch(console.error);
