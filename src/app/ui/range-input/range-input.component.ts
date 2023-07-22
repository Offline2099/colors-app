import { Component, OnInit, HostBinding, Input, DoCheck, Output, EventEmitter } from '@angular/core';

import { InputRange } from '../../interfaces';

@Component({
  selector: 'app-range-input',
  templateUrl: './range-input.component.html',
  styleUrls: ['./range-input.component.css']
})
export class RangeInputComponent implements OnInit, DoCheck {

  constructor() { }

  @Input() range!: InputRange 

  @HostBinding('class.range-255') type255: boolean = false;
  @HostBinding('class.range-360') type360: boolean = false;
  @HostBinding('class.range-percentage') typePercentage: boolean = false;
  @HostBinding('class.range-degree') typeDegree: boolean = false;

  @Output() output = new EventEmitter<number>();

  currentValue: string = '';

  ngOnInit(): void {
    this.setAppearanceType();
  }

  ngDoCheck(): void {
    this.currentValue = this.range.value.toFixed(0);
  }

  setAppearanceType(): void {
    this.type255 = (this.range.min == 0 && this.range.max == 255);
    this.type360 = (this.range.min == 0 && this.range.max == 360);
    this.typePercentage = this.range.type == 'percentage';
    this.typeDegree = this.range.type == 'degree';
  }

  sendChanges(e: Event): void {
    this.output.emit(Number((e.target as HTMLInputElement).value))
  }

}
