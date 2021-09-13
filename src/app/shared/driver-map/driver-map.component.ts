import { AfterViewInit, Component, OnInit } from '@angular/core';
import { RandomColor } from 'angular-randomcolor';
import { CredentialsService } from 'src/app/authentication/credentials.service';
import { RoutesService } from 'src/app/services/routes.service';
import { Route } from '../models/route';
import { CronJob } from 'cron';
import { MapSocket } from 'src/app/services/map-socket.service';
import { Location } from '../models/location';
import { LocationService } from 'src/app/services/location.service';


@Component({
  selector: 'app-driver-map',
  templateUrl: './driver-map.component.html',
  styleUrls: ['./driver-map.component.scss'],
})
export class DriverMapComponent implements OnInit, AfterViewInit {

  map: google.maps.Map;
  routeId: number;
  mockRouteId: number;
  shuttleId: number;

  cronJob: CronJob;


  travelRoute: Route;
  travelRoutePolyline: google.maps.Polyline;

  shuttleMarker: google.maps.Marker;

  mockTravel: Route;
  mockTravelPath: any[];
  mockTravelIndex: number;

  curLocation: any;
  locations: Location[];

  constructor(
    private locationService: LocationService,
    private routesService: RoutesService,
    private credentialsService: CredentialsService,
    private mapSocket: MapSocket
  ) { }

  ngOnInit() {
    
    this.routeId = this.credentialsService.shuttleDetails ? this.credentialsService.shuttleDetails.routeId : 10; 
    this.shuttleId = this.credentialsService.shuttleDetails ? this.credentialsService.shuttleDetails.shuttleId : 0; 

    this.mockRouteId = this.credentialsService.shuttleDetails ? this.credentialsService.shuttleDetails.mockRouteId : 10; 

    this.routesService.getRoutes(this.mockRouteId).then((route)=>{
      this.mockTravel = route;
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.createLocations();
    this.startRoute();
  }

  async initMap(){
 
    this.map = new google.maps.Map(document.getElementById('Onroute'), {
      zoom: 20,
      center: { lat:-33.94719166680535, lng: 25.54426054343095},
      tilt: 40
    });
    // TODO: Center map on geolocation or center of all markers

  }

  async startRoute(){
    
    await this.routesService.getRoutes(this.routeId).then((route)=>{
      this.travelRoute = route;

      this.travelRoutePolyline = new google.maps.Polyline({
        strokeColor: RandomColor.generateColor(),
        strokeOpacity: 1.0,
        strokeWeight: 5,
      });
      const pathPoints = JSON.parse(this.mockTravel.pathPoints);
      this.map.setCenter(pathPoints[0]);
      this.shuttleMarker = new google.maps.Marker({
        position: pathPoints[0],
        draggable:false,
        title: 'Shuttle',
        map: this.map,
        icon: {
          url:'./assets/icon/bus-outline.svg', 
          scaledSize: new google.maps.Size(50, 50),
          fillColor: '#f9b42a',
          strokeWeight: 2,
          strokeColor: '#f9b42a',
        }
      });
      this.mockTravelIndex = 0;
      this.travelRoutePolyline.setPath(JSON.parse(this.travelRoute.pathPoints));
      this.travelRoutePolyline.setMap(this.map);
      this.startBroadcast();
    });
    
    

  }

  startBroadcast(){
    this.mockTravelPath = JSON.parse(this.mockTravel.pathPoints);

    // await Geolocation.watchPosition({}, position =>{
    //   this.mapSocket.sendPosition(position);
    // });
    this.cronJob = new CronJob('*/2 * * * * *', async () => {
      try {
        
        this.redrawMarkerChange();
        this.redrawPolylineRoute();
        
      } catch (e) {
        console.error(e);
      }
    });
    
    // Start job
    if (!this.cronJob.running) {
      this.cronJob.start();
    }
  }

  async redrawPolylineRoute(){
    let newpath = JSON.parse(this.travelRoute.pathPoints);
    let closestIndex = 0;
    let minDistance = 999999999;
    await newpath.forEach((location, index) => {
      const d = this.haversine_distance(this.curLocation, location);
      if(d <= minDistance){
         minDistance = d; closestIndex = index;
        }  
    });
    console.log(newpath, closestIndex);
    newpath.splice(1, closestIndex );
    newpath[0] = this.curLocation;
    console.log(newpath);
    this.travelRoutePolyline.setPath(newpath);
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

  redrawMarkerChange(){
    const newPos = this.mockTravelPath[this.mockTravelIndex]
    this.mapSocket.sendPosition({
      shuttleId: this.shuttleId,
      position: newPos
    });
    this.curLocation= newPos;
    this.shuttleMarker.setPosition(newPos);
    this.map.panTo(newPos);
    if(this.mockTravelIndex !== this.mockTravelPath.length -1){
      this.mockTravelIndex++;
    }else{
      this.mockTravelIndex = 0;
    }
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

    });   

  }
}
