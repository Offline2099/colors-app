import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { PrimaryComponent } from './primary/primary.component';
import { ConverterComponent } from './converter/converter.component';
import { InfoComponent } from './info/info.component';
import { RangeInputComponent } from './ui/range-input/range-input.component';
import { OutputColorComponent } from './ui/output-color/output-color.component';

@NgModule({
  declarations: [
    AppComponent,
    PrimaryComponent,
    ConverterComponent,
    InfoComponent,
    RangeInputComponent,
    OutputColorComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
