import { EventEmitter, Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class MapSocket {
  shuttleLocationUpdates = new EventEmitter();

  constructor(private socket: Socket) {
    this.socket.on('shuttleLocationUpdates',(payload) =>{
      console.log(payload);
      this.shuttleLocationUpdates.emit(payload);
    });
    this.socket.on('chat', (payload) =>{
      console.log(payload);
    });
  }


  sendPosition(shuttleLocation: any){
    shuttleLocation.clientID = this.socket.ioSocket.id;
    this.socket.emit('shuttleLocation', JSON.stringify(shuttleLocation));
  }
 

}
