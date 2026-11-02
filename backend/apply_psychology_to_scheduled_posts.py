import os
import json
import requests
import re

# Load .env
env_vars = {}
with open('.env', 'r') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env_vars[k.strip()] = v.strip().strip('"').strip("'")

token = env_vars.get('FB_PAGE_TOKEN')
page_id = env_vars.get('FB_PAGE_ID')
headers = {'Authorization': f'Bearer {token}'}

with open('backend/content_calendar_next_week.json', 'r') as f:
    calendar_data = json.load(f)

# Define psychologically enhanced captions for each day (1 to 7)

# Day 1 - Monday 2026-11-02 (Gaia Mary Burgundy)
caption_day1 = """If your bra straps leave deep red marks at the end of the day, your band is doing 0% of the work. ✨

Every month you spend wearing a loose band and compensating with tight straps, you place immense gravitational strain on delicate trapezius nerves and Cooper's ligaments. 

In European brafitting ateliers, the physics of lift is completely inverted:
📐 Multi-Part Cut-and-Sewn Construction: Seamed 3-piece lower cups project breast tissue forward and centered — never pushed flat into your underarms.
🔒 Powernet Ribcage Anchoring: The firm, breathable side band secures 85% of breast weight firmly against your ribcage bone, liberating your neck and shoulders from chronic tension.

✨ Featured: Gaia Mary BS 1372 Semi-Soft Bra in Rich Burgundy (US 32D–42D / EU 70D–95D).
✨ Set Savings: Save USD 10.00 / CAD 13.00 instantly when completing the coordinated set with matching briefs.
✈️ 100% FREE DHL Express Worldwide Shipping direct from Europe on orders USD 150+ / CAD 200+.
📦 Pre-cleared DDP customs — zero surprise delivery fees (California SB 478 compliant).
✨ 30-Day Hassle-Free Returns & Complimentary Free First Size Exchange.

💬 Be honest: How many years have you been wearing your current bra size without getting remeasured? Drop a comment below! 👇
🔗 (Direct link to our European conversion guide & atelier collection is in the first comment)

#NaturaIntimo #FullBust #BraFitting #USABrafitting #GaiaLingerie #SupportiveBra #EuropeanLingerie #BodyPositivity"""

# Day 2 - Tuesday 2026-11-03 (Gorsenia Paradise Black)
caption_day2 = """Why do your underwires keep poking into your armpits? 🇬🇧✨

If you wear a UK DD, E, F, FF, G, or GG cup, you've likely suffered from wide wires that wrap into your armpits. That painful pinching isn't "just how bras feel" — it's an anatomical mismatch that pushes breast tissue sideways.

Polish bra ateliers like Gorsenia take a completely different architectural approach:
📐 Narrow Wires & Deep Projection: The underwires match your natural breast root, channeling volume upward and forward for a centered, sculpted lift.
🔒 Uncompromising Balcony Lift: Transparent non-stretch tulle reinforced with double-layered lower cups creates reliable lift without heavy foam padding.

✨ Model: Gorsenia K496 Paradise Soft Balcony in Midnight Black (UK 32F–44E / EU 70I–100G).
✨ Coordinated Set Savings: Save GBP 8.00 instantly when completing the coordinated atelier set.
✈️ 100% FREE DHL Express Worldwide DDP shipping direct to the UK on orders GBP 120+ (2–4 business days air delivery).
✨ 30-Day Hassle-Free Returns & Complimentary Free First Size Exchange.

💬 Tell us: Do your underwires usually poke you at the center gore or under your arms? Let us know below! 👇
🔗 (Find your exact UK-to-European size conversion link in the first comment below)

#Gorsenia #FullBustUK #ABraThatFits #PolishBras #BalconyBra #LingerieStyling #BrafittingUK #NaturaIntimo"""

# Day 3 - Wednesday 2026-11-04 (Gorsenia Luisse Soft Bra)
caption_day3 = """Wearing an AU 12E or 14F? Here is why European breathable mesh outperforms molded foam in warm climates. 🇦🇺✨

Molded foam bras act like thermal insulators: they trap body heat and moisture, causing friction and skin irritation while doing very little to actually lift a full bust.

The Gorsenia Luisse K441 is engineered with ultra-lightweight, high-tensile breathable embroidery:
🌬️ Maximum Airflow: Featherweight sheer upper cup and reinforced lower mesh keep you cool and dry all day long.
🔒 Lateral Support Panels: Integrated side-support slings gently guide tissue toward the center, creating a clean silhouette under summer dresses and linen shirts.

✨ Featured: Gorsenia Luisse K441 Soft Bra (AU 10E–20D / EU 65F–110D).
✨ Set Savings: Pair with matching Luisse Bikini Briefs and automatically save AUD 15.00 at checkout.
✈️ 100% FREE DHL Express Worldwide DDP air shipping to Australia on orders AUD 230+ (Fast 3–5 business day delivery direct from Poland).
✨ 30-Day Hassle-Free Returns & Complimentary Free First Size Exchange.

💬 Australian community: What is your biggest struggle with bras during warm weather — heat, strap slip, or lack of support? Drop a comment below! 👇
🔗 (Australian dress size conversion chart link in the first comment below)

#AUBrafitting #FullBustAustralia #Gorsenia #SummerLingerie #BreathableLingerie #NaturaIntimo #LingerieInspo"""

# Day 4 - Thursday 2026-11-05 (Gaia 1135 Everyday Soft)
caption_day4 = """You don’t need 1/2 inch of foam padding for a smooth t-shirt silhouette. ✨

Thick molded foam often creates cup gaping when you move and collapses projected breast tissue backward into your ribcage.

European unpadded engineering gives you the sleekest profile without the bulk:
✨ Breathable Microfiber & Fine Mesh: Conforms to your natural curvature without show-through lines or bunching seams.
🔒 Structural Side Slings: Lift and center without heavy padding or stiff wires.

✨ Featured: Gaia BS 1135 Everyday Soft Bra in Neutral Champagne (US 30DD–42DD / EU 65E–95E).
✨ Bundle & Save: Pair with matching Brazilian Briefs for an automatic USD 10.00 Set Savings.
✈️ 100% FREE DHL Express Worldwide DDP air shipping to USA on orders USD 150+.
📦 Customs pre-cleared, California SB 478 transparent pricing.
✨ 30-Day Returns & Complimentary Free First Size Exchange.

💬 Honest question: Do you prefer unpadded mesh bras or molded foam under your everyday t-shirts? Tell us below! 👇
🔗 (Explore the everyday collection link in the first comment below)

#TShirtBra #NaturalShape #EverydayLingerie #GaiaLingerie #BraFitting #USAFullBust #NaturaIntimo"""

# Day 5 - Friday 2026-11-06 (Ava 2271 Divine)
caption_day5 = """Haute atelier craftsmanship where delicate embroidery meets uncompromising structural lift. 🇦🇪✨

The Ava 2271 Divine is designed for women who refuse to choose between delicate European artistry and genuine full-bust support. 

Crafted in Poland with meticulous attention to detail:
✨ Intricate Bi-Color Embroidery: Champagne and refined burgundy floral motifs woven onto soft, durable support tulle.
🔒 Comfort Cradling: Wide microfibre wings anchor gently against your body for a silky, friction-free feel throughout long days and evening events.

✨ Featured: Ava 2271 Divine Soft Bra (EU 65I–95B / US 30G–42B / UK 30G–42B).
✨ Complete the Set: Pair with matching Divine Bikini Briefs and enjoy an automatic 37.00 AED / USD 10.00 Set Savings at checkout.
✈️ 100% FREE DHL Express Worldwide DDP shipping to UAE (Dubai, Abu Dhabi) on orders 550.00 AED+ (2–4 business days discreet courier delivery).
✨ 30-Day Hassle-Free Returns & Complimentary Free First Size Exchange.

💬 Ladies in Dubai & Abu Dhabi: What is your favorite lingerie palette — classic noir, neutral champagne, or rich jewel tones? Drop your thought below! 👇
🔗 (Direct link to our haute atelier collection in the first comment below)

#AvaLingerie #HauteLingerie #DubaiFashion #LuxuryLingerie #SupportiveElegance #EuropeanCraftsmanship #NaturaIntimo"""

# Day 6 - Saturday 2026-11-07 (Sister Sizes)
caption_day6 = """Are you wearing a 36DD because department stores didn’t carry 32G? ✨

This is the single most common sizing trap in North America and beyond:
When your band is too loose (e.g. 36 instead of 32), the band slides up your back. To stop the cups from sagging, you tighten your shoulder straps until they dig painfully into your trapezius nerves.

Here is the secret:
🔒 Going down 2 band sizes (from 36 to 32) and up 2 cup sizes (from DD to G) keeps the exact same cup volume, but transfers 85% of the weight to your ribcage!

DIY Snugness Check: Measure your snug underbust with a tape right now. If your ribcage measures 31-32 inches, you should never be wearing a 36 band!

✈️ 100% FREE DHL Express Worldwide Shipping on orders USD 150+ / GBP 120+ / CAD 200+.
✨ 30-Day Hassle-Free Returns & Complimentary Free First Size Exchange.

💬 Drop your current US or UK size below and our fitters will calculate your true European sister size! 👇
🔗 (Interactive sister size conversion calculator link in the first comment)

#SisterSizes #BraHacks #BraFittingTips #FullBustSolutions #ABraThatFits #EuropeanLingerie #NaturaIntimo"""

# Day 7 - Sunday 2026-11-08 (Set Savings & Weekend Self-Care)
caption_day7 = """Coordinated lingerie isn’t just for special occasions — it’s everyday structural self-care. 🖤✨

When your bra band anchors securely against your ribcage and your matching briefs fit seamlessly without pinching, your posture and confidence immediately shift. 

Every bra in our atelier is designed to pair with coordinated briefs engineered for all-day comfort:
✨ Coordinated Set Savings: Why buy an isolated bra when completing the atelier set unlocks instant savings for less than the cost of a daily latte?
• Save USD 10.00 (USA)
• Save CAD 13.00 (Canada)
• Save GBP 8.00 (United Kingdom)
• Save AUD 15.00 (Australia)
• Save 37.00 AED (United Arab Emirates)

✈️ Fast 2–4 business days delivery direct from Poland via DHL Express Worldwide DDP.
✨ 30-Day Hassle-Free Returns & Complimentary Free First Size Exchange.

💬 Sunday self-care check: Matching sets or mix-and-match? Tell us your everyday go-to! 👇
🔗 (Direct link to explore coordinated atelier sets in the first comment below)

#LingerieSet #MatchingSet #WeekendSelfCare #FullBustSupport #Gorsenia #ArchitecturalLingerie #NaturaIntimo"""

enhanced_captions = [
    caption_day1,
    caption_day2,
    caption_day3,
    caption_day4,
    caption_day5,
    caption_day6,
    caption_day7
]

# Mapping to scheduled IDs on FB:
# Let's map date to FB ID
fb_id_map = {
    "2026-11-02": "1082888234909700_122126843883297993",
    "2026-11-03": "1082888234909700_122126109885297993",
    "2026-11-04": "1082888234909700_122126843931297993",
    "2026-11-05": "1082888234909700_122126110071297993",
    "2026-11-06": "1082888234909700_122126843991297993",
    "2026-11-07": "1082888234909700_122126110137297993",
    "2026-11-08": "1082888234909700_122126844069297993"
}

# Update content_calendar_next_week.json
for i, item in enumerate(calendar_data['schedule']):
    item['caption'] = enhanced_captions[i]
    item['fb_scheduled_id'] = fb_id_map.get(item['date'])

with open('backend/content_calendar_next_week.json', 'w') as f:
    json.dump(calendar_data, f, indent=2)

print("Updated backend/content_calendar_next_week.json with psychologically enhanced copy.")

# Now update scheduled posts on Facebook via Graph API v21.0
print("\n--- Updating scheduled posts on Facebook Graph API v21.0 ---")
for item in calendar_data['schedule']:
    d = item['date']
    post_id = fb_id_map.get(d)
    caption = item['caption']
    print(f"\nUpdating {d} (ID: {post_id})...")
    
    res = requests.post(
        f"https://graph.facebook.com/v21.0/{post_id}",
        headers=headers,
        data={"message": caption}
    )
    print(f"Result for {d}:", res.status_code, res.json())

print("\nAll scheduled posts successfully updated!")
