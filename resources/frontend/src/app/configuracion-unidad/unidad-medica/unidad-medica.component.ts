import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { ConfiguracionUnidadService } from '../configuracion-unidad.service';

@Component({
  selector: 'app-unidad-medica',
  templateUrl: './unidad-medica.component.html',
  styleUrls: ['./unidad-medica.component.css']
})
export class UnidadMedicaComponent implements OnInit {

  constructor(
    private sharedService: SharedService,
    private configuracionUnidadService: ConfiguracionUnidadService
  ) { }

  isLoading:boolean;
  tarjetas:any[];
  unidadMedica:any;

  ngOnInit(): void {
    this.isLoading = true;
    this.configuracionUnidadService.obtenerDatosUnidad().subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.unidadMedica = response.data;
          this.tarjetas = [];
          console.log(response.data);

          let almacenes = [];
          response.data.almacenes.forEach(almacen => {
            almacenes.push({
              titulo:almacen.nombre,
              subtitulo:almacen.tipo_almacen.descripcion,
            })
          });
          this.tarjetas.push({
            titulo:'Almacenes',
            subtitulo:'Total de Almacenes: ' + response.data.almacenes.length,
            lista: almacenes,
          });

          let catalogos = [];
          let total_articulos = 0;
          response.data.catalogos.forEach(catalogo => {
            total_articulos += +catalogo.total_articulos;
            catalogos.push({
              titulo: catalogo.tipo_bien_servicio.descripcion,
              subtitulo: 'Total Articulos: ' + catalogo.total_articulos,
            });
          });
          this.tarjetas.push({
            titulo:'Catalogos',
            subtitulo:'Total de Articulos: ' + total_articulos,
            lista: catalogos,
          });

          let usuarios = [];
          response.data.usuarios.forEach(usuario => {
            usuarios.push({
              titulo: usuario.username,
              subtitulo: usuario.created_at,
            })
          });
          this.tarjetas.push({
            titulo:'Usuarios',
            subtitulo:'Usuarios Asignados: ' + response.data.usuarios.length,
            lista: usuarios,
          });
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

}
