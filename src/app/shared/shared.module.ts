import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map/map.component';
import { ShellComponent } from './shell/shell.component';
import { LocationModalComponent } from './location-modal/location-modal.component';
import { RouteModalComponent } from './route-modal/route-modal.component';
import { DriverMapComponent } from './driver-map/driver-map.component';

const COMPONENTS: any[] = [MapComponent, DriverMapComponent, ShellComponent, LocationModalComponent, RouteModalComponent];

@NgModule({
  declarations: [COMPONENTS],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
  ],
  exports: [...COMPONENTS],
})
export class SharedModule { }
