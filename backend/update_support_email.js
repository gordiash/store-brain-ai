import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function replaceSupportEmail() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  console.log('Fetching all pages...');
  const res = await axios.get('https://naturaintimo.com/wp-json/wp/v2/pages?per_page=100', { headers });
  const pages = res.data;

  let updatedCount = 0;
  for (const p of pages) {
    let content = p.content.rendered;
    if (content.includes('sklep@naturaintimo.com')) {
      content = content.replace(/sklep@naturaintimo\.com/g, 'support@naturaintimo.com');
      await axios.put(`https://naturaintimo.com/wp-json/wp/v2/pages/${p.id}`, { content }, { headers });
      console.log(`Updated page ID ${p.id} (${p.slug}) -> support@naturaintimo.com`);
      updatedCount++;
    }
  }

  console.log(`Completed: Updated ${updatedCount} pages to support@naturaintimo.com`);
}

replaceSupportEmail().catch(console.error);
