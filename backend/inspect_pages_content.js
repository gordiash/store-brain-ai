import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const auth = Buffer.from(process.env.WP_ADMIN_USER + ':' + process.env.WP_APP_PASSWORD).toString('base64');

async function inspect() {
  const p6931 = await (await fetch('https://naturaintimo.com/wp-json/wp/v2/pages/6931', { headers: { Authorization: 'Basic ' + auth } })).json();
  fs.writeFileSync('backend/page_6931_current.html', p6931.content.rendered, 'utf-8');
  console.log('Saved page_6931_current.html');

  const p4530 = await (await fetch('https://naturaintimo.com/wp-json/wp/v2/pages/4530', { headers: { Authorization: 'Basic ' + auth } })).json();
  fs.writeFileSync('backend/page_4530_current.html', p4530.content.rendered, 'utf-8');
  console.log('Saved page_4530_current.html');
}

inspect().catch(console.error);
