import { Component, OnInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';

import { MenuOption } from '../../interfaces';

@Component({
  selector: 'app-choose-one',
  templateUrl: './choose-one.component.html',
  styleUrls: ['./choose-one.component.css']
})
export class ChooseOneComponent implements OnInit {

  constructor() { }

  @Input() menu: MenuOption[] = [];
  @Input() menuStyle?: string;
  @Input() label?: string;

  @HostBinding('class') visualStyle: string = '';

  @Output() selectOption = new EventEmitter<number>();

  ngOnInit(): void {
    if (this.menuStyle) this.visualStyle = this.menuStyle;
  }

  selectMenuOption(id: number): void {
    this.menu.forEach(option => option.selected = option.id == id);
    this.selectOption.emit(id);
  }

}
