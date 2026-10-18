import fs from 'fs';

const audit = JSON.parse(fs.readFileSync('mada_stock_audit.json', 'utf-8'));

function isBra(name) {
  if (/brazilian|brazyliany/i.test(name)) return false;
  return /\b(bra|biustonosz|semi-soft|soft|full cup|push-up)\b/i.test(name);
}

function getRecommendedProduct(cartProductIds, subtotal) {
  // 1. Find if any cart product has a matching product not in cart
  let targetProduct = null;
  let reason = '';

  for (const pid of cartProductIds) {
    const p = audit.find(x => x.wcId === pid);
    if (!p) continue;

    // Check if there's a paired counterpart
    // In our audit mapping, let's look for matching pair
    const pIsBra = isBra(p.wcName);
    // Search candidates in audit with same collection keywords
    const keywords = ['nadine', 'isla', 'nike', '1030', '1396', '2103', '2106', '2110', '2111', '2271', 'anita', 'ida', 'petra', 'paradise', 'alicante', 'yoko', 'luisse', 'sonia', 'veronika', 'keto', 'aina', 'mary', 'charlotte', 'ariarosa', 'infinity'];
    
    let matchedKw = keywords.find(k => new RegExp(k, 'i').test(p.wcName));
    if (matchedKw) {
      const counterpart = audit.find(c => c.wcId !== pid && new RegExp(matchedKw, 'i').test(c.wcName) && (pIsBra ? !isBra(c.wcName) : isBra(c.wcName)));
      if (counterpart && !cartProductIds.includes(counterpart.wcId)) {
        targetProduct = counterpart;
        reason = pIsBra ? 'Complete your set with the matching bottom' : 'Complete your set with the matching bra';
        break;
      }
    }
  }

  // 2. Fallback if no matching partner found (or both already in cart)
  if (!targetProduct) {
    // Recommend top bestselling briefs (e.g. Gaia Isla Briefs 3810 or Ava 1030 659)
    targetProduct = audit.find(x => x.wcId === 3810) || audit[0];
    reason = 'Add extra matching luxury briefs';
  }

  // Determine threshold tier
  let tier = '';
  let diff = 0;
  if (subtotal < 99) {
    tier = 'MIN_ORDER';
    diff = (99 - subtotal).toFixed(2);
  } else if (subtotal < 150) {
    tier = 'FREE_SHIPPING';
    diff = (150 - subtotal).toFixed(2);
  } else if (subtotal < 199) {
    tier = 'FREE_DUTIES';
    diff = (199 - subtotal).toFixed(2);
  } else {
    tier = 'ALL_UNLOCKED';
    diff = 0;
  }

  return {
    tier,
    diff,
    reason,
    product: targetProduct.wcName,
    id: targetProduct.wcId
  };
}

console.log('Case 1: Only Briefs ($38.99 in cart):', getRecommendedProduct([3810], 38.99));
console.log('Case 2: Only Bra ($85.99 in cart):', getRecommendedProduct([3777], 85.99));
console.log('Case 3: Complete Set ($114.98 in cart):', getRecommendedProduct([3777, 3810], 114.98));
console.log('Case 4: High Cart ($165.00 in cart):', getRecommendedProduct([3874, 3932, 3810], 165.00));
