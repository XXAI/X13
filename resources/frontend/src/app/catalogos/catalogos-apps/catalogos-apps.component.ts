import { Component, OnInit } from '@angular/core';
import { App } from '../../apps-list/apps';

@Component({
  selector: 'app-catalogos-apps',
  templateUrl: './catalogos-apps.component.html',
  styleUrls: ['./catalogos-apps.component.css']
})
export class CatalogosAppsComponent implements OnInit {

  constructor() { }

  appsList: App[];

  ngOnInit() {
    let apps = JSON.parse(localStorage.getItem('userApps'));
    let currentApp = 'catalogos';

    let almacenApp = apps.find(function(element) {
      return element.route == currentApp;
    });
    
    this.appsList = almacenApp.apps;
  }

}
