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
import { BajaDialogComponent } from '../baja-dialog/baja-dialog.component';
import { TransferenciaEmpleadoDialogComponent } from '../transferencia-empleado-dialog/transferencia-empleado-dialog.component';
import { EditarHorarioDialogComponent } from '../editar-horario-dialog/editar-horario-dialog.component';
import { ConfirmActionDialogComponent } from '../../utils/confirm-action-dialog/confirm-action-dialog.component';
import { BREAKPOINT } from '@angular/flex-layout';


@Component({
  selector: 'app-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.css']
})
export class EditarComponent implements OnInit {

  catalogos:any[] = [];
  id_empleado:any;
  empleado:boolean = false;
  datos_empleado:any;

  puedeGuardar: boolean = true;
  puedeValidar: boolean = true;
  puedeTransferir: boolean = true;
  necesitaActivarse: boolean = false;
  statusLabel: string;
  statusIcon: string;

  esNuevoEmpleado: boolean = false;

  //Botones Anterior-Siguiente
  miniPagination:any = {
    previous: 0,
    current: 0,
    next: 0,
    total: 0
  };

  codigosIsLoading: boolean = false;
  profesionIsLoading: boolean = false;
  crIsLoading: boolean = false;
  crAdscripcionIsLoading: boolean = false;
  crComisionIsLoading: boolean = false;
  filteredCodigos: Observable<any[]>;
  filteredProfesiones: Observable<any[]>;
  filteredCr: Observable<any[]>;
  filteredCrAdscripcion: Observable<any[]>;
  filteredCrComision: Observable<any[]>;

  estudiosLoading: any = {};
  filteredEstudios: any = {};

  mostrarComisionForm: boolean = false;

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
    { id: 'carrera',        label:'Pasante de Licenciatura' },
    { id: 'titulo',         label:'Titulo de Licenciatura' },
    { id: 'maestria',       label:'Maestria (Para acreditar el perfil del código según el profesiograma)' },
    { id: 'doctorado',      label:'Doctorado' },
    { id: 'cursos',         label:'Cursos (Para acreditar el perfil del código según el profesiograma)' },
    { id: 'especialidad',   label:'Especialidad' },
    { id: 'diplomado',      label:'Diplomado (Para acreditar el perfil del código según el profesiograma)' },
    { id: 'poliglota',      label:'Inglés (TOEFL)' },
  ];

  nivel_escolaridad:any = [
    { id: 1,     label:'SECUNDARIA' },
    { id: 2,     label:'PREPARATORIA' },
    { id: 3,     label:'TÉCNICA' },
    { id: 4,     label:'PASANTE DE LICENCIATURA' },
    { id: 5,     label:'TITULO DE LICENCIATURA' },
    { id: 6,     label:'MAESTRÍA' },
    { id: 7,     label:'DOCTORADO' }
  ];

  empleadoForm = this.fb.group({
    'rfc': ['',Validators.required],
    'curp': ['',[Validators.required]],
    'nombre': ['',[Validators.required]],
    'apellido_paterno': ['',[Validators.required]],
    'apellido_materno': ['',[Validators.required]],
    'sexo': ['',[Validators.required]],
    'fissa': ['',[Validators.required]],
    'figf': [''],

    //'clues': [''],
    //'clues_desc': [''],

    'turno_id':[''],
    'hora_entrada':[''],
    'hora_salida':[''],
    'tipo_trabajador_id': ['', [Validators.required]],
    'programa_id': [''],
    'fuente_id': [''],
    'fuente_finan_id': [''],
    'ur':[''],


    'codigo_id': [''],
    'codigo': [''],
    'profesion_id': [''],
    'profesion': [''],
    'cr_id': [''],
    'cr_adscripcion_id':[''],
    'rama_id': [''],
    'area_servicio': [''],
    'actividades': [''],

    'comision_sindical_id': [''],
    'sindicato_id': [''],
    'tipo_comision': [''],
    'ultima_comision_id': [''],
    //direccion
    'calle': ['', [Validators.required]],
    'no_exterior': ['', [Validators.required]],
    'no_interior': [''],
    'colonia': ['', [Validators.required]],
    'cp': ['', [Validators.required]],

    //Datos personales
    'telefono_fijo': [''],
    'telefono_celular': ['', [Validators.required]],
    'correo_personal': ['', [Validators.required]],
    
    //escolaridad
    'escolaridad_id': ['', [Validators.required]],
    'no_cedula': [''],

    'nacionalidad': ['MEXICANA', [Validators.required]],
    'estado_nacimiento': ['CHIAPAS', [Validators.required]],

    'comision': this.fb.group({
      //Datos Comision
      'cr_comision': [''],
      'cr_comision_id': [''],
      'fecha_inicio': [''],
      'fecha_fin': [''],
      'no_oficio': [''],
      'recurrente':[''],
      'total_acumulado_meses':[''],
      'sindicato_id':[''],
    }),

    'estudios': this.fb.group({
      'licenciatura':[''], 
      'datos_licenciatura': this.fb.group({
        'titulo':[''],'cedula':[''],'descripcion':['']
      }),
      'maestria':[''], 
      'datos_maestria': this.fb.group({
        'titulo':[''],'cedula':[''],'descripcion':['']
      }),
      'doctorado':[''], 
      'datos_doctorado': this.fb.group({
        'cedula':[''],'descripcion':['']
      }),
      'diplomado':[''],
      'datos_diplomado': this.fb.group({
        'descripcion':['']
      }),
      'cursos':[''], 
      'ingles':['']
    }),

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
    this.route.paramMap.subscribe(params => {
      this.id_empleado = params.get('id');

      if(this.id_empleado){
        this.loadEmpleadoData(this.id_empleado);

        //TODO: Para mostrar el horario del empleado
        this.horarioEmpleado.forEach(element => {
          this.tablaHorarioDias[element.de-1].count++;
          this.tablaHorarioDias[element.ds-1].count++;
          
          this.tablaHorarioHoras.push({dia:element.de,hora:element.he,tipo:'start'});
          this.tablaHorarioHoras.push({dia:element.ds,hora:element.hs,tipo:'end'});
        });
      }else{
        this.empleadoForm.addControl('cr_adscripcion', new FormControl('', Validators.required));
        this.empleadoForm.addControl('cr', new FormControl('', Validators.required));

        this.puedeTransferir = false;
        this.esNuevoEmpleado = true;
        this.isLoading = true;
        this.loadCatalogos();

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

        this.empleadoForm.get('cr_adscripcion').valueChanges
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
      }

      this.empleadoForm.get('comision').get('cr_comision').valueChanges
        .pipe(
          debounceTime(300),
          tap( () => {
            this.crComisionIsLoading = true;
          } ),
          switchMap(value => {
              if(!(typeof value === 'object')){
                return this.empleadosService.buscarCrAsdcripcion({query:value}).pipe(
                  finalize(() => this.crComisionIsLoading = false )
                );
              }else{
                this.crComisionIsLoading = false;
                return [];
              }
            }
          ),
        ).subscribe(items => this.filteredCrComision = items);

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

      this.estudiosLoading = {'LIC':false,'MA':false,'DOC':false,'DIP':false};
      this.filteredEstudios = {'LIC':null,'MA':null,'DOC':null,'DIP':null};
        
      let estudios = {
        'LIC':'licenciatura', 
        'MA':'maestria', 
        'DOC':'doctorado', 
        'DIP':'diplomado'
      };
      
      for(let i in estudios){
        this.empleadoForm.get('estudios.'+estudios[i]).valueChanges
        .pipe(
          debounceTime(300),
          tap( () => {
            this.estudiosLoading[i] = true;
          } ),
          switchMap(value => {
              if(!(typeof value === 'object')){
                return this.empleadosService.buscarProfesion({query:value,filter:i}).pipe(
                  finalize(() => this.estudiosLoading[i] = false )
                );
              }else{
                this.estudiosLoading[i] = false;
                return [];
              }
            }
          ),
        ).subscribe(items => this.filteredEstudios[i] = items);
      }

      /*this.empleadoForm.get('profesion').valueChanges
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
      ).subscribe(items => this.filteredProfesiones = items);*/

      this.tablaHorarioHoras.sort((a,b)=>(a.dia > b.dia)?1:((a.dia == b.dia)?((a.hora > b.hora)?1:-1):-1));

      //console.log(this.tablaHorarioDias);
      //console.log(this.tablaHorarioHoras);
    });
  }

  checkSelectedValue(field_name) {
    setTimeout(() => {
      if (typeof(this.empleadoForm.get(field_name).value) != 'object') {
        this.empleadoForm.get(field_name).setValue(null);
      } 
    }, 300);
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
        /*console.log("-------entra");
        console.log(response);
        console.log("-------entra");*/
        this.empleadoForm.reset();


        if(typeof response === 'object'){
          this.datos_empleado = response.data;

          this.puedeTransferir = true;
          this.puedeGuardar = true;
          this.necesitaActivarse = false
          this.statusIcon = 'help';
          this.statusLabel = 'Por Validar';

          if(this.datos_empleado.estatus == 3){
            this.puedeTransferir = false;
            this.puedeGuardar = false;
            this.necesitaActivarse = true;
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
          }

          this.empleado = true;

          if(response.pagination){
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
          }

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
    this.empleadosService.getCatalogosList().subscribe(
      response =>{
        //console.log(response);
        this.catalogos = response;

        if(!this.esNuevoEmpleado){
          if(!this.datos_empleado.escolaridad){
            this.datos_empleado.escolaridad = {};
          }
          
          if(this.datos_empleado.figf){
            this.datos_empleado.figf = new Date(this.datos_empleado.figf.substring(0,4),(this.datos_empleado.figf.substring(5,7)-1), this.datos_empleado.figf.substring(8,10),12,0,0,0);
          }
          this.datos_empleado.fissa = new Date(this.datos_empleado.fissa.substring(0,4),this.datos_empleado.fissa.substring(5,7)-1, this.datos_empleado.fissa.substring(8,10),12,0,0,0);
  
          //console.log("----------x------------");
          //console.log(this.datos_empleado);
          let escolaridad = this.datos_empleado.escolaridad_detalle;
          this.datos_empleado.estudios = {'licenciatura':'', 'datos_licenciatura': '', 'maestria': '', 'datos_maestria': '', 'doctorado': '', 'datos_doctorado': '', 'diplomado': '', 'datos_diplomado': '', 'cursos': '', 'ingles':''};
          for(let i in escolaridad ){
              
            switch(escolaridad[i].tipo_estudio)
            {
              case 'LIC':
                let obj_lic = {'cedula':  escolaridad[i].cedula, 'titulo': escolaridad[i].titulado, 'descripcion': escolaridad[i].descripcion };
                escolaridad.datos_licenciatura = obj_lic;
                this.datos_empleado.estudios.licenciatura = escolaridad[i].profesion ;
                this.datos_empleado.estudios.datos_licenciatura = obj_lic;
              break;
              case 'MA':
                let obj_ma = {'cedula':  escolaridad[i].cedula, 'titulo': escolaridad[i].titulado, 'descripcion': escolaridad[i].descripcion };
                this.datos_empleado.estudios.maestria = escolaridad[i].profesion;
                this.datos_empleado.estudios.datos_maestria = obj_ma;
              break;
              case 'DOC':
                let obj_doc = {'cedula':  escolaridad[i].cedula, 'titulo': escolaridad[i].titulado, 'descripcion': escolaridad[i].descripcion };
                this.datos_empleado.estudios.doctorado = escolaridad[i].profesion;
                this.datos_empleado.estudios.datos_doctorado = obj_doc ;
              break;
              case 'DIP':
                let obj_dip = {'cedula':  escolaridad[i].cedula, 'titulo': escolaridad[i].titulado, 'descripcion': escolaridad[i].descripcion };
                this.datos_empleado.estudios.diplomado = escolaridad[i].profesion;
                this.datos_empleado.estudios.datos_diplomado = obj_dip;
              break;
              case 'CUR':
                this.datos_empleado.estudios.cursos = escolaridad[i].descripcion;
              break;
              case 'POLI':
                this.datos_empleado.estudios.ingles = 1;
              break;
            }
          }

          
          
          this.empleadoForm.patchValue(this.datos_empleado);
  
          //this.empleadoForm.patchValue({ "clues": this.datos_empleado.clues.clues });
          //this.empleadoForm.patchValue({ "clues_desc": this.datos_empleado.clues.nombre_unidad});
          this.empleadoForm.patchValue({ "tipo_profesion_id": this.catalogos['consulta_tipo_profesion'] });
        }
        
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

  displayCodigoFn(item: any) {
    if (item) { return item.descripcion; }
  }

  displayProfesionFn(item: any) {
    if (item) { return item.descripcion; }
  }

  loadNext(){
    let nextId = this.miniPagination.next;
    let paginator = this.sharedService.getDataFromCurrentApp('paginator');

    if(paginator.selectedIndex+1 >= paginator.pageSize){
      paginator.pageIndex += 1;
      paginator.selectedIndex = 0;
    }else{
      paginator.selectedIndex += 1;
    }

    this.sharedService.setDataToCurrentApp('paginator',paginator);
    this.loadEmpleadoData(nextId);
  }

  loadPrevious(){
    let prevId = this.miniPagination.previous;
    let paginator = this.sharedService.getDataFromCurrentApp('paginator');
    
    if(paginator.selectedIndex-1 < 0){
      paginator.pageIndex -= 1;
      paginator.selectedIndex = paginator.pageSize-1;
    }else{
      paginator.selectedIndex -= 1;
    }

    this.sharedService.setDataToCurrentApp('paginator',paginator);
    this.loadEmpleadoData(prevId);
  }

  showEstudiosDialog(id?:number){
    const dialogRef = this.dialog.open(EstudiosDialogComponent, {
      width: '80%',
      data: {id:id}
    });

    dialogRef.afterClosed().subscribe(response => {
      if(response){
        console.log(response);
      }
    });
  }

  showBajaDialog(){
    const dialogRef = this.dialog.open(BajaDialogComponent, {
      width: '80%',
      data: {id:this.datos_empleado.id}
    });

    dialogRef.afterClosed().subscribe(response => {
      if(response){
        this.loadEmpleadoData(this.datos_empleado.id);
        console.log(response);
      }
    });
  }

  showHorarioDialog(){
    const dialogRef = this.dialog.open(EditarHorarioDialogComponent, {
      width: '80%',
      data: {id:this.datos_empleado.id, horarioActual:this.horarioEmpleado}
    });

    dialogRef.afterClosed().subscribe(response => {
      if(response){
        console.log(response);
      }
    });
  }

  showTransferenciaEmpleadoDialog(id:number){
    const dialogRef = this.dialog.open(TransferenciaEmpleadoDialogComponent, {
      width: '90%',
      data: {id:id, cluesActual:this.datos_empleado.clues.clues, crActual:this.datos_empleado.cr_id}
    });

    dialogRef.afterClosed().subscribe(response => {
      if(response){
        this.loadEmpleadoData(id);

        /*this.statusLabel = 'En Transferencia';
        this.statusIcon = 'help';
        this.puedeTransferir = false,
        this.puedeGuardar = false;*/
        console.log(response);
      }
    });
  }

  activateEmployee(id:number){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Activar Empleado',dialogMessage:'¿Realmente desea activar al trabajador? Escriba ACTIVAR a continuación para realizar el proceso.',validationString:'ACTIVAR',btnColor:'primary',btnText:'Activar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.empleadosService.activarEmpleado(id).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
              this.isLoading = false;
            } else {
              console.log(response);
              this.loadEmpleadoData(id);
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
    });
  }

  confirmUnlinkEmployee(){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Liberar Empleado',dialogMessage:'¿Realmente desea liberar el trabajador de su clues? Escriba LIBERAR a continuación para realizar el proceso.',validationString:'LIBERAR',btnColor:'primary',btnText:'Liberar'}
    });

    let id = this.datos_empleado.id;

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.empleadosService.desligarEmpleado(id).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            } else {
              console.log(response);
              this.loadEmpleadoData(id);

              let paginator = this.sharedService.getDataFromCurrentApp('paginator');
              if(paginator.selectedIndex > 0){
                paginator.selectedIndex -= 1;
              }else{
                paginator.selectedIndex = paginator.pageSize-1;
              }
              this.sharedService.setDataToCurrentApp('paginator',paginator);
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
    });
  }

  confirmBorrarEstudio(id: number){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Borrar Elemento',dialogMessage:'¿Realmente desea borrar el estudo seleccionado?',btnColor:'warn',btnText:'Borrar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        console.log('borrado:' + id);
      }else{
        console.log('cancelado');
      }
    });
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
    //console.log(formData);
    
    //Pasando de objeto fecha a cadena ISO
    let fissa = formData.fissa;
    formData.fissa = fissa.substring(0,10);

    //Pasando de objeto fecha a cadena ISO
    let figf = formData.figf;
    formData.figf = figf.substring(0,10);

    if(formData.codigo){
      formData.codigo_id = formData.codigo.codigo;
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

    if(formData.profesion){
      formData.profesion_id = formData.profesion.id;
    }
    delete formData.profesion;

    if(validar){
      formData.validado = true;
    }

    //this.isLoading = false;
    //return false;
    
    if(this.esNuevoEmpleado){
      if(formData.cr){
        formData.cr_id = formData.cr.cr;
      }
      delete formData.cr;

      if(formData.cr_adscripcion){
        formData.cr_adscripcion_id = formData.cr_adscripcion.cr;
      }
      delete formData.cr_adscripcion;

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
          }else{
            errorMessage += ': ' + errorResponse.error.message;
          }
          this.sharedService.showSnackBar(errorMessage, null, 3000);
          this.isLoading = false;
          this.isLoadingCredential = false;
        }
      );
    }else{
      this.empleadosService.actualizarEmpleado(this.datos_empleado.id, formData).subscribe(
        respuesta => {
          this.isLoading = false;
          this.sharedService.showSnackBar("Se ha guardado correctamente", "Correcto", 3000);
        },
        errorResponse =>{
          console.log(errorResponse);
          var errorMessage = "Ocurrió un error.";
          if(errorResponse.status == 409){
            errorMessage = errorResponse.error.error.message;
          }else{
            errorMessage += ': ' + errorResponse.error.message;
          }
          this.sharedService.showSnackBar(errorMessage, null, 3000);
          this.isLoading = false;
          this.isLoadingCredential = false;
        }
      );
    }
  }

  accionGuardarComision(validar:boolean = false){
    //this.isLoading = true;
    let formDataCompleto = JSON.parse(JSON.stringify(this.empleadoForm.value));
    let formData = JSON.parse(JSON.stringify(this.empleadoForm.value.comision));
    //console.log(formData);
    
    //Pasando de objeto fecha a cadena ISO
    let finicio = formData.fecha_inicio;
    formData.fecha_inicio = finicio.substring(0,10);

    //Pasando de objeto fecha a cadena ISO
    let ffin = formData.fecha_fin;
    formData.fecha_fin = ffin.substring(0,10);


    if(formData.cr_comision){
      formData.cr_comision_id = formData.cr_comision.cr;
    }
    delete formData.cr_comision;
    
    //formData.empleado_id = this.empleadoForm.value.id;
    //console.log(formDataCompleto);
    formData.tipo_comision = formDataCompleto.tipo_comision;
    console.log(formData);
    
    this.empleadosService.guardarComision(this.datos_empleado.id, formData).subscribe(
      respuesta => {
        this.isLoading = false;
        this.sharedService.showSnackBar("Se ha guardado correctamente", "Correcto", 3000);
        this.mostrarComisionForm = false;

        console.log(respuesta);
        this.datos_empleado.empleado_comision = respuesta.data.empleado_comision; 
      },
      errorResponse =>{
        console.log(errorResponse);
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }else{
          errorMessage += ': ' + errorResponse.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoading = false;
        this.isLoadingCredential = false;
      }
    );
    
  }
}
