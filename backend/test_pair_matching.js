import fs from 'fs';

const audit = JSON.parse(fs.readFileSync('mada_stock_audit.json', 'utf-8'));

// Collections keywords and their bra/bottom mappings
const collections = [
  { name: 'Nadine', pattern: /nadine/i },
  { name: 'Isla White', pattern: /isla.*(white|bia\w+)|(white|bia\w+).*isla/i },
  { name: 'Isla Black', pattern: /isla/i }, // fallback if not white
  { name: 'Nike', pattern: /nike|1135/i },
  { name: 'Ava 1030', pattern: /1030/i },
  { name: 'Ava 1396', pattern: /1396/i },
  { name: 'Ava 2103', pattern: /2103/i },
  { name: 'Ava 2106', pattern: /2106/i },
  { name: 'Ava 2110', pattern: /2110/i },
  { name: 'Ava 2111', pattern: /2111/i },
  { name: 'Ava 2271 Divine', pattern: /2271|divine/i },
  { name: 'Mefemi Anita', pattern: /anita/i },
  { name: 'Mefemi Ida', pattern: /ida/i },
  { name: 'Mefemi Petra', pattern: /petra/i },
  { name: 'Gorsenia Paradise', pattern: /paradise|496/i },
  { name: 'Gorsenia Alicante', pattern: /alicante|647|649/i },
  { name: 'Gorsenia Yoko', pattern: /yoko|810|811/i },
  { name: 'Gorsenia Luisse Black', pattern: /luisse.*(black|czar\w+)|(black|czar\w+).*luisse/i },
  { name: 'Gorsenia Luisse Beige', pattern: /luisse/i }, // fallback beige
  { name: 'Gaia Sonia', pattern: /sonia/i },
  { name: 'Gaia Veronika', pattern: /veronika/i },
  { name: 'Gaia Keto', pattern: /keto/i },
  { name: 'Gaia Aina', pattern: /aina/i },
  { name: 'Gaia Mary', pattern: /mary/i },
  { name: 'Gaia Charlotte', pattern: /charlotte/i },
  { name: 'Gaia Ariarosa Black', pattern: /ariarosa/i },
  { name: 'Julimex Infinity', pattern: /infinity/i }
];

function isBra(name) {
  // Be careful: 'brazilian' contains 'bra', so check word boundaries or exclusions
  if (/brazilian|brazyliany/i.test(name)) return false;
  return /\b(bra|biustonosz|semi-soft|soft|full cup|push-up)\b/i.test(name);
}

function isBottom(name) {
  return /panties|briefs|brazilian|majtki|figi|brazyliany/i.test(name);
}

const productMap = audit.map(p => ({
  id: p.wcId,
  name: p.wcName,
  isBra: isBra(p.wcName),
  isBottom: isBottom(p.wcName)
}));

console.log('Testing pair resolution for all 59 products:');
let pairedCount = 0;
const pairs = [];

productMap.forEach(p => {
  // Find collection
  let matchedCol = null;
  for (const col of collections) {
    if (col.pattern.test(p.name)) {
      matchedCol = col;
      break;
    }
  }

  // Find counterpart
  let counterpart = null;
  if (matchedCol) {
    const candidates = productMap.filter(c => c.id !== p.id && matchedCol.pattern.test(c.name));
    if (p.isBra) {
      counterpart = candidates.find(c => c.isBottom) || candidates[0];
    } else {
      counterpart = candidates.find(c => c.isBra) || candidates[0];
    }
  }

  if (counterpart) {
    pairedCount++;
    pairs.push({
      id: p.id,
      name: p.name,
      type: p.isBra ? 'BRA' : 'BOTTOM',
      counterpartId: counterpart.id,
      counterpartName: counterpart.name
    });
  } else {
    pairs.push({
      id: p.id,
      name: p.name,
      type: p.isBra ? 'BRA' : (p.isBottom ? 'BOTTOM' : 'OTHER'),
      counterpartId: null,
      counterpartName: 'NO COUNTERPART FOUND'
    });
  }
});

console.log(`Successfully paired: ${pairedCount} / ${productMap.length}`);
console.log('\nUnpaired products:');
pairs.filter(p => !p.counterpartId).forEach(p => console.log(`- ${p.id}: ${p.name}`));

console.log('\nSample 10 pairs:');
pairs.slice(0, 10).forEach(p => {
  console.log(`[${p.type}] ${p.id} (${p.name.substring(0, 30)}) ➔ [PARTNER] ${p.counterpartId} (${p.counterpartName.substring(0, 30)})`);
});
