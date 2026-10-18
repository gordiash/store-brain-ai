import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function updateFaq() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const res = await axios.get('https://naturaintimo.com/wp-json/wp/v2/pages/4530', { headers });
  let content = res.data.content.rendered;

  // 1. Where does Natura Intimo ship from?
  // Old: International delivery options for the United States and Canada are being finalised and will be shown at checkout when available.
  content = content.replace(
    'International delivery options for the United States and Canada are being finalised and will be shown at checkout when available.',
    'Orders are prepared and dispatched from Poland directly to the United States via DHL Express Worldwide (2–4 business days delivery) and via tracked international shipping to Canada.'
  );

  // 2. Could customs charges apply?
  // Old: International orders may be subject to import duties, taxes or carrier fees determined by the destination country. These charges are normally the recipient’s responsibility unless checkout states otherwise.
  content = content.replace(
    'International orders may be subject to import duties, taxes or carrier fees determined by the destination country. These charges are normally the recipient’s responsibility unless checkout states otherwise.',
    'For all U.S. orders, we provide Guaranteed DDP (Delivered Duty Paid). All customs duties and processing fees are handled and pre-cleared at checkout (and 100% covered by us on orders of $199+). You will never receive surprise duty bills or carrier collection fees upon delivery.'
  );

  // Also handle encoded apostrophe if present
  content = content.replace(
    'These charges are normally the recipient&#8217;s responsibility unless checkout states otherwise.',
    'For all U.S. orders, we provide Guaranteed DDP (Delivered Duty Paid). All customs duties and processing fees are handled and pre-cleared at checkout (and 100% covered by us on orders of $199+). You will never receive surprise duty bills or carrier collection fees upon delivery.'
  );

  const updateRes = await axios.put('https://naturaintimo.com/wp-json/wp/v2/pages/4530', { content }, { headers });
  console.log('Successfully updated FAQ (page 4530):', updateRes.data.title.rendered);
}

updateFaq().catch(err => {
  console.error('Error updating FAQ:', err.response ? err.response.data : err.message);
  process.exit(1);
});
