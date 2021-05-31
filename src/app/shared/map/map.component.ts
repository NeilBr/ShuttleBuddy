/// <reference types="@types/googlemaps" />
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {

  map: google.maps.Map;

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
  }
}
