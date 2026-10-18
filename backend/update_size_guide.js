import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function updateSizeGuide() {
  const wpUser = process.env.WP_ADMIN_USER;
  const wpPass = process.env.WP_APP_PASSWORD;
  const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  const tablesHtml = `
<style>
.ni-size-tables { margin-top: 40px; }
.ni-table-wrap { overflow-x: auto; margin-bottom: 36px; background: #fff; border-radius: 16px; border: 1px solid #ebdce1; box-shadow: 0 4px 16px rgba(0,0,0,0.03); }
.ni-size-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem; }
.ni-size-table th { background: #fdf5f7; color: #823a54; padding: 14px 18px; font-weight: 700; border-bottom: 2px solid #ecd3da; }
.ni-size-table td { padding: 12px 18px; border-bottom: 1px solid #f3e9ec; color: #30252b; }
.ni-size-table tr:last-child td { border-bottom: none; }
.ni-size-table tr:hover { background: #fdfafb; }
.ni-badge-eu { display: inline-block; padding: 3px 8px; border-radius: 4px; background: #e8d7dc; color: #5c3543; font-weight: 600; font-size: 0.85rem; }
.ni-badge-us { display: inline-block; padding: 3px 8px; border-radius: 4px; background: #f0e6e8; color: #2d1e26; font-weight: 600; font-size: 0.85rem; }
</style>

<section class="ni-help-wrap ni-size-tables">
  <div style="text-align:center; margin-bottom: 32px;">
    <div style="text-transform:uppercase;letter-spacing:.18em;font-size:.78rem;font-weight:700;color:#93566a">International Fit System</div>
    <h2 style="font-size: clamp(1.8rem, 4vw, 2.6rem); margin-top: 8px;">EU to US / International Size Conversion</h2>
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
      </tbody>
    </table>
  </div>

  <h3 style="color: #823a54; font-size: 1.3rem; margin-bottom: 12px;">2. Bra Cup Conversion (Bust - Underbust Difference)</h3>
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
        <tr><td><span class="ni-badge-eu">E</span></td><td><span class="ni-badge-us">DD / E</span></td><td>DD</td><td>20 – 22 cm (7.9 – 8.7 in)</td></tr>
        <tr><td><span class="ni-badge-eu">F</span></td><td><span class="ni-badge-us">DDD / F</span></td><td>E</td><td>22 – 24 cm (8.7 – 9.4 in)</td></tr>
        <tr><td><span class="ni-badge-eu">G</span></td><td><span class="ni-badge-us">G (4D)</span></td><td>F</td><td>24 – 26 cm (9.4 – 10.2 in)</td></tr>
        <tr><td><span class="ni-badge-eu">H</span></td><td><span class="ni-badge-us">H</span></td><td>FF</td><td>26 – 28 cm (10.2 – 11.0 in)</td></tr>
        <tr><td><span class="ni-badge-eu">I</span></td><td><span class="ni-badge-us">I</span></td><td>G</td><td>28 – 30 cm (11.0 – 11.8 in)</td></tr>
        <tr><td><span class="ni-badge-eu">J</span></td><td><span class="ni-badge-us">J</span></td><td>GG</td><td>30 – 32 cm (11.8 – 12.6 in)</td></tr>
        <tr><td><span class="ni-badge-eu">K</span></td><td><span class="ni-badge-us">K</span></td><td>H</td><td>32 – 34 cm (12.6 – 13.4 in)</td></tr>
      </tbody>
    </table>
  </div>

  <h3 style="color: #823a54; font-size: 1.3rem; margin-bottom: 12px;">3. Panties & Briefs Size Conversion</h3>
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
</section>
`;

  const res = await axios.get('https://naturaintimo.com/wp-json/wp/v2/pages/4513', { headers });
  let content = res.data.content.rendered;

  // Insert before Prefer personal fit guidance
  const ctaIdx = content.indexOf('<div class="ni-help-cta">');
  if (ctaIdx !== -1) {
    const sectionStart = content.lastIndexOf('<section class="ni-help-wrap">', ctaIdx);
    content = content.substring(0, sectionStart) + tablesHtml + content.substring(sectionStart);
  } else {
    content += tablesHtml;
  }

  const updateRes = await axios.put('https://naturaintimo.com/wp-json/wp/v2/pages/4513', { content }, { headers });
  console.log('Successfully updated Size Guide (page 4513):', updateRes.data.title.rendered);
}

updateSizeGuide().catch(err => {
  console.error('Error updating size guide:', err.response ? err.response.data : err.message);
  process.exit(1);
});
