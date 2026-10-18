import dotenv from 'dotenv';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const wpAuth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';

const snippetCode = `/**
 * Snippet Name: Google tag (gtag.js) - GA4
 * Description: Installs Google Analytics 4 tag (G-BNFWRCF8KE) in <head>.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('wp_head', function() {
    ?>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-BNFWRCF8KE"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-BNFWRCF8KE');
</script>
    <?php
}, 1);
`;

async function deployGoogleTag() {
  console.log('Checking existing snippets for Google Tag...');
  const res = await fetch(`${url}/wp-json/code-snippets/v1/snippets`, {
    headers: { 'Authorization': 'Basic ' + wpAuth }
  });
  const snippets = await res.json();
  const existing = snippets.find(s => s.name && s.name.includes('Google tag (gtag.js)'));

  const payload = {
    name: 'Google tag (gtag.js) - GA4',
    code: snippetCode,
    active: true
  };

  if (existing) {
    console.log(`Updating Snippet #${existing.id}...`);
    const updateRes = await fetch(`${url}/wp-json/code-snippets/v1/snippets/${existing.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Basic ' + wpAuth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await updateRes.json();
    console.log(`Snippet #${existing.id} updated! Active:`, data.active);
  } else {
    console.log('Creating new Snippet for Google tag...');
    const createRes = await fetch(`${url}/wp-json/code-snippets/v1/snippets`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + wpAuth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await createRes.json();
    console.log(`Snippet #${data.id} created and activated!`);
  }
}

deployGoogleTag().catch(console.error);
