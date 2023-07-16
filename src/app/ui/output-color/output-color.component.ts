import { Component, OnInit, Input, DoCheck } from '@angular/core';

import { Color,TextOutputBlock } from '../../interfaces';
import { ColorService } from '../../color.service';

@Component({
  selector: 'app-output-color',
  templateUrl: './output-color.component.html',
  styleUrls: ['./output-color.component.css']
})
export class OutputColorComponent implements OnInit, DoCheck {

  constructor(private c: ColorService) { }

  @Input() color: Color = this.c.getDefaultColor();

  textOutput: TextOutputBlock[] = [];

  ngOnInit(): void {
    this.constructTextOutputBlock();
  }

  ngDoCheck(): void {
    this.updateColor();
  }

  constructTextOutputBlock(): void {

    let notations: string[] = this.c.getNotations();

    this.textOutput = [ 
      {header: 'RGB', notations: notations},
      {header: 'HSL', notations: [notations[2], notations[1]]},
      {header: 'CMYK', notations: [notations[2], notations[1]]}
    ].map(row => ({
      header: row.header,
      notations: row.notations.map(notation => ({name: notation, values: []}))
    }));
  }

  updateColor(): void {

    this.textOutput.forEach(row => {
      row.notations.forEach(notation => {
        notation.values = 
          this.c.colorStr(this.color, row.header, notation.name);
      });
    });
  }

}
