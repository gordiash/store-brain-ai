---
name: facebook-marketing-sms
description: >-
  Create, optimize, and automate Facebook content for Pages, Groups, and Ads Manager.
  Strictly compliant with Natura Intimo rules (Rule 10 ISO currency format, Rule 11
  positive distribution multiplier with zero external links in post body and first comment links).
  Covers Graph API v21.0+, Marketing API, Reels distribution, and community engagement.
license: Apache-2.0
compatibility: 'Facebook Graph API v21.0+, Marketing API. Requires Facebook Business account.'
metadata:
  author: store-brain-ai
  version: 2.0.0
  category: business
  tags:
    - facebook
    - social-media
    - ads
    - meta-graph-api
    - marketing
---

# Facebook Marketing & Meta Graph API Automation (`facebook-marketing-sms`)

## Overview

This skill guides AI agents in creating, scheduling, publishing, and optimizing content for Facebook Pages, Groups, and Meta Ads Manager for **Natura Intimo** (`naturaintimo.com`) and cross-border e-commerce.

It enforces strict compliance with our core operational directives in `AGENTS.md`:
1. **Rule 10 (Zero Stripped Currencies – P0):** Total ban on using the `$` symbol immediately before digits. Always format currencies using standard ISO syntax (`USD 10.00`, `USD 150+`, `CAD 200`, `PLN 200`).
2. **Rule 11 (Positive Distribution Multiplier – P0):** Zero external URLs in post bodies. All store/guide links must be placed in the **first comment** below the post. Every post must conclude with a conversational question or poll to ignite comments in the first 60 minutes.
3. **Rule 1 (Zero Hardcoded Secrets – P0):** Never pass access tokens in query parameters or commit secrets. Pass tokens via `Authorization: Bearer <token>` or request body.

---

## Instructions

### Platform Rules & Algorithm (2025–2026 Distribution Engine)

- **Meaningful Interactions First:** Meta algorithms heavily penalize passive broadcasting. Posts that spark conversations, debate, and peer-to-peer replies get amplified.
- **Zero External Links in Body:** Adding an external link (`https://...`) to the main body triggers an immediate negative distribution multiplier (-1.5x to -2.5x). Links must always go into the **first comment** under the post.
- **Save & Share Value:** Educational micro-lessons (e.g. *Sister Size Rule*, *The 2-Finger Ribcage Snugness Test*, *85% Underband Physics*) trigger saves and private DM shares, which are top-tier ranking signals.
- **Reels & Native Video:** Native video (9:16 vertical) gets 2–3x more reach than static images.
- **What Kills Reach:**
  - Cheap engagement bait ("Like if you agree", "Tag a friend")
  - Misleading clickbait headlines
  - Direct external outbound links in caption
  - Text-heavy ad creative over 20% area

---

### Mandatory Post Structure & Governance (Rule 10 & 11)

Every Facebook post and Reel caption published must follow this 4-part structure:

1. **Scroll-Stopping Educational / Empathy Hook:** Identify the exact pain point (e.g., band ride-up, digging straps, flattened full busts).
2. **The Micro-Lesson / Solution:** Concrete brafitting science or European atelier craft (e.g., narrow ergonomic underwires, high-tensile powernet band anchoring 85% of breast weight).
3. **Cross-Border Trust & Transparent Pricing:**
   - 100% FREE DHL Express Worldwide air shipping on orders **USD 150+** (and **CAD 200+** to Canada).
   - Pre-cleared DDP customs with zero surprise delivery fees (California SB 478 and Canadian Competition Act compliant).
   - 30-Day Hassle-Free Returns & Complimentary Free First Size Exchange.
   - Mention automated discounts strictly using ISO format (e.g., *automatic discount of USD 10.00 Set Savings at checkout*).
4. **Conversational Question & First Comment Pointer:**
   - Mandatory conversational question/poll (e.g., *„💬 Quick question: Do your bra straps dig in, or does your back band ride up first? Drop a comment below! 👇”*).
   - Direct pointer to comment: *„🔗 (Find your true European band and cup size guide link in the first comment)”*.
5. **Post First Comment:** Post immediately via API:
   `🔗 Direct link to our interactive European size converter & size guide: https://naturaintimo.com/size-guide/`

---

### Meta Graph API (v21.0+) Integration Standards

All scripts interacting with Facebook Graph API must use **v21.0** and retrieve credentials strictly from environment variables (`FB_PAGE_TOKEN`, `FB_PAGE_ID`, `FB_AD_ACCOUNT_ID`).

#### 1. Sanitize Currency Notation (Pre-Flight Rule 10 Check)
```python
import re

def clean_currency_notation(text: str) -> str:
    """
    Prevents Meta mobile apps from stripping currency symbols and numbers.
    Replaces '$10.00' with 'USD 10.00', '$150+' with 'USD 150+', etc.
    """
    # Replace $XX.XX or $XX with USD XX.XX
    text = re.sub(r'\$(\d+(?:\.\d{2})?)', r'USD \1', text)
    # Replace C$XX with CAD XX
    text = re.sub(r'C\$(\d+(?:\.\d{2})?)', r'CAD \1', text)
    return text
```

#### 2. Publishing Post & First Comment via Graph API v21.0
```python
import os
import requests

PAGE_ID = os.environ.get('FB_PAGE_ID')
PAGE_TOKEN = os.environ.get('FB_PAGE_TOKEN')

headers = {
    'Authorization': f'Bearer {PAGE_TOKEN}',
    'Content-Type': 'application/json'
}

# Step 1: Publish Post without outbound links in body
post_payload = {
    'message': clean_currency_notation(post_text)
}
res = requests.post(
    f'https://graph.facebook.com/v21.0/{PAGE_ID}/feed',
    headers=headers,
    json=post_payload
)
post_data = res.json()
post_id = post_data.get('id')

# Step 2: Immediately post store link as the first comment
comment_payload = {
    'message': '🔗 Direct link to our European conversion guide & collection: https://naturaintimo.com/size-guide/'
}
comment_res = requests.post(
    f'https://graph.facebook.com/v21.0/{post_id}/comments',
    headers=headers,
    json=comment_payload
)
```

#### 3. Publishing Video Reels via Graph API v21.0
```python
# Video upload endpoint
video_payload = {
    'file_url': public_video_url, # Hosted on secure public URL
    'description': clean_currency_notation(reel_caption),
    'published': True
}
v_res = requests.post(
    f'https://graph.facebook.com/v21.0/{PAGE_ID}/videos',
    headers=headers,
    json=video_payload
)
video_id = v_res.json().get('id')
```

---

### Facebook Ads (Marketing API v21.0)

#### Structure & Currency Controls
- **Campaign Level:** Objective (`OUTCOME_SALES`, `OUTCOME_TRAFFIC`, `OUTCOME_ENGAGEMENT`). Set lifetime or daily budget limit.
- **Ad Set Level:** Target USA / Canada. Budget in minor currency units (e.g., 50000 = PLN 500.00 or USD 500.00). Ensure bid strategy is `LOWEST_COST_WITHOUT_CAP`.
- **Ad Level:** Ad creative linking directly to landing page with clear UTM tagging:
  `?utm_source=facebook&utm_medium=paid_social&utm_campaign=us_fullbust_acquisition`
- **Pricing Transparency:** Ad copy must strictly disclose all landed costs (California SB 478 / Canadian Drip Pricing rules). No hidden fees at checkout.

---

## Guidelines & Best Practices

1. **Never use `$` before digits** — Always write `USD 10.00`, `CAD 200`, `USD 150+`.
2. **Never place outbound links in the post caption** — Post all links in the first comment.
3. **Always conclude posts with a question** — Ask for opinions, measurement habits, or fit dilemmas.
4. **Schedule Consistency:** Maintain 1–2 posts/day batch-scheduled via Graph API with scheduled publish times (`scheduled_publish_time`).
5. **Prompt Response:** Respond to comments within 60 minutes to sustain algorithmic momentum.
