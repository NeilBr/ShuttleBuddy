import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map/map.component';
import { LocationModalComponent } from './location-modal/location-modal.component';
import { RouteModalComponent } from './route-modal/route-modal.component';
import { DriverMapComponent } from './driver-map/driver-map.component';
import { UserMapComponent } from './user-map/user-map.component';
import { UserModalComponent } from './user-modal/user-modal.component';
import { ScheduleCardComponent } from '../admin/schedule/schedule-card/schedule-card.component';

const COMPONENTS: any[] = [
  MapComponent, 
  DriverMapComponent, 
  LocationModalComponent, 
  RouteModalComponent,
  UserMapComponent,
  UserModalComponent,
  ScheduleCardComponent,
];

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
