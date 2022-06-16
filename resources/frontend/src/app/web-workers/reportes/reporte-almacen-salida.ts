import { LOGOS } from "../../logos";
export class ReporteAlmacenSalida{

    getDocumentDefinition(reportData:any) {
        let catalogo_meses = {
            1: 'Enero',
            2: 'Febrero',
            3: 'Marzo',
            4: 'Abril',
            5: 'Mayo',
            6: 'Junio',
            7: 'Julio',
            8: 'Agosto',
            9: 'Septiembre',
            10: 'Octubre',
            11: 'Noviembre',
            12: 'Diciembre',
        };
        let contadorLineasHorizontalesV = 0;
        //let fecha_hoy =  Date.now();
        let fecha_hoy =  new Intl.DateTimeFormat('es-ES', {year: 'numeric', month: 'long', day: '2-digit'}).format(new Date());
        let datos: any = {
          pageOrientation: 'portrait',
          pageSize: 'LETTER',
          pageMargins: [ 40, 60, 40, 60 ],
          header: {
            margin: [30, 20, 30, 0],
            columns: [
                {
                    image: LOGOS[0].LOGO_FEDERAL,
                    width: 80
                },
                {
                    margin: [10, 0, 0, 0],
                    text: 'SECRETARÍA DE SALUD\n SALIDA DE ALMACÉN\n',
                    bold: true,
                    fontSize: 12,
                    alignment: 'center'
                },
                {
                  image: LOGOS[1].LOGO_ESTATAL,
                  width: 60
              }
            ]
          },
          
          footer: function(currentPage, pageCount) {
            return {
              margin: [30, 20, 30, 0],
              columns: [
                  {
                      text: salida.almacen?.direccion,
                      alignment:'left',
                      fontSize: 6,
                  },
                  {
                      margin: [10, 0, 0, 0],
                      text: 'Página ' + currentPage.toString() + ' de ' + pageCount,
                      fontSize: 6,
                      alignment: 'center'
                  },
                  {
                    text:fecha_hoy.toString(),
                    alignment:'right',
                    fontSize: 6,
                }
              ]
            }
          },
          content: [],
          styles: {
            cabecera: {
              fontSize: 5,
              bold: true,
              fillColor:"#890000",
              color: "white",
              alignment:"center"
            },
            subcabecera:{
              fontSize: 8,
              bold:true,
              fillColor:"#DEDEDE",
              alignment:"right"
            },
            pedido_title:{
              alignment:"right",
              fillColor:"#DEDEDE",
              fontSize: 6,
              bold:true
            },
            pedido_datos:{
              fontSize: 6
            },
            tabla_datos:{
              fontSize: 6
            },
            tabla_datos_center:{
              fontSize: 6,
              alignment: "center"
            },
            tabla_datos_right:{
              fontSize: 6,
              alignment: "right"
            },
            salida_title:{
              alignment:"right",
              fillColor:"#DEDEDE",
              fontSize: 6,
              bold:true
            },
            salida_title_center:{
              alignment:"center",
              fillColor:"#DEDEDE",
              fontSize: 6,
              bold:true
            },
            salida_datos:{
              fontSize: 6
            },
            datos_encabezado_izquierda:{
              fontSize: 8,
              color:"black",
            },
            tabla_encabezado_firmas:
            {
              fontSize: 8,
              alignment:"center",
              bold:true
            },
            tabla_encabezado_datos:{
              fontSize: 8,
              alignment:"center",
            },
            marca_de_agua:{
              color: 'black',
              opacity: 0.3,
              bold: true,
              italics: true,
              fontSize: 55,
              alignment:"center",
            }
          }
        };


        let salida = reportData.items;
        let total_salida = parseFloat(salida.total_monto);
        let fecha_salida  =  new Intl.DateTimeFormat('es-ES', {year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date(salida.fecha_movimiento+'T12:00:00'));

        let fecha_referencia = '';
        if(salida.referencia_fecha){
          fecha_referencia =  new Intl.DateTimeFormat('es-ES', {year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date(salida.referencia_fecha+'T12:00:00'));
        }

        function numberFormat(num,prices:boolean = false) {
          //return '$' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
          var str = num.toString().split(".");
          str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          if(prices){
            return '$ ' +str.join(".");
          }else{
            return str.join(".");
          }
        }

        let monto_total = numberFormat(total_salida);
        let IVA = parseFloat((salida?.iva)?salida?.iva:0.00);

        //Checar destino:
        if(salida.almacen_movimiento_id){
          salida.destino = salida.almacen_movimiento.nombre;
        }else if(salida.unidad_medica_movimiento_id){
          salida.destino = salida.unidad_medica_movimiento.nombre;
        }else if(salida.area_servicio_movimiento_id){
          salida.destino = salida.area_servicio_movimiento.descripcion;
        }else if(salida.tipo_movimiento?.clave == 'RCTA'){
          salida.destino = 'Receta';
          if(salida.solicitud && salida.solicitud.tipo_uso){
            salida.destino += ' ( ' + salida.solicitud.tipo_uso.descripcion + ')';
          }
        }else{
          salida.destino = 'Sin Destino Indicado';
        }

        datos.content.push({
          table: {
            margin: [0,0,0,0],
            widths: [ 60, '*', 70, '*', 70, 155],
            body: [
              [
                {text: salida.tipo_movimiento?.descripcion + ' ' + ((salida.solicitud)?'[ '+salida.solicitud.tipo_solicitud.descripcion+' ]':''), colSpan: 6, style:'salida_title_center'},
                {text: ""},
                {text: ""},
                {text: ""},
                {text: ""},
                {text: ""},
              ],
              [
                {text: "Unidad:",                               style: "salida_title"},
                {text: salida.unidad_medica?.nombre+' [ '+salida.unidad_medica?.clues+' ]',           style: "salida_datos", colSpan: 5 },
                {text: ""},
                {text: ""},
                {text: ""},
                {text: ""},
              ],
              [
                {text: "Almacen:",                              style: "salida_title"},
                {text: salida.almacen?.nombre,                 style: "salida_datos", colSpan: 3 },
                {text: ""},
                {text: ""},
                {text: "Folio salida:",                        style: "salida_title"},
                {text: salida.folio||'Sin Folio',              style: "salida_datos"},
              ],
              [
                {text: "Destino:",                               style: "salida_title"},
                {text: salida.destino,                          style: "salida_datos", colSpan: 3 },
                {text: ""},
                {text: ""},
                {text: "Folio Documento:",                      style: "salida_title"},
                {text: salida.documento_folio,                 style: "salida_datos"},
              ],
              [
                {text: "Personal:",                             style: "salida_title"},
                {text: salida.personal_medico?.nombre_completo,                style: "salida_datos", colSpan: 3 },
                {text: ""},
                {text: ""},
                {text: "Turno:",                                style: "salida_title"},
                {text: salida.turno?.nombre,                   style: "salida_datos"},
              ],
              [
                {text: "Paciente:",                        style: "salida_title" },
                {text: salida.paciente?.nombre_completo,   style: "salida_datos", colSpan: 3 },
                {text: ""},
                {text: ""},
                {text: "Fecha salida:",                        style: "salida_title" },
                {text: fecha_salida,                           style: "salida_datos" },
              ],
              [
                {text: "Observaciones:",                        style: "salida_title"},
                {text: salida.observaciones,                   style: "salida_datos", colSpan: 5 },
                {text: ""},
                {text: ""},
                {text: ""},
                {text: ""},
              ],
              // [
              //   {text: "Unidad Medica:",                                                        style: "salida_title"},
              //   {text:"",                                                                       style: "salida_datos", colSpan: 3 },
              //   {text: ""},
              //   {text: ""},
              //   {text: "Total Claves:",                                                         style: "salida_title"},
              //   {text: salida.total_claves,                                                    style: "salida_datos"},
              // ],
              [
                {text:'', colSpan:6, border: [false, false, false, false]}
              ]
            ]
          }
        });

        let encabezado_lista = [
            {text: "#",                       style: 'cabecera'},
            {text: "CLAVE",                   style: 'cabecera'},
            {text: "PRODUCTO",                style: 'cabecera'},
            {text: "DETALLES",                style: 'cabecera'},
            {text: "LOTE - FECHA CADUCIDAD",  style: 'cabecera'},
            {text: "CANTIDAD",                style: 'cabecera'},
        ];

        if(reportData.config.mostrar_montos){
          encabezado_lista.push({text: "PRECIO UNITARIO",     style: 'cabecera'});
          encabezado_lista.push({text: "IMPORTE",             style: 'cabecera'});
        }

        let table_widths = [10, 63, '*', 50, 45, 50];
        if(reportData.config.mostrar_montos){
          table_widths = [10, 20, 35, 45, 63, '*', 50, 50];
        }

        datos.content.push({
          table: {
            headerRows:1,
            dontBreakRows: true,
            keepWithHeaderRows: 1,
            widths: table_widths,
            margin: [0,0,0,0],
            body: [encabezado_lista]
          }
        });

        let total_articulos = 0;
        let tabla_articulos = [];
        let watermark = '';

        switch (salida.estatus) {
          case 'FIN':
            tabla_articulos = salida.lista_articulos;
              break;
          case 'PERE':
            tabla_articulos = salida.lista_articulos;
            watermark = 'PENDIENTE RECEPCIÓN';
              break;
          case 'BOR':
            tabla_articulos = salida.lista_articulos_borrador;
            watermark = 'BORRADOR';
              break;
          case 'CAN':
            tabla_articulos = salida.lista_articulos;
            watermark = 'CANCELADO';
              break;
          default:0
        }

        if(watermark){
          datos.watermark = { text: watermark, opacity: 0.3, bold: true, italics: true };
        }
        
        let conteo_real = 1;
        let se_agrego_lote:boolean = false;
        for(let i = 0; i < tabla_articulos.length; i++){
          let item  = tabla_articulos[i];
          
          //if(item.cantidad_solicitado > 0){
            se_agrego_lote = false;
            let stocks = [];
            if(item.stocks){
              stocks = item.stocks;
            }else if(!item.stocks && item.stock){
              stocks.push(item.stock);
            }

            for(let j = 0; j < stocks.length; j++){
              let stock = stocks[j];
              let stock_cantidad = 0;
              if(stock.cantidad){
                stock_cantidad = parseInt(stock.cantidad);
              }else{
                stock_cantidad = parseInt(item.cantidad);
              }

              //if(stock_cantidad > 0){
                let articulo = (typeof item.articulo == 'object')?item.articulo:item;
  
                let fecha_caducidad = (stock?.fecha_caducidad)?stock?.fecha_caducidad:'S/F/C';
              
                let detalle = 'Por pieza\n';
                if(item.modo_movimiento == 'NRM'){
                  detalle = (stock?.empaque_detalle)?stock.empaque_detalle.descripcion:'Sin detalles';
                }else{
                  detalle += ' ( ' + ((stock?.empaque_detalle)?stock.empaque_detalle.unidad_medida.descripcion:'Sin detalles') + ' )';
                }
                let lote = (stock?.lote)?stock.lote:'S/L';

                let item_pdf = [
                  { text: (conteo_real++),                                                style: 'tabla_datos_center'},
                  { text: (articulo.clave_cubs)?articulo.clave_cubs:articulo.clave_local, style: 'tabla_datos'},
                  { text: articulo.especificaciones,                                      style: 'tabla_datos'},
                  { text: detalle,                                                        style: 'tabla_datos_center'},
                  { text: lote + '\n' +fecha_caducidad,                                   style: 'tabla_datos_center'},
                  { text: numberFormat(stock_cantidad||0),                                style: 'tabla_datos_center'},
                ];
  
                if(reportData.config.mostrar_montos){
                  item_pdf.push({ text: numberFormat(parseFloat(item.precio_unitario)), style: 'tabla_datos_right'});
                  item_pdf.push({ text: numberFormat(parseFloat(item.total_monto)),     style: 'tabla_datos_right'});
                }
  
                datos.content[1].table.body.push(item_pdf);
                total_articulos += stock_cantidad;
                se_agrego_lote = true;
              //}
            }

            /*if(stocks.length == 0){
              let articulo = (typeof item.articulo == 'object')?item.articulo:item;
              let item_pdf = [
                { text: (conteo_real++),                                                style: 'tabla_datos_center'},
                { text: (articulo.clave_cubs)?articulo.clave_cubs:articulo.clave_local, style: 'tabla_datos'},
                { text: articulo.especificaciones,                                      style: 'tabla_datos'},
                { text: '---',                                                          style: 'tabla_datos_center'},
                { text: '---',                                                          style: 'tabla_datos_center'},
                { text: numberFormat(0),                                                style: 'tabla_datos_center'},
              ];
              datos.content[1].table.body.push(item_pdf);
            }*/
          //}
        }

        let base_footer = [
          { text: '', colSpan: 3, border: [false, false, false, false,]},
          { text: ''},
          { text: ''},
        ];

        if(reportData.config.mostrar_montos){
          base_footer = [
            { text: '', colSpan: 6, border: [false, false, false, false,]},
            { text: ''},
            { text: ''},
            { text: ''},
            { text: ''},
            { text: ''},
          ];
        }

        if(reportData.config.mostrar_montos){
          let sub_total = [{text: 'Subtotal:', style: 'subcabecera'},{text: monto_total, style: 'tabla_datos_right'}];
          datos.content[1].table.body.push(base_footer.concat(sub_total));

          let total_iva = [{text: 'IVA:', style:'subcabecera'}, {text: 'IVA', style: 'tabla_datos_right'}];
          datos.content[1].table.body.push(base_footer.concat(total_iva));

          let total = [{ text: 'Total:',        style: 'subcabecera'}, { text: monto_total + IVA,   style: 'tabla_datos_right'}];
          datos.content[1].table.body.push(base_footer.concat(total));
        }else{
          console.log('este es el total: ',total_articulos);
          let total:any[] = [{ text: 'Total Articulos:', style: 'subcabecera', colSpan:2}, { text: ''}, { text: numberFormat(total_articulos),   style: 'tabla_datos_center'}];
          datos.content[1].table.body.push(base_footer.concat(total));
        }
        
        if(reportData.config.firmas){
          let firmas = reportData.config.firmas;
          let firmas_etiquetas:any[] = [];
          let firmas_nombres:any[] = [];
          let firmas_widths:string[] = [];
          let firmas_spaces:any[] = [];

          firmas.forEach(element => {
            firmas_etiquetas.push({
              text: element.etiqueta,
              style: "tabla_encabezado_firmas"
            });
            
            firmas_nombres.push({
              text:  element.nombre + '\n' + element.cargo, 
              style: "tabla_encabezado_datos"
            });

            firmas_spaces.push({text:''});
            firmas_widths.push('*');
          });

          datos.content.push({
            layout: 'noBorders',
            table: {
              widths: firmas_widths,
              margin: [0,0,0,0],
              body: [
                firmas_spaces,
                firmas_etiquetas,
                firmas_spaces,firmas_spaces,
                firmas_nombres
              ]
            }
          });
        }

        return datos;
    }
}