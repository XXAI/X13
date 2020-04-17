import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Directive({
  selector: '[ifHasPermission]'
})
export class IfHasPermissionDirective implements OnInit{

  @Input() ifHasPermission: string;

  constructor(
    private elementRef: ElementRef<any>,
    private authService: AuthService
  ) {}

  ngOnInit() {
    let permission = `${this.ifHasPermission}`;
    let userPermissions = JSON.parse(localStorage.getItem('permissions'));

    if (!this.authService.isAuth() || !userPermissions[permission]) {
      //this.elementRef.nativeElement.style.display = 'none';
      this.elementRef.nativeElement.remove();
    }
  }

}
