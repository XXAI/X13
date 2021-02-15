import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Stock } from './stock';
import { CollectionViewer } from '@angular/cdk/collections';
import { catchError, finalize } from 'rxjs/operators';
import { ExistenciasService } from './existencias.service';

export class ExistenciasDataSource implements DataSource<Stock> {
    
    private dataSubject = new BehaviorSubject<Stock[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();
    public length:number = 0;
    constructor(private apiService: ExistenciasService){}

    connect(collectionViewer: CollectionViewer):Observable<Stock[]>{
        return this.dataSubject.asObservable();
    }

    disconnect( collectionViewer: CollectionViewer){
        this.dataSubject.complete();
        this.loadingSubject.complete();
    }

    loadData(filter = '', sortDirection = 'asc', orderBy ='', pageIndex = 0, pageSize = 3){
       
        this.loadingSubject.next(true);
        this.apiService.buscar(filter, sortDirection, orderBy, pageIndex + 1, pageSize)
        .pipe(
            catchError(()=> of ([])),
            finalize( () => this.loadingSubject.next(false) )
        ).subscribe((response) => { this.length = response.total; this.dataSubject.next(response.data)});
    }
}