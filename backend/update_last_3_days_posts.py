import os
import requests
import json

# Parse .env
env_vars = {}
with open('.env', 'r') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env_vars[k.strip()] = v.strip().strip('"').strip("'")

token = env_vars.get('FB_PAGE_TOKEN')
page_id = env_vars.get('FB_PAGE_ID')

headers = {
    'Authorization': f'Bearer {token}'
}

# The 3 posts from last 3 days:
# 1. Nov 01: 1082888234909700_122125498443297993
# 2. Oct 31: 1082888234909700_122125499937297993 (Video / Reel ID: 1807640687048318)
# 3. Oct 30: 1082888234909700_122126296503297993

posts_updates = [
    {
        "post_id": "1082888234909700_122125498443297993",
        "date": "2026-11-01",
        "type": "post",
        "text": """The Science of True Ribcage Support: How to Stop Band Ride-Up ✨

If you find yourself constantly pulling down the back of your bra throughout the day, your band is too loose. 

When your band rides up toward your neck, the front underwires tilt forward, digging into your ribs and transferring the entire gravitational load onto your shoulders.

Here is how proper European brafitting transforms your posture:
🔒 A firm, parallel band holds 85% of breast weight anchored to your torso.
📐 Straps are left relaxed, functioning only to keep the fabric flush against your skin.
✨ Soft, breathable microfiber construction ensures all-day comfort without chafing or pressure points.

✈️ Direct European air delivery via DHL Express Worldwide:
• Pre-cleared DDP customs with zero surprise delivery fees (California SB 478 compliant).
• 100% FREE DHL Express Worldwide air shipping on orders USD 150+ (and CAD 200+ to Canada).
• 30-Day Hassle-Free Returns & Complimentary Free First Size Exchange.

💬 Quick question: Do your bra straps dig in, or does your back band ride up first? Drop a comment below! 👇
🔗 (Find your true European band and cup size guide link in the first comment)

#BraFitting #FullBust #USABrafitting #BodyPositivity #EuropeanLingerie #SupportiveBra #PostureRelief""",
        "comment": "🔗 Direct link to our interactive European size converter & size guide: https://naturaintimo.com/size-guide/"
    },
    {
        "post_id": "1082888234909700_122125499937297993",
        "video_id": "1807640687048318",
        "date": "2026-10-31",
        "type": "video_and_post",
        "text": """Can Delicate Lace Bras Actually Support Heavy Busts? ✨

You don’t need stiff, thick molded foam to get dependable all-day lift for a fuller bust.

Heritage European ateliers engineer delicate botanical embroidery on high-tensile powernet cradles that distribute pressure evenly while staying feather-light against your skin.

✨ Ava 2271 Divine Soft Bra in Champagne Wine (US 30G–42B / EU 65I–95B):
📐 Unpadded balcony lift without flattening or bulk.
🔒 Ergonomic underwires and ribcage band support 85% of bust weight.
✨ Automatic discount: USD 10.00 Set Savings when completing the coordinated set with matching briefs.

✈️ Dispatched direct from Europe via DHL Express Worldwide:
• Pre-cleared DDP customs with zero surprise delivery fees (California SB 478 compliant).
• 100% FREE DHL Express Worldwide air transit on orders over USD 150 (and over CAD 200 to Canada).
• 30-Day Free First Size Exchange guarantee.

💬 Honest poll: Do you trust delicate lace bras to support a full bust, or have you always relied on foam? Tell us below! 👇
🔗 (Explore our unpadded European collection link in the first comment)

#FullBustLingerie #BraFitting #USABrafitting #AvaLingerie #EuropeanLingerie #EverydayElegance""",
        "comment": "🔗 Explore our heritage unpadded European collections and size calculator: https://naturaintimo.com/size-guide/"
    },
    {
        "post_id": "1082888234909700_122126296503297993",
        "date": "2026-10-30",
        "type": "post",
        "text": """Delicate Embroidery Engineered for Dependable Everyday Support ✨

For fuller busts, finding a bra that combines intricate European lace with all-day structural stability can feel impossible. Mass-market brands often rely on bulky padding to compensate for weak band construction.

The Ava 2271 Divine Soft Bra in Champagne Wine takes a different approach:
📐 Multi-part unpadded cups cradle and shape without adding unnecessary bulk.
🔒 A reinforced supportive underband ensures your silhouette stays centered throughout long days.
✨ Coordinated Set: Pair with matching Ava 2271 briefs and enjoy an automatic discount of USD 10.00 Set Savings at checkout.

✈️ Dispatched direct from Europe via DHL Express Worldwide:
• 2–4 business days air transit.
• Pre-cleared DDP customs — zero surprise delivery fees (California SB 478 compliant).
• 100% FREE DHL Express shipping on orders over USD 150 (and over CAD 200 to Canada).
• 30-Day Hassle-Free Returns & Complimentary Free First Size Exchange.

💬 What is your biggest struggle when shopping for lace bras: underwires poking, cup spillage, or scratchy fabric? Let us know below! 👇
🔗 (Find your exact European sister size conversion in the first comment)

#FullBustLingerie #BraFitting #USABrafitting #AvaLingerie #EuropeanLingerie #SupportiveBra #EverydayElegance""",
        "comment": "🔗 Convert your US/UK size to European sister sizes in 30 seconds: https://naturaintimo.com/size-guide/"
    }
]

def update_item(item):
    post_id = item["post_id"]
    text = item["text"]
    comment = item["comment"]
    print(f"\n--- Updating post {post_id} ({item['date']}) ---")
    
    # 1. Update text
    # Try updating via post endpoint first
    post_res = requests.post(
        f"https://graph.facebook.com/v21.0/{post_id}",
        headers=headers,
        data={"message": text}
    )
    print(f"POST /{post_id} response:", post_res.status_code, post_res.json())
    
    # If it's a video/reel or if update failed, try video_id if available
    if "video_id" in item:
        vid = item["video_id"]
        v_res = requests.post(
            f"https://graph.facebook.com/v21.0/{vid}",
            headers=headers,
            data={"description": text}
        )
        print(f"POST /{vid} description response:", v_res.status_code, v_res.json())

    # 2. Add first comment
    # Check if comment already exists
    comm_check = requests.get(
        f"https://graph.facebook.com/v21.0/{post_id}/comments",
        headers=headers
    )
    comments_data = comm_check.json().get("data", [])
    already_commented = any("https://naturaintimo.com/size-guide/" in c.get("message", "") for c in comments_data)
    
    if already_commented:
        print("Comment with link already present.")
    else:
        comm_res = requests.post(
            f"https://graph.facebook.com/v21.0/{post_id}/comments",
            headers=headers,
            data={"message": comment}
        )
        print("POST comment response:", comm_res.status_code, comm_res.json())

for item in posts_updates:
    update_item(item)
