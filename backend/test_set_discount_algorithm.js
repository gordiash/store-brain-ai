// Test matching pairs discount algorithm
const cart = [
  { product_id: 3777, name: 'Gaia Isla Bra White', qty: 1, matching_id: 3810 },
  { product_id: 3810, name: 'Gaia Isla Briefs White', qty: 1, matching_id: 3777 }
];

function calculateDiscount(items) {
  const productQuantities = {};
  items.forEach(item => {
    productQuantities[item.product_id] = (productQuantities[item.product_id] || 0) + item.qty;
  });

  const processed = new Set();
  let totalSets = 0;

  for (const item of items) {
    const pid = item.product_id;
    const matchId = item.matching_id;

    if (processed.has(pid) || !matchId || processed.has(matchId)) {
      continue;
    }

    if (productQuantities[matchId]) {
      const sets = Math.min(productQuantities[pid], productQuantities[matchId]);
      totalSets += sets;
      processed.add(pid);
      processed.add(matchId);
    }
  }

  return { totalSets, discount: totalSets * 10 };
}

console.log('1 Set:', calculateDiscount(cart));

const cart2 = [
  { product_id: 3777, qty: 2, matching_id: 3810 },
  { product_id: 3810, qty: 1, matching_id: 3777 }
];
console.log('2 Bras + 1 Bottom:', calculateDiscount(cart2)); // Should be 1 set ($10)

const cart3 = [
  { product_id: 3777, qty: 2, matching_id: 3810 },
  { product_id: 3810, qty: 2, matching_id: 3777 }
];
console.log('2 Bras + 2 Bottoms:', calculateDiscount(cart3)); // Should be 2 sets ($20)
