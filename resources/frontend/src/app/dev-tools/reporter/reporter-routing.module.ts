import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MysqlReporterComponent } from './mysql-reporter/mysql-reporter.component';
import { AuthGuard } from '../../auth/auth.guard';


const routes: Routes = [
  { path: 'dev-tools/mysql-reportes', component: MysqlReporterComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReporterRoutingModule { }
