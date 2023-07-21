
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


// Color Space Data

export interface Range {
  id: string; name: string;
  type: string;
  min: number; max: number;
}

export interface ColorSpace {
  name: string;
  ranges: Range[];
  notations: string[];
}


// UI Blocks

export interface MenuOption {
  id: number;
  optionText: string;
  selected: boolean;
}

export interface InputRange extends Range {
  value: number;
  step: number;
}

export interface InputRangeBlock {
  name: string;
  ranges: InputRange[];
}

export interface TextOutputBlock {
  space: string;
  notations: {
    name: string;
    values: string[];
  }[]
}

export interface InputIssue {
  text: string;
  details: {
    fragment: string;
    valid: boolean;
  }[];
}

export interface Converter {
  id: number;
  name: string;
  selected: boolean;
  instruction: string;
  examples: string[];
  inputNotations: {
    id: number;
    name: string;
    selected: boolean;
  }[];
  userInput: string;
  inputAccepted: boolean;
  inputError: boolean;
  errorList: InputIssue[];
  inputWarning: boolean;
  warningList: InputIssue[];
  color: Color;
}
