import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/shared/models/user';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss'],
})

export class ManageUsersComponent implements OnInit {

  loading = new BehaviorSubject(false); 

  users: User[];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loading.next(true);
    this.userService.getAllUsers().then(res => {
      this.users = res;
      this.loading.next(false)
    });
  }

}
