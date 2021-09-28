import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, NavController } from '@ionic/angular';
import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-driver',
  templateUrl: './driver.page.html',
  styleUrls: ['./driver.page.scss'],
})
export class DriverPage implements OnInit {

  userName = ''
  constructor(
    private menu: MenuController,
    private authService: AuthenticationService,
    private router: Router,
    private navController: NavController) { }

  ngOnInit() {
    this.userName = this.authService.getUserName();
  }

  openFirst() {
    this.menu.enable(true, 'first');
    this.menu.open('first');
  }

  openEnd() {
    this.menu.open('end');
  }

  openCustom() {
    this.menu.enable(true, 'custom');
    this.menu.open('custom');
  }

  
  goToSchedule(){
    this.menu.close();
    this.navController.navigateRoot(['/driver/schedule']);
  }

  goToHome(){
    this.menu.close();
    this.navController.navigateRoot(['/driver/navigate']);
  }

  logout(){
    this.authService.logout();
    this.navController.navigateRoot(['/login']);
  }

  isHome(){
    return this.router.url.indexOf('navigate') > -1;
  }
}
