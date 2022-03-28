export interface MovimientoData {
    //Valores planos
    id?:Number;
    folio?:string;
    direccion_movimiento?:string;
    estatus?:string;
    fecha_movimiento?:Date;
    documento_folio?:string;
    es_colectivo?:boolean;
    observaciones:string;
    total_claves?:Number;
    total_articulos?:Number;
    total_monto?:Number;
    referencia_folio?:string;
    referencia_fecha?:Date;
    cancelado?:boolean;
    fecha_cancelacion?:Date;
    motivo_cancelacion?:string;

    //Relacione a otros Objetos
    solicitud?: any;
    movimiento_hijo?:MovimientoData;
    movimiento_padre_id?:Number;
    movimiento_padre?:MovimientoData;

    //Valores con relaciones
    unidad_medica_id?:Number;
    unidad_medica?:any;
    almacen_id?:Number;
    almacen?:any;
    tipo_movimiento_id?:Number;
    tipo_movimiento?:any;
    turno_id?:Number;
    turno?:any;
    programa_id?:Number;
    programa?:any;
    proveedor_id?:Number;
    proveedor?:any;
    unidad_medica_movimiento_id?:Number;
    unidad_medica_movimiento?:any;
    almacen_movimiento_id?:Number;
    almacen_movimiento?:any;
    area_servicio_movimiento_id?:Number;
    area_servicio_movimiento?:any;
    paciente_id?:Number;
    paciente?:any;
    personal_medico_id?:Number;
    personal_medico?:any;
    creado_por_usuario_id?:Number;
    creado_por_usuario?:any;
    modificado_por_usuario_id?:Number;
    modificado_por_usuario?:any;
    concluido_por_usuario_id?:Number;
    concluido_por_usuario?:any;
    cancelado_por_usuario_id?:Number;
    cancelado_por_usuario?:any;
    eliminado_por_usuario_id?:Number;
    eliminado_por_usuario?:any;
  }