async function getCrashContext() {
  const res = await fetch('https://naturaintimo.com/sklep/?min_price=30&max_price=80');
  const text = await res.text();
  // Find where the second <!DOCTYPE or error starts
  const firstDoc = text.indexOf('<!DOCTYPE');
  const secondDoc = text.indexOf('<!DOCTYPE', firstDoc + 10);
  console.log('firstDoc:', firstDoc, 'secondDoc:', secondDoc);

  if (secondDoc !== -1) {
    console.log('--- 1500 chars before second <!DOCTYPE ---');
    console.log(text.substring(secondDoc - 1500, secondDoc));
  } else {
    console.log('No second <!DOCTYPE');
    const błądIdx = text.indexOf('Błąd');
    console.log('Błąd idx:', błądIdx);
    if (błądIdx !== -1) {
      console.log(text.substring(błądIdx - 500, błądIdx + 500));
    }
  }
}
getCrashContext().catch(console.error);
