import { Component, OnInit } from '@angular/core';
import { App } from '../../apps-list/apps';

@Component({
  selector: 'app-pedidos-apps',
  templateUrl: './pedidos-apps.component.html',
  styleUrls: ['./pedidos-apps.component.css']
})
export class PedidosAppsComponent implements OnInit {

  constructor() { }

  appsList: App[];

  ngOnInit() {
    let apps = JSON.parse(localStorage.getItem('userApps'));
    let currentApp = 'pedidos';

    let pedidoApp = apps.find(function(element) {
      return element.route == currentApp;
    });
    
    this.appsList = pedidoApp.apps;
  }

}
