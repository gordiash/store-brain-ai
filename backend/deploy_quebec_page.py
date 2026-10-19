import os, json, requests
from requests.auth import HTTPBasicAuth

# 1. Load env
env = {}
with open('.env') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip('\"\'')

wp_user = env.get('WP_ADMIN_USER')
wp_pass = env.get('WP_APP_PASSWORD')
auth = HTTPBasicAuth(wp_user, wp_pass)
base_url = 'https://naturaintimo.com'

# 2. Build Quebec French Page HTML Content
quebec_html = """<style>
.entry-header, .ast-breadcrumbs-wrapper { display: none !important; }
.site-content > .ast-container { max-width: 100% !important; padding: 0 !important; }
.entry-content { margin: 0 !important; }
.ni-qc { --ink: #30252b; --rose: #8a3b58; --blush: #fbf7f5; --cream: #fffaf7; --gold: #d4af37; color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
.ni-qc * { box-sizing: border-box; }
.ni-qc-hero { padding: clamp(60px, 8vw, 110px) 24px; background: linear-gradient(135deg, #fffaf7 0%, #f6ecef 55%, #eddde2 100%); border-radius: 0 0 36px 36px; text-align: center; }
.ni-qc-kicker { display: inline-flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.16em; font-size: 0.8rem; font-weight: 700; color: #8a3b58; background: rgba(138,59,88,0.1); padding: 5px 14px; border-radius: 20px; margin-bottom: 16px; }
.ni-qc-hero h1 { font-size: clamp(2.2rem, 5.5vw, 4.2rem); line-height: 1.08; max-width: 950px; margin: 0 auto 20px; color: #2d1822; font-family: Georgia, serif; font-weight: 700; }
.ni-qc-lead { font-size: 1.15rem; line-height: 1.7; max-width: 760px; margin: 0 auto 30px; color: #55414c; }
.ni-qc-btn { display: inline-block; padding: 14px 28px; margin: 6px; border-radius: 999px; text-decoration: none !important; font-weight: 700; font-size: 0.95rem; transition: all 0.25s; }
.ni-qc-btn-primary { background: #4a1224; color: #ffffff !important; box-shadow: 0 4px 15px rgba(74,18,36,0.25); }
.ni-qc-btn-primary:hover { background: #6b1b34; transform: translateY(-2px); }
.ni-qc-btn-secondary { border: 1.5px solid #4a1224; color: #4a1224 !important; background: transparent; }
.ni-qc-btn-secondary:hover { background: #4a1224; color: #ffffff !important; }
.ni-qc-lang-bar { display: inline-flex; align-items: center; gap: 8px; margin-top: 24px; padding: 6px 16px; background: #ffffff; border-radius: 20px; border: 1px solid #ebdcd5; font-size: 0.85rem; font-weight: 600; }
.ni-qc-lang-bar a { color: #8a3b58; text-decoration: none; }
.ni-qc-lang-bar a:hover { text-decoration: underline; }
.ni-qc-wrap { max-width: 1180px; margin: auto; padding: 64px 24px; }
.ni-qc-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 28px; }
.ni-qc-perk { padding: 26px 20px; border-radius: 18px; background: #ffffff; border: 1px solid #ebdcd5; box-shadow: 0 4px 16px rgba(0,0,0,0.03); text-align: center; }
.ni-qc-perk-icon { font-size: 2rem; margin-bottom: 12px; }
.ni-qc-perk h3 { font-size: 1.05rem; font-weight: 700; margin: 0 0 8px; color: #2d1822; }
.ni-qc-perk p { font-size: 0.88rem; line-height: 1.55; color: #63505a; margin: 0; }
.ni-qc-table-box { background: #ffffff; border-radius: 24px; border: 1px solid #ebdcd5; padding: 36px 30px; margin-top: 40px; box-shadow: 0 8px 30px rgba(0,0,0,0.04); }
.ni-qc-table { width: 100%; border-collapse: collapse; text-align: center; font-size: 0.92rem; margin-top: 18px; }
.ni-qc-table th { background: #fbf7f5; padding: 12px; font-weight: 700; color: #4a1224; border: 1px solid #ebdcd5; }
.ni-qc-table td { padding: 12px; border: 1px solid #ebdcd5; color: #30252b; }
.ni-qc-table tr:hover { background: #fdfaf8; }
.ni-qc-ceta-box { background: linear-gradient(135deg, #4a1224 0%, #2b0b15 100%); color: #ffffff; border-radius: 24px; padding: 40px 32px; margin-top: 48px; }
.ni-qc-ceta-box h2 { color: #ffffff; font-family: Georgia, serif; font-size: 1.8rem; margin-top: 0; }
.ni-qc-ceta-box p { color: #f4e8ec; line-height: 1.7; font-size: 1rem; max-width: 820px; }
.ni-qc-legal { background: #fbf7f5; border-radius: 18px; border: 1px solid #ebdcd5; padding: 28px 24px; margin-top: 40px; font-size: 0.85rem; color: #63505a; line-height: 1.6; }
.ni-qc-legal h4 { font-size: 0.95rem; color: #2d1822; font-weight: 700; margin-top: 0; }
@media (max-width: 900px) {
  .ni-qc-grid-4 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .ni-qc-grid-4 { grid-template-columns: 1fr; }
  .ni-qc-wrap { padding: 40px 18px; }
  .ni-qc-table-box { padding: 24px 16px; overflow-x: auto; }
}
</style>

<div class="ni-qc">
  <!-- Hero Section -->
  <section class="ni-qc-hero">
    <div class="ni-qc-kicker">⚜️ Édition Spéciale Québec • Conforme Loi 96</div>
    <h1>Lingerie Européenne Grand Maintien Conçue pour Votre Silhouette</h1>
    <p class="ni-qc-lead">
      Découvrez l'élégance et l'ingénierie du maintien européen pour bonnets profonds (B à M). Façonnée dans nos ateliers réputés en Pologne (Union Européenne), notre lingerie offre un galbe sublime et un soutien sans faille, livrée directement chez vous au Québec par <strong>DHL Express Worldwide</strong>.
    </p>
    <div>
      <a href="/shop/" class="ni-qc-btn ni-qc-btn-primary">Magasiner la Collection (Bonnets B–M)</a>
      <a href="#guide-tailles" class="ni-qc-btn ni-qc-btn-secondary">Guide des Tailles EU ↔ CA</a>
    </div>
    <div class="ni-qc-lang-bar">
      <span>Langue : <strong>Français (Québec)</strong></span>
      <span>•</span>
      <a href="/natura-intimo-canada/">Switch to English (Canada) 🇨🇦</a>
    </div>
  </section>

  <!-- 4 Avantages Clés pour le Québec -->
  <div class="ni-qc-wrap">
    <div style="text-align: center; max-width: 720px; margin: 0 auto;">
      <h2 style="font-family: Georgia, serif; font-size: 2rem; color: #2d1822; margin: 0 0 10px;">Pourquoi Choisir Natura Intimo au Québec ?</h2>
      <p style="color: #63505a; font-size: 1rem; line-height: 1.6;">Une expérience d'achat haut de gamme, sans frais cachés et avec une garantie d'ajustement parfaite.</p>
    </div>

    <div class="ni-qc-grid-4">
      <div class="ni-qc-perk">
        <div class="ni-qc-perk-icon">✈️</div>
        <h3>Livraison Express DHL</h3>
        <p>Livraison sécurisée et rapide en <strong>2 à 4 jours ouvrables</strong> partout au Québec (Montréal, Québec, Gatineau, Sherbrooke et régions).</p>
      </div>

      <div class="ni-qc-perk">
        <div class="ni-qc-perk-icon">🛡️</div>
        <h3>0% de Droits de Douane</h3>
        <p>En vertu de l'Accord CETA / AECG entre le Canada et l'Union Européenne, nos pièces certifiées fabriquées en Pologne sont exemptes de droits de douane.</p>
      </div>

      <div class="ni-qc-perk">
        <div class="ni-qc-perk-icon">🔄</div>
        <h3>Premier Échange Gratuit</h3>
        <p>Garantie d'ajustement 30 jours : si la taille ne vous convient pas parfaitement, le <strong>premier échange de taille est 100% sans frais</strong>.</p>
      </div>

      <div class="ni-qc-perk">
        <div class="ni-qc-perk-icon">✨</div>
        <h3>Économie d'Ensemble 10 $</h3>
        <p>Associez n'importe quel soutien-gorge avec le bas coordonné de votre choix pour profiter d'un rabais instantané de 10 $ à la caisse.</p>
      </div>
    </div>

    <!-- CETA / Accord Libre Échange Box -->
    <div class="ni-qc-ceta-box">
      <h2>Accord Économique et Commercial Global (AECG / CETA)</h2>
      <p>
        Pour toutes nos clientes et tous nos clients du Québec et du Canada, chaque envoi est accompagné de la déclaration officielle d'origine préférentielle européenne. Cela garantit un dédouanement prioritaire et un taux de droit de douane de <strong>0%</strong>. Le prix affiché est transparent, sans mauvaise surprise ni frais de courtage inattendus à la livraison.
      </p>
      <div style="margin-top: 20px; font-size: 0.9rem; color: #e8d0d8;">
        ✓ Expédition directe d'atelier (Olsztyn, Pologne) &nbsp;|&nbsp; ✓ DDP pré-dédouané &nbsp;|&nbsp; ✓ Livraison gratuite dès 200 $ CAD
      </div>
    </div>

    <!-- Guide des Tailles Interactif -->
    <div id="guide-tailles" class="ni-qc-table-box">
      <div style="text-align: center; max-width: 680px; margin: 0 auto;">
        <span style="font-weight: 700; color: #8a3b58; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.8rem;">Précision Brafitting</span>
        <h2 style="font-family: Georgia, serif; font-size: 1.8rem; color: #2d1822; margin: 6px 0 12px;">Guide des Équivalences de Tailles (Europe ↔ Québec/Canada)</h2>
        <p style="color: #63505a; font-size: 0.95rem; line-height: 1.6;">
          Les soutiens-gorge européens sont renommés pour leur maintien supérieur grâce à des tours de dos mesurés en centimètres et des bonnets profonds. Utilisez notre tableau pour trouver votre taille idéale :
        </p>
      </div>

      <h3 style="font-size: 1.1rem; color: #4a1224; margin: 28px 0 10px; font-weight: 700;">1. Tour de Dos (Bande sous le buste)</h3>
      <table class="ni-qc-table">
        <thead>
          <tr>
            <th>Taille Européenne (EU)</th>
            <th>Taille Québécoise / Canadienne (CA / US)</th>
            <th>Tour de sous-poitrine (cm)</th>
            <th>Tour de sous-poitrine (pouces)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>65</strong></td><td><strong>30</strong></td><td>63 – 67 cm</td><td>25 – 26.5 po</td></tr>
          <tr><td><strong>70</strong></td><td><strong>32</strong></td><td>68 – 72 cm</td><td>27 – 28.5 po</td></tr>
          <tr><td><strong>75</strong></td><td><strong>34</strong></td><td>73 – 77 cm</td><td>29 – 30.5 po</td></tr>
          <tr><td><strong>80</strong></td><td><strong>36</strong></td><td>78 – 82 cm</td><td>31 – 32.5 po</td></tr>
          <tr><td><strong>85</strong></td><td><strong>38</strong></td><td>83 – 87 cm</td><td>33 – 34.5 po</td></tr>
          <tr><td><strong>90</strong></td><td><strong>40</strong></td><td>88 – 92 cm</td><td>35 – 36.5 po</td></tr>
          <tr><td><strong>95</strong></td><td><strong>42</strong></td><td>93 – 97 cm</td><td>37 – 38.5 po</td></tr>
          <tr><td><strong>100</strong></td><td><strong>44</strong></td><td>98 – 102 cm</td><td>39 – 40.5 po</td></tr>
        </tbody>
      </table>

      <h3 style="font-size: 1.1rem; color: #4a1224; margin: 30px 0 10px; font-weight: 700;">2. Équivalences des Bonnets</h3>
      <table class="ni-qc-table">
        <thead>
          <tr>
            <th>Bonnets Européens (EU)</th>
            <th>Équivalence Québec / Canada (CA / US)</th>
            <th>Profil & Maintien Recommandé</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>B, C, D</strong></td><td><strong>B, C, D</strong></td><td>Maintien classique quotidien</td></tr>
          <tr><td><strong>E</strong></td><td><strong>DD</strong></td><td>Bonnets profonds renforcés</td></tr>
          <tr><td><strong>F</strong></td><td><strong>DDD / F</strong></td><td>Projection naturelle et recentrée</td></tr>
          <tr><td><strong>G</strong></td><td><strong>4D / G</strong></td><td>Maintien architectural anti-soulagement épaules</td></tr>
          <tr><td><strong>H, I, J, K</strong></td><td><strong>H, I, J, K</strong></td><td>Structure grand maintien, armatures stables</td></tr>
        </tbody>
      </table>

      <div style="background: #fbf7f5; border-radius: 14px; padding: 18px; margin-top: 24px; border: 1px solid #ebdcd5; font-size: 0.9rem; color: #55414c;">
        💡 <strong>Besoin d'un conseil personnalisé ?</strong> Cliquez sur le bouton <strong>Fit Concierge</strong> en bas à droite de votre écran. Notre conseillère virtuelle <strong>Klara</strong> vous répond instantanément en français pour confirmer votre taille ou vous orienter vers les modèles <em>Gorsenia</em>, <em>Gaia</em> ou <em>Ava</em>.
      </div>
    </div>

    <!-- Mentions Légales Québec / Loi 96 & Loi 25 -->
    <div class="ni-qc-legal">
      <h4>Conformité et Droits des Consommateurs du Québec (Loi 96 et Loi 25)</h4>
      <p>
        Natura Intimo respecte la <em>Charte de la langue française</em> (Loi 96) ainsi que la <em>Loi sur la protection du consommateur</em> du Québec. Les prix sont indiqués de manière transparente. Toutes nos politiques de confidentialité et de gestion des données personnelles sont rigoureusement alignées sur les exigences de la <em>Loi 25</em> du Québec et du RGPD européen.
      </p>
      <p style="margin-bottom: 0;">
        Pour toute assistance en français : <strong>contact@naturaintimo.com</strong> | Atelier : Olsztyn, Pologne (Union Européenne).
      </p>
    </div>

    <!-- Final CTA Banner -->
    <div style="text-align: center; margin-top: 50px;">
      <a href="/shop/" class="ni-qc-btn ni-qc-btn-primary" style="padding: 16px 36px; font-size: 1.05rem;">
        Voir Tous les Modèles Disponibles pour le Québec ➔
      </a>
    </div>

  </div>
</div>
"""

# 3. Create or update page in WordPress
res = requests.get(f'{base_url}/wp-json/wp/v2/pages?slug=quebec', auth=auth)
pages = res.json()

payload = {
    'title': 'Natura Intimo Québec – Lingerie Européenne Grand Maintien',
    'slug': 'quebec',
    'content': quebec_html,
    'status': 'publish'
}

if pages:
    page_id = pages[0]['id']
    r_put = requests.put(f'{base_url}/wp-json/wp/v2/pages/{page_id}', auth=auth, json=payload)
    print(f'✅ Page Québec mise à jour (ID {page_id}) :', r_put.status_code)
else:
    r_post = requests.post(f'{base_url}/wp-json/wp/v2/pages', auth=auth, json=payload)
    page_id = r_post.json().get('id')
    print(f'✅ Page Québec créée avec succès (ID {page_id}) :', r_post.status_code)

# 4. Purge cache
try:
    purge_res = requests.post(f'{base_url}/wp-json/ni/v1/purge-cache', auth=auth)
    print('Purge du cache LiteSpeed :', purge_res.status_code)
except Exception as e:
    pass

print(f'URL publique : {base_url}/quebec/')
