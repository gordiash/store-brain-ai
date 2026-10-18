import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const wpUser = process.env.WP_ADMIN_USER;
const wpPass = process.env.WP_APP_PASSWORD;
const wpAuth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

async function updateGlobalWidget() {
  console.log('--- Aktualizacja paska ogłoszeń, trust badge na produktach i stopki ---');

  const put = (path, body) => new Promise((resolve) => {
    const postData = JSON.stringify(body);
    const req = https.request('https://naturaintimo.com' + path, {
      method: 'PUT',
      headers: {
        'Authorization': 'Basic ' + wpAuth,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
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
    '  <div class="announcement-inner" style="display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;">',
    '    <span>✨ <strong>FREE DHL EXPRESS</strong> to USA on orders over $150 USD</span>',
    '    <span style="opacity:0.6;">|</span>',
    '    <span>🛡️ 100% Guaranteed DDP (No Surprise Fees on Delivery)</span>',
    '  </div>',
    '</div>',
    '<div class="ni-footer-compliance-notice" style="margin-top:14px; font-size:12px; color:#888; line-height:1.4;">',
    '  🛡️ <em>Import duties and fees for U.S. orders are included. No additional charges on delivery.</em>',
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
    '    ',
    '    var header = document.querySelector(".site-header") || document.querySelector("header") || document.getElementById("ast-desktop-header") || document.body.firstChild;',
    '    if (header && header.parentNode) {',
    '      header.parentNode.insertBefore(bar, header);',
    '    } else {',
    '      document.body.insertBefore(bar, document.body.firstChild);',
    '    }',
    '  }',
    '  ',
    '  // 2. PRODUCT PAGE ENHANCEMENTS: SIZE GUIDE BUTTON & TRUST BADGES',
    '  function initProductEnhancements() {',
    '    var form = document.querySelector(".variations_form");',
    '    if (!form || document.getElementById("ni-size-guide-btn")) return;',
    '    ',
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
    '    ',
    '    if (sizeLabel) {',
    '      sizeLabel.appendChild(guideLink);',
    '    } else {',
    '      form.parentNode.insertBefore(guideLink, form);',
    '    }',
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
    '        "<div>💳 <strong>256-Bit Encrypted Checkout</strong></div>" +',
    '        "</div>" +',
    '        "<div style=\\"margin-top:12px; padding-top:10px; border-top:1px dashed #e5cbcf; font-size:12px; color:#5c4752;\\">" +',
    '        "🛡️ <em>Import duties and fees for U.S. orders are included. No additional charges on delivery.</em>" +',
    '        "</div>";',
    '      form.parentNode.insertBefore(badges, form.nextSibling);',
    '    }',
    '  }',
    '  ',
    '  function runAll() {',
    '    initBar();',
    '    initProductEnhancements();',
    '  }',
    '  ',
    '  if (document.readyState === "loading") {',
    '    document.addEventListener("DOMContentLoaded", runAll);',
    '  } else {',
    '    runAll();',
    '  }',
    '  setTimeout(runAll, 800);',
    '})();',
    '</script>',
    '<!-- /wp:html -->'
  ].join('\n');

  console.log('Updating block-17...');
  const res = await put('/wp-json/wp/v2/widgets/block-17', {
    instance: {
      raw: {
        content: fullContent
      }
    }
  });

  console.log('Update status:', res.status);
  console.log('✅ Zaktualizowano pasek ogłoszeń i trust badges z komunikatem DDP!');
}

updateGlobalWidget().catch(console.error);
