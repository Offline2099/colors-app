import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-range-input',
  templateUrl: './range-input.component.html',
  styleUrls: ['./range-input.component.css']
})
export class RangeInputComponent implements OnInit {

  constructor() { }

  @Input() min: number = 0;
  @Input() max: number = 0;
  @Input() value: number = 0;
  @Input() step: number = 0;
  @Input() leap?: number = 0;

  @Output() output = new EventEmitter<number>();

  ngOnInit(): void {
  }

  sendChanges(e: Event): void {
    this.output.emit(Number((e.target as HTMLInputElement).value))
  }

}
