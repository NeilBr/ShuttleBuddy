/// <reference types="@types/googlemaps" />
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';
import { RandomColor } from 'angular-randomcolor';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { MenuService } from 'src/app/admin/menu/menu.service';
import { LocationService } from 'src/app/services/location.service';
import { MapSocket } from 'src/app/services/map-socket.service';
import { RoutesService } from 'src/app/services/routes.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { MapStyle } from '../consts';
import { LocationModalComponent } from '../location-modal/location-modal.component';
import { Location } from '../models/location';
import { Route } from '../models/route';
import { routeStops } from '../models/routeStops';
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
  
  @ViewChild('locationSearchAdmin', { read: ElementRef }) locationSearchAdmin: ElementRef;

  loadingShuttle = new BehaviorSubject(false);

  shuttleTravelRoute: Route;
  viewShuttleLocation: any;
  shuttleRoutePolyline: google.maps.Polyline;
  viewShuttlesRoute = false;
  shuttleClientID: string;
  schedule: any;
  nextStop: any;
  finalStop: any;

  locations: Location[];
  locationMarkers: google.maps.Marker[];
  shuttleMarkers: google.maps.Marker[];
  routePolylines: google.maps.Polyline[];
  pointerEvent: MouseEvent;

  map: google.maps.Map;
  drawType = 'stop';

  newRoute: Route;
  startTimes = [];
  newRouteStops = [] as routeStops[];

  currentRoute: google.maps.Polyline;
  curRoutePoints = [] as google.maps.LatLng[];
  lastPointLocation = false;
  routes = [];

  searchingLocations = false;
  searchString = '';
  filteredLocations: Location[];

  constructor(
    private locationService: LocationService,
    private routesService: RoutesService,
    private popoverController: PopoverController,
    private scheduleService: ScheduleService,
    private menuService: MenuService,
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

  // checks which page the admin is on and sets up the map accordingly 
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

  // google maps initialisation
  async initMap(){
     this.map = new google.maps.Map(document.getElementById(this.page), {
      zoom: 15,
      center: { lat:-34.00041952493058, lng: 25.666596530421096},
      styles: MapStyle ,
      mapTypeControl: false,
      fullscreenControl: false,
    });

    this.map.addListener("mousedown", () => {
      if(this.searchingLocations){
        this.locationSearchAdmin.nativeElement.blur();
        this.endFilter(); 
      }
    });
    
  }

  initRoutesPage(){
    this.createLocationsForRoutes();
    this.setUpExistingRoutes()
  }

  // gets the routes from the database and draws them onto the map
  setUpExistingRoutes(){
    this.routesService.getAllRoutes().then((routes)=>{
      routes.forEach((route)=>{
        let curRoutePolyline = new google.maps.Polyline({
          strokeColor: RandomColor.generateColor(),
          strokeOpacity: 1.0,
          strokeWeight: 5,
        });
        curRoutePolyline.setPath(JSON.parse(route.pathPoints));
        curRoutePolyline.setMap(this.map);
        curRoutePolyline.addListener("mouseover", ($event) => {
          curRoutePolyline.setOptions({strokeWeight: 10})
        });
        curRoutePolyline.addListener("mouseout", ($event) => {
          curRoutePolyline.setOptions({strokeWeight: 5})
        });
        curRoutePolyline.addListener("click", ($event) => {
          this.editRoute(route);
        });
        this.routePolylines.push(curRoutePolyline);
      });
    });
  }

  editRoute(route){
    
  }
  
  // listen to the websocket for incomming shuttle data
  listenToSocket(){
    this.mapSocket.shuttleLocationUpdates.subscribe((shuttleLocations) =>{
      this.redrawShuttleLocations(shuttleLocations);
    });
  }

  // this clears the shuttle markers and updates the positions to the 
  // new ones recieved from   
  async redrawShuttleLocations(shuttleLocations){
    this.clearShuttleMarkers();
    await shuttleLocations.forEach((shuttleLocation) => {
      const shuttleMarker = new google.maps.Marker({
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
        },
        zIndex: 999
      });
      this.shuttleMarkers.push(shuttleMarker);
      
      if(!this.viewShuttlesRoute){
        shuttleMarker.addListener("click",() => {
          this.viewShuttleRoute(shuttleLocation);
        });
      }else{
        if(shuttleLocation.clientID === this.shuttleClientID){
          this.viewShuttleLocation = shuttleLocation.position;
        }
      }

    });
    if(this.viewShuttlesRoute){
      this.redrawPolylineRoute();
    }
  }
  
  // gets and draws the locations markers on the map with on clicks for routes page 
  async createLocationsForRoutes(){
    this.locations = await this.locationService.getAllLocations();
    this.locations.forEach(location => {
      const icon = {
        url: location.locationType === 'campus' ? './assets/icon/business-outline.svg' : './assets/icon/people-circle-outline.svg' , 
        scaledSize: new google.maps.Size(24, 24),
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

  // gets and draws the locations markers on the map 
  // when drawing a new route so that the on click is updated 
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
  
  // gets and draws the locations markers on the map with on clicks for locations page 
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

  // show popup for new location
  drawToStop($event){
    let newMarkernew = new google.maps.Marker({
      position: $event.latLng,
      map: this.map,
      draggable:true,
    });  

    this.presentLocationPopover($event, 'createLocation', newMarkernew);
  }
  
  // show popup for new route
  drawToRoute($event){
    this.currentRoute ? this.addPointToRoute($event) : this.startRoute($event);
  }

  // add location to route when drawing a new route and location icon is clicked
  addLocationToNewRoute(location: Location){
    this.newRouteStops.push({
      locationID:location.id,
      locationName:location.name,
      time:''
    });
    if(!this.currentRoute){
      this.startRoute(location);
    }else{
      this.addLocationPointToRoute(location)
    }
  }

  // initialise vars for new route to start drawing
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

  // add location co-ords to route for poly line on map
  async addLocationPointToRoute(location: Location){
    await this.curRoutePoints.push(new google.maps.LatLng(+location.latitude, +location.longitude));
    this.currentRoute.setPath(this.curRoutePoints);
  }
  
  // add location co-ords to route for poly line on map
  addPointToRoute($event){
    this.curRoutePoints.push($event.latLng);
    this.currentRoute.setPath(this.curRoutePoints);

    this.map.panTo($event.latLng);

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

  // save new route and re initialise values
  async finishRoute(){
   
    this.populateNewRouteForSave();
    this.routes.push(this.currentRoute);
    await this.routesService.createRoutes({route: this.newRoute,
    stops:this.newRouteStops}).then((res)=>{
      this.clearMarkers();
      this.createLocationsForRoutes();
      this.curRoutePoints = [];
      this.newRouteStops = [];
      this.startTimes = [];
      this.currentRoute = null;
      this.newRoute = null;
      this.newRouteStops = [];
    });
    
  }

  // cancel the new drawn route and re initialise values
  cancelRoute(){
    this.currentRoute.setMap(null);
    this.clearMarkers();
    this.createLocationsForRoutes();
    this.curRoutePoints = [];
      this.newRouteStops = [];
      this.startTimes = [];
      this.currentRoute = null;
      this.newRoute = null;
      this.newRouteStops = []; 
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
        'routeAction': 'Create',
        'locations': this.locations
      };
        break;
      }
      case 'editRoute':{
        componentData = { 'route': route,
        'routeAction': 'Edit'}
        break;
      }
      default: {
        this.cancelRoute();
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
      this.handleRoutePopoverClose(response.data.route, eventType, response.data.startLocation, response.data.stopLocation)
    }
    });
  }

  handleRoutePopoverClose(route, eventType, startLocation: Location, stopLocation){
    switch (eventType){
      case 'createRoute': {
        // add route details from popover and prep for drawing
        this.newRoute = {
          id: null,
          dayOfTheWeek: route.dayOfTheWeek.toString(),
          name: route.name,
          pathPoints: '',
          routeStops: '',
          startTimes: '',
          startLocationID: route.startLocationID,
          stopLocationID: route.stopLocationID
        } as Route;
        this.drawLocationsForDrawRoute(); 
        
        this.map.setCenter(
          {lat: +startLocation.latitude,
          lng: +startLocation.longitude});

        this.map.setZoom(19);
        this.startTimes.push('07:00:00')
        this.addLocationToNewRoute(startLocation);
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

  // remove the new location icon if new location cancelled 
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

  // handle on click from button
  startDrawingRoute(){
    if(!this.currentRoute){
      this.presentRoutePopover('createRoute', null);
    }
  }

  // clear location markers
  clearMarkers(){
    this.locationMarkers.forEach(marker =>{
      marker.setMap(null);
    });
    this.locationMarkers = [];
  }

  //clear all shuttle markers
  clearShuttleMarkers(){
    this.shuttleMarkers.forEach(marker =>{
      marker.setMap(null);
    });
    this.shuttleMarkers = [];
  }

  // forms the new route in the correct data format
  populateNewRouteForSave(){
    this.newRoute.pathPoints = JSON.stringify(this.curRoutePoints); 
    this.newRoute.routeStops = JSON.stringify(this.getRouteStopsIDs());
    this.newRoute.startTimes = this.getStartTimes();
    this.newRoute.startLocationID =this.newRouteStops[0].locationID;
    this.newRoute.stopLocationID = this.newRouteStops[this.newRouteStops.length - 1].locationID;
  }

  // gets all id's for new routes stops 
  getRouteStopsIDs(){
    const stops = [];
    this.newRouteStops.forEach((routeStop)   =>{
        stops.push(routeStop.locationID);
    });
    return stops;
  }

  // checks if menu is open
  getIsOpen(){
    return this.menuService.menuState;
  }

  // adds start time to new route
  addStartTime(){
    this.startTimes.push('07:00:00'); 
    
  }
  
  // formats all start times for new route
  getStartTimes(){

    let startTimesString = '';
    this.startTimes.forEach(start =>{
      startTimesString = startTimesString === ''? 
      startTimesString + start + ':00': startTimesString + ',' + start + ':00'; 
    });
  
    return startTimesString;
  }

  // draws the polyline route of a selected shuttle
  viewShuttleRoute(shuttle: any){
    this.loadingShuttle.next(true);
    this.routesService.getRoutes(shuttle.routeID).then(route => {
      this.shuttleTravelRoute = route;
      this.viewShuttleLocation = shuttle.position;
      this.viewShuttlesRoute = true;
      this.shuttleClientID = shuttle.clientID;
      this.shuttleRoutePolyline = new google.maps.Polyline({
        strokeColor: RandomColor.generateColor(),
        strokeOpacity: 1.0,
        strokeWeight: 5,
      });
      this.map.panTo(shuttle.position);
      this.shuttleRoutePolyline.setMap(this.map);
      this.scheduleService.getScheduleByID(shuttle.routeID).then(schedule =>{
        this.schedule = schedule;
        this.finalStop = schedule.schedule[schedule.schedule.length - 1];
        this.redrawPolylineRoute();
        this.loadingShuttle.next(false);
      });
    });

  }
  
  // redraws the polyline route of a selected shuttle
  async redrawPolylineRoute(){
    let newpath = JSON.parse(this.shuttleTravelRoute.pathPoints);
    let closestIndex = 0;
    let minDistance = 999999999;
    await newpath.forEach((location, index) => {
      const d = this.haversine_distance(this.viewShuttleLocation, location);
      if(d <= minDistance){
         minDistance = d; closestIndex = index;
        }  
    });
    
    newpath.splice(1, closestIndex);
    newpath[0] = this.viewShuttleLocation;
    this.shuttleRoutePolyline.setPath(newpath);

    this.setNextStop(JSON.parse(JSON.stringify(newpath)));
  }
  
  // gets next stop for selected shuttle
  async setNextStop(pathPoints:any[]){
    let returnSchedule = null;
    for(let point of pathPoints) {
      if(this.schedule){
        for(let schedule of this.schedule.schedule) {
          if(point.lat === +schedule.locationID.latitude && point.lng === +schedule.locationID.longitude){
            returnSchedule = schedule;
            break;
          }
        }
        if(returnSchedule){
          this.nextStop = returnSchedule;
          // console.log('STOP', this.nextStop);
          break;
        }
      }  
    }
  }

  // calculate the distance between 2 geolocation points
  // https://cloud.google.com/blog/products/maps-platform/how-calculate-distances-map-maps-javascript-api
  haversine_distance(mk1, mk2) {
    var R = 3958.8; // Radius of the Earth in miles
    var rlat1 = mk1.lat * (Math.PI/180); // Convert degrees to radians
    var rlat2 = mk2.lat * (Math.PI/180); // Convert degrees to radians
    var difflat = rlat2-rlat1; // Radian difference (latitudes)
    var difflon = (mk2.lng - mk1.lng) * (Math.PI/180); // Radian difference (longitudes)

    var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
    return d;
  }

  getRouteTitle(){
    if(this.schedule){
      if(this.schedule.schedule.length > 0){
        let start = this.schedule.schedule[0];
        let end  = this.schedule.schedule[this.schedule.schedule.length - 1];
    
        return start.locationID.name + ' &nbsp &nbsp ➤ &nbsp &nbsp ' + end.locationID.name;
      } else {
        return this.schedule.name;
      }
    }
  }

  getNextStopEstimatedTime(){
    let scheduleIndex = 0;
    let count = 0;
    for(let time of this.schedule.startTimes.split(',')){
      const currentTime = moment();
      const startTime = moment(moment().format('DD MM YYYY') + ' ' + time, 'DD MM YYYY HH:mm:ss');
      if(startTime.isBefore(currentTime)){
        scheduleIndex = count;
      }
      ++count;
    };
    return this.nextStop.estTime.split(',')[scheduleIndex];

  }

  getFinalStopEstimatedTime(){
    let scheduleIndex = 0;
    let count = 0;
    for(let time of this.schedule.startTimes.split(',')){
      const currentTime = moment();
      const startTime = moment(moment().format('DD MM YYYY') + ' ' + time, 'DD MM YYYY HH:mm:ss');
      if(startTime.isBefore(currentTime)){
        scheduleIndex = count;
      }
      ++count;
    };
    return this.finalStop.estTime.split(',')[scheduleIndex];
  }

  // stops the selected shuttle view
  stopShuttleView(){
    this.shuttleTravelRoute = null;
    this.viewShuttleLocation= null;
    this.shuttleRoutePolyline.setMap(null);
    this.shuttleRoutePolyline= null;
    this.viewShuttlesRoute = false;
    this.shuttleClientID= null;
    this.schedule= null;
    this.nextStop= null;
    this.finalStop= null;
  }

  /// methods to return search items according to filter in search bar
  searchLocations(search){
    search = search.detail.value;
    if(search.trim()!== ''){
      this.searchString = search;
      this.searchingLocations = true;
    }else{
      this.searchString = '';
    }
    this.filterLocations();

  }
  startFilter(){
    this.searchingLocations = true;
    this.filterLocations();

  }
  endFilter(){
    this.searchingLocations = this.searchString.trim()!== '';
  }
  
  filterLocations(){
    const newFilter = [];
    this.locations.forEach((location) =>{
      if(location.name.toUpperCase().includes(this.searchString.toUpperCase())){
        newFilter.push(JSON.parse(JSON.stringify(location)))
      }
    });
    this.filteredLocations = JSON.parse(JSON.stringify(newFilter));
  }
  //////////////////////////////////////////////////////////////////
  
  // pans the map to a location
  goToLocation(location: Location){
    this.map.panTo({lat: +location.latitude, lng: +location.longitude});
    this.map.setZoom(19);
    this.endFilter();
  }

  // sets the start time for a new route new start time
  setStartTime(index, event){
    this.startTimes[index] = event.details.value;
  }

  // undoes the last route point added when creating a route 
  undoRoutePoint(){
    this.curRoutePoints.pop();
    if(this.lastPointLocation){
      this.lastPointLocation = false;
      this.newRouteStops.pop();
    }
    this.currentRoute.setPath(this.curRoutePoints);
  }
}
