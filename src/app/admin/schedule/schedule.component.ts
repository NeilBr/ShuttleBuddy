import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ScheduleService } from 'src/app/services/schedule.service';
import { MenuService } from '../menu/menu.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent implements OnInit {

  loading = new BehaviorSubject(false); 

  schedules = {};
  constructor( 
    private menuService: MenuService,
    private scheduleService: ScheduleService
    ) { }

  ngOnInit() {
    this.getSchedule();
  }

  getIsOpen(){
    return this.menuService.menuState;
  }

  async getSchedule(){
    this.loading.next(true);
    await this.scheduleService.getWeeksSchedule().then(schedule => {
      this.schedules = schedule;
      this.loading.next(false);
    });
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
}
