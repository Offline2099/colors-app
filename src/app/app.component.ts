import { Component, OnInit } from '@angular/core';

import { TopLevelBlock } from './interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  topLevelBlocks: TopLevelBlock[] = [];

  ngOnInit() {
    this.constructTopLevelBlocks();
  }

  constructTopLevelBlocks(): void {
    ['Play', 'Convert', 'Learn'].forEach((t, i) => {
      this.topLevelBlocks.push({
        id: i,
        menuBtnText: t,
        selected: !i
      });
    });
  }

  switchTopLevelBlock(id: number) {
    this.topLevelBlocks.forEach(b => {b.selected = b.id == id})
  }
}
