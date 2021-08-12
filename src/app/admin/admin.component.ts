import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {

  menuOpen = true;

  public appPages = [
    { title: 'Dashboard', url: '/admin/dashboard', icon: 'grid' },
    { title: 'Schedule', url: '/admin/schedule', icon: 'time' },
    { title: 'Users', url: '/admin/users', icon: 'people' },
    { title: 'Busses', url: '/admin/busses', icon: 'bus' },
    { title: 'Routes', url: '/admin/routes', icon: 'navigate' },
    { title: 'Locations', url: '/admin/locations', icon: 'location' },
  ];
  
  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private navController: NavController
  ) { }

  ngOnInit() {}

  toggleMenu(){
    this.menuOpen = !this.menuOpen;
  }

  navigateTo(url){
    this.navController.navigateRoot([url]);
  }

  logout(){
    this.authService.logout();
    this.navController.navigateRoot(['/login']);
  }
}
