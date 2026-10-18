import dotenv from 'dotenv';
dotenv.config();

const url = process.env.WOOCOMMERCE_URL;
const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const wpAuth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

async function inspectHome() {
  const res = await fetch(`${url}/wp-json/wp/v2/pages/4509?context=edit`, {
    headers: { 'Authorization': 'Basic ' + wpAuth }
  });
  const page = await res.json();
  console.log('Title:', page.title.raw || page.title.rendered);
  const content = page.content.raw || page.content.rendered;
  console.log('Content length:', content.length);
  
  // Find headings or main sections in the page
  const matches = content.match(/<section[^>]*>|<h[1-3][^>]*>[\s\S]*?<\/h[1-3]>/gi) || [];
  console.log('Main sections / headings:');
  matches.slice(0, 15).forEach(m => console.log(' - ', m.replace(/\s+/g, ' ').slice(0, 100)));
}

inspectHome().catch(console.error);
