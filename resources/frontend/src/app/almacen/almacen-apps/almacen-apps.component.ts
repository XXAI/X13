import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../shared/shared.service';
import { App } from '../../apps-list/apps';

@Component({
  selector: 'app-almacen-apps',
  templateUrl: './almacen-apps.component.html',
  styleUrls: ['./almacen-apps.component.css']
})
export class AlmacenAppsComponent implements OnInit {

  constructor(private sharedService: SharedService) { }

  appsList: App[];

  ngOnInit() {
    let apps = JSON.parse(localStorage.getItem('userApps'));
    let currentApp = 'almacen';

    let almacenApp = apps.find(function(element) {
      return element.route == currentApp;
    });
    
    this.appsList = almacenApp.apps;
  }

}
