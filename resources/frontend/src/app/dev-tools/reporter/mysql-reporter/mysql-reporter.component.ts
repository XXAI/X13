import { Component, OnInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ReporterService } from '../reporter.service';
import { trigger, transition, style, animate } from '@angular/animations';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'mysql-reporter',
  templateUrl: './mysql-reporter.component.html',
  styleUrls: ['./mysql-reporter.component.css'],
  animations: [
    trigger('buttonInOut', [
        transition('void => *', [
            style({opacity: 0}),
            animate(300, style({opacity: 1}))
        ]),
        transition('* => void', [
            animate(300, style({opacity: 0}))
        ])
    ])
  ]
})
export class MysqlReporterComponent implements OnInit {

  constructor(private reporterService: ReporterService) { }

  isLoading:boolean;
  isLoadingExcel:boolean = false;
  totalResults:number =  0;
  totalColumns:number = 0;
  execTime:number = 0;
  hideQuery:boolean = false;

  savedQueryLoaded:boolean = false;

  errorMessage:string;

  execQuery:string;
  limitQuery:number = 100;

  dataSource:any[] = [];
  displayedColumns:string[] = [];
  pageSize:number = 20;
  currentPage:number = 0;
  resultsLength:number = 0;

  paginarResultados:boolean = false;

  ngOnInit() {
    this.isLoading = false;
  }

  loadResultsData(event?:PageEvent){
    //
  }

  clearResults(refresh:boolean = false){
    this.errorMessage = undefined;
    this.dataSource = [];
    this.displayedColumns = [];
    this.totalColumns = 0;
    this.totalResults = 0;
    this.execTime = 0;

    if(!refresh){
      this.hideQuery = false;
    }
  }

  executeQuery(){
    this.isLoading = true;

    this.clearResults(this.hideQuery);
    
    this.reporterService.ejecutarReporte({query: this.execQuery, limit: this.limitQuery}).subscribe(
      response => {
        console.log(response);
        this.displayedColumns = response.columns;
        this.totalColumns = response.columns.length;
        this.totalResults = response.data.length;
        this.execTime = response.exec_time;

        if(response.data.length <= 500){
          this.dataSource = response.data;
          this.hideQuery = true;
        }else{
          this.errorMessage = 'Son demasiados resultados para mostrarlos en el navegador';
        }
        

        this.isLoading = false;
      },
      errorResponse =>{
        this.errorMessage = errorResponse.error.error;
        this.isLoading = false;
      }
    );
  }

  downloadReport(){
    this.isLoadingExcel = true;
    this.reporterService.exportarReporte({query: this.execQuery}).subscribe(
      response => {
        //FileSaver.saveAs(response);
        FileSaver.saveAs(response,'reporte');
        this.isLoadingExcel = false;
      },
      errorResponse =>{
        this.errorMessage = 'Ocurrio un error al intentar descargar el archivo';
        this.isLoadingExcel = false;
      }
    );
    console.log(this.execQuery);
  }

}
