import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function uploadImage(filePath, title, altText) {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const fileData = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  const headers = {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'image/jpeg',
    'Content-Disposition': `attachment; filename="${fileName}"`
  };

  const res = await axios.post('https://naturaintimo.com/wp-json/wp/v2/media', fileData, { headers });
  console.log(`Uploaded ${fileName} -> Media ID: ${res.data.id}, URL: ${res.data.source_url}`);

  // Update title and alt
  await axios.post(
    `https://naturaintimo.com/wp-json/wp/v2/media/${res.data.id}`,
    {
      title: title,
      alt_text: altText
    },
    { headers: { Authorization: `Basic ${auth}` } }
  );

  return { id: res.data.id, url: res.data.source_url };
}

async function main() {
  console.log('Uploading clean images to WordPress media library...');
  const luisseImg = await uploadImage(
    'temp_images/luisse_bra_cropped.jpg',
    'Gorsenia Luisse Soft Bra Studio Front',
    'Gorsenia Luisse Soft Bra Black studio close-up on clean white background'
  );

  const paradiseImg = await uploadImage(
    'temp_images/gorsenia_paradise_panties_perfect2.jpg',
    'Gorsenia Paradise Brazilian Panties Studio Front',
    'Gorsenia Paradise Brazilian panties Black lace studio product view'
  );

  fs.writeFileSync(
    'temp_images/uploaded_media_ids.json',
    JSON.stringify({ luisseImg, paradiseImg }, null, 2)
  );
  console.log('Done uploading clean images.');
}

main().catch(console.error);
