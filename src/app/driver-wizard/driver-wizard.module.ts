import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DriverWizardPageRoutingModule } from './driver-wizard-routing.module';

import { DriverWizardPage } from './driver-wizard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DriverWizardPageRoutingModule
  ],
  declarations: [DriverWizardPage]
})
export class DriverWizardPageModule {}
