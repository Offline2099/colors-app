import { Injectable } from '@angular/core';

import { 
  Color, ColorRGB, ColorHSL, ColorCMYK, ColorSpace} from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  constructor() { }

  private defaultColor: Color = {
    rgb: {r: 25, g: 90, b: 25},
    hsl: {h: 120, s: .57, l: .23},
    cmyk: {c: .72, m: 0, y: .72, k: .65},
    hex: '#195A19'
  }

  private colorSpaces: ColorSpace[] = [
    {
      name: 'RGB',
      ranges: [
        {id: 'r', name: 'Red', type: 'decimal', min: 0, max: 255},
        {id: 'g', name: 'Green', type: 'decimal', min: 0, max: 255},
        {id: 'b', name: 'Blue', type: 'decimal', min: 0, max: 255}
      ],
      notations: ['Decimal', 'Percentages', 'Arithmetic', 'Hexadecimal']
    },
    {
      name: 'HSL',
      ranges: [
        {id: 'h', name: 'Hue', type: 'degree', min: 0, max: 360},
        {id: 's', name: 'Saturation', type: 'percentage', min: 0, max: 1},
        {id: 'l', name: 'Lightness', type: 'percentage', min: 0, max: 1}
      ],
      notations: ['Percentages', 'Arithmetic']
    },
    {
      name: 'CMYK',
      ranges: [
        {id: 'c', name: 'Cyan', type: 'percentage', min: 0, max: 1},
        {id: 'm', name: 'Magenta', type: 'percentage', min: 0, max: 1},
        {id: 'y', name: 'Yellow', type: 'percentage', min: 0, max: 1},
        {id: 'k', name: 'Key', type: 'percentage', min: 0, max: 1}
      ],
      notations: ['Percentages', 'Arithmetic']
    }
  ];

  default(): Color {
    return this.defaultColor;
  }

  spaces(): ColorSpace[] {
    return this.colorSpaces;
  }

  space(name: string): ColorSpace | undefined {
    return this.colorSpaces.find(space => space.name == name);
  }

  setColorFromRGB(input: ColorRGB): Color {
    return {
      rgb: input,
      hsl: this.RGBtoHSL(input),
      cmyk: this.RGBtoCMYK(input),
      hex: this.RGBtoHex(input)
    }
  }

  setColorFromHSL(input: ColorHSL): Color {

    let rgb: ColorRGB = this.HSLtoRGB(input);

    return {
      rgb: rgb,
      hsl: input,
      cmyk: this.RGBtoCMYK(rgb),
      hex: this.RGBtoHex(rgb)
    }
  }

  setColorFromCMYK(input: ColorCMYK): Color {

    let rgb: ColorRGB = this.CMYKtoRGB(input);

    return {
      rgb: rgb,
      hsl: this.RGBtoHSL(rgb),
      cmyk: input,
      hex: this.RGBtoHex(rgb)
    }
  }

  RGBtoHSL(input: ColorRGB): ColorHSL {

    let R: number = input.r;
    let G: number = input.g;
    let B: number = input.b;

    let hsl: ColorHSL = {h: 0, s: 0, l: 0};

    let cmax: number = Math.max(R / 255, G / 255, B / 255);
    let cmin: number = Math.min(R / 255, G / 255, B / 255);

    hsl.l = (cmax + cmin) / 2; 

    if (cmax == cmin) return hsl;
 
    hsl.s = (cmax - cmin) / (1 - Math.abs(2 * hsl.l - 1));

    switch (cmax) {
      case R / 255:
        hsl.h = 60 * (((G / 255 - B / 255) / (cmax - cmin)) % 6);
        hsl.h = hsl.h >= 0 ? hsl.h : 360 + hsl.h;
        break;
      case G / 255:
        hsl.h = 60 * ((B / 255 - R / 255) / (cmax - cmin) + 2);
        break;
      case B / 255:
        hsl.h = 60 * ((R / 255 - G / 255) / (cmax - cmin) + 4);
        break;
    }

    return hsl;
  }

  HSLtoRGB(input: ColorHSL): ColorRGB {

    let H: number = input.h;
    let S: number = input.s;
    let L: number = input.l;
    
    let rgb: ColorRGB = {r: 0, g: 0, b: 0};

    let c: number, x: number, m: number;
    let r: number = 0, g: number = 0, b: number = 0;

    c = (1 - Math.abs(2 * L - 1)) * S;
    x = c * (1 - Math.abs(((H / 60) % 2) - 1));
    m = L - c / 2;

    if (0 <= H && H < 60) {r = c; g = x; b = 0};
    if (60 <= H && H < 120) {r = x; g = c; b = 0};
    if (120 <= H && H < 180) {r = 0; g = c; b = x};
    if (180 <= H && H < 240) {r = 0; g = x; b = c};
    if (240 <= H && H < 300) {r = x; g = 0; b = c};
    if (300 <= H && H <= 360) {r = c; g = 0; b = x};

    rgb.r = 255 * (r + m);
    rgb.g = 255 * (g + m);
    rgb.b = 255 * (b + m);

    return rgb;
  }

  RGBtoCMYK(input: ColorRGB): ColorCMYK {

    let R: number = input.r;
    let G: number = input.g;
    let B: number = input.b;

    let cmyk: ColorCMYK = {c : 0, m: 0, y: 0, k: 1};

    if (R == 0 && G == 0 && B == 0) return cmyk;

    cmyk.k = 1 - Math.max(R / 255, G / 255, B / 255);
    
    cmyk.c = (1 - R / 255 - cmyk.k) / (1 - cmyk.k);
    cmyk.m = (1 - G / 255 - cmyk.k) / (1 - cmyk.k);
    cmyk.y = (1 - B / 255 - cmyk.k) / (1 - cmyk.k);

    return cmyk;
  }

  CMYKtoRGB(input: ColorCMYK): ColorRGB {

    let C: number = input.c;
    let M: number = input.m;
    let Y: number = input.y;
    let K: number = input.k;

    let rgb: ColorRGB = {r : 0, g: 0, b: 0};

    rgb.r = 255 * (1 - C) * (1 - K);
    rgb.g = 255 * (1 - M) * (1 - K);
    rgb.b = 255 * (1 - Y) * (1 - K);

    return rgb;
  }

  RGBtoHex(input: ColorRGB): string {

    let toHex = (n: number): string => {
      let hex: string = Math.round(n).toString(16).toUpperCase();
      return (hex.length == 1 ? '0' : '') + hex;
    }

    let r: string = toHex(input.r);
    let g: string = toHex(input.g);
    let b: string = toHex(input.b);

    return '#' + r + g + b;
  }

  getColorComponent(color: Color, rangeId: string): number {
    switch(rangeId) {
      case 'r':
        return color.rgb.r;
      case 'g':
        return color.rgb.g;
      case 'b':
        return color.rgb.b;
      case 'h':
        return color.hsl.h;
      case 's':
        return color.hsl.s;
      case 'l':
        return color.hsl.l;
      case 'c':
        return color.cmyk.c;
      case 'm':
        return color.cmyk.m;
      case 'y':
        return color.cmyk.y;
      case 'k':
        return color.cmyk.k;
      default:
        return 0;
    }
  }

  changeColorComponent(color: Color, rangeId: string, value: number): Color {
    switch(rangeId) {
      case 'r':
        color.rgb.r = value;
        return this.setColorFromRGB(color.rgb);
      case 'g':
        color.rgb.g = value;
        return this.setColorFromRGB(color.rgb);
      case 'b':
        color.rgb.b = value;
        return this.setColorFromRGB(color.rgb);
      case 'h':
        color.hsl.h = value;
        return this.setColorFromHSL(color.hsl);
      case 's':
        color.hsl.s = value;
        return this.setColorFromHSL(color.hsl);
      case 'l':
        color.hsl.l = value;
        return this.setColorFromHSL(color.hsl);
      case 'c':
        color.cmyk.c = value;
        return this.setColorFromCMYK(color.cmyk);
      case 'm':
        color.cmyk.m = value;
        return this.setColorFromCMYK(color.cmyk);
      case 'y':
        color.cmyk.y = value;
        return this.setColorFromCMYK(color.cmyk);
      case 'k':
        color.cmyk.k = value;
        return this.setColorFromCMYK(color.cmyk);
      default:
        return this.default();
    }
  }

  colorStr(c: Color, space: string, notation: string): string[] {

    let str: string[] = [];

    let round = (n: number): string => {return n.toFixed(0)};
    let arith = (n: number): string => {return n.toFixed(3)};
    let prcnt = (n: number): string => {return (100 * n).toFixed(0)};

    switch(space) {
      case 'RGB':
        switch(notation) {
          case 'Decimal':
            str = [round(c.rgb.r), round(c.rgb.g), round(c.rgb.b)];
            break;
          case 'Arithmetic':
            str = [arith(c.rgb.r / 255), arith(c.rgb.g / 255), arith(c.rgb.b / 255)];
            break;
          case 'Percentages':
            str = [prcnt(c.rgb.r / 255), prcnt(c.rgb.g / 255), prcnt(c.rgb.b / 255)];
            break;
          case 'Hexadecimal':
            str = ['#'].concat(this.RGBtoHex(c.rgb).substring(1).match(/.{2}/g) as Array<string>);
            break;
        }
        break;
      case 'HSL':
        switch(notation) {
          case 'Arithmetic':
            str = [round(c.hsl.h), arith(c.hsl.s), arith(c.hsl.l)];
            break;
          case 'Percentages':
            str = [round(c.hsl.h), prcnt(c.hsl.s), prcnt(c.hsl.l)];
            break;
        }
        break;
      case 'CMYK':
        switch(notation) {
          case 'Arithmetic':
            str = [arith(c.cmyk.c), arith(c.cmyk.m), arith(c.cmyk.y), arith(c.cmyk.k)];
            break;
          case 'Percentages':
            str = [prcnt(c.cmyk.c), prcnt(c.cmyk.m), prcnt(c.cmyk.y), prcnt(c.cmyk.k)];
            break;
        }
        break;
    }

    return str;
  }

}
