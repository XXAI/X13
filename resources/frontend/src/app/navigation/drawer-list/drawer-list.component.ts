import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { App } from 'src/app/apps-list/apps';
import { AuthService } from 'src/app/auth/auth.service';
import { AppsListService } from 'src/app/apps-list/apps-list.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/internal/operators/filter';

@Component({
  selector: 'drawer-list',
  templateUrl: './drawer-list.component.html',
  styleUrls: ['./drawer-list.component.css']
})
export class DrawerListComponent implements OnInit {
  
  public isAuthenticated:boolean;
  authSubscription: Subscription;
  selectedApp: any;
  selectedChild: any;
  apps: App[];
  expandDrawer:boolean = true;

  constructor(private authService:AuthService, private appsService: AppsListService, private router: Router) {
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)  
    ).subscribe((event: NavigationEnd) => {
      this.getApps();
      let routes = event.url.split('/',3);
      let selected_route = routes[1];
      let selected_child = '';

      if(routes.length > 2){
        selected_child = routes[2];
      }

      if(selected_route){
        this.selectedApp = this.apps.find(function(element) {
          return (element)?element.route == selected_route:false;
        });
      }else{
        this.selectedApp = undefined;
      }
      
      this.selectedChild = {};
      if(this.selectedApp && this.selectedApp.children && selected_child){
        this.selectedChild = this.selectedApp.children.find(function(element) {
          return (element)?element.route == selected_child:false;
        });
      }
    });
   }

   ngOnInit() {
    this.isAuthenticated = this.authService.isAuth();
    this.authSubscription = this.authService.authChange.subscribe(
      status => {
        this.isAuthenticated = status;
      }
    );
  }

  getApps():void{
    this.apps = this.appsService.getApps();
  }

  ngOnDestroy(){
    this.authSubscription.unsubscribe();
  }

}
