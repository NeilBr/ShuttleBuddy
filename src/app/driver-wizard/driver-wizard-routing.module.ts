import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DriverWizardPage } from './driver-wizard.page';

const routes: Routes = [
  {
    path: '',
    component: DriverWizardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DriverWizardPageRoutingModule {}
