import fs from 'fs';

const audit = JSON.parse(fs.readFileSync('mada_stock_audit.json', 'utf-8'));

console.log('Auditing 59 products for set matching:');
const products = audit.map(p => {
  const name = p.wcName;
  // Determine type: Bra vs Panties/Briefs
  const isBra = /bra|biustonosz/i.test(name);
  const isBottom = /panties|briefs|brazilian|majtki|figi|brazyliany/i.test(name);
  
  // Extract brand
  let brand = 'Other';
  if (/gorsenia/i.test(name)) brand = 'Gorsenia';
  else if (/gaia/i.test(name)) brand = 'Gaia';
  else if (/ava/i.test(name)) brand = 'Ava';
  else if (/mefemi/i.test(name)) brand = 'Mefemi';
  else if (/julimex/i.test(name)) brand = 'Julimex';
  else if (/alles/i.test(name)) brand = 'Alles';

  return {
    id: p.wcId,
    name: name,
    brand: brand,
    type: isBra ? 'bra' : (isBottom ? 'bottom' : 'other'),
    madaId: p.madaId
  };
});

console.log('Breakdown by type:');
const bras = products.filter(p => p.type === 'bra');
const bottoms = products.filter(p => p.type === 'bottom');
const others = products.filter(p => p.type === 'other');

console.log(`Bras: ${bras.length}, Bottoms: ${bottoms.length}, Others: ${others.length}`);

// Print all bras and bottoms to see pairing patterns
console.log('\n--- BRAS ---');
bras.forEach(b => console.log(`${b.id}: [${b.brand}] ${b.name}`));

console.log('\n--- BOTTOMS ---');
bottoms.forEach(b => console.log(`${b.id}: [${b.brand}] ${b.name}`));
