import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { AVATARS } from './avatars';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'plataforma-base';
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ){
    //this.matIconRegistry.addSvgIcon("user-icon", this.domSanitizer.bypassSecurityTrustResourceUrl("assets/avatars/02-man.svg"));
    this.matIconRegistry.addSvgIcon("app-icon", this.domSanitizer.bypassSecurityTrustResourceUrl("assets/app-icon.svg"));

    this.matIconRegistry.addSvgIcon("pdf-icon", this.domSanitizer.bypassSecurityTrustResourceUrl("assets/icons-ui/pdf-icon.svg"));
    this.matIconRegistry.addSvgIcon("xls-icon", this.domSanitizer.bypassSecurityTrustResourceUrl("assets/icons-ui/xls-icon.svg"));

    for(let i in AVATARS){
      this.matIconRegistry.addSvgIcon(AVATARS[i].id, this.domSanitizer.bypassSecurityTrustResourceUrl(AVATARS[i].file));
    }
  }
}
