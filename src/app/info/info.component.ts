import { Component, OnInit } from '@angular/core';

import { ColorSpace } from '../interfaces';
import { ColorService } from '../color.service';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {

  constructor(private c: ColorService) { }

  spaceRGB: ColorSpace = this.c.space('RGB')!;
  spaceHSL: ColorSpace = this.c.space('HSL')!;
  spaceCMYK: ColorSpace = this.c.space('CMYK')!;

  ngOnInit(): void {
  }

}
