import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { RolesService } from '../roles.service';
import { CustomValidator } from '../../../utils/classes/custom-validator';
import { PermissionsService } from '../../permissions/permissions.service';
import { Observable, combineLatest, of } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

export interface FormDialogData {
  id: number;
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  constructor(
    private rolesService: RolesService,
    private permissionsService: PermissionsService,
    public dialogRef: MatDialogRef<FormComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: FormDialogData
  ) {}
  
  
  isLoading:boolean = false;
  rol:any = {};
  
  catalogPermissions: any[] = [];
  listOfPermissions$: Observable<any[]>;
  filterInput: FormControl = new FormControl('');
  filterInput$: Observable<string> = this.filterInput.valueChanges.pipe(startWith(''));
  filteredPermissions$: Observable<any[]>;
  
  selectedPermissions: any[] = [];
  selectedItems: any = {};


  rolForm = this.fb.group({
    'name': ['',[Validators.required]],
    'permissions': [[],[Validators.required]]
  });

  ngOnInit() {

    this.permissionsService.getAllPermissions().subscribe(
      response => {
        this.catalogPermissions = response.data;

        this.listOfPermissions$ = of(this.catalogPermissions);

        this.filteredPermissions$ = combineLatest(this.listOfPermissions$,this.filterInput$).pipe(
          map(
            ([permissions,filterString]) => permissions.filter(
              permission => (permission.description.toLowerCase().indexOf(filterString.toLocaleLowerCase()) !== -1) || (permission.group.toLowerCase().indexOf(filterString.toLocaleLowerCase()) !== -1)
            )
          )
        );
      }
    );
    
    let id = this.data.id;
    if(id){
      this.isLoading = true;
      this.rolesService.getRole(id).subscribe(
        response => {
          this.rol = response.data;
          this.rolForm.patchValue(this.rol);
          this.selectedPermissions = this.rol.permissions;
          for(let i in this.selectedPermissions){
            this.selectedItems[this.selectedPermissions[i].id] = true;
          }
          this.isLoading = false;
        }
      );
    }
  }

  clearPermissionSearch(){
    this.filterInput.setValue('')
  }

  removePermission(index){
    let permission = this.selectedPermissions[index];
    this.selectedPermissions.splice(index,1);
    this.selectedItems[permission.id] = false;
    this.rolForm.get('permissions').patchValue(this.selectedPermissions);
  }

  selectPermission(permission){
    if(!this.selectedItems[permission.id]){
      this.selectedPermissions.push(permission);
      this.selectedItems[permission.id] = true; 
      this.rolForm.get('permissions').patchValue(this.selectedPermissions);
    }else{
      let permissionIndex = this.selectedPermissions.findIndex(item => item.id == permission.id);
      this.removePermission(permissionIndex);
    }
  }

  saveRole(){
    this.isLoading = true;
    if(this.rol.id){
      this.rolesService.updateRole(this.rol.id,this.rolForm.value).subscribe(
        response =>{
          this.dialogRef.close(true);
          console.log(response);
          this.isLoading = false;
        },
        errorResponse => {
          console.log(errorResponse);
          this.isLoading = false;
      });
    }else{
      this.rolesService.createRole(this.rolForm.value).subscribe(
        response =>{
          this.dialogRef.close(true);
          console.log(response);
          this.isLoading = false;
      },
        errorResponse => {
          console.log(errorResponse);
          this.isLoading = false;
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
