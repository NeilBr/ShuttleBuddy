import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { LocationService } from 'src/app/services/location.service';
import { LocationModalComponent } from 'src/app/shared/location-modal/location-modal.component';

@Component({
  selector: 'app-manage-locations',
  templateUrl: './manage-locations.component.html',
  styleUrls: ['./manage-locations.component.scss'],
})
export class ManageLocationsComponent implements OnInit {


  constructor( ) { }

  ngOnInit() {
    
  }


}
