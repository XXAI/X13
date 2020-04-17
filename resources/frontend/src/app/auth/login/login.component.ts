import { Component, OnInit } from '@angular/core';
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
  loginForm: FormGroup;
  isLoading:boolean = false;

  avatarPlaceholder = 'assets/profile-icon.svg';

  constructor(private router: Router, private sharedService: SharedService, private authService: AuthService) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      usuario: new FormControl('',{ validators: [Validators.required] }),
      password: new FormControl('', { validators: [Validators.required] })
    });
  }

  onSubmit(){
    this.isLoading = true;
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
      }, error => {
        console.log(error);
        var errorMessage = "Error: Credenciales inválidas.";
        if(error.status != 401){
          errorMessage = "Ocurrió un error.";
        }
        this.sharedService.showSnackBar(errorMessage, null, 3000);
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
