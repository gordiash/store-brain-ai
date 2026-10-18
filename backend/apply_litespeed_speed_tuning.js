import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const snippetCode = `
add_action('rest_api_init', function() {
    register_rest_route('ni/v1', '/speed-tune', array(
        'methods' => 'POST',
        'permission_callback' => '__return_true',
        'callback' => function() {
            $updated = array();
            
            // 1. Configure DNS prefetch domains
            $dns_domains = array(
                '//fonts.googleapis.com',
                '//fonts.gstatic.com',
                '//www.googletagmanager.com',
                '//www.google-analytics.com',
                '//stats.wp.com',
                '//www.paypal.com'
            );
            update_option('litespeed.conf.optm-dns_prefetch', $dns_domains);
            $updated['optm-dns_prefetch'] = $dns_domains;

            // 2. Enable HTML Minify
            update_option('litespeed.conf.optm-html_minify', 1);
            $updated['optm-html_minify'] = 1;

            // 3. Enable CSS Minify
            update_option('litespeed.conf.css-minify', 1);
            $updated['css-minify'] = 1;

            // 4. Enable JS Minify
            update_option('litespeed.conf.js-minify', 1);
            $updated['js-minify'] = 1;

            // 5. Ensure Browser Cache is active and configured
            update_option('litespeed.conf.cache-browser', 1);
            update_option('litespeed.conf.cache-ttl_browser', 31557600); // 1 year
            $updated['cache-browser'] = 1;

            // 6. Enable Crawler
            update_option('litespeed.conf.crawler', 1);
            $updated['crawler'] = 1;

            // 7. Purge all cache so new minified files and settings take effect
            if (class_exists('\\\\LiteSpeed\\\\Purge')) {
                \\LiteSpeed\\Purge::purge_all();
            }

            return array(
                'success' => true,
                'updated' => $updated
            );
        }
    ));
});
`;

  // Update Snippet 14 with this route
  const res = await axios.get('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/14', { headers });
  let code = res.data.code;
  if (!code.includes('/speed-tune')) {
    code += snippetCode;
    await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/14', { code }, { headers });
    console.log('Registered /ni/v1/speed-tune route');
  }

  // Trigger tuning
  const tuneRes = await axios.post('https://naturaintimo.com/wp-json/ni/v1/speed-tune');
  console.log('Tuning Response:');
  console.log(JSON.stringify(tuneRes.data, null, 2));
}

main().catch(console.error);
