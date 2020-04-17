import { AbstractControl } from '@angular/forms';

export class CustomValidator {

    static notEqualToValidator(formControlName:string){
        return (control: AbstractControl): { [key:string]:any } | null =>{
            if(control.value != null){
                return control.value == control.parent.get(formControlName).value ? { notEqualTo:true } : null; 
            }
        };
    }

}
