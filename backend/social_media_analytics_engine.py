#!/usr/bin/env python3
"""
Social Media Growth & Analytics Engine for Natura Intimo
Pobiera statystyki z Facebook Graph API & Instagram Graph API,
analizuje efektywność postów, generuje rekomendacje A/B testów
oraz zapisuje stan do pliku trackingowego.
"""

import os
import sys
import json
import urllib.request
import urllib.parse
from datetime import datetime

TRACKER_FILE = "backend/social_media_analytics_tracker.json"

def load_env():
    env = {}
    if os.path.exists(".env"):
        with open(".env") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env[k.strip()] = v.strip().strip('"\'')
    return env

def fetch_facebook_insights(token, page_id):
    posts_data = []
    url = f"https://graph.facebook.com/v20.0/{page_id}/posts?fields=id,message,created_time,shares,reactions.summary(true),comments.summary(true)&access_token={token}&limit=25"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            for item in data.get('data', []):
                pid = item.get('id')
                msg = item.get('message', '')
                created = item.get('created_time')
                reactions = item.get('reactions', {}).get('summary', {}).get('total_count', 0)
                comments = item.get('comments', {}).get('summary', {}).get('total_count', 0)
                shares = item.get('shares', {}).get('count', 0)
                
                # Fetch post insights if available
                impressions = 0
                engaged_users = 0
                try:
                    ins_url = f"https://graph.facebook.com/v20.0/{pid}/insights?metric=post_impressions,post_engaged_users&access_token={token}"
                    ins_req = urllib.request.Request(ins_url)
                    with urllib.request.urlopen(ins_req) as ins_resp:
                        ins_data = json.loads(ins_resp.read().decode('utf-8'))
                        for metric in ins_data.get('data', []):
                            if metric.get('name') == 'post_impressions':
                                impressions = metric.get('values', [{}])[0].get('value', 0)
                            elif metric.get('name') == 'post_engaged_users':
                                engaged_users = metric.get('values', [{}])[0].get('value', 0)
                except Exception:
                    pass

                posts_data.append({
                    "platform": "facebook",
                    "id": pid,
                    "text": msg,
                    "created_at": created,
                    "reactions": reactions,
                    "comments": comments,
                    "shares": shares,
                    "impressions": impressions,
                    "engaged_users": engaged_users,
                    "engagement_rate": round((reactions + comments + shares) / (impressions if impressions > 0 else 1) * 100, 2)
                })
    except Exception as e:
        print(f"[ERROR] Błąd pobierania postów FB: {e}", file=sys.stderr)
    return posts_data

def fetch_instagram_insights(token, ig_id):
    media_data = []
    if not ig_id:
        return media_data
    url = f"https://graph.facebook.com/v20.0/{ig_id}/media?fields=id,caption,media_type,timestamp,like_count,comments_count,permalink&access_token={token}&limit=25"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            for item in data.get('data', []):
                mid = item.get('id')
                caption = item.get('caption', '')
                created = item.get('timestamp')
                likes = item.get('like_count', 0)
                comments = item.get('comments_count', 0)
                media_type = item.get('media_type')

                # Insights per media
                impressions = 0
                reach = 0
                saved = 0
                try:
                    ins_url = f"https://graph.facebook.com/v20.0/{mid}/insights?metric=reach,saved&access_token={token}"
                    ins_req = urllib.request.Request(ins_url)
                    with urllib.request.urlopen(ins_req) as ins_resp:
                        ins_data = json.loads(ins_resp.read().decode('utf-8'))
                        for metric in ins_data.get('data', []):
                            if metric.get('name') == 'reach':
                                reach = metric.get('values', [{}])[0].get('value', 0)
                            elif metric.get('name') == 'saved':
                                saved = metric.get('values', [{}])[0].get('value', 0)
                except Exception:
                    pass

                media_data.append({
                    "platform": "instagram",
                    "id": mid,
                    "media_type": media_type,
                    "text": caption,
                    "created_at": created,
                    "likes": likes,
                    "comments": comments,
                    "saved": saved,
                    "reach": reach,
                    "engagement_rate": round((likes + comments + saved) / (reach if reach > 0 else 1) * 100, 2)
                })
    except Exception as e:
        print(f"[ERROR] Błąd pobierania mediów IG: {e}", file=sys.stderr)
    return media_data

def analyze_and_generate_ab_tests(fb_posts, ig_posts):
    recommendations = []
    
    # Analiza formatów i czasu
    has_videos = any(p.get('media_type') == 'VIDEO' for p in ig_posts)
    if not has_videos:
        recommendations.append({
            "type": "FORMAT_TEST",
            "hypothesis": "Reels (wideo 9:16) z prezentacją detali konstrukcyjnych miseczki generują 3-5x wyższy organiczny zasięg w USA niż statyczne zdjęcia.",
            "test_action": "Opublikować Reel porównujący rozmiarówkę US 34DDD z EU 75G z głosem lektora w US English."
        })

    recommendations.append({
        "type": "AUDIENCE_TARGETING_TEST",
        "hypothesis": "Posty na Facebooku z aktywnym ograniczeniem grupy odbiorców do USA (Targeting: United States) uzyskają 100% odsłon z rynku docelowego.",
        "test_action": "Przy kolejnej publikacji ustawić w feedzie feed_targeting={'countries': ['US']}."
    })

    recommendations.append({
        "type": "HOOK_TEST",
        "hypothesis": "Hook edukacyjny ('Why do 80% of women wear the wrong bra band size?') ma wyższy CTR niż bezpośrednia promocja produktu ('Check our new collection').",
        "test_action": "Przetestować post edukacyjny z kalkulatorem rozmiarów EU->US."
    })

    return recommendations

def run():
    env = load_env()
    token = env.get('FB_PAGE_TOKEN')
    page_id = env.get('FB_PAGE_ID')
    ig_id = env.get('IG_ACCOUNT_ID')

    if not token or not page_id:
        print("[CRITICAL] Brak wymaganych zmiennych FB_PAGE_TOKEN / FB_PAGE_ID w .env")
        sys.exit(1)

    print(f"[*] Rozpoczynam pobieranie danych dla Fanpage {page_id} i Instagram {ig_id}...")
    fb_posts = fetch_facebook_insights(token, page_id)
    ig_posts = fetch_instagram_insights(token, ig_id)

    recommendations = analyze_and_generate_ab_tests(fb_posts, ig_posts)

    tracker_data = {
        "last_updated": datetime.utcnow().isoformat() + "Z",
        "facebook_summary": {
            "page_id": page_id,
            "posts_analyzed": len(fb_posts),
            "posts": fb_posts
        },
        "instagram_summary": {
            "ig_account_id": ig_id,
            "media_analyzed": len(ig_posts),
            "media": ig_posts
        },
        "active_ab_recommendations": recommendations
    }

    os.makedirs(os.path.dirname(TRACKER_FILE), exist_ok=True)
    with open(TRACKER_FILE, "w", encoding="utf-8") as f:
        json.dump(tracker_data, f, indent=2, ensure_ascii=False)

    print(f"[V] Pomyślnie zaktualizowano analizę i zapisano do {TRACKER_FILE}.")
    print(f"    - Posty FB przeanalizowane: {len(fb_posts)}")
    print(f"    - Media IG przeanalizowane: {len(ig_posts)}")
    print(f"    - Wygenerowane rekomendacje testów: {len(recommendations)}")

if __name__ == "__main__":
    run()
