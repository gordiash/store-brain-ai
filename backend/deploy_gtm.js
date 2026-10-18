import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const snippetCode = `/**
 * Snippet Name: Google Tag Manager (GTM-W7KV37XX)
 * Description: Injects Google Tag Manager script in <head> and noscript iframe in <body>.
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. GTM Script in <head>
add_action('wp_head', function() {
?>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-W7KV37XX');</script>
<!-- End Google Tag Manager -->
<?php
}, 1);

// 2. GTM noscript immediately after <body> open
add_action('wp_body_open', function() {
?>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-W7KV37XX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
<?php
}, 1);
`;

  console.log('Checking existing snippets for GTM...');
  const res = await axios.get('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', { headers });
  const snippets = res.data;
  const existing = snippets.find(s => s.name && s.name.includes('Google Tag Manager (GTM-W7KV37XX)'));

  const payload = {
    name: 'Google Tag Manager (GTM-W7KV37XX)',
    code: snippetCode,
    scope: 'global',
    active: true
  };

  let snippetId;
  if (existing) {
    console.log(`Updating existing snippet #${existing.id}...`);
    const updateRes = await axios.put(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${existing.id}`, payload, { headers });
    snippetId = existing.id;
    console.log(`Snippet #${existing.id} updated! Active:`, updateRes.data.active);
  } else {
    console.log('Creating new snippet for GTM...');
    const createRes = await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', payload, { headers });
    snippetId = createRes.data.id;
    console.log(`Snippet #${snippetId} created and activated!`);
  }

  // Purge LiteSpeed cache
  try {
    await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', {
      name: 'Temp Flush LS Cache',
      code: `add_action('init', function() {
        if (defined('LSCWP_V')) {
          do_action('litespeed_purge_all');
        }
      });`,
      scope: 'global',
      active: true
    }, { headers }).then(async (s) => {
      await axios.get('https://naturaintimo.com/');
      await axios.delete(`https://naturaintimo.com/wp-json/code-snippets/v1/snippets/${s.data.id}`, { headers });
    });
  } catch (e) {
    console.log('Cache purge notice:', e.message);
  }

  // Verify on live homepage
  console.log('Verifying GTM on live site...');
  const checkRes = await axios.get('https://naturaintimo.com/?nocache=' + Date.now());
  const html = checkRes.data;

  const hasHead = html.includes('GTM-W7KV37XX') && html.includes('https://www.googletagmanager.com/gtm.js?id=');
  const hasBody = html.includes('https://www.googletagmanager.com/ns.html?id=GTM-W7KV37XX');

  console.log('Verification Results:');
  console.log('- Head script found:', hasHead);
  console.log('- Body noscript found:', hasBody);

  if (!hasBody) {
    console.log('Warning: wp_body_open might not be triggered by the active theme. Let us check template fallback.');
  }
}

main().catch(console.error);
