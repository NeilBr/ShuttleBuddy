import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/shared/models/user';
import { UserModalComponent } from 'src/app/shared/user-modal/user-modal.component';
import { MenuService } from '../menu/menu.service';
import * as bcrypt from 'bcryptjs';
import { CredentialsService } from 'src/app/authentication/credentials.service';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss'],
})

export class ManageUsersComponent implements OnInit {

  loading = new BehaviorSubject(false); 
  showMenu = false;

  users: User[];

  constructor(
    private userService: UserService,
    private menuService: MenuService,
    private popoverController: PopoverController,
    private credentialService: CredentialsService
    ) {}

  ngOnInit() {
    this.loading.next(true);
    this.userService.getAllUsers().then(res => {
      this.users = res;
      this.loading.next(false)
    });
  }

  getIsOpen(){
    return this.menuService.menuState;
  }


  async openDeleteUser(user){
    const popover = await this.popoverController.create({
      component: UserModalComponent,
      cssClass: 'custom-popover',
      componentProps: {
        user,
        userAction: 'Delete'
      },
      translucent: true
    });
    await popover.present();

    popover.onDidDismiss().then((data) => {
      if(data.data.action === 'delete'){
        this.userService.deleteUser(data.data.user.id).then(() =>{
          this.reloadUsers();
        });
      }
    });
  }

  async openEditUser(user){
    const popover = await this.popoverController.create({
      component: UserModalComponent,
      cssClass: 'custom-popover',
      componentProps: {
        user,
        userAction: 'Edit'
      },
      
      translucent: true
    });
    await popover.present();

    popover.onDidDismiss().then((data) => {
      if(data.data.action === 'save'){
        const newUser = data.data.user;
        this.userService.saveUser(newUser).then(() =>{
          this.reloadUsers();
        });
      }
    });
  }

  async openCreateUser(){
    const popover = await this.popoverController.create({
      component: UserModalComponent,
      cssClass: 'custom-popover',
      componentProps: {
        user: {
          password: '',
          role: '',
          username: ''
        } as User,
        userAction: 'Create'
      },
      
      translucent: true
    });
    await popover.present();

    popover.onDidDismiss().then(async (data) => {
      // {action, user: this.user}
      if(data.data.action === 'save'){
        const newUser = data.data.user;
        newUser.password = await this.getEncryptedPassword(newUser.password);
        this.userService.saveUser(newUser).then(() =>{
          this.reloadUsers();
        });
      }
    });
  }

  async getEncryptedPassword(password){
    let toReturn = '';
    await bcrypt.hash(password, 10).then((hash) => {
      toReturn = hash;
    });
    return toReturn;
  }
  
  reloadUsers(){
    this.loading.next(true);
    this.userService.getAllUsers().then(res => {
      this.users = res;
      this.loading.next(false)
    });
  }

  isCurrentUser(user){
    return this.credentialService.credentials.username === user.username;
  }
}
