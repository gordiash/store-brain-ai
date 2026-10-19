<?php
/**
 * Snippet Name: Natura Intimo – Virtual Bra Fitter & AI Concierge Engine
 * Description: Native, zero-bloat AI shopping assistant powered by Google Gemini 2.5 Flash. Provides real-time EU<->US bra size consultations, product recommendations, and shipping/return guidance directly on the storefront.
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. Register Public REST API Route for Chat Assistant
add_action('rest_api_init', 'ni_register_ai_chat_routes');
function ni_register_ai_chat_routes() {
    register_rest_route('ni/v1', '/chat-assistant', array(
        'methods' => 'POST',
        'callback' => 'ni_handle_ai_chat_request',
        'permission_callback' => '__return_true'
    ));

    // Admin endpoint to safely update API key
    register_rest_route('ni/v1', '/set-ai-key', array(
        'methods' => 'POST',
        'callback' => 'ni_handle_set_ai_key',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        }
    ));
}

function ni_handle_set_ai_key($request) {
    $params = $request->get_json_params();
    $key = trim($params['api_key'] ?? '');
    if (!$key) {
        return new WP_Error('invalid_key', 'API key is required', array('status' => 400));
    }
    update_option('ni_gemini_api_key', $key, false);
    return array('success' => true, 'message' => 'Gemini API key saved safely.');
}

// 2. Chat Assistant Request Handler
function ni_handle_ai_chat_request($request) {
    // Basic Rate Limiting: max 20 requests per 10 minutes per IP
    $ip = sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $transient_key = 'ni_chat_limit_' . md5($ip);
    $req_count = (int) get_transient($transient_key);
    if ($req_count >= 25) {
        return new WP_Error('rate_limit', 'Too many requests. Please wait a few moments.', array('status' => 429));
    }
    set_transient($transient_key, $req_count + 1, 10 * MINUTE_IN_SECONDS);

    $params = $request->get_json_params();
    $message = sanitize_text_field($params['message'] ?? '');
    $history = is_array($params['history'] ?? null) ? $params['history'] : array();

    if (empty($message)) {
        return new WP_Error('empty_message', 'Message cannot be empty.', array('status' => 400));
    }

    $api_key = get_option('ni_gemini_api_key');
    if (!$api_key) {
        return new WP_Error('config_error', 'AI Concierge is currently undergoing maintenance.', array('status' => 500));
    }

    // System prompt with store knowledge
    $system_instruction = "You are 'Klara', the virtual Head Bra Fitter and Concierge at Natura Intimo (naturaintimo.com), a boutique specializing in authentic European full-bust lingerie engineered for superior support, comfort, and lift.

BRAND & STORE IDENTITY:
- Atelier origin: Hand-crafted and designed in Olsztyn, Poland (European Union).
- Brands in catalog: Gorsenia, Gaia, Ava, Mefemi, Alles, Julimex.
- Specialty: Full-bust architecture (EU 65–115 / US 30–50, cups B through M). Multi-part seamed cups, firm underwires, ergonomic straps that project breast tissue forward and alleviate shoulder pressure.

SHIPPING & LOGISTICS:
- Carrier: DHL Express Worldwide for all orders to the United States and Canada.
- Delivery speed: 2 to 4 business days.
- Flat rate: $24.99 USD DDP (Delivered Duty Paid - no surprise customs fees or COD upon arrival in US/CA).
- Free Shipping threshold: 100% Free DHL Express on orders over $150.00 USD (C$200.00 CAD).

RETURNS & EXCHANGES:
- 30-day return window from the date of physical delivery.
- Free First Size Exchange Guarantee on coordinated sets for US and Canadian customers to eliminate fit anxiety.
- Set Savings: Pairing any bra with matching bottoms applies an instant $10.00 USD discount at checkout.

BRA FITTING & SIZE CONVERSION RULES:
- European band sizes use centimeters: EU 65 = US 30 | EU 70 = US 32 | EU 75 = US 34 | EU 80 = US 36 | EU 85 = US 38 | EU 90 = US 40 | EU 95 = US 42 | EU 100 = US 44 | EU 105 = US 46.
- Cup progression: EU (B, C, D, E, F, G, H, I, J, K) vs US (B, C, D, DD, DDD/F, G/4D, H, I, J, K). EU E = US DD, EU F = US DDD/F, EU G = US 4D/G.
- Brand Nuances:
  * Gorsenia (e.g. Luisse K441, Alicante K647): Deep projection cups, narrow underwires. Lifts and gathers forward. If customer is between two cup sizes, advise the smaller cup size in Gorsenia.
  * Gaia & Ava (e.g. Gaia Mary BS 1372): Wider, gentler underwires, rounded natural profile. Great for wider-set breasts.
  * Julimex: Seamless laser-cut briefs (Infinity Maxi, Soft Infinity) that stay completely invisible under clothes.

COMMUNICATION STYLE & MULTILINGUAL SUPPORT:
- Warm, elegant, knowledgeable, discreet, and reassuring.
- Always match the user's language (respond in French to French queries, English to English queries, Polish to Polish queries).
- QUEBEC & CANADIAN FRENCH SUPPORT:
  * If the user writes in French or mentions Quebec/Canada, respond in flawless, elegant Canadian French (Français québécois / standard).
  * Reassure the customer about: 0% customs tariff under CETA (AECG - Accord de libre-échange Canada-UE), DHL Express delivery in 2 to 4 business days to Montreal, Quebec City, and all regions, 30 days return window, and 100% Free First Size Exchange (Premier échange de taille gratuit).
  * Direct customers to the Quebec page when relevant: [Page Natura Intimo Québec](https://naturaintimo.com/quebec/).
- Keep answers concise (2-3 short paragraphs max).
- Recommend specific product lines available in store (e.g., [Gorsenia Luisse](https://naturaintimo.com/product/bra-semi-soft-gorsenia-k-441-luisse-black/), [Gorsenia Alicante](https://naturaintimo.com/product/bra-semi-soft-gorsenia-k-647-alicante/), [Gaia Mary](https://naturaintimo.com/product/bra-semi-soft-gaia-bs-1372-mary-burgundy/)). Use markdown links where helpful.";

    // Build Gemini contents payload with recent history (last 6 turns)
    $contents = array();
    $recent_history = array_slice($history, -6);
    foreach ($recent_history as $turn) {
        $role = ($turn['role'] ?? '') === 'assistant' ? 'model' : 'user';
        $text = sanitize_text_field($turn['content'] ?? '');
        if ($text) {
            $contents[] = array(
                'role' => $role,
                'parts' => array(array('text' => $text))
            );
        }
    }
    // Add current message
    $contents[] = array(
        'role' => 'user',
        'parts' => array(array('text' => $message))
    );

    $gemini_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . urlencode($api_key);
    $payload = array(
        'systemInstruction' => array(
            'parts' => array(array('text' => $system_instruction))
        ),
        'contents' => $contents,
        'generationConfig' => array(
            'temperature' => 0.6,
            'maxOutputTokens' => 600,
            'topP' => 0.95
        )
    );

    $response = wp_remote_post($gemini_url, array(
        'headers' => array('Content-Type' => 'application/json'),
        'body' => json_encode($payload),
        'timeout' => 15
    ));

    if (is_wp_error($response)) {
        return new WP_Error('api_error', 'Unable to connect to AI assistant. Please try again.', array('status' => 500));
    }

    $status = wp_remote_retrieve_response_code($response);
    $body = json_decode(wp_remote_retrieve_body($response), true);

    if ($status !== 200 || empty($body['candidates'][0]['content']['parts'][0]['text'])) {
        return new WP_Error('gemini_error', 'AI Concierge temporarily unavailable.', array('status' => 502));
    }

    $reply = $body['candidates'][0]['content']['parts'][0]['text'];

    return array(
        'success' => true,
        'reply' => $reply
    );
}

// 3. Frontend Chat Widget Injection (wp_footer)
add_action('wp_footer', 'ni_render_ai_concierge_widget', 95);
function ni_render_ai_concierge_widget() {
    if (is_admin()) {
        return;
    }
    ?>
    <!-- Natura Intimo AI Bra Fitter & Concierge Widget -->
    <div id="ni-ai-concierge-root">
        <!-- Floating Toggle Button -->
        <button id="ni-ai-toggle" aria-label="Open Natura Intimo Bra Fitting Concierge" aria-expanded="false" type="button">
            <span class="ni-ai-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    <circle cx="9" cy="10" r="1" fill="currentColor"></circle>
                    <circle cx="12" cy="10" r="1" fill="currentColor"></circle>
                    <circle cx="15" cy="10" r="1" fill="currentColor"></circle>
                </svg>
            </span>
            <span class="ni-ai-label">Fit Concierge</span>
        </button>

        <!-- Chat Modal / Drawer -->
        <div id="ni-ai-window" role="dialog" aria-modal="true" aria-labelledby="ni-ai-title" style="display:none;">
            <!-- Header -->
            <div class="ni-ai-header">
                <div class="ni-ai-profile">
                    <div class="ni-ai-avatar">K</div>
                    <div class="ni-ai-info">
                        <div id="ni-ai-title" class="ni-ai-name">Klara • Bra Fitting Concierge</div>
                        <div class="ni-ai-status"><span class="ni-status-dot"></span> Online | European Lingerie Expert</div>
                    </div>
                </div>
                <button id="ni-ai-close" aria-label="Close Chat" type="button">✕</button>
            </div>

            <!-- Messages Stream -->
            <div id="ni-ai-messages" class="ni-ai-messages">
                <div class="ni-msg ni-msg-bot">
                    Hello! I'm Klara, your Natura Intimo Bra Fitting Specialist. Need help finding your European band and cup size, or have questions about express DHL shipping and our Free Size Exchange guarantee?
                </div>
                <!-- Quick Suggestion Pills -->
                <div id="ni-ai-quick-pills" class="ni-quick-pills">
                    <button type="button" class="ni-pill" data-prompt="How do I convert my US bra size to European size?">📏 US ➔ EU Size Guide</button>
                    <button type="button" class="ni-pill" data-prompt="What are the DHL shipping rates and delivery times to US & Canada?">✈️ Shipping & Delivery</button>
                    <button type="button" class="ni-pill" data-prompt="Bonjour Klara, j'habite au Québec. Comment convertir ma taille de soutien-gorge canadienne en taille européenne et quels sont les délais de livraison DHL ?">⚜️ Guide Québec (FR)</button>
                    <button type="button" class="ni-pill" data-prompt="Tell me about your 30-day Free First Size Exchange policy.">🔄 Free Size Exchange</button>
                    <button type="button" class="ni-pill" data-prompt="Which bra do you recommend for full-bust support and lift?">✨ Recommend Full-Bust Bra</button>
                </div>
            </div>

            <!-- Input Bar -->
            <form id="ni-ai-form" class="ni-ai-form">
                <input id="ni-ai-input" type="text" placeholder="Ask about sizes, fit, or shipping..." autocomplete="off" maxlength="400" />
                <button id="ni-ai-send" type="submit" aria-label="Send message">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </form>
        </div>
    </div>

    <style>
        #ni-ai-concierge-root {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        #ni-ai-toggle {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, #4a1224 0%, #6e1c37 100%);
            color: #ffffff;
            border: 1px solid rgba(212, 175, 55, 0.4);
            border-radius: 30px;
            padding: 12px 20px;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.3px;
            cursor: pointer;
            box-shadow: 0 4px 18px rgba(74, 18, 36, 0.35);
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        #ni-ai-toggle:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 22px rgba(74, 18, 36, 0.45);
            border-color: rgba(212, 175, 55, 0.8);
        }
        #ni-ai-window {
            position: fixed;
            bottom: 84px;
            right: 24px;
            width: 360px;
            max-width: calc(100vw - 32px);
            height: 520px;
            max-height: calc(100vh - 110px);
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18);
            border: 1px solid #ebdcd5;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            animation: niFadeUp 0.25s ease-out;
        }
        @keyframes niFadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .ni-ai-header {
            background: linear-gradient(135deg, #4a1224 0%, #310b17 100%);
            color: #ffffff;
            padding: 14px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid rgba(212, 175, 55, 0.25);
        }
        .ni-ai-profile {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .ni-ai-avatar {
            width: 36px;
            height: 36px;
            background: #d4af37;
            color: #310b17;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 16px;
        }
        .ni-ai-name {
            font-size: 13.5px;
            font-weight: 600;
            line-height: 1.2;
        }
        .ni-ai-status {
            font-size: 11px;
            color: #f0e6e9;
            margin-top: 2px;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .ni-status-dot {
            width: 7px;
            height: 7px;
            background: #22c55e;
            border-radius: 50%;
            display: inline-block;
        }
        #ni-ai-close {
            background: transparent;
            border: none;
            color: #ffffff;
            font-size: 16px;
            cursor: pointer;
            padding: 4px 8px;
            opacity: 0.8;
            transition: opacity 0.2s;
        }
        #ni-ai-close:hover { opacity: 1; }
        .ni-ai-messages {
            flex: 1;
            padding: 14px;
            overflow-y: auto;
            background: #faf6f5;
            display: flex;
            flex-direction: column;
            gap: 10px;
            font-size: 13.5px;
            line-height: 1.45;
        }
        .ni-msg {
            max-width: 86%;
            padding: 10px 14px;
            border-radius: 12px;
            word-wrap: break-word;
        }
        .ni-msg-bot {
            align-self: flex-start;
            background: #ffffff;
            color: #2b1f24;
            border: 1px solid #ebdcd5;
            box-shadow: 0 1px 3px rgba(0,0,0,0.04);
            border-bottom-left-radius: 2px;
        }
        .ni-msg-bot a {
            color: #6e1c37;
            font-weight: 600;
            text-decoration: underline;
        }
        .ni-msg-user {
            align-self: flex-end;
            background: #4a1224;
            color: #ffffff;
            border-bottom-right-radius: 2px;
        }
        .ni-quick-pills {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 4px;
        }
        .ni-pill {
            background: #ffffff;
            border: 1px solid #d4c3ba;
            color: #4a1224;
            border-radius: 16px;
            padding: 5px 10px;
            font-size: 11.5px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
        }
        .ni-pill:hover {
            background: #f7ebe8;
            border-color: #4a1224;
        }
        .ni-typing {
            display: inline-flex;
            gap: 4px;
            padding: 10px 14px;
            background: #ffffff;
            border: 1px solid #ebdcd5;
            border-radius: 12px;
            width: fit-content;
        }
        .ni-typing span {
            width: 6px;
            height: 6px;
            background: #8a3b58;
            border-radius: 50%;
            animation: niBounce 1.2s infinite ease-in-out;
        }
        .ni-typing span:nth-child(2) { animation-delay: 0.2s; }
        .ni-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes niBounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
        .ni-ai-form {
            display: flex;
            border-top: 1px solid #ebdcd5;
            background: #ffffff;
            padding: 8px 10px;
            gap: 6px;
        }
        #ni-ai-input {
            flex: 1;
            border: 1px solid #ebdcd5;
            border-radius: 20px;
            padding: 8px 14px;
            font-size: 13px;
            outline: none;
            transition: border-color 0.2s;
        }
        #ni-ai-input:focus {
            border-color: #6e1c37;
        }
        #ni-ai-send {
            background: #4a1224;
            color: #ffffff;
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s;
            flex-shrink: 0;
        }
        #ni-ai-send:hover {
            background: #6e1c37;
        }
        @media (max-width: 600px) {
            #ni-ai-concierge-root { bottom: 18px; right: 18px; }
            #ni-ai-toggle { padding: 12px; border-radius: 50%; }
            .ni-ai-label { display: none; }
            #ni-ai-window {
                right: 12px;
                left: 12px;
                width: auto;
                bottom: 74px;
                height: 480px;
            }
        }
    </style>

    <script>
    (function() {
        var toggle = document.getElementById('ni-ai-toggle');
        var win = document.getElementById('ni-ai-window');
        var close = document.getElementById('ni-ai-close');
        var form = document.getElementById('ni-ai-form');
        var input = document.getElementById('ni-ai-input');
        var msgs = document.getElementById('ni-ai-messages');
        var pills = document.getElementById('ni-ai-quick-pills');

        if (!toggle || !win) return;

        var history = [];
        var isOpen = false;

        function setOpen(open) {
            isOpen = open;
            win.style.display = open ? 'flex' : 'none';
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (open) {
                setTimeout(function() { input.focus(); }, 150);
            }
        }

        toggle.addEventListener('click', function() {
            setOpen(!isOpen);
        });

        close.addEventListener('click', function() {
            setOpen(false);
        });

        // Parse markdown links, bold, bullet points
        function formatMarkdown(text) {
            var escaped = text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            // Links [title](url)
            escaped = escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
            // Bold **text**
            escaped = escaped.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
            // Line breaks
            escaped = escaped.replace(/\n/g, '<br/>');
            return escaped;
        }

        function appendMessage(text, isUser) {
            var div = document.createElement('div');
            div.className = 'ni-msg ' + (isUser ? 'ni-msg-user' : 'ni-msg-bot');
            if (isUser) {
                div.textContent = text;
            } else {
                div.innerHTML = formatMarkdown(text);
            }
            msgs.appendChild(div);
            msgs.scrollTop = msgs.scrollHeight;
        }

        function showTyping() {
            var div = document.createElement('div');
            div.className = 'ni-typing';
            div.id = 'ni-typing-indicator';
            div.innerHTML = '<span></span><span></span><span></span>';
            msgs.appendChild(div);
            msgs.scrollTop = msgs.scrollHeight;
        }

        function hideTyping() {
            var t = document.getElementById('ni-typing-indicator');
            if (t) t.remove();
        }

        async function sendMessage(text) {
            if (!text || !text.trim()) return;
            var userText = text.trim();
            appendMessage(userText, true);
            history.push({ role: 'user', content: userText });
            if (pills) { pills.style.display = 'none'; }

            showTyping();

            try {
                var res = await fetch('/wp-json/ni/v1/chat-assistant', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: userText, history: history })
                });
                var data = await res.json();
                hideTyping();

                if (res.ok && data.reply) {
                    appendMessage(data.reply, false);
                    history.push({ role: 'assistant', content: data.reply });
                } else {
                    appendMessage(data.message || 'I apologize, but I am momentarily unavailable. Please check our Size Guide or FAQ page.', false);
                }
            } catch (err) {
                hideTyping();
                appendMessage('Network connection error. Please try again in a moment.', false);
            }
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var val = input.value;
            input.value = '';
            sendMessage(val);
        });

        // Pill clicks
        if (pills) {
            pills.addEventListener('click', function(e) {
                var btn = e.target.closest('.ni-pill');
                if (btn) {
                    var prompt = btn.getAttribute('data-prompt');
                    sendMessage(prompt);
                }
            });
        }
    })();
    </script>
    <?php
}
