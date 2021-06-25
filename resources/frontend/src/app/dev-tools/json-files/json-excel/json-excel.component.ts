import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { JsonFilesService }  from '../json-files.service';
import * as FileSaver from 'file-saver';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-json-excel',
  templateUrl: './json-excel.component.html',
  styleUrls: ['./json-excel.component.css']
})
export class JsonExcelComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;
  fileAttr = 'Selecciona un archivo';

  constructor(private jsonFilesService: JsonFilesService) { }

  isLoadingExcel:boolean;
  jsonFile:any;

  ngOnInit(): void {
  }

  downloadReport(){
    const formData = new FormData();
    
    formData.append('archivoJSON', this.jsonFile, this.jsonFile.name);
    this.jsonFile.inProgress = true;

    console.log(this.jsonFile);
    this.jsonFilesService.convertirCSV(formData).subscribe(
      response => {
        console.log(response);
        //FileSaver.saveAs(response);
        //FileSaver.saveAs(response,'reporte');
        this.isLoadingExcel = false;
      },
      errorResponse => {
        let errorMessage = 'Ocurrio un error al intentar descargar el archivo';
        this.isLoadingExcel = false;
        console.log(errorResponse);
      });

      /*this.jsonFilesService.convertirCSV(formData).pipe(  
        map(event => {  
          switch (event.type) {  
            case HttpEventType.UploadProgress:  
              this.jsonFile.progress = Math.round(event.loaded * 100 / event.total);  
              break;  
            case HttpEventType.Response:  
              return event;  
          }  
        }),  
        catchError((error: HttpErrorResponse) => {  
          this.jsonFile.inProgress = false;  
          return of(`${this.jsonFile.name} upload failed.`);  
        })).subscribe((event: any) => {  
          if (typeof (event) === 'object') {  
            console.log(event.body);  
          }  
      });*/
  }

  uploadFileEvt(selectedFile: any) {
    if (selectedFile.target.files && selectedFile.target.files[0]) {
      this.fileAttr = selectedFile.target.files[0].name;
      this.jsonFile = selectedFile.target.files[0];
      // HTML5 FileReader API
      let reader = new FileReader();
      /*reader.onload = (e: any) => {
        let image = new Image();
        image.src = e.target.result;
        image.onload = rs => {
          let imgBase64Path = e.target.result;
        };
      };*/
      reader.readAsDataURL(selectedFile.target.files[0]);
      
      // Reset if duplicate image uploaded again
      this.fileInput.nativeElement.value = "";
    } else {
      this.fileAttr = 'Selecciona un archivo';
    }
  }
}
