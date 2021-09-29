import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserScheduleComponent } from '../user/user-schedule/user-schedule.component';
import { DriverNavigateComponent } from './driver-navigate/driver-navigate.component';
import { DriverWizardPage } from './driver-wizard/driver-wizard.page';

import { DriverPage } from './driver.page';

const routes: Routes = [
  {
    path: '',
    component: DriverPage,
    children:[
      {
        path: 'wizard',
        component: DriverWizardPage
      },
      {
        path: 'navigate',
        component: DriverNavigateComponent
      },
      {
        path: 'schedule',
        component: UserScheduleComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DriverPageRoutingModule {}
