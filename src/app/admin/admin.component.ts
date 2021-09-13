import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, NavController } from '@ionic/angular';
import { AuthenticationService } from '../authentication/authentication.service';
import { AppPages } from '../shared/consts';
import { MenuService } from './menu/menu.service';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {

  menuOpen = true;
  userName = '';
  appPages = AppPages;
  
  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private navController: NavController,
    private menuService: MenuService,
    private menuController: MenuController
  ) { }

  ngOnInit() {
    this.menuController.isOpen().then(value =>{
      this.menuService.setMenuState(value);
    });
    this.userName = this.authService.getUserName();
  }

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

  menuClosed() {
    //code to execute when menu has closed
    this.menuService.setMenuState(false);
  }

  menuOpened() {
    //code to execute when menu ha opened
    this.menuService.setMenuState(true);
  }

}
