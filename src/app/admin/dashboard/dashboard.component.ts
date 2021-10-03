import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationService } from 'src/app/authentication/authentication.service';
import { AppPages } from 'src/app/shared/consts';
import { MenuService } from '../menu/menu.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  constructor( private menuService: MenuService,) { }

  ngOnInit() {

  }

}
