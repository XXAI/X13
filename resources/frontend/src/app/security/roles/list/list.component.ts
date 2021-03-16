import { Component, OnInit, ViewChild } from '@angular/core';
import { SharedService } from '../../../shared/shared.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { RolesService } from '../roles.service';
import { FormComponent } from '../form/form.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmActionDialogComponent } from '../../../utils/confirm-action-dialog/confirm-action-dialog.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  isLoading: boolean = false;

  searchQuery: string = '';

  pageEvent: PageEvent;
  resultsLength: number = 0;
  currentPage: number = 0;

  displayedColumns: string[] = ['id','name','actions'];
  dataSource: any = [];

  constructor(private sharedService: SharedService, private rolesService: RolesService, public dialog: MatDialog) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit() {
    this.loadRolesData(null);
  }

  public loadRolesData(event?:PageEvent){
    this.isLoading = true;
    let params:any;
    if(!event){
      params = { page: 1, per_page: 20 }
    }else{
      params = {
        page: event.pageIndex+1,
        per_page: event.pageSize
      };
    }

    params.query = this.searchQuery;

    this.rolesService.getRolesList(params).subscribe(
      response =>{
        if(response.error) {
          let errorMessage = response.error.message;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        } else {
          if(response.data.total > 0){
            this.dataSource = response.data.data;
            this.resultsLength = response.data.total;
          }else{
            this.dataSource = [];
            this.resultsLength = 0;
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
    return event;
  }

  applyFilter(){
    this.paginator.pageIndex = 0;
    this.loadRolesData(null);
  }

  openDialogForm(id:string = ''){
    const dialogRef = this.dialog.open(FormComponent, {
      width: '80%',
      data: {id: id}
    });

    dialogRef.afterClosed().subscribe(reponse => {
      if(reponse){
        this.applyFilter();
      }
    });
  }

  confirmDeletePermission(id:string = ''){
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      width: '500px',
      data: {dialogTitle:'Eliminar Permiso',dialogMessage:'Esta seguro de eliminar este permiso?',btnColor:'warn',btnText:'Eliminar'}
    });

    dialogRef.afterClosed().subscribe(reponse => {
      if(reponse){
        this.rolesService.deleteRole(id).subscribe(
          response => {
            console.log(response);
            this.loadRolesData(null);
          }
        );
      }
    });
  }

}
