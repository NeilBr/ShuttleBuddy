import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map/map.component';
import { ShellComponent } from './shell/shell.component';
import { BrowserModule } from '@angular/platform-browser';

const COMPONENTS: any[] = [MapComponent, ShellComponent];

@NgModule({
  declarations: [COMPONENTS],
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports: [...COMPONENTS]
})
export class SharedModule { }
