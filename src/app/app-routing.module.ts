import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from './authentication/authentication.guard';
import { RoleGuardService } from './authentication/role-guard.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then( m => m.AdminModule),
    canActivate:[AuthenticationGuard, RoleGuardService],
    data:{expectedRole: 'Admin'}
  },
  {
    path: 'driver-wizard',
    loadChildren: () => import('./driver-wizard/driver-wizard.module').then( m => m.DriverWizardPageModule),
    canActivate:[AuthenticationGuard],
    data:{expectedRole: 'Driver'}
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
