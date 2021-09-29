import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CredentialsService } from 'src/app/authentication/credentials.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { MenuService } from '../menu/menu.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent implements OnInit {

  loading = new BehaviorSubject(false); 
  schedules: any;
  originalSchedules: any;
  showMenu = false;
  filter = {
    days:[],
    search: ''
  }
  constructor( 
    private menuService: MenuService,
    private scheduleService: ScheduleService,
    private credentialsService: CredentialsService
    ) {
      if (this.credentialsService.credentials.role === 'Admin'){
        this.showMenu = true;
      }
    }

  ngOnInit() {
    
    this.getSchedule();    
  }

  getIsOpen(){
    return this.menuService.menuState;
  }

  async getSchedule(){
    this.loading.next(true);
    await this.scheduleService.getWeeksSchedule().then(schedule => {
      this.schedules = JSON.parse(JSON.stringify(schedule));
      this.originalSchedules = JSON.parse(JSON.stringify(schedule));
      this.loading.next(false);
    });
  }

  setScheduleFilter(setting, filter){
    filter = filter.detail.value
    setting === 'days'? this.filter.days = filter: filter === null? this.filter.search = '' : this.filter.search = filter ;
    this.filterSchedule();
  }

  filterSchedule(){
    const filteredSchedules = [];
    console.log(this.originalSchedules)

    this.originalSchedules.routes.forEach(route => {
      let insertDays = false;
      let insertSearch = false;

      const routeDays = route.dayOfTheWeek as string;

      // Check if route matches the days filter 
      if(this.filter.days.length > 0){
        this.filter.days.forEach(day => {
          if(routeDays.indexOf(day) !== -1){
            insertDays = true;
          }
        });
      } else {
        insertDays = true;
      }
      
      // Check if route matches the search filter
      if(this.filter.search.trim() !== ''){
        route.schedule.forEach(location => {
          if(location.locationID.name.toLowerCase().indexOf(this.filter.search.toLowerCase()) !== -1){
            insertSearch = true;
          }    
        });
      }else{
        insertSearch = true;
      }
      
      if(insertSearch && insertDays){
        filteredSchedules.push(JSON.parse(JSON.stringify(route)));
      }
    });
    this.schedules.routes = JSON.parse(JSON.stringify(filteredSchedules)) ;
 }
}
