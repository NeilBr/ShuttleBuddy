import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationService } from '../authentication/authentication.service';
import { CredentialsService } from '../authentication/credentials.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  error: string | undefined;
  isLoading = new BehaviorSubject(false);
  username = '';
  password = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  login() {
    this.isLoading.next(true);
    this.authenticationService
      .login({
        username: this.username,
        password: this.password
      }).then(async (res: any) => {
        if (res) {
          switch (res.role){
            case 'Admin':{
              this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
              break;
            }
            case 'Driver':{
              this.router.navigate(['/driver/wizard'], { replaceUrl: true });
              break;
            }
            case 'User':{
              this.router.navigate(['/user/home'], { replaceUrl: true });
              break;
            }
            default:
              this.router.navigate([this.route.snapshot.queryParams.redirect || '/user/map'], { replaceUrl: true });
              break;
          }  
        }else{
          const toast = await this.toastController.create({
            message: 'Username or Password is incorrect',
            duration: 2000,
            color: 'danger'
          });
          toast.present();
        }
      })
      .catch(async (error) => {        
      })
      .finally(() => {
        this.isLoading.next(false);
      });
  }
  
  // checks if login form is filled in correctly
  validForm(){
    return this.username.trim() !== '' && this.password.trim() !== ''
  }

}
