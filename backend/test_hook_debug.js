import dotenv from 'dotenv';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const siteUrl = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';
const wpAuth = 'Basic ' + Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

async function activateSnippet91() {
  const res = await fetch(`${siteUrl}/wp-json/code-snippets/v1/snippets/91`, {
    method: 'PUT',
    headers: { Authorization: wpAuth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ active: true })
  });

  console.log('PUT status:', res.status);
  const data = await res.json();
  console.log('Response:', data);
}

activateSnippet91().catch(console.error);
