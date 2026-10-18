import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function enrichSnippet14() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const res = await axios.get('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/14', { headers });
  let code = res.data.code;

  if (code.includes('ni_inject_seo_meta_tags')) {
    console.log('Snippet 14 already has SEO meta tags.');
    return;
  }

  const addition = `

// 3. Inject Meta Description & Hreflang SEO tags into wp_head (T-01 / T-02)
add_action('wp_head', 'ni_inject_seo_meta_tags', 1);
function ni_inject_seo_meta_tags() {
    if (is_front_page()) {
        echo '<meta name="description" content="Shop authentic European lingerie crafted for full-bust fit, everyday elegance, and unmatched support. Express DHL shipping with guaranteed DDP duties pre-cleared." />\\n';
        echo '<link rel="alternate" hreflang="en-US" href="https://naturaintimo.com/" />\\n';
        echo '<link rel="alternate" hreflang="pl-PL" href="https://naturaintimo.com/pl/" />\\n';
        echo '<link rel="alternate" hreflang="x-default" href="https://naturaintimo.com/" />\\n';
    }
}
`;

  code += addition;

  const updateRes = await axios.put('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/14', { code }, { headers });
  console.log('Snippet #14 enriched with SEO meta tags and hreflang!');
}

enrichSnippet14().catch(console.error);
