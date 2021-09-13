import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DriverNavigateComponent } from '../driver/driver-navigate/driver-navigate.component';
import { UserHomeComponent } from './user-home/user-home.component';

import { UserPage } from './user.page';

const routes: Routes = [
  {
    path: '',
    component: UserPage,
    children:[
      {
        path: 'home',
        component: UserHomeComponent,
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserPageRoutingModule {}
