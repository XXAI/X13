import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '../../../apps-list/apps';

@Component({
  selector: 'app-hub',
  templateUrl: './app-hub.component.html',
  styleUrls: ['./app-hub.component.css']
})
export class AppHubComponent implements OnInit {
  @Input() appsList: App[];

  apps: App[];
  breakpoint = 6;

  constructor(private router:Router) { }

  ngOnInit() {
    this.getApps();
    this.breakpoint = (window.innerWidth <= 599) ? 3 : 6;
  }

  getApps():void{
    this.apps = this.appsList;
  }

  goTo(url:string){
    let route = '/' + url;
    this.router.navigate([route]);
  }

  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 599) ? 3 : 6;
  }

}

