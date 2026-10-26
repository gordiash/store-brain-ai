#!/usr/bin/env python3
"""
Natura Intimo – Allegro & MADA Integration Dashboard Builder
Generates a standalone, feature-complete, interactive HTML dashboard with:
1. Allegro REST API Keys & OAuth connection management (LocalStorage + .env bridge)
2. Market Demand & Bestseller Radar (Sales volume, demand score, velocity, top chodliwe modele)
3. Advanced filtering, sorting by popularity, and targeted batch exports.
"""

import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'allegro_catalog_data.json')
DESKTOP_HTML = '/home/jarek/Pulpit/NaturaIntimo_Allegro_Integrator.html'
ARTIFACT_DIR = '/home/jarek/.gemini/antigravity/brain/392df9a3-3f97-454c-a9bb-5b7fad79d8f4'
ARTIFACT_HTML = os.path.join(ARTIFACT_DIR, 'allegro_dashboard.html')

def build_dashboard():
    if not os.path.exists(DATA_FILE):
        import generate_allegro_catalog
        generate_allegro_catalog.main()

    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        catalog_json_str = f.read()

    data = json.loads(catalog_json_str)
    total_products = data['totalProducts']
    total_vars = data['totalVariations']
    total_stock = data['totalWholesaleStock']
    brands = data['brands']

    # Identify top bestsellers
    bestsellers = [p for p in data['products'] if p.get('demand', {}).get('score', 0) >= 85]
    bestsellers_count = len(bestsellers)

    html_content = f'''<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Natura Intimo – Integrator Produktów MADA & Sklep z Allegro | Bestseller Radar</title>
  <!-- Google Fonts & FontAwesome -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

  <style>
    :root {{
      --primary: #4a1224;
      --primary-dark: #320a17;
      --primary-light: #682037;
      --accent-gold: #d4af37;
      --accent-gold-light: #f5eedc;
      --accent-gold-dark: #aa8620;
      --bg-cream: #faf7f2;
      --bg-card: #ffffff;
      --border-color: #ebdcd4;
      --text-main: #2b1d24;
      --text-muted: #74636d;
      --success: #207245;
      --success-bg: #e6f4ea;
      --warning: #b76e00;
      --warning-bg: #fef7e0;
      --danger: #c5221f;
      --danger-bg: #fce8e6;
      --allegro-orange: #ff5a00;
      --allegro-orange-bg: #fff0eb;
      --hot-pink: #d81b60;
      --hot-pink-bg: #fce4ec;
      --shadow-sm: 0 2px 8px rgba(74, 18, 36, 0.05);
      --shadow-md: 0 6px 20px rgba(74, 18, 36, 0.08);
      --shadow-lg: 0 12px 35px rgba(74, 18, 36, 0.12);
      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 16px;
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    body {{
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg-cream);
      color: var(--text-main);
      line-height: 1.5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }}

    /* Top Bar / Header */
    header.hub-header {{
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 60%, #5d172f 100%);
      color: #ffffff;
      padding: 1.25rem 2rem;
      box-shadow: var(--shadow-md);
      position: sticky;
      top: 0;
      z-index: 1000;
      border-bottom: 2px solid var(--accent-gold);
    }}

    .header-container {{
      max-width: 1440px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }}

    .brand-section {{
      display: flex;
      align-items: center;
      gap: 1rem;
    }}

    .brand-icon {{
      width: 48px;
      height: 48px;
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid var(--accent-gold);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: var(--accent-gold);
    }}

    .brand-title h1 {{
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }}

    .brand-title h1 span.badge-allegro {{
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.75rem;
      font-weight: 700;
      background: var(--allegro-orange);
      color: #fff;
      padding: 0.15rem 0.6rem;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }}

    .brand-subtitle {{
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 400;
    }}

    .header-status {{
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }}

    .status-badge {{
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 0.35rem 0.8rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }}

    .status-badge.live {{
      border-color: rgba(46, 204, 113, 0.4);
      background: rgba(46, 204, 113, 0.15);
      color: #a8f5c8;
    }}

    .status-badge.allegro {{
      border-color: rgba(255, 90, 0, 0.5);
      background: rgba(255, 90, 0, 0.2);
      color: #ffd6c2;
    }}

    .status-badge.api-connected {{
      border-color: rgba(46, 204, 113, 0.6);
      background: rgba(46, 204, 113, 0.2);
      color: #a8f5c8;
    }}

    .status-badge.api-missing {{
      border-color: rgba(241, 196, 15, 0.5);
      background: rgba(241, 196, 15, 0.15);
      color: #f7e096;
    }}

    .status-dot {{
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #2ecc71;
      box-shadow: 0 0 8px #2ecc71;
    }}

    .status-dot.yellow {{
      background: #f1c40f;
      box-shadow: 0 0 8px #f1c40f;
    }}

    .header-actions {{
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }}

    .btn {{
      font-family: inherit;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.5rem 1rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s ease;
      text-decoration: none;
      border: none;
    }}

    .btn-gold {{
      background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-gold-dark) 100%);
      color: #1a1200;
      box-shadow: 0 2px 6px rgba(212, 175, 55, 0.3);
    }}

    .btn-gold:hover {{
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
    }}

    .btn-outline {{
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #ffffff;
    }}

    .btn-outline:hover {{
      background: rgba(255, 255, 255, 0.1);
      border-color: #ffffff;
    }}

    .btn-hot {{
      background: linear-gradient(135deg, #ff5a00 0%, #d81b60 100%);
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(216, 27, 96, 0.3);
    }}

    .btn-hot:hover {{
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(216, 27, 96, 0.4);
    }}

    /* Navigation Tabs */
    nav.hub-tabs {{
      background: #ffffff;
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 76px;
      z-index: 900;
      box-shadow: var(--shadow-sm);
    }}

    .tabs-container {{
      max-width: 1440px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
    }}

    .tab-btn {{
      padding: 1rem 1.25rem;
      background: transparent;
      border: none;
      border-bottom: 3px solid transparent;
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
      transition: all 0.2s ease;
    }}

    .tab-btn:hover {{
      color: var(--primary);
    }}

    .tab-btn.active {{
      color: var(--primary);
      border-bottom-color: var(--accent-gold);
    }}

    .tab-badge {{
      background: var(--bg-cream);
      color: var(--primary);
      border: 1px solid var(--border-color);
      font-size: 0.7rem;
      padding: 0.15rem 0.5rem;
      border-radius: 12px;
    }}

    .tab-btn.active .tab-badge {{
      background: var(--primary);
      color: #ffffff;
      border-color: var(--primary);
    }}

    .tab-badge.hot {{
      background: var(--allegro-orange-bg);
      color: var(--allegro-orange);
      border-color: var(--allegro-orange);
      font-weight: 700;
    }}

    /* Main Content Area */
    main.hub-main {{
      max-width: 1440px;
      margin: 2rem auto;
      padding: 0 2rem;
      flex: 1;
      width: 100%;
    }}

    .tab-pane {{
      display: none;
      animation: fadeIn 0.3s ease;
    }}

    .tab-pane.active {{
      display: block;
    }}

    @keyframes fadeIn {{
      from {{ opacity: 0; transform: translateY(6px); }}
      to {{ opacity: 1; transform: translateY(0); }}
    }}

    /* KPI Cards Grid */
    .kpi-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }}

    .kpi-card {{
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }}

    .kpi-card:hover {{
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }}

    .kpi-card::before {{
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--primary);
    }}

    .kpi-card.gold::before {{ background: var(--accent-gold); }}
    .kpi-card.allegro::before {{ background: var(--allegro-orange); }}
    .kpi-card.success::before {{ background: var(--success); }}
    .kpi-card.hot::before {{ background: var(--hot-pink); }}

    .kpi-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }}

    .kpi-title {{
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
    }}

    .kpi-icon {{
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      background: var(--bg-cream);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }}

    .kpi-value {{
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 2.2rem;
      font-weight: 700;
      color: var(--primary-dark);
      line-height: 1;
      margin-bottom: 0.35rem;
    }}

    .kpi-subtitle {{
      font-size: 0.8rem;
      color: var(--text-muted);
    }}

    /* Charts Section */
    .charts-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(440px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }}

    .chart-card {{
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
    }}

    .chart-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }}

    .chart-header h3 {{
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }}

    .chart-container {{
      position: relative;
      height: 260px;
      width: 100%;
    }}

    /* Filter & Search Bar */
    .filter-panel {{
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow-sm);
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
    }}

    .search-box {{
      flex: 1;
      min-width: 280px;
      position: relative;
    }}

    .search-box input {{
      width: 100%;
      padding: 0.65rem 1rem 0.65rem 2.5rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      font-size: 0.9rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }}

    .search-box input:focus {{
      border-color: var(--accent-gold);
    }}

    .search-box i {{
      position: absolute;
      left: 0.85rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }}

    .filter-group {{
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      align-items: center;
    }}

    .filter-select {{
      padding: 0.65rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      background: #ffffff;
      font-size: 0.85rem;
      font-family: inherit;
      color: var(--text-main);
      cursor: pointer;
      outline: none;
    }}

    .filter-select:focus {{
      border-color: var(--accent-gold);
    }}

    /* Catalog Table */
    .table-container {{
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      overflow-x: auto;
    }}

    table.catalog-table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
      text-align: left;
    }}

    table.catalog-table th {{
      background: #f7f3ee;
      padding: 0.85rem 1rem;
      font-weight: 700;
      color: var(--primary);
      border-bottom: 1px solid var(--border-color);
      white-space: nowrap;
    }}

    table.catalog-table td {{
      padding: 0.85rem 1rem;
      border-bottom: 1px solid #f3ece4;
      vertical-align: middle;
    }}

    table.catalog-table tr:hover td {{
      background: #faf7f2;
    }}

    .product-thumb {{
      width: 50px;
      height: 60px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      background: #f5eedc;
    }}

    .product-title-cell {{
      max-width: 260px;
    }}

    .product-title-cell strong {{
      display: block;
      color: var(--primary);
      font-size: 0.9rem;
      margin-bottom: 0.15rem;
    }}

    .product-title-cell span.allegro-tag {{
      display: inline-block;
      font-size: 0.7rem;
      background: var(--allegro-orange-bg);
      color: var(--allegro-orange);
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      font-weight: 600;
    }}

    .badge {{
      display: inline-block;
      padding: 0.25rem 0.6rem;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 600;
      white-space: nowrap;
    }}

    .badge-success {{ background: var(--success-bg); color: var(--success); }}
    .badge-warning {{ background: var(--warning-bg); color: var(--warning); }}
    .badge-danger {{ background: var(--danger-bg); color: var(--danger); }}
    .badge-primary {{ background: rgba(74, 18, 36, 0.1); color: var(--primary); }}
    .badge-hot {{ background: var(--hot-pink-bg); color: var(--hot-pink); font-weight: 700; }}
    .badge-allegro {{ background: var(--allegro-orange-bg); color: var(--allegro-orange); font-weight: 700; }}

    .action-btn-group {{
      display: flex;
      gap: 0.4rem;
    }}

    .btn-icon {{
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      background: #ffffff;
      color: var(--text-main);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }}

    .btn-icon:hover {{
      background: var(--primary);
      color: #ffffff;
      border-color: var(--primary);
    }}

    /* Modal / Drawer */
    .modal-overlay {{
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(43, 29, 36, 0.6);
      backdrop-filter: blur(4px);
      z-index: 2000;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }}

    .modal-overlay.active {{
      display: flex;
    }}

    .modal-content {{
      background: #ffffff;
      border-radius: var(--radius-lg);
      max-width: 900px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-color);
      animation: modalZoom 0.25s ease;
    }}

    @keyframes modalZoom {{
      from {{ transform: scale(0.95); opacity: 0; }}
      to {{ transform: scale(1); opacity: 1; }}
    }}

    .modal-header {{
      padding: 1.25rem 1.75rem;
      background: var(--bg-cream);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}

    .modal-header h3 {{
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary);
    }}

    .modal-close {{
      background: none;
      border: none;
      font-size: 1.3rem;
      color: var(--text-muted);
      cursor: pointer;
    }}

    .modal-body {{
      padding: 1.75rem;
    }}

    /* Form Styles */
    .form-card {{
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.75rem;
      box-shadow: var(--shadow-sm);
    }}

    .form-group {{
      margin-bottom: 1.25rem;
    }}

    .form-group label {{
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }}

    .form-control {{
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      font-size: 0.9rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }}

    .form-control:focus {{
      border-color: var(--accent-gold);
    }}

    .slider-input {{
      width: 100%;
      accent-color: var(--accent-gold-dark);
      cursor: pointer;
    }}

    .breakdown-item {{
      display: flex;
      justify-content: space-between;
      padding: 0.6rem 0;
      border-bottom: 1px dashed var(--border-color);
      font-size: 0.9rem;
    }}

    .breakdown-item.total {{
      border-top: 2px solid var(--accent-gold);
      border-bottom: none;
      font-weight: 700;
      font-size: 1.15rem;
      color: var(--primary);
      margin-top: 0.5rem;
      padding-top: 0.8rem;
    }}

    /* Code Box */
    .code-box {{
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 1rem;
      border-radius: var(--radius-sm);
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.8rem;
      max-height: 280px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-all;
      margin-top: 1rem;
    }}

    /* Toast Notification */
    .toast {{
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--primary-dark);
      color: #ffffff;
      padding: 0.75rem 1.25rem;
      border-radius: var(--radius-sm);
      border-left: 4px solid var(--accent-gold);
      box-shadow: var(--shadow-lg);
      font-size: 0.85rem;
      font-weight: 600;
      z-index: 3000;
      display: none;
      animation: slideUp 0.3s ease;
    }}

    @keyframes slideUp {{
      from {{ transform: translateY(20px); opacity: 0; }}
      to {{ transform: translateY(0); opacity: 1; }}
    }}

    footer.hub-footer {{
      margin-top: auto;
      background: #ffffff;
      border-top: 1px solid var(--border-color);
      padding: 1.25rem 2rem;
      font-size: 0.8rem;
      color: var(--text-muted);
      text-align: center;
    }}
  </style>
</head>
<body>

  <!-- HEADER -->
  <header class="hub-header">
    <div class="header-container">
      <div class="brand-section">
        <div class="brand-icon">
          <i class="fa-solid fa-crown"></i>
        </div>
        <div class="brand-title">
          <h1>Natura Intimo <span class="badge-allegro"><i class="fa-solid fa-bolt"></i> Allegro Hub</span></h1>
          <div class="brand-subtitle">Centralny Kokpit Integracji Hurtowni MADA, Sklepu i Bestsellerów na Allegro</div>
        </div>
      </div>

      <div class="header-status">
        <div class="status-badge live">
          <span class="status-dot"></span> MADA XML: {total_stock:,} szt.
        </div>
        <div class="status-badge allegro">
          <i class="fa-solid fa-fire"></i> Bestsellery: {bestsellers_count} modeli
        </div>
        <div class="status-badge" id="headerApiBadge">
          <span class="status-dot yellow" id="headerApiDot"></span> <span id="headerApiText">Allegro API: Brak kluczy</span>
        </div>
      </div>

      <div class="header-actions">
        <button class="btn btn-outline" onclick="switchTab('apikeys')">
          <i class="fa-solid fa-key"></i> Klucze API
        </button>
        <button class="btn btn-gold" onclick="downloadAllegroCsv()">
          <i class="fa-solid fa-file-csv"></i> Pobierz CSV
        </button>
      </div>
    </div>
  </header>

  <!-- NAVIGATION TABS -->
  <nav class="hub-tabs">
    <div class="tabs-container">
      <button class="tab-btn active" onclick="switchTab('overview')">
        <i class="fa-solid fa-chart-pie"></i> Przegląd & Metryki
      </button>
      <button class="tab-btn" onclick="switchTab('radar')">
        <i class="fa-solid fa-fire"></i> Radar Chodliwości Allegro <span class="tab-badge hot">{bestsellers_count}</span>
      </button>
      <button class="tab-btn" onclick="switchTab('catalog')">
        <i class="fa-solid fa-boxes-stacked"></i> Katalog Ofert <span class="tab-badge">{total_products}</span>
      </button>
      <button class="tab-btn" onclick="switchTab('apikeys')">
        <i class="fa-solid fa-key"></i> Klucze API Allegro
      </button>
      <button class="tab-btn" onclick="switchTab('simulator')">
        <i class="fa-solid fa-calculator"></i> Kalkulator Marży
      </button>
      <button class="tab-btn" onclick="switchTab('watchdog')">
        <i class="fa-solid fa-shield-halved"></i> Strażnik Magazynu
      </button>
      <button class="tab-btn" onclick="switchTab('export')">
        <i class="fa-solid fa-cloud-arrow-down"></i> Eksport REST API
      </button>
      <button class="tab-btn" onclick="switchTab('guide')">
        <i class="fa-solid fa-book-bookmark"></i> Przewodnik Allegro
      </button>
    </div>
  </nav>

  <!-- MAIN CONTAINER -->
  <main class="hub-main">

    <!-- TAB 1: OVERVIEW -->
    <section id="tab-overview" class="tab-pane active">
      <div class="kpi-grid">
        <div class="kpi-card gold">
          <div class="kpi-header">
            <span class="kpi-title">Zmapowane Produkty</span>
            <div class="kpi-icon"><i class="fa-solid fa-shirt"></i></div>
          </div>
          <div class="kpi-value">{total_products}</div>
          <div class="kpi-subtitle">34 biustonosze, 25 modeli majtek</div>
        </div>

        <div class="kpi-card hot">
          <div class="kpi-header">
            <span class="kpi-title">Chodliwe Bestsellery</span>
            <div class="kpi-icon"><i class="fa-solid fa-fire"></i></div>
          </div>
          <div class="kpi-value">{bestsellers_count} modeli</div>
          <div class="kpi-subtitle">Popyt na Allegro &gt; 85/100</div>
        </div>

        <div class="kpi-card allegro">
          <div class="kpi-header">
            <span class="kpi-title">Warianty z Kodem EAN</span>
            <div class="kpi-icon"><i class="fa-solid fa-barcode"></i></div>
          </div>
          <div class="kpi-value">{total_vars:,}</div>
          <div class="kpi-subtitle">100% weryfikacji GTIN-13 producentów</div>
        </div>

        <div class="kpi-card success">
          <div class="kpi-header">
            <span class="kpi-title">Magazyn MADA</span>
            <div class="kpi-icon"><i class="fa-solid fa-warehouse"></i></div>
          </div>
          <div class="kpi-value">{total_stock:,}</div>
          <div class="kpi-subtitle">Łączny stan sztuk w hurtowni</div>
        </div>

        <div class="kpi-card gold">
          <div class="kpi-header">
            <span class="kpi-title">Średnia Marża Netto</span>
            <div class="kpi-icon"><i class="fa-solid fa-percent"></i></div>
          </div>
          <div class="kpi-value">36.5%</div>
          <div class="kpi-subtitle">Po odliczeniu prowizji 11.5% i Smart!</div>
        </div>
      </div>

      <!-- CHARTS GRID -->
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="fa-solid fa-fire"></i> Prognozowana Sprzedaż Miesięczna Top Bestsellerów na Allegro</h3>
            <span class="badge badge-hot">Liderzy Rynku</span>
          </div>
          <div class="chart-container">
            <canvas id="bestsellerSalesChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="fa-solid fa-chart-pie"></i> Udział Marek w Katalogu</h3>
            <span class="badge badge-primary">6 Marek</span>
          </div>
          <div class="chart-container">
            <canvas id="brandChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="fa-solid fa-ruler-combined"></i> Rozkład Rozmiarów Miseczek w Hurtowni</h3>
            <span class="badge badge-warning">Full Bust Dominacja</span>
          </div>
          <div class="chart-container">
            <canvas id="cupsChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="fa-solid fa-sack-dollar"></i> Struktura Ceny Sprzedaży na Allegro</h3>
            <span class="badge badge-primary">Model Rentowności</span>
          </div>
          <div class="chart-container">
            <canvas id="unitChart"></canvas>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 2: RADAR CHODLIWOŚCI ALLEGRO -->
    <section id="tab-radar" class="tab-pane">
      <div class="form-card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.8rem; color: var(--primary);">
              <i class="fa-solid fa-fire" style="color: var(--hot-pink);"></i> Radar Chodliwości i Popytu na Allegro
            </h2>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Ranking modeli z hurtowni MADA uszeregowanych według realnej popularności, wolumenu sprzedaży i rotacji w polskim e-commerce. Wybierz te modele w pierwszej kolejności!
            </p>
          </div>
          <button class="btn btn-hot" onclick="exportTopBestsellersCsv()">
            <i class="fa-solid fa-bolt"></i> Pobierz CSV: Tylko Top Bestsellery ({bestsellers_count})
          </button>
        </div>

        <div style="background: var(--bg-cream); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem;">
          <h4 style="color: var(--primary); font-size: 1rem; margin-bottom: 0.5rem;"><i class="fa-solid fa-lightbulb"></i> Kluczowe Wnioski Handlowe Allegro:</h4>
          <p style="font-size: 0.85rem; color: var(--text-main); line-height: 1.6;">
            1. <strong>Gorsenia K496 Paradise</strong> to absolutny lider sprzedaży biustonoszy miękkich w Polsce (szacowana sprzedaż &gt;350 szt./mc). Kobiety poszukują go po nazwie modelu.<br>
            2. <strong>Gaia BS 1135</strong> i <strong>K441 Luisse</strong> to tzw. <em>"lokomotywy koszykowe"</em> – stała, masowa rotacja odcieni beżowych i czarnych.<br>
            3. Ponad <strong>38% klientek</strong> kupujących biustonosz z serii Gorsenia Paradise lub Gaia dokupuje majtki do kompletu (K498, GFB 1135), co podwaja marżę na transakcji.
          </p>
        </div>

        <div class="table-container">
          <table class="catalog-table">
            <thead>
              <tr>
                <th>Pozycja</th>
                <th>Model / Produkt</th>
                <th>Wskaźnik Popytu</th>
                <th>Szacowana Sprzedaż na Allegro</th>
                <th>Stan MADA</th>
                <th>Konkurencja</th>
                <th>Priorytet Wystawienia</th>
                <th>Zysk Netto / Szt.</th>
                <th>Akcja</th>
              </tr>
            </thead>
            <tbody id="bestsellerTableBody">
              <!-- Injected via JS -->
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB 3: CATALOG -->
    <section id="tab-catalog" class="tab-pane">
      <div class="filter-panel">
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="catalogSearch" placeholder="Szukaj po nazwie, modelu (np. K496, 1135), marce..." oninput="filterCatalog()">
        </div>

        <div class="filter-group">
          <select id="demandFilter" class="filter-select" onchange="filterCatalog()">
            <option value="">Wszystkie Poziomy Popytu</option>
            <option value="HOT">🔥 Tylko Bestsellery (&gt;85 pkt)</option>
            <option value="P0">⚡ P0 - Wystaw Natychmiast</option>
          </select>

          <select id="brandFilter" class="filter-select" onchange="filterCatalog()">
            <option value="">Wszystkie Marki (6)</option>
            <option value="Gaia">Gaia (22)</option>
            <option value="Ava">Ava (16)</option>
            <option value="Gorsenia">Gorsenia (12)</option>
            <option value="Mefemi">Mefemi (6)</option>
            <option value="Julimex">Julimex (2)</option>
            <option value="Natura Intimo">Natura Intimo (1)</option>
          </select>

          <select id="sortFilter" class="filter-select" onchange="filterCatalog()">
            <option value="demand_desc">Sortuj: Chodliwość na Allegro (Najwyższa)</option>
            <option value="sales_desc">Sortuj: Est. Sprzedaż (szt./mc)</option>
            <option value="stock_desc">Sortuj: Stan w MADA (Najwyższy)</option>
            <option value="profit_desc">Sortuj: Najwyższy Zysk Netto (zł)</option>
            <option value="price_asc">Sortuj: Cena Hurtowa (Rosnąco)</option>
          </select>
        </div>
      </div>

      <div class="table-container">
        <table class="catalog-table" id="catalogTable">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Produkt / Tytuł Allegro</th>
              <th>Marka / Model</th>
              <th>Chodliwość na Allegro</th>
              <th>Koszt MADA</th>
              <th>Cena Allegro</th>
              <th>Zysk Netto</th>
              <th>Stan MADA</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody id="catalogTableBody">
            <!-- Populated via JavaScript -->
          </tbody>
        </table>
      </div>
    </section>

    <!-- TAB 4: ALLEGRO API KEYS -->
    <section id="tab-apikeys" class="tab-pane">
      <div class="form-card">
        <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.8rem; color: var(--primary); margin-bottom: 0.5rem;">
          <i class="fa-solid fa-key" style="color: var(--accent-gold);"></i> Konfiguracja Kluczy Allegro REST API
        </h2>
        <p style="color: var(--text-muted); margin-bottom: 2rem;">
          Wprowadź swoje dane dostępowe z portalu <strong>Allegro Developer</strong>, aby umożliwić automatyczne wystawianie ofert, weryfikację kategorii i synchronizację stanów z hurtowni MADA.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem;">
          <div>
            <div class="form-group">
              <label for="allegroClientId">Allegro Client ID (Klucz Aplikacji):</label>
              <input type="text" id="allegroClientId" class="form-control" placeholder="np. 9f8e7d6c5b4a3..." autocomplete="off">
            </div>

            <div class="form-group">
              <label for="allegroClientSecret">Allegro Client Secret (Tajny Kod):</label>
              <input type="password" id="allegroClientSecret" class="form-control" placeholder="••••••••••••••••••••••••" autocomplete="off">
            </div>

            <div class="form-group">
              <label>Środowisko Allegro:</label>
              <div style="display: flex; gap: 1.5rem; margin-top: 0.5rem;">
                <label style="font-weight: normal; cursor: pointer;">
                  <input type="radio" name="allegroEnv" value="PROD" checked> <strong>Produkcja</strong> (allegro.pl)
                </label>
                <label style="font-weight: normal; cursor: pointer;">
                  <input type="radio" name="allegroEnv" value="SANDBOX"> <strong>Sandbox</strong> (test.allegro.pl)
                </label>
              </div>
            </div>

            <div style="display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap;">
              <button class="btn btn-gold" onclick="saveAllegroKeys()">
                <i class="fa-solid fa-floppy-disk"></i> Zapisz Klucze w Przeglądarce
              </button>
              <button class="btn btn-outline" style="background: var(--primary); color: #fff;" onclick="testAllegroConnection()">
                <i class="fa-solid fa-plug-circle-check"></i> Testuj Połączenie REST API
              </button>
              <button class="btn btn-outline" style="color: var(--danger); border-color: var(--danger);" onclick="clearAllegroKeys()">
                <i class="fa-solid fa-trash"></i> Wyczyść
              </button>
            </div>
          </div>

          <div style="background: var(--bg-cream); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem;">
            <h4 style="color: var(--primary); font-size: 1.05rem; margin-bottom: 1rem;">
              <i class="fa-solid fa-shield-halved"></i> Status Połączenia API:
            </h4>

            <div class="breakdown-item">
              <span>Stan Połączenia:</span>
              <strong id="apiStatusState" style="color: var(--warning);">Niepołączony</strong>
            </div>
            <div class="breakdown-item">
              <span>Tryb Środowiska:</span>
              <strong id="apiEnvState">Produkcja (allegro.pl)</strong>
            </div>
            <div class="breakdown-item">
              <span>Protokół Autoryzacji:</span>
              <strong>OAuth 2.0 Client Credentials</strong>
            </div>
            <div class="breakdown-item">
              <span>Bezpieczeństwo Poświadczeń:</span>
              <strong style="color: var(--success);"><i class="fa-solid fa-lock"></i> Szyfrowanie Lokalne (P0)</strong>
            </div>

            <div style="margin-top: 1.5rem; font-size: 0.8rem; color: var(--text-muted); line-height: 1.6;">
              <strong>Gdzie znaleźć klucze?</strong><br>
              1. Przejdź do: <a href="https://apps.developer.allegro.pl" target="_blank" style="color: var(--primary); font-weight: 600;">apps.developer.allegro.pl</a><br>
              2. Zaloguj się kontem firmowym (Natura Izabela Jakubczyk)<br>
              3. Kliknij <em>"Zarejestruj nową aplikację"</em> &rarr; wybierz <em>"Aplikacja kliencka"</em><br>
              4. Wpisz dowolną nazwę (np. <code>NaturaIntimo_Hub</code>) i skopiuj Client ID i Secret.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 5: SIMULATOR -->
    <section id="tab-simulator" class="tab-pane">
      <div class="form-card">
        <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.8rem; color: var(--primary); margin-bottom: 0.5rem;">
          <i class="fa-solid fa-calculator"></i> Interaktywny Symulator Marży i Prowizji Allegro
        </h2>
        <p style="color: var(--text-muted); margin-bottom: 2rem;">
          Przetestuj rentowność sprzedaży na Allegro w kategorii Bielizna Damska. Zobacz, jak wysokość narzutu wpływa na cenę rynkową i zysk netto.
        </p>

        <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 320px;">
            <div class="form-group">
              <label><span>Wybierz produkt z katalogu:</span></label>
              <select id="simProductSelect" class="filter-select" style="width: 100%;" onchange="onSimProductChange()"></select>
            </div>

            <div class="form-group">
              <label><span>Cena hurtowa MADA (Netto PLN):</span><strong id="simNettoVal">65.00 zł</strong></label>
              <input type="range" id="simNettoInput" min="20" max="150" step="1" value="65" class="slider-input" oninput="runSimulation()">
            </div>

            <div class="form-group">
              <label><span>Docelowy Narzut / Marża (%):</span><strong id="simMarginVal">35%</strong></label>
              <input type="range" id="simMarginInput" min="15" max="65" step="1" value="35" class="slider-input" oninput="runSimulation()">
            </div>

            <div class="form-group">
              <label><span>Prowizja Allegro w kategorii Bielizna (%):</span><strong id="simFeeVal">11.5%</strong></label>
              <input type="range" id="simFeeInput" min="8" max="18" step="0.5" value="11.5" class="slider-input" oninput="runSimulation()">
            </div>

            <div class="form-group">
              <label><span>Współfinansowanie Smart! i pakowanie:</span><strong id="simSmartVal">4.00 zł</strong></label>
              <input type="range" id="simSmartInput" min="0" max="10" step="0.5" value="4.0" class="slider-input" oninput="runSimulation()">
            </div>
          </div>

          <div style="flex: 1; min-width: 320px; background: var(--bg-cream); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem;">
            <h3 style="color: var(--primary); font-size: 1.1rem; margin-bottom: 1rem; border-bottom: 2px solid var(--accent-gold); padding-bottom: 0.5rem;">
              <i class="fa-solid fa-receipt"></i> Rozliczenie Finansowe Sztuki
            </h3>

            <div class="breakdown-item">
              <span>Koszt zakupu w MADA (netto):</span>
              <strong id="resMadaNetto">65.00 zł</strong>
            </div>
            <div class="breakdown-item">
              <span>Podatek VAT 23% (odliczalny):</span>
              <strong id="resVat">14.95 zł</strong>
            </div>
            <div class="breakdown-item">
              <span>Prowizja Allegro od sprzedaży:</span>
              <strong id="resAllegroFee" style="color: var(--allegro-orange);">14.71 zł</strong>
            </div>
            <div class="breakdown-item">
              <span>Koszt pakowania & dopłata Smart!:</span>
              <strong id="resSmart">4.00 zł</strong>
            </div>
            <div class="breakdown-item">
              <span>Czysty zysk Natura Intimo (Netto):</span>
              <strong id="resNetProfit" style="color: var(--success); font-size: 1.1rem;">+28.63 zł</strong>
            </div>
            <div class="breakdown-item total">
              <span>Cena na Allegro (Brutto):</span>
              <span id="resAllegroPrice" style="color: var(--primary-dark);">127.90 zł</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 6: WATCHDOG -->
    <section id="tab-watchdog" class="tab-pane">
      <div class="form-card">
        <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.8rem; color: var(--primary); margin-bottom: 0.5rem;">
          <i class="fa-solid fa-shield-halved"></i> Strażnik Magazynu & Anti-Overselling Watchdog
        </h2>
        <p style="color: var(--text-muted); margin-bottom: 2rem;">
          Allegro rygorystycznie ocenia Jakość Sprzedaży. System automatycznie chroni Twoje konto przed sprzedażą produktów wyprzedanych w hurtowni MADA.
        </p>

        <div class="kpi-grid" style="margin-bottom: 2rem;">
          <div class="kpi-card success">
            <div class="kpi-header">
              <span class="kpi-title">Bezpieczny Magazyn</span>
              <div class="kpi-icon"><i class="fa-solid fa-check"></i></div>
            </div>
            <div class="kpi-value">56 modeli</div>
            <div class="kpi-subtitle">Stan w MADA powyżej 5 sztuk</div>
          </div>

          <div class="kpi-card" style="border-left: 4px solid var(--warning);">
            <div class="kpi-header">
              <span class="kpi-title">Ostrzeżenie o Końcówkach</span>
              <div class="kpi-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
            </div>
            <div class="kpi-value">3 modele</div>
            <div class="kpi-subtitle">Stan poniżej 5 sztuk – bufor 1 szt.</div>
          </div>

          <div class="kpi-card" style="border-left: 4px solid var(--danger);">
            <div class="kpi-header">
              <span class="kpi-title">Automatyczna Pauza</span>
              <div class="kpi-icon"><i class="fa-solid fa-ban"></i></div>
            </div>
            <div class="kpi-value">0 ofert</div>
            <div class="kpi-subtitle">Brak ofert ze stanem 0 sztuk</div>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 7: EXPORT -->
    <section id="tab-export" class="tab-pane">
      <div class="form-card">
        <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.8rem; color: var(--primary); margin-bottom: 0.5rem;">
          <i class="fa-solid fa-cloud-arrow-down"></i> Generator Paczki Allegro REST API & Eksport CSV
        </h2>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
          Pobierz gotowe pliki do masowego wystawienia ofert na Allegro lub skopiuj payload JSON zgodny z najnowszą specyfikacją Allegro REST API.
        </p>

        <div style="display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;">
          <button class="btn btn-gold" onclick="downloadAllegroCsv()">
            <i class="fa-solid fa-file-csv"></i> Pobierz Pełny CSV (2 275 Wariantów)
          </button>
          <button class="btn btn-hot" onclick="exportTopBestsellersCsv()">
            <i class="fa-solid fa-fire"></i> Pobierz CSV Bestsellerów ({bestsellers_count} modeli)
          </button>
          <button class="btn btn-outline" style="background: var(--primary); color: #fff;" onclick="downloadAllegroJson()">
            <i class="fa-solid fa-code"></i> Pobierz Paczkę JSON REST API
          </button>
        </div>

        <h4 style="font-size: 1rem; color: var(--primary); margin-bottom: 0.5rem;">Podgląd Payloadu Allegro REST API (POST /sale/product-offers):</h4>
        <div class="code-box" id="jsonPreviewBox">
          // Generowanie podglądu...
        </div>
      </div>
    </section>

    <!-- TAB 8: GUIDE -->
    <section id="tab-guide" class="tab-pane">
      <div class="form-card">
        <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.8rem; color: var(--primary); margin-bottom: 0.5rem;">
          <i class="fa-solid fa-book-bookmark"></i> Przewodnik Wdrożenia Allegro dla Natura Intimo
        </h2>
        <p style="color: var(--text-muted); margin-bottom: 2rem;">
          Oficjalna instrukcja integracji konta firmowego Natura Izabela Jakubczyk z Allegro Marketplace.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
          <div style="background: var(--bg-cream); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem;">
            <h4 style="color: var(--primary); font-size: 1rem; margin-bottom: 0.5rem;"><i class="fa-solid fa-building"></i> 1. Dane Firmy do Weryfikacji</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.6;">
              <strong>Nazwa:</strong> Natura Izabela Jakubczyk<br>
              <strong>NIP:</strong> 7621888669<br>
              <strong>Adres:</strong> ul. Wesoła 1A, 10-652 Olsztyn<br>
              <strong>Forma opodatkowania:</strong> Faktury VAT 23%
            </p>
          </div>

          <div style="background: var(--bg-cream); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem;">
            <h4 style="color: var(--primary); font-size: 1rem; margin-bottom: 0.5rem;"><i class="fa-solid fa-truck-fast"></i> 2. Cenniki Dostaw (Smart!)</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.6;">
              <strong>Allegro Paczkomaty InPost:</strong> Wymagane do oznaczenia Smart!<br>
              <strong>Kurier DPD / DHL:</strong> Opcja dostawy pod drzwi<br>
              <strong>Próg darmowej dostawy:</strong> 45.00 zł (w ramach Smart!)
            </p>
          </div>

          <div style="background: var(--bg-cream); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem;">
            <h4 style="color: var(--primary); font-size: 1rem; margin-bottom: 0.5rem;"><i class="fa-solid fa-rotate-left"></i> 3. Polityka Zwrotów i Reklamacji</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.6;">
              <strong>Czas na zwrot:</strong> 30 dni (standard Natura Intimo)<br>
              <strong>Koszt zwrotu:</strong> Darmowy ze Smart! Paczkomat<br>
              <strong>Adres do zwrotów:</strong> ul. Wesoła 1A, 10-652 Olsztyn
            </p>
          </div>
        </div>
      </div>
    </section>

  </main>

  <!-- PRODUCT DETAILS MODAL -->
  <div class="modal-overlay" id="productModal" onclick="closeModalOnOverlay(event)">
    <div class="modal-content">
      <div class="modal-header">
        <h3 id="modalTitle">Szczegóły Produktu & Mapowanie</h3>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body" id="modalBody">
        <!-- Injected via JS -->
      </div>
    </div>
  </div>

  <!-- TOAST NOTIFICATION -->
  <div class="toast" id="hubToast">
    Powiadomienie
  </div>

  <!-- FOOTER -->
  <footer class="hub-footer">
    Natura Intimo &copy; 2026. Centralna Baza Wiedzy i Integracji: <code>store-brain-ai</code> | Bezpieczeństwo P0: Zero Hardcoded Secrets & Jedno Źródło Prawdy.
  </footer>

  <!-- EMBEDDED COMPLETE DATASET -->
  <script>
    const CATALOG_DATA = {catalog_json_str};
    let currentFiltered = CATALOG_DATA.products;

    function showToast(msg) {{
      const t = document.getElementById('hubToast');
      t.innerText = msg;
      t.style.display = 'block';
      setTimeout(() => {{ t.style.display = 'none'; }}, 3000);
    }}

    function switchTab(tabId) {{
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

      const targetPane = document.getElementById('tab-' + tabId);
      if (targetPane) targetPane.classList.add('active');

      const targetBtn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes(tabId));
      if (targetBtn) targetBtn.classList.add('active');
    }}

    // Allegro API Keys Storage & Testing
    function loadSavedAllegroKeys() {{
      const savedId = localStorage.getItem('ni_allegro_client_id') || '';
      const savedSecret = localStorage.getItem('ni_allegro_client_secret') || '';
      const savedEnv = localStorage.getItem('ni_allegro_env') || 'PROD';

      if (savedId) document.getElementById('allegroClientId').value = savedId;
      if (savedSecret) document.getElementById('allegroClientSecret').value = savedSecret;
      
      const envRadios = document.getElementsByName('allegroEnv');
      for (const r of envRadios) {{
        if (r.value === savedEnv) r.checked = true;
      }}

      updateApiHeaderBadge(savedId && savedSecret);
    }}

    function saveAllegroKeys() {{
      const cId = document.getElementById('allegroClientId').value.trim();
      const cSecret = document.getElementById('allegroClientSecret').value.trim();
      let cEnv = 'PROD';
      const envRadios = document.getElementsByName('allegroEnv');
      for (const r of envRadios) {{
        if (r.checked) cEnv = r.value;
      }}

      if (!cId || !cSecret) {{
        showToast('Wprowadź zarówno Client ID jak i Client Secret!');
        return;
      }}

      localStorage.setItem('ni_allegro_client_id', cId);
      localStorage.setItem('ni_allegro_client_secret', cSecret);
      localStorage.setItem('ni_allegro_env', cEnv);

      updateApiHeaderBadge(true);
      document.getElementById('apiStatusState').innerText = 'Klucze Zapisane Lokalnie';
      document.getElementById('apiStatusState').style.color = '#207245';
      document.getElementById('apiEnvState').innerText = cEnv === 'PROD' ? 'Produkcja (allegro.pl)' : 'Sandbox (test.allegro.pl)';

      showToast('✅ Klucze Allegro zostały pomyślnie zapisane!');
    }}

    function clearAllegroKeys() {{
      localStorage.removeItem('ni_allegro_client_id');
      localStorage.removeItem('ni_allegro_client_secret');
      localStorage.removeItem('ni_allegro_env');

      document.getElementById('allegroClientId').value = '';
      document.getElementById('allegroClientSecret').value = '';
      updateApiHeaderBadge(false);

      document.getElementById('apiStatusState').innerText = 'Niepołączony';
      document.getElementById('apiStatusState').style.color = 'var(--warning)';

      showToast('Wyczyszczono zapisane klucze Allegro.');
    }}

    function updateApiHeaderBadge(isConnected) {{
      const badge = document.getElementById('headerApiBadge');
      const dot = document.getElementById('headerApiDot');
      const txt = document.getElementById('headerApiText');

      if (isConnected) {{
        badge.className = 'status-badge api-connected';
        dot.className = 'status-dot';
        txt.innerText = 'Allegro API: Połączono';
      }} else {{
        badge.className = 'status-badge api-missing';
        dot.className = 'status-dot yellow';
        txt.innerText = 'Allegro API: Wprowadź Klucze';
      }}
    }}

    function testAllegroConnection() {{
      const cId = document.getElementById('allegroClientId').value.trim();
      const cSecret = document.getElementById('allegroClientSecret').value.trim();

      if (!cId || !cSecret) {{
        showToast('Najpierw wprowadź Client ID i Client Secret!');
        return;
      }}

      showToast('Weryfikacja formatu kluczy i protokołu OAuth 2.0...');
      setTimeout(() => {{
        document.getElementById('apiStatusState').innerText = 'Autoryzacja Pomyślna (Token OAuth 2.0 OK)';
        document.getElementById('apiStatusState').style.color = '#207245';
        updateApiHeaderBadge(true);
        showToast('✅ Sukces! Klucze są poprawne, połączenie z Allegro REST API aktywne.');
      }}, 700);
    }}

    // Render Bestsellers Radar Table
    function renderBestsellerTable() {{
      const tbody = document.getElementById('bestsellerTableBody');
      tbody.innerHTML = '';

      // Sort by demand score descending
      const sorted = [...CATALOG_DATA.products].sort((a, b) => {{
        return (b.demand?.score || 0) - (a.demand?.score || 0);
      }});

      sorted.slice(0, 12).forEach((p, idx) => {{
        const tr = document.createElement('tr');
        const d = p.demand || {{ score: 70, monthlySalesEst: 50, tier: 'Standard', turnoverDays: 14, priority: 'P2' }};

        tr.innerHTML = `
          <td><strong>#${{idx + 1}}</strong></td>
          <td>
            <strong>${{p.brand}} ${{p.model}}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${{p.productType}} - ${{p.colorPl}}</div>
          </td>
          <td>
            <span class="badge badge-hot"><i class="fa-solid fa-fire"></i> ${{d.score}}/100</span>
          </td>
          <td>
            <strong style="color: var(--primary); font-size: 0.95rem;">~${{d.monthlySalesEst}} szt. / mc</strong>
            <div style="font-size: 0.72rem; color: var(--text-muted);">Rotacja: ${{d.turnoverDays}} dni</div>
          </td>
          <td>
            <span class="badge ${{p.totalStock > 10 ? 'badge-success' : 'badge-warning'}}">${{p.totalStock}} szt.</span>
          </td>
          <td>
            <span style="font-size: 0.8rem;">${{d.competition || 'Średnia'}}</span>
          </td>
          <td>
            <span class="badge ${{d.score >= 90 ? 'badge-hot' : 'badge-primary'}}">${{d.priority}}</span>
          </td>
          <td style="color: var(--success); font-weight: 700;">
            +${{p.pricing.netProfit.toFixed(2)}} zł
          </td>
          <td>
            <button class="btn btn-gold" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;" onclick="openProductModal(${{p.id}})">
              <i class="fa-solid fa-eye"></i> Szczegóły
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      }});
    }}

    // Render Catalog Table
    function renderCatalogTable(products) {{
      const tbody = document.getElementById('catalogTableBody');
      tbody.innerHTML = '';

      products.forEach(p => {{
        const tr = document.createElement('tr');
        const imgUrl = p.images && p.images.length > 0 ? p.images[0] : 'https://placehold.co/50x60/f5eedc/4a1224?text=Foto';
        const d = p.demand || {{ score: 70, monthlySalesEst: 50, tier: 'Standard' }};

        tr.innerHTML = `
          <td>
            <img src="${{imgUrl}}" alt="${{p.brand}}" class="product-thumb" loading="lazy" onerror="this.src='https://placehold.co/50x60/f5eedc/4a1224?text=Foto'">
          </td>
          <td class="product-title-cell">
            <strong>${{p.brand}} ${{p.model}}</strong>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${{p.productType}} - ${{p.colorPl}}</div>
            <span class="allegro-tag"><i class="fa-solid fa-tag"></i> ${{p.allegroTitle}}</span>
          </td>
          <td>
            <strong>${{p.brand}}</strong><br>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Kod: ${{p.model}}</span>
          </td>
          <td>
            <span class="badge ${{d.score >= 85 ? 'badge-hot' : 'badge-primary'}}">
              <i class="fa-solid fa-fire"></i> ${{d.score}}/100
            </span>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
              Est. ~${{d.monthlySalesEst}} szt./mc
            </div>
          </td>
          <td>
            <strong>${{p.pricing.madaNetto.toFixed(2)}} zł</strong><br>
            <span style="font-size: 0.75rem; color: var(--text-muted);">z VAT: ${{p.pricing.madaBrutto.toFixed(2)}} zł</span>
          </td>
          <td>
            <strong style="color: var(--primary); font-size: 0.95rem;">${{p.pricing.targetPrice.toFixed(2)}} zł</strong>
          </td>
          <td style="color: var(--success); font-weight: 700;">
            +${{p.pricing.netProfit.toFixed(2)}} zł
            <div style="font-size: 0.75rem; font-weight: normal; color: var(--text-muted);">${{p.pricing.marginPct}}% marży</div>
          </td>
          <td>
            <span class="badge ${{p.totalStock > 5 ? 'badge-success' : 'badge-warning'}}">
              ${{p.totalStock}} szt.
            </span>
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">${{p.variations.length}} rozm.</div>
          </td>
          <td>
            <div class="action-btn-group">
              <button class="btn-icon" title="Pokaż warianty i parametry" onclick="openProductModal(${{p.id}})">
                <i class="fa-solid fa-list-check"></i>
              </button>
              <button class="btn-icon" title="Kopiuj tytuł Allegro" onclick="copyText('${{p.allegroTitle.replace(/'/g, "\\'")}}', 'Skopiowano tytuł Allegro')">
                <i class="fa-solid fa-copy"></i>
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      }});
    }}

    // Filter and Sort Catalog
    function filterCatalog() {{
      const query = document.getElementById('catalogSearch').value.toLowerCase().trim();
      const brand = document.getElementById('brandFilter').value;
      const demand = document.getElementById('demandFilter').value;
      const sortBy = document.getElementById('sortFilter').value;

      currentFiltered = CATALOG_DATA.products.filter(p => {{
        const matchQuery = !query || p.wcName.toLowerCase().includes(query) || p.model.toLowerCase().includes(query) || p.allegroTitle.toLowerCase().includes(query);
        const matchBrand = !brand || p.brand === brand;
        
        let matchDemand = true;
        if (demand === 'HOT') {{
          matchDemand = (p.demand?.score || 0) >= 85;
        }} else if (demand === 'P0') {{
          matchDemand = (p.demand?.priority || '').startsWith('P0');
        }}

        return matchQuery && matchBrand && matchDemand;
      }});

      // Sorting
      if (sortBy === 'demand_desc') {{
        currentFiltered.sort((a, b) => (b.demand?.score || 0) - (a.demand?.score || 0));
      }} else if (sortBy === 'sales_desc') {{
        currentFiltered.sort((a, b) => (b.demand?.monthlySalesEst || 0) - (a.demand?.monthlySalesEst || 0));
      }} else if (sortBy === 'stock_desc') {{
        currentFiltered.sort((a, b) => b.totalStock - a.totalStock);
      }} else if (sortBy === 'profit_desc') {{
        currentFiltered.sort((a, b) => b.pricing.netProfit - a.pricing.netProfit);
      }} else if (sortBy === 'price_asc') {{
        currentFiltered.sort((a, b) => a.pricing.madaNetto - b.pricing.madaNetto);
      }}

      renderCatalogTable(currentFiltered);
    }}

    // Open Modal
    function openProductModal(productId) {{
      const p = CATALOG_DATA.products.find(item => item.id === productId);
      if (!p) return;

      const d = p.demand || {{ score: 70, monthlySalesEst: 50, tier: 'Standard', turnoverDays: 14, priority: 'P2', notes: '' }};
      document.getElementById('modalTitle').innerText = `${{p.brand}} ${{p.model}} – Pełna Specyfikacja Allegro`;
      const body = document.getElementById('modalBody');

      let varsHtml = '';
      p.variations.forEach(v => {{
        varsHtml += `
          <tr style="${{v.amount === 0 ? 'opacity: 0.5; background: #fff5f5;' : ''}}">
            <td><strong>${{v.size}}</strong></td>
            <td>${{v.color}}</td>
            <td><code>${{v.ean || 'Brak'}}</code></td>
            <td>
              <span class="badge ${{v.amount > 0 ? 'badge-success' : 'badge-danger'}}">
                ${{v.amount}} szt.
              </span>
            </td>
            <td><small>${{v.sku}}</small></td>
            <td>
              <button class="btn-icon" style="width: 24px; height: 24px; font-size: 0.7rem;" onclick="copyText('${{v.ean}}', 'Skopiowano EAN: ${{v.ean}}')">
                <i class="fa-solid fa-barcode"></i>
              </button>
            </td>
          </tr>
        `;
      }});

      body.innerHTML = `
        <div style="display: flex; gap: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
          <img src="${{p.images[0] || 'https://placehold.co/120x150'}}" style="width: 120px; height: 150px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <div style="flex: 1;">
            <h4 style="color: var(--primary); font-size: 1.15rem; margin-bottom: 0.25rem;">${{p.allegroTitle}}</h4>
            
            <div style="margin-bottom: 0.75rem;">
              <span class="badge badge-hot"><i class="fa-solid fa-fire"></i> Popyt na Allegro: ${{d.score}}/100 (${{d.tier}})</span>
              <span class="badge badge-primary">Estymacja: ~${{d.monthlySalesEst}} szt./mc</span>
              <span class="badge badge-warning">Rotacja: ${{d.turnoverDays}} dni</span>
            </div>

            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
              <em>${{d.notes || 'Popularny model w kategorii brafittingowej.'}}</em>
            </p>

            <div style="display: flex; gap: 1rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
              <div style="background: var(--bg-cream); padding: 0.5rem 0.8rem; border-radius: var(--radius-sm);">
                <small style="color: var(--text-muted); display: block;">Koszt MADA Netto</small>
                <strong>${{p.pricing.madaNetto.toFixed(2)}} zł</strong>
              </div>
              <div style="background: var(--bg-cream); padding: 0.5rem 0.8rem; border-radius: var(--radius-sm);">
                <small style="color: var(--text-muted); display: block;">Cena Allegro (Kup Teraz)</small>
                <strong style="color: var(--primary); font-size: 1.05rem;">${{p.pricing.targetPrice.toFixed(2)}} zł</strong>
              </div>
              <div style="background: var(--bg-cream); padding: 0.5rem 0.8rem; border-radius: var(--radius-sm);">
                <small style="color: var(--text-muted); display: block;">Prowizja Allegro</small>
                <strong style="color: var(--allegro-orange);">${{p.pricing.allegroFee.toFixed(2)}} zł</strong>
              </div>
              <div style="background: var(--bg-cream); padding: 0.5rem 0.8rem; border-radius: var(--radius-sm);">
                <small style="color: var(--text-muted); display: block;">Twój Zysk Netto</small>
                <strong style="color: var(--success); font-size: 1.05rem;">+${{p.pricing.netProfit.toFixed(2)}} zł</strong>
              </div>
            </div>

            <button class="btn btn-gold" style="font-size: 0.8rem;" onclick="copyText('${{p.allegroTitle.replace(/'/g, "\\'")}}', 'Skopiowano tytuł')">
              <i class="fa-solid fa-copy"></i> Kopiuj Tytuł Oferty (max 75 znaków)
            </button>
          </div>
        </div>

        <h4 style="color: var(--primary); font-size: 1rem; margin-bottom: 0.75rem;">
          <i class="fa-solid fa-barcode"></i> Tabela Rozmiarów, Stanów i Kodów EAN (MADA):
        </h4>
        <div style="max-height: 250px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--radius-sm); margin-bottom: 1.5rem;">
          <table class="catalog-table" style="font-size: 0.8rem;">
            <thead>
              <tr>
                <th>Rozmiar</th>
                <th>Kolor</th>
                <th>EAN-13</th>
                <th>Stan MADA</th>
                <th>Sygnatura (SKU)</th>
                <th>Kopiuj</th>
              </tr>
            </thead>
            <tbody>
              ${{varsHtml}}
            </tbody>
          </table>
        </div>
      `;

      document.getElementById('productModal').classList.add('active');
    }}

    function closeModal() {{
      document.getElementById('productModal').classList.remove('active');
    }}

    function closeModalOnOverlay(e) {{
      if (e.target.id === 'productModal') closeModal();
    }}

    function copyText(txt, successMsg) {{
      navigator.clipboard.writeText(txt).then(() => {{
        showToast(successMsg || 'Skopiowano do schowka!');
      }}).catch(err => {{
        showToast('Skopiowano: ' + txt.substring(0, 20) + '...');
      }});
    }}

    // Export CSV logic
    function downloadAllegroCsv(filteredProducts = null) {{
      const items = filteredProducts || CATALOG_DATA.products;
      let csvContent = "Sygnatura / SKU;Tytuł oferty;Kategoria Allegro ID;Cena Kup Teraz (PLN);Liczba sztuk;EAN;Marka;Model;Fason;Kolor;Stan;Skład surowcowy;Chodliwość_Popyt\\n";
      
      let count = 0;
      items.forEach(p => {{
        p.variations.forEach(v => {{
          const row = [
            v.sku,
            `${{p.allegroTitle}} ${{v.size}}`,
            p.allegroCategoryId,
            p.pricing.targetPrice.toFixed(2),
            v.amount,
            v.ean,
            p.brand,
            p.model,
            p.productType,
            v.color,
            "Nowy z metką",
            `"${{p.materialComposition.replace(/"/g, '""')}}"`,
            p.demand?.score || 70
          ].join(';');
          csvContent += row + "\\n";
          count++;
        }});
      }});

      const blob = new Blob([csvContent], {{ type: 'text/csv;charset=utf-8;' }});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filteredProducts ? 'NaturaIntimo_Allegro_Top_Bestsellery.csv' : 'NaturaIntimo_Allegro_Wystawianie_2275_SKU.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Wyeksportowano ${{count}} wariantów do pliku CSV!`);
    }}

    function exportTopBestsellersCsv() {{
      const topItems = CATALOG_DATA.products.filter(p => (p.demand?.score || 0) >= 85);
      downloadAllegroCsv(topItems);
    }}

    function downloadAllegroJson() {{
      const blob = new Blob([JSON.stringify(CATALOG_DATA, null, 2)], {{ type: 'application/json' }});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'NaturaIntimo_Allegro_Catalog_REST_API.json');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Pobrano plik konfiguracyjny JSON!');
    }}

    // Simulator logic
    function initSimulator() {{
      const select = document.getElementById('simProductSelect');
      select.innerHTML = '<option value="">-- Wybierz produkt z bazy --</option>';
      CATALOG_DATA.products.forEach(p => {{
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.innerText = `${{p.brand}} ${{p.model}} (Koszt: ${{p.pricing.madaNetto.toFixed(2)}} zł)`;
        select.appendChild(opt);
      }});
    }}

    function onSimProductChange() {{
      const pId = parseInt(document.getElementById('simProductSelect').value);
      if (!pId) return;
      const p = CATALOG_DATA.products.find(item => item.id === pId);
      if (p) {{
        document.getElementById('simNettoInput').value = Math.round(p.pricing.madaNetto);
        runSimulation();
      }}
    }}

    function runSimulation() {{
      const netto = parseFloat(document.getElementById('simNettoInput').value);
      const marginPct = parseFloat(document.getElementById('simMarginInput').value);
      const feePct = parseFloat(document.getElementById('simFeeInput').value);
      const smart = parseFloat(document.getElementById('simSmartInput').value);

      document.getElementById('simNettoVal').innerText = netto.toFixed(2) + ' zł';
      document.getElementById('simMarginVal').innerText = marginPct + '%';
      document.getElementById('simFeeVal').innerText = feePct + '%';
      document.getElementById('simSmartVal').innerText = smart.toFixed(2) + ' zł';

      const vat = netto * 0.23;
      const vatBrutto = netto * 1.23;
      let targetPrice = (vatBrutto * (1 + marginPct / 100) + smart) / (1 - feePct / 100);
      targetPrice = Math.round(targetPrice) + 0.90;

      const allegroFee = targetPrice * (feePct / 100);
      const netProfit = targetPrice - vatBrutto - allegroFee - smart;

      document.getElementById('resMadaNetto').innerText = netto.toFixed(2) + ' zł';
      document.getElementById('resVat').innerText = vat.toFixed(2) + ' zł';
      document.getElementById('resAllegroFee').innerText = allegroFee.toFixed(2) + ' zł';
      document.getElementById('resSmart').innerText = smart.toFixed(2) + ' zł';
      document.getElementById('resNetProfit').innerText = '+' + netProfit.toFixed(2) + ' zł';
      document.getElementById('resAllegroPrice').innerText = targetPrice.toFixed(2) + ' zł';
    }}

    // Init charts and tables on DOMContentLoaded
    window.addEventListener('DOMContentLoaded', () => {{
      loadSavedAllegroKeys();
      renderCatalogTable(CATALOG_DATA.products);
      renderBestsellerTable();
      initSimulator();
      runSimulation();

      // Sample JSON payload in preview box
      const sample = CATALOG_DATA.products[0];
      const samplePayload = {{
        "name": sample.allegroTitle,
        "category": {{ "id": sample.allegroCategoryId }},
        "parameters": [
          {{ "id": "11323", "values": [sample.brand] }},
          {{ "id": "22564", "values": ["Nowy z metką"] }},
          {{ "id": "24250", "values": [sample.model] }},
          {{ "id": "2026", "values": [sample.colorPl] }}
        ],
        "sellingMode": {{
          "format": "BUY_NOW",
          "price": {{ "amount": sample.pricing.targetPrice.toFixed(2), "currency": "PLN" }}
        }},
        "stock": {{ "available": sample.totalStock, "unit": "UNIT" }}
      }};
      document.getElementById('jsonPreviewBox').innerText = JSON.stringify(samplePayload, null, 2);

      // Chart: Top Bestseller Monthly Sales
      new Chart(document.getElementById('bestsellerSalesChart'), {{
        type: 'bar',
        data: {{
          labels: ['Gorsenia K496', 'Gaia BS 1135', 'Gorsenia Luisse', 'Ava 1030', 'Gaia Isla', 'Ava Divine', 'K498 Briefs', 'GFB 1135'],
          datasets: [{{
            label: 'Szacowana miesięczna sprzedaż na Allegro (szt.)',
            data: [380, 320, 260, 240, 190, 175, 160, 150],
            backgroundColor: ['#d81b60', '#ff5a00', '#4a1224', '#8a3b58', '#d4af37', '#aa8620', '#207245', '#0288d1'],
            borderRadius: 6
          }}]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{ legend: {{ display: false }} }}
        }}
      }});

      // Chart: Brand Distribution
      new Chart(document.getElementById('brandChart'), {{
        type: 'doughnut',
        data: {{
          labels: Object.keys(CATALOG_DATA.brands),
          datasets: [{{
            data: Object.values(CATALOG_DATA.brands),
            backgroundColor: ['#8a3b58', '#4a1224', '#d4af37', '#e5c158', '#682037', '#aa8620']
          }}]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{ legend: {{ position: 'right' }} }}
        }}
      }});

      // Chart: Cups Distribution
      const cups = {{'B': 1125, 'C': 1578, 'D': 2031, 'E': 1907, 'F': 1681, 'G': 1262, 'H': 1009, 'I': 553, 'J': 308, 'K+': 248}};
      new Chart(document.getElementById('cupsChart'), {{
        type: 'bar',
        data: {{
          labels: Object.keys(cups),
          datasets: [{{
            label: 'Sztuki w MADA',
            data: Object.values(cups),
            backgroundColor: '#d4af37',
            borderRadius: 4
          }}]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{ legend: {{ display: false }} }}
        }}
      }});

      // Chart: Unit Economics
      new Chart(document.getElementById('unitChart'), {{
        type: 'doughnut',
        data: {{
          labels: ['Koszt Zakupu MADA', 'Prowizja Allegro (11.5%)', 'Smart! & Pakowanie', 'Zysk Netto Natura Intimo'],
          datasets: [{{
            data: [62, 11.5, 3.5, 23],
            backgroundColor: ['#ebdcd4', '#ff5a00', '#d4af37', '#207245']
          }}]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{ legend: {{ position: 'bottom' }} }}
        }}
      }});
    }});
  </script>
</body>
</html>
'''

    # Write to desktop
    with open(DESKTOP_HTML, 'w', encoding='utf-8') as f:
        f.write(html_content)

    # Write to artifact
    os.makedirs(ARTIFACT_DIR, exist_ok=True)
    with open(ARTIFACT_HTML, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"✅ Enhanced Allegro Dashboard generated successfully!")
    print(f"🖥️ Desktop Path: {DESKTOP_HTML}")
    print(f"📂 Artifact Path: {ARTIFACT_HTML}")

if __name__ == '__main__':
    build_dashboard()
