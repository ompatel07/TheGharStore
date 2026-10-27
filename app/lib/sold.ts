// "Units sold" badge from the merchant's figure (product metafield
// custom.units_sold, set in Shopify admin). The figure must never exceed real
// units sold; the badge rounds it DOWN again (to tens, or hundreds above
// 1,000) so it can only understate: 347 → "340+ sold". Empty / under 50 → hidden.

export function soldLabel(value: string | null | undefined): string | null {
  const count = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(count) || count < 50) return null;
  const step = count >= 1000 ? 100 : 10;
  const floor = Math.floor(count / step) * step;
  return `${floor.toLocaleString("en-IN")}+ sold`;
}
