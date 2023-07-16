import { Component, OnInit } from '@angular/core';

import { 
  InputRange,
  Color, ColorRGB, ColorHSL, ColorCMYK, ColorRangeList } from '../interfaces';
import { ColorService } from '../color.service';

@Component({
  selector: 'app-primary',
  templateUrl: './primary.component.html',
  styleUrls: ['./primary.component.css']
})
export class PrimaryComponent implements OnInit {

  constructor(private c: ColorService) { }

  color: Color = this.c.getDefaultColor();

  ranges: ColorRangeList = this.c.getRanges();
  inputBlocks: {name: string, ranges: InputRange[]}[] = [];

  ngOnInit(): void {
    this.constructInputBlocks();
    this.updateRanges();
  }

  constructInputBlocks(): void {

    let rangeNames = this.c.getRangeNames();

    this.inputBlocks = [
      {name: 'RGB', rangeNames: rangeNames.rgb, ranges: this.ranges.rgb},
      {name: 'HSL', rangeNames: rangeNames.hsl, ranges: this.ranges.hsl},
      {name: 'CMYK', rangeNames: rangeNames.cmyk, ranges: this.ranges.cmyk}
    ].map(block => ({
      name: block.name + ' Color Space', 
      ranges: 
        block.ranges.map((range, i) => ({
          id: range.id, header: block.rangeNames[i], 
          min: range.min, max: range.max, value: 0, step: 1
        }))
    }));
  }

  updateRanges(): void {

    let C: Color = this.color;

    this.inputBlocks.forEach(block => {
      block.ranges.forEach(range => {
        switch(range.id) {
          case 'r':
            range.value = C.rgb.r;
            break;
          case 'g':
            range.value = C.rgb.g;
            break;
          case 'b':
            range.value = C.rgb.b;
            break;
          case 'h':
            range.value = C.hsl.h;
            break;
          case 's':
            range.value = C.hsl.s * 100;
            break;
          case 'l':
            range.value = C.hsl.l * 100;
            break;
          case 'c':
            range.value = C.cmyk.c * 100;
            break;
          case 'm':
            range.value = C.cmyk.m * 100;
            break;
          case 'y':
            range.value = C.cmyk.y * 100;
            break;
          case 'k':
            range.value = C.cmyk.k * 100;
            break;
        }
      })
    });
  }

  setColorFromRange(n: number, id: string): void {

    if (['r', 'g', 'b'].includes(id)) 
      this.color = this.setColorFromRGB(n, id);

    if (['h', 's', 'l'].includes(id)) 
      this.color = this.setColorFromHSL(n, id);

    if (['c', 'm', 'y', 'k'].includes(id)) 
      this.color = this.setColorFromCMYK(n, id);

    this.updateRanges();
  }

  setColorFromRGB(n: number, id: string): Color {

    let rgb: ColorRGB = this.color.rgb;

    if (id == 'r') rgb.r = n;
    if (id == 'g') rgb.g = n;
    if (id == 'b') rgb.b = n;

    return this.c.setColorFromRGB(rgb);
  }

  setColorFromHSL(n: number, id: string): Color {

    let hsl: ColorHSL = this.color.hsl;

    if (id == 'h') hsl.h = n;
    if (id == 's') hsl.s = n / 100;
    if (id == 'l') hsl.l = n / 100;

    return this.c.setColorFromHSL(hsl);
  }

  setColorFromCMYK(n: number, id: string): Color {

    let cmyk: ColorCMYK = this.color.cmyk;

    if (id == 'c') cmyk.c = n / 100;
    if (id == 'm') cmyk.m = n / 100;
    if (id == 'y') cmyk.y = n / 100;
    if (id == 'k') cmyk.k = n / 100;

    return this.c.setColorFromCMYK(cmyk);
  }

}
