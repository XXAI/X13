import { Component, OnInit } from '@angular/core';
import { AppsListService } from './apps-list.service';
import { App } from './apps';

@Component({
  selector: 'apps-list',
  templateUrl: './apps-list.component.html',
  styleUrls: ['./apps-list.component.css']
})
export class AppsListComponent implements OnInit {

  apps: App[];
  breakpoint = 6;

  constructor(private appsService: AppsListService) { }

  ngOnInit() {
    this.getApps();
    //this.breakpoint = (window.innerWidth <= 599) ? 3 : 6;
  }

  getApps():void{
    this.apps = this.appsService.getApps();
  }

  /*onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 599) ? 3 : 6;
  }*/

}
