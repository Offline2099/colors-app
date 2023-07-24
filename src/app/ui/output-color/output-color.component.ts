import { Component, OnInit, Input, DoCheck } from '@angular/core';

import { Color, TextOutputBlock } from '../../interfaces';
import { ColorService } from '../../color.service';

@Component({
  selector: 'app-output-color',
  templateUrl: './output-color.component.html',
  styleUrls: ['./output-color.component.css']
})
export class OutputColorComponent implements OnInit, DoCheck {

  constructor(private c: ColorService) { }

  @Input() color: Color = this.c.default();
  @Input() headerText: string = '';

  textOutput: TextOutputBlock[] = [];

  ngOnInit(): void {
    this.constructTextOutputBlock();
  }

  ngDoCheck(): void {
    this.updateColor();
  }

  constructTextOutputBlock(): void {
    this.textOutput = this.c.spaces().map(space => ({
      space: space.name,
      notations: space.notations.map(notation => ({name: notation, values: []})),
      collapsed: false
    }));
  }

  toggleTextOutputBlock(block: TextOutputBlock): void {
    block.collapsed = !block.collapsed;
  }

  updateColor(): void {
    this.textOutput.forEach(row => {
      row.notations.forEach(notation => {
        notation.values = 
          this.c.colorStr(this.color, row.space, notation.name);
      });
    });
  }

}
