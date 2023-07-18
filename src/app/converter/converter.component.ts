import { Component, OnInit } from '@angular/core';

import { 
  Converter, MenuOption,
  Color, ColorRGB, ColorHSL, ColorCMYK } from '../interfaces';
import { ColorService } from '../color.service';

@Component({
  selector: 'app-converter',
  templateUrl: './converter.component.html',
  styleUrls: ['./converter.component.css']
})
export class ConverterComponent implements OnInit {

  constructor(private c: ColorService) { }

  converters: Converter[] = [];
  converterMenu: MenuOption[] = [];
  notationsMenu: MenuOption[][] = [];

  ngOnInit(): void {
    this.constructConverters();
    this.constructConverterMenu();
    this.constructNotationsMenu();
  }

  constructConverters(): void {

    this.converters = 
      this.c.spaces().map(space => ({
        name: space.name, 
        notations: space.name == 'RGB' ? space.notations.slice(0, -1) : space.notations
      })).concat({name: 'Hexadecimal', notations: []})
        .map((converter, i) => ({
          id: i + 1,
          name: converter.name,
          selected: !i,
          instruction: 'Input a valid ' + converter.name + ' color. It will be converted to other color spaces.',
          inputNotations: 
            converter.notations.length ?
              converter.notations.map((notation, j) => ({
                id: j + 1, name: notation, selected: !j
              })) : [],
          userInput: '',
          inputAccepted: false,
          inputError: false,
          errorText: 'Error. Please input a valid ' + converter.name + ' color.',
          color: this.c.default()
        }));
  }

  constructConverterMenu(): void {
    this.converterMenu = this.converters.map(converter => ({
      id: converter.id, optionText: converter.name, selected: converter.selected
    }));
  }

  constructNotationsMenu(): void {
    this.notationsMenu = 
      this.converters.map(converter => converter.inputNotations
        .map(notation => ({
          id: notation.id, optionText: notation.name, selected: notation.selected
        }))
      );
  }

  switchConverter(converterId: number): void {
    this.converters.forEach(c => {c.selected = c.id == converterId});
  }

  switchNotation(converter: Converter, notationId: number): void {
    converter.inputNotations.forEach(n => {n.selected = n.id == notationId});
  }

  currentNotation(converter: Converter): number {
    return converter.inputNotations.length ? 
      converter.inputNotations.find(n => n.selected)!.id || 1 : -1;
  }

  updUserInput(converter: Converter, e: Event): void {
    converter.userInput = (e.target as HTMLInputElement).value;
  }

  runConverter(converter: Converter): void {

    let notation = this.currentNotation(converter);

    converter.inputAccepted = false;
    converter.inputError = false;

    if (!converter.userInput) return;

    this.validateUserInput(converter, notation);

    if (converter.inputAccepted) this.setColorFromInput(converter, notation);
    else converter.inputError = true;
  }

  validateUserInput(converter: Converter, notation: number): void {
    switch(converter.id) {
      case 1:
        converter.inputAccepted = this.validRGB(converter.userInput, notation);
        break;
      case 2:
        converter.inputAccepted = this.validHSL(converter.userInput, notation);
        break;
      case 3:
        converter.inputAccepted = this.validCMYK(converter.userInput, notation);
        break;
      case 4:
        converter.inputAccepted = this.validHex(converter.userInput);
        break;
    }
  }

  validRGB(string: string, notation: number): boolean {

    if (this.hasInvalidStructure(string, 2)) return false;

    let rgb: number[] = this.inputToNumbers(string);
    let r: number = rgb[0];
    let g: number = rgb[1];
    let b: number = rgb[2];

    if (
      r < 0 || g < 0 || b < 0 ||
      (notation == 1 && (r > 255 || g > 255 || b > 255)) ||
      (notation == 2 && (r > 100 || g > 100 || b > 100)) ||
      (notation == 3 && (r > 1 || g > 1 || b > 1))
    ) return false;

    return true;
  }

  validHSL(string: string, notation: number): boolean {

    if (this.hasInvalidStructure(string, 2)) return false;

    let hsl: number[] = this.inputToNumbers(string);
    let h: number = hsl[0];
    let s: number = hsl[1];
    let l: number = hsl[2];

    if (
      h < 0 || s < 0 || l < 0 ||
      (notation == 1 && (h > 360 || s > 100 || l > 100)) ||
      (notation == 2 && (h > 360 || s > 1 || l > 1)) 
    ) return false;

    return true;
  }

  validCMYK(string: string, notation: number): boolean {

    if (this.hasInvalidStructure(string, 3)) return false;

    let cmyk: number[] = this.inputToNumbers(string);
    let c: number = cmyk[0];
    let m: number = cmyk[1];
    let y: number = cmyk[2];
    let k: number = cmyk[3];

    if (
      c < 0 || m < 0 || y < 0 || k < 0 ||
      (notation == 1 && (c > 100 || m > 100 || y > 100 || k > 100)) ||
      (notation == 2 && (c > 1 || m > 1 || y > 1 || k > 1)) 
    ) return false;

    return true;
  }

  validHex(s: string): boolean {

    if (
      !s.match(/^[\dA-Fa-f\s#]+$/) ||
      !s.slice(1).match(/^[\dA-Fa-f\s]+$/) ||
      !(s.slice().replace(/[\s#]/g, '').length == 6 ||
        s.slice().replace(/[\s#]/g, '').length == 3) 
    ) return false;

    return true;
  }

  hasInvalidStructure(s: string, commasAllowed: number): boolean {

    if (
      // Contains anything except digits, spaces, dots, commas, parantheses
      !s.match(/^[\d\s.,()]+$/) ||

      // Too few or too many commas
      s.split(',').length != commasAllowed + 1 ||

      // No digits between commas
      s.slice().replace(/[\s.()]/g, '').includes(',,') ||

      // Contains more than one dot between commas
      s.slice().replace(/[\d\s()]/g, '').includes('..') ||

      // Does not start with a digit or dot (ignoring spaces and parantheses)
      s.slice().replace(/[\s()]/g, '').search(/[\d.]/) != 0 ||

      // Does not end with a digit or dot (ignoring spaces and parantheses)
      s.slice().replace(/[\s()]/g, '').split('').reverse().join('').search(/[\d.]/) != 0 ||

      // Contains parantheses anywhere in the middle (ignoring spaces)
      s.slice().replace(/\s/g, '').slice(1, -1).search(/[()]/) >= 0

    ) return true;

    return false;
  }

  inputToNumbers(s: string): number[] {
    return s.replace(/[\s()]/g, '').split(',').map(str => Number(str));
  }

  setColorFromInput(converter: Converter, notation: number): void {
    switch(converter.id) {
      case 1:
        converter.color = 
          this.c.setColorFromRGB(this.strToRGB(converter.userInput, notation));
        break;
      case 2:
        converter.color = 
          this.c.setColorFromHSL(this.strToHSL(converter.userInput, notation));
        break;
      case 3:
        converter.color = 
          this.c.setColorFromCMYK(this.strToCMYK(converter.userInput, notation));
        break;
      case 4:
        converter.color = 
          this.c.setColorFromRGB(this.strToRGB(converter.userInput, notation));
        break;
    }
  }

  strToRGB(s: string, notation: number): ColorRGB {

    if (notation == -1) {

      let str: string = s.replace(/[\s#]/g, '');
      if (str.length == 3) str = str.replace(/./g, '$&$&');

      let hex: string[] = str.match(/.{1,2}/g) as Array<string>;

      let hexToNum = (hexStr: string): number => {
        return parseInt(hexStr, 16);
      }

      return {r: hexToNum(hex[0]), g: hexToNum(hex[1]), b: hexToNum(hex[2])}
    }

    let rgb: number[] = this.inputToNumbers(s);

    if (notation == 1) return {r: rgb[0], g: rgb[1], b: rgb[2]}
    if (notation == 2) return {r: rgb[0] * 2.55, g: rgb[1] * 2.55, b: rgb[2]* 2.55}
    if (notation == 3) return {r: rgb[0] * 255, g: rgb[1] * 255, b: rgb[2] * 255}

    return this.c.default().rgb;
  }

  strToHSL(s: string, notation: number): ColorHSL {

    let hsl: number[] = this.inputToNumbers(s);

    if (notation == 1) return {h: hsl[0], s: hsl[1] / 100, l: hsl[2] / 100}
    if (notation == 2) return {h: hsl[0], s: hsl[1], l: hsl[2]}

    return this.c.default().hsl;
  }

  strToCMYK(s: string, notation: number): ColorCMYK {

    let cmyk: number[] = this.inputToNumbers(s);

    if (notation == 1) 
      return {c: cmyk[0] / 100, m: cmyk[1] / 100, y: cmyk[2] / 100, k: cmyk[3] / 100}
    if (notation == 2) 
      return {c: cmyk[0], m: cmyk[1], y: cmyk[2], k: cmyk[3]}

    return this.c.default().cmyk;
  }


}
