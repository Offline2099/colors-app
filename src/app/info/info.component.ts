import { Component, OnInit } from '@angular/core';

import { PageSection, ColorSpace } from '../interfaces';
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

  sections: PageSection[] = [];

  ngOnInit(): void {
    this.consdtructSections();
  }

  consdtructSections(): void {
    [...Array(5)].forEach(e => {
      this.sections.push({collapsed: true, hovered: false});
    });
  }

  toggleSection(id: number): void {
    this.sections[id].collapsed = !this.sections[id].collapsed;
  }

}
