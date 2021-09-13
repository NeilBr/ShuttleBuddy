import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CredentialsService } from '../authentication/credentials.service';
import { RouteScheduleDto } from '../shared/models/routeScheduleDto';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private http: HttpClient, private credentialsService: CredentialsService) { }


  async getAllSchedules() :Promise<any[]>{
    return await this.http.get<any[]>(environment.serverUrl + 'routes/schedule', this.getHeaders()).toPromise();
  }
  
  async getScheduleForRoute(routeID) :Promise<RouteScheduleDto[]>{
    return await this.http.get<RouteScheduleDto[]>(environment.serverUrl + 'routes/schedule/route/'+ routeID, this.getHeaders()).toPromise();
  }

  async getScheduleByID(scheduleID) :Promise<RouteScheduleDto[]>{
    return await this.http.get<RouteScheduleDto[]>(environment.serverUrl + 'routes/schedule/'+ scheduleID, this.getHeaders()).toPromise();
  }

  async getWeeksSchedule() :Promise<any[]>{
    return await this.http.get<any[]>(environment.serverUrl + 'routes/schedule/list', this.getHeaders()).toPromise();
  }


  private getHeaders() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.credentialsService.credentials.token,
      })
    };
 
    return httpOptions;
  }

}
