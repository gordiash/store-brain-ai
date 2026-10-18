import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
if (!wpUser || !wpPass) {
  throw new Error('Brak poświadczeń WP_ADMIN_USER lub WP_APP_PASSWORD w .env');
}

const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
const url = process.env.WOOCOMMERCE_URL || 'https://naturaintimo.com';
const headers = {
  'Authorization': 'Basic ' + auth,
  'Content-Type': 'application/json'
};

// ==============================================================================
// 1. Strona Kalkulatora Rozmiarów (Page ID 4513 - /size-guide/)
// ==============================================================================
function buildSizeGuideHtml() {
  return `<style>
body.page-id-4513 .entry-header, body.page-id-4513 .ast-breadcrumbs-wrapper { display: none !important; }
body.page-id-4513 .site-content > .ast-container { max-width: 100% !important; padding: 0 !important; }
body.page-id-4513 .entry-content { margin: 0 !important; }
.ni-help { --ink: #30252b; --rose: #8e4f63; --blush: #f7eef1; --cream: #fffaf7; color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
.ni-help * { box-sizing: border-box; }
.ni-help-hero { padding: 80px 24px; background: linear-gradient(135deg, #fffaf7, #f1dfe5); text-align: center; border-radius: 0 0 40px 40px; }
.ni-help-hero h1 { font-size: clamp(2.4rem, 6vw, 4.4rem); margin: 12px auto 16px; color: var(--ink); font-weight: 800; }
.ni-help-hero p { max-width: 740px; margin: auto; font-size: 1.08rem; line-height: 1.7; color: #5a4852; }
.ni-help-wrap { max-width: 1100px; margin: auto; padding: 50px 24px 70px; }

/* Interactive Calculator Box */
.ni-calc-container { background: #ffffff; border: 2px solid #ebdce1; border-radius: 28px; padding: 40px; box-shadow: 0 14px 40px rgba(48,37,43,0.08); margin-bottom: 60px; }
.ni-calc-title { text-align: center; font-size: 1.9rem; font-weight: 800; color: #30252b; margin: 0 0 8px; }
.ni-calc-sub { text-align: center; font-size: 1rem; color: #6a545e; margin: 0 auto 30px; max-width: 650px; line-height: 1.6; }
.ni-calc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
.ni-calc-field label { display: block; font-weight: 700; font-size: 0.9rem; margin-bottom: 8px; color: #43333d; }
.ni-calc-input { width: 100%; padding: 12px 16px; border: 1.5px solid #dfcfd4; border-radius: 12px; font-size: 1.05rem; outline: none; transition: border-color 0.2s; background: #fffaf7; }
.ni-calc-input:focus { border-color: #8e4f63; background: #fff; }
.ni-unit-toggle { display: flex; justify-content: center; gap: 8px; margin-bottom: 24px; }
.ni-unit-btn { padding: 8px 20px; border-radius: 999px; border: 1.5px solid #dfcfd4; background: #fff; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: all 0.2s; color: #43333d; }
.ni-unit-btn.active { background: #30252b; color: #fff; border-color: #30252b; }
.ni-btn-calculate { display: block; width: 100%; max-width: 380px; margin: 0 auto; padding: 15px 30px; background: #8e4f63; color: #fff; border: none; border-radius: 999px; font-size: 1.08rem; font-weight: 700; cursor: pointer; transition: all 0.22s; box-shadow: 0 6px 20px rgba(142,79,99,0.3); text-align: center; }
.ni-btn-calculate:hover { background: #30252b; transform: translateY(-2px); box-shadow: 0 8px 26px rgba(48,37,43,0.3); }

/* Results Card */
.ni-calc-results { display: none; margin-top: 36px; padding: 30px; background: #fffaf7; border: 1.5px solid #ebdce1; border-radius: 20px; animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.ni-res-header { text-align: center; margin-bottom: 24px; }
.ni-res-badge { display: inline-block; background: #e8d0d7; color: #823a54; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 12px; border-radius: 999px; margin-bottom: 6px; }
.ni-res-main-size { font-size: 2.6rem; font-weight: 900; color: #30252b; margin: 0; line-height: 1.1; }
.ni-res-equiv { font-size: 1.15rem; color: #8e4f63; font-weight: 700; margin-top: 4px; }
.ni-res-details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 24px; border-top: 1px dashed #e2ced3; padding-top: 24px; }
.ni-res-box { background: #fff; border: 1px solid #ebdce1; border-radius: 14px; padding: 18px; }
.ni-res-box-title { font-size: 0.82rem; font-weight: 700; text-transform: uppercase; color: #8e4f63; margin-bottom: 6px; }
.ni-res-box-content { font-size: 0.95rem; line-height: 1.55; color: #43333d; }
.ni-res-cta-row { text-align: center; margin-top: 26px; }
.ni-res-cta-btn { display: inline-block; padding: 12px 28px; background: #30252b; color: #fff !important; text-decoration: none !important; font-weight: 700; font-size: 0.95rem; border-radius: 999px; transition: all 0.2s; }
.ni-res-cta-btn:hover { background: #8e4f63; transform: translateY(-2px); }

/* Static Tables */
.ni-table-wrap { overflow-x: auto; margin-bottom: 40px; border-radius: 16px; border: 1px solid #ebdce1; box-shadow: 0 4px 16px rgba(0,0,0,0.02); }
.ni-size-table { width: 100%; border-collapse: collapse; background: #fff; text-align: left; }
.ni-size-table th { background: #30252b; color: #fff; padding: 12px 16px; font-weight: 700; font-size: 0.88rem; text-transform: uppercase; letter-spacing: 0.04em; }
.ni-size-table td { padding: 12px 16px; border-bottom: 1px solid #f0e6e8; font-size: 0.95rem; color: #43333d; }
.ni-size-table tr:nth-child(even) td { background: #fffaf7; }
.ni-badge-eu { display: inline-block; padding: 3px 10px; background: #f4e2e7; color: #8e4f63; border-radius: 6px; font-weight: 700; font-size: 0.88rem; }
.ni-badge-us { display: inline-block; padding: 3px 10px; background: #eaf1f8; color: #1e5288; border-radius: 6px; font-weight: 700; font-size: 0.88rem; }

.ni-help-cta { margin-top: 50px; padding: 44px 24px; border-radius: 26px; background: #30252b; color: #fff; text-align: center; }
.ni-help-cta h2 { color: #fff; font-size: 1.8rem; margin: 0 0 10px; }
.ni-help-cta p { color: #f0e4e8; max-width: 600px; margin: 0 auto 20px; line-height: 1.6; }
.ni-help-cta a { display: inline-block; padding: 12px 28px; border-radius: 999px; background: #fff; color: #30252b; text-decoration: none; font-weight: 700; }

@media (max-width: 768px) {
  .ni-calc-grid { grid-template-columns: 1fr; }
  .ni-res-details-grid { grid-template-columns: 1fr; }
  .ni-calc-container { padding: 24px 18px; }
}
</style>

<main class="ni-help">
<section class="ni-help-hero">
<div style="text-transform: uppercase; letter-spacing: .16em; font-size: .8rem; font-weight: 700; color: #8e4f63; margin-bottom: 10px;">Brafitting Studio</div>
<h1>Bra Size Guide &amp; Interactive Converter</h1>
<p>Translate your body measurements or standard US/UK bra size into exact European sizing for Gorsenia, Gaia, Ava, and Mefemi collections.</p>
</section>

<section class="ni-help-wrap">

<!-- Interactive Calculator Widget -->
<div class="ni-calc-container" id="niSizeCalculator">
  <div class="ni-calc-title">✨ Interactive European Bra Size Calculator</div>
  <div class="ni-calc-sub">Enter your snug ribcage and fullest bust measurements. Our brafitting algorithm automatically calculates your primary European size, US/UK equivalent, sister sizes, and brand-specific fit tips.</div>

  <div class="ni-unit-toggle">
    <button type="button" class="ni-unit-btn active" id="niBtnUnitInches" onclick="niSetUnit('in')">Inches (in)</button>
    <button type="button" class="ni-unit-btn" id="niBtnUnitCm" onclick="niSetUnit('cm')">Centimeters (cm)</button>
  </div>

  <div class="ni-calc-grid">
    <div class="ni-calc-field">
      <label for="niUnderbustInput">1. Snug Underbust Band (<span class="ni-unit-label">inches</span>):</label>
      <input type="number" step="0.5" id="niUnderbustInput" class="ni-calc-input" placeholder="e.g. 30" />
      <small style="color:#777; font-size:0.78rem;">Measure directly under breasts, exhaled and snug.</small>
    </div>
    <div class="ni-calc-field">
      <label for="niBustInput">2. Fullest Bust Reading (<span class="ni-unit-label">inches</span>):</label>
      <input type="number" step="0.5" id="niBustInput" class="ni-calc-input" placeholder="e.g. 38" />
      <small style="color:#777; font-size:0.78rem;">Measure loosely around the fullest part of bust.</small>
    </div>
    <div class="ni-calc-field">
      <label for="niBrandSelect">3. Preferred Brand (Optional):</label>
      <select id="niBrandSelect" class="ni-calc-input">
        <option value="all">All Brands (General Advice)</option>
        <option value="gorsenia">Gorsenia (Full-Bust Projection)</option>
        <option value="gaia">Gaia (Semi-Soft / Soft True-to-Size)</option>
        <option value="ava">Ava (Side-Support & Centering)</option>
        <option value="mefemi">Mefemi (Push-Up & Deep Plunge)</option>
      </select>
      <small style="color:#777; font-size:0.78rem;">Tailors fit advice to brand wire nuances.</small>
    </div>
  </div>

  <button type="button" class="ni-btn-calculate" id="niBtnCalculate" onclick="niCalculateSize()">Calculate My European Size →</button>

  <div id="niCalcResults" class="ni-calc-results">
    <div class="ni-res-header">
      <span class="ni-res-badge">Recommended European Size</span>
      <h3 class="ni-res-main-size" id="niResEuSize">EU 75G</h3>
      <div class="ni-res-equiv" id="niResUsEquiv">US Equivalent: US 34G (UK 34F)</div>
    </div>

    <div class="ni-res-details-grid">
      <div class="ni-res-box">
        <div class="ni-res-box-title">🔄 Recommended Sister Sizes:</div>
        <div class="ni-res-box-content" id="niResSisterSizes">
          • Looser Band: <strong>EU 80F (US 36DDD)</strong><br>
          • Snugger Band: <strong>EU 70H (US 32H)</strong>
        </div>
      </div>
      <div class="ni-res-box">
        <div class="ni-res-box-title">💡 Brand Fit &amp; Wire Nuance:</div>
        <div class="ni-res-box-content" id="niResBrandTips">
          Gorsenia uses firm, supportive bands and narrow, deep underwires. If you are between band sizes, choose the looser sister size for optimal comfort.
        </div>
      </div>
    </div>

    <div class="ni-res-cta-row">
      <a href="/full-bust-bras/" class="ni-res-cta-btn">Browse Full-Bust Bras In My Size →</a>
    </div>
  </div>
</div>

<!-- Static Size Reference Tables -->
<div style="text-align: center; margin-bottom: 24px;">
  <h2 style="font-size: 1.8rem; color: #30252b; margin-bottom: 8px;">Standard European vs. US Reference Charts</h2>
  <p style="color: #665; max-width: 680px; margin: 0 auto;">European lingerie uses precise centimetre band increments and true-to-bust cup progression. Use the charts below to translate your standard US size to the correct EU size.</p>
</div>

<h3 style="color: #823a54; font-size: 1.3rem; margin-bottom: 12px;">1. Bra Band Conversion (Underbust)</h3>
<div class="ni-table-wrap">
<table class="ni-size-table">
<thead>
<tr>
<th>EU / Polish Size (On Tag)</th>
<th>US / UK Band Size</th>
<th>Underbust Range (cm)</th>
<th>Underbust Range (inches)</th>
</tr>
</thead>
<tbody>
<tr><td><span class="ni-badge-eu">65</span></td><td><span class="ni-badge-us">30</span></td><td>63 – 67 cm</td><td>25 – 26.5 in</td></tr>
<tr><td><span class="ni-badge-eu">70</span></td><td><span class="ni-badge-us">32</span></td><td>68 – 72 cm</td><td>27 – 28.5 in</td></tr>
<tr><td><span class="ni-badge-eu">75</span></td><td><span class="ni-badge-us">34</span></td><td>73 – 77 cm</td><td>29 – 30.5 in</td></tr>
<tr><td><span class="ni-badge-eu">80</span></td><td><span class="ni-badge-us">36</span></td><td>78 – 82 cm</td><td>31 – 32.5 in</td></tr>
<tr><td><span class="ni-badge-eu">85</span></td><td><span class="ni-badge-us">38</span></td><td>83 – 87 cm</td><td>33 – 34.5 in</td></tr>
<tr><td><span class="ni-badge-eu">90</span></td><td><span class="ni-badge-us">40</span></td><td>88 – 92 cm</td><td>35 – 36.5 in</td></tr>
<tr><td><span class="ni-badge-eu">95</span></td><td><span class="ni-badge-us">42</span></td><td>93 – 97 cm</td><td>37 – 38.5 in</td></tr>
<tr><td><span class="ni-badge-eu">100</span></td><td><span class="ni-badge-us">44</span></td><td>98 – 102 cm</td><td>39 – 40.5 in</td></tr>
<tr><td><span class="ni-badge-eu">105</span></td><td><span class="ni-badge-us">46</span></td><td>103 – 107 cm</td><td>41 – 42.5 in</td></tr>
<tr><td><span class="ni-badge-eu">110</span></td><td><span class="ni-badge-us">48</span></td><td>108 – 112 cm</td><td>43 – 44.5 in</td></tr>
<tr><td><span class="ni-badge-eu">115</span></td><td><span class="ni-badge-us">50</span></td><td>113 – 117 cm</td><td>45 – 46.5 in</td></tr>
</tbody>
</table>
</div>

<h3 style="color: #823a54; font-size: 1.3rem; margin-bottom: 12px;">2. Bra Cup Conversion (Bust – Underbust Difference)</h3>
<div class="ni-table-wrap">
<table class="ni-size-table">
<thead>
<tr>
<th>EU / Polish Cup</th>
<th>US Cup Equivalent</th>
<th>UK Cup Equivalent</th>
<th>Bust Difference (Full Bust minus Underbust)</th>
</tr>
</thead>
<tbody>
<tr><td><span class="ni-badge-eu">B</span></td><td><span class="ni-badge-us">B</span></td><td>B</td><td>14 – 16 cm (5.5 – 6.3 in)</td></tr>
<tr><td><span class="ni-badge-eu">C</span></td><td><span class="ni-badge-us">C</span></td><td>C</td><td>16 – 18 cm (6.3 – 7.1 in)</td></tr>
<tr><td><span class="ni-badge-eu">D</span></td><td><span class="ni-badge-us">D</span></td><td>D</td><td>18 – 20 cm (7.1 – 7.9 in)</td></tr>
<tr><td><span class="ni-badge-eu">E</span></td><td><span class="ni-badge-us">DD</span></td><td>DD</td><td>20 – 22 cm (7.9 – 8.7 in)</td></tr>
<tr><td><span class="ni-badge-eu">F</span></td><td><span class="ni-badge-us">DDD / 3D</span></td><td>E</td><td>22 – 24 cm (8.7 – 9.4 in)</td></tr>
<tr><td><span class="ni-badge-eu">G</span></td><td><span class="ni-badge-us">4D / G</span></td><td>F</td><td>24 – 26 cm (9.4 – 10.2 in)</td></tr>
<tr><td><span class="ni-badge-eu">H</span></td><td><span class="ni-badge-us">H</span></td><td>FF</td><td>26 – 28 cm (10.2 – 11.0 in)</td></tr>
<tr><td><span class="ni-badge-eu">I</span></td><td><span class="ni-badge-us">I</span></td><td>G</td><td>28 – 30 cm (11.0 – 11.8 in)</td></tr>
<tr><td><span class="ni-badge-eu">J</span></td><td><span class="ni-badge-us">J</span></td><td>GG</td><td>30 – 32 cm (11.8 – 12.6 in)</td></tr>
<tr><td><span class="ni-badge-eu">K</span></td><td><span class="ni-badge-us">K</span></td><td>H</td><td>32 – 34 cm (12.6 – 13.4 in)</td></tr>
<tr><td><span class="ni-badge-eu">L</span></td><td><span class="ni-badge-us">L</span></td><td>HH</td><td>34 – 36 cm (13.4 – 14.2 in)</td></tr>
<tr><td><span class="ni-badge-eu">M</span></td><td><span class="ni-badge-us">M</span></td><td>J</td><td>36 – 38 cm (14.2 – 15.0 in)</td></tr>
</tbody>
</table>
</div>

<h3 style="color: #823a54; font-size: 1.3rem; margin-bottom: 12px;">3. Panties &amp; Briefs Size Conversion</h3>
<div class="ni-table-wrap">
<table class="ni-size-table">
<thead>
<tr>
<th>EU / Tag Size</th>
<th>US Size</th>
<th>Waist (cm / in)</th>
<th>Hips (cm / in)</th>
</tr>
</thead>
<tbody>
<tr><td><span class="ni-badge-eu">S (36)</span></td><td><span class="ni-badge-us">US 4 – 6</span></td><td>65 – 70 cm (25.5 – 27.5 in)</td><td>90 – 95 cm (35.5 – 37.5 in)</td></tr>
<tr><td><span class="ni-badge-eu">M (38)</span></td><td><span class="ni-badge-us">US 8 – 10</span></td><td>71 – 76 cm (28 – 30 in)</td><td>96 – 101 cm (38 – 40 in)</td></tr>
<tr><td><span class="ni-badge-eu">L (40)</span></td><td><span class="ni-badge-us">US 12 – 14</span></td><td>77 – 82 cm (30.5 – 32.5 in)</td><td>102 – 107 cm (40.5 – 42 in)</td></tr>
<tr><td><span class="ni-badge-eu">XL (42)</span></td><td><span class="ni-badge-us">US 16</span></td><td>83 – 89 cm (33 – 35 in)</td><td>108 – 113 cm (42.5 – 44.5 in)</td></tr>
<tr><td><span class="ni-badge-eu">2XL (44)</span></td><td><span class="ni-badge-us">US 18</span></td><td>90 – 97 cm (35.5 – 38 in)</td><td>114 – 120 cm (45 – 47.5 in)</td></tr>
<tr><td><span class="ni-badge-eu">3XL (46)</span></td><td><span class="ni-badge-us">US 20</span></td><td>98 – 106 cm (38.5 – 41.5 in)</td><td>121 – 128 cm (48 – 50.5 in)</td></tr>
</tbody>
</table>
</div>

<div class="ni-help-cta">
<h2>Need personalized fit confirmation?</h2>
<p>Send your snug underbust and standing/leaning bust measurements to our certified bra fitters. We will verify your optimal European size and recommend best-fitting styles.</p>
<a href="mailto:support@naturaintimo.com">Email Our Brafitting Specialists</a>
</div>
</section>
</main>

<script>
var niCurrentUnit = 'in';

function niSetUnit(unit) {
  niCurrentUnit = unit;
  document.getElementById('niBtnUnitInches').className = 'ni-unit-btn' + (unit === 'in' ? ' active' : '');
  document.getElementById('niBtnUnitCm').className = 'ni-unit-btn' + (unit === 'cm' ? ' active' : '');
  var labels = document.querySelectorAll('.ni-unit-label');
  labels.forEach(function(l) { l.innerText = unit === 'in' ? 'inches' : 'cm'; });
}

function niCalculateSize() {
  var rawUnderbust = parseFloat(document.getElementById('niUnderbustInput').value);
  var rawBust = parseFloat(document.getElementById('niBustInput').value);
  var brand = document.getElementById('niBrandSelect').value;
  var resultsBox = document.getElementById('niCalcResults');

  if (!rawUnderbust || !rawBust || rawBust <= rawUnderbust) {
    alert('Please enter valid measurements. Your fullest bust measurement must be greater than your underbust.');
    return;
  }

  // Convert to cm if input is in inches
  var underbustCm = niCurrentUnit === 'in' ? rawUnderbust * 2.54 : rawUnderbust;
  var bustCm = niCurrentUnit === 'in' ? rawBust * 2.54 : rawBust;

  // Band calculation (EU increments of 5 cm)
  var bands = [
    { eu: 60, us: 28, min: 0, max: 62.9 },
    { eu: 65, us: 30, min: 63, max: 67.9 },
    { eu: 70, us: 32, min: 68, max: 72.9 },
    { eu: 75, us: 34, min: 73, max: 77.9 },
    { eu: 80, us: 36, min: 78, max: 82.9 },
    { eu: 85, us: 38, min: 83, max: 87.9 },
    { eu: 90, us: 40, min: 88, max: 92.9 },
    { eu: 95, us: 42, min: 93, max: 97.9 },
    { eu: 100, us: 44, min: 98, max: 102.9 },
    { eu: 105, us: 46, min: 103, max: 107.9 },
    { eu: 110, us: 48, min: 108, max: 112.9 },
    { eu: 115, us: 50, min: 113, max: 999 }
  ];

  var matchedBand = bands.find(function(b) { return underbustCm >= b.min && underbustCm <= b.max; }) || bands[2];

  // Cup difference calculation
  var diffCm = bustCm - underbustCm;
  var cups = [
    { eu: 'A', us: 'A', uk: 'A', min: 12, max: 13.9 },
    { eu: 'B', us: 'B', uk: 'B', min: 14, max: 15.9 },
    { eu: 'C', us: 'C', uk: 'C', min: 16, max: 17.9 },
    { eu: 'D', us: 'D', uk: 'D', min: 18, max: 19.9 },
    { eu: 'E', us: 'DD', uk: 'DD', min: 20, max: 21.9 },
    { eu: 'F', us: 'DDD / 3D', uk: 'E', min: 22, max: 23.9 },
    { eu: 'G', us: '4D / G', uk: 'F', min: 24, max: 25.9 },
    { eu: 'H', us: 'H', uk: 'FF', min: 26, max: 27.9 },
    { eu: 'I', us: 'I', uk: 'G', min: 28, max: 29.9 },
    { eu: 'J', us: 'J', uk: 'GG', min: 30, max: 31.9 },
    { eu: 'K', us: 'K', uk: 'H', min: 32, max: 33.9 },
    { eu: 'L', us: 'L', uk: 'HH', min: 34, max: 35.9 },
    { eu: 'M', us: 'M', uk: 'J', min: 36, max: 99 }
  ];

  var cupIdx = 0;
  for (var i = 0; i < cups.length; i++) {
    if (diffCm >= cups[i].min) cupIdx = i;
  }
  var matchedCup = cups[cupIdx];

  var euSizeStr = 'EU ' + matchedBand.eu + matchedCup.eu;
  var usEquivStr = 'US Equivalent: US ' + matchedBand.us + matchedCup.us + ' (UK ' + matchedBand.us + matchedCup.uk + ')';

  // Sister sizing
  var looserBandIdx = bands.indexOf(matchedBand) + 1;
  var tighterBandIdx = bands.indexOf(matchedBand) - 1;
  var looserCupIdx = cupIdx - 1;
  var tighterCupIdx = cupIdx + 1;

  var sisterSizesText = '';
  if (looserBandIdx < bands.length && looserCupIdx >= 0) {
    sisterSizesText += '• Looser Band: <strong>EU ' + bands[looserBandIdx].eu + cups[looserCupIdx].eu + ' (US ' + bands[looserBandIdx].us + cups[looserCupIdx].us + ')</strong><br>';
  }
  if (tighterBandIdx >= 0 && tighterCupIdx < cups.length) {
    sisterSizesText += '• Snugger Band: <strong>EU ' + bands[tighterBandIdx].eu + cups[tighterCupIdx].eu + ' (US ' + bands[tighterBandIdx].us + cups[tighterCupIdx].us + ')</strong>';
  }
  if (!sisterSizesText) {
    sisterSizesText = 'Your calculated size is right on target for standard European fit.';
  }

  // Brand nuances
  var brandNotes = '';
  if (brand === 'gorsenia') {
    brandNotes = '<strong>Gorsenia fit nuance:</strong> Gorsenia bands run firm and narrow, providing strong forward projection for heavy busts. If you fall between band sizes, choose your looser sister size (' + (bands[looserBandIdx] ? bands[looserBandIdx].eu + cups[looserCupIdx].eu : 'up one band') + ').';
  } else if (brand === 'gaia') {
    brandNotes = '<strong>Gaia fit nuance:</strong> Gaia semi-soft bras run true to European size charts. The elastic upper lace comfortably accommodates asymmetric breasts and softer tissue.';
  } else if (brand === 'ava') {
    brandNotes = '<strong>Ava fit nuance:</strong> Ava features side-support slings (SSS) that pull breast tissue inward toward the center, creating a rounded, projected silhouette without underarm spillage.';
  } else if (brand === 'mefemi') {
    brandNotes = '<strong>Mefemi fit nuance:</strong> Mefemi combines soft luxury microfiber with deep plunge underwires, delivering comfortable lift for daytime and evening wear.';
  } else {
    brandNotes = '<strong>European brafitting note:</strong> European bras bear 85% of breast weight in the firm ribcage band, leaving your shoulders completely free from painful strap digging. For matching sets, enjoy our 30-Day Free First Size Exchange.';
  }

  document.getElementById('niResEuSize').innerText = euSizeStr;
  document.getElementById('niResUsEquiv').innerText = usEquivStr;
  document.getElementById('niResSisterSizes').innerHTML = sisterSizesText;
  document.getElementById('niResBrandTips').innerHTML = brandNotes;

  resultsBox.style.display = 'block';
  resultsBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
</script>
`;
}

// ==============================================================================
// 2. Strona Zwrotów (Page ID 4517 - /returns-exchanges/)
// ==============================================================================
function buildRefundPolicyHtml() {
  return `<style>
body.page-id-4517 .entry-header, body.page-id-4517 .ast-breadcrumbs-wrapper { display: none !important; }
body.page-id-4517 .site-content > .ast-container { max-width: 100% !important; padding: 0 !important; }
body.page-id-4517 .entry-content { margin: 0 !important; }
.ni-policy { color: #30252b; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 1.05rem; }
.ni-policy * { box-sizing: border-box; }
.ni-policy-hero { padding: 75px 24px; text-align: center; background: linear-gradient(135deg, #fffaf7, #f4e9ed); border-radius: 0 0 36px 36px; }
.ni-policy-hero h1 { font-size: clamp(2.2rem, 5vw, 4rem); max-width: 850px; margin: 12px auto; color: #2d1e26; font-weight: 800; }
.ni-policy-wrap { max-width: 1050px; margin: auto; padding: 50px 24px 70px; }
.ni-policy-card { padding: 32px; border: 1.5px solid #eadde1; border-radius: 20px; background: #fffcf9; box-shadow: 0 8px 24px rgba(67, 39, 49, 0.04); margin-bottom: 24px; }
.ni-policy-card h2 { margin-top: 0; font-size: 1.4rem; color: #30252b; font-weight: 700; border-bottom: 1px solid #f0e1e6; padding-bottom: 10px; margin-bottom: 14px; }
.ni-policy-card p, .ni-policy-card li { line-height: 1.7; color: #43333d; font-size: 0.98rem; }
.ni-policy-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; background: #ecd3dc; color: #823a54; margin-bottom: 10px; }
.ni-promise-box { background: #fbf5f7; border: 2px solid #8e4f63; border-radius: 22px; padding: 32px; margin-bottom: 30px; box-shadow: 0 10px 28px rgba(142,79,99,0.08); }
.ni-promise-title { font-size: 1.45rem; font-weight: 800; color: #8e4f63; margin-top: 0; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
</style>

<div class="ni-policy">
<section class="ni-policy-hero">
<span class="ni-policy-badge">Customer Fit Promise</span>
<h1>Returns &amp; Exchanges Policy – USA, Canada &amp; EU</h1>
<p style="max-width:700px; margin: 12px auto; font-size:1.1rem; line-height:1.7; color:#5c4752;">
  We want you to feel completely confident, lifted, and supported in your Natura Intimo lingerie. Here is our 30-day guarantee and complimentary size exchange promise.
</p>
</section>

<section class="ni-policy-wrap">

<!-- Fit Promise Box -->
<div class="ni-promise-box">
  <div class="ni-promise-title">✨ The Natura Intimo "Fit Promise": Free First Size Exchange</div>
  <p style="font-size: 1.05rem; line-height: 1.65; color: #30252b; margin: 0 0 14px;">
    <strong>Shopping European bra sizes across the Atlantic should be 100% stress-free.</strong> If your bra or panties size isn't your exact match, we provide a <strong>Free First Size Exchange</strong> on all coordinated sets.
  </p>
  <p style="font-size: 0.98rem; line-height: 1.6; color: #554; margin: 0;">
    Simply contact our brafitting concierge at <a href="mailto:support@naturaintimo.com" style="color:#8e4f63; font-weight:700;">support@naturaintimo.com</a> within 30 days of delivery. We will verify your measurements and dispatch your replacement size with zero additional shipping charges.
  </p>
</div>

<div class="ni-policy-card">
<h2>30-Day Return Window (USA &amp; Canada)</h2>
<p>You have <strong>30 calendar days from the date of confirmed physical delivery</strong> by DHL Express to initiate a return or exchange request for orders delivered to the United States and Canada (and 14 days for Poland &amp; the European Union in compliance with EU Consumer Rights Directive 2011/83/EU).</p>
</div>

<div class="ni-policy-card">
<h2>Strict Intimate Apparel Hygiene Standards</h2>
<p>To comply with international public health standards governing intimate apparel, returned items must satisfy the following condition criteria:</p>
<ul>
  <li><strong>Unworn and Unwashed:</strong> Garments must show zero signs of wear, body scent, deodorant marks, laundry detergent fragrance, or cosmetic transfer.</li>
  <li><strong>Original Tags Attached:</strong> Designer brand tags, size labels, and barcode tags must remain securely attached.</li>
  <li><strong>Protective Hygiene Seals Intact:</strong> Panties, briefs, and bodysuits featuring protective hygiene liners must be completely intact and unpeeled.</li>
  <li><strong>Original Packaging:</strong> Returned in original branded packaging boxes or dust pouches.</li>
</ul>
<p><em>Items that fail hygiene inspection will be returned to the customer at customer's expense or responsibly recycled.</em></p>
</div>

<div class="ni-policy-card">
<h2>How to Initiate an RMA Return</h2>
<p>1. <strong>Email our Care Team:</strong> Contact <a href="mailto:support@naturaintimo.com">support@naturaintimo.com</a> with your order number (e.g. <code>#1234</code>) and the item(s) you wish to return or exchange.</p>
<p>2. <strong>Receive Your RMA Number:</strong> We will issue a Return Merchandise Authorization (RMA) number and detailed return packing slip.</p>
<p>3. <strong>Customs Documentation:</strong> Because parcels return to our European atelier in Poland, mark your shipping label with: <em>"Returned Goods – U.S./Canadian Consumer Return to Polish Exporter, No Commercial Value"</em> to avoid unnecessary import tariff holds.</p>
<p>4. <strong>Return Shipping:</strong> Return shipping postage is the responsibility of the customer (except under our Free First Size Exchange on coordinated sets, or in the rare event of a manufacturing defect).</p>
</div>

<div class="ni-policy-card">
<h2>Fast Refund Processing</h2>
<p>Once your return parcel arrives at our European atelier and passes inspection, your refund is credited back to your original payment method (Visa, Mastercard, Amex, Apple Pay, PayPal) within <strong>3 to 5 business days</strong>. You will receive an automated confirmation email upon processing.</p>
</div>

</section>
</div>
`;
}

// ==============================================================================
// 3. Strona Wysyłki (Page ID 4515 - /shipping-delivery/)
// ==============================================================================
function buildShippingDeliveryHtml() {
  return `<style>
body.page-id-4515 .entry-header, body.page-id-4515 .ast-breadcrumbs-wrapper { display: none !important; }
body.page-id-4515 .site-content > .ast-container { max-width: 100% !important; padding: 0 !important; }
body.page-id-4515 .entry-content { margin: 0 !important; }
.ni-policy { color: #30252b; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
.ni-policy * { box-sizing: border-box; }
.ni-policy-hero { padding: 75px 24px; text-align: center; background: linear-gradient(135deg, #fffaf7, #f4e9ed); border-radius: 0 0 36px 36px; }
.ni-policy-hero h1 { font-size: clamp(2.2rem, 5vw, 4rem); max-width: 850px; margin: 12px auto; color: #2d1e26; font-weight: 800; }
.ni-policy-wrap { max-width: 1050px; margin: auto; padding: 50px 24px 70px; }
.ni-policy-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.ni-policy-card { padding: 32px; border: 1.5px solid #eadde1; border-radius: 20px; background: #fffcf9; box-shadow: 0 8px 24px rgba(67, 39, 49, 0.04); }
.ni-policy-card h2 { margin-top: 0; font-size: 1.4rem; color: #2d1e26; border-bottom: 2px solid #f0e1e6; padding-bottom: 10px; font-weight: 700; margin-bottom: 14px; }
.ni-policy-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; background: #ecd3dc; color: #823a54; margin-bottom: 10px; }
.ni-policy-note { padding: 36px; border-radius: 22px; background: #30252b; color: #fff; text-align: center; margin-top: 36px; box-shadow: 0 12px 30px rgba(48,37,43,0.15); }
@media (max-width: 768px) { .ni-policy-grid { grid-template-columns: 1fr; } .ni-policy-wrap { padding: 35px 20px; } }
</style>

<div class="ni-policy">
<section class="ni-policy-hero">
<span class="ni-policy-badge">Express Transatlantic Logistics</span>
<h1>Shipping &amp; Delivery to USA &amp; Canada</h1>
<p style="max-width:680px; margin: 12px auto; font-size:1.1rem; line-height:1.7; color:#5c4752;">
  All Natura Intimo orders are inspected, verified, and dispatched directly from our European atelier in Olsztyn, Poland via <strong>DHL Express Worldwide</strong> air priority.
</p>
</section>

<section class="ni-policy-wrap">
<div class="ni-policy-grid">

<div class="ni-policy-card">
<h2>✈️ Shipping Tiers &amp; Thresholds</h2>
<p>Ultra-fast express air transit with end-to-end tracking to all 50 U.S. states and Canadian provinces:</p>
<ul style="line-height:1.8; padding-left: 20px;">
  <li><strong>Orders $199.00+ USD:</strong> <span style="color:#27ae60; font-weight:700;">100% FREE All-Inclusive</span> (Free DHL Express + All Customs Duties Covered by Store).</li>
  <li><strong>Orders $150.00 – $198.99 USD:</strong> <span style="color:#27ae60; font-weight:700;">FREE DHL Express Shipping</span> (Flat $14.99 DDP customs processing).</li>
  <li><strong>Orders under $150.00 USD:</strong> Flat rate of <strong>$19.99 USD</strong> via DHL Express (+ $14.99 DDP pre-clearance).</li>
  <li><strong>Canada Orders ($200.00 CAD+):</strong> <span style="color:#27ae60; font-weight:700;">FREE DHL Express</span> (0% CETA preferential tariff). Flat rate $24.99 CAD for smaller orders.</li>
  <li><strong>Minimum Order:</strong> <strong>$0 USD / $0 CAD</strong> (No minimum order required — purchase single bras or accessories).</li>
</ul>
</div>

<div class="ni-policy-card">
<h2>🛡️ Guaranteed DDP (Zero Surprise Fees)</h2>
<p>All U.S. orders are cleared under <strong>Incoterms DDP (Delivered Duty Paid)</strong>:</p>
<p>Every shipment is officially pre-cleared through U.S. Customs and Border Protection (CBP) prior to flight departure. <strong>You will never receive unexpected duty bills, brokerage invoices, or carrier COD fees at your door.</strong> The price displayed at checkout is 100% final and fully transparent (California SB 478 compliant).</p>
</div>

<div class="ni-policy-card">
<h2>⚡ Transit Time &amp; Tracking</h2>
<p>Because your lingerie travels via DHL Express Air Priority:</p>
<ul style="line-height:1.8; padding-left: 20px;">
  <li><strong>Order Preparation:</strong> 24–48 hours (brafitting inspection &amp; packaging).</li>
  <li><strong>Air Transit Time:</strong> <strong>2 to 4 business days</strong> door-to-door anywhere in the continental U.S., Alaska, Hawaii, and Canada.</li>
  <li><strong>Real-Time Tracking:</strong> Automated DHL On Demand Delivery (ODD) notifications via email &amp; SMS to customize delivery times or safe drop-off.</li>
</ul>
</div>

<div class="ni-policy-card">
<h2>🎀 Discreet Luxury Packaging</h2>
<p>Every piece of European lingerie is packaged with privacy and elegance:</p>
<p>Your order arrives in sturdy, tamper-evident protective outer packaging with no external lingerie logos or descriptions, guaranteeing total privacy and protecting delicate European lace and underwires during air transit.</p>
</div>

</div>

<div class="ni-policy-note">
<h2 style="color:#fff; border-bottom:none; margin: 0 0 10px;">Questions About Your Shipment?</h2>
<p style="margin: 0 0 16px; color:#f0e4e8;">Our brafitting and logistics concierge is here to assist with tracking, delivery preferences, or customs inquiries.</p>
<p><a style="color:#fff; background:#8e4f63; padding:10px 24px; border-radius:999px; font-weight:700; text-decoration:none;" href="mailto:support@naturaintimo.com">Contact support@naturaintimo.com</a></p>
</div>
</section>
</div>
`;
}

// ==============================================================================
// 4. Strona Regulaminu (Page ID 4554 - /terms-and-conditions/)
// ==============================================================================
function buildTermsAndConditionsHtml() {
  return `<style>.entry-header,.ast-breadcrumbs-wrapper{display:none}.site-content>.ast-container{max-width:100%;padding:0}.entry-content{margin:0}.ni-legal{--ink:#30252b;--rose:#8e4f63;--blush:#f7eef1;--cream:#fffaf7;color:var(--ink);font-size:1rem;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}.ni-legal *{box-sizing:border-box}.ni-legal-hero{padding:76px 24px;text-align:center;background:linear-gradient(135deg,#fffaf7,#f1dfe5);border-radius:0 0 40px 40px}.ni-legal-hero h1{font-size:clamp(2.3rem,6vw,4.2rem);margin:10px auto 16px;font-weight:800}.ni-legal-hero p{max-width:760px;margin:auto;line-height:1.7;color:#5a4852}.ni-legal-wrap{max-width:980px;margin:auto;padding:56px 24px}.ni-legal section{padding:28px 0;border-bottom:1px solid #eadde1}.ni-legal h2{font-size:1.55rem;margin:0 0 14px;color:#30252b;font-weight:700}.ni-legal p,.ni-legal li{line-height:1.75;color:#43333d}.ni-legal-note{padding:24px;border-radius:18px;background:var(--blush);margin-top:28px;text-align:center}.ni-legal a{color:var(--rose)}@media(max-width:720px){.ni-legal-wrap{padding:40px 20px}.ni-legal-hero{padding:58px 20px}}</style>

<main class="ni-legal">
<header class="ni-legal-hero">
<div style="text-transform:uppercase;letter-spacing:.17em;font-size:.78rem;font-weight:700;color:#93566a">International Sales Agreement</div>
<h1>Terms &amp; Conditions</h1>
<p>These terms govern purchases from Natura Intimo by customers in the United States and Canada. Last updated: October 16, 2026.</p>
</header>

<div class="ni-legal-wrap">
<section>
<h2>1. Seller &amp; Entity Identification</h2>
<p>The online store <strong>https://naturaintimo.com</strong> is operated by <strong>Natura Izabela Jakubczyk</strong>, Polish Tax Identification Number (NIP) <strong>PL7621888669</strong>, REGON 281488660, EORI <strong>PL762188866900000</strong>, registered at ul. Juliana Tuwima 26, 10-747 Olsztyn, Poland. Customer Care: <a href="mailto:support@naturaintimo.com">support@naturaintimo.com</a>, Phone: +48 786 816 805. In these terms, “we”, “us” and “Natura Intimo” refer to the seller.</p>
</section>

<section>
<h2>2. Scope &amp; Customer Agreement</h2>
<p>These Terms apply to all orders placed for delivery to the United States and Canada. By placing an order, you agree to these terms, our <a href="/privacy-policy/">Privacy Policy</a>, and our <a href="/returns-exchanges/">Returns &amp; Exchanges Policy</a>.</p>
</section>

<section>
<h2>3. Products, Fiber Composition &amp; Compliance</h2>
<p>All garments offered by Natura Intimo are authentic designer items manufactured in the Republic of Poland (European Union) by certified heritage ateliers (Gorsenia, Gaia, Ava, Mefemi, Alles). In strict compliance with the U.S. FTC Textile Fiber Products Identification Act and the Canadian Textile Labelling Act, precise fiber percentages and country-of-origin details are provided on every product page and garment label.</p>
</section>

<section>
<h2>4. Pricing, Currency &amp; Transparent Checkout</h2>
<p>Prices are displayed in United States Dollars (USD / US$) for U.S. customers and Canadian Dollars (CAD / C$) for Canadian customers. In accordance with California SB 478 (Honest Pricing Law) and Canadian Competition Act amendments regarding drip pricing, all mandatory shipping, handling, and DDP processing fees are disclosed transparently before order placement with zero hidden surcharges.</p>
</section>

<section>
<h2>5. Shipping &amp; Minimum Order Policy</h2>
<p>Orders are dispatched directly from Poland via <strong>DHL Express Worldwide</strong> (2–4 business days delivery). Standard shipping is $19.99 USD, and orders of <strong>$150 USD or more qualify for FREE DHL Express Shipping</strong> (and $200 CAD for Canada). There is <strong>no minimum order requirement ($0 USD minimum)</strong>.</p>
</section>

<section>
<h2>6. Guaranteed DDP (Delivered Duty Paid) &amp; CETA 0% Duty</h2>
<p>For orders shipped to the United States, Natura Intimo operates under <strong>Incoterms 2020 DDP (Delivered Duty Paid)</strong>. Orders under $199 USD include an all-inclusive $14.99 USD customs &amp; duty pre-clearance charge at checkout, while orders of <strong>$199 USD or more receive 100% complimentary customs duty coverage paid by Natura Intimo</strong>. <strong>No surprise duty bills or carrier COD collection fees will ever be collected upon delivery.</strong> For Canadian orders, products are certified under CETA with an official Origin Declaration guaranteeing <strong>0% preferential customs import duty</strong>.</p>
</section>

<section>
<h2>7. 30-Day Return Window &amp; Free First Size Exchange</h2>
<p>Customers in the United States and Canada enjoy a <strong>30-day return window from the date of confirmed delivery</strong>. In addition, our <strong>"Fit Promise"</strong> provides a complimentary <strong>Free First Size Exchange</strong> on coordinated lingerie sets. Returned garments must be completely unworn, unwashed, in original condition with tags and intact protective hygiene seals.</p>
</section>

<section>
<h2>8. Governing Law &amp; Dispute Resolution</h2>
<p>These terms and purchase agreements are governed by the laws of Poland, without depriving international consumers of mandatory statutory protections available under U.S. state laws or Canadian provincial consumer protection acts. Inquiries should be directed to <a href="mailto:support@naturaintimo.com">support@naturaintimo.com</a>.</p>
</section>

<div class="ni-legal-note">
<strong>Questions before ordering?</strong> Contact our brafitting support team at <a href="mailto:support@naturaintimo.com">support@naturaintimo.com</a>.
</div>
</div>
</main>
`;
}

// ==============================================================================
// 5. Globalne Widgety Stopki (update_global_widgets_usa.js)
// ==============================================================================
async function updateGlobalWidget() {
  console.log('Aktualizuję globalny widget stopki (block-17)...');
  const putWidget = (path, body) => new Promise((resolve) => {
    const postData = JSON.stringify(body);
    const req = https.request('https://naturaintimo.com' + path, {
      method: 'PUT',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode }));
    });
    req.write(postData);
    req.end();
  });

  const fullContent = [
    '<!-- wp:heading {"level":5} -->',
    '<h5 class="wp-block-heading">Legal &amp; Shipping</h5>',
    '<!-- /wp:heading -->',
    '<!-- wp:html -->',
    '<div id="natura-announcement-bar" style="display:none;">',
    '  <div class="announcement-inner" style="display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;">',
    '    <span>✨ <strong>FREE DHL EXPRESS</strong> on orders over $150 USD / $200 CAD</span>',
    '    <span style="opacity:0.6;">|</span>',
    '    <span>🛡️ 100% Guaranteed DDP (No Surprise Fees on Delivery)</span>',
    '    <span style="opacity:0.6;">|</span>',
    '    <span>🔄 30-Day Returns &amp; Free First Size Exchange</span>',
    '  </div>',
    '</div>',
    '<div class="ni-footer-compliance-notice" style="margin-top:14px; font-size:12.5px; color:#5c4752; line-height:1.5;">',
    '  🛡️ <em>Import duties and DDP customs for U.S. orders are pre-cleared. 30-day returns with Free First Size Exchange. Support: <a href="mailto:support@naturaintimo.com" style="color:#5c4752; font-weight:600;">support@naturaintimo.com</a></em>',
    '</div>',
    '<script>',
    '(function() {',
    '  // 1. TOP ANNOUNCEMENT BAR',
    '  function initBar() {',
    '    if (document.getElementById("natura-announcement-bar-inserted")) return;',
    '    var bar = document.getElementById("natura-announcement-bar");',
    '    if (!bar) return;',
    '    bar.id = "natura-announcement-bar-inserted";',
    '    bar.style.display = "block";',
    '    bar.style.backgroundColor = "#2d1e26";',
    '    bar.style.color = "#ffffff";',
    '    bar.style.textAlign = "center";',
    '    bar.style.padding = "9px 16px";',
    '    bar.style.fontSize = "13px";',
    '    bar.style.letterSpacing = "0.03em";',
    '    bar.style.fontWeight = "500";',
    '    bar.style.zIndex = "999999";',
    '    bar.style.position = "relative";',
    '    bar.style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)";',
    '    var header = document.querySelector(".site-header") || document.querySelector("header") || document.getElementById("ast-desktop-header") || document.body.firstChild;',
    '    if (header && header.parentNode) {',
    '      header.parentNode.insertBefore(bar, header);',
    '    } else {',
    '      document.body.insertBefore(bar, document.body.firstChild);',
    '    }',
    '  }',
    '  ',
    '  // 2. PRODUCT PAGE TRUST BADGES',
    '  function initProductEnhancements() {',
    '    var form = document.querySelector(".variations_form");',
    '    if (!form || document.getElementById("ni-size-guide-btn")) return;',
    '    var sizeLabel = document.querySelector(".variations label[for*=\\"size\\"], .variations label[for*=\\"rozmiar\\"]");',
    '    var guideLink = document.createElement("a");',
    '    guideLink.id = "ni-size-guide-btn";',
    '    guideLink.href = "/size-guide/";',
    '    guideLink.target = "_blank";',
    '    guideLink.innerHTML = "📏 Size Guide &amp; US Converter";',
    '    guideLink.style.display = "inline-block";',
    '    guideLink.style.marginLeft = "12px";',
    '    guideLink.style.fontSize = "12.5px";',
    '    guideLink.style.fontWeight = "600";',
    '    guideLink.style.color = "#b86f82";',
    '    guideLink.style.textDecoration = "underline";',
    '    guideLink.style.cursor = "pointer";',
    '    if (sizeLabel) { sizeLabel.appendChild(guideLink); } else { form.parentNode.insertBefore(guideLink, form); }',
    '    ',
    '    if (!document.getElementById("ni-product-trust-badges")) {',
    '      var badges = document.createElement("div");',
    '      badges.id = "ni-product-trust-badges";',
    '      badges.style.marginTop = "24px";',
    '      badges.style.padding = "18px";',
    '      badges.style.background = "#fffaf7";',
    '      badges.style.border = "1px solid #ebdce1";',
    '      badges.style.borderRadius = "12px";',
    '      badges.style.fontSize = "13px";',
    '      badges.style.color = "#30252b";',
    '      badges.style.lineHeight = "1.5";',
    '      badges.innerHTML = "<div style=\\"display:grid;grid-template-columns:1fr 1fr;gap:12px;\\">" +',
    '        "<div>🛡️ <strong>100% Authentic European Lingerie</strong></div>" +',
    '        "<div>✈️ <strong>DHL Express Worldwide (2–4 Days)</strong></div>" +',
    '        "<div>📦 <strong>Guaranteed DDP Pre-Cleared</strong></div>" +',
    '        "<div>🔄 <strong>30-Day Returns &amp; Size Exchange</strong></div>" +',
    '        "</div>" +',
    '        "<div style=\\"margin-top:12px; padding-top:10px; border-top:1px dashed #e5cbcf; font-size:12px; color:#5c4752;\\">" +',
    '        "🛡️ <em>Import duties pre-cleared. No surprise fees on delivery. Free first size exchange.</em>" +',
    '        "</div>";',
    '      form.parentNode.insertBefore(badges, form.nextSibling);',
    '    }',
    '  }',
    '  ',
    '  function runAll() { initBar(); initProductEnhancements(); }',
    '  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", runAll); } else { runAll(); }',
    '  setTimeout(runAll, 800);',
    '})();',
    '</script>',
    '<!-- /wp:html -->'
  ].join('\n');

  const res = await putWidget('/wp-json/wp/v2/widgets/block-17', {
    instance: { raw: { content: fullContent } }
  });
  console.log(`Status aktualizacji widgetu block-17: HTTP ${res.status}`);
}

// ==============================================================================
// 6. Główny orkiestrator wdrożenia Fazy 5
// ==============================================================================
async function deployFaza5() {
  console.log('--- Rozpoczynam wdrożenie Fazy 5: Brafitting, Kalkulator i Ujednolicenie Zwrotów 30 dni ---');

  // 1. Size Guide (4513)
  console.log('Aktualizuję stronę Kalkulatora Rozmiarów (#4513)...');
  const res4513 = await fetch(`${url}/wp-json/wp/v2/pages/4513`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ content: buildSizeGuideHtml() })
  });
  console.log(`Page #4513 update status: HTTP ${res4513.status}`);

  // 2. Returns Policy (4517)
  console.log('Aktualizuję stronę Zwrotów (#4517) na 30 dni i Fit Promise...');
  const res4517 = await fetch(`${url}/wp-json/wp/v2/pages/4517`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ content: buildRefundPolicyHtml() })
  });
  console.log(`Page #4517 update status: HTTP ${res4517.status}`);

  // 3. Shipping & Delivery (4515)
  console.log('Aktualizuję stronę Wysyłki (#4515) - usunięcie blokady $99, wprowadzenie DDP i $150...');
  const res4515 = await fetch(`${url}/wp-json/wp/v2/pages/4515`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ content: buildShippingDeliveryHtml() })
  });
  console.log(`Page #4515 update status: HTTP ${res4515.status}`);

  // 4. Terms & Conditions (4554)
  console.log('Aktualizuję stronę Regulaminu (#4554) - ujednolicenie na 30 dni zwrotu, $0 minimum order...');
  const res4554 = await fetch(`${url}/wp-json/wp/v2/pages/4554`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ content: buildTermsAndConditionsHtml() })
  });
  console.log(`Page #4554 update status: HTTP ${res4554.status}`);

  // 5. Global Widgets
  await updateGlobalWidget();

  console.log('--- Faza 5 pomyślnie wdrożona na żywym sklepie! ---');
}

deployFaza5().catch(console.error);
