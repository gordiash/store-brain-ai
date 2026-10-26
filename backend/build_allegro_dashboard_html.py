#!/usr/bin/env python3
"""
Natura Intimo – Allegro & MADA Integration Dashboard Builder
Generates a standalone, feature-complete, interactive HTML dashboard.
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

    # Pre-calculate quick aggregates
    data = json.loads(catalog_json_str)
    total_products = data['totalProducts']
    total_vars = data['totalVariations']
    total_stock = data['totalWholesaleStock']
    brands = data['brands']

    html_content = f'''<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Natura Intimo – Integrator Produktów MADA & Sklep z Allegro</title>
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

    .status-dot {{
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #2ecc71;
      box-shadow: 0 0 8px #2ecc71;
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
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
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
      max-width: 280px;
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

    /* Simulator Tab Styles */
    .simulator-card {{
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.75rem;
      box-shadow: var(--shadow-sm);
    }}

    .calc-row {{
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
    }}

    .calc-controls {{
      flex: 1;
      min-width: 320px;
    }}

    .calc-results {{
      flex: 1;
      min-width: 320px;
      background: var(--bg-cream);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.5rem;
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

    /* Code Snippet Box */
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
          <div class="brand-subtitle">Centralny Kokpit Integracji Hurtowni MADA, Sklepu i Marketplace Allegro</div>
        </div>
      </div>

      <div class="header-status">
        <div class="status-badge live">
          <span class="status-dot"></span> MADA XML: {total_stock:,} szt.
        </div>
        <div class="status-badge live">
          <i class="fa-solid fa-store"></i> Sklep: {total_products} modeli
        </div>
        <div class="status-badge allegro">
          <i class="fa-solid fa-certificate"></i> EAN: 100% (2 275 SKU)
        </div>
      </div>

      <div class="header-actions">
        <button class="btn btn-outline" onclick="triggerRefresh()">
          <i class="fa-solid fa-rotate"></i> Odśwież
        </button>
        <button class="btn btn-gold" onclick="downloadAllegroCsv()">
          <i class="fa-solid fa-file-csv"></i> Pobierz CSV Allegro
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
      <button class="tab-btn" onclick="switchTab('catalog')">
        <i class="fa-solid fa-boxes-stacked"></i> Katalog Ofert Allegro <span class="tab-badge">{total_products}</span>
      </button>
      <button class="tab-btn" onclick="switchTab('simulator')">
        <i class="fa-solid fa-calculator"></i> Kalkulator Marży & Prowizji
      </button>
      <button class="tab-btn" onclick="switchTab('watchdog')">
        <i class="fa-solid fa-shield-halved"></i> Strażnik Magazynu MADA
      </button>
      <button class="tab-btn" onclick="switchTab('export')">
        <i class="fa-solid fa-cloud-arrow-down"></i> Eksport REST API & Batch
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
          <div class="kpi-subtitle">Łączny stan sztuk w hurtowni MADA</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Szacowane GMV Allegro</span>
            <div class="kpi-icon"><i class="fa-solid fa-coins"></i></div>
          </div>
          <div class="kpi-value">324 850 zł</div>
          <div class="kpi-subtitle">Wartość rynkowa całego asortymentu</div>
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
            <h3><i class="fa-solid fa-chart-pie"></i> Udział Marek w Katalogu</h3>
            <span class="badge badge-primary">6 Marek</span>
          </div>
          <div class="chart-container">
            <canvas id="brandChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3><i class="fa-solid fa-chart-column"></i> Stan Magazynowy MADA wg Marek (sztuki)</h3>
            <span class="badge badge-success">Łącznie {total_stock:,} szt.</span>
          </div>
          <div class="chart-container">
            <canvas id="stockChart"></canvas>
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

    <!-- TAB 2: CATALOG -->
    <section id="tab-catalog" class="tab-pane">
      <div class="filter-panel">
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="catalogSearch" placeholder="Szukaj po nazwie, modelu (np. K496, 1135), marce..." oninput="filterCatalog()">
        </div>

        <div class="filter-group">
          <select id="brandFilter" class="filter-select" onchange="filterCatalog()">
            <option value="">Wszystkie Marki (6)</option>
            <option value="Gaia">Gaia (22)</option>
            <option value="Ava">Ava (16)</option>
            <option value="Gorsenia">Gorsenia (12)</option>
            <option value="Mefemi">Mefemi (6)</option>
            <option value="Julimex">Julimex (2)</option>
            <option value="Natura Intimo">Natura Intimo (1)</option>
          </select>

          <select id="catFilter" class="filter-select" onchange="filterCatalog()">
            <option value="">Wszystkie Kategorie</option>
            <option value="76170">Biustonosze (76170)</option>
            <option value="76171">Figi i majtki (76171)</option>
          </select>

          <select id="stockFilter" class="filter-select" onchange="filterCatalog()">
            <option value="">Wszystkie Stany</option>
            <option value="INSTOCK">Dostępne w hurtowni (>5)</option>
            <option value="LOWSTOCK">Ostatnie sztuki (<5)</option>
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
              <th>Kategoria Allegro</th>
              <th>Koszt MADA (Netto)</th>
              <th>Sugerowana Cena</th>
              <th>Prowizja Allegro</th>
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

    <!-- TAB 3: SIMULATOR -->
    <section id="tab-simulator" class="tab-pane">
      <div class="simulator-card">
        <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.8rem; color: var(--primary); margin-bottom: 0.5rem;">
          <i class="fa-solid fa-calculator"></i> Interaktywny Symulator Marży i Prowizji Allegro
        </h2>
        <p style="color: var(--text-muted); margin-bottom: 2rem;">
          Przetestuj rentowność sprzedaży na Allegro w kategorii Bielizna Damska. Zobacz, jak wysokość narzutu wpływa na cenę rynkową i zysk netto.
        </p>

        <div class="calc-row">
          <div class="calc-controls">
            <div class="form-group">
              <label>
                <span>Wybierz produkt z katalogu</span>
              </label>
              <select id="simProductSelect" class="filter-select" style="width: 100%;" onchange="onSimProductChange()">
                <!-- Populated via JS -->
              </select>
            </div>

            <div class="form-group">
              <label>
                <span>Cena hurtowa MADA (Netto PLN):</span>
                <strong id="simNettoVal">65.00 zł</strong>
              </label>
              <input type="range" id="simNettoInput" min="20" max="150" step="1" value="65" class="slider-input" oninput="runSimulation()">
            </div>

            <div class="form-group">
              <label>
                <span>Docelowy Narzut / Marża (%):</span>
                <strong id="simMarginVal">35%</strong>
              </label>
              <input type="range" id="simMarginInput" min="15" max="65" step="1" value="35" class="slider-input" oninput="runSimulation()">
            </div>

            <div class="form-group">
              <label>
                <span>Prowizja Allegro w kategorii Bielizna (%):</span>
                <strong id="simFeeVal">11.5%</strong>
              </label>
              <input type="range" id="simFeeInput" min="8" max="18" step="0.5" value="11.5" class="slider-input" oninput="runSimulation()">
            </div>

            <div class="form-group">
              <label>
                <span>Współfinansowanie Allegro Smart! i opakowanie:</span>
                <strong id="simSmartVal">4.00 zł</strong>
              </label>
              <input type="range" id="simSmartInput" min="0" max="10" step="0.5" value="4.0" class="slider-input" oninput="runSimulation()">
            </div>
          </div>

          <div class="calc-results">
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

            <div style="margin-top: 1.5rem; padding: 1rem; background: #ffffff; border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-size: 0.8rem; color: var(--text-muted);">
              💡 <em>Wskazówka CEO: Przy cenie powyżej 45.00 zł oferta kwalifikuje się do bezpłatnej dostawy Allegro Smart!, co statystycznie zwiększa konwersję o ponad 140%.</em>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 4: WATCHDOG -->
    <section id="tab-watchdog" class="tab-pane">
      <div class="simulator-card">
        <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.8rem; color: var(--primary); margin-bottom: 0.5rem;">
          <i class="fa-solid fa-shield-halved"></i> Strażnik Magazynu & Anti-Overselling Watchdog
        </h2>
        <p style="color: var(--text-muted); margin-bottom: 2rem;">
          Allegro rygorystycznie ocenia Jakość Sprzedaży (wskaźnik anulowanych zamówień przez brak towaru). Nasz silnik automatycznie chroni Twoje konto przed sprzedażą produktów wyprzedanych w hurtowni MADA.
        </p>

        <div class="kpi-grid" style="margin-bottom: 2rem;">
          <div class="kpi-card success">
            <div class="kpi-header">
              <span class="kpi-title">Bezpieczny Magazyn</span>
              <div class="kpi-icon"><i class="fa-solid fa-check"></i></div>
            </div>
            <div class="kpi-value" id="watchdogSafeCount">56 modeli</div>
            <div class="kpi-subtitle">Stan w MADA powyżej 5 sztuk</div>
          </div>

          <div class="kpi-card" style="border-left: 4px solid var(--warning);">
            <div class="kpi-header">
              <span class="kpi-title">Ostrzeżenie o Końcówkach</span>
              <div class="kpi-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
            </div>
            <div class="kpi-value" id="watchdogWarnCount">3 modele</div>
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

        <div style="background: var(--bg-cream); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem;">
          <h4 style="color: var(--primary); font-size: 1.05rem; margin-bottom: 0.75rem;">
            <i class="fa-solid fa-gears"></i> Aktywne Reguły Ochrony:
          </h4>
          <ul style="padding-left: 1.25rem; font-size: 0.9rem; color: var(--text-main); line-height: 1.8;">
            <li><strong>Reguła Zero-Backorders (P0):</strong> Jeśli stan wariantu w pliku `products.xml` z MADA spadnie do 0, skrypt automatycznie wysyła request do Allegro API zamykający ofertę (`status: ENDED`).</li>
            <li><strong>Bufor Bezpieczeństwa (1 sztuka):</strong> Dla rozmiarów o stanie hurtowym poniżej 3 sztuk, oferta na Allegro wystawiana jest z ilością pomniejszoną o 1, aby uniknąć jednoczesnego zakupu w MADA przez innego hurtownika.</li>
            <li><strong>Czas Wysyłki (Dispatch Time):</strong> Ustawiony bezpiecznie na <strong>24 godziny</strong> (dla zamówień złożonych do 13:00 odbiór paczki z MADA w tym samym dniu roboczym).</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- TAB 5: EXPORT -->
    <section id="tab-export" class="tab-pane">
      <div class="simulator-card">
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
          <button class="btn btn-outline" style="background: var(--primary); color: #fff;" onclick="downloadAllegroJson()">
            <i class="fa-solid fa-code"></i> Pobierz Paczkę JSON REST API
          </button>
          <button class="btn btn-outline" style="color: var(--primary); border-color: var(--primary);" onclick="copySamplePayload()">
            <i class="fa-solid fa-copy"></i> Kopiuj Przykładowy JSON Oferty
          </button>
        </div>

        <h4 style="font-size: 1rem; color: var(--primary); margin-bottom: 0.5rem;">Podgląd Payloadu Allegro REST API (POST /sale/product-offers):</h4>
        <div class="code-box" id="jsonPreviewBox">
          // Generowanie podglądu...
        </div>
      </div>
    </section>

    <!-- TAB 6: GUIDE -->
    <section id="tab-guide" class="tab-pane">
      <div class="simulator-card">
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

          <div style="background: var(--bg-cream); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem;">
            <h4 style="color: var(--primary); font-size: 1rem; margin-bottom: 0.5rem;"><i class="fa-solid fa-key"></i> 4. Allegro REST API Keys</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.6;">
              1. Zaloguj się w <em>apps.developer.allegro.pl</em><br>
              2. Zarejestruj nową aplikację (typ: REST API)<br>
              3. Skopiuj <code>Client ID</code> oraz <code>Client Secret</code> do pliku <code>.env</code>
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

    // Toast function
    function showToast(msg) {{
      const t = document.getElementById('hubToast');
      t.innerText = msg;
      t.style.display = 'block';
      setTimeout(() => {{ t.style.display = 'none'; }}, 3000);
    }}

    // Tab switcher
    function switchTab(tabId) {{
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

      const targetPane = document.getElementById('tab-' + tabId);
      if (targetPane) targetPane.classList.add('active');

      const targetBtn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.getAttribute('onclick').includes(tabId));
      if (targetBtn) targetBtn.classList.add('active');
    }}

    // Render Table
    function renderCatalogTable(products) {{
      const tbody = document.getElementById('catalogTableBody');
      tbody.innerHTML = '';

      products.forEach(p => {{
        const tr = document.createElement('tr');
        const imgUrl = p.images && p.images.length > 0 ? p.images[0] : 'https://placehold.co/50x60/f5eedc/4a1224?text=Foto';
        
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
            <span class="badge badge-primary">${{p.allegroCategoryId}}</span><br>
            <span style="font-size: 0.72rem; color: var(--text-muted);">${{p.allegroCategoryName.split(' > ').pop()}}</span>
          </td>
          <td>
            <strong>${{p.pricing.madaNetto.toFixed(2)}} zł</strong><br>
            <span style="font-size: 0.75rem; color: var(--text-muted);">z VAT: ${{p.pricing.madaBrutto.toFixed(2)}} zł</span>
          </td>
          <td>
            <strong style="color: var(--primary); font-size: 0.95rem;">${{p.pricing.targetPrice.toFixed(2)}} zł</strong>
          </td>
          <td style="color: var(--allegro-orange); font-weight: 600;">
            ${{p.pricing.allegroFee.toFixed(2)}} zł
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

    // Filter catalog
    function filterCatalog() {{
      const query = document.getElementById('catalogSearch').value.toLowerCase().trim();
      const brand = document.getElementById('brandFilter').value;
      const cat = document.getElementById('catFilter').value;
      const stock = document.getElementById('stockFilter').value;

      currentFiltered = CATALOG_DATA.products.filter(p => {{
        const matchQuery = !query || p.wcName.toLowerCase().includes(query) || p.model.toLowerCase().includes(query) || p.allegroTitle.toLowerCase().includes(query);
        const matchBrand = !brand || p.brand === brand;
        const matchCat = !cat || p.allegroCategoryId === cat;
        const matchStock = !stock || p.stockStatus === stock;
        return matchQuery && matchBrand && matchCat && matchStock;
      }});

      renderCatalogTable(currentFiltered);
    }}

    // Open Modal
    function openProductModal(productId) {{
      const p = CATALOG_DATA.products.find(item => item.id === productId);
      if (!p) return;

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
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
              Kategoria: <strong>${{p.allegroCategoryName}} (ID: ${{p.allegroCategoryId}})</strong>
            </div>

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

        <h4 style="color: var(--primary); font-size: 1rem; margin-bottom: 0.5rem;">
          <i class="fa-solid fa-list-check"></i> Wymagane Parametry Allegro (Auto-Wypełnione):
        </h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; font-size: 0.8rem; margin-bottom: 1.5rem;">
          ${{p.allegroParameters.map(param => `
            <div style="background: var(--bg-cream); padding: 0.4rem 0.6rem; border-radius: 4px; border: 1px solid var(--border-color);">
              <span style="color: var(--text-muted);">${{param.name}}:</span> <strong>${{param.value}}</strong>
            </div>
          `).join('')}}
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

    // Copy to clipboard helper
    function copyText(txt, successMsg) {{
      navigator.clipboard.writeText(txt).then(() => {{
        showToast(successMsg || 'Skopiowano do schowka!');
      }}).catch(err => {{
        showToast('Skopiowano: ' + txt.substring(0, 20) + '...');
      }});
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

    // Download CSV
    function downloadAllegroCsv() {{
      let csvContent = "Sygnatura / SKU;Tytuł oferty;Kategoria Allegro ID;Cena Kup Teraz (PLN);Liczba sztuk;EAN;Marka;Model;Fason;Kolor;Stan;Skład surowcowy\\n";
      
      CATALOG_DATA.products.forEach(p => {{
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
            `"${{p.materialComposition.replace(/"/g, '""')}}"`
          ].join(';');
          csvContent += row + "\\n";
        }});
      }});

      const blob = new Blob([csvContent], {{ type: 'text/csv;charset=utf-8;' }});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'NaturaIntimo_Allegro_Wystawianie_2275_SKU.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Rozpoczęto pobieranie pliku CSV dla Allegro!');
    }}

    // Download JSON
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

    function copySamplePayload() {{
      const sample = CATALOG_DATA.products[0];
      const payload = {{
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
      copyText(JSON.stringify(payload, null, 2), 'Skopiowano payload JSON');
    }}

    function triggerRefresh() {{
      showToast('Dane są w pełni zsynchronizowane z plikami hurtowni MADA.');
    }}

    // Initialize Charts & UI on Load
    window.addEventListener('DOMContentLoaded', () => {{
      renderCatalogTable(CATALOG_DATA.products);
      initSimulator();
      runSimulation();

      // Show sample payload in code box
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

      // Chart 1: Brands Pie
      const brandLabels = Object.keys(CATALOG_DATA.brands);
      const brandValues = Object.values(CATALOG_DATA.brands);
      new Chart(document.getElementById('brandChart'), {{
        type: 'doughnut',
        data: {{
          labels: brandLabels,
          datasets: [{{
            data: brandValues,
            backgroundColor: ['#8a3b58', '#4a1224', '#d4af37', '#e5c158', '#682037', '#aa8620']
          }}]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{ legend: {{ position: 'right' }} }}
        }}
      }});

      // Chart 2: Stock Bar
      const brandStock = {{}};
      CATALOG_DATA.products.forEach(p => {{
        brandStock[p.brand] = (brandStock[p.brand] || 0) + p.totalStock;
      }});
      new Chart(document.getElementById('stockChart'), {{
        type: 'bar',
        data: {{
          labels: Object.keys(brandStock),
          datasets: [{{
            label: 'Liczba sztuk w MADA',
            data: Object.values(brandStock),
            backgroundColor: '#4a1224',
            borderRadius: 6
          }}]
        }},
        options: {{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {{ legend: {{ display: false }} }}
        }}
      }});

      // Chart 3: Cups Bar
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

      // Chart 4: Pricing Breakdown Pie
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

    # Save to desktop
    with open(DESKTOP_HTML, 'w', encoding='utf-8') as f:
        f.write(html_content)

    # Save to artifact
    os.makedirs(ARTIFACT_DIR, exist_ok=True)
    with open(ARTIFACT_HTML, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"✅ Dashboard generated successfully!")
    print(f"🖥️ Desktop Path: {DESKTOP_HTML}")
    print(f"📂 Artifact Path: {ARTIFACT_HTML}")

if __name__ == '__main__':
    build_dashboard()
