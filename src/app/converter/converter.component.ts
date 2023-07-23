import { Component, OnInit } from '@angular/core';

import { 
  Converter, MenuOption, InputIssue,
  Color, ColorRGB, ColorHSL, ColorCMYK } from '../interfaces';

import { ColorService } from '../color.service';
import { InputValidationService } from '../input-validation.service';

@Component({
  selector: 'app-converter',
  templateUrl: './converter.component.html',
  styleUrls: ['./converter.component.css']
})
export class ConverterComponent implements OnInit {

  constructor(private c: ColorService, private iv: InputValidationService) { }

  converters: Converter[] = [];

  converterMenu: MenuOption[] = [];
  notationsMenu: MenuOption[][] = [];

  ngOnInit(): void {
    this.constructConverters();
    this.constructConverterMenu();
    this.constructNotationsMenu();
    this.generateExamples();
  }


  /****************************************************************************
  *
  *  Preparing the Component's Structure
  *
  ****************************************************************************/

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
          instruction: 
            'Input a valid ' + converter.name + ' color. ' +
            'It will be converted to the other color spaces.',
          examples: [],
          inputNotations: 
            converter.notations.length ?
              converter.notations.map((notation, j) => ({
                id: j + 1, name: notation, selected: !j
              })) : [],
          userInput: '',
          inputAccepted: false,
          inputError: false,
          errorList: [],
          inputWarning: false,
          warningList: [],
          color: this.c.default()
        }));
  }

  constructConverterMenu(): void {
    this.converterMenu = this.converters.map(converter => ({
      id: converter.id, optionText: converter.name, selected: converter.selected
    }));
  }

  constructNotationsMenu(): void {
    this.notationsMenu = this.converters.map(converter => 
      converter.inputNotations.map(notation => ({
        id: notation.id, optionText: notation.name, selected: notation.selected
      }))
    );
  }

  generateExamples(): void {

    let exampleColor: Color = this.c.default();

    this.converters.forEach(converter => {
      if (converter.inputNotations.length) {
        converter.examples = converter.inputNotations.map(notation => 
          this.c.colorStr(exampleColor, converter.name, notation.name, true).join(', ')
        );
      }
      else {
        if (converter.name == 'Hexadecimal')
          converter.examples = [this.c.colorStr(exampleColor, 'RGB', 'Hexadecimal').join('')];
      }
    });
  }


  /****************************************************************************
  *
  *  Actions on the Component's Elements
  *
  ****************************************************************************/

  switchConverter(converterId: number): void {
    this.converters.forEach(converter => {
      converter.selected = converter.id == converterId;
    });
  }

  switchNotation(converter: Converter, notationId: number): void {
    converter.inputNotations.forEach(notation => {
      notation.selected = notation.id == notationId;
    });
  }

  currentNotation(converter: Converter): number {
    return converter.inputNotations.length ? 
      converter.inputNotations.find(notation => notation.selected)!.id || 1 : -1;
  }

  updUserInput(converter: Converter, e: Event): void {
    converter.userInput = (e.target as HTMLInputElement).value;
  }

  runConverter(converter: Converter): void {

    let notation = this.currentNotation(converter);

    this.validateUserInput(converter, notation);

    if (converter.inputAccepted) {
      converter.inputWarning = converter.warningList.length > 0;
      this.setColorFromInput(converter, notation);
    }
    else converter.inputError = true;
  }


  /****************************************************************************
  *
  *  Input String Validation
  *
  ****************************************************************************/

  addIfError(converter: Converter, error: InputIssue | null): void {
    if (error) converter.errorList.push(error);
  }

  addIfWarning(converter: Converter, warning: InputIssue | null) {
    if (warning) converter.warningList.push(warning);
  }

  addErrors(converter: Converter, errors: InputIssue[]): void {
    if (errors.length) converter.errorList.push(...errors);
  }

  validateUserInput(converter: Converter, notation: number): void {

    converter.inputAccepted = false;
    converter.inputError = false;
    converter.errorList = [];
    converter.inputWarning = false;
    converter.warningList = [];

    this.addIfError(converter, this.iv.isEmpty(converter.userInput));
    if (converter.errorList.length) return;

    if (converter.id != 4) this.validateCSV(converter, notation);
    else this.addErrors(converter, this.iv.validateColorStringHex(converter.userInput));

    converter.inputAccepted = converter.errorList.length == 0;
  }

  validateCSV(converter: Converter, notation: number): void {

    let space: number = converter.id;
    let input: string = converter.userInput;

    this.addErrors(converter, 
      this.iv.validateColorStringCSV(space, notation, input));
    if (converter.errorList.length) return;

    let values = this.inputToNumbers(input);

    this.addIfError(converter, 
      this.iv.validateColorRanges(space, notation, values, input));
    if (converter.errorList.length) return;

    this.addIfWarning(converter, 
      this.iv.checkColorRangesForWarnings(space, notation, values, input));
  }


  /****************************************************************************
  *
  *  Valid Input Conversion
  *
  ****************************************************************************/

  inputToNumbers(s: string): number[] {
    return s.replace(/[\%\s()]/g, '').split(',').map(str => Number(str));
  }

  setColorFromInput(converter: Converter, notation: number): void {
    switch(converter.id) {
      case 1:
      case 4:
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
