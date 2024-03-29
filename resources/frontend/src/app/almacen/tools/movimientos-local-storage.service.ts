import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/models/user';

@Injectable({
  providedIn: 'root'
})
export class MovimientosLocalStorageService {

  private usuario:User;
  tipoMovimiento:string = 'movimientos';

  constructor(
    private authService: AuthService,
  ) {
    this.usuario = this.authService.getUserData();
  }

  getDatos():any{
    let datos_completos:any = {
      formulario: this.getDatosTempMovimiento('formulario'),
      generales: this.getDatosTempMovimiento('generales'),
      lista_articulos: this.getDatosTempMovimiento('lista_articulos'),
    };

    if((datos_completos.formulario) && datos_completos.formulario.fecha_movimiento){
      datos_completos.formulario.fecha_movimiento = new Date(datos_completos.formulario.fecha_movimiento);
    }
    if((datos_completos.formulario) && datos_completos.formulario.referencia_fecha){
      datos_completos.formulario.referencia_fecha = new Date(datos_completos.formulario.referencia_fecha);
    }

    return datos_completos;
  }

  getDatosID():any{
    let identificador = this.getDatosTempMovimiento('identificador');
    if(!identificador){
      identificador = {};
    }else{
      identificador.actualizado = new Date(identificador.actualizado);
    }
    return identificador;
  }

  getDatosFormulario():any{
    let datos_formulario = this.getDatosTempMovimiento('formulario');
    if((datos_formulario) && datos_formulario.fecha_movimiento){
      datos_formulario.fecha_movimiento = new Date(datos_formulario.fecha_movimiento);
    }
    if((datos_formulario) && datos_formulario.referencia_fecha){
      datos_formulario.referencia_fecha = new Date(datos_formulario.referencia_fecha);
    }
    return datos_formulario;
  }

  deleteDatos():any{
    let resultado = this.deleteDatosTempMovimiento();
    return resultado;
  }

  setDatosID(datos:any):any{
    return this.setDatosTempMovimiento('identificador',datos);
  }

  setDatosFormulario(datos:any):any{
    this.putIdentificador(datos.id);
    return this.setDatosTempMovimiento('formulario',datos);
  }

  setDatosListaArticulos(id,datos:any):any{
    this.putIdentificador(id);
    return this.setDatosTempMovimiento('lista_articulos',datos);
  }

  setDatosGenerales(id,datos:any):any{
    this.putIdentificador(id);
    return this.setDatosTempMovimiento('generales',datos);
  }

  private putIdentificador(idMovimiento?:any){
    let identificador:any = this.getDatosID();
    let id = (idMovimiento)?idMovimiento:'NV';
    identificador.id = id;
    identificador.actualizado = new Date();
    this.setDatosID(identificador);
  }

  private getDatosTempMovimiento(seccion:string):any{
    let key = 'datos_'+this.tipoMovimiento+'_tmp_id_'+this.usuario.id+'_secc_'+seccion;
    return JSON.parse(localStorage.getItem(key));
  }

  private setDatosTempMovimiento(seccion:string, datos:any):any{
    try {
      let key = 'datos_'+this.tipoMovimiento+'_tmp_id_'+this.usuario.id+'_secc_'+seccion;
      localStorage.setItem(key, JSON.stringify(datos));
      return true;
    } catch(e) {
      if (e.code == 22) {
        return {'error':'No hay espacio disponible para crear los datos temporales.','data':e};
      }else{
        return {'error':'No es posible crear los datos temporales.','data':e};
      }
    }
  }

  private deleteDatosTempMovimiento(seccion?:string):any{
    try {
      let key = 'datos_'+this.tipoMovimiento+'_tmp_id_'+this.usuario.id+'_secc_';
      if(seccion){
        localStorage.removeItem(key+seccion);
      }else{
        localStorage.removeItem(key+'identificador');
        localStorage.removeItem(key+'formulario');
        localStorage.removeItem(key+'generales');
        localStorage.removeItem(key+'lista_articulos');
      }
      return true;
    } catch(e) {
      return {'error':'No es posible eliminar los datos temporales.','data':e};
    }
  }
}
