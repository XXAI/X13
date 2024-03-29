import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { SharedService } from 'src/app/shared/shared.service';
import { UsersService } from '../users.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmPasswordDialogComponent } from '../confirm-password-dialog/confirm-password-dialog.component';
import { Observable, combineLatest, of, forkJoin } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from '../../auth/models/user';
import { AVATARS } from '../../avatars';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})

export class FormComponent implements OnInit {

  constructor(
    private sharedService: SharedService, 
    private usersService: UsersService,
    private authService: AuthService, 
    private route: ActivatedRoute, 
    private fb: FormBuilder,
    public dialog: MatDialog,
    public router: Router
  ) { }

  isLoading:boolean = false;
  hidePassword:boolean = true;

  authUser: User;
  
  usuario:any = {};

  usuarioForm = this.fb.group({
    'name': ['',Validators.required],
    'email': ['',[Validators.required, Validators.email]],
    'username': ['',[Validators.required, Validators.minLength(4)]],
    'password': ['',[Validators.minLength(6)]],
    'is_superuser': [false],
    'status':['OK'],
    'avatar': [''],
    'unidad_medica_asignada':[''],
    'unidad_medica_asignada_id':[''],
    'roles': [[]],
    'permissions': [[]],
    'groups': [[]],
    'programas': [[]]
  });

  listaEstatus:any[] = [
    {clave:'OK', descripcion:'Normal'},
    {clave:'BLCKD', descripcion:'Bloqueado'},
    {clave:'BAN', descripcion:'Baneado'},
  ];

  avatarList: any[] = [];

  //Para el filtro de Roles
  catalogRoles: any[] = [];
  listOfRoles$: Observable<any[]>;
  filterInputRoles: FormControl = new FormControl('');
  filterInputRoles$: Observable<string> = this.filterInputRoles.valueChanges.pipe(startWith(''));
  filteredRoles$: Observable<any[]>;
  selectedRolesControl:any = {};
  selectedRoles: any[] = [];
  selectedRolePermissions: any[] = [];
  assignedPermissions: any[] = [];
  deniedPermissions: any[] = [];
  selectedRoleChipId: number = 0;

  selectedAvatar:string = AVATARS[0].file;

  //Para el filtro de Permisos
  catalogPermissions: any[] = [];
  listOfPermissions$: Observable<any[]>;
  filterInputPermissions: FormControl = new FormControl('');
  filterInputPermissions$: Observable<string> = this.filterInputPermissions.valueChanges.pipe(startWith(''));
  filteredPermissions$: Observable<any[]>;
  selectedPermissions: any[] = [];

  //Para el filtro de Grupos
  assignedGroups: any[] = [];
  catalogGroups: any[] = [];
  listOfGroups$: Observable<any[]>;
  filterInputGroups: FormControl = new FormControl('');
  filterInputGroups$: Observable<string> = this.filterInputGroups.valueChanges.pipe(startWith(''));
  filteredGroups$: Observable<any[]>;
  selectedGroups: any[] = [];


  //Para el filtro de Programas
  assignedProgramas: any[] = [];
  catalogProgramas: any[] = [];
  listOfProgramas$: Observable<any[]>;
  filterInputProgramas: FormControl = new FormControl('');
  filterInputProgramas$: Observable<string> = this.filterInputProgramas.valueChanges.pipe(startWith(''));
  filteredProgramas$: Observable<any[]>;
  selectedProgramas: any[] = [];

  catalogos: any = {};
  filteredCatalogs:any = {};


  ngOnInit() {
    this.authUser = this.authService.getUserData();

    this.avatarList = AVATARS;

    let callRolesCatalog = this.usersService.getAllRoles();
    let callPermissionsCatalog = this.usersService.getAllPermissions();
    let callGroupsCatalog = this.usersService.getCatalogs();
    this.catalogos = this.usersService.getCatalogs();
    this.IniciarCatalogos(null);

    let httpCalls = [callRolesCatalog, callPermissionsCatalog, callGroupsCatalog];

    this.route.paramMap.subscribe(params => {
      if(params.get('id')){

        let id = params.get('id');

        let callUserData = this.usersService.getUser(id);

        //console.log("asd",callUserData);

        httpCalls.push(callUserData);
      }else{
        this.usuarioForm.get('password').setValidators([Validators.minLength(6), Validators.required]);
      }

      this.isLoading = true;

      //Calls: 0 => Roles, 1 => Permissions, 2 => User
      forkJoin(httpCalls).subscribe(
        results => {
          console.log(results);

          //Starts: Roles
          this.catalogRoles = results[0].data;
          this.listOfRoles$ = of(this.catalogRoles);
          this.filteredRoles$ = combineLatest(this.listOfRoles$,this.filterInputRoles$).pipe(
            map(
              ([roles,filterString]) => roles.filter(
                role => (role.name.toLowerCase().indexOf(filterString.toLowerCase()) !== -1)
              )
            )
          );
          //Ends: Roles

          //Starts: Permissions
          this.catalogPermissions = results[1].data;
          this.listOfPermissions$ = of(this.catalogPermissions);
          this.filteredPermissions$ = combineLatest(this.listOfPermissions$,this.filterInputPermissions$).pipe(
            map(
              ([permissions,filterString]) => permissions.filter(
                permission => (permission.description.toLowerCase().indexOf(filterString.toLowerCase()) !== -1) || (permission.group.toLowerCase().indexOf(filterString.toLowerCase()) !== -1)
              )
            )
          );
          //Ends: Permissions

          //Starts: Groups
          this.catalogGroups = results[2].data.grupos;
          this.listOfGroups$ = of(this.catalogGroups);
          this.filteredGroups$ = combineLatest([this.listOfGroups$,this.filterInputGroups$]).pipe(
            map(
              ([groups,filterString]) => groups.filter(
                group => (group.descripcion.toLowerCase().indexOf(filterString.toLowerCase()) !== -1)
              )
            )
          );
          //Ends: Groups

          //Starts: Groups
          this.catalogProgramas = results[2].data.programas;
          this.listOfProgramas$ = of(this.catalogProgramas);
          this.filteredProgramas$ = combineLatest([this.listOfProgramas$,this.filterInputProgramas$]).pipe(
            map(
              ([programs,filterString]) => programs.filter(
                program => (program.descripcion.toLowerCase().indexOf(filterString.toLowerCase()) !== -1)
              )
            )
          );
          //Ends: Groups

          //Starts: User
          if(results[3]){
            this.usuario = results[3];
            console.log("usuario", this.usuario);
            this.usuarioForm.patchValue(this.usuario);
            this.IniciarCatalogos(this.usuario.unidad_medica_asignada);

            this.selectedAvatar = this.usuario.avatar;
            //Load Roles
            for(let i in this.usuario.roles){
              let roleIndex = this.catalogRoles.findIndex(item => item.id == this.usuario.roles[i].id);
              this.selectRole(this.catalogRoles[roleIndex]);
            }

            this.selectedRoleChipId = 0;

            //Load Permissions
            for(let i in this.usuario.permissions){
              let permission = this.usuario.permissions[i];
              if(this.assignedPermissions[permission.id]){
                this.assignedPermissions[permission.id].active = (permission.pivot.status == 1);
              }else{
                this.assignedPermissions[permission.id] = {
                  active: (permission.pivot.status == 1)?true:false,
                  description: permission.description,
                  inRoles:[]
                }
                this.selectedPermissions.push(permission);
              }
            }

            //Load Groups
            for(let i in this.usuario.grupos){
              let group = this.usuario.grupos[i];
              this.selectedGroups.push(group);
              this.assignedGroups[group.id] = {
                active: true,
                description: group.descripcion
              };
            }

            //Load Programs
            for(let i in this.usuario.programas){
              let program = this.usuario.programas[i];
              this.selectedProgramas.push(program);
              this.assignedProgramas[program.id] = {
                active: true,
                description: program.descripcion
              };
            }
          }
          //Ends: User

          this.isLoading = false;
        }
      );
    }); 
  }

  removeRole(index){
    let role = this.selectedRoles[index];
    this.selectedRoles.splice(index,1);
    this.selectedRolesControl[role.id] = false;

    if(role.id == this.selectedRoleChipId){
      this.selectedRoleChipId = 0;
    }

    for(let i in role.permissions){
      let permission = role.permissions[i];
      let indexOfRole = this.assignedPermissions[permission.id].inRoles.indexOf(role.id);
      this.assignedPermissions[permission.id].inRoles.splice(indexOfRole,1);

      if(this.assignedPermissions[permission.id].inRoles.length <= 0){
        delete this.assignedPermissions[permission.id];
      }
    }
    //this.usuarioForm.get('roles').patchValue(this.selectedRoles);
  }

  selectRole(role){
    //Si el Rol no esta seleccionado
    if(!this.selectedRolesControl[role.id]){

      //Lo agregamos a la lista de Roles;
      this.selectedRoles.push(role);
      this.selectedRolesControl[role.id] = true; 
      
      //Agregamos los permisos del Rol a un arreglo global de permisos
      for(let i in role.permissions){
        let permission = role.permissions[i];
        
        if(!this.assignedPermissions[permission.id]){
          this.assignedPermissions[permission.id] = {
            active: true,
            description: permission.description,
            inRoles:[role.id]
          }
        }else{
          //Si el permiso ya esta asignado es probable que este asignado desde permisos individuales
          if(this.assignedPermissions[permission.id].inRoles.length <= 0){
            let permissionIndex = this.selectedPermissions.findIndex(item => item.id == permission.id); //Si encontramos el permiso en el arreglo de permisos individuales, lo quitamos
            if(permissionIndex >= 0){
              this.selectedPermissions.splice(permissionIndex,1);
            }
          }

          this.assignedPermissions[permission.id].inRoles.push(role.id);
        }
      }

      this.showPermissionsList(role);
      //this.usuarioForm.get('roles').patchValue(this.selectedRoles);
    }else{
      //Si el rol ya esta seleccionado, lo quitamos
      let roleIndex = this.selectedRoles.findIndex(item => item.id == role.id);
      this.removeRole(roleIndex);
    }
  }

  showPermissionsList(role){ 
    this.selectedRoleChipId = role.id; 
    this.selectedRolePermissions = [];

    for(let i in role.permissions){
      let permission = role.permissions[i];
      if(this.assignedPermissions[permission.id]){
        permission.active = this.assignedPermissions[permission.id].active;
        permission.disabled = !(this.assignedPermissions[permission.id].inRoles.length > 0);
      }else{
        permission.active = false;
        permission.disabled = true;
      }
      
      this.selectedRolePermissions.push(permission);
    }
  }

  changePermissionStatus(permission){
    this.assignedPermissions[permission.id].active = !this.assignedPermissions[permission.id].active;
  }

  removePermission(index){
    let permission = this.selectedPermissions[index];
    if(this.assignedPermissions[permission.id].inRoles.length <= 0){
      if(this.assignedPermissions[permission.id].active){
        delete this.assignedPermissions[permission.id];
      }else{
        this.assignedPermissions[permission.id].active = !this.assignedPermissions[permission.id].active;
      }
    }else{
      this.assignedPermissions[permission.id].active = !this.assignedPermissions[permission.id].active;
    }

    if(!this.assignedPermissions[permission.id] || !this.assignedPermissions[permission.id].active){
      this.selectedPermissions.splice(index,1);
    }
  }

  selectPermission(permission){
    if(this.assignedPermissions[permission.id]){
      let permissionIndex = this.selectedPermissions.findIndex(item => item.id == permission.id);
      this.removePermission(permissionIndex);
    }else{
      this.selectedPermissions.push(permission);
      this.assignedPermissions[permission.id] = {
        active: true,
        description: permission.description,
        inRoles:[]
      };
    }
    //console.log(this.assignedPermissions);
  }

  clearGroupsFilter(){
    this.filterInputGroups.setValue('');
  }

  selectGroup(group){
    if(this.assignedGroups[group.id]){
      let groupIndex = this.selectedGroups.findIndex(item => item.id == group.id);
      this.removeGroup(groupIndex);
    }else{
      this.selectedGroups.push(group);
      this.assignedGroups[group.id] = {
        active: true,
        description: group.descripcion
      };
    }
  }

  removeGroup(index){
    let group = this.selectedGroups[index];

    if(this.assignedGroups[group.id]){
      this.selectedGroups.splice(index,1);
      this.assignedGroups[group.id] = null;
    }
  }

  selectPrograma(program){
    if(this.assignedProgramas[program.id]){
      let programIndex = this.selectedProgramas.findIndex(item => item.id == program.id);
      this.removeProgramas(programIndex);
    }else{
      this.selectedProgramas.push(program);
      this.assignedProgramas[program.id] = {
        active: true,
        description: program.descripcion
      };
    }
  }

  removeProgramas(index){
    let programa = this.selectedProgramas[index];

    if(this.assignedProgramas[programa.id]){
      this.selectedProgramas.splice(index,1);
      this.assignedProgramas[programa.id] = null;
    }
  }

  clearProgramasFilter(){
    this.filterInputProgramas.setValue('');
  }

  public IniciarCatalogos(obj:any)
  {

    this.isLoading = true;    
    
    // let carga_catalogos = [
    //   {nombre:'unidades_medicas',orden:'id'},
    // ];

    this.usersService.getCatalogs().subscribe(
      response => {

        this.catalogos = response.data;
        this.filteredCatalogs['unidades_medicas'] = this.usuarioForm.get('unidad_medica_asignada').valueChanges.pipe(startWith(''),map(value => this._filter(value,'unidades_medicas','nombre')));

        if(obj){
            this.usuarioForm.get('unidad_medica_asignada').setValue(obj);
        }
        this.isLoading = false; 

      } 
    );

  }

  private _filter(value: any, catalog: string, valueField: string): string[] {
    if(this.catalogos[catalog]){
      let filterValue = '';
      if(value){
        console.log(value);
        if(typeof(value) == 'string'){
          filterValue = value.toLowerCase();
        }else{
          filterValue = value[valueField].toLowerCase();
        }
      }
      return this.catalogos[catalog].filter(option => option[valueField].toLowerCase().includes(filterValue));
    }
  }

  
  getDisplayFn(label: string){
    return (val) => this.displayFn(val,label);
  }

  displayFn(value: any, valueLabel: string){
    return value ? value[valueLabel] : value;
  }


  accionGuardar(){
    if(this.usuarioForm.valid){
      if(this.usuarioForm.get('password').value){
        this.confirmarContrasenia();
      }else{
        this.guardarUsuario();
      }
    }
  }

  confirmarContrasenia():void {
    const dialogRef = this.dialog.open(ConfirmPasswordDialogComponent, {
      width: '500px',
      data: {password: this.usuarioForm.get('password').value}
    });

    dialogRef.afterClosed().subscribe(validPassword => {
      if(validPassword){
        this.guardarUsuario();
      }
    });
  }

  guardarUsuario(){
    this.isLoading = true;

    let roles = [];
    let permissions = {};

    for(let id in this.assignedPermissions){
      let permission = this.assignedPermissions[id];

      if(permission.inRoles.length <= 0 || (permission.inRoles.length > 0 && !permission.active)){
        permissions[id]={status:permission.active};
      }
      
      if(permission.inRoles.length > 0){
        for(let i in permission.inRoles){
          if(roles.indexOf(permission.inRoles[i]) < 0){
            roles.push(permission.inRoles[i]);
          }
        }
      }
    }

    let groups = [];
    for(let i in this.assignedGroups){
      if(this.assignedGroups[i]){
        groups.push(+i);
      }
    }

    let programs = [];
    for(let i in this.assignedProgramas){
      if(this.assignedProgramas[i]){
        programs.push(+i);
      }
    }

    this.usuarioForm.get('permissions').patchValue(permissions);
    this.usuarioForm.get('roles').patchValue(roles);
    this.usuarioForm.get('groups').patchValue(groups);
    this.usuarioForm.get('programas').patchValue(programs);

    this.usuarioForm.get('avatar').patchValue(this.selectedAvatar);

    if(this.usuario.id){
      this.usersService.updateUser(this.usuarioForm.value,this.usuario.id).subscribe(
        response=>{
          if(response.guardado){
            this.sharedService.showSnackBar('Datos guardados con éxito', null, 3000);
            this.router.navigate(['/usuarios']);
            if(this.authUser.id == response.usuario.id){
              this.authService.updateUserData(response.usuario);
            }
          }
          this.isLoading = false;
        },
        responseError => {
          console.log(responseError);
          var errorMessage = responseError.error.mensaje;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
          this.isLoading = false;
        }
      );
    }else{
      this.usersService.createUser(this.usuarioForm.value).subscribe(
        response =>{
          console.log(response);
          this.sharedService.showSnackBar('Datos guardados con éxito', null, 3000);
          this.router.navigate(['/usuarios']);
          this.usuario = response.data;
          this.isLoading = false;
        },
        responseError => {
          console.log(responseError);
          var errorMessage = responseError.error.mensaje;
          this.sharedService.showSnackBar(errorMessage, null, 3000);
          this.isLoading = false;
        }
      );
    }
  }

  clearRolesFilter(){
    this.filterInputRoles.setValue('');
  }
  clearPermissionsFilter(){
    this.filterInputPermissions.setValue('');
  }
}