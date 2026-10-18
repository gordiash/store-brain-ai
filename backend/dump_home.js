import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const url = process.env.WOOCOMMERCE_URL;
const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const wpAuth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

async function dumpHome() {
  const res = await fetch(`${url}/wp-json/wp/v2/pages/4509?context=edit`, {
    headers: { 'Authorization': 'Basic ' + wpAuth }
  });
  const page = await res.json();
  const raw = page.content.raw;
  fs.writeFileSync('home_raw.html', raw);
  console.log('Saved home_raw.html, length:', raw.length);
}

dumpHome().catch(console.error);
