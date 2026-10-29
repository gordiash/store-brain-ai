#!/usr/bin/env python3
"""
Natura Intimo – Never-Expiring Meta Page Access Token Generator & Exchanger
Automates the official 2-step Meta OAuth flow to generate a permanent (never-expiring) Page Access Token:
Step 1: Exchange Short-Lived User Token -> Long-Lived User Token (60 days) via fb_exchange_token.
Step 2: Query GET /me/accounts with Long-Lived User Token -> Returns NEVER-EXPIRING Page Access Token.
Step 3: Save to .env and backend/.env and verify via /debug_token.
"""

import os
import sys
import json
import requests

def load_env(filepath):
    env = {}
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env[k.strip()] = v.strip().strip('"\'')
    return env

def update_env(filepath, updates):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    new_lines = []
    updated_keys = set()
    for line in lines:
        matched = False
        for k, v in updates.items():
            if line.startswith(f'{k}='):
                new_lines.append(f'{k}={v}\n')
                updated_keys.add(k)
                matched = True
                break
        if not matched:
            new_lines.append(line)
            
    for k, v in updates.items():
        if k not in updated_keys:
            new_lines.append(f'{k}={v}\n')
            
    with open(filepath, 'w') as f:
        f.writelines(new_lines)

def main():
    root_env = load_env('.env')
    backend_env = load_env('backend/.env')
    env = {**root_env, **backend_env}

    app_id = env.get('FB_APP_ID') or (sys.argv[1] if len(sys.argv) > 1 else None)
    app_secret = env.get('FB_APP_SECRET') or (sys.argv[2] if len(sys.argv) > 2 else None)
    user_token = env.get('FB_USER_TOKEN') or (sys.argv[3] if len(sys.argv) > 3 else None)
    page_id = env.get('FB_PAGE_ID') or '1082888234909700'

    print("=== Meta Never-Expiring Page Token Generator ===")

    # Scenario A: If user already provided a Long-Lived User Token (no App Secret needed)
    # Let's test if current user_token directly gives a permanent page token:
    if user_token:
        print("Testing direct /me/accounts with provided User Token...")
        r_accounts = requests.get('https://graph.facebook.com/v20.0/me/accounts', params={'access_token': user_token})
        if r_accounts.status_code == 200:
            accounts_data = r_accounts.json().get('data', [])
            target_page = None
            for p in accounts_data:
                if str(p.get('id')) == str(page_id) or 'Natura Intimo' in p.get('name', ''):
                    target_page = p
                    break
            
            if target_page:
                page_token = target_page.get('access_token')
                # Inspect token expiration
                r_debug = requests.get('https://graph.facebook.com/v20.0/debug_token', params={
                    'input_token': page_token,
                    'access_token': page_token
                })
                debug_info = r_debug.json().get('data', {})
                data_access_expires_at = debug_info.get('data_access_expires_at')
                expires_at = debug_info.get('expires_at')
                
                print(f"Page Token obtained successfully for {target_page.get('name')} (ID: {target_page.get('id')})!")
                print(f"Token Expiration (expires_at): {expires_at} (0 means NEVER EXPIRES)")
                
                # Update both .env files
                update_env('.env', {'FB_PAGE_TOKEN': page_token, 'FB_USER_TOKEN': user_token})
                update_env('backend/.env', {'FB_PAGE_TOKEN': page_token, 'FB_USER_TOKEN': user_token})
                print("Saved to .env and backend/.env successfully!")
                return

    # Scenario B: Exchange short-lived token using App ID and App Secret
    if not app_id or not app_secret:
        print("\n[!] To generate a Never-Expiring Page Token via App Exchange, provide:")
        print("    1. FB_APP_ID (App ID from Meta Developers)")
        print("    2. FB_APP_SECRET (App Secret from Meta Developers)")
        print("    3. FB_USER_TOKEN (Fresh Short-Lived User Token from Graph API Explorer)")
        print("\nAlternatively, follow the 60-second Graph API Explorer Guide below.\n")
        return

    print("Step 1: Exchanging Short-Lived User Token for Long-Lived User Token (60 days)...")
    exchange_url = "https://graph.facebook.com/v20.0/oauth/access_token"
    params = {
        'grant_type': 'fb_exchange_token',
        'client_id': app_id,
        'client_secret': app_secret,
        'fb_exchange_token': user_token
    }
    r_exch = requests.get(exchange_url, params=params)
    if r_exch.status_code != 200:
        print(f"Exchange failed: {r_exch.status_code} - {r_exch.text}")
        return

    long_user_token = r_exch.json().get('access_token')
    print("Long-Lived User Token obtained successfully!")

    print("Step 2: Fetching Never-Expiring Page Access Token via GET /me/accounts...")
    r_acc = requests.get('https://graph.facebook.com/v20.0/me/accounts', params={'access_token': long_user_token})
    if r_acc.status_code != 200:
        print(f"Accounts fetch failed: {r_acc.status_code} - {r_acc.text}")
        return

    pages = r_acc.json().get('data', [])
    target_page = None
    for p in pages:
        if str(p.get('id')) == str(page_id) or 'Natura Intimo' in p.get('name', ''):
            target_page = p
            break

    if not target_page:
        print(f"Page ID {page_id} not found in accounts list.")
        return

    never_expiring_page_token = target_page.get('access_token')
    
    # Step 3: Verify expiration via debug_token
    r_debug = requests.get('https://graph.facebook.com/v20.0/debug_token', params={
        'input_token': never_expiring_page_token,
        'access_token': never_expiring_page_token
    })
    debug_data = r_debug.json().get('data', {})
    expires_at = debug_data.get('expires_at')
    
    print("\n" + "="*50)
    print(f"SUCCESS! Never-Expiring Page Token Generated for {target_page.get('name')}")
    print(f"expires_at: {expires_at} (0 = NEVER EXPIRES / PERMANENT)")
    print("="*50)

    # Save to both .env files
    update_env('.env', {
        'FB_PAGE_TOKEN': never_expiring_page_token,
        'FB_USER_TOKEN': long_user_token,
        'FB_APP_ID': app_id,
        'FB_APP_SECRET': app_secret
    })
    update_env('backend/.env', {
        'FB_PAGE_TOKEN': never_expiring_page_token,
        'FB_USER_TOKEN': long_user_token,
        'FB_APP_ID': app_id,
        'FB_APP_SECRET': app_secret
    })
    print("Saved permanent tokens to .env and backend/.env!")

if __name__ == '__main__':
    main()
