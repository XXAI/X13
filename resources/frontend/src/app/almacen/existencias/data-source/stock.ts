export interface Stock {
    id:Number;
    almacen_id?:Number; 
    programa_id?:Number;

    insumo_medico_id?:Number;  
    clave?:string;
    tipo_isumo?:string;
    descripcion?:string;
    
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
    insumo_medico_id?:Number;
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