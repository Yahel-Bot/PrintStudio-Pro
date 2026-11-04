export type Orientation = 'portrait' | 'landscape';

export interface PaperSizeSpec {
  widthInches: number;
  heightInches: number;
  label: string;
}

export const PAPER_SPECS: Record<string, PaperSizeSpec> = {
  'Carta': { widthInches: 8.5, heightInches: 11.0, label: 'Carta (8.5" × 11")' },
  'Oficio': { widthInches: 8.5, heightInches: 14.0, label: 'Oficio (8.5" × 14")' },
  'Oficio México': { widthInches: 8.5, heightInches: 13.4, label: 'Oficio México (8.5" × 13.4")' },
  'A4': { widthInches: 8.27, heightInches: 11.69, label: 'A4 (210 × 297 mm)' },
  'Doble Carta / Tabloide': { widthInches: 11.0, heightInches: 17.0, label: 'Doble Carta / Tabloide (11" × 17")' }
};

export function getLayoutDimensions(layout: number, orientation: Orientation) {
  const landscape = orientation === 'landscape';
  const fixed: Record<number, [number, number]> = {
    1: [1, 1], 
    2: landscape ? [1, 2] : [2, 1], 
    3: landscape ? [1, 3] : [3, 1],
    4: [2, 2], 
    5: landscape ? [2, 3] : [3, 2],
    6: landscape ? [2, 3] : [3, 2],
    7: landscape ? [2, 4] : [4, 2],
    8: landscape ? [2, 4] : [4, 2], 
    9: [3, 3], 
    10: landscape ? [2, 5] : [5, 2],
    35: landscape ? [5, 7] : [7, 5]
  };
  const pair = fixed[Number(layout)];
  if (pair) return { rows: pair[0], cols: pair[1] };
  const count = Math.max(1, Number(layout) || 1);
  const cols = landscape ? Math.ceil(Math.sqrt(count * 1.3)) : Math.max(1, Math.floor(Math.sqrt(count * 0.77)));
  return { rows: Math.ceil(count / cols), cols };
}

export function getPaperAspectRatio(paperSize: string, orientation: Orientation) {
  const spec = PAPER_SPECS[paperSize] || PAPER_SPECS['Carta'];
  const w = orientation === 'landscape' ? spec.heightInches : spec.widthInches;
  const h = orientation === 'landscape' ? spec.widthInches : spec.heightInches;
  return w / h;
}

export function getPreviewDimensions(paperSize: string, orientation: Orientation, boundingBox = { maxW: 520, maxH: 520 }) {
  const spec = PAPER_SPECS[paperSize] || PAPER_SPECS['Carta'];
  const widthIn = orientation === 'landscape' ? spec.heightInches : spec.widthInches;
  const heightIn = orientation === 'landscape' ? spec.widthInches : spec.heightInches;
  
  const targetMaxW = orientation === 'landscape' ? Math.max(boundingBox.maxW, 520) : Math.min(boundingBox.maxW, 430);
  const targetMaxH = orientation === 'landscape' ? Math.min(boundingBox.maxH, 430) : Math.max(boundingBox.maxH, 520);

  const scale = Math.min(targetMaxW / widthIn, targetMaxH / heightIn);
  return {
    width: Math.round(widthIn * scale),
    height: Math.round(heightIn * scale),
    aspectRatio: widthIn / heightIn,
    widthInches: widthIn,
    heightInches: heightIn
  };
}
