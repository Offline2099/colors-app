import { Component, OnInit } from '@angular/core';

import { Color, ColorRGB, ColorHSL, ColorCMYK, RangeList } from '../interfaces';
import { ColorService } from '../color.service';

@Component({
  selector: 'app-primary',
  templateUrl: './primary.component.html',
  styleUrls: ['./primary.component.css']
})
export class PrimaryComponent implements OnInit {

  constructor(private c: ColorService) { }

  color: Color = this.c.getColor();

  textOutputBlocks = [
    {header: 'RGB', valStr: ''}, 
    {header: 'HSL', valStr: ''}, 
    {header: 'CMYK', valStr: ''},
    {header: 'Hex', valStr: ''}
  ];
  cHex: string = '#000000';

  ranges: RangeList = this.c.getRanges();
  rgbArr: number[] = [];
  hslArr: number[] = [];
  cmykArr: number[] = [];

  ngOnInit(): void {
    this.updateOutput();
  }

  updateOutput(): void {

    this.color = this.c.getColor();
    let C: Color = this.color;
    
    this.rgbArr = [C.rgb.r, C.rgb.g, C.rgb.b];
    this.hslArr = [C.hsl.h, C.hsl.s * 100, C.hsl.l * 100];
    this.cmykArr = [C.cmyk.c * 100, C.cmyk.m * 100, C.cmyk.y * 100, C.cmyk.k * 100];

    this.cHex = this.c.RGBtoHex(C.rgb);

    this.textOutputBlocks.forEach(b => {
      switch (b.header) {
        case 'RGB':
          b.valStr = this.c.csv(C.rgb);
          break;
        case 'HSL':
          b.valStr = this.c.csv(C.hsl);
          break;
        case 'CMYK':
          b.valStr = this.c.csv(C.cmyk);
          break;
        case 'Hex':
          b.valStr = this.cHex;
          break;
      }
    });
  }

  setColorFromRGB(n: number, id: string): void {

    let rgb: ColorRGB = this.color.rgb;

    if (id == 'r') rgb.r = n;
    if (id == 'g') rgb.g = n;
    if (id == 'b') rgb.b = n;

    this.c.setColorFromRGB(rgb);
    this.updateOutput();
  }

  setColorFromHSL(n: number, id: string): void {

    let hsl: ColorHSL = this.color.hsl;

    if (id == 'h') hsl.h = n;
    if (id == 's') hsl.s = n / 100;
    if (id == 'l') hsl.l = n / 100;

    this.c.setColorFromHSL(hsl);
    this.updateOutput();
  }

  setColorFromCMYK(n: number, id: string): void {

    let cmyk: ColorCMYK = this.color.cmyk;

    if (id == 'c') cmyk.c = n / 100;
    if (id == 'm') cmyk.m = n / 100;
    if (id == 'y') cmyk.y = n / 100;
    if (id == 'k') cmyk.k = n / 100;

    this.c.setColorFromCMYK(cmyk);
    this.updateOutput();
  }

}
