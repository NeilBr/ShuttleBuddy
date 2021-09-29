import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { User } from '../models/user';

@Component({
  selector: 'app-user-modal',
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.scss'],
})
export class UserModalComponent implements OnInit {

  @Input() user: User;
  @Input() userAction: string;
  confirmPassword = '';

  constructor(private popoverController: PopoverController) { }

  ngOnInit() {
    console.log(this.userAction);
  }

  closePopover(action: string){
    this.popoverController.dismiss({action, user: this.user}); 
  }

  isValid(){
    return this.user.password === this.confirmPassword && this.user.password.trim() != ''
    && this.user.role != '' && this.user.username.trim() != '';
  }

  isEditValid(){
    return this.user.role != '' && this.user.username.trim() != '';
  }

  setPassword(event){
    this.user.password = event.detail.value;
  }

  setRole(event){
    this.user.role = event.detail.value;
  }
  
  setUsername(event){
    this.user.username = event.detail.value;
  }

  setConfirmPassword(event){
    this.confirmPassword = event.detail.value;
  }
  
}
