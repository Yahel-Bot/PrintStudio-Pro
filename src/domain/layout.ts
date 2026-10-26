export type Orientation = 'portrait' | 'landscape';

export function getLayoutDimensions(layout: number, orientation: Orientation) {
  const landscape = orientation === 'landscape';
  const fixed: Record<number, [number, number]> = {
    1: [1, 1], 2: landscape ? [1, 2] : [2, 1], 3: landscape ? [1, 3] : [3, 1],
    4: [2, 2], 5: landscape ? [2, 3] : [3, 2], 7: landscape ? [2, 4] : [4, 2],
    8: landscape ? [2, 4] : [4, 2], 9: [3, 3], 10: landscape ? [2, 5] : [5, 2],
    35: landscape ? [5, 7] : [7, 5]
  };
  const pair = fixed[Number(layout)];
  if (pair) return { rows: pair[0], cols: pair[1] };
  const count = Math.max(1, Number(layout) || 1);
  const cols = landscape ? Math.ceil(Math.sqrt(count * 1.3)) : Math.max(1, Math.floor(Math.sqrt(count * 0.77)));
  return { rows: Math.ceil(count / cols), cols };
}

export function getPaperAspectRatio(paperSize: string, orientation: Orientation) {
  const sizes: Record<string, [number, number]> = {
    Carta: [8.5, 11], Oficio: [8.5, 14], 'Oficio México': [8.5, 13.4], 'Doble Carta / Tabloide': [11, 17]
  };
  const [width, height] = sizes[paperSize] || sizes.Carta;
  return orientation === 'landscape' ? height / width : width / height;
}
