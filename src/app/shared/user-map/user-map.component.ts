import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { PopoverController } from '@ionic/angular';
import { RandomColor } from 'angular-randomcolor';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { LocationService } from 'src/app/services/location.service';
import { MapSocket } from 'src/app/services/map-socket.service';
import { RoutesService } from 'src/app/services/routes.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { MapStyle } from '../consts';
import { LocationModalComponent } from '../location-modal/location-modal.component';
import { Location } from '../models/location';
import { Route } from '../models/route';

@Component({
  selector: 'app-user-map',
  templateUrl: './user-map.component.html',
  styleUrls: ['./user-map.component.scss'],
})
export class UserMapComponent implements OnInit, AfterViewInit {
  
  @ViewChild('locationSearch', { read: ElementRef }) locationSearch: ElementRef;
  
  @Output() popup = new EventEmitter<any>();
  loading = new BehaviorSubject(false);

  locations: Location[];
  filteredLocations: Location[];
  locationMarkers: google.maps.Marker[];
  shuttleMarkers: google.maps.Marker[];
  routePolylines: google.maps.Polyline[];
  pointerEvent: MouseEvent;

  shuttleTravelRoute: Route;
  viewShuttleLocation: any;
  shuttleRoutePolyline: google.maps.Polyline;
  viewShuttlesRoute = false;
  shuttleClientID: string;
  schedule: any;
  nextStop: any;
  finalStop: any;

  map: google.maps.Map;

  newRoute: Route;

  newRouteStops = [];

  currentRoute: google.maps.Polyline;
  curRoutePoints = [];
  routes = [];

  searchingLocations = false;
  searchString = '';


  ////////////////////////////////////////////////////////////

  // This component is a stripped down version of map.component.ts
  // Methods are commented there

  ///////////////////////////////////////////////////////////
  constructor(  
    private locationService: LocationService,
    private popoverController: PopoverController,
    private routesService: RoutesService,
    private scheduleService: ScheduleService,
    private mapSocket: MapSocket) { }

  ngOnInit() {
    this.routePolylines = [];
    this.locationMarkers = []; 
    this.locations = [];
    this.filteredLocations = [];
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
      styles: MapStyle,
      mapTypeControl: false,

      fullscreenControl: false,
    });

    this.map.addListener("mousedown", () => {
      if(this.searchingLocations){
        this.locationSearch.nativeElement.blur();
        this.endFilter(); 
      }
    });

   await Geolocation.getCurrentPosition().then(resp => {
      this.map.setCenter({lat: resp.coords.latitude, lng:  resp.coords.longitude});
    });

  }

  async createLocationsForRoutes(){
    this.locations = await this.locationService.getAllLocations();
    this.locations.forEach(location => {
      const icon = {
        url: location.locationType === 'campus' ? './assets/icon/business-outline.svg' : './assets/icon/people-circle-outline.svg' , 
        scaledSize: new google.maps.Size(20, 20),
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

  clearShuttleMarkers(){
    this.shuttleMarkers.forEach(marker =>{
      marker.setMap(null);
    });
    this.shuttleMarkers = [];
  }


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

  goToLocation(location: Location){
    this.map.panTo({lat: +location.latitude, lng: +location.longitude});
    this.map.setZoom(19);
    this.endFilter();
  }

  viewShuttleRoute(shuttle: any){
    this.loading.next(true);
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
        this.loading.next(false);
      });
    });

  }

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
    
}
