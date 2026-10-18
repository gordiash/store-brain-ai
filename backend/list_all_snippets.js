import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const res = await axios.get('https://naturaintimo.com/wp-json/code-snippets/v1/snippets', { headers });
  console.log('Total snippets:', res.data.length);
  res.data.forEach(s => {
    console.log(`ID ${s.id} | ${s.name} | active: ${s.active} | scope: ${s.scope}`);
  });
}

main().catch(console.error);
