import { LOGOS } from "../../logos";
export class ReporteAlmacenEntrada{

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
        let datos:any  = {
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
                    text: 'SECRETARÍA DE SALUD\n ENTRADA DE ALMACÉN\n',
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
                      text: entrada.almacen?.direccion,
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
            entrada_title:{
              alignment:"right",
              fillColor:"#DEDEDE",
              fontSize: 6,
              bold:true
            },
            entrada_title_center:{
              alignment:"center",
              fillColor:"#DEDEDE",
              fontSize: 6,
              bold:true
            },
            entrada_datos:{
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


        let entrada:any = reportData.items;
        let total_entrada = parseFloat(entrada.total_monto);
        let fecha_entrada  =  new Intl.DateTimeFormat('es-ES', {year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date(entrada.fecha_movimiento+'T12:00:00'));

        let fecha_referencia = '';
        if(entrada.referencia_fecha){
          fecha_referencia =  new Intl.DateTimeFormat('es-ES', {year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date(entrada.referencia_fecha+'T12:00:00'));
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

        let monto_total = numberFormat(total_entrada);
        let IVA = parseFloat((entrada?.iva)?entrada?.iva:0.00);

        //Checar origen:
        if(entrada.almacen_movimiento_id){
          entrada.origen = entrada.almacen_movimiento.nombre;
        }else if(entrada.unidad_medica_movimiento_id){
          entrada.origen = entrada.unidad_medica_movimiento.nombre;
        }else if(entrada.proveedor_id){
          entrada.origen = entrada.proveedor.nombre;
        }else{
          entrada.origen = 'Sin Origen Indicado';
        }

        datos.content.push({
          table: {
            margin: [0,0,0,0],
            widths: [ 60, '*', 70, '*', 70, 155],
            body: [
              [
                {text: entrada.tipo_movimiento?.descripcion, colSpan: 6, style:'entrada_title_center'},
                {text: ""},
                {text: ""},
                {text: ""},
                {text: ""},
                {text: ""},
              ],
              [
                {text: "Unidad:",                               style: "entrada_title"},
                {text: entrada.unidad_medica?.nombre+' [ '+entrada.unidad_medica?.clues+' ]',           style: "entrada_datos", colSpan: 5 },
                {text: ""},
                {text: ""},
                {text: ""},
                {text: ""},
              ],
              [
                {text: "Almacen:",                              style: "entrada_title"},
                {text: entrada.almacen?.nombre,                 style: "entrada_datos", colSpan: 3 },
                {text: ""},
                {text: ""},
                {text: "Folio Entrada:",                        style: "entrada_title"},
                {text: entrada.folio,                           style: "entrada_datos"},
              ],
              [
                {text: "Origen:",                               style: "entrada_title"},
                {text: entrada.origen,                          style: "entrada_datos", colSpan: 3 },
                {text: ""},
                {text: ""},
                {text: "Folio Documento:",                      style: "entrada_title"},
                {text: entrada.documento_folio,                 style: "entrada_datos"},
              ],
              [
                {text: "Programa:",                             style: "entrada_title"},
                {text: entrada.programa?.nombre,                style: "entrada_datos", colSpan: 3 },
                {text: ""},
                {text: ""},
                {text: "Turno:",                                style: "entrada_title"},
                {text: entrada.turno?.nombre,                   style: "entrada_datos"},
              ],
              [
                {text: "N° Referencia:",                        style: "entrada_title" },
                {text: entrada.referencia_folio,                style: "entrada_datos" },
                {text: "Fecha Referencia:",                     style: "entrada_title" },
                {text: fecha_referencia,                        style: "entrada_datos" },
                {text: "Fecha Entrada:",                        style: "entrada_title" },
                {text: fecha_entrada,                           style: "entrada_datos" },
              ],
              [
                {text: "Observaciones:",                        style: "entrada_title"},
                {text: entrada.observaciones,                   style: "entrada_datos", colSpan: 5 },
                {text: ""},
                {text: ""},
                {text: ""},
                {text: ""},
              ],
              // [
              //   {text: "Unidad Medica:",                                                        style: "entrada_title"},
              //   {text:"",                                                                       style: "entrada_datos", colSpan: 3 },
              //   {text: ""},
              //   {text: ""},
              //   {text: "Total Claves:",                                                         style: "entrada_title"},
              //   {text: entrada.total_claves,                                                    style: "entrada_datos"},
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

        let table_widths = [10, 63, '*', 'auto', 45, 50];
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

        switch (entrada.estatus) {
          case 'FIN':
            tabla_articulos = entrada.lista_articulos;
            break;
          case 'PERE':
            tabla_articulos = entrada.lista_articulos_recepcion;
            watermark = 'PENDIENTE RECEPCIÓN';
            break;
          case 'BOR':
            tabla_articulos = entrada.lista_articulos_borrador;
            watermark = 'BORRADOR';
            break;
          case 'CAN':
            tabla_articulos = entrada.lista_articulos;
            watermark = 'CANCELADO';
              break;
          default:0
        }

        if(watermark){
          datos.watermark = { text: watermark, opacity: 0.3, bold: true, italics: true };
        }

        for(let i = 0; i < tabla_articulos.length; i++){
          let item  = tabla_articulos[i];
          let fecha_caducidad = (item.stock)?item.stock.fecha_caducidad:((item.fecha_caducidad)?item.fecha_caducidad:'S/F/C');
          
          let detalle = 'Por pieza\n';
          if(item.modo_movimiento == 'NRM'){
            detalle = (item.stock)?((item.stock.empaque_detalle)?item.stock.empaque_detalle.descripcion:'Sin detalles'):(item.empaque_detalle)?item.empaque_detalle.descripcion:'Sin detalles';
          }else{
            detalle += ' ( ' + ((item.stock)?((item.stock.empaque_detalle)?item.stock.empaque_detalle.unidad_medida.descripcion:'Sin detalles'):(item.empaque_detalle)?item.empaque_detalle.unidad_medida.descripcion:'Sin detalles') + ' )';
          }
          let lote = (item.stock)?item.stock.lote:((item.lote)?item.lote:'S/L');
          let item_pdf = [
            { text: (i+1),                                                                          style: 'tabla_datos_center'},
            { text: (item.articulo.clave_cubs)?item.articulo.clave_cubs:item.articulo.clave_local,  style: 'tabla_datos'},
            { text: item.articulo.especificaciones,                                                 style: 'tabla_datos'},
            { text: detalle,                                                                        style: 'tabla_datos_center'},
            { text: lote + '\n' + fecha_caducidad,                                                  style: 'tabla_datos_center'},
            { text: numberFormat(parseInt(item.cantidad)),                                          style: 'tabla_datos_center'},
          ];

          if(reportData.config.mostrar_montos){
            item_pdf.push({ text: numberFormat(parseFloat(item.precio_unitario)), style: 'tabla_datos_right'});
            item_pdf.push({ text: numberFormat(parseFloat(item.total_monto)),     style: 'tabla_datos_right'});
          }

          datos.content[1].table.body.push(item_pdf);
          total_articulos += item.cantidad;
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