
// Color Data

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
  hex: string;
}


// Ranges

export interface Range {
  id: string; min: number; max: number;
}

export interface ColorRangeList {
  rgb: Range[]; hsl: Range[]; cmyk: Range[];
}


// UI Blocks

export interface TopLevelBlock {
  id: number;
  menuBtnText: string;
  selected: boolean;
}

export interface TextOutputBlock {
  header: string;
  notations: {
    name: string;
    values: string[];
  }[]
}

export interface InputRange extends Range {
  header: string;
  value: number;
  step: number;
}

