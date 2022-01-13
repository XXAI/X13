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
        let datos = {
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
                    text: 'SECRETARÍA DE SALUD\n '+reportData.config.title,
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
                      text:'Carretera Chicoasen S/N, Plan de Ayala, Tuxtla Gutiérrez, Chis.',
                      alignment:'left',
                      fontSize: 8,
                  },
                  {
                      margin: [10, 0, 0, 0],
                      text: 'Página ' + currentPage.toString() + ' de ' + pageCount,
                      fontSize: 8,
                      alignment: 'center'
                  },
                  {
                    text:fecha_hoy.toString(),
                    alignment:'right',
                    fontSize: 8,
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
              fontSize: 8,
              bold:true
            },
            pedido_datos:{
              fontSize: 8
            },
            tabla_datos:{
              fontSize: 8
            },
            tabla_datos_center:{
              fontSize: 8,
              alignment: "center"
            },
            tabla_datos_right:{
              fontSize: 8,
              alignment: "right"
            },
            salida_title:{
              alignment:"right",
              fillColor:"#DEDEDE",
              fontSize: 8,
              bold:true
            },
            salida_datos:{
              fontSize: 8
            },
            datos_encabezado_izquierda:{
              fontSize: 10,
              color:"black",
            },
            tabla_encabezado_firmas:
            {
              fontSize: 10,
              alignment:"center",
              bold:true
            },
            tabla_encabezado_datos:{
              fontSize: 10,
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
        let fecha_salida  =  new Intl.DateTimeFormat('es-ES', {year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date(salida.fecha_movimiento));

        function numberFormat(num) {
          //return '$' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
          var str = num.toString().split(".");
          str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          return '$ ' +str.join(".");
        }
        let monto_total = numberFormat(total_salida);
        let IVA = parseFloat((salida?.iva)?salida?.iva:0.00);



        datos.content.push({
          table: {
            margin: [0,0,0,0],
            widths: [ 60, '*', 70, '*', 60, 65],
            body: [
              [
                {text: "Almacen:",                                                             style: "salida_title"},
                {text: salida.almacen?.nombre,                                                style: "salida_datos", colSpan: 3 },
                {text: ""},
                {text: ""},
                {text: "N° salida:",                                                           style: "salida_title"},
                {text: salida.folio,                                                           style: "salida_datos"},
              ],
              [
                {text: "Programa:",                                                             style: "salida_title"},
                {text: salida.programa?.nombre,                                                style: "salida_datos", colSpan: 3 },
                {text: ""},
                {text: ""},
                {text: "Pedido:",                                                               style: "salida_title"},
                {text: "GHT-1212",                                                              style: "salida_datos"},
              ],
              [
                {text: "N° Referencia:",                                                        style: "salida_title" },
                {text: "",                                                                      style: "salida_datos" },
                {text: "Fecha Referencia:",                                                     style: "salida_title" },
                {text: fecha_salida,                                                           style: "salida_datos" },
                {text: "Fecha salida:",                                                        style: "salida_title" },
                {text: fecha_salida,                                                           style: "salida_datos" },
              ],
              [
                {text: "Observaciones:",                                                        style: "salida_title"},
                {text: salida.observaciones,                                                   style: "salida_datos", colSpan: 5 },
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

        datos.content.push({
          table: {
            headerRows:1,
            dontBreakRows: true,
            keepWithHeaderRows: 1,
            widths: [ 10, 20, 35, 45, 63, 'auto', 50, 50],
            margin: [0,0,0,0],
            body: [
              [
                {text: "#",                   style: 'cabecera'},
                {text: "CANT",                style: 'cabecera'},
                {text: "LOTE",                style: 'cabecera'},
                {text: "FECHA/CADUCIDAD",     style: 'cabecera'},
                {text: "CLAVE",               style: 'cabecera'},
                {text: "PRODUCTO",            style: 'cabecera'},
                {text: "PRECIO UNITARIO",     style: 'cabecera'},
                {text: "IMPORTE",             style: 'cabecera'},

              ]
            ]
          }
        });

        let total_pedido = 0;
        let tabla_articulos = [];
        let borrador = {};

        switch (salida.estatus) {

          case 'FIN':
            tabla_articulos = salida.lista_articulos;
            borrador = { text: '\n\n\n\n\n\n'};
              break;
          case 'BOR':
            tabla_articulos = salida.lista_articulos_borrador;
            console.log("consolaReporte",tabla_articulos);
            borrador = { text: '\nBORRADOR\n\n\n', style: 'marca_de_agua',};
              break;
          case 'CANCL':
            tabla_articulos = salida.lista_articulos;
            borrador = { text: '\n\n\n\n\n\n', style: 'marca_de_agua',};
              break;

          default:0

        }

        for(let i = 0; i < tabla_articulos.length; i++){
          let item            = tabla_articulos[i];
          for(let s = 0; s < item.stocks.length; s++){

            let stock = item.stocks[s];

          
            let fecha = (stock?.fecha_caducidad)?stock?.fecha_caducidad:'S/F/C';
            let fecha_caducidad = (stock?.fecha_caducidad) ? new Intl.DateTimeFormat('es-ES', {year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date(fecha)) : 'S/F/C';

            datos.content[1].table.body.push([
              { text: (i+1),                                                                          style: 'tabla_datos_center'},
              { text: stock?.cantidad,                                                                style: 'tabla_datos_center'},
              { text: (stock?.lote != null)?stock?.lote:'S/L',                                        style: 'tabla_datos_center'},
              { text: fecha_caducidad,                                                                style: 'tabla_datos_center'},
              { text: (item.clave_cubs != null)?item.clave_cubs:item.clave_local,                     style: 'tabla_datos'},
              { text: item.especificaciones,                                                          style: 'tabla_datos'},
              { text: numberFormat(parseFloat(item.precio_unitario)),                                 style: 'tabla_datos_right'},
              { text: numberFormat(parseFloat(item.total_monto)),                                     style: 'tabla_datos_right'},

            ]);
          //total_pedido += item.cantidad;
          }
        }

        datos.content[1].table.body.push([
          { text: '', colSpan: 6, border: [false, false, false, false,]},
          { text: ''},
          { text: ''},
          { text: ''},
          { text: ''},
          { text: ''},
          { text: 'Subtotal:',      style: 'subcabecera'},
          { text: monto_total,   style: 'tabla_datos_right'},
        ]);

        datos.content[1].table.body.push([
          { text: '', colSpan: 6, border: [false, false, false, false,]},
          { text: ''},
          { text: ''},
          { text: ''},
          { text: ''},
          { text: ''},
          { text: 'IVA:',        style: 'subcabecera'},
          { text: IVA,   style: 'tabla_datos_right'},
        ]);

        datos.content[1].table.body.push([
          { text: '', colSpan: 6, border: [false, false, false, false,]},
          { text: ''},
          { text: ''},
          { text: ''},
          { text: ''},
          { text: ''},
          { text: 'Total:',        style: 'subcabecera'},
          { text: monto_total,   style: 'tabla_datos_right'},
        ]);

        datos.content.push({
          layout: 'noBorders',
          table: {
          widths: ['*'],
            margin: [0,0,0,0],
            body: [
              [
                borrador
              ]
            ]
          }
        });

        datos.content.push({
          layout: 'noBorders',
          table: {
           widths: [170, 170, 170],
            margin: [0,0,0,0],
            body: [
              [
                {text: "R E C I B I O\n\n\n", style: "tabla_encabezado_firmas"},
                {text: "R E V I S Ó\n\n\n",  style:'tabla_encabezado_firmas'},
                {text: "V o. B o.\n\n\n", style:'tabla_encabezado_firmas'},
              ],
              [
                {text:  salida.recibe, style: "tabla_encabezado_datos"},
                {text:  salida.recibe, style: "tabla_encabezado_datos"},
                {text:  salida.recibe, style: "tabla_encabezado_datos"}
              ]
            ]
          }
        });

        return datos;
    }
}