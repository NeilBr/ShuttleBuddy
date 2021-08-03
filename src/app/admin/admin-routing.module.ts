import { ManageLocationsComponent } from './manage-locations/manage-locations.component';
import { ManageBussesComponent } from './manage-busses/manage-busses.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { MapComponent } from './../shared/map/map.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { ManageRoutesComponent } from './manage-routes/manage-routes.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  
  {path: '',
    component: AdminComponent,
    children:[
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'schedule',
        component: ScheduleComponent
      },
      {
        path: 'users',
        component: ManageUsersComponent
      },
      {
        path: 'busses',
        component: ManageBussesComponent
      },
      {
        path: 'routes',
        component: ManageRoutesComponent
      },
      {
        path: 'locations',
        component: ManageLocationsComponent,
      },
    ]
  }
]
  

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
