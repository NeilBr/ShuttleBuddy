import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CredentialsService } from '../authentication/credentials.service';
import { Location } from '../shared/models/location';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private http: HttpClient, private credentialsService: CredentialsService) { }
  
  async getAllLocations() :Promise<Location[]>{
    return await this.http.get<Location[]>(environment.serverUrl + 'locations', this.getHeaders()).toPromise();
  }

  async updateLocation(location: Location) :Promise<Location>{
    return await this.http.patch<Location>(environment.serverUrl + 'locations/'+ location.id, location, this.getHeaders()).toPromise();
  }

  async createLocation(location: Location) :Promise<Location>{
    return await this.http.post<Location>(environment.serverUrl + 'locations', location, this.getHeaders()).toPromise();
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
