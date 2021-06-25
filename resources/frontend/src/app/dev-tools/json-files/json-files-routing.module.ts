import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../auth/auth.guard';
import { JsonExcelComponent } from './json-excel/json-excel.component';

const routes: Routes = [
  { path: 'dev-tools/json-excel', component: JsonExcelComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JsonFilesRoutingModule { }
