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
  *  Querying or Manipulating the Component's Structure
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

  validateUserInput(converter: Converter, notation: number): void {

    converter.inputAccepted = false;
    converter.inputError = false;
    converter.errorList = [];
    converter.inputWarning = false;
    converter.warningList = [];

    if (!converter.userInput) {
      converter.errorList.push({
        text: 'The input is empty.',
        details: []
      });
      return;
    }

    if (converter.id != 4) this.validateCSV(converter, notation);
    else this.validateHex(converter)

    converter.inputAccepted = converter.errorList.length == 0;
  }
  
  validateCSV(converter: Converter, notation: number): void {

    let s: string = converter.userInput.slice();
    let values: string[] = s.split(',');

    let numberOfValuesIsValid: boolean =
      this.checkNumberOfValues(converter, notation, values);

    this.checkUnexpectedSymbols(converter, s);
    this.checkParanthesesPlacement(converter, s);
    this.checkPercentSignPlacement(converter, notation, values);

    if (numberOfValuesIsValid && this.checkAllValuesAreNumeric(converter, values))
      this.validateRanges(converter, notation, values);
  }
  
  checkNumberOfValues(c: Converter, notation: number, values: string[]): boolean {

    let expected: number = 0;
    let L: number = values.length;

    if (c.id == 1 || c.id == 2) expected = 3;
    if (c.id == 3) expected = 4;

    if (L != expected)
      c.errorList.push({
        text: 'The input must contain ' + expected + 
          ' values separated by ' + (expected - 1) + ' commas. ' + 
          'Found ' + L + ' value' + (L > 1 ? 's' : '') + ' total.',
        details: []
      });

    return L == expected;
  }

  checkUnexpectedSymbols(c: Converter, s: string): void {

    // Allowed symbols : digits, percent signs, spaces, dots, commas, parentheses

    if (!s.match(/^[\d\%\s.,()]+$/)) 
      c.errorList.push({
        text: 'The input contains unexpected symbols.',
        details: s.slice().split('').map(char => ({
          fragment: char,
          valid: /^[\d\%\s.,()]+$/.test(char)
        }))
      });
  }

  checkParanthesesPlacement(c: Converter, s: string): void {

    // Parentheses cannot be anywhere in the middle (ignoring spaces)

    if (s.replace(/\s/g, '').slice(1, -1).search(/[()]/) >= 0)
      c.errorList.push({
        text: 'Parantheses can only be present at the beginning or end of the input.',
        details: s.slice().trim().split('').map((char, i) => ({
          fragment: char,
          valid: !/^[()]+$/.test(char) || !i || i == s.trim().length -1 
        }))
      });
  }

  checkPercentSignPlacement(c: Converter, notation: number, values: string[]): void {

    // Percent sign cannot be in a value that is not expected as a percentage

    let case1: boolean = false, case2: boolean = false;

    if (
      values.join('').includes('%') && 
        ((c.id == 1 && notation != 2) || ((c.id == 2 || c.id == 3) && notation != 1))
    ) case1 = true;

    if (c.id == 2 && values[0].includes('%')) case2 = true;

    if (case1 || case2) 
      c.errorList.push({
        text: 'The input contains a percent sign where it is not expected.',
        details: values.join(',').slice().split('').map((char, i) => ({
          fragment: char,
          valid: !/^[\%]+$/.test(char) || (!case1 && case2 && i >= values[0].length)
        }))
      });
  }

  checkAllValuesAreNumeric(c: Converter, values: string[]): boolean {

    let isValid: boolean[] = [];

    values.forEach(value => {

      let vNoPar: string = value.slice().replace(/[\s()]/g, '');
      let vNoPrcnt: string = value.slice().replace(/[\s\%]/g, '');
      let vClean: string = value.slice().replace(/[\%\s()]/g, '');

      if (
        value.slice().split('%').length > 2 ||
        vNoPar.match(/(\%\d|\%\.)/) ||
        vNoPrcnt.match(/(\d\(|\.\(|\)\d|\)\.)/) ||
        !vClean.length || isNaN(Number(vClean))
      ) isValid.push(false);
      else isValid.push(true);
    });

    if (isValid.includes(false)) 
      this.addErrorForValues(c, isValid, values, 0);

    return !isValid.includes(false);
  }

  validateRanges(c: Converter, notation: number, valuesStr: string[]): void {

    let values = this.inputToNumbers(valuesStr.join(','));
    let isValid: boolean[] = [];
    let ref: string[] = ['first', 'second', 'third', 'fourth'];

    if (c.id == 1) 
      isValid = this.validateRangeRGB(c, notation, values);
    else if (c.id == 2) 
      isValid = this.validateRangeHSL(c, notation, values);
    else if (c.id == 3) 
      isValid = this.validateRangeCMYK(c, notation, values);

    if (isValid.includes(false)) 
      this.addErrorForValues(c, isValid, valuesStr, 1);
    else {
      if (
        (c.id == 1 && notation != 3) || 
        ((c.id == 2 || c.id == 3) && notation != 2)
      ) this.checkValuesForWarnings(c, values, valuesStr);
    }
  }

  validateRangeRGB(c: Converter, notation: number, values: number[]): boolean[] {

    let output: boolean[] = [];

    values.forEach((v, i) => {
      output.push(
        v >= 0 && 
        ((notation == 1 && v <= 255) || 
        (notation == 2 && v <= 100) ||
        (notation == 3 && v <= 1))
      );
    });

    return output;
  }

  validateRangeHSL(c: Converter, notation: number, values: number[]): boolean[] {

    let output: boolean[] = [];

    output.push(values[0] >= 0 && values[0] <= 360);
    [values[1], values[2]].forEach((v, i) => {
      output.push(
        v >= 0 && ((notation == 1 && v <= 100) || (notation == 2 && v <= 1))
      );
    });

    return output;
  }

  validateRangeCMYK(c: Converter, notation: number, values: number[]): boolean[] {

    let output: boolean[] = [];

    values.forEach((v, i) => {
      output.push(
        v >= 0 && ((notation == 1 && v <= 100) || (notation == 2 && v <= 1))
      );
    });

    return output;
  }

  addErrorForValues(c: Converter, isValid: boolean[], values: string[], type: number) {

    let ref: string[] = ['first', 'second', 'third', 'fourth'];

    let detailsArray: string[] = [];
    values.forEach((v, index) => {
      detailsArray.push(v);
      if (index != values.length - 1) detailsArray.push(',');
    });

    let badInd: number[] = [];
    isValid.forEach((e, i) => { 
      if(!e) badInd.push(i);
    });

    let errorText: string = '';
    let errorEndSingle: string[] = [
      ' does not represent a number.',
      ' is out of range of the ' +
        c.name + ' color space with the selected input format.'
    ];
    let errorEndPlural: string[] = [
      ' do not represent a number.',
      ' are out of range of the ' +
        c.name + ' color space with the selected input format.'
    ];

    switch (badInd.length) {
      case 1:
        errorText = 'The ' + ref[badInd[0]] + ' value' + errorEndSingle[type];
        break;
      case 2:
        errorText = 'The ' + ref[badInd[0]] + ' and ' + ref[badInd[1]] + 
          ' values' + errorEndPlural[type];
        break;
      case 3:
        errorText = 
          isValid.length == 3 ? 'All three values' + errorEndPlural[type] :
            'The ' + ref[badInd[0]] + ', ' + ref[badInd[1]] + 
            ', and ' + ref[badInd[2]] + ' values' + errorEndPlural[type]
        break;
      case 4:
        errorText = 'All four values' + errorEndPlural[type];
        break;
    }

    c.errorList.push({
      text: errorText,
      details: detailsArray.map((v, index) => ({
        fragment: v,
        valid: !badInd.map(ind => 2 * ind).includes(index)
      }))
    });
  }

  checkValuesForWarnings(c: Converter, values: number[], valuesStr: string[]) {

    let isStrange: boolean[] = [];

    values.forEach(value => {
      isStrange.push(value > 0 && value < 1);
    });

    if (isStrange.includes(true)) {

      let ref: string[] = ['first', 'second', 'third', 'fourth'];

      let badInd: number[] = [];
      isStrange.forEach((e, i) => { 
        if(e) badInd.push(i);
      });

      let detailsArray: string[] = [];
      valuesStr.forEach((v, index) => {
        detailsArray.push(v);
        if (index != values.length - 1) detailsArray.push(',');
      });

      let warningText: string = '';
      let warningEnd: string = ' smaller than 1. ' + 
        'Make sure the input is spelled correctly and the proper format is selected.';

      switch (badInd.length) {
        case 1:
          warningText = 'The ' + ref[badInd[0]] + ' value is' + warningEnd;
          break;
        case 2:
          warningText = 'The ' + ref[badInd[0]] + ' and ' + ref[badInd[1]] + 
            ' values are' + warningEnd;
          break;
        case 3:
          warningText = 
            isStrange.length == 3 ? 'All three values are' + warningEnd :
              'The ' + ref[badInd[0]] + ', ' + ref[badInd[1]] + 
              ', and ' + ref[badInd[2]] + ' values are' + warningEnd
          break;
        case 4:
          warningText = 'All four values are' + warningEnd;
          break;
      }

      c.warningList.push({
        text: warningText,
        details: detailsArray.map((v, index) => ({
          fragment: v,
          valid: !badInd.map(ind => 2 * ind).includes(index)
        }))
      });
    }
  }

  validateHex(converter: Converter): void {

    let s: string = converter.userInput;
    let sNoSpaces: string = s.slice().replace(/[\s]/g, '');
    let sClean: string = s.slice().replace(/[\s#]/g, '');

    let wrongStructure: boolean = false;

    if (!s.match(/^[\dA-Fa-f\s#]+$/)) {
      wrongStructure = true;
      converter.errorList.push({
        text: 'The input contains unexpected symbols.',
        details: s.slice().split('').map(char => ({
          fragment: char,
          valid: /^[\dA-Fa-f\s#]+$/.test(char)
        }))
      });
    }

    if (sNoSpaces.slice(1).includes('#')) {
      wrongStructure = true;
      converter.errorList.push({
        text: 'The # symbol can only be present at the beginning of the input.',
        details: s.slice().trim().split('').map((char, i) => ({
          fragment: char,
          valid: !/^[#]+$/.test(char) || !i
        }))
      });
    }

    if (!wrongStructure && !(sClean.length == 6 || sClean.length == 3))
      converter.errorList.push({
        text: 'The length of the input data does not match a valid hexadecimal color format.',
        details: []
      });
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
