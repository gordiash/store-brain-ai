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
headers = {'Authorization': f'Bearer {token}'}

# Target Organic Published Post
post_id = '1082888234909700_122124870831297993'

# Psychologically enhanced caption applying:
# 1. Loss Aversion (trapezius fatigue & permanent ligament strain)
# 2. Rule 10 ISO currency format (USD 150+, USD 10.00, CAD 200+)
# 3. Rule 11 Positive Distribution Multiplier (Zero links in caption + engaging conversational poll)
# 4. Mental Accounting & Regret Aversion (Free DHL air shipping & Free First Size Exchange)
updated_message = """The Black Friday Upgrade Your Shoulders Have Been Waiting For ✨

If you wear a US DD, DDD, G, or H cup, you already know the everyday exhaustion: flimsy elastic bands that ride up your back while thin straps dig painfully into your trapezius nerves.

Every month you spend wearing an unsupportive band permanently fatigues your posture and strains delicate Cooper's ligaments. 

This Black Friday, trade mass-market molded foam for authentic European lingerie engineering:
📐 Multi-Part Cut-and-Sewn Cups: Seamed cups gently project full busts forward rather than flattening tissue sideways toward the underarms.
🔒 Ribcage Anchoring: Firm powernet bands anchor 85% of breast weight against your ribcage bone, completely liberating your neck and shoulders from tension.

🖤 Black Friday Atelier Event is Officially Live:
• Take 20% OFF your entire order on USD 150+ with code BF20
• Coordinated Set Savings: Enjoy an automatic USD 10.00 Set Savings discount when pairing any bra with matching briefs
• 100% FREE DHL Express Worldwide Shipping direct from Europe on orders USD 150+ (and CAD 200+ to Canada)
• Pre-cleared DDP customs — zero surprise delivery fees (California SB 478 compliant)
• 30-Day Hassle-Free Returns & Complimentary Free First Size Exchange

💬 Community question: What is the single biggest frustration you have with your current bras — band ride-up, strap grooves, or cup spillage? Drop a comment below! 👇
🔗 (Explore our Black Friday collections & interactive size guide in the first comment)

#BlackFriday #FullBust #BraFitting #USABrafitting #GaiaLingerie #Gorsenia #EuropeanLingerie #SupportiveBra #EverydayElegance"""

first_comment_text = "🔗 Direct links to our Black Friday atelier collections & 30-second European size converter:\n• Size Calculator: https://naturaintimo.com/size-guide/\n• Atelier Collections: https://naturaintimo.com/"

print(f"--- Updating Organic Facebook Post {post_id} ---")

# Step 1: Update post message
res_post = requests.post(
    f"https://graph.facebook.com/v21.0/{post_id}",
    headers=headers,
    data={"message": updated_message}
)
print("Update post response:", res_post.status_code, res_post.json())

# Step 2: Check & post first comment
comm_check = requests.get(
    f"https://graph.facebook.com/v21.0/{post_id}/comments",
    headers=headers
)
comments_list = comm_check.json().get("data", [])
has_link = any("https://naturaintimo.com" in c.get("message", "") for c in comments_list)

if has_link:
    print("Comment with link already present.")
else:
    res_comment = requests.post(
        f"https://graph.facebook.com/v21.0/{post_id}/comments",
        headers=headers,
        data={"message": first_comment_text}
    )
    print("Post comment response:", res_comment.status_code, res_comment.json())

# Step 3: Check Meta Ad Creative
# Ad ID: 120253757823950058
ad_id = "120253757823950058"
print(f"\n--- Checking Meta Ad {ad_id} ---")
r_ad = requests.get(f"https://graph.facebook.com/v21.0/{ad_id}?fields=id,name,status,creative", headers=headers)
print("Ad data:", r_ad.status_code, r_ad.json())
