import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CollectionViewer } from '@angular/cdk/collections';
import { catchError, finalize } from 'rxjs/operators';
import { ExistenciasService } from './existencias.service';

export class MovimientosStockDataSource implements DataSource<any> {
    
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

    loadData(articulo_id, filter = '', sortDirection = 'asc', orderBy ='', pageIndex = 0, pageSize = 3){
        this.loadingSubject.next(true);

        let params: any = {
            sortOrder: sortDirection,
            orderBy: orderBy,
            page: pageIndex,
            pageSize: pageSize
        }

        this.apiService.buscarMovimiento(articulo_id,params)
        .pipe(
            catchError(()=> of ([])),
            finalize( () => this.loadingSubject.next(false) )
        ).subscribe((response) => { this.length = response.total; this.dataSubject.next(response.data)});
    }
}