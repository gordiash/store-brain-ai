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
    register_rest_route('ni/v1', '/speed-audit', array(
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function() {
            $ls_options = class_exists('\\\\LiteSpeed\\\\Conf') ? \\LiteSpeed\\Conf::get_instance()->get_options() : array();
            
            $keys = array(
                'cache', 'cache-priv', 'cache-commenter', 'cache-rest', 'cache-page_login',
                'cache-favicon', 'cache-resources', 'cache-mobile', 'cache-browser',
                'css-minify', 'css-combine', 'css-combine_priority', 'css-ucss', 'css-async',
                'js-minify', 'js-combine', 'js-combine_priority', 'js-delay', 'js-defer',
                'optm-html_minify', 'optm-dns_prefetch', 'optm-js_defer',
                'media-lazy', 'media-lazy_exc', 'media-optm', 'media-webp',
                'crawler', 'crawler-drop_domain', 'crawler-load_limit'
            );
            $speed_settings = array();
            foreach ($keys as $k) {
                $speed_settings[$k] = isset($ls_options[$k]) ? $ls_options[$k] : null;
            }

            return array(
                'php_version' => phpversion(),
                'memory_limit' => ini_get('memory_limit'),
                'max_execution_time' => ini_get('max_execution_time'),
                'opcache_enabled' => function_exists('opcache_get_status') && !empty(opcache_get_status()['opcache_enabled']),
                'object_cache' => wp_using_ext_object_cache(),
                'speed_settings' => $speed_settings
            );
        }
    ));
});
`;

  const res = await axios.get('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/14', { headers });
  let code = res.data.code;
  if (!code.includes('/speed-audit')) {
    code += snippetCode;
    await axios.post('https://naturaintimo.com/wp-json/code-snippets/v1/snippets/14', { code }, { headers });
    console.log('Registered /ni/v1/speed-audit route in Snippet 14.');
  }

  // Query endpoint
  const audit = await axios.get('https://naturaintimo.com/wp-json/ni/v1/speed-audit');
  console.log('Speed Audit Config:');
  console.log(JSON.stringify(audit.data, null, 2));
}

main().catch(console.error);
