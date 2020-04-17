import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { EmpleadosService } from '../empleados.service';
import { SharedService } from '../../shared/shared.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { MatTable, MatExpansionPanel } from '@angular/material';
import { ConfirmActionDialogComponent } from '../../utils/confirm-action-dialog/confirm-action-dialog.component';
import { ConfirmarTransferenciaDialogComponent } from '../confirmar-transferencia-dialog/confirmar-transferencia-dialog.component';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { trigger, transition, animate, style } from '@angular/animations';
import { AgregarEmpleadoDialogComponent } from '../agregar-empleado-dialog/agregar-empleado-dialog.component';
import { AgregarFirmantesDialogComponent } from '../agregar-firmantes-dialog/agregar-firmantes-dialog.component';
import { PermissionsList } from '../../auth/models/permissions-list';
import { MediaObserver } from '@angular/flex-layout';
import { IfHasPermissionDirective } from 'src/app/shared/if-has-permission.directive';
import { ReportWorker } from '../../web-workers/report-worker';
import * as FileSaver from 'file-saver';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css'],
  animations: [
    trigger('buttonInOut', [
        transition('void => *', [
            style({opacity: '1'}),
            animate(200)
        ]),
        transition('* => void', [
            animate(200, style({opacity: '0'}))
        ])
    ])
  ],
  providers:[
    { provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false, showError: true } }
  ]
})

export class ListaComponent implements OnInit {
  isLoading: boolean = false;
  isLoadingPDF: boolean = false;
  mediaSize: string;

  showMyStepper:boolean = false;
  showReportForm:boolean = false;
  stepperConfig:any = {};
  reportTitle:string;
  reportIncludeSigns:boolean = false;

  searchQuery: string = '';

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;
  pageSize: number = 20;
  selectedItemIndex: number = -1;

  statusIcon:any = {
    '1-0':'help', //activo
    '1-1':'verified_user', //activo verificado 
    '2':'remove_circle', //baja
    '3':'warning', // No identificado
    '4':'swap_horizontal_circle' //en transferencia
  };

  filterCatalogs:any = {};
  filteredCatalogs:any = {};

  filterChips:any = []; //{id:'field_name',tag:'description',tooltip:'long_description'}

  filterForm = this.fb.group({
    'clues': [undefined],
    'cr': [undefined],
    'estatus': [undefined],
    'rama': [undefined]
  });

  displayedColumns: string[] = ['estatus','Nombre','RFC','Clues','actions'];
  dataSource: any = [];

  //showAdvancedFilter:boolean = false;
  constructor(private sharedService: SharedService, private empleadosService: EmpleadosService, public dialog: MatDialog, private fb: FormBuilder, public mediaObserver: MediaObserver) { }

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatTable, {static:false}) usersTable: MatTable<any>;
  @ViewChild(MatExpansionPanel, {static:false}) advancedFilter: MatExpansionPanel;

  ngOnInit() {
    this.mediaObserver.media$.subscribe(
      response => {
        this.mediaSize = response.mqAlias;
    });

    let appStoredData = this.sharedService.getArrayDataFromCurrentApp(['searchQuery','paginator','filter']);
    console.log(appStoredData);

    if(appStoredData['searchQuery']){
      this.searchQuery = appStoredData['searchQuery'];
    }

    let event = null
    if(appStoredData['paginator']){
      this.currentPage = appStoredData['paginator'].pageIndex;
      this.pageSize = appStoredData['paginator'].pageSize;
      event = appStoredData['paginator'];

      if(event.selectedIndex >= 0){
        console.log(event);
        this.selectedItemIndex = event.selectedIndex;
      }
    }else{
      let dummyPaginator = {
        length: 0,
        pageIndex: this.currentPage,
        pageSize: this.pageSize,
        previousPageIndex: (this.currentPage > 0)?this.currentPage-1:0
       };
      this.sharedService.setDataToCurrentApp('paginator', dummyPaginator);
    }

    if(appStoredData['filter']){
      this.filterForm.patchValue(appStoredData['filter']);
    }

    this.loadEmpleadosData(event);
    this.loadFilterCatalogs();
  }

  public loadFilterCatalogs(){
    this.empleadosService.getFilterCatalogs().subscribe(
      response => {
        console.log(response);
        this.filterCatalogs = {
          'clues': response.data.clues,
          'cr': response.data.cr,
          'estatus': response.data.estatus,
          'rama': response.data.rama
        };

        this.filteredCatalogs['clues'] = this.filterForm.controls['clues'].valueChanges.pipe(startWith(''),map(value => this._filter(value,'clues','nombre_unidad')));
        this.filteredCatalogs['cr'] = this.filterForm.controls['cr'].valueChanges.pipe(startWith(''),map(value => this._filter(value,'cr','descripcion')));
        //this.filteredCatalogs['estatus'] = this.filterForm.controls['estatus'].valueChanges.pipe(startWith(''),map(value => this._filter(value,'estatus','descripcion')));
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
      }
    );
  }

  getDisplayFn(label: string){
    return (val) => this.displayFn(val,label);
  }

  displayFn(value: any, valueLabel: string){
    return value ? value[valueLabel] : value;
  }

  private _filter(value: any, catalog: string, valueField: string): string[] {
    let filterValue = '';
    if(value){
      if(typeof(value) == 'object'){
        filterValue = value[valueField].toLowerCase();
      }else{
        filterValue = value.toLowerCase();
      }
    }
    return this.filterCatalogs[catalog].filter(option => option[valueField].toLowerCase().includes(filterValue));
  }

  public loadEmpleadosData(event?:PageEvent){
    this.isLoading = true;
    let params:any;
    if(!event){
      params = { page: 1, per_page: this.pageSize }
    }else{
      params = {
        page: event.pageIndex+1,
        per_page: event.pageSize
      };
    }

    if(event && !event.hasOwnProperty('selectedIndex')){
      this.selectedItemIndex = -1;
    }
    
    params.query = this.searchQuery;

    let filterFormValues = this.filterForm.value;
    let countFilter = 0;

    this.loadFilterChips(filterFormValues);

    for(let i in filterFormValues){
      if(filterFormValues[i]){
        if(i == 'clues'){
          params[i] = filterFormValues[i].clues;
        }else if(i == 'cr'){
          params[i] = filterFormValues[i].cr;
        }else{ //profesion y rama
          params[i] = filterFormValues[i].id;
        }
        countFilter++;
      }
    }

    if(countFilter > 0){
      params.active_filter = true;
    }

    if(event){
      this.sharedService.setDataToCurrentApp('paginator',event);
    }

    this.sharedService.setDataToCurrentApp('searchQuery',this.searchQuery);
    this.sharedService.setDataToCurrentApp('filter',filterFormValues);

    this.empleadosService.getEmpleadosList(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          this.dataSource = [];
          this.resultsLength = 0;
          if(response.data.total > 0){
            this.dataSource = response.data.data;
            this.resultsLength = response.data.total;
          }
        }
        this.isLoading = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoading = false;
      }
    );
    return event;
  }

  loadFilterChips(data){
    this.filterChips = [];
    for(let i in data){
      if(data[i]){
        let item = {
          id: i,
          tag: '',
          tooltip: i.toUpperCase() + ': ',
          active: true
        };
        if(i == 'clues'){
          item.tag = data[i].clues;
          item.tooltip += data[i].nombre_unidad;
        }else if(i == 'cr'){
          item.tag = data[i].cr;
          item.tooltip += data[i].descripcion;
        }else{
          if(data[i].descripcion.length > 30){
            item.tag = data[i].descripcion.slice(0,27) + '...';
            item.tooltip += data[i].descripcion;
          }else{
            item.tag = data[i].descripcion;
            item.tooltip = i.toUpperCase();
          }
        }
        this.filterChips.push(item);
      }
    }
  }

  editEmpleado(index){
    let paginator = this.sharedService.getDataFromCurrentApp('paginator');
    paginator.selectedIndex = index;
    this.sharedService.setDataToCurrentApp('paginator',paginator);
  }

  removeFilterChip(item,index){
    this.filterForm.get(item.id).reset();
    this.filterChips[index].active = false;
  }

  compareRamaSelect(op,value){
    return op.id == value.id;
  }

  compareEstatusSelect(op,value){
    return op.id == value.id;
  }

  applyFilter(){
    this.selectedItemIndex = -1;
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = this.pageSize;
    this.loadEmpleadosData(null);
  }

  cleanFilter(filter){
    filter.value = '';
    //filter.closePanel();
  }

  cleanSearch(){
    this.searchQuery = '';
    //this.paginator.pageIndex = 0;
    //this.loadEmpleadosData(null);
  }

  toggleAdvancedFilter(status){
    if(status){
      this.advancedFilter.open();
    }else{
      this.advancedFilter.close();
    }
  }

  showAddEmployeDialog(){
    let configDialog = {};
    if(this.mediaSize == 'xs'){
      configDialog = {
        maxWidth: '100vw',
        maxHeight: '100vh',
        height: '100%',
        width: '100%',
        data:{scSize:this.mediaSize}
      };
    }else{
      configDialog = {
        width: '95%',
        data:{}
      }
    }
    const dialogRef = this.dialog.open(AgregarEmpleadoDialogComponent, configDialog);

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        console.log(valid);
      }
    });
  }

  showAddFirmanteDialog(){
    let configDialog = {};
    if(this.mediaSize == 'xs'){
      configDialog = {
        maxWidth: '100vw',
        maxHeight: '100vh',
        height: '100%',
        width: '100%',
        data:{scSize:this.mediaSize}
      };
    }else{
      configDialog = {
        width: '95%',
        data:{}
      }
    }
    const dialogRef = this.dialog.open(AgregarFirmantesDialogComponent, configDialog);

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        console.log(valid);
      }
    });
  }

  confirmTransferEmploye(id:number,i:number){
    let configDialog = {};
    if(this.mediaSize == 'xs'){
      configDialog = {
        maxWidth: '100vw',
        maxHeight: '100vh',
        height: '100%',
        width: '100%',
      };
    }else{
      configDialog = {
        width: '95%',
      }
    }
    configDialog['data'] = {id:id};
    /*width: '80%',
      data:{id:id}*/

    const dialogRef = this.dialog.open(ConfirmarTransferenciaDialogComponent, configDialog);

    this.selectedItemIndex = i;

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.loadEmpleadosData();
      }
    });
  }

  confirmUntieEmploye(id: number)
  {
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data:{dialogTitle:'Liberar Empleado',dialogMessage:'¿Realmente desea liberar el trabajador de su clues? Escriba LIBERAR a continuación para realizar el proceso.',validationString:'LIBERAR',btnColor:'primary',btnText:'Liberar'}
    });

    dialogRef.afterClosed().subscribe(valid => {
      if(valid){
        this.empleadosService.desligarEmpleado(id).subscribe(
          response =>{
            if(response.error) {
              let errorMessage = response.error.message;
              this.sharedService.showSnackBar(errorMessage, null, 3000);
            } else {
              this.loadEmpleadosData();
            }
            this.isLoading = false;
          },
          errorResponse =>{
            var errorMessage = "Ocurrió un error.";
            if(errorResponse.status == 409){
              errorMessage = errorResponse.error.error.message;
            }
            this.sharedService.showSnackBar(errorMessage, null, 3000);
            this.isLoading = false;
          }
        );
      }
    });
  }

  toggleReportPanel(){
    this.reportIncludeSigns = false;
    this.reportTitle = 'Listado de Personal Activo';

    this.stepperConfig = {
      steps:[
        {
          status: 1, //1:standBy, 2:active, 3:done, 0:error
          label: { standBy: 'Cargar Datos', active: 'Cargando Datos', done: 'Datos Cargados' },
          icon: 'settings_remote',
          errorMessage: '',
        },
        {
          status: 1, //1:standBy, 2:active, 3:done, 0:error
          label: { standBy: 'Generar PDF', active: 'Generando PDF', done: 'PDF Generado' },
          icon: 'settings_applications',
          errorMessage: '',
        },
        {
          status: 1, //1:standBy, 2:active, 3:done, 0:error
          label: { standBy: 'Descargar Archivo', active: 'Descargando Archivo', done: 'Archivo Descargado' },
          icon: 'save_alt',
          errorMessage: '',
        },
      ],
      currentIndex: 0
    }

    this.showReportForm = !this.showReportForm;
    if(this.showReportForm){
      this.showMyStepper = false;
    }
    //this.showMyStepper = !this.showMyStepper;
  }

  reportePersonalActivo(){
    //this.showMyStepper = true;
    this.isLoadingPDF = true;
    this.showMyStepper = true;
    this.showReportForm = false;

    let params:any = {};
    let countFilter = 0;

    let appStoredData = this.sharedService.getArrayDataFromCurrentApp(['searchQuery','filter']);
    console.log(appStoredData);

    params.reporte = 'personal-activo';

    if(appStoredData['searchQuery']){
      params.query = appStoredData['searchQuery'];
    }

    for(let i in appStoredData['filter']){
      if(appStoredData['filter'][i]){
        if(i == 'clues'){
          params[i] = appStoredData['filter'][i].clues;
        }else if(i == 'cr'){
          params[i] = appStoredData['filter'][i].cr;
        }else{ //profesion y rama
          params[i] = appStoredData['filter'][i].id;
        }
        countFilter++;
      }
    }

    if(countFilter > 0){
      params.active_filter = true;
    }
    
    this.stepperConfig.steps[0].status = 2;

    this.empleadosService.getEmpleadosList(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.stepperConfig.steps[this.stepperConfig.currentIndex].status = 0;
          this.stepperConfig.steps[this.stepperConfig.currentIndex].errorMessage = errorMessage;
          //this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
            this.stepperConfig.steps[0].status = 3;
            this.stepperConfig.steps[1].status = 2;
            this.stepperConfig.currentIndex = 1;

            const reportWorker = new ReportWorker();
            reportWorker.onmessage().subscribe(
              data => {
                this.stepperConfig.steps[1].status = 3;
                this.stepperConfig.steps[2].status = 2;
                this.stepperConfig.currentIndex = 2;

                console.log(data);
                FileSaver.saveAs(data.data,'PersonalActivo');
                reportWorker.terminate();

                this.stepperConfig.steps[2].status = 3;
                this.isLoadingPDF = false;
                this.showMyStepper = false;
            });

            reportWorker.onerror().subscribe(
              (data) => {
                //this.sharedService.showSnackBar('Error: ' + data.message,null, 3000);
                this.stepperConfig.steps[this.stepperConfig.currentIndex].status = 0;
                this.stepperConfig.steps[this.stepperConfig.currentIndex].errorMessage = data.message;
                this.isLoadingPDF = false;
                console.log(data);
              }
            );
            
            let config = {
              title: this.reportTitle,
              showSigns: this.reportIncludeSigns, 
            };

            reportWorker.postMessage({data:{items: response.data, config:config, firmantes: response.firmantes, responsables: response.responsables},reporte:'empleados/personal-activo'});
        }
        this.isLoading = false;
      },
      errorResponse =>{
        var errorMessage = "Ocurrió un error.";
        if(errorResponse.status == 409){
          errorMessage = errorResponse.error.error.message;
        }
        this.stepperConfig.steps[this.stepperConfig.currentIndex].status = 0;
        this.stepperConfig.steps[this.stepperConfig.currentIndex].errorMessage = errorMessage;
        //this.sharedService.showSnackBar(errorMessage, null, 3000);
        this.isLoading = false;
      }
    );
  }
}
