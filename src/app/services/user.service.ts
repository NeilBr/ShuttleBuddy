import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CredentialsService } from '../authentication/credentials.service';
import { User } from '../shared/models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private credentialsService: CredentialsService) { }
  
  async getAllUsers() :Promise<User[]>{
    return await this.http.get<User[]>(environment.serverUrl + 'users', this.getHeaders()).toPromise();
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
