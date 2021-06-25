import { Component, OnInit } from '@angular/core';
import { App } from '../../apps-list/apps';

@Component({
  selector: 'app-configuracion-apps',
  templateUrl: './configuracion-apps.component.html',
  styleUrls: ['./configuracion-apps.component.css']
})
export class ConfiguracionAppsComponent implements OnInit {

  constructor() { }

  appsList: App[];

  ngOnInit(): void {
    let apps = JSON.parse(localStorage.getItem('userApps'));
    let currentApp = 'configuracion';

    let almacenApp = apps.find(function(element) {
      return element.route == currentApp;
    });
    
    this.appsList = almacenApp.apps;
  }

}
