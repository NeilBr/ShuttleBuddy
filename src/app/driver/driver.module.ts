import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DriverPageRoutingModule } from './driver-routing.module';

import { DriverPage } from './driver.page';
import { DriverWizardPage } from './driver-wizard/driver-wizard.page';
import { SharedModule } from '../shared/shared.module';
import { DriverNavigateComponent } from './driver-navigate/driver-navigate.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DriverPageRoutingModule,
    SharedModule
  ],
  declarations: [DriverPage, DriverWizardPage, DriverNavigateComponent]
})
export class DriverPageModule {}
