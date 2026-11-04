export type PricingMode = 'fixed' | 'smart';

export interface PricingPage {
  esColor: boolean;
  cobertura: number;
  pctColor?: number;
  esAltaDensidadBN: boolean;
  quantity?: number;
  colorOverride?: 'color' | 'bw' | null;
}

export interface PricingModel {
  tier1_rate: number; 
  tier2_rate: number; 
  tier3_rate: number; 
  tier4_rate: number;
  color_rate: number; 
  color_high_rate: number;
  cost_bw_high: number; 
  cost_base: number;
  tuning_factor: number;
  total_corrections: number;
}

export interface PricingConfig {
  costBase: number; costBW: number; costBWHigh: number; costColor: number;
  pricingMode: PricingMode; printColorMode: 'auto' | 'color' | 'bw'; copies: number;
}

export function isColorPage(page: PricingPage, mode: PricingConfig['printColorMode']) {
  if (page.colorOverride === 'color') return true;
  if (page.colorOverride === 'bw') return false;
  if (mode === 'color') return true;
  if (mode === 'bw') return false;
  return Boolean(page.esColor);
}

export function getBwVolumeTier(total: number, model: PricingModel) {
  if (total <= 50) return { rate: model.tier1_rate ?? 1, label: '1 - 50 copias', range: '1-50' };
  if (total <= 100) return { rate: model.tier2_rate ?? 0.8, label: '51 - 100 copias', range: '51-100' };
  if (total <= 200) return { rate: model.tier3_rate ?? 0.5, label: '101 - 200 copias', range: '101-200' };
  return { rate: model.tier4_rate ?? 0.4, label: '201+ copias', range: '201+' };
}

export function calculatePrintCosts(pages: PricingPage[], config: PricingConfig, model: PricingModel) {
  const copies = Math.max(1, config.copies || 1);
  const totalBw = pages.reduce((sum, page) => sum + (!isColorPage(page, config.printColorMode) ? Math.max(1, page.quantity || 1) * copies : 0), 0);
  const totalColor = pages.reduce((sum, page) => sum + (isColorPage(page, config.printColorMode) ? Math.max(1, page.quantity || 1) * copies : 0), 0);
  const tier = getBwVolumeTier(totalBw, model);
  const learnedFactor = Math.max(0.5, Math.min(2, model.tuning_factor || 1));
  // `costBW` is the configurable base price; the model keeps the relative
  // wholesale curve (1-50, 51-100, 101-200, 201+) instead of losing it.
  const bwRate = Math.max(0, config.costBW || 1) * tier.rate * learnedFactor;
  const colorRate = Math.max(0, config.costColor || model.color_rate || 3) * learnedFactor;
  let subtotal = 0;
  pages.forEach(page => {
    const color = isColorPage(page, config.printColorMode);
    const quantity = Math.max(1, page.quantity || 1) * copies;
    if (config.pricingMode === 'fixed') {
      subtotal += (color ? colorRate : (page.esAltaDensidadBN ? Math.max(config.costBWHigh, bwRate * 1.5) : bwRate)) * quantity;
      return;
    }
    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    if (color) {
      const colorShare = clamp((page.pctColor ?? (page.esColor ? 100 : 0)) / 100);
      const coverage = clamp((page.cobertura * colorShare) / 30);
      subtotal += (bwRate + (colorRate - bwRate) * coverage) * quantity;
    } else {
      const density = clamp((page.cobertura - 15) / 45);
      const high = Math.max(bwRate * 1.5, config.costBWHigh);
      subtotal += (bwRate + (high - bwRate) * density) * quantity;
    }
  });
  const baseFee = pages.length ? Math.max(0, config.costBase) : 0;
  return { subtotalTinta: subtotal, baseFee, calculatedTotal: subtotal + baseFee, totalBwImpressions: totalBw, totalColorImpressions: totalColor, bwTier: { ...tier, rate: tier.rate } };
}
