import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { User } from 'src/app/auth/models/user';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { App } from 'src/app/apps-list/apps';
import { AppsListService } from 'src/app/apps-list/apps-list.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/internal/operators/filter';
import { SharedService } from '../../shared/shared.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  @Output() onSidenavToggle = new EventEmitter<void>();

  public isAuthenticated:boolean;
  authSubscription: Subscription;
  selectedApp: any;
  appHeaderLinks: any[];
  headerIcon: string;
  user: User;
  apps: App[];
  breakpoint = 6;

  constructor(private authService:AuthService, private appsService: AppsListService, private sharedService: SharedService, private router: Router) {
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)  
    ).subscribe((event: NavigationEnd) => {
      this.headerIcon = undefined;
      this.appHeaderLinks = [];

      this.getApps();
      let routes = event.url.split('/');
      let selected_route = routes[1];

      let currentApp = this.sharedService.getCurrentApp();
      if(currentApp.name != selected_route ){
        this.sharedService.newCurrentApp(selected_route);
      }
      
      if(selected_route){
        this.selectedApp = this.apps.find(function(element) {
          return element.route == selected_route;
        });
      }else{
        this.selectedApp = undefined;
      }
      
      if(this.selectedApp){
        this.headerIcon = this.selectedApp.icon;
        this.appHeaderLinks.push({name:this.selectedApp.name,route:this.selectedApp.route});

        if(this.selectedApp.apps && routes[2]){
          
          let selectedRoute = routes[1]+'/'+routes[2];
          let selectedChildApp = this.selectedApp.apps.find(function(element) {
            return element.route == selectedRoute;
          });

          if(selectedChildApp){
            this.headerIcon = selectedChildApp.icon;
            this.appHeaderLinks.push({name:selectedChildApp.name,route:selectedChildApp.route});
          }
        }
      }
    });
  }

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuth();
    if(this.isAuthenticated){
      this.user = this.authService.getUserData();
    }
    this.authSubscription = this.authService.authChange.subscribe(
      status => {
        this.isAuthenticated = status;
        if(status){
          this.user = this.authService.getUserData();
        }else{
          this.user = new User();
        }
      }
    );
    this.breakpoint = (window.innerWidth <= 599) ? 3 : 6;
  }

  getApps():void{
    this.apps = this.appsService.getApps();
  }

  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 599) ? 3 : 6;
  }

  ngOnDestroy(){
    this.authSubscription.unsubscribe();
  }

  toggleSidenav(){
    this.onSidenavToggle.emit();
  }

  logout(){
    this.authService.logout();
  }
}
