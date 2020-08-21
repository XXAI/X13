import { AbstractControl } from '@angular/forms';

export class CustomValidator {

    static notEqualToValidator(formControlName:string){
        return (control: AbstractControl): { [key:string]:any } | null =>{
            if(control.value != null){
                return control.value == control.parent.get(formControlName).value ? { notEqualTo:true } : null; 
            }
        };
    }

    static isValidDate(format = "YYYY-MM-dd"){
        return (control: AbstractControl): { [key:string]:any } | null =>{
            if(control.value != null && control.value.length >= 10){
                //let date = new Date(control.value.substring(0,4),(control.value.substring(5,7)-1), control.value.substring(8,10),12,0,0,0);
                let value = control.value.substring(0,10) + 'T00:00:00';
                let date = new Date(value);
                
                return date.toString() == 'Invalid Date' ? { isValidDate:true } : null; 
            }
        };
    }
}
