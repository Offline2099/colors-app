import { Component, OnInit, DoCheck, Input, Output, EventEmitter } from '@angular/core';

import { InputRange } from '../../interfaces';

@Component({
  selector: 'app-range-input',
  templateUrl: './range-input.component.html',
  styleUrls: ['./range-input.component.css']
})
export class RangeInputComponent implements OnInit, DoCheck {

  constructor() { }

  @Input() range: InputRange = {
    id: '', header: '', min: 0, max: 0, value: 0, step: 0
  }

  @Output() output = new EventEmitter<number>();

  currentValue: string = '';

  ngOnInit(): void {
  }

  ngDoCheck(): void {
    this.currentValue = this.range.value.toFixed(0);
  }

  sendChanges(e: Event): void {
    this.output.emit(Number((e.target as HTMLInputElement).value))
  }

}
