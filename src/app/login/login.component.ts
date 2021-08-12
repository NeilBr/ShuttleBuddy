import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';
import { CredentialsService } from '../authentication/credentials.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  error: string | undefined;
  isLoading = false;
  username = 'NeilBD';
  password = '123456';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
  ) {}

  ngOnInit() {}

  login() {
    this.isLoading = true;
    this.authenticationService
      .login({
        username: this.username,
        password: this.password
      }).then(async (res: any) => {
        console.log(res);
        if (res) {
          switch (res.role){
            case 'Admin':{
              await this.router.navigate([this.route.snapshot.queryParams.redirect || '/admin/dashboard'], { replaceUrl: true });
              break;
            }
            case 'Driver':{
              this.router.navigate(['/driver/wizard'], { replaceUrl: true });
              break;
            }
            default:
              this.router.navigate([this.route.snapshot.queryParams.redirect || '/user/map'], { replaceUrl: true });
              break;
          }  
        }
      })
      .catch(error => {
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  validForm(){
    return this.username.trim() !== '' && this.password.trim() !== ''
  }

}
