import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function getAllIssuesPages() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  let allIssues = [];
  let page = 1;
  while (true) {
    try {
      const res = await axios.get(`https://naturaintimo.com/wp-json/wc/gla/mc/issues?page=${page}&per_page=100`, { headers });
      const issues = res.data.issues || res.data;
      if (!issues || issues.length === 0) break;
      allIssues = allIssues.concat(issues);
      if (allIssues.length >= (res.data.total || 1000) || issues.length < 100) break;
      page++;
    } catch (e) {
      console.error(`Error on page ${page}:`, e.message);
      break;
    }
  }

  console.log('Total issues collected from GLA:', allIssues.length);
  const byProd = {};
  allIssues.forEach(i => {
    byProd[i.product_id] = byProd[i.product_id] || { name: i.product, count: 0, issues: new Set() };
    byProd[i.product_id].count++;
    byProd[i.product_id].issues.add(i.issue);
  });

  console.log('\n--- Products with issues in Google Merchant Center ---');
  for (const [id, info] of Object.entries(byProd)) {
    console.log(`Product ID ${id}: ${info.name}`);
    console.log(`  Count of flagged items: ${info.count}`);
    console.log(`  Issues: ${[...info.issues].join(', ')}`);
  }
}

getAllIssuesPages().catch(console.error);
