export interface Stock {
    id:Number;
    almacen_id?:Number; 
    programa_id?:Number;

    bienes_servicios_id?:Number;  
    clave?:string;
    tipo_isumo?:string;
    articulo?:string;
    
    caducado?:boolean;
       
    marca_id?:Number;
    lote?:string;
    fecha_caducidad?:Date;
    codigo_barras?:string;
    existencia?:Number;
    existencia_unidosis?:Number;
    user_id?:string;
  }
//No se si voy a usar este todavia
  export interface StockItem {
    id:Number;
    almacen_id?:Number;
    bienes_servicios_id?:Number;
    programa_id?:Number;
    marca_id?:Number;
    lote?:string;
    fecha_caducidad?:Date;
    codigo_barras?:string;
    existencia?:Number;
    existencia_unidosis?:Number;
    user_id?:string;
  }

  export interface MovimientoStock {
    movimiento_id:Number;
    folio?:string;
    estatus?:string;
    direccion_movimiento?:string;
    fecha_movimiento?:Date;
    cantidad?:Number; 
    user_id?:string;
    user?:string;
  }