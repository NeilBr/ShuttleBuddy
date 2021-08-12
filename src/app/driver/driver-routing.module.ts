import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DriverNavigateComponent } from './driver-navigate/driver-navigate.component';
import { DriverWizardPage } from './driver-wizard/driver-wizard.page';

import { DriverPage } from './driver.page';

const routes: Routes = [
  {
    path: '',
    component: DriverPage
  },
  {
    path: 'wizard',
    component: DriverWizardPage
  },
  {
    path: 'navigate',
    component: DriverNavigateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DriverPageRoutingModule {}
