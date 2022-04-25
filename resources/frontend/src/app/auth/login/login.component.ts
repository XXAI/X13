import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SharedService } from 'src/app/shared/shared.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @ViewChild('password') password!: ElementRef;
  @ViewChild('username') username!: ElementRef;

  constructor(private router: Router, private sharedService: SharedService, private authService: AuthService) { }

  loginForm: FormGroup;
  isLoading:boolean = false;

  avatarPlaceholder = 'assets/profile-icon.svg';

  errorMessage:string;
  errorIcon:string;

  ngOnInit() {
    this.loginForm = new FormGroup({
      usuario: new FormControl('',{ validators: [Validators.required] }),
      password: new FormControl('', { validators: [Validators.required] })
    });

    setTimeout(() => {
      if(this.username){
        this.username.nativeElement.focus();
      }
    }, 10);
  }

  onSubmit(){
    this.isLoading = true;
    this.errorMessage = '';
    this.errorIcon = 'default';
    this.authService.logIn(this.loginForm.value.usuario, this.loginForm.value.password ).subscribe(
      response => {
        //this.isLoading = false;
        console.log('resto');
        console.log(response);

        let loginHistory:any = {};
        if(localStorage.getItem('loginHistory')){
          loginHistory = JSON.parse(localStorage.getItem('loginHistory'));
        }
        loginHistory[response.user_data.username] = response.user_data.avatar;
        localStorage.setItem('loginHistory',JSON.stringify(loginHistory));

        this.router.navigate(['/apps']);
      }, responseError => {
        console.log(responseError);
        var errorMessage = "Error: Credenciales inválidas.";
        if(responseError.status != 401){
          errorMessage = "Ocurrió un error.";
          this.sharedService.showSnackBar(errorMessage, null, 3000);
        }else{
          if(responseError.error.status){
            this.errorIcon = responseError.error.status;
          }
          this.errorMessage = responseError.error.error;
        }
        if(this.password){
          this.password.nativeElement.focus();
        }
        this.loginForm.get('password').patchValue('');
        this.loginForm.get('password').markAsUntouched();
        this.isLoading = false;
      }
    );
  }

  checkAvatar(username){
    this.avatarPlaceholder = 'assets/profile-icon.svg';

    if(localStorage.getItem('loginHistory')){
      let loginHistory = JSON.parse(localStorage.getItem('loginHistory'));
      
      if(loginHistory[username]){
        this.avatarPlaceholder = loginHistory[username];
      }
    }
  }

}
