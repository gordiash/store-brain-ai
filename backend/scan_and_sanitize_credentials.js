import fs from 'fs';
import path from 'path';

const backendDir = path.resolve('.');
const files = fs.readdirSync(backendDir).filter(f => f.endsWith('.js'));

console.log(`Scanning ${files.length} JS files in ${backendDir} for credentials hygiene...`);

let issuesFound = 0;

for (const file of files) {
  const filePath = path.join(backendDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Check for hardcoded password patterns or fallbacks
    if (line.includes('WP_APP_PASSWORD') && (line.includes('||') || line.includes("= '") || line.includes('="'))) {
      if (!line.includes('process.env.WP_APP_PASSWORD;')) {
        console.log(`[ISSUE] ${file}:${idx + 1} - Fallback or hardcoded WP_APP_PASSWORD: ${line.trim()}`);
        issuesFound++;
      }
    }
    if (line.includes('WP_ADMIN_USER') && line.includes('||')) {
      console.log(`[ISSUE] ${file}:${idx + 1} - Fallback WP_ADMIN_USER: ${line.trim()}`);
      issuesFound++;
    }
    if (line.includes('consumer_key=') || line.includes('consumer_secret=')) {
      console.log(`[ISSUE] ${file}:${idx + 1} - Query string credentials: ${line.trim()}`);
      issuesFound++;
    }
    if (line.includes('WOOCOMMERCE_CONSUMER_KEY') && line.includes('||')) {
      console.log(`[ISSUE] ${file}:${idx + 1} - Fallback WOOCOMMERCE_CONSUMER_KEY: ${line.trim()}`);
      issuesFound++;
    }
    if (line.includes('WOOCOMMERCE_CONSUMER_SECRET') && line.includes('||')) {
      console.log(`[ISSUE] ${file}:${idx + 1} - Fallback WOOCOMMERCE_CONSUMER_SECRET: ${line.trim()}`);
      issuesFound++;
    }
  });
}

console.log(`\nScan complete. Total issues found: ${issuesFound}`);
