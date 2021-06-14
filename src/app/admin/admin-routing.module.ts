import { MapComponent } from './../shared/map/map.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';

const routes: Routes = [
  
  {path: '',
    component: AdminComponent,
    children:[
      {
        path: 'map',
        loadChildren: () => import('./../shared/shared.module').then( m => m.SharedModule),
        component: MapComponent
      }
    ]
  }
]
  

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
