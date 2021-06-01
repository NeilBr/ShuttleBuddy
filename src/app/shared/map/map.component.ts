/// <reference types="@types/googlemaps" />
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {

  map: google.maps.Map;
  drawType = 'route';

  currentRoute: google.maps.Polyline;
  curRoutePoints = [];
  routes = [];

  constructor() { }
  
  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnInit() {}

  initMap(){
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 19,
      center: { lat:-33.94719166680535, lng: 25.54426054343095}
    });

    const mapref = this.map;

    let marker = new google.maps.Marker({
      position: { lat:-33.94719166680535, lng: 25.54426054343095},
      title: "Hello World!",
    });

    marker.addListener('click', () => {
      console.log('CLICKED');
    })

    marker.setMap(this.map);

    this.map.addListener("click", ($event) => {
      this.drawType == 'route' ? this.drawToRoute($event) : this.drawToStop($event); 
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

    newMarkernew.addListener("click", () => {
      newMarkernew.setMap(null);
    })
  }

  drawToRoute($event){
    this.currentRoute ? this.addPointToRoute($event) : this.startRoute($event);
  }

  startRoute($event){
    this.currentRoute = new google.maps.Polyline({
      strokeColor: "#000000",
      strokeOpacity: 1.0,
      strokeWeight: 3,
    });
    this.currentRoute.setMap(this.map);

    this.addPointToRoute($event);
  }

  addPointToRoute($event){
    this.curRoutePoints.push($event.latLng);
    this.currentRoute.setPath(this.curRoutePoints);

    // Add a new marker at the new plotted point on the polyline.
    // new google.maps.Marker({
    //   position: $event.latLng,
    //   title: "#" + this.curRoutePoints.length,
    //   map: this.map,
    // });
  }

  finishRoute(){
    this.routes.push(this.currentRoute);
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

}
