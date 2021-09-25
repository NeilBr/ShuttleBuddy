import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './authentication/AuthInterceptor';
import { RoleGuardService } from './authentication/role-guard.service';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { MapSocket } from './services/map-socket.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const config: SocketIoConfig = { url: 'http://localhost:3001/map-socket', options: {} };

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    HttpClientModule, 
    AppRoutingModule, 
    SharedModule,
    SocketIoModule.forRoot(config),
    BrowserAnimationsModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, 
    AuthInterceptor,
    RoleGuardService,
    MapSocket
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
