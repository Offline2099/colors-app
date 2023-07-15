
export interface TopLevelBlock {
  id: number;
  menuBtnText: string;
  selected: boolean;
}

export interface ColorRGB {
  r: number; g: number; b: number;
}

export interface ColorHSL {
  h: number; s: number; l: number;
}

export interface ColorCMYK {
  c: number; m: number; y: number; k: number;
}

export interface Color {
  rgb: ColorRGB;
  hsl: ColorHSL;
  cmyk: ColorCMYK;
}

export interface Range {
  id: string; min: number; max: number;
}

export interface RangeList {
  rgb: Range[]; hsl: Range[]; cmyk: Range[];
}
