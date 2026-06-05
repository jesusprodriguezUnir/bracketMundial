async function test() {
  try {
    const text = "From futsal to the World Cup via England’s lower leagues, Raya’s career is unlike any other.";
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const translated = json[0].map(s => s[0]).join('');
    console.log("SUCCESS:", translated);
  } catch (e) {
    console.error("FAILED:", e.message);
  }
}
test();
