export function seededChoice<T>(key: string, items: T[]): T | null {
  if (!items?.length) return null;
  const storeKey = `zone-seed:${key}`;
  let seed = sessionStorage.getItem(storeKey);
  if (!seed) {
    const u = new Uint32Array(1);
    crypto.getRandomValues(u);
    seed = String(u[0]);
    sessionStorage.setItem(storeKey, seed);
  }
  const idx = mulberry32(Number(seed))() * items.length | 0;
  return items[Math.max(0, Math.min(items.length - 1, idx))];
}

export function mulberry32(a: number) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function seededRandom(seed: number) {
  return mulberry32(seed);
}
