import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { MenuService } from '../../menu/menu.service';

@Component({
  selector: 'schedule-card',
  templateUrl: './schedule-card.component.html',
  styleUrls: ['./schedule-card.component.scss'],
})
export class ScheduleCardComponent implements OnInit {
  @Input() route: any;

  loading = new BehaviorSubject(false); 
  selectedTime = 0;
  
  constructor( 
    private menuService: MenuService,
    ) { }

  ngOnInit() {
  }

  getIsOpen(){
    return this.menuService.menuState;
  }

  getRouteTitle(route: any){
    if(route.schedule.length > 0){
      let start = route.schedule[0];
      let end  = route.schedule[route.schedule.length - 1];
  
      return start.locationID.name + ' &nbsp &nbsp ➤ &nbsp &nbsp ' + end.locationID.name;
    } else {
      return route.name;
    }
  }

  setStartTime(index){
    this.selectedTime = index;
  }

  getMomentTime(time){
    return moment(time, 'HH:mm:ss').format('LT');
  }
}
