import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationService } from 'src/app/authentication/authentication.service';
import { AppPages } from 'src/app/shared/consts';
import { MenuService } from './menu.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  
  appPages = AppPages;
  menuOpen = new BehaviorSubject(false);

  constructor(
    private authService: AuthenticationService,
    private navController: NavController,
    private menuService: MenuService) { }

  ngOnInit() {}
  
  navigateTo(url){
    this.navController.navigateRoot([url]);
  }

  logout(){
    this.authService.logout();
    this.navController.navigateRoot(['/login']);
  }

  getIsOpen(){
    return this.menuService.menuState;
  }
}
