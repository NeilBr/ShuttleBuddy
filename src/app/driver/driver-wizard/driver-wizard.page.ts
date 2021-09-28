import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { NavController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { CredentialsService } from '../../authentication/credentials.service';
import { MapSocket } from '../../services/map-socket.service';
import { RoutesService } from '../../services/routes.service';
import { Route } from '../../shared/models/route';


@Component({
  selector: 'app-driver-wizard',
  templateUrl: './driver-wizard.page.html',
  styleUrls: ['./driver-wizard.page.scss'],
})
export class DriverWizardPage implements OnInit {

  isLoading = new BehaviorSubject(true);

  allRoutes: Route[];

  shuttleId = 0;
  routeId = 0;
  mockRouteId = null;
  isMock = false;

  constructor(
    private mapSocket: MapSocket,
    private routesService: RoutesService,
    private credentialsService: CredentialsService,
    private navController: NavController
    ) { }

  ngOnInit() {
    this.allRoutes = [];
    this.getRoutes()
  }

  getRoutes(){
    this.routesService.getAllRoutes().then((routes) => {
      this.allRoutes = routes;
      this.isLoading.next(false);
    })
  }


  async startNavigation(){
    await this.credentialsService.setShuttleDetails({
      shuttleId: this.shuttleId,
      routeId: this.routeId,
      mockRouteId: this.isMock? this.routeId : null
    });

    this.navController.navigateRoot(['/driver/navigate'])
  }


}
