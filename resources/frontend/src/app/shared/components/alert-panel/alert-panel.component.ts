import { Component, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'alert-panel',
  templateUrl: './alert-panel.component.html',
  styleUrls: ['./alert-panel.component.css']
})
export class AlertPanelComponent implements OnInit {

  constructor() { }

  datosAlerta: any;
  count: number;
  countDown: Subscription;
  timeToClose: any;
  mostrarPanel:boolean;

  ngOnInit(): void {
  }

  public cerrarAlerta(){
    this.datosAlerta = null;
    console.log('mostrar',this.mostrarPanel);
    if(this.mostrarPanel){
      console.log('cerrar');
      if(this.countDown && !this.countDown.closed){
        this.countDown.unsubscribe(); 
        clearTimeout(this.timeToClose);
        this.count = 0;
      }
      this.mostrarPanel = false;
    }
  }

  public mostrarSucces(mensaje:string, segundos:number = 3) {
    this.mostrarAlerta('success', mensaje, segundos);
  }

  public mostrarError(mensaje:string, segundos?:number){
    this.mostrarAlerta('error', mensaje, segundos);
  }

  public mostrarWarning(mensaje:string, segundos?:number){
    this.mostrarAlerta('warning', mensaje, segundos);
  }

  public mostrarInfo(mensaje:string, segundos?:number){
    this.mostrarAlerta('info', mensaje, segundos);
  }

  private mostrarAlerta(tipo, mensaje, segundos?:number){
    if(this.countDown && !this.countDown.closed){
      this.countDown.unsubscribe(); 
      clearTimeout(this.timeToClose);
    }
    
    let icono:string;
    switch (tipo) {
      case 'success':
        icono = 'check_circle';
        break;
      case 'error':
        icono = 'error';
        break;
      case 'warning':
        icono = 'report';
        break;
      default:
        icono = 'info';
        break;
    }

    this.datosAlerta = {tipo_estatus: tipo, icono: icono, mensaje: mensaje};
    this.mostrarPanel = true;
    
    if(segundos){
      let total = segundos * 1000;
      let tick = Math.floor(total / 100); //30;

      this.count = 0;
      this.countDown = timer(0,tick).subscribe(()=>{
        if(this.count == 150){
          this.count = 0;
          console.log('sigo activo',this.countDown);
          if(!this.countDown.closed){
            this.countDown.unsubscribe();
          }
        }
        this.count++;
      });

      this.timeToClose = setTimeout (() => { 
        this.cerrarAlerta(); 
      }, total+500);
    }
  }

}
