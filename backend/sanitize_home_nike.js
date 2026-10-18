import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function sanitizeHomeProducts() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const res = await axios.get('https://naturaintimo.com/wp-json/wp/v2/pages/4509', { headers });
  let content = res.data.content.rendered;

  // Replace Gaia BS 1135 Nike references
  content = content.replace(
    /\/produkt\/bra-soft-gaia-bs-1135-nike-2\//g,
    '/produkt/bra-soft-gaia-bs-1135-soft-beige/'
  );
  content = content.replace(/Gaia BS 1135 Nike Soft Bra Beige/g, 'Gaia BS 1135 Soft Bra Beige');
  content = content.replace(/Gaia BS 1135 Nike/g, 'Gaia BS 1135');

  // Replace Gaia GFB 1135 Nike references
  content = content.replace(
    /\/produkt\/panties-gaia-gfb-1135-nike-brazyliany-s-xl-bezowy\//g,
    '/produkt/panties-gaia-gfb-1135-brazilian-briefs-beige/'
  );
  content = content.replace(/Gaia Nike Brazilian Briefs Beige/g, 'Gaia GFB 1135 Brazilian Briefs Beige');
  content = content.replace(/Gaia Nike/g, 'Gaia GFB 1135');

  const updateRes = await axios.put('https://naturaintimo.com/wp-json/wp/v2/pages/4509', { content }, { headers });
  console.log('Successfully sanitized homepage Nike occurrences:', updateRes.data.title.rendered);
}

sanitizeHomeProducts().catch(err => {
  console.error('Error updating home:', err.response ? err.response.data : err.message);
  process.exit(1);
});
