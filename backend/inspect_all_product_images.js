import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function inspectImages() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const res = await axios.get('https://naturaintimo.com/wp-json/wc/v3/products?per_page=100', { headers });
  console.log(`Analyzing ${res.data.length} products...`);

  for (const p of res.data) {
    console.log(`\n-----------------------------------------`);
    console.log(`ID ${p.id} | ${p.name}`);
    console.log(`Current slug: "${p.slug}"`);
    console.log(`Gallery images count: ${p.images.length}`);
    p.images.forEach((img, idx) => {
      console.log(`  [${idx}] ID: ${img.id} | ${img.src}`);
    });
  }
}

inspectImages().catch(console.error);
