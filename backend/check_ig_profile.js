import dotenv from 'dotenv';
dotenv.config();

const token = process.env.FB_PAGE_TOKEN;
const igId = process.env.IG_ACCOUNT_ID;

if (!token || !igId) {
  console.error("Missing token or igId");
  process.exit(1);
}

async function checkAccount() {
  try {
    const url = `https://graph.facebook.com/v20.0/${igId}?fields=id,username,name,biography,website,profile_picture_url,followers_count,media_count&access_token=${token}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log("Instagram Account Info:", JSON.stringify(data, null, 2));

    const mediaUrl = `https://graph.facebook.com/v20.0/${igId}/media?fields=id,caption,media_type,media_url,permalink,timestamp&limit=5&access_token=${token}`;
    const mediaRes = await fetch(mediaUrl);
    const mediaData = await mediaRes.json();
    console.log("Recent Media:", JSON.stringify(mediaData, null, 2));
  } catch (err) {
    console.error("Error checking account:", err.message);
  }
}

checkAccount();
