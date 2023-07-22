import { Component, OnInit, Input, DoCheck, Output, EventEmitter } from '@angular/core';

import { Color, ColorSpace, InputRange, InputRangeBlock } from '../../interfaces';
import { ColorService } from '../../color.service';

@Component({
  selector: 'app-range-inputs-block',
  templateUrl: './range-inputs-block.component.html',
  styleUrls: ['./range-inputs-block.component.css']
})
export class RangeInputsBlockComponent implements OnInit, DoCheck {

  constructor(private c: ColorService) { }
  
  @Input() space!: ColorSpace;
  @Input() forcedColor?: Color;
  @Input() displaySample?: boolean = true;

  @Output() output = new EventEmitter<Color>();

  block!: InputRangeBlock;
  color: Color = this.c.default();

  ngOnInit(): void {
    this.constructBlock();
  }

  ngDoCheck(): void {
    if (this.forcedColor) this.color = this.forcedColor;
    this.updateRanges();
  }

  constructBlock(): void {
    this.block = {
      name: this.space.name + ' Color Space', 
      ranges: 
        this.space.ranges.map((range, i) => ({
          id: range.id, name: range.name, type: range.type,
          min: this.adjustInputForType(range.type, range.min), 
          max: this.adjustInputForType(range.type, range.max), 
          value: 0, step: 1
        }))
    }
  }

  updateRanges(): void {
    this.block.ranges.forEach(range => {
      range.value = this.adjustInputForType(
        range.type, this.c.getColorComponent(this.color, range.id)
      );
    });
  }

  adjustInputForType(t: string, val: number): number {
    return t == 'percentage' ? val * 100 : val;
  }

  adjustOutputForType(t: string, val: number): number {
    return t == 'percentage' ? val / 100 : val;
  }

  setColorFromRange(range: InputRange, value: number): void {
    this.color = this.c.changeColorComponent(
      this.color, range.id, this.adjustOutputForType(range.type, value)
    );
    this.output.emit(this.color);
  }

}
