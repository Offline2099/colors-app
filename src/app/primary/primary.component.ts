import { Component, OnInit } from '@angular/core';

import { Color, ColorSpace } from '../interfaces';
import { ColorService } from '../color.service';

@Component({
  selector: 'app-primary',
  templateUrl: './primary.component.html',
  styleUrls: ['./primary.component.css']
})
export class PrimaryComponent implements OnInit {

  constructor(private c: ColorService) { }

  spaces: ColorSpace[] = this.c.spaces();
  color: Color = this.c.default();

  ngOnInit(): void {
  }

  updateColor(newColor: Color) {
    this.color = newColor;
  }

}
