import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Credentials, CredentialsService } from './credentials.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';


export interface LoginContext {
  username: string;
  password: string;
}

/**
 * Provides a base for authentication workflow.
 * The login/logout methods should be replaced with proper implementation.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  constructor(private credentialsService: CredentialsService, private http: HttpClient) {}

  async login(context: LoginContext): Promise<any> {
    return await this.http
      .post<any>(environment.serverUrl + 'auth/login/', context)
      .toPromise()
      .then(res => {
        this.credentialsService.setCredentials({ username: context.username, token: res.access_token, role: res.role }, true);
        return res;
      })
      .catch(error => {
        return false;
      });
  }

  /**
   * Logs out the user and clear credentials.
   * @return True if the user was logged out successfully.
   */
  logout(): Observable<boolean> {
    // Customize credentials invalidation here
    this.credentialsService.setCredentials();
    return of(true);
  }
  
  isAuthenticated(){
    return this.credentialsService.isAuthenticated();
  }

  getRole(){
     return this.credentialsService.credentials.role;
  }
}
