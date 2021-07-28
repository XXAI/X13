import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SharedService } from '../../../shared/shared.service';
import { ElementosPedidosService } from '../elementos-pedidos.service';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface TipoPedidoDialogData {
  id?: number;
}

@Component({
  selector: 'app-dialogo-form-elemento-pedido',
  templateUrl: './dialogo-form-elemento-pedido.component.html',
  styleUrls: ['./dialogo-form-elemento-pedido.component.css']
})
export class DialogoFormElementoPedidoComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogoFormElementoPedidoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TipoPedidoDialogData,
    private fb: FormBuilder,
    private elementosPedidosService: ElementosPedidosService,
    private sharedService: SharedService,
    private sanitizer: DomSanitizer,
  ) { }

  isLoading:boolean;
  isSaving:boolean;
  tipoPedido:any;
  
  imagePreview:string;
  imageFile:any;
  tipoPedidoForm:FormGroup;

  filtroPartidasEspecificas:string;
  partidasEspecificasDataSource: MatTableDataSource<any>;
  controlPartidasEspecificasSeleccionadas:any;

  filtroFamilias:string;
  familiasDataSource: MatTableDataSource<any>;
  controlFamiliasOmitidas:any;

  ngOnInit(): void {
    this.isLoading = true;
    
    this.tipoPedidoForm = this.fb.group({
      'clave':        ['',[Validators.required,Validators.maxLength(4)]],
      'descripcion':  ['',Validators.required],
      'archivo':      ['',Validators.required],
      'archivo_fuente': [''],
      'activo':       [''],
      'icon_image':   [''],
      'id':           ['']
    });

    if(this.data.id){
      this.tipoPedido = {descripcion:'Editar'};
    }else{
      this.tipoPedido = {descripcion:'Nuevo'};
    }
    
    this.elementosPedidosService.getCatalogos().subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
          this.isLoading = false;
        } else {
          this.partidasEspecificasDataSource = new MatTableDataSource<any>(response.data);
          this.partidasEspecificasDataSource.filterPredicate = (data:any, filter:string) => {
            let filtroTexto:boolean;
            let filtro = filter.trim();
            //index:1 = texto a buscar
            if(filtro && filtro != ''){
              filtro = filtro.toLowerCase()
              filtroTexto = data.clave.toString().includes(filtro) || data.descripcion.toLowerCase().includes(filtro);
            }else{
              filtroTexto = true;
            }
            return filtroTexto;
          };
          this.controlPartidasEspecificasSeleccionadas = {};

          this.familiasDataSource = new MatTableDataSource<any>([]);
          this.familiasDataSource.filterPredicate = (data:any, filter:string) => {
            let filtroTexto:boolean;
            let filtro = filter.trim();
            //index:1 = texto a buscar
            if(filtro && filtro != ''){
              filtro = filtro.toLowerCase()
              filtroTexto = data.clave.toString().includes(filtro) || data.nombre.toLowerCase().includes(filtro);
            }else{
              filtroTexto = true;
            }
            return filtroTexto;
          };
          this.controlFamiliasOmitidas = {};

          if(this.data.id){
            this.elementosPedidosService.getTipoPedido(this.data.id).subscribe(
              response =>{
                if(response.error) {
                  let errorMessage = response.error.message;
                  this.sharedService.showSnackBar(errorMessage, null, 3000);
                } else {
                  this.imagePreview = environment.images_url + response.data.icon_image;
                  response.data.archivo = response.data.icon_image;
                  this.tipoPedidoForm.patchValue(response.data);

                  let filtro_detalles = JSON.parse(response.data.filtro_detalles);
                  for(let i in filtro_detalles){
                    let partida = filtro_detalles[i];
                    this.controlPartidasEspecificasSeleccionadas[partida.clave] = true;
                    let partida_index = this.partidasEspecificasDataSource.data.findIndex(item => item.clave == partida.clave);
                    let familias = this.partidasEspecificasDataSource.data[partida_index].familias;

                    let nuevas = this.familiasDataSource.data.concat(familias);
                    this.familiasDataSource.data = nuevas;
                    if(familias.length != partida.familia_id.length){
                      let omitidas = familias.filter(item => partida.familia_id.indexOf(item.id) < 0);
                      console.log(omitidas);
                      for(let i in omitidas){
                        this.controlFamiliasOmitidas[omitidas[i].clave+'_'+omitidas[i].id] = true;
                      }
                    }
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
          }else{
            this.isLoading = false;
          }
        }
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

  onFileChange(event) {
    const reader = new FileReader();
    
    if(event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      this.tipoPedidoForm.get('archivo').patchValue(file.name);

      reader.readAsDataURL(file);
      reader.onload = () => {
        let srcData = this.sanitizer.bypassSecurityTrustResourceUrl(reader.result as string);
        this.imagePreview = srcData as string;
        
        this.tipoPedidoForm.patchValue({
          archivo_fuente: reader.result
        });
      };
    }
  }

  cancel(){
    this.dialogRef.close();
  }

  guardar(){
    if(this.tipoPedidoForm.valid){
      let filtro_familias = {};

      for(let index in this.familiasDataSource.data){
        let item = this.familiasDataSource.data[index];
        if(!this.controlFamiliasOmitidas[item.clave+'_'+item.id]){
          if(!filtro_familias[item.clave]){
            filtro_familias[item.clave] = {
              clave: item.clave,
              familia_id: []
            };
          }
          filtro_familias[item.clave].familia_id.push(item.id);
        }
      }

      let formData = JSON.parse(JSON.stringify(this.tipoPedidoForm.value));
      formData.filtro_familias = filtro_familias;
      
      if(formData.id){
        this.elementosPedidosService.updateTipoPedido(formData.id,formData).subscribe(
          response =>{
            console.log(response);
          }
        );
      }else{
        this.elementosPedidosService.createTipoPedido(formData).subscribe(
          response =>{
            console.log(response);
          }
        );
      }
    }
  }

  aplicarFiltroPartidasEspecificas(){
    this.partidasEspecificasDataSource.filter = this.filtroPartidasEspecificas;
  }

  toggleSeleccionarPartidaEspecifica(partida){
    if(!this.controlPartidasEspecificasSeleccionadas[partida.clave]){
      this.controlPartidasEspecificasSeleccionadas[partida.clave] = true;
      let nuevas = this.familiasDataSource.data.concat(partida.familias);
      this.familiasDataSource.data = nuevas;
    }else{
      delete this.controlPartidasEspecificasSeleccionadas[partida.clave];
      let clave_partida = partida.clave;
      let contador_a_eliminar = 0;
      this.familiasDataSource.data.forEach((item,index)=>{
        if(item.clave == clave_partida){
          this.familiasDataSource.data.splice(index,1);
          this.familiasDataSource.data.unshift({clave:'',id:0,nombre:''});//Placeholder al inicio del array para no alterar el index de los siguientes elementos a eliminar
          contador_a_eliminar++;
          if(this.controlFamiliasOmitidas[item.clave+'_'+item.id]){
            delete this.controlFamiliasOmitidas[item.clave+'_'+item.id];
          }
        }
      });
      this.familiasDataSource.data.splice(0,contador_a_eliminar);
    }
    this.aplicarFiltroFamilias();
  }

  aplicarFiltroFamilias(){
    this.familiasDataSource.filter = this.filtroFamilias;
  }

  toggleSeleccionarFamilia(familia){
    if(!this.controlFamiliasOmitidas[familia.clave+'_'+familia.id]){
      this.controlFamiliasOmitidas[familia.clave+'_'+familia.id] = true;
    }else{
      delete this.controlFamiliasOmitidas[familia.clave+'_'+familia.id];
    }
  }
}
