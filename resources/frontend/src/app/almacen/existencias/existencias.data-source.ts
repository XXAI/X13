import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable, of } from 'rxjs';
//import { Stock } from './stock';
import { CollectionViewer } from '@angular/cdk/collections';
import { catchError, finalize, groupBy } from 'rxjs/operators';
import { ExistenciasService } from './existencias.service';

export class ExistenciasDataSource implements DataSource<any> {
    
    private dataSubject = new BehaviorSubject<any[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();
    public length:number = 0;
    constructor(private apiService: ExistenciasService){}

    connect(collectionViewer: CollectionViewer):Observable<any[]>{
        return this.dataSubject.asObservable();
    }

    disconnect( collectionViewer: CollectionViewer){
        this.dataSubject.complete();
        this.loadingSubject.complete();
    }

    loadData(filter = {}, sortDirection = 'asc', orderBy ='', groupBy='', pageIndex = 0, pageSize = 20){
        this.loadingSubject.next(true);

        let params: any = {
            sortOrder: sortDirection,
            orderBy: orderBy,
            groupBy: groupBy,
            page: pageIndex,
            pageSize: pageSize
        }

        Object.keys(filter).forEach( prop => {
            params[prop] = filter[prop];
        });

        this.apiService.obtenerExistencias(params)
        .pipe(
            catchError(()=> of ([])),
            finalize( () => this.loadingSubject.next(false) )
        ).subscribe((response) => { this.length = response.total; this.dataSubject.next(response.data)});
    }
}