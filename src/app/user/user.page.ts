import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {
  userName = ''
  constructor(
    private menu: MenuController,
    private authService: AuthenticationService,
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
    this.navController.navigateRoot(['/user/schedule']);
  }

  logout(){
    this.authService.logout();
    this.navController.navigateRoot(['/login']);
  }
}
