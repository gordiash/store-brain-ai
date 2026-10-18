import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function updateHomeTagline() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const res = await axios.get('https://naturaintimo.com/wp-json/wp/v2/pages/4509', { headers });
  let content = res.data.content.rendered;

  if (!content.includes('European lingerie for real women')) {
    console.error('Target tagline not found on page 4509!');
    process.exit(1);
  }

  // Replace with inclusive luxury tagline
  content = content.replace(
    '<h1>European lingerie for real women</h1>',
    '<h1>European Lingerie Crafted for Perfect Fit & Full-Bust Support</h1>'
  );

  const updateRes = await axios.put('https://naturaintimo.com/wp-json/wp/v2/pages/4509', { content }, { headers });
  console.log('Successfully updated Homepage (page 4509):', updateRes.data.title.rendered);
}

updateHomeTagline().catch(err => {
  console.error('Error updating home tagline:', err.response ? err.response.data : err.message);
  process.exit(1);
});
