/// <reference types="@types/googlemaps" />
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { IonIcon, NavController, PopoverController } from '@ionic/angular';
import { RandomColor } from 'angular-randomcolor';
import { LocationService } from 'src/app/services/location.service';
import { MapSocket } from 'src/app/services/map-socket.service';
import { RoutesService } from 'src/app/services/routes.service';
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
  shuttleMarkers: google.maps.Marker[];
  routePolylines: google.maps.Polyline[];
  pointerEvent: MouseEvent;

  map: google.maps.Map;
  drawType = 'stop';

  newRoute: Route;

  newRouteStops = [];

  currentRoute: google.maps.Polyline;
  curRoutePoints = [];
  routes = [];

  constructor(
    private locationService: LocationService,
    private routesService: RoutesService,
    private popoverController: PopoverController,
    private navController: NavController,
    private mapSocket: MapSocket
  ) { 
  }
  
  ngAfterViewInit(): void {
    this.initMap();
    this.setMapDataForPage()
  }

  ngOnInit() {
    this.routePolylines = [];
    this.locationMarkers = []; 
    this.locations = [];
    this.shuttleMarkers = [];

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
        this.initRoutesPage();
        break;
      }
      case 'dashboard':{
        this.createLocationsForRoutes();
        this.listenToSocket();
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

  initRoutesPage(){
    this.createLocationsForRoutes();
    this.setUpExistingRoutes()
  }

  setUpExistingRoutes(){
    this.routesService.getAllRoutes().then((routes)=>{
      routes.forEach((route)=>{
        let curRoutePolyline = new google.maps.Polyline({
          strokeColor: RandomColor.generateColor(),
          strokeOpacity: 1.0,
          strokeWeight: 3,
        });
        console.log(route);
        curRoutePolyline.setPath(JSON.parse(route.pathPoints));
        curRoutePolyline.setMap(this.map);
        this.routePolylines.push(curRoutePolyline);
      });
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

  drawLocationsForDrawRoute(){
    this.clearMarkers();
    this.locations.forEach(location => {
      console.log(location.locationType);
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
        this.addLocationToNewRoute(location);
      })
      this.locationMarkers.push(newMarker);
    });   
  }

  async createLocations(){
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
    this.newRouteStops.push(location.id);
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

  async finishRoute(){
    //call save route
   
    this.populateNewRouteForSave();
    this.routes.push(this.currentRoute);
    await this.routesService.createRoutes(this.newRoute).then((res)=>{
      this.clearMarkers();
      this.createLocationsForRoutes();
      this.curRoutePoints = [];
      this.currentRoute = null;
      this.newRoute = null;
      this.newRouteStops = [];
    });
    
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

    popover.onDidDismiss().then((response) => {
      if(response.data.action !== 'cancel'){
      this.handleRoutePopoverClose(response.data.route, eventType)
    }
    });
  }

  handleRoutePopoverClose(route, eventType){
    switch (eventType){
      case 'createRoute': {
        // add route details from popover and prep for drawing
        this.newRoute = {
          id: null,
          dayOfTheWeek: '',
          name: '',
          pathPoints: '',
          routeStops: '',
          startLocationID: null,
          stopLocationID: null
        } as Route;
        this.newRoute.name = route.name;
        this.newRoute.dayOfTheWeek = route.dayOfTheWeek.toString();
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

  clearShuttleMarkers(){
    this.shuttleMarkers.forEach(marker =>{
      marker.setMap(null);
    });
    this.shuttleMarkers = [];
  }

  populateNewRouteForSave(){
    this.newRoute.pathPoints = JSON.stringify(this.curRoutePoints); 
    this.newRoute.routeStops = JSON.stringify(this.newRouteStops);
    this.newRoute.startLocationID =this.newRouteStops[0];
    this.newRoute.stopLocationID = this.newRouteStops[this.newRouteStops.length - 1];
  }
}
