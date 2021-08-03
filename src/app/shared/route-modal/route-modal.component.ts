import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Route } from '../models/route';

@Component({
  selector: 'app-route-modal',
  templateUrl: './route-modal.component.html',
  styleUrls: ['./route-modal.component.scss'],
})
export class RouteModalComponent implements OnInit {
  
  @Input() route: Route;
  @Input() routeAction: string;
  
  constructor(private popoverController: PopoverController) { }

  ngOnInit() {
  }

  closePopover(action: string){
    this.popoverController.dismiss({action, route: this.route}); 
  }
}
