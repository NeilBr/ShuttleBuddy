import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CredentialsService } from '../authentication/credentials.service';
import { Route } from '../shared/models/route';

@Injectable({
  providedIn: 'root'
})
export class RoutesService {

 
  constructor(private http: HttpClient, private credentialsService: CredentialsService) { }
  
  async getAllRoutes() :Promise<Route[]>{
    return await this.http.get<Route[]>(environment.serverUrl + 'routes', this.getHeaders()).toPromise();
  }

  async updateLocation(route: Route) :Promise<Route>{
    return await this.http.patch<Route>(environment.serverUrl + 'routes/'+ route.id, route, this.getHeaders()).toPromise();
  }

  async createLocation(route: Route) :Promise<Route>{
    return await this.http.post<Route>(environment.serverUrl + 'routes', route, this.getHeaders()).toPromise();
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
