import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { MovimientoStock } from './stock';
import { CollectionViewer } from '@angular/cdk/collections';
import { catchError, finalize } from 'rxjs/operators';
import { ExistenciasService } from './existencias.service';

export class MovimientosStockDataSource implements DataSource<MovimientoStock> {
    
    private dataSubject = new BehaviorSubject<MovimientoStock[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();
    public length:number = 0;
    constructor(private apiService: ExistenciasService){}

    connect(collectionViewer: CollectionViewer):Observable<MovimientoStock[]>{
        return this.dataSubject.asObservable();
    }

    disconnect( collectionViewer: CollectionViewer){
        this.dataSubject.complete();
        this.loadingSubject.complete();
    }

    loadData(stock_id, filter = '', sortDirection = 'asc', orderBy ='', pageIndex = 0, pageSize = 3){
       
        this.loadingSubject.next(true);
        this.apiService.buscarMovimiento(stock_id,filter, sortDirection, orderBy, pageIndex + 1, pageSize)
        .pipe(
            catchError(()=> of ([])),
            finalize( () => this.loadingSubject.next(false) )
        ).subscribe((response) => { this.length = response.total; this.dataSubject.next(response.data)});
    }
}