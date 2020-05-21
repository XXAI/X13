import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[formControlName][mascaraFecha]'
})
export class MascaraFechaDirective {

  constructor(public ngControl: NgControl) { }

  @HostListener('ngModelChange', ['$event'])
  onModelChange(event) {
    this.onInputChange(event, false);
  }

  @HostListener('keydown.backspace', ['$event'])
  keydownBackspace(event) {
    this.onInputChange(event.target.value, true);
  }

  @HostListener('blur')
  onblur() {
    let value = this.ngControl.value;
    if(value && value.length < 10){
      this.ngControl.reset();
    }
  }

  onInputChange(event, backspace) {
    if(event){
      let newVal = event.replace(/\D/g, '');

      /*if (backspace && newVal.length <= 6) {
        newVal = newVal.substring(0, newVal.length - 1);
      }*/

      if (newVal.length === 0) {
        newVal = '';
      } else if (newVal.length > 8) { 
        newVal = newVal.substring(0, 8);
        newVal = newVal.replace(/^(\d{0,4})(\d{0,2})(\d{0,2})/, '$1-$2-$3');
      } else if (newVal.length > 6) {
        newVal = newVal.replace(/^(\d{0,4})(\d{0,2})/, '$1-$2-');
      } else if (newVal.length > 4) {
        newVal = newVal.replace(/^(\d{0,4})/, '$1-');
      } 

      this.ngControl.valueAccessor.writeValue(newVal);
    }
  }
}
