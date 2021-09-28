import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Location } from '../models/location';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-location-modal',
  templateUrl: './location-modal.component.html',
  styleUrls: ['./location-modal.component.scss'],
})
export class LocationModalComponent implements OnInit {
  
  @Input() location: Location;
  @Input() locationAction: string;

  constructor(private popoverController: PopoverController) { }

  ngOnInit() {
    console.log(this.locationAction);
  }

  closePopover(action: string){
    this.popoverController.dismiss({action, location: this.location}); 
  }


  isValid(){
    return this.location.name.trim() !== '' &&
    this.location.description.trim() !== '' &&
    this.location.locationType.trim() !== '';
  }
}
