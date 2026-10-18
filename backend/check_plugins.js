import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const r = await axios.get('https://naturaintimo.com/wp-json/wp/v2/plugins', { headers });
  console.log('Plugins on site:');
  r.data.forEach(p => console.log(`- ${p.plugin} (${p.status}): ${p.name}`));
}

main().catch(console.error);
