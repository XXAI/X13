import { Component, OnInit } from '@angular/core';
import { AdminUsuariosService } from '../admin-usuarios.service';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  selector: 'app-lista-usuarios',
  templateUrl: './lista-usuarios.component.html',
  styleUrls: ['./lista-usuarios.component.css']
})
export class ListaUsuariosComponent implements OnInit {

  constructor(
    private adminUsuariosService: AdminUsuariosService,
    private sharedService: SharedService,
  ) { }

  isLoading:boolean;

  listaUsuarios:any[];
  usuarioEdicion:number;

  almacenesSeleccionados:any[];
  catalogoAlmacenes:any[];

  ngOnInit(): void {
    this.isLoading = true;
    this.listaUsuarios = [];
    this.almacenesSeleccionados = [];
    this.catalogoAlmacenes = [];
    this.usuarioEdicion = 0;

    this.adminUsuariosService.getUsuarios().subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.listaUsuarios = response.data;
          if(response.catalogos){
            this.catalogoAlmacenes = response.catalogos['almacenes'];
          }
        }
        this.isLoading = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoading = false;
      }
    );
  }

  editarUsuario(id){
    let usuario = this.listaUsuarios.find(item => item.id == id);
    this.almacenesSeleccionados = [];
    usuario.almacenes.forEach(item => {
      this.almacenesSeleccionados.push(this.catalogoAlmacenes.find(x => x.id == item.id));
    });
    this.usuarioEdicion = id;
  }

  cancelar(){
    this.usuarioEdicion = 0;
    this.almacenesSeleccionados = [];
  }

  guardar(){
    let almacenes = [];
    this.almacenesSeleccionados.forEach(item => almacenes.push(item.id));
    this.adminUsuariosService.updateUsuario(this.usuarioEdicion,{almacenes_id:almacenes}).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.sharedService.showSnackBar('Datos guardados con éxito', null, 3000);
          let usuario = this.listaUsuarios.find(item => item.id == this.usuarioEdicion);
          usuario.almacenes = this.almacenesSeleccionados;
          this.usuarioEdicion = 0;
          this.almacenesSeleccionados = [];
        }
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);        
      }
    );
  }

}
