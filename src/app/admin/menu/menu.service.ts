import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  menuState: boolean;

  constructor() { 
  }

  setMenuState(state: boolean){
    this.menuState = state;
  }
}