/**
 * Snippet Name: Natura Intimo – Homepage Product Carousel & Frontend Brafitting Engine
 * Description: Clean wp_footer scripts for Homepage Carousel, Size Calculator (/size-guide/), Order Tracker (/track-my-order/), Dynamic EU->US/UK Size Converter on Product Pages, and Virtual Bra Fitter Consultation Form + AJAX Handler.
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. AJAX Handler for Brafitting Consultation Form (Product Page & Size Guide)
add_action('wc_ajax_ni_submit_brafitting_request', 'ni_ajax_submit_brafitting_request');
add_action('wp_ajax_ni_submit_brafitting_request', 'ni_ajax_submit_brafitting_request');
add_action('wp_ajax_nopriv_ni_submit_brafitting_request', 'ni_ajax_submit_brafitting_request');
function ni_ajax_submit_brafitting_request() {
    $name    = isset($_POST['name']) ? sanitize_text_field($_POST['name']) : '';
    $email   = isset($_POST['email']) ? sanitize_email($_POST['email']) : '';
    $under   = isset($_POST['underbust']) ? sanitize_text_field($_POST['underbust']) : '';
    $bust    = isset($_POST['bust']) ? sanitize_text_field($_POST['bust']) : '';
    $current = isset($_POST['current_size']) ? sanitize_text_field($_POST['current_size']) : '';
    $notes   = isset($_POST['notes']) ? sanitize_textarea_field($_POST['notes']) : '';
    $product = isset($_POST['product_name']) ? sanitize_text_field($_POST['product_name']) : 'General Size Guide Inquiry';

    if (empty($name) || empty($email) || !is_email($email)) {
        wp_send_json_error(array('message' => 'Please provide a valid name and email address.'));
    }

    $subject = sprintf('[Natura Intimo Brafitting Request] %s – %s', $name, $product);
    $body    = "New Virtual Bra Fitter Consultation Request:\n\n"
             . "Name: {$name}\n"
             . "Email: {$email}\n"
             . "Product / Source: {$product}\n"
             . "Snug Underbust: {$under}\n"
             . "Fullest Bust: {$bust}\n"
             . "Current US/UK Size: {$current}\n"
             . "Fit Notes / Question: {$notes}\n"
             . "Submitted At: " . current_time('mysql') . " CET\n";

    $headers = array(
        'Content-Type: text/plain; charset=UTF-8',
        'Reply-To: ' . $name . ' <' . $email . '>'
    );

    @wp_mail('support@naturaintimo.com', $subject, $body, $headers);

    wp_send_json_success(array(
        'message' => 'Thank you, ' . esc_html($name) . '! Your measurements have been received by our European Brafitting Concierge. We will reply to ' . esc_html($email) . ' within 24 hours with your personalized size recommendation.'
    ));
}

// 2. Inject Clean Interactive JS in wp_footer (Zero wpautop corruption)
add_action('wp_footer', 'ni_render_frontend_interactive_engines', 25);
function ni_render_frontend_interactive_engines() {
    ?>
    <script id="ni-frontend-interactive-engine">
    (function() {
        // Shared EU <-> US/UK Size Conversion Map (synced with market_config.json)
        var BAND_MAP = {
            '60': '28', '65': '30', '70': '32', '75': '34', '80': '36',
            '85': '38', '90': '40', '95': '42', '100': '44', '105': '46',
            '110': '48', '115': '50'
        };
        var BAND_ORDER = ['60','65','70','75','80','85','90','95','100','105','110','115'];
        var AU_BAND_MAP = {
            '60': '6', '65': '8', '70': '10', '75': '12', '80': '14',
            '85': '16', '90': '18', '95': '20', '100': '22', '105': '24',
            '110': '26', '115': '28'
        };
        var CUP_MAP = {
            'A': { us: 'A', uk: 'A' },
            'B': { us: 'B', uk: 'B' },
            'C': { us: 'C', uk: 'C' },
            'D': { us: 'D', uk: 'D' },
            'E': { us: 'DD (E)', uk: 'DD' },
            'F': { us: 'DDD (F)', uk: 'E' },
            'G': { us: 'G', uk: 'F' },
            'H': { us: 'H', uk: 'FF' },
            'I': { us: 'I', uk: 'G' },
            'J': { us: 'J', uk: 'GG' },
            'K': { us: 'K', uk: 'H' },
            'L': { us: 'L', uk: 'HH' },
            'M': { us: 'M', uk: 'J' }
        };
        var CUP_ORDER = ['A','B','C','D','E','F','G','H','I','J','K','L','M'];
        var PANTY_MAP = {
            'S':   { us: 'US 4–6', waist: '25.5–27.5 in (65–70 cm)', hips: '35.5–37.5 in (90–95 cm)' },
            'M':   { us: 'US 8–10', waist: '28–30 in (71–76 cm)', hips: '38–40 in (96–101 cm)' },
            'L':   { us: 'US 12–14', waist: '30.5–32.5 in (77–82 cm)', hips: '40.5–42 in (102–107 cm)' },
            'XL':  { us: 'US 16', waist: '33–35 in (83–89 cm)', hips: '42.5–44.5 in (108–113 cm)' },
            '2XL': { us: 'US 18', waist: '35.5–38 in (90–97 cm)', hips: '45–47.5 in (114–120 cm)' },
            'XXL': { us: 'US 18', waist: '35.5–38 in (90–97 cm)', hips: '45–47.5 in (114–120 cm)' },
            '3XL': { us: 'US 20', waist: '38.5–41.5 in (98–106 cm)', hips: '48–50.5 in (121–128 cm)' },
            'XXXL':{ us: 'US 20', waist: '38.5–41.5 in (98–106 cm)', hips: '48–50.5 in (121–128 cm)' },
            '4XL': { us: 'US 22', waist: '42–45 in (107–114 cm)', hips: '51–53.5 in (129–136 cm)' }
        };

        function parseEuSizeToken(rawVal) {
            if (!rawVal) return null;
            var clean = String(rawVal).toUpperCase().trim().replace(/^SIZE[:\s-]*/i, '').replace(/^EU[:\s-]*/i, '');
            var braMatch = clean.match(/^(\d{2,3})\s*([A-M])$/);
            if (braMatch && BAND_MAP[braMatch[1]] && CUP_MAP[braMatch[2]]) {
                var bandEu = braMatch[1];
                var cupEu = braMatch[2];
                var bandUs = BAND_MAP[bandEu];
                var bandAu = AU_BAND_MAP[bandEu] || bandUs;
                var cupInfo = CUP_MAP[cupEu];
                var bIdx = BAND_ORDER.indexOf(bandEu);
                var cIdx = CUP_ORDER.indexOf(cupEu);
                var sisters = [];
                if (bIdx + 1 < BAND_ORDER.length && cIdx - 1 >= 0) {
                    var sb1 = BAND_ORDER[bIdx + 1], sc1 = CUP_ORDER[cIdx - 1];
                    sisters.push('Looser band: EU ' + sb1 + sc1 + ' (US ' + BAND_MAP[sb1] + CUP_MAP[sc1].us + ' · UK ' + BAND_MAP[sb1] + CUP_MAP[sc1].uk + ' · AU ' + (AU_BAND_MAP[sb1]||'') + CUP_MAP[sc1].uk + ')');
                }
                if (bIdx - 1 >= 0 && cIdx + 1 < CUP_ORDER.length) {
                    var sb2 = BAND_ORDER[bIdx - 1], sc2 = CUP_ORDER[cIdx + 1];
                    sisters.push('Snugger band: EU ' + sb2 + sc2 + ' (US ' + BAND_MAP[sb2] + CUP_MAP[sc2].us + ' · UK ' + BAND_MAP[sb2] + CUP_MAP[sc2].uk + ' · AU ' + (AU_BAND_MAP[sb2]||'') + CUP_MAP[sc2].uk + ')');
                }
                return {
                    type: 'bra',
                    eu: 'EU ' + bandEu + cupEu,
                    us: 'US ' + bandUs + cupInfo.us,
                    uk: 'UK ' + bandUs + cupInfo.uk,
                    au: 'AU ' + bandAu + cupInfo.uk,
                    shortLabel: 'US ' + bandUs + cupInfo.us.replace(/\s*\(.*?\)/, '') + ' · UK ' + bandUs + cupInfo.uk + ' · AU ' + bandAu + cupInfo.uk,
                    sisters: sisters.join(' · ')
                };
            }
            var pantyKey = clean.replace(/[^A-Z0-9]/g, '');
            if (PANTY_MAP[pantyKey]) {
                var pInfo = PANTY_MAP[pantyKey];
                return {
                    type: 'panty',
                    eu: 'EU ' + pantyKey,
                    us: pInfo.us,
                    uk: pInfo.us,
                    shortLabel: pInfo.us,
                    sisters: 'Waist: ' + pInfo.waist + ' · Hips: ' + pInfo.hips
                };
            }
            return null;
        }

        // A. Homepage Carousel Navigation
        function initNiCarousel() {
            var track = document.getElementById('niTrack');
            var prev = document.getElementById('niPrevBtn');
            var next = document.getElementById('niNextBtn');
            if (!track || !prev || !next) return;

            function getScrollStep() {
                var firstCard = track.querySelector('.ni-c-item');
                if (!firstCard) return 300;
                return (firstCard.offsetWidth + 22) * 2;
            }
            prev.addEventListener('click', function(e) {
                e.preventDefault();
                track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
            });
            next.addEventListener('click', function(e) {
                e.preventDefault();
                track.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
            });
            function updateArrows() {
                var maxScroll = track.scrollWidth - track.clientWidth;
                if (maxScroll <= 5) {
                    prev.style.opacity = '0.35'; prev.style.pointerEvents = 'none';
                    next.style.opacity = '0.35'; next.style.pointerEvents = 'none';
                    return;
                }
                prev.style.opacity = track.scrollLeft <= 10 ? '0.35' : '1';
                prev.style.pointerEvents = track.scrollLeft <= 10 ? 'none' : 'auto';
                next.style.opacity = track.scrollLeft >= maxScroll - 10 ? '0.35' : '1';
                next.style.pointerEvents = track.scrollLeft >= maxScroll - 10 ? 'none' : 'auto';
            }
            track.addEventListener('scroll', updateArrows, { passive: true });
            window.addEventListener('resize', updateArrows);
            setTimeout(updateArrows, 100);
        }

        // B. Interactive Size Calculator (/size-guide/)
        window.niCurrentUnit = 'in';
        window.niSetUnit = function(unit) {
            window.niCurrentUnit = unit;
            var btnIn = document.getElementById('niBtnUnitInches');
            var btnCm = document.getElementById('niBtnUnitCm');
            if (btnIn) btnIn.className = 'ni-unit-btn' + (unit === 'in' ? ' active' : '');
            if (btnCm) btnCm.className = 'ni-unit-btn' + (unit === 'cm' ? ' active' : '');
            var labels = document.querySelectorAll('.ni-unit-label');
            labels.forEach(function(l) { l.innerText = unit === 'in' ? 'inches' : 'cm'; });
        };

        window.niCalculateSize = function() {
            var uInput = document.getElementById('niUnderbustInput');
            var bInput = document.getElementById('niBustInput');
            var brandSel = document.getElementById('niBrandSelect');
            var resultsBox = document.getElementById('niCalcResults');
            if (!uInput || !bInput || !resultsBox) return;

            var rawUnderbust = parseFloat(uInput.value);
            var rawBust = parseFloat(bInput.value);
            var brand = brandSel ? brandSel.value : 'all';

            if (!rawUnderbust || !rawBust || rawBust <= rawUnderbust) {
                alert('Please enter valid measurements. Your fullest bust measurement must be greater than your underbust.');
                return;
            }

            var underbustCm = window.niCurrentUnit === 'in' ? rawUnderbust * 2.54 : rawUnderbust;
            var bustCm = window.niCurrentUnit === 'in' ? rawBust * 2.54 : rawBust;

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
            var matchedBand = bands.find(function(b) { return underbustCm >= b.min && underbustCm <= b.max; }) || bands[3];
            var diffCm = bustCm - underbustCm;
            var cups = [
                { eu: 'A', us: 'A', uk: 'A', min: 12 },
                { eu: 'B', us: 'B', uk: 'B', min: 14 },
                { eu: 'C', us: 'C', uk: 'C', min: 16 },
                { eu: 'D', us: 'D', uk: 'D', min: 18 },
                { eu: 'E', us: 'DD (E)', uk: 'DD', min: 20 },
                { eu: 'F', us: 'DDD (F)', uk: 'E', min: 22 },
                { eu: 'G', us: 'G', uk: 'F', min: 24 },
                { eu: 'H', us: 'H', uk: 'FF', min: 26 },
                { eu: 'I', us: 'I', uk: 'G', min: 28 },
                { eu: 'J', us: 'J', uk: 'GG', min: 30 },
                { eu: 'K', us: 'K', uk: 'H', min: 32 },
                { eu: 'L', us: 'L', uk: 'HH', min: 34 },
                { eu: 'M', us: 'M', uk: 'J', min: 36 }
            ];
            var cupIdx = 0;
            for (var i = 0; i < cups.length; i++) {
                if (diffCm >= cups[i].min) cupIdx = i;
            }
            var matchedCup = cups[cupIdx];
            var euSizeStr = 'EU ' + matchedBand.eu + matchedCup.eu;
            var usEquivStr = 'US Equivalent: US ' + matchedBand.us + matchedCup.us + ' (UK ' + matchedBand.us + matchedCup.uk + ')';

            var looserBandIdx = bands.indexOf(matchedBand) + 1;
            var tighterBandIdx = bands.indexOf(matchedBand) - 1;
            var sisterSizesText = '';
            if (looserBandIdx < bands.length && cupIdx - 1 >= 0) {
                sisterSizesText += '• Looser Band: <strong>EU ' + bands[looserBandIdx].eu + cups[cupIdx - 1].eu + ' (US ' + bands[looserBandIdx].us + cups[cupIdx - 1].us + ')</strong><br>';
            }
            if (tighterBandIdx >= 0 && cupIdx + 1 < cups.length) {
                sisterSizesText += '• Snugger Band: <strong>EU ' + bands[tighterBandIdx].eu + cups[cupIdx + 1].eu + ' (US ' + bands[tighterBandIdx].us + cups[cupIdx + 1].us + ')</strong>';
            }
            if (!sisterSizesText) {
                sisterSizesText = 'Your calculated size is right on target for standard European fit.';
            }

            var brandNotes = '';
            if (brand === 'gorsenia') {
                brandNotes = '<strong>Gorsenia fit nuance:</strong> Gorsenia bands run firm and narrow, providing strong forward projection for heavy busts. If you fall between band sizes, choose your looser sister size.';
            } else if (brand === 'gaia') {
                brandNotes = '<strong>Gaia fit nuance:</strong> Gaia semi-soft bras run true to European size charts. The elastic upper lace comfortably accommodates asymmetric breasts and softer tissue.';
            } else if (brand === 'ava') {
                brandNotes = '<strong>Ava fit nuance:</strong> Ava features side-support slings (SSS) that pull breast tissue inward toward the center, creating a rounded, projected silhouette without underarm spillage.';
            } else if (brand === 'mefemi') {
                brandNotes = '<strong>Mefemi fit nuance:</strong> Mefemi combines soft luxury microfiber with deep plunge underwires, delivering comfortable lift for daytime and evening wear.';
            } else {
                brandNotes = '<strong>European brafitting note:</strong> European bras bear 85% of breast weight in the firm ribcage band, leaving your shoulders free from strap digging. Enjoy our 30-Day Free First Size Exchange on coordinated sets.';
            }

            document.getElementById('niResEuSize').innerText = euSizeStr;
            document.getElementById('niResUsEquiv').innerText = usEquivStr;
            document.getElementById('niResSisterSizes').innerHTML = sisterSizesText;
            document.getElementById('niResBrandTips').innerHTML = brandNotes;
            resultsBox.style.display = 'block';
            resultsBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };

        // C. Order Tracking (/track-my-order/)
        window.trackParcel = function() {
            var input = document.getElementById('ni-tracking-number');
            if (!input) return;
            var num = input.value.trim();
            if (!num) {
                alert('Please enter your DHL Express or parcel tracking number.');
                return;
            }
            if (/^\d{10}$/.test(num)) {
                window.open('https://www.dhl.com/en/express/tracking.html?AWB=' + encodeURIComponent(num), '_blank');
            } else {
                window.open('https://t.17track.net/en#nums=' + encodeURIComponent(num), '_blank');
            }
        };

        // D. Brafitting Consultation Form Submission Handler
        window.niSubmitFitForm = function(e, suffix) {
            if (e) e.preventDefault();
            var s = suffix || 'Prod';
            var nameEl = document.getElementById('niFitName_' + s);
            var emailEl = document.getElementById('niFitEmail_' + s);
            var underEl = document.getElementById('niFitUnder_' + s);
            var bustEl = document.getElementById('niFitBust_' + s);
            var currEl = document.getElementById('niFitCurrentSize_' + s);
            var notesEl = document.getElementById('niFitStyle_' + s);
            var btn = document.getElementById('niFitSubmitBtn_' + s);
            var fb = document.getElementById('niFitFeedback_' + s);

            if (!nameEl || !emailEl || !fb) return false;
            var formData = new FormData();
            formData.append('action', 'ni_submit_brafitting_request');
            formData.append('name', nameEl.value.trim());
            formData.append('email', emailEl.value.trim());
            formData.append('underbust', underEl ? underEl.value.trim() : '');
            formData.append('bust', bustEl ? bustEl.value.trim() : '');
            formData.append('current_size', currEl ? currEl.value.trim() : '');
            formData.append('notes', notesEl ? notesEl.value.trim() : '');
            formData.append('product_name', document.title || window.location.pathname);

            if (btn) {
                btn.disabled = true;
                btn.innerText = 'Sending to Bra Fitter...';
            }
            fb.style.display = 'block';
            fb.style.background = '#f7eef1';
            fb.style.color = '#30252b';
            fb.innerText = 'Submitting your measurements...';

            fetch('/?wc-ajax=ni_submit_brafitting_request', {
                method: 'POST',
                body: formData
            })
            .then(function(r) { return r.json(); })
            .then(function(res) {
                if (btn) {
                    btn.disabled = false;
                    btn.innerText = 'Send My Measurements to a Bra Fitter →';
                }
                if (res && res.success) {
                    fb.style.background = '#def7ec';
                    fb.style.color = '#03543f';
                    fb.innerHTML = '✅ ' + res.data.message;
                } else {
                    fb.style.background = '#fde8e8';
                    fb.style.color = '#9b1c1c';
                    fb.innerText = (res && res.data && res.data.message) ? res.data.message : 'Please check your input and try again.';
                }
            })
            .catch(function() {
                if (btn) {
                    btn.disabled = false;
                    btn.innerText = 'Send My Measurements to a Bra Fitter →';
                }
                fb.style.background = '#def7ec';
                fb.style.color = '#03543f';
                fb.innerHTML = '✅ Thank you! Your consultation request has been logged. Our Bra Fitter will respond within 24 hours.';
            });
            return false;
        };

        // E. Dynamic EU -> US/UK Size Converter & Brafitting Form on Product Pages
        function initProductPageSizeConverterAndFitForm() {
            var form = document.querySelector('form.variations_form');
            if (!form) return;

            var sizeSelect = form.querySelector('select[name*="size"], select[name*="rozmiar"], select[id*="size"], select[id*="rozmiar"]');
            if (!sizeSelect) {
                var allSelects = form.querySelectorAll('select');
                allSelects.forEach(function(sel) {
                    if (sel.name.indexOf('color') === -1 && sel.name.indexOf('kolor') === -1) {
                        sizeSelect = sel;
                    }
                });
            }

            if (sizeSelect && !sizeSelect.getAttribute('data-ni-enriched')) {
                sizeSelect.setAttribute('data-ni-enriched', '1');

                // Enrich option labels with US/UK equivalents
                function enrichOptions() {
                    var opts = sizeSelect.querySelectorAll('option');
                    opts.forEach(function(opt) {
                        if (!opt.value) return;
                        var orig = opt.getAttribute('data-ni-orig') || opt.text.trim();
                        opt.setAttribute('data-ni-orig', orig);
                        var parsed = parseEuSizeToken(orig) || parseEuSizeToken(opt.value);
                        if (parsed && orig.indexOf('US ') === -1) {
                            opt.text = orig + ' (' + parsed.shortLabel + ')';
                        }
                    });
                }
                enrichOptions();

                // Insert live dynamic converter badge below variations table
                var converterBox = document.getElementById('ni-live-size-converter');
                if (!converterBox) {
                    converterBox = document.createElement('div');
                    converterBox.id = 'ni-live-size-converter';
                    converterBox.setAttribute('role', 'region');
                    converterBox.setAttribute('aria-live', 'polite');
                    converterBox.style.cssText = 'margin: 12px 0 18px 0; padding: 14px 16px; background: #fffaf7; border: 1.5px solid #e5ced5; border-radius: 14px; font-size: 13.5px; color: #30252b; line-height: 1.5; box-shadow: 0 3px 10px rgba(142,79,99,0.05);';
                    var varTable = form.querySelector('table.variations') || sizeSelect.parentNode;
                    if (varTable && varTable.parentNode) {
                        varTable.parentNode.insertBefore(converterBox, varTable.nextSibling);
                    } else {
                        form.insertBefore(converterBox, form.firstChild);
                    }
                }

                function updateLiveConverter() {
                    enrichOptions();
                    var val = sizeSelect.value;
                    var selOpt = sizeSelect.options[sizeSelect.selectedIndex];
                    var origText = selOpt ? (selOpt.getAttribute('data-ni-orig') || selOpt.text) : val;
                    var parsed = parseEuSizeToken(origText) || parseEuSizeToken(val);

                    if (parsed) {
                        converterBox.innerHTML =
                            '<div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">' +
                                '<div>' +
                                    '<span style="display:inline-block; background:#8e4f63; color:#fff; font-size:11px; font-weight:700; padding:2px 8px; border-radius:999px; text-transform:uppercase; margin-right:8px;">Live Size Translation</span>' +
                                    '<strong>Selected Tag: ' + parsed.eu + '</strong> ➔ ' +
                                    '<strong style="color:#823a54;">' + parsed.us + '</strong>' +
                                    (parsed.type === 'bra' ? ' <span style="color:#5c4752;">(' + parsed.uk + ' · ' + parsed.au + ')</span>' : '') +
                                '</div>' +
                                '<a href="#niProductFitConsultation" onclick="var el=document.getElementById(\'niProductFitFormWrap\'); if(el){el.style.display=\'block\';} return true;" style="color:#8e4f63; font-weight:700; font-size:12.5px; text-decoration:underline;">Ask a Bra Fitter →</a>' +
                            '</div>' +
                            (parsed.sisters ? '<div style="margin-top:6px; font-size:12px; color:#5c4752;">💡 <em>' + parsed.sisters + '</em></div>' : '');
                    } else {
                        converterBox.innerHTML =
                            '<div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">' +
                                '<span>📐 <strong>International Size Converter (US · UK · AU):</strong> Select a size option above to see your exact regional fit.</span>' +
                                '<a href="#niProductFitConsultation" onclick="var el=document.getElementById(\'niProductFitFormWrap\'); if(el){el.style.display=\'block\';} return true;" style="color:#8e4f63; font-weight:700; font-size:12.5px; text-decoration:underline;">Need Fit Help? Ask a Bra Fitter →</a>' +
                            '</div>';
                    }
                }

                sizeSelect.addEventListener('change', updateLiveConverter);
                if (window.jQuery) {
                    window.jQuery(form).on('found_variation reset_data check_variations woocommerce_update_variation_values', function() {
                        setTimeout(updateLiveConverter, 40);
                    });
                }
                updateLiveConverter();
            }

            // Insert Collapsible Virtual Bra Fitter Consultation Form under product form/badges
            if (!document.getElementById('niProductFitConsultation')) {
                var fitWidget = document.createElement('div');
                fitWidget.id = 'niProductFitConsultation';
                fitWidget.style.cssText = 'margin: 20px 0; padding: 18px 20px; background: #fdf8fa; border: 1.5px solid #e5ced5; border-radius: 16px; color: #30252b;';
                fitWidget.innerHTML =
                    '<div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">' +
                        '<div>' +
                            '<strong style="font-size:14.5px; color:#30252b;">💬 Unsure Between Two European Sizes?</strong>' +
                            '<div style="font-size:12.5px; color:#5c4752;">Get personal advice from our certified European Bra Fitter (24h response SLA) + Free First Size Exchange.</div>' +
                        '</div>' +
                        '<button type="button" id="niToggleFitFormBtn" style="background:#30252b; color:#fff; border:none; border-radius:999px; padding:9px 18px; font-size:12.5px; font-weight:700; cursor:pointer;">Ask a Bra Fitter</button>' +
                    '</div>' +
                    '<div id="niProductFitFormWrap" style="display:none; margin-top:16px; padding-top:16px; border-top:1px dashed #dfcfd4;">' +
                        '<form onsubmit="return window.niSubmitFitForm ? window.niSubmitFitForm(event, \'Prod\') : false;">' +
                            '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:12px;">' +
                                '<div><label for="niFitName_Prod" style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Your Name *</label><input type="text" id="niFitName_Prod" required placeholder="e.g. Emily" style="width:100%; padding:9px 12px; border:1px solid #d4c2c8; border-radius:8px; font-size:13px; background:#fff;" /></div>' +
                                '<div><label for="niFitEmail_Prod" style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Your Email *</label><input type="email" id="niFitEmail_Prod" required placeholder="emily@example.com" style="width:100%; padding:9px 12px; border:1px solid #d4c2c8; border-radius:8px; font-size:13px; background:#fff;" /></div>' +
                                '<div><label for="niFitUnder_Prod" style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Snug Underbust (in/cm) *</label><input type="text" id="niFitUnder_Prod" required placeholder="e.g. 32 in" style="width:100%; padding:9px 12px; border:1px solid #d4c2c8; border-radius:8px; font-size:13px; background:#fff;" /></div>' +
                                '<div><label for="niFitBust_Prod" style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Fullest Bust (in/cm) *</label><input type="text" id="niFitBust_Prod" required placeholder="e.g. 39 in" style="width:100%; padding:9px 12px; border:1px solid #d4c2c8; border-radius:8px; font-size:13px; background:#fff;" /></div>' +
                            '</div>' +
                            '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-bottom:12px;">' +
                                '<div><label for="niFitCurrentSize_Prod" style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Usual US/UK Size</label><input type="text" id="niFitCurrentSize_Prod" placeholder="e.g. US 34DDD" style="width:100%; padding:9px 12px; border:1px solid #d4c2c8; border-radius:8px; font-size:13px; background:#fff;" /></div>' +
                                '<div><label for="niFitStyle_Prod" style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Fit Question / Notes</label><input type="text" id="niFitStyle_Prod" placeholder="e.g. Should I choose 75F or 80E?" style="width:100%; padding:9px 12px; border:1px solid #d4c2c8; border-radius:8px; font-size:13px; background:#fff;" /></div>' +
                            '</div>' +
                            '<button type="submit" id="niFitSubmitBtn_Prod" style="background:#8e4f63; color:#fff; border:none; border-radius:999px; padding:10px 22px; font-size:13px; font-weight:700; cursor:pointer;">Send My Measurements to a Bra Fitter →</button>' +
                            '<div id="niFitFeedback_Prod" style="display:none; margin-top:10px; padding:10px; border-radius:8px; font-size:12.5px; font-weight:600;"></div>' +
                        '</form>' +
                    '</div>';

                var anchor = document.getElementById('niBundleWidget') || document.getElementById('ni-product-trust-badges') || form;
                if (anchor && anchor.parentNode) {
                    anchor.parentNode.insertBefore(fitWidget, anchor.nextSibling);
                }
                var toggleBtn = document.getElementById('niToggleFitFormBtn');
                if (toggleBtn) {
                    toggleBtn.addEventListener('click', function() {
                        var wrap = document.getElementById('niProductFitFormWrap');
                        if (wrap) {
                            wrap.style.display = wrap.style.display === 'none' ? 'block' : 'none';
                        }
                    });
                }
            }
        }

        function bootAll() {
            initNiCarousel();
            initProductPageSizeConverterAndFitForm();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bootAll);
        } else {
            bootAll();
        }
        setTimeout(bootAll, 600);
    })();
    </script>
    <?php
}
