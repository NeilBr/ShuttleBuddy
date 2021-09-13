import { ScheduleComponent } from './schedule/schedule.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { ManageRoutesComponent } from './manage-routes/manage-routes.component';
import { ManageLocationsComponent } from './manage-locations/manage-locations.component';
import { ManageBussesComponent } from './manage-busses/manage-busses.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AdminComponent } from './admin.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MenuComponent } from './menu/menu.component';

@NgModule({
  declarations: [
    AdminComponent, 
    DashboardComponent, 
    ManageBussesComponent, 
    ManageLocationsComponent,
    ManageRoutesComponent,
    ManageUsersComponent,
    MenuComponent,
    ScheduleComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AdminRoutingModule,
    IonicModule,
    FormsModule,
    NgxDatatableModule
  ]
})
export class AdminModule { }
