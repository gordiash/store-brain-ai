import fs from 'fs';

const products = [
  {
    name: "Gorsenia Nadine Soft Bra Multicolor",
    tag: "Soft Bra · 65F–115D",
    badge: "Bestseller",
    price: "$95.99",
    url: "/produkt/bra-soft-gorsenia-g-014-nadine/",
    image: "https://naturaintimo.com/wp-content/uploads/2026/09/414790.jpg"
  },
  {
    name: "Gorsenia Nadine Panties Multicolor",
    tag: "Matching Bottom · M–3XL",
    badge: "Matching Set",
    price: "$46.99",
    url: "/produkt/panties-gorsenia-f-014-nadine-m-4xl/",
    image: "https://naturaintimo.com/wp-content/uploads/2026/09/414796.jpg"
  },
  {
    name: "Gaia Isla Semi-Soft Bra White",
    tag: "Semi-Soft Bra · 65F–95I",
    badge: "Bridal White",
    price: "$85.99",
    url: "/produkt/bra-semi-soft-gaia-bs-1228-isla-bialy/",
    image: "https://naturaintimo.com/wp-content/uploads/2026/09/397779.jpg"
  },
  {
    name: "Gaia Isla Bikini Briefs White",
    tag: "Briefs · S–L",
    badge: "Matching Set",
    price: "$38.99",
    url: "/produkt/panties-gaia-gfp-1228-isla-s-xl-bialy/",
    image: "https://naturaintimo.com/wp-content/uploads/2026/09/397785.jpg"
  },
  {
    name: "Gaia Isla Semi Soft Bra Black",
    tag: "Semi-Soft Bra · 80B–65J",
    badge: "Classic Noir",
    price: "$87.99",
    url: "/produkt/bra-semi-soft-gaia-bs-1228-isla/",
    image: "https://naturaintimo.com/wp-content/uploads/2026/09/400318.jpg"
  },
  {
    name: "Gaia Isla Panties Black",
    tag: "Briefs · M–3XL",
    badge: "Matching Set",
    price: "$38.99",
    url: "/produkt/panties-gaia-gfp-1228-isla-s-2xl/",
    image: "https://naturaintimo.com/wp-content/uploads/2026/09/400320.jpg"
  },
  {
    name: "Gaia BS 1135 Nike Soft Bra Beige",
    tag: "Soft Bra · 65E–95E",
    badge: "Everyday Nude",
    price: "$84.99",
    url: "/produkt/bra-soft-gaia-bs-1135-nike-2/",
    image: "https://naturaintimo.com/wp-content/uploads/2026/09/349715.jpg"
  },
  {
    name: "Gaia Nike Brazilian Briefs Beige",
    tag: "Brazilian Cut · 2XL–L",
    badge: "Matching Set",
    price: "$44.99",
    url: "/produkt/panties-gaia-gfb-1135-nike-brazyliany-s-xl-bezowy/",
    image: "https://naturaintimo.com/wp-content/uploads/2026/09/349605.jpg"
  }
];

function generateCarouselHtml() {
  const cardsHtml = products.map((p, idx) => `
    <div class="ni-c-item">
      <a href="${p.url}" class="ni-c-card" aria-label="${p.name}">
        <div class="ni-c-media">
          ${p.badge ? `<span class="ni-c-badge">${p.badge}</span>` : ''}
          <img src="${p.image}" alt="${p.name}" loading="lazy" width="400" height="533" />
        </div>
        <div class="ni-c-details">
          <div class="ni-c-tag">${p.tag}</div>
          <h3 class="ni-c-name">${p.name}</h3>
          <div class="ni-c-foot">
            <span class="ni-c-price">${p.price}</span>
            <span class="ni-c-btn">View Details →</span>
          </div>
        </div>
      </a>
    </div>`).join('');

  return `
<section class="ni-carousel-section">
  <div class="ni-c-container">
    <div class="ni-c-header">
      <div class="ni-c-header-left">
        <div class="ni-kicker">Featured Collection</div>
        <h2 class="ni-c-title">Trending European Styles</h2>
        <p class="ni-c-subtitle">Handcrafted lingerie designed for support, elegance, and all-day comfort. Pair your favorite bra with its matching bottom.</p>
      </div>
      <div class="ni-c-nav">
        <button type="button" class="ni-c-arrow" id="niPrevBtn" aria-label="Previous items">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button type="button" class="ni-c-arrow" id="niNextBtn" aria-label="Next items">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>

    <div class="ni-c-track-wrapper">
      <div class="ni-c-track" id="niTrack">
        ${cardsHtml}
      </div>
    </div>
  </div>
</section>

<style>
.ni-carousel-section {
  padding: 64px 24px;
  background: #fff;
  border-top: 1px solid #f3e9ec;
  border-bottom: 1px solid #f3e9ec;
}
.ni-c-container {
  max-width: 1200px;
  margin: 0 auto;
}
.ni-c-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 32px;
}
.ni-c-header-left {
  max-width: 640px;
}
.ni-c-title {
  font-size: clamp(1.8rem, 3.5vw, 2.5rem);
  line-height: 1.15;
  margin: 8px 0 10px 0;
  color: var(--ink, #30252b);
}
.ni-c-subtitle {
  font-size: 1rem;
  line-height: 1.5;
  color: #6a5760;
  margin: 0;
}
.ni-c-nav {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}
.ni-c-arrow {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid #e2d2d7;
  background: #fff;
  color: var(--ink, #30252b);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(48,37,43,0.05);
}
.ni-c-arrow:hover {
  background: var(--ink, #30252b);
  color: #fff;
  border-color: var(--ink, #30252b);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(48,37,43,0.15);
}
.ni-c-track-wrapper {
  position: relative;
  margin: 0 -12px;
  padding: 0 12px;
}
.ni-c-track {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 20px;
  padding-top: 6px;
  scrollbar-width: none;
}
.ni-c-track::-webkit-scrollbar {
  display: none;
}
.ni-c-item {
  flex: 0 0 calc((100% - 60px) / 4);
  min-width: 240px;
  scroll-snap-align: start;
}
.ni-c-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 20px;
  border: 1px solid #ebdfe3;
  overflow: hidden;
  text-decoration: none !important;
  color: var(--ink, #30252b) !important;
  box-shadow: 0 8px 24px rgba(48,37,43,0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.ni-c-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 36px rgba(48,37,43,0.12);
}
.ni-c-media {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: #faf4f6;
}
.ni-c-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  display: block;
  transition: transform 0.5s ease;
}
.ni-c-card:hover .ni-c-media img {
  transform: scale(1.05);
}
.ni-c-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(8px);
  color: var(--ink, #30252b);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 4px 10px;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  z-index: 2;
}
.ni-c-details {
  padding: 18px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
}
.ni-c-tag {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--rose, #b86f82);
  margin-bottom: 6px;
}
.ni-c-name {
  font-size: 0.98rem;
  font-weight: 600;
  line-height: 1.35;
  margin: 0 0 14px 0;
  color: var(--ink, #30252b);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.7em;
}
.ni-c-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f6edf0;
}
.ni-c-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ink, #30252b);
}
.ni-c-btn {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--rose, #b86f82);
  transition: transform 0.2s ease, color 0.2s ease;
}
.ni-c-card:hover .ni-c-btn {
  color: var(--ink, #30252b);
  transform: translateX(3px);
}

@media (max-width: 1024px) {
  .ni-c-item {
    flex: 0 0 calc((100% - 40px) / 3);
  }
}
@media (max-width: 768px) {
  .ni-c-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .ni-c-nav {
    display: none; /* Swipe is standard & natural on touch devices */
  }
  .ni-c-item {
    flex: 0 0 78%;
    min-width: 220px;
  }
  .ni-carousel-section {
    padding: 48px 16px;
  }
}
</style>

<script>
(function() {
  function initNiCarousel() {
    var track = document.getElementById('niTrack');
    var prev = document.getElementById('niPrevBtn');
    var next = document.getElementById('niNextBtn');
    if (!track || !prev || !next) return;

    function getScrollStep() {
      var firstCard = track.querySelector('.ni-c-item');
      if (!firstCard) return 300;
      return (firstCard.offsetWidth + 20) * 2; // Scroll 2 cards at a time on desktop
    }

    prev.addEventListener('click', function() {
      track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
    });

    next.addEventListener('click', function() {
      track.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
    });

    function updateArrows() {
      var maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 5) {
        prev.style.opacity = '0.35';
        prev.style.pointerEvents = 'none';
        next.style.opacity = '0.35';
        next.style.pointerEvents = 'none';
        return;
      }
      prev.style.opacity = track.scrollLeft <= 10 ? '0.35' : '1';
      prev.style.pointerEvents = track.scrollLeft <= 10 ? 'none' : 'auto';

      next.style.opacity = track.scrollLeft >= maxScroll - 10 ? '0.35' : '1';
      next.style.pointerEvents = track.scrollLeft >= maxScroll - 10 ? 'none' : 'auto';
    }

    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    updateArrows();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNiCarousel);
  } else {
    initNiCarousel();
  }
})();
</script>
`;
}

console.log("Generated Carousel HTML length:", generateCarouselHtml().length);
