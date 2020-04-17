import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { User } from 'src/app/auth/models/user';
import { AuthService } from '../../auth/auth.service';
import { AppsListService } from '../../apps-list/apps-list.service';
import { App } from '../../apps-list/apps';

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.css']
})
export class SidenavListComponent implements OnInit {

  @Output() onCloseSidenav = new EventEmitter<void>();

  isAuthenticated:boolean = false;
  user: User;
  apps: App[];

  authSubscription:Subscription;

  constructor(private authService:AuthService, private appsService: AppsListService) { }

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuth();
    if(this.isAuthenticated){
      this.user = this.authService.getUserData();
      this.getApps();
    }
    this.authSubscription = this.authService.authChange.subscribe(
      status => {
        this.getApps();
        this.isAuthenticated = status;
        if(status){
          this.user = this.authService.getUserData();
        }else{
          this.user = new User();
        }
      }
    );
  }

  getApps():void{
    this.apps = this.appsService.getApps();
  }

  ngOnDestroy(){
    this.authSubscription.unsubscribe();
  }
  
  logout(){
    this.authService.logout();
    this.close();
  }
  
  close(){
    this.onCloseSidenav.emit()
  }
}
