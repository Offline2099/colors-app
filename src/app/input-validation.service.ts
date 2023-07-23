import { Injectable } from '@angular/core';

import { InputIssue } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class InputValidationService {

  constructor() { }

  addIfError(list: InputIssue[], error: InputIssue | null): void {
    if (error) list.push(error);
  }

  checkIfEmpty(s: string): InputIssue | null {

    if (!s) return {
      text: 'The input is empty.',
      details: []
    }

    return null;
  }

  validateColorStringHex(s: string): InputIssue[] {

    let errorList: InputIssue[] = [];

    this.addIfError(errorList, this.checkUnexpectedSymbolsHex(s));
    this.addIfError(errorList, this.checkHashSignPlacement(s));

    if (!errorList.length)
      this.addIfError(errorList, this.checkInputLengthHex(s));

    return errorList;
  }

  checkUnexpectedSymbolsHex(s: string): InputIssue | null {

    if (!s.match(/^[\dA-Fa-f\s#]+$/)) {
      return {
        text: 'The input contains unexpected symbols.',
        details: s.slice().split('').map(char => ({
          fragment: char,
          valid: /^[\dA-Fa-f\s#]+$/.test(char)
        }))
      };
    }

    return null;
  }

  checkHashSignPlacement(s: string): InputIssue | null {

    if (s.slice().replace(/[\s]/g, '').slice(1).includes('#')) {
      return {
        text: 'The # symbol can only be present at the beginning of the input.',
        details: s.slice().trim().split('').map((char, i) => ({
          fragment: char,
          valid: !/^[#]+$/.test(char) || !i
        }))
      };
    }

    return null;
  }

  checkInputLengthHex(s: string): InputIssue | null {

    let length: number = s.slice().replace(/[\s#]/g, '').length;

    if (length != 6 && length != 3)
      return {
        text: 'The length of the input data does not match a valid hexadecimal color format.',
        details: []
      };

    return null;
  }

  validateColorStringCSV(space: number, notation: number, s: string): InputIssue[] {

    let errorList: InputIssue[] = [];
    let values: string[] = s.split(',');

    this.addIfError(errorList, this.checkNumberOfValues(space, notation, values));
    this.addIfError(errorList, this.checkUnexpectedSymbolsCSV(s));
    this.addIfError(errorList, this.checkParanthesesPlacement(s));

    if (!errorList.length) {
      this.addIfError(errorList, this.checkPercentSignPlacement(space, notation, values));
      this.addIfError(errorList, this.checkAllValuesAreNumeric(values));
    }

    return errorList;
  }

  checkNumberOfValues(space: number, notation: number, v: string[]): InputIssue | null {

    let length: number = v.length;
    let expected: number = (space == 1 || space == 2) ? 3 : (space == 3 ? 4 : 0);

    if (length != expected)
      return {
        text: 'The input must contain ' + expected + 
          ' values separated by ' + (expected - 1) + ' commas. ' + 
          'Found ' + length + ' value' + (length > 1 ? 's' : '') + ' instead.',
        details: []
      };

    return null;
  }

  checkUnexpectedSymbolsCSV(s: string): InputIssue | null {

    // Allowed symbols : digits, percent signs, spaces, dots, commas, parentheses

    if (!s.match(/^[\d\%\s.,()]+$/))
      return {
        text: 'The input contains unexpected symbols.',
        details: s.slice().split('').map(char => ({
          fragment: char,
          valid: /^[\d\%\s.,()]+$/.test(char)
        }))
      };

    return null;
  }

  checkParanthesesPlacement(s: string): InputIssue | null {

    if (s.replace(/\s/g, '').slice(1, -1).search(/[()]/) >= 0)
      return {
        text: 'Parantheses can only be present at the beginning or end of the input.',
        details: s.slice().trim().split('').map((char, i) => ({
          fragment: char,
          valid: !/^[()]+$/.test(char) || !i || i == s.trim().length - 1 
        }))
      };

    return null;
  }

  checkPercentSignPlacement(space: number, notation: number, v: string[]): InputIssue | null {

    // Percent sign cannot be in a value that is not expected as a percentage

    let case1: boolean = false, case2: boolean = false;

    if (
      v.join('').includes('%') && 
        ((space == 1 && notation != 2) || ((space == 2 || space == 3) && notation != 1))
    ) case1 = true;

    if (space == 2 && v[0].includes('%')) case2 = true;

    if (case1 || case2) 
      return {
        text: 'The input contains a percent sign where it is not expected.',
        details: v.join(',').slice().split('').map((char, i) => ({
          fragment: char,
          valid: !/^[\%]+$/.test(char) || (!case1 && case2 && i >= v[0].length)
        }))
      };

    return null;
  }

  checkAllValuesAreNumeric(values: string[]): InputIssue | null {

    let isValid: boolean[] = [];

    values.forEach(v => {

      let vNoPar: string = v.slice().replace(/[\s()]/g, '');
      let vNoPrcnt: string = v.slice().replace(/[\s\%]/g, '');
      let vClean: string = v.slice().replace(/[\%\s()]/g, '');

      if (
        v.slice().split('%').length > 2 ||
        vNoPar.match(/(\%\d|\%\.)/) ||
        vNoPrcnt.match(/(\d\(|\.\(|\)\d|\)\.)/) ||
        !vClean.length || isNaN(Number(vClean))
      ) isValid.push(false);
      else isValid.push(true);
    });

    if (isValid.includes(false)) 
      return this.constructIssueForValues(isValid, values, 0);

    return null;
  }

  validateColorRanges(space: number, notation: number, vNum: number[], s: string): InputIssue | null {

    let isValid: boolean[] = [];

    if (space == 1) isValid = this.validateRangeRGB(notation, vNum);
    else if (space == 2) isValid = this.validateRangeHSL(notation, vNum);
    else if (space == 3) isValid = this.validateRangeCMYK(notation, vNum);

    if (isValid.includes(false))
      return this.constructIssueForValues(isValid, s.split(','), space);

    return null;
  }

  validateRangeRGB(notation: number, values: number[]): boolean[] {

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

  validateRangeHSL(notation: number, values: number[]): boolean[] {

    let output: boolean[] = [];

    output.push(values[0] >= 0 && values[0] <= 360);
    [values[1], values[2]].forEach((v, i) => {
      output.push(
        v >= 0 && ((notation == 1 && v <= 100) || (notation == 2 && v <= 1))
      );
    });

    return output;
  }

  validateRangeCMYK(notation: number, values: number[]): boolean[] {

    let output: boolean[] = [];

    values.forEach((v, i) => {
      output.push(
        v >= 0 && ((notation == 1 && v <= 100) || (notation == 2 && v <= 1))
      );
    });

    return output;
  }

  checkColorRangesForWarnings(space: number, notation: number, vNum: number[], s: string): InputIssue | null {

    if ((space == 1 && notation != 3) || ((space == 2 || space == 3) && notation != 2)) {

      let isNotStrange: boolean[] = [];
      vNum.forEach(value => { isNotStrange.push(!(value > 0 && value < 1)); });

      if (isNotStrange.includes(false)) 
        return this.constructIssueForValues(isNotStrange, s.split(','), -1);
    }

    return null;
  }

  constructIssueForValues(isValid: boolean[], values: string[], type: number): InputIssue {

    // Types accepted by this function:
    //    -1   : input warning (found strange values)
    //     0   : found non-numeric values
    //  1 to 3 : found values out of range for the color space, where the number is the space id

    let space = (n: number): string => {
      if (n < 1) return '';
      let spaces: string[] = ['RGB', 'HSL', 'CMYK'];
      return spaces[n - 1];
    }

    let issueText: string = '';
    let issueEndSingle: string = '';
    let issueEndPlural: string = '';
    let ref: string[] = ['first', 'second', 'third', 'fourth'];

    if (type >= 0) {

      let texts = [
        ' not represent a number.',
        ' out of range of the ' + space(type) + ' color space with the selected input format.'
      ]

      let textsSingle: string[] = [' does' + texts[0], ' is' + texts[1]];
      let textsPlural: string[] = [' do' + texts[0], ' are' + texts[1]];

      issueEndSingle = type > 0 ? textsSingle[1] : textsSingle[0];
      issueEndPlural = type > 0 ? textsSingle[1] : textsSingle[0];
    }
    else {

      let warningEnd: string = ' smaller than 1. ' + 
        'Make sure the input is spelled correctly and the proper format is selected.';

      issueEndSingle = ' is' + warningEnd;
      issueEndPlural = ' are' + warningEnd;
    }

    let badInd: number[] = [];
    isValid.forEach((e, i) => { if(!e) badInd.push(i); });

    switch (badInd.length) {
      case 1:
        issueText = 'The ' + ref[badInd[0]] + ' value' + issueEndSingle;
        break;
      case 2:
        issueText = 'The ' + ref[badInd[0]] + ' and ' + ref[badInd[1]] + 
          ' values' + issueEndPlural;
        break;
      case 3:
        issueText = 
          isValid.length == 3 ? 'All three values' + issueEndPlural :
            'The ' + ref[badInd[0]] + ', ' + ref[badInd[1]] + 
            ', and ' + ref[badInd[2]] + ' values' + issueEndPlural
        break;
      case 4:
        issueText = 'All four values' + issueEndPlural;
        break;
    }

    let detailsArray: string[] = [];
    values.forEach((v, index) => {
      detailsArray.push(v);
      if (index != values.length - 1) detailsArray.push(',');
    });

    return {
      text: issueText,
      details: detailsArray.map((v, index) => ({
        fragment: v,
        valid: !badInd.map(ind => 2 * ind).includes(index)
      }))
    };
  }

}
