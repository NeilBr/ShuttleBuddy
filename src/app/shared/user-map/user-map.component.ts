import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Route } from '@angular/router';
import { PopoverController, NavController } from '@ionic/angular';
import { LocationService } from 'src/app/services/location.service';
import { MapSocket } from 'src/app/services/map-socket.service';
import { RoutesService } from 'src/app/services/routes.service';
import { MapStyle } from '../consts';
import { LocationModalComponent } from '../location-modal/location-modal.component';
import { Location } from '../models/location';

@Component({
  selector: 'app-user-map',
  templateUrl: './user-map.component.html',
  styleUrls: ['./user-map.component.scss'],
})
export class UserMapComponent implements OnInit, AfterViewInit {
  
  @Output() popup = new EventEmitter<any>();
    
  locations: Location[];
  locationMarkers: google.maps.Marker[];
  shuttleMarkers: google.maps.Marker[];
  routePolylines: google.maps.Polyline[];
  pointerEvent: MouseEvent;

  map: google.maps.Map;

  newRoute: Route;

  newRouteStops = [];

  currentRoute: google.maps.Polyline;
  curRoutePoints = [];
  routes = [];


  constructor(  
    private locationService: LocationService,
    private popoverController: PopoverController,
    private mapSocket: MapSocket) { }

  ngOnInit() {
    this.routePolylines = [];
    this.locationMarkers = []; 
    this.locations = [];
    this.shuttleMarkers = [];
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.createLocationsForRoutes();
    this.listenToSocket();
  }
  
  async initMap(){
    this.map = new google.maps.Map(document.getElementById('User'), {
      zoom: 17,
      center: { lat:-34.00041952493058, lng: 25.666596530421096},
      styles: MapStyle 
    });
    
    // TODO: Center map on geolocation 

  }

  async createLocationsForRoutes(){
    this.locations = await this.locationService.getAllLocations();
    this.locations.forEach(location => {
      const icon = {
        url: location.locationType === 'campus' ? './assets/icon/business-outline.svg' : './assets/icon/people-circle-outline.svg' , 
        scaledSize: new google.maps.Size(40, 40),
        fillColor: '#f9b42a',
        strokeWeight: 2,
        strokeColor: '#f9b42a',
      }
      const newMarker = new google.maps.Marker({
        position: { lat: Number(location.latitude), lng: Number(location.longitude) },
        draggable:false,
        title: location.name,
        icon
      });
      newMarker.setMap(this.map);
      newMarker.addListener("click", () => {
        this.presentLocationPopover(location, 'viewLocation', newMarker);
      })
      this.locationMarkers.push(newMarker);
    });   
  }

  async presentLocationPopover(location: any, eventType: string, googleObject) {

    let componentData = {};

    switch (eventType){
      case 'createLocation': {
        componentData = { 'location': {
          id:null,
          latitude: location.latLng.toJSON().lat,
          longitude: location.latLng.toJSON().lng,
          description: '',
          locationType: '',
          name: '',
          thumbnail: ''
        } as Location ,
        'locationAction': 'Create'};
        break;
      }
      
      case 'viewLocation':{
        componentData = { 'location': location,
        'locationAction': 'View'}
        break;
      }

      case 'editLocation':{
        componentData = { 'location': location,
        'locationAction': 'Edit'}
        break;
      }

      default: {
        break;
      }
      
    }

    const popover = await this.popoverController.create({
      component: LocationModalComponent,
      cssClass: 'custom-popover',
      event: location.domEvent,
      componentProps: componentData,
      translucent: true
    });
    await popover.present();

    popover.onDidDismiss().then((data) => {
   
    });
  }


  listenToSocket(){
    this.mapSocket.shuttleLocationUpdates.subscribe((shuttleLocations) =>{
      this.redrawShuttleLocations(shuttleLocations);
    });
  }

  redrawShuttleLocations(shuttleLocations){
    this.clearShuttleMarkers();
    shuttleLocations.forEach((shuttleLocation) => {
      this.shuttleMarkers.push(new google.maps.Marker({
        position: shuttleLocation.position,
        draggable:false,
        title: 'Shuttle' + shuttleLocation.shuttleId,
        map: this.map,
        icon: {
          url:'./assets/icon/bus-outline.svg', 
          scaledSize: new google.maps.Size(25, 25),
          fillColor: '#f9b42a',
          strokeWeight: 2,
          strokeColor: '#f9b42a',
        }
      }));
    });
  }

  clearShuttleMarkers(){
    this.shuttleMarkers.forEach(marker =>{
      marker.setMap(null);
    });
    this.shuttleMarkers = [];
  }

}
