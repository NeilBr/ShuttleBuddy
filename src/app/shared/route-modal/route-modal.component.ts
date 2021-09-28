import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Location } from '../models/location';
import { Route } from '../models/route';

@Component({
  selector: 'app-route-modal',
  templateUrl: './route-modal.component.html',
  styleUrls: ['./route-modal.component.scss'],
})
export class RouteModalComponent implements OnInit {
  
  @Input() route: Route;
  @Input() locations: Location[];
  @Input() routeAction: string;

  
  constructor(private popoverController: PopoverController) { }

  ngOnInit() {
  }

  async closePopover(action: string){
    let startLocation = null;
    await this.getLocationByID(this.route.startLocationID).then(location => {
      startLocation = location;
    });
    let stopLocation = null;
    await this.getLocationByID(this.route.stopLocationID).then(location => {
      stopLocation = location;
    });
    this.popoverController.dismiss({
      action, 
      route: this.route,
      startLocation, 
      stopLocation
    }); 
  }

  async getLocationByID(id){
    let foundLocation = null;
    this.locations.forEach((curLocation, index)=>{
      if(curLocation.id.toString() == id){
        foundLocation = index;
      }
    });
    return this.locations[foundLocation];
  }
  isValid(){
    console.log(this.route);
    return this.route.name.trim() !== '' &&
    this.route.dayOfTheWeek.length > 0 &&
    this.route.startLocationID !== null &&
    this.route.stopLocationID !== null &&
    this.route.startLocationID !== this.route.stopLocationID;
  }
}
