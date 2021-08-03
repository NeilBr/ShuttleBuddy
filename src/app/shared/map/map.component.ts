/// <reference types="@types/googlemaps" />
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { IonIcon, PopoverController } from '@ionic/angular';
import { RandomColor } from 'angular-randomcolor';
import { LocationService } from 'src/app/services/location.service';
import { IonicMarkerIcons } from 'src/assets/icon/ionic_icons';
import { LocationModalComponent } from '../location-modal/location-modal.component';
import { Location } from '../models/location';
import { Route } from '../models/route';
import { RouteModalComponent } from '../route-modal/route-modal.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {

  @Input() page: string;
  @Input() data: any;

  @Output() popup = new EventEmitter<any>();
    
  locations: Location[];
  locationMarkers: google.maps.Marker[];
  pointerEvent: MouseEvent;

  map: google.maps.Map;
  drawType = 'stop';

  newRoute: Route;
  currentRoute: google.maps.Polyline;
  curRoutePoints = [];
  routes = [];



  constructor(
    private locationService: LocationService,
    private popoverController: PopoverController,
  ) { }
  
  ngAfterViewInit(): void {
    this.initMap();
    this.setMapDataForPage()
  }

  ngOnInit() {
    console.log('NGINIT FOR MAP');
    this.locationMarkers = []; 
    this.locations = [];

  }

  setMapDataForPage(){
    switch (this.page){
      case 'locations':{
        this.map.addListener("click", ($event) => {
          this.drawToStop($event); 
        });
        this.createLocations();
        break;
      }
      case 'routes':{
        this.createLocationsForRoutes();
        break;
      }
      case 'dashboard':{
        this.createLocationsForRoutes();
        break;
      }
      default:{
        break;
      }

    }
  }

  async initMap(){
 
    console.log(this.page);
    this.map = new google.maps.Map(document.getElementById(this.page), {
      zoom: 17,
      center: { lat:-33.94719166680535, lng: 25.54426054343095}
    });
    
    // TODO: Center map on geolocation 
    // let marker = new google.maps.Marker({
    //   position: { lat:-33.94719166680535, lng: 25.54426054343095},
    //   title: "Hello World!",
    // });
  }

  async createLocationsForRoutes(){
    this.locations = await this.locationService.getAllLocations();
    this.locations.forEach(location => {
      const newMarker = new google.maps.Marker({
        position: { lat: Number(location.latitude), lng: Number(location.longitude) },
        draggable:false,
        title: location.name,
      });
      newMarker.setMap(this.map);
      newMarker.addListener("click", () => {
        this.presentLocationPopover(location, 'viewLocation', newMarker);
      })
      this.locationMarkers.push(newMarker);
    });   
  }

  drawLocationsForDrawRoute(){
    this.clearMarkers();
    this.locations.forEach(location => {
      const newMarker = new google.maps.Marker({
        position: { lat: Number(location.latitude), lng: Number(location.longitude) },
        draggable:false,
        title: location.name,
      });
      newMarker.setMap(this.map);
      newMarker.addListener("click", () => {
        this.addLocationToNewRoute(location);
      })
      this.locationMarkers.push(newMarker);
    });   
  }

  async createLocations(){
    this.locations = await this.locationService.getAllLocations();
    this.locations.forEach(location => {
      const newMarker = new google.maps.Marker({
        position: { lat: Number(location.latitude), lng: Number(location.longitude) },
        draggable:false,
        title: location.name,
      });
      newMarker.setMap(this.map);
      newMarker.addListener("click", () => {
        this.presentLocationPopover(location, 'editLocation', newMarker);
      })

      this.locationMarkers.push(newMarker);
    });   

  }

  setDrawType(type: string){
    this.drawType = type;
  }

  drawToStop($event){
    let newMarkernew = new google.maps.Marker({
      position: $event.latLng,
      map: this.map,
      draggable:true,
    });  

    this.presentLocationPopover($event, 'createLocation', newMarkernew);
  }

  drawToRoute($event){
    // TODO: add error display for adding point to route before route started
    this.currentRoute ? this.addPointToRoute($event) : this.startRoute($event);
  }

  addLocationToNewRoute(location: Location){
    if(!this.currentRoute){
      this.startRoute(location);
    }else{
      this.addLocationPointToRoute(location)
    }
  }

  startRoute(location: Location){
    this.currentRoute = new google.maps.Polyline({
      strokeColor: RandomColor.generateColor(),
      strokeOpacity: 1.0,
      strokeWeight: 3,
    });
    this.currentRoute.setMap(this.map);

    this.map.addListener("click", ($event) => {
      this.drawToRoute($event); 
    });
  
    this.addLocationPointToRoute(location);
  }

  async addLocationPointToRoute(location: Location){
    await this.curRoutePoints.push(new google.maps.LatLng(+location.latitude, +location.longitude));
    this.currentRoute.setPath(this.curRoutePoints);
  }

  addPointToRoute($event){
    this.curRoutePoints.push($event.latLng);
    this.currentRoute.setPath(this.curRoutePoints);
    // console.log('POINTS', this.curRoutePoints);

    // const svgMarker = {
    //   path: "M10.453 14.016l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM12 2.016q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
    //   fillColor: "blue",
    //   fillOpacity: 0.6,
    //   strokeWeight: 0,
    //   rotation: 0,
    //   scale: 2,
    //   anchor: new google.maps.Point(15, 30),
    // };

    // // Add a new marker at the new plotted point on the polyline.
    // new google.maps.Marker({
    //   position: $event.latLng,
    //   title: "#" + this.curRoutePoints.length,
    //   map: this.map,
    //   icon: svgMarker
    // });
   
  }

  finishRoute(){
    //call save route
    this.routes.push(this.currentRoute);
    this.clearMarkers();
    this.createLocationsForRoutes();
    this.curRoutePoints = [];
    this.currentRoute = null;
  }

  cancelRoute(){
    this.currentRoute.setMap(null);
    this.curRoutePoints = [];
    this.currentRoute = null;
  }

  clearAllRoutes(){
    this.routes.forEach((route : google.maps.Polyline) => {
      route.setMap(null);
    });
    this.routes = [];
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
      if(data.data.action !== 'cancel'){
      this.handleLocationPopoverClose(data, eventType, googleObject)
    } else {
      this.removeGoogleObject(eventType, googleObject);
    }
    });
  }

  async presentRoutePopover(eventType: string, route: any){
    let componentData = {};

    switch (eventType){
      case 'createRoute': {
        componentData = { 'route': {
          id:null,
          dayOfTheWeek: '',
          name:'',
          pathPoints:'',
          routeStops:'',
          startLocationID: null,
          stopLocationID: null
        } as Route ,
        'routeAction': 'Create'};
        break;
      }
      case 'editRoute':{
        componentData = { 'route': route,
        'routeAction': 'Edit'}
        break;
      }
      default: {
        break;
      }
      
    }

    const popover = await this.popoverController.create({
      component: RouteModalComponent,
      cssClass: 'custom-popover',
      componentProps: componentData,
      translucent: true
    });
    await popover.present();

    popover.onDidDismiss().then((data) => {
      if(data.data.action !== 'cancel'){
      this.handleRoutePopoverClose(data, eventType)
    }
    });
  }

  handleRoutePopoverClose(route, eventType){
    switch (eventType){
      case 'createRoute': {
        // add route details from popover and prep for drawing
        this.newRoute = route;
        this.drawLocationsForDrawRoute();
        break;
      }
      case 'editRoute':{
        // make call to edit route
        break;
      }
      default: {
        break;
      }
      
    }
  }

  handleLocationPopoverClose(data, eventType, googleObject){
    switch (eventType){
      case 'createLocation': {
        this.locationService.createLocation(data.data.location).then(location =>{
          googleObject.addListener("click", () => {
            this.presentLocationPopover(location, 'editLocation', googleObject);
          })
        });
        break;
      }
      case 'editLocation':{
        this.locationService.updateLocation(data.data.location);
        break;
      }
      default: {
        break;
      }
      
    }
  }

  removeGoogleObject(eventType, googleObject){
    switch (eventType){
      case 'createLocation':
        (googleObject as google.maps.Marker).setMap(null);
        break;
      case 'editLocation':{
        break;
      }
      default: {
        break;
      }
      
    }
  }

  startDrawingRoute(){
    this.presentRoutePopover('createRoute', null);
  }

  clearMarkers(){
    this.locationMarkers.forEach(marker =>{
      marker.setMap(null);
    });
    this.locationMarkers = [];
  }
}
