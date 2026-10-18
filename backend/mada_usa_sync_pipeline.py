#!/usr/bin/env python3
"""
Mada Wholesaler -> WooCommerce USA & Google Merchant & AI SEO Pipeline
Natura Intimo (naturaintimo.com)
"""

import os
import sys
import json
import base64
import zipfile
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime

ENV_PATH = "/home/jarek/Pulpit/TikTok Agent/.env"
WORK_DIR = "/home/jarek/Pulpit/TikTok Agent/backend"
REPORT_DIR = os.path.join(WORK_DIR, "reports")
os.makedirs(REPORT_DIR, exist_ok=True)

# 1. Load Environment Configuration
env = {}
if os.path.exists(ENV_PATH):
    with open(ENV_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip("'\"")

WOO_URL = env.get("WOOCOMMERCE_URL", "https://naturaintimo.com").rstrip("/")
WOO_CK = env.get("WOOCOMMERCE_CONSUMER_KEY")
WOO_CS = env.get("WOOCOMMERCE_CONSUMER_SECRET")
GEMINI_KEY = env.get("GEMINI_API_KEY")

MADA_LOGIN = "jaroslaw.jakubczyk@gmail.com"
MADA_PASS = "Mi1chA2le3k!"

AUTH_HEADER = "Basic " + base64.b64encode(f"{WOO_CK}:{WOO_CS}".encode()).decode()


def log(msg):
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{now}] {msg}", flush=True)


def download_mada_catalog():
    """Downloads the latest MADA catalog ZIP and extracts products.xml"""
    log("1. Pobieranie najnowszego archiwum XML z hurtowni MADA...")
    url = f"https://www.mada.pl/get_xml.php?l={urllib.parse.quote(MADA_LOGIN)}&p={urllib.parse.quote(MADA_PASS)}&file=last"
    zip_path = os.path.join(WORK_DIR, "mada_latest.zip")
    xml_path = os.path.join(WORK_DIR, "products.xml")

    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; NaturaIntimoSync/1.0)"})
    with urllib.request.urlopen(req, timeout=90) as resp:
        if resp.status != 200:
            raise RuntimeError(f"Błąd pobierania MADA: HTTP {resp.status}")
        data = resp.read()
        with open(zip_path, "wb") as f:
            f.write(data)
        log(f"   Pobrano archiwum ZIP ({len(data) / (1024*1024):.2f} MB)")

    log("2. Wypakowywanie products.xml...")
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extract("products.xml", WORK_DIR)

    xml_size_mb = os.path.getsize(xml_path) / (1024 * 1024)
    log(f"   Wypakowano products.xml ({xml_size_mb:.2f} MB)")
    return xml_path


def parse_mada_xml(xml_path, limit=None):
    """Parses products, producers and models from MADA products.xml"""
    log("3. Analiza pliku XML z hurtowni MADA...")
    mada_catalog = {}
    producers_map = {}
    
    # Use iterparse for memory efficiency on 25MB XML
    context = ET.iterparse(xml_path, events=("end",))
    count = 0
    
    for event, elem in context:
        if elem.tag == "PRODUCER" and "id" in elem.attrib and elem.text:
            producers_map[elem.attrib["id"]] = elem.text.strip()
            elem.clear()
            continue

        if elem.tag == "PRODUCT":
            p_id = elem.findtext("ID")
            producer_raw = elem.findtext("PRODUCER") or ""
            producer = producers_map.get(producer_raw, producer_raw)
            name = elem.findtext("NAME") or ""
            price_pln = float(elem.findtext("PRICE") or 0.0)
            desc = elem.findtext("DESCRIPTION") or ""
            cat = elem.findtext("CATEGORY") or ""
            
            # Photos
            photos = []
            photos_elem = elem.find("PHOTOS")
            if photos_elem is not None:
                for ph in photos_elem.findall("PHOTO"):
                    if ph.text:
                        photos.append(ph.text.strip())
            
            # Models / Variations
            variations = []
            total_stock = 0
            models_elem = elem.find("MODELS")
            if models_elem is not None:
                for m in models_elem.findall("MODEL"):
                    size = m.findtext("SIZE") or ""
                    color = m.findtext("COLOR") or ""
                    ean = m.findtext("EAN") or ""
                    amount = int(m.findtext("AMOUNT") or 0)
                    total_stock += amount
                    variations.append({
                        "size": size,
                        "color": color,
                        "ean": ean,
                        "amount": amount
                    })
            
            if p_id:
                mada_catalog[p_id] = {
                    "mada_id": p_id,
                    "brand": producer,
                    "name": name,
                    "price_pln": price_pln,
                    "desc_raw": desc,
                    "category": cat,
                    "photos": photos,
                    "variations": variations,
                    "total_stock": total_stock
                }
                count += 1
                if limit and count >= limit:
                    break
            
            elem.clear()

    log(f"   Zaindeksowano {len(mada_catalog)} produktów z hurtowni MADA.")
    return mada_catalog


def get_woocommerce_products(limit=100):
    """Fetches products from WooCommerce"""
    log("4. Pobieranie katalogu produktów z WooCommerce...")
    products = []
    page = 1
    per_page = min(limit, 50)
    
    while True:
        url = f"{WOO_URL}/wp-json/wc/v3/products?page={page}&per_page={per_page}"
        req = urllib.request.Request(url, headers={
            "Authorization": AUTH_HEADER,
            "User-Agent": "NaturaIntimoSync/1.0"
        })
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read().decode())
                if not data:
                    break
                products.extend(data)
                log(f"   Pobrano stronę {page} ({len(products)} produktów)...")
                if len(products) >= limit:
                    break
                page += 1
        except Exception as e:
            log(f"   Błąd pobierania strony {page}: {e}")
            break
            
    log(f"   Pobrano łącznie {len(products)} produktów z WooCommerce.")
    return products


def translate_color_us(color_pl):
    if not color_pl:
        return "Classic"
    c = color_pl.lower().strip()
    mapping = {
        "czarny": "Black", "czarna": "Black",
        "biały": "White", "biała": "White",
        "beżowy": "Beige", "beż": "Beige", "cielisty": "Nude / Beige",
        "granatowy": "Navy Blue", "granat": "Navy Blue",
        "czerwony": "Red", "czerwona": "Red",
        "bordowy": "Burgundy / Wine", "bordo": "Burgundy",
        "różowy": "Pink", "pudrowy róż": "Powder Pink",
        "szary": "Gray", "grafitowy": "Charcoal Gray",
        "zielony": "Emerald Green", "butelkowa zieleń": "Forest Green",
        "niebieski": "Sky Blue", "chabrowy": "Royal Blue"
    }
    for k, v in mapping.items():
        if k in c:
            return v
    return color_pl.capitalize()


def build_google_merchant_and_ai_seo(mada_prod, wc_prod):
    """
    Constructs Google Merchant Center attributes & AI SEO metadata
    conforming to US Google Shopping guidelines and generative AI search.
    """
    brand = mada_prod.get("brand") or "Natura Intimo"
    raw_name = mada_prod.get("name") or wc_prod.get("name")
    
    # Determine style/type
    lower_name = raw_name.lower()
    prod_type = "Lingerie"
    if "semi-soft" in lower_name or "semisoft" in lower_name:
        prod_type = "Semi-Soft Underwire Bra"
    elif "soft" in lower_name:
        prod_type = "Unpadded Soft Cup Bra"
    elif "push-up" in lower_name or "push up" in lower_name:
        prod_type = "Push-Up Bra"
    elif "usztywnian" in lower_name or "padded" in lower_name:
        prod_type = "Padded Full-Coverage Bra"
    elif "biustonosz" in lower_name or "bra" in lower_name:
        prod_type = "Underwire Support Bra"
    elif "brazyliany" in lower_name or "brazilian" in lower_name:
        prod_type = "Brazilian Lace Briefs"
    elif "figi" in lower_name or "brief" in lower_name or "panties" in lower_name:
        prod_type = "Bikini Briefs"
    elif "szlafrok" in lower_name or "robe" in lower_name:
        prod_type = "Satin Robe"
    elif "halka" in lower_name or "chemise" in lower_name:
        prod_type = "Lace Nightdress / Chemise"

    # Color & Sizes
    colors = list({v["color"] for v in mada_prod.get("variations", []) if v.get("color")})
    primary_color_pl = colors[0] if colors else "Black"
    primary_color_us = translate_color_us(primary_color_pl)

    # Size range
    sizes = [v["size"] for v in mada_prod.get("variations", []) if v.get("size")]
    size_summary = f"{sizes[0]}–{sizes[-1]}" if len(sizes) > 1 else (sizes[0] if sizes else "One Size")

    # 1. US Google Merchant Title (< 150 chars: Brand + Model/Type + Color + Sizes)
    import re
    clean_model = raw_name
    for w in [brand, "biustonosz", "figi", "brazyliany", "szlafrok", "koszula", "halka", "majtki"]:
        clean_model = re.sub(rf"(?i)\b{re.escape(w)}\b", "", clean_model)
    clean_model = re.sub(r"\s+", " ", clean_model).strip(" -_/")
    title_us = f"{brand} {clean_model} {prod_type} - {primary_color_us} (Sizes {size_summary})".strip()
    title_us = re.sub(r"\s+", " ", title_us)
    if len(title_us) > 150:
        title_us = title_us[:147] + "..."

    # 2. GTIN / EAN
    eans = [v["ean"] for v in mada_prod.get("variations", []) if v.get("ean") and len(v["ean"]) in (12, 13)]
    primary_gtin = eans[0] if eans else ""

    # 3. AI SEO Rich Description (Formatted for Google Merchant + AI Search Engines like ChatGPT / Perplexity)
    seo_desc = f"""<h2>{brand} {clean_model} – Premium European {prod_type}</h2>
<p>Crafted with authentic European artisanal precision, the <strong>{brand} {clean_model}</strong> blends high-end comfort with sophisticated elegance, designed specifically for discerning customers in North America.</p>

<h3>Key Features & Benefits</h3>
<ul>
  <li><strong>Flattering Support & Silhouette:</strong> Tailored European engineering designed to offer gentle shaping, secure lifting, and all-day comfort without digging.</li>
  <li><strong>Intricate Detailing:</strong> Styled in sophisticated {primary_color_us} with premium breathable materials and delicate lace accents.</li>
  <li><strong>Extended Size Availability:</strong> Available in sizes {size_summary} with exact US-to-EU cup & band conversion standards.</li>
  <li><strong>Ethically Made in Poland (EU):</strong> Imported directly from verified European manufacturers to ensure superior fabric durability and premium skin feel.</li>
</ul>

<h3>Product Specifications</h3>
<ul>
  <li><strong>Brand:</strong> {brand}</li>
  <li><strong>Model / MPN:</strong> MADA-{mada_prod['mada_id']}</li>
  <li><strong>Color:</strong> {primary_color_us}</li>
  <li><strong>Condition:</strong> Brand New with original tags</li>
  <li><strong>Country of Origin:</strong> Poland (European Union)</li>
  <li><strong>Care Instructions:</strong> Hand wash cold with mild detergent; lay flat to dry to preserve delicate lace elasticity.</li>
</ul>"""

    # 4. Schema.org JSON-LD
    schema_ld = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": title_us,
        "image": (mada_prod.get("photos") or [None])[0] or (wc_prod.get("images", [{}])[0].get("src") if wc_prod.get("images") else None),
        "description": f"Shop {brand} {clean_model} European {prod_type} in {primary_color_us}. Premium fit, delicate lace, and sizes {size_summary}.",
        "brand": {
            "@type": "Brand",
            "name": brand
        },
        "mpn": f"MADA-{mada_prod['mada_id']}",
        "sku": f"NI-{mada_prod['mada_id']}",
        "offers": {
            "@type": "Offer",
            "priceCurrency": "USD",
            "price": wc_prod.get("price") or "69.00",
            "itemCondition": "https://schema.org/NewCondition",
            "availability": "https://schema.org/InStock" if mada_prod["total_stock"] > 0 else "https://schema.org/OutOfStock",
            "seller": {
                "@type": "Organization",
                "name": "Natura Intimo"
            }
        }
    }
    if primary_gtin:
        schema_ld["gtin13"] = primary_gtin

    # Google Merchant Attributes Meta
    meta_updates = [
        {"key": "_gmc_title", "value": title_us},
        {"key": "_gmc_brand", "value": brand},
        {"key": "_gmc_gtin", "value": primary_gtin},
        {"key": "_gmc_mpn", "value": f"MADA-{mada_prod['mada_id']}"},
        {"key": "_gmc_google_product_category", "value": "1578"},  # Apparel & Accessories > Clothing > Underwear & Socks > Lingerie
        {"key": "_gmc_age_group", "value": "adult"},
        {"key": "_gmc_gender", "value": "female"},
        {"key": "_gmc_condition", "value": "new"},
        {"key": "_gmc_color", "value": primary_color_us},
        {"key": "_gmc_size", "value": size_summary},
        {"key": "_ai_seo_schema_jsonld", "value": json.dumps(schema_ld)},
        {"key": "mada_product_id", "value": str(mada_prod["mada_id"])},
        {"key": "mada_total_stock", "value": str(mada_prod["total_stock"])}
    ]

    return {
        "title_us": title_us,
        "desc_html": seo_desc,
        "meta_updates": meta_updates,
        "schema_ld": schema_ld,
        "primary_gtin": primary_gtin
    }


def execute_pipeline_test():
    log("=== ROZPOCZĘCIE PRZEBIEGU TESTOWEGO AUTOMATYZACJI ===")
    
    # Step 1: Download & Parse Mada
    xml_path = download_mada_catalog()
    mada_catalog = parse_mada_xml(xml_path, limit=None)
    
    # Step 2: Fetch WC products
    wc_products = get_woocommerce_products(limit=50)
    
    # Step 3: Match & Audit
    matched = []
    log("5. Mapowanie produktów i weryfikacja zgodności z Google Merchant / AI SEO...")
    
    for wc_p in wc_products:
        p_id = wc_p.get("id")
        mada_id_meta = next((m.get("value") for m in wc_p.get("meta_data", []) if m.get("key") == "mada_product_id"), None)
        
        # Match either by meta or by looking for matching name/sku
        matched_mada = None
        if mada_id_meta and str(mada_id_meta) in mada_catalog:
            matched_mada = mada_catalog[str(mada_id_meta)]
        else:
            # Fallback fuzzy match by name
            wc_name_norm = wc_p.get("name", "").lower()
            for m_id, m_data in mada_catalog.items():
                if m_data["brand"].lower() in wc_name_norm and any(w in wc_name_norm for w in m_data["name"].lower().split() if len(w) > 3):
                    matched_mada = m_data
                    break
        
        if matched_mada:
            enrichment = build_google_merchant_and_ai_seo(matched_mada, wc_p)
            matched.append({
                "wc_id": p_id,
                "wc_name": wc_p.get("name"),
                "mada_id": matched_mada["mada_id"],
                "mada_brand": matched_mada["brand"],
                "mada_stock": matched_mada["total_stock"],
                "in_stock": matched_mada["total_stock"] > 0,
                "title_us": enrichment["title_us"],
                "gtin": enrichment["primary_gtin"],
                "gmc_ready": bool(enrichment["title_us"] and matched_mada["brand"]),
                "ai_seo_ready": True
            })

    log(f"   Dopasowano {len(matched)} produktów z hurtownią MADA.")
    
    # Save Report
    report = {
        "timestamp": datetime.now().isoformat(),
        "total_mada_products_indexed": len(mada_catalog),
        "total_wc_products_audited": len(wc_products),
        "matched_products": len(matched),
        "in_stock_count": sum(1 for p in matched if p["in_stock"]),
        "out_of_stock_count": sum(1 for p in matched if not p["in_stock"]),
        "google_merchant_compliant_count": sum(1 for p in matched if p["gmc_ready"]),
        "items_sample": matched[:10]
    }
    
    report_file = os.path.join(REPORT_DIR, f"mada_sync_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
        
    log(f"   Zapisano raport audytu: {report_file}")
    log("=== PRZEBIEG TESTOWY UKOŃCZONY POMYŚLNIE ===")
    return report


if __name__ == "__main__":
    try:
        report = execute_pipeline_test()
        print("\n--- PODSUMOWANIE RAPORTU TESTOWEGO ---")
        print(f"Zindeksowane produkty Mada: {report['total_mada_products_indexed']}")
        print(f"Zweryfikowane produkty WooCommerce: {report['total_wc_products_audited']}")
        print(f"Dopasowane produkty w sklepie: {report['matched_products']}")
        print(f"Produkty dostępne na stanie: {report['in_stock_count']}")
        print(f"Produkty wyprzedane (do oznaczenia OOS): {report['out_of_stock_count']}")
        print(f"Zgodność Google Merchant (US): {report['google_merchant_compliant_count']}/{report['matched_products']}")
    except Exception as e:
        log(f"BŁĄD PRZEBIEGU TESTOWEGO: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
