import { Injectable } from '@angular/core';

import { Color, ColorRGB, ColorHSL, ColorCMYK, ColorRangeList } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  constructor() { }

  private color: Color = {
    rgb: {r: 126, g: 126, b: 126},
    hsl: {h: 0, s: 0, l: .5},
    cmyk: {c: .01, m: .01, y: .01, k: .5},
    hex: '#7E7E7E'
  }

  private ranges: ColorRangeList = {
    rgb: [
      {id: 'r', min: 0, max: 255},
      {id: 'g', min: 0, max: 255},
      {id: 'b', min: 0, max: 255}
    ],
    hsl: [
      {id: 'h', min: 0, max: 360},
      {id: 's', min: 0, max: 100},
      {id: 'l', min: 0, max: 100}
    ],
    cmyk: [
      {id: 'c', min: 0, max: 100},
      {id: 'm', min: 0, max: 100},
      {id: 'y', min: 0, max: 100},
      {id: 'k', min: 0, max: 100}
    ]
  }

  private rangeNames = {
    rgb: ['Red', 'Green', 'Blue'],
    hsl: ['Hue', 'Saturation', 'Lightness'],
    cmyk: ['Cyan', 'Magenta', 'Yellow', 'Key']
  }

  private colorNotations = [
    'Decimal', 'Arithmetic', 'Percentages', 'Hexadecimal'
  ];

  getColor(): Color {
    return this.color;
  }

  getRanges(): ColorRangeList {
    return this.ranges;
  }

  getRangeNames(): {rgb: string[], hsl: string[], cmyk: string[]} {
    return this.rangeNames;
  }

  getNotations(): string[] {
    return this.colorNotations;
  }

  setColorFromRGB(input: ColorRGB): void {
    this.color = {
      rgb: input,
      hsl: this.RGBtoHSL(input),
      cmyk: this.RGBtoCMYK(input),
      hex: this.RGBtoHex(input)
    }
  }

  setColorFromHSL(input: ColorHSL): void {

    let crgb: ColorRGB = this.HSLtoRGB(input);

    this.color = {
      rgb: crgb,
      hsl: input,
      cmyk: this.RGBtoCMYK(crgb),
      hex: this.RGBtoHex(crgb)
    }
  }

  setColorFromCMYK(input: ColorCMYK): void {

    let crgb: ColorRGB = this.CMYKtoRGB(input);

    this.color = {
      rgb: crgb,
      hsl: this.RGBtoHSL(crgb),
      cmyk: input,
      hex: this.RGBtoHex(crgb)
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
    if (300 <= H && H < 360) {r = c; g = 0; b = x};

    rgb.r = 255 * (r + m);
    rgb.g = 255 * (g + m);
    rgb.b = 255 * (b + m);

    return rgb;
  }

  RGBtoCMYK(input: ColorRGB): ColorCMYK {

    let R: number = input.r;
    let G: number = input.g;
    let B: number = input.b;

    let cmyk = {c : 0, m: 0, y: 0, k: 1};

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

    let rgb = {r : 0, g: 0, b: 0};

    rgb.r = 255 * (1 - C) * (1 - K);
    rgb.g = 255 * (1 - M) * (1 - K);
    rgb.b = 255 * (1 - Y) * (1 - K);

    return rgb;
  }

  RGBtoHex(input: ColorRGB): string {

    let toHex = (n: number): string => {
      let hex: string = Math.round(n).toString(16).toUpperCase();
      return n < 16 ? '0' + hex : hex;
    }

    let r: string = toHex(input.r);
    let g: string = toHex(input.g);
    let b: string = toHex(input.b);

    return '#' + r + g + b;
  }

  csv(c: ColorRGB | ColorHSL | ColorCMYK): string {

    let str: string = '';
    let val: number[] = [];

    let round = (n: number): number => {return Math.round(n)};
    let prcnt = (n: number): number => {return Math.round(100 * n)};

    if ('r' in c) val = [round(c.r), round(c.g), round(c.b)];
    if ('h' in c) val = [round(c.h), prcnt(c.s), prcnt(c.l)];
    if ('c' in c) val = [prcnt(c.c), prcnt(c.m), prcnt(c.y), prcnt(c.k)];

    val.forEach((n, i) => {
      str += n + (i == val.length - 1 ? '' : ', ');
    });

    return str;
  }

  colorStr(c: Color, spaceId: string, notation: string): string[] {

    let str: string[] = [];

    let round = (n: number): string => {return n.toFixed(0)};
    let arith = (n: number): string => {return n.toFixed(3)};
    let prcnt = (n: number): string => {return (100 * n).toFixed(0)};

    switch(spaceId) {
      case 'RGB':
        switch(notation) {
          case this.colorNotations[0]:
            str = [round(c.rgb.r), round(c.rgb.g), round(c.rgb.b)];
            break;
          case this.colorNotations[1]:
            str = [arith(c.rgb.r / 255), arith(c.rgb.g / 255), arith(c.rgb.b / 255)];
            break;
          case this.colorNotations[2]:
            str = [prcnt(c.rgb.r / 255), prcnt(c.rgb.g / 255), prcnt(c.rgb.b / 255)];
            break;
          case this.colorNotations[3]:
            str = ['#'].concat(this.RGBtoHex(c.rgb).substring(1).match(/.{2}/g) as Array<string>);
            break;
        }
        break;
      case 'HSL':
        switch(notation) {
          case this.colorNotations[1]:
            str = [round(c.hsl.h), arith(c.hsl.s), arith(c.hsl.l)];
            break;
          case this.colorNotations[2]:
            str = [round(c.hsl.h), prcnt(c.hsl.s), prcnt(c.hsl.l)];
            break;
        }
        break;
      case 'CMYK':
        switch(notation) {
          case this.colorNotations[1]:
            str = [arith(c.cmyk.c), arith(c.cmyk.m), arith(c.cmyk.y), arith(c.cmyk.k)];
            break;
          case this.colorNotations[2]:
            str = [prcnt(c.cmyk.c), prcnt(c.cmyk.m), prcnt(c.cmyk.y), prcnt(c.cmyk.k)];
            break;
        }
        break;
    }

    return str;
  }

}
