#!/usr/bin/env python3
"""
Natura Intimo – Allegro & MADA Wholesale Integration CLI
Command line tool to audit, export, and synchronize products with Allegro Marketplace.
"""

import sys
import os
import json
import argparse
import csv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'allegro_catalog_data.json')

def load_data():
    if not os.path.exists(DATA_FILE):
        import generate_allegro_catalog
        generate_allegro_catalog.main()
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def run_audit(data):
    print("=" * 65)
    print(" 🛒 NATURA INTIMO – ALLEGRO & MADA INTEGRATION AUDIT")
    print("=" * 65)
    print(f"📦 Liczba zmapowanych produktów: {data['totalProducts']}")
    print(f"🔢 Łączna liczba wariantów (SKU): {data['totalVariations']}")
    print(f"🏭 Całkowity stan magazynowy MADA: {data['totalWholesaleStock']:,} sztuk")
    print(f"🏷️ Podział na marki: {json.dumps(data['brands'], ensure_ascii=False)}")
    print("-" * 65)
    
    instock_count = sum(1 for p in data['products'] if p['stockStatus'] == 'INSTOCK')
    lowstock_count = sum(1 for p in data['products'] if p['stockStatus'] == 'LOWSTOCK')
    outofstock_count = sum(1 for p in data['products'] if p['stockStatus'] == 'OUTOFSTOCK')
    ean_ok = sum(1 for p in data['products'] if p['eanVerified'])
    
    print(f"✅ Produkty gotowe z pełnym stanem (>5 szt.): {instock_count}")
    print(f"⚠️ Produkty z niskim stanem (<5 szt.): {lowstock_count}")
    print(f"🛑 Produkty wyprzedane w hurtowni (0 szt.): {outofstock_count}")
    print(f"🎯 Zgodność z bazą kodów EAN: {ean_ok}/{data['totalProducts']} ({(ean_ok/data['totalProducts'])*100:.1f}%)")
    print("=" * 65)

def export_allegro_rest_api_payload(data, product_id=None, out_file=None):
    """
    Generates standard Allegro REST API payload for POST /sale/product-offers
    """
    products = data['products']
    if product_id:
        products = [p for p in products if str(p['id']) == str(product_id)]
        if not products:
            print(f"❌ Nie znaleziono produktu o ID {product_id}")
            return

    offers_payload = []
    for p in products:
        # Build offer format
        offer = {
            "name": p['allegroTitle'],
            "primaryImage": {"url": p['images'][0] if p['images'] else ""},
            "images": [{"url": url} for url in p['images']],
            "category": {"id": p['allegroCategoryId']},
            "parameters": [
                {"id": "11323", "values": [p['brand']]}, # Marka
                {"id": "22564", "values": ["Nowy z metką"]}, # Stan
                {"id": "24250", "values": [p['model']]}, # Model / Kod
                {"id": "2026", "values": [p['colorPl']]}, # Kolor
                {"id": "21815", "values": [p['materialComposition']]} # Skład
            ],
            "sellingMode": {
                "format": "BUY_NOW",
                "price": {
                    "amount": f"{p['pricing']['targetPrice']:.2f}",
                    "currency": "PLN"
                }
            },
            "stock": {
                "available": p['totalStock'],
                "unit": "UNIT"
            },
            "location": {
                "countryCode": "PL",
                "province": "WARMINSKO_MAZURSKIE",
                "city": "Olsztyn",
                "postCode": "10-747"
            },
            "payments": {
                "invoice": "VAT"
            },
            "external": {
                "id": f"NI-MADA-{p['madaId']}-WC-{p['id']}"
            }
        }
        offers_payload.append(offer)

    target_path = out_file or os.path.join(BASE_DIR, 'allegro_offers_payload.json')
    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(offers_payload if len(offers_payload) > 1 else offers_payload[0], f, ensure_ascii=False, indent=2)

    print(f"✅ Wyeksportowano {len(offers_payload)} ofert Allegro do pliku: {target_path}")

def export_allegro_csv(data, out_file=None):
    """
    Exports CSV compatible with Allegro Mass Listing format
    """
    target_path = out_file or os.path.join(BASE_DIR, 'allegro_mass_listing.csv')
    fieldnames = [
        "Sygnatura / SKU", "Tytuł oferty", "Kategoria Allegro ID", "Cena Kup Teraz (PLN)",
        "Liczba sztuk", "EAN", "Marka", "Model", "Fason", "Kolor", "Stan", "Skład surowcowy", "Zdjęcie główne"
    ]

    count = 0
    with open(target_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')
        writer.writeheader()

        for p in data['products']:
            for v in p['variations']:
                writer.writerow({
                    "Sygnatura / SKU": v['sku'],
                    "Tytuł oferty": f"{p['allegroTitle']} {v['size']}",
                    "Kategoria Allegro ID": p['allegroCategoryId'],
                    "Cena Kup Teraz (PLN)": f"{p['pricing']['targetPrice']:.2f}",
                    "Liczba sztuk": v['amount'],
                    "EAN": v['ean'],
                    "Marka": p['brand'],
                    "Model": p['model'],
                    "Fason": p['productType'],
                    "Kolor": v['color'],
                    "Stan": "Nowy z metką",
                    "Skład surowcowy": p['materialComposition'],
                    "Zdjęcie główne": p['images'][0] if p['images'] else ""
                })
                count += 1

    print(f"✅ Wygenerowano plik CSV do masowego wystawiania na Allegro: {target_path}")
    print(f"📊 Liczba wyeksportowanych wariantów: {count}")

def calculate_fees(netto_price, target_margin=35, allegro_fee_pct=11.5, smart_cost=4.0):
    vat_brutto = netto_price * 1.23
    price = (vat_brutto * (1 + target_margin / 100) + smart_cost) / (1 - allegro_fee_pct / 100)
    price = round(price) + 0.90
    allegro_fee = price * (allegro_fee_pct / 100)
    profit = price - vat_brutto - allegro_fee - smart_cost
    margin = (profit / price) * 100

    print("=" * 55)
    print(" 💰 KALKULATOR OPŁAT I MARŻY ALLEGRO (BIELIZNA DAMSKA)")
    print("=" * 55)
    print(f"Cena hurtowa MADA (netto):         {netto_price:.2f} PLN")
    print(f"Koszt zakupu z VAT 23%:             {vat_brutto:.2f} PLN")
    print(f"Sugerowana cena na Allegro:         {price:.2f} PLN")
    print(f"Prowizja Allegro ({allegro_fee_pct}% z VAT):       {allegro_fee:.2f} PLN")
    print(f"Współfinansowanie Smart! / pakowanie:{smart_cost:.2f} PLN")
    print("-" * 55)
    print(f"Czysty zysk na sztuce:              {profit:.2f} PLN")
    print(f"Marża netto od sprzedaży:           {margin:.1f}%")
    print("=" * 55)

def main():
    parser = argparse.ArgumentParser(description="Natura Intimo – Allegro & MADA Integration CLI")
    parser.add_argument('--audit', action='store_true', help="Wyświetla pełny raport audytu katalogu")
    parser.add_argument('--export-json', nargs='?', const='all', help="Generuje payload Allegro REST API (podaj ID lub 'all')")
    parser.add_argument('--export-csv', action='store_true', help="Generuje plik CSV masowego wystawiania")
    parser.add_argument('--calc-fee', type=float, help="Przelicza opłaty i sugerowaną cenę dla podanej kwoty hurtowej netto")
    parser.add_argument('--refresh', action='store_true', help="Wymusza ponowne przeliczenie bazy danych z hurtowni")

    args = parser.parse_args()

    if args.refresh:
        import generate_allegro_catalog
        generate_allegro_catalog.main()

    data = load_data()

    if args.audit:
        run_audit(data)
    elif args.export_json:
        p_id = None if args.export_json == 'all' else args.export_json
        export_allegro_rest_api_payload(data, p_id)
    elif args.export_csv:
        export_allegro_csv(data)
    elif args.calc_fee:
        calculate_fees(args.calc_fee)
    else:
        run_audit(data)
        print("\n💡 Użyj flag:")
        print("   --audit         Pełny audyt gotowości ofert")
        print("   --export-json   Eksport do Allegro REST API")
        print("   --export-csv    Eksport do pliku CSV dla Allegro")
        print("   --calc-fee <zł> Kalkulator marży i prowizji")
        print("   --refresh       Odświeżenie bazy z plików źródłowych MADA")

if __name__ == '__main__':
    main()
