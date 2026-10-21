<?php
/**
 * Snippet Name: Natura Intimo – Journal Hub & Luxury Editorial Styling Engine
 * Description: Transforms /journal/ into a high-end luxury fashion editorial magazine with custom hero banner, category pills, card hover effects, and brafitting CTA.
 */

if (!defined('ABSPATH')) exit;

// 1. Inject Hero Banner at the top of Journal Archive
add_action('astra_primary_content_top', 'ni_render_journal_hero_section', 5);
function ni_render_journal_hero_section() {
    if (!is_home() || is_front_page()) {
        return;
    }
    ?>
    <section class="ni-journal-hero-wrap">
        <div class="ni-journal-hero-inner">
            <span class="ni-journal-badge">✨ NATURA INTIMO &bull; ATELIER JOURNAL</span>
            <h1 class="ni-journal-title">European Full-Bust Architecture, Brafitting &amp; Lingerie Care</h1>
            <p class="ni-journal-subtitle">
                Expert brafitting insights, cup projection geometry, sister size conversions, and transparent North American delivery guides directly from our European atelier.
            </p>
            <div class="ni-journal-pills">
                <span class="ni-pill active">All Articles</span>
                <a href="<?php echo esc_url(home_url('/category/brafitting-guides/')); ?>" class="ni-pill">Brafitting &amp; Architecture</a>
                <a href="<?php echo esc_url(home_url('/category/size-sister-sizes/')); ?>" class="ni-pill">Size &amp; Sister Sizes</a>
                <a href="<?php echo esc_url(home_url('/category/shopping-customs-ddp/')); ?>" class="ni-pill">Shopping &amp; DDP Customs</a>
                <a href="<?php echo esc_url(home_url('/size-guide/')); ?>" class="ni-pill ni-pill-accent">📐 Size Calculator &rarr;</a>
            </div>
        </div>
    </section>
    <?php
}

// 2. Inject Consultation CTA Box at the bottom of Journal Archive
add_action('astra_primary_content_bottom', 'ni_render_journal_bottom_cta', 20);
function ni_render_journal_bottom_cta() {
    if (!is_home() || is_front_page()) {
        return;
    }
    ?>
    <section class="ni-journal-cta-wrap">
        <div class="ni-journal-cta-card">
            <div class="ni-cta-content">
                <span class="ni-cta-badge">Virtual Brafitting Support</span>
                <h3 class="ni-cta-heading">Unsure About Your European Bra Size or Sister Size?</h3>
                <p class="ni-cta-desc">
                    European bra sizing uses precise centimeter increments and multi-part seamed architecture. Our virtual head bra fitter <strong>Klara</strong> is available 24/7 in the bottom-right corner to convert your US measurements, resolve cup depth dilemmas, or recommend matching sets.
                </p>
                <div class="ni-cta-actions">
                    <a href="<?php echo esc_url(home_url('/size-guide/')); ?>" class="ni-cta-btn ni-cta-btn-primary">View Size &amp; Conversion Guide</a>
                    <button type="button" class="ni-cta-btn ni-cta-btn-secondary" onclick="window.NaturaConcierge && window.NaturaConcierge.open ? window.NaturaConcierge.open() : (document.getElementById('ni-concierge-toggle') ? document.getElementById('ni-concierge-toggle').click() : null)">
                        💬 Ask Fit Concierge Klara
                    </button>
                </div>
            </div>
        </div>
    </section>
    <?php
}

// 3. Inject "Read Full Guide" link at bottom of each article card
add_action('astra_entry_content_after', 'ni_journal_card_read_more_link');
function ni_journal_card_read_more_link() {
    if (!is_home() || is_front_page()) {
        return;
    }
    ?>
    <div class="ni-card-read-more">
        <a href="<?php the_permalink(); ?>" class="ni-read-more-btn">
            <span>Read Full Guide</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </a>
    </div>
    <?php
}

// 4. Inject Editorial Custom Styling into Head
add_action('wp_head', 'ni_journal_editorial_styles', 99);
function ni_journal_editorial_styles() {
    if (!is_home() && !is_category() && !is_page('journal')) {
        return;
    }
    ?>
    <style id="ni-journal-luxury-styles">
        /* Hero Section */
        .ni-journal-hero-wrap {
            background: linear-gradient(180deg, #fdfbf9 0%, #f7f1ee 100%);
            border: 1px solid #ebdcd5;
            border-radius: 20px;
            padding: 44px 28px 38px;
            margin: 0 0 36px 0;
            text-align: center;
            box-shadow: 0 8px 30px rgba(45, 30, 38, 0.04);
        }
        .ni-journal-hero-inner {
            max-width: 860px;
            margin: 0 auto;
        }
        .ni-journal-badge {
            display: inline-block;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.16em;
            color: #93566a;
            background: #fff;
            border: 1px solid #eed8df;
            padding: 5px 14px;
            border-radius: 30px;
            margin-bottom: 14px;
            box-shadow: 0 2px 8px rgba(147, 86, 106, 0.06);
        }
        .ni-journal-title {
            font-size: 2.1rem;
            font-weight: 700;
            color: #2d1e26;
            line-height: 1.25;
            margin: 0 0 14px 0;
            font-family: Georgia, 'Playfair Display', -apple-system, BlinkMacSystemFont, serif;
        }
        .ni-journal-subtitle {
            font-size: 15px;
            color: #6a5762;
            line-height: 1.6;
            margin: 0 auto 24px;
            max-width: 700px;
        }
        .ni-journal-pills {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 10px;
        }
        .ni-pill {
            display: inline-flex;
            align-items: center;
            font-size: 13px;
            font-weight: 600;
            color: #4f3b46;
            background: #ffffff;
            border: 1px solid #dec9c1;
            padding: 7px 16px;
            border-radius: 24px;
            text-decoration: none;
            transition: all 0.25s ease;
        }
        .ni-pill:hover {
            border-color: #93566a;
            color: #93566a;
            background: #fdf5f7;
            transform: translateY(-1px);
        }
        .ni-pill.active {
            background: #2d1e26;
            color: #ffffff;
            border-color: #2d1e26;
        }
        .ni-pill-accent {
            background: #93566a;
            color: #ffffff !important;
            border-color: #93566a;
        }
        .ni-pill-accent:hover {
            background: #783e52 !important;
            color: #ffffff !important;
            border-color: #783e52 !important;
        }

        /* Post Cards Grid Polish */
        .blog .ast-article-post,
        .archive .ast-article-post {
            background: #ffffff !important;
            border: 1px solid #ecdcd5 !important;
            border-radius: 16px !important;
            overflow: hidden !important;
            box-shadow: 0 6px 24px rgba(45, 30, 38, 0.04) !important;
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease !important;
            display: flex !important;
            flex-direction: column !important;
            margin-bottom: 30px !important;
        }
        .blog .ast-article-post:hover,
        .archive .ast-article-post:hover {
            transform: translateY(-6px) !important;
            box-shadow: 0 16px 36px rgba(45, 30, 38, 0.09) !important;
            border-color: #d9bfb4 !important;
        }
        .blog .ast-article-inner,
        .archive .ast-article-inner {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .blog .post-content,
        .archive .post-content {
            padding: 24px 22px 20px !important;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }
        /* Featured Image Styling */
        .blog .post-thumb-img-content,
        .archive .post-thumb-img-content,
        .blog .ast-blog-featured-section,
        .archive .ast-blog-featured-section {
            margin: 0 !important;
            overflow: hidden;
            background: #f8f3f0;
        }
        .blog .post-thumb-img-content img,
        .archive .post-thumb-img-content img {
            width: 100% !important;
            height: 230px !important;
            object-fit: cover !important;
            object-position: center top !important;
            display: block;
            transition: transform 0.45s ease;
        }
        .blog .ast-article-post:hover .post-thumb-img-content img,
        .archive .ast-article-post:hover .post-thumb-img-content img {
            transform: scale(1.04);
        }

        /* Category Badge */
        .blog .ast-taxonomy-container,
        .archive .ast-taxonomy-container {
            margin-bottom: 10px !important;
        }
        .blog .ast-taxonomy-container a,
        .archive .ast-taxonomy-container a {
            display: inline-block !important;
            background: #fbf0f3 !important;
            color: #93566a !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.08em !important;
            padding: 4px 11px !important;
            border-radius: 20px !important;
            text-decoration: none !important;
            transition: background 0.2s ease !important;
        }
        .blog .ast-taxonomy-container a:hover,
        .archive .ast-taxonomy-container a:hover {
            background: #f5dde4 !important;
        }

        /* Post Title */
        .blog .entry-title,
        .archive .entry-title {
            font-size: 1.25rem !important;
            font-weight: 700 !important;
            line-height: 1.35 !important;
            margin: 0 0 10px 0 !important;
        }
        .blog .entry-title a,
        .archive .entry-title a {
            color: #2d1e26 !important;
            text-decoration: none !important;
            transition: color 0.2s ease !important;
        }
        .blog .entry-title a:hover,
        .archive .entry-title a:hover {
            color: #93566a !important;
        }

        /* Post Meta */
        .blog .entry-meta,
        .archive .entry-meta {
            font-size: 12.5px !important;
            color: #8c7682 !important;
            margin-bottom: 14px !important;
        }
        .blog .entry-meta a,
        .archive .entry-meta a {
            color: #8c7682 !important;
            font-weight: 600 !important;
            text-decoration: none !important;
        }

        /* Excerpt */
        .blog .ast-entry-content,
        .archive .ast-entry-content,
        .blog .entry-content,
        .archive .entry-content {
            color: #55444e !important;
            font-size: 13.8px !important;
            line-height: 1.6 !important;
            margin-bottom: 18px !important;
            flex-grow: 1;
        }

        /* Read More Footer Link */
        .ni-card-read-more {
            margin-top: auto;
            padding-top: 14px;
            border-top: 1px solid #f3e9e4;
        }
        .ni-read-more-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 13.5px;
            font-weight: 700;
            color: #93566a;
            text-decoration: none;
            transition: all 0.2s ease;
        }
        .ni-read-more-btn:hover {
            color: #783e52;
            gap: 10px;
        }

        /* Bottom Consultation CTA */
        .ni-journal-cta-wrap {
            margin: 40px 0 20px;
        }
        .ni-journal-cta-card {
            background: linear-gradient(135deg, #2d1e26 0%, #3e2632 100%);
            color: #ffffff;
            border-radius: 20px;
            padding: 40px 36px;
            box-shadow: 0 12px 36px rgba(45, 30, 38, 0.15);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 30px;
            flex-wrap: wrap;
        }
        .ni-cta-content {
            max-width: 650px;
        }
        .ni-cta-badge {
            display: inline-block;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            color: #e4a8b7;
            margin-bottom: 8px;
        }
        .ni-cta-heading {
            font-size: 1.65rem;
            font-weight: 700;
            color: #ffffff !important;
            line-height: 1.3;
            margin: 0 0 10px 0;
            font-family: Georgia, 'Playfair Display', serif;
        }
        .ni-cta-desc {
            font-size: 14px;
            color: #dec8d3;
            line-height: 1.6;
            margin: 0;
        }
        .ni-cta-actions {
            display: flex;
            flex-direction: column;
            gap: 12px;
            min-width: 240px;
        }
        .ni-cta-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 13px 22px;
            font-size: 13.5px;
            font-weight: 700;
            border-radius: 30px;
            text-decoration: none;
            transition: all 0.25s ease;
            cursor: pointer;
            border: none;
            text-align: center;
        }
        .ni-cta-btn-primary {
            background: #93566a;
            color: #ffffff !important;
        }
        .ni-cta-btn-primary:hover {
            background: #a9667c;
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(147, 86, 106, 0.4);
        }
        .ni-cta-btn-secondary {
            background: rgba(255, 255, 255, 0.12);
            color: #ffffff !important;
            border: 1px solid rgba(255, 255, 255, 0.25);
        }
        .ni-cta-btn-secondary:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }

        @media (max-width: 768px) {
            .ni-journal-hero-wrap {
                padding: 30px 18px 24px;
            }
            .ni-journal-title {
                font-size: 1.6rem;
            }
            .ni-journal-cta-card {
                padding: 28px 20px;
            }
            .ni-cta-heading {
                font-size: 1.35rem;
            }
            .ni-cta-actions {
                width: 100%;
                min-width: 100%;
            }
        }
    </style>
    <?php
}
