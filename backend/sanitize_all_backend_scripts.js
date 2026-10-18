import fs from 'fs';
import path from 'path';

const backendDir = path.resolve('.');
const files = fs.readdirSync(backendDir).filter(f => f.endsWith('.js') && f !== 'sanitize_all_backend_scripts.js');

let totalModified = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;

  // 1. Remove fallback in WP_ADMIN_USER
  content = content.replace(/process\.env\.WP_ADMIN_USER\s*\|\|\s*['"][^'"]+['"]/g, 'process.env.WP_ADMIN_USER');
  content = content.replace(/process\.env\.WP_APP_PASSWORD\s*\|\|\s*['"][^'"]+['"]/g, 'process.env.WP_APP_PASSWORD');
  content = content.replace(/process\.env\.WOOCOMMERCE_CONSUMER_KEY\s*\|\|\s*['"][^'"]+['"]/g, 'process.env.WOOCOMMERCE_CONSUMER_KEY');
  content = content.replace(/process\.env\.WOOCOMMERCE_CONSUMER_SECRET\s*\|\|\s*['"][^'"]+['"]/g, 'process.env.WOOCOMMERCE_CONSUMER_SECRET');

  // 2. Remove consumer_key query params in fetch / axios URLs
  content = content.replace(/[?&]consumer_key=\$\{?[a-zA-Z0-9_.]+\}?[&]consumer_secret=\$\{?[a-zA-Z0-9_.]+\}?/g, '');
  content = content.replace(/\?consumer_key=\$\{?[a-zA-Z0-9_.]+\}?/g, '');
  content = content.replace(/&consumer_secret=\$\{?[a-zA-Z0-9_.]+\}?/g, '');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    totalModified++;
    console.log(`Sanitized: ${file}`);
  }
}

console.log(`Done! Modified ${totalModified} files.`);
