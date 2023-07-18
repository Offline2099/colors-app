import { Component, OnInit } from '@angular/core';

import { MenuOption } from './interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  topLevelOptions: MenuOption[] = [];

  topLevelOptionsText: string[] = 
    ['Slider Input', 'Text Input', 'Learn'];

  ngOnInit() {
    this.constructTopLevelBlocks();
  }

  constructTopLevelBlocks(): void {
    this.topLevelOptionsText.forEach((t, i) => {
      this.topLevelOptions.push({
        id: i,
        optionText: t,
        selected: i == 2
      });
    });
  }

  switchTopLevelBlock(id: number) {
    this.topLevelOptions.forEach(option => {
      option.selected = option.id == id
    });
  }
}
