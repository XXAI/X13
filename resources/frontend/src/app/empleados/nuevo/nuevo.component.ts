import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { SharedService } from 'src/app/shared/shared.service';
import { EmpleadosService } from '../empleados.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable, combineLatest, of, forkJoin } from 'rxjs';
import { startWith, map, throwIfEmpty, debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { EstudiosDialogComponent } from '../estudios-dialog/estudios-dialog.component';
import { TransferenciaEmpleadoDialogComponent } from '../transferencia-empleado-dialog/transferencia-empleado-dialog.component';
import { EditarHorarioDialogComponent } from '../editar-horario-dialog/editar-horario-dialog.component';
import { ConfirmActionDialogComponent } from '../../utils/confirm-action-dialog/confirm-action-dialog.component';

@Component({
  selector: 'app-nuevo',
  templateUrl: './nuevo.component.html',
  styleUrls: ['./nuevo.component.css']
})
export class NuevoComponent implements OnInit {

  catalogos:any[] = [];
  id_empleado:any;
  empleado:boolean = false;
  datos_empleado:any;

  puedeGuardar: boolean = true;
  puedeValidar: boolean = true;
  puedeTransferir: boolean = true;
  statusLabel: string;
  statusIcon: string;

  //Botones Anterior-Siguiente
  miniPagination:any = {
    previous: 0,
    current: 0,
    next: 0,
    total: 0
  };

  codigosIsLoading: boolean = false;
  crIsLoading: boolean = false;
  crAdscripcionIsLoading: boolean = false;
  profesionIsLoading: boolean = false;
  filteredCodigos: Observable<any[]>;
  filteredCr: Observable<any[]>;
  filteredCrAdscripcion: Observable<any[]>;
  filteredProfesiones: Observable<any[]>;

  displayedColumns: string[] = ['Grado','Estudios','Fecha','actions'];
  tablaEscolaridad: any = [{id:1,grado:'123',estudios:'12312',fecha:'123'}];

  //de = dia entrada, he = hora entrada, ds = dia salida, hs = hora salida
  horarioEmpleado: any = [
      {id:1,de:'1',he:'20:00',ds:'2',hs:'03:00'},
      {id:2,de:'2',he:'20:00',ds:'3',hs:'03:00'},
      {id:3,de:'3',he:'20:00',ds:'4',hs:'03:00'},
      {id:4,de:'4',he:'20:00',ds:'5',hs:'03:00'},
      {id:5,de:'5',he:'20:00',ds:'6',hs:'03:00'},
      {id:6,de:'6',he:'20:00',ds:'7',hs:'03:00'},
      {id:7,de:'7',he:'20:00',ds:'1',hs:'03:00'}
  ];
  //tablaHorario: any = {1:[],2:[],3:[],4:[],5:[],6:[],7:[]};
  tablaHorarioDias: any = [{label:'Lu',count:0},{label:'Ma',count:0},{label:'Mi',count:0},{label:'Ju',count:0},{label:'Vi',count:0},{label:'Sa',count:0},{label:'Do',count:0}];
  tablaHorarioHoras: any = [];

  datosCredencial:any;

  photoPlaceholder = 'assets/profile-icon.svg';

  constructor(
    private sharedService: SharedService, 
    private empleadosService: EmpleadosService,
    private authService: AuthService, 
    private route: ActivatedRoute, 
    private fb: FormBuilder,
    public dialog: MatDialog
  ) { }

  isLoading:boolean = false;
  isLoadingCredential:boolean = false;
  hidePassword:boolean = true;

  escolaridad:any = [
    { id: 'secundaria',     label:'Secundaria' },
    { id: 'preparatoria',   label:'Preparatoria' },
    { id: 'tecnica',        label:'Técnica' },
    { id: 'carrera',        label:'Carrera' },
    { id: 'titulo',         label:'Titulo' },
    { id: 'maestria',       label:'Maestria' },
    { id: 'doctorado',      label:'Doctorado' },
    { id: 'cursos',         label:'Cursos' },
    { id: 'especialidad',   label:'Especialidad' },
    { id: 'diplomado',      label:'Diplomado' },
    { id: 'poliglota',      label:'Inglés' },
  ];

  empleadoForm = this.fb.group({
    'rfc': ['',[Validators.required, Validators.minLength(13)]],
    'curp': ['',[Validators.required]],
    'nombre': ['',[Validators.required]],
    'fissa': ['',[Validators.required]],
    'figf': [''],
    'turno_id':[''],
    'hora_entrada':[''],
    'hora_salida':[''],
    'tipo_nomina_id': [''],
    'programa_id': [''],
    'fuente_id': [''],

    'ur':[''],
    'codigo_id': [''],
    'codigo': [''],
    'profesion_id': [''],
    'profesion': [''],
    'cr_id': [''],
    'cr': [''],
    'cr_adscripcion_id': [''],
    'cradscripcion': [''],

    'rama_id': [''],
    'area_servicio': [''],

    'comision_sindical_id': [''],
    'escolaridad': this.fb.group({
      'secundaria':[''], 
      'preparatoria':[''], 
      'tecnica':[''], 
      'carrera':[''], 
      'titulo':[''], 
      'maestria':[''], 
      'doctorado':[''], 
      'cursos':[''], 
      'especialidad':[''], 
      'diplomado':[''], 
      'poliglota':['']
    }),
    'observaciones':['']
  });

  

  ngOnInit() {
    this.loadCatalogos();
    
    this.empleadoForm.get('codigo').valueChanges
      .pipe(
        debounceTime(300),
        tap( () => {
          this.codigosIsLoading = true;
        } ),
        switchMap(value => {
            if(!(typeof value === 'object')){
              return this.empleadosService.buscarCodigo({query:value,rama:this.empleadoForm.get('rama_id').value}).pipe(
                finalize(() => this.codigosIsLoading = false )
              );
            }else{
              this.codigosIsLoading = false;
              return [];
            }
          }
        ),
      ).subscribe(items => this.filteredCodigos = items);

      this.empleadoForm.get('profesion').valueChanges
      .pipe(
        debounceTime(300),
        tap( () => {
          this.profesionIsLoading = true;
        } ),
        switchMap(value => {
            if(!(typeof value === 'object')){
              return this.empleadosService.buscarProfesion({query:value}).pipe(
                finalize(() => this.profesionIsLoading = false )
              );
            }else{
              this.profesionIsLoading = false;
              return [];
            }
          }
        ),
      ).subscribe(items => this.filteredProfesiones = items);

      this.empleadoForm.get('cr').valueChanges
      .pipe(
        debounceTime(300),
        tap( () => {
          this.crIsLoading = true;
        } ),
        switchMap(value => {
            if(!(typeof value === 'object')){
              return this.empleadosService.buscarCr({query:value}).pipe(
                finalize(() => this.crIsLoading = false )
              );
            }else{
              this.crIsLoading = false;
              return [];
            }
          }
        ),
      ).subscribe(items => this.filteredCr = items);

      this.empleadoForm.get('cradscripcion').valueChanges
      .pipe(
        debounceTime(300),
        tap( () => {
          this.crAdscripcionIsLoading = true;
        } ),
        switchMap(value => {
            if(!(typeof value === 'object')){
              return this.empleadosService.buscarCrAsdcripcion({query:value}).pipe(
                finalize(() => this.crAdscripcionIsLoading = false )
              );
            }else{
              this.crAdscripcionIsLoading = false;
              return [];
            }
          }
        ),
      ).subscribe(items => this.filteredCrAdscripcion = items);
    /*this.route.paramMap.subscribe(params => {
      this.id_empleado = params.get('id');
      this.loadEmpleadoData(this.id_empleado);

      //TODO: Para mostrar el horario del empleado
      this.horarioEmpleado.forEach(element => {
        this.tablaHorarioDias[element.de-1].count++;
        this.tablaHorarioDias[element.ds-1].count++;
        
        this.tablaHorarioHoras.push({dia:element.de,hora:element.he,tipo:'start'});
        this.tablaHorarioHoras.push({dia:element.ds,hora:element.hs,tipo:'end'});
      });

      

     

      this.tablaHorarioHoras.sort((a,b)=>(a.dia > b.dia)?1:((a.dia == b.dia)?((a.hora > b.hora)?1:-1):-1));


    });*/
  }

  loadEmpleadoData(id:any)
  {
    this.isLoading = true;
    this.isLoadingCredential = true;
    let params = {};

    //Inicia: Datos para los botones de Anterior y Siguiente
    let paginator = this.sharedService.getDataFromCurrentApp('paginator');
    let filter = this.sharedService.getDataFromCurrentApp('filter');
    let query = this.sharedService.getDataFromCurrentApp('searchQuery');

    for (let i in paginator) {
      params[i] = paginator[i];
    }

    for (let i in filter) {
      if(filter.clues){       params['clues']     = filter.clues.clues; }
      if(filter.cr){          params['cr']        = filter.cr.cr; }
      if(filter.estatus){     params['estatus']   = filter.estatus.id; }
      if(filter.rama){        params['rama']      = filter.rama.id; }
    }

    if(query){
      params['query'] = query;
    }
    //Termina: Datos para los botones de Anterior y Siguiente

    this.empleadosService.obtenerDatosEmpleado(id,params).subscribe(
      response =>{
        console.log(response);
        this.empleadoForm.reset();

        if(typeof response === 'object'){
          this.datos_empleado = response.data;

          this.puedeTransferir = true;
          this.puedeGuardar = true;
          this.statusIcon = 'help';
          this.statusLabel = 'Por Validar';

          /*if(this.datos_empleado.estatus == 3){
            this.puedeTransferir = false;
            this.puedeGuardar = false;
            this.statusLabel = 'Sin Identificar';
            this.statusIcon = 'warning';
          }else if(this.datos_empleado.estatus == 4 && this.datos_empleado.permuta_adscripcion_activa){ //empelado estatus = 4
            this.puedeTransferir = false;
            this.puedeGuardar = false;
            this.statusLabel = 'En Transferencia';
            this.statusIcon = 'notification_important';
          }else if(this.datos_empleado.estatus == 2){
            this.puedeTransferir = false;
            this.puedeGuardar = false;
            this.statusLabel = 'Dado de Baja';
            this.statusIcon = 'remove_circle';
          }else if(this.datos_empleado.estatus == 1 && this.datos_empleado.validado == 1){
            this.puedeTransferir = true;
            this.puedeGuardar = true;
            this.puedeValidar = false;
            this.statusLabel = 'Validado';
            this.statusIcon = 'verified_user';
          }*/

          this.empleado = true;

          /*if(response.pagination){
            let paginator = this.sharedService.getDataFromCurrentApp('paginator');

            
            let paginationIndex = response.pagination.next_prev.findIndex(item => item.id == this.datos_empleado.id);
            //Aqui verificar estatus
            if(paginationIndex < 0){
              this.miniPagination.next = (response.pagination.next_prev[1])?response.pagination.next_prev[1].id:0;
              this.miniPagination.previous = (response.pagination.next_prev[0])?response.pagination.next_prev[0].id:0;
            }else{
              this.miniPagination.next = (response.pagination.next_prev[paginationIndex+1])?response.pagination.next_prev[paginationIndex+1].id:0;
              this.miniPagination.previous = (response.pagination.next_prev[paginationIndex-1])?response.pagination.next_prev[paginationIndex-1].id:0;
            }
            

            this.miniPagination.total = response.pagination.total;


            this.miniPagination.current = (paginator.pageSize*paginator.pageIndex)+paginator.selectedIndex+1;
          }*/

          this.loadCatalogos();

          if(this.datos_empleado.clave_credencial){
            this.empleadosService.getDatosCredencial(this.datos_empleado.clave_credencial).subscribe(
              response => {
                console.log(response);
                if(response.length > 0){
                  this.datosCredencial = response[0];
                  if(this.datosCredencial.tieneFoto == '1'){
                    this.datosCredencial.photo = 'http://credencializacion.saludchiapas.gob.mx/images/credenciales/'+this.datosCredencial.id+'.'+this.datosCredencial.tipoFoto;
                  }else{
                    this.datosCredencial.photo = this.photoPlaceholder;
                  }
                }else{
                  this.datosCredencial = undefined;
                }
                this.isLoadingCredential = false;
              }
            );
          }
        }
          /*if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.dataSource = [];
          this.resultsLength = 0;
          if(response.data.total > 0){
            this.dataSource = response.data.data;
            this.resultsLength = response.data.total;
          }
        }*/
        this.isLoading = false;
      },
      errorResponse =>{
        console.log(errorResponse);
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoading = false;
        this.isLoadingCredential = false;
      }
    );
  }

  loadCatalogos(){
    this.empleadosService.getCatalogos().subscribe(
      response =>{
        this.catalogos = response;
        this.isLoading = false;
      },
      errorResponse =>{
        console.log(errorResponse);
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoading = false;
      }
    );
  }

  displayCrFn(item: any) {
    if (item) { return item.descripcion; }
  }

  displayCrAdscripcionFn(item: any) {
    if (item) { return item.descripcion; }
  }

  displayCodigoFn(item: any) {
    if (item) { return item.descripcion; }
  }

  displayProfesionFn(item: any) {
    if (item) { return item.descripcion; }
  }

  confirmGuardarValidar(){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Guardar y Validar',dialogMessage:'¿Realmente desea validar los datos guardados? Escriba VALIDAR a continuación para realizar el proceso.',validationString:'VALIDAR',btnColor:'primary',btnText:'Guardar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.accionGuardar(true);
        console.log(valid);
      }
    });
  }

  accionGuardar(validar:boolean = false){
    this.isLoading = true;
    let formData = JSON.parse(JSON.stringify(this.empleadoForm.value));
    
    //Pasando de objeto fecha a cadena ISO
    let fissa = formData.fissa;
    formData.fissa = fissa.substring(0,10);

    //Pasando de objeto fecha a cadena ISO
    let figf = formData.figf;
    formData.figf = figf.substring(0,10);

    if(formData.codigo){
      formData.codigo_id = formData.codigo.codigo;
    }
    if(formData.cr){
      formData.cr_id = formData.cr.cr;
    }
    if(formData.cradscripcion){
      formData.cr_adscripcion_id = formData.cradscripcion.cr;
    }

    if(formData.profesion){
      formData.profesion_id = formData.profesion.id;
    }

    delete formData.codigo;

    let escolaridad = {};
    for(let i in formData.escolaridad){
      if(formData.escolaridad[i]){
        //formData['escolaridad['+index+']'] = i;
        escolaridad[i] = true;
      }
    }
    formData['escolaridad_json'] = JSON.stringify(escolaridad);
    delete formData.escolaridad;

    if(validar){
      formData.validado = true;
    }

   
    this.empleadosService.guardarEmpleado(formData).subscribe(
      respuesta => {
        this.isLoading = false;
        this.sharedService.showSnackBar("Se ha guardado correctamente", "Correcto", 3000);
      },
      errorResponse =>{
        console.log(errorResponse);
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoading = false;
        this.isLoadingCredential = false;
      }
    );
  }

}
