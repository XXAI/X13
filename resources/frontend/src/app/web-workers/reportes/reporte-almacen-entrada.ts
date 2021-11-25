import { LOGOS } from "../../logos";
export class ReporteAlmacenEntrada{

    getDocumentDefinition(reportData:any) {
      console.log("consolaReporte",reportData);
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
        let fecha_hoy =  Date.now();
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
                      text:'http://ssadii.saludchiapas.gob.mx/',
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
              fontSize: 5,
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
              fontSize: 5
            },
            entrada_title:{
              alignment:"right",
              fillColor:"#DEDEDE",
              fontSize: 8,
              bold:true
            },
            entrada_datos:{
              fontSize: 8
            },
            datos_encabezado_izquierda:
            {
              fontSize: 10,
              color:"black",
              
            },
          }
        };

        let entrada = reportData.items;
        let fecha_entrada  =  new Intl.DateTimeFormat('es-ES', {year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date(entrada.fecha_movimiento));



        datos.content.push({
          table: {
            margin: [0,0,0,0],
            widths: [ 60, '*', 70, '*', 60, 65],
            body: [
              [
                {text: "Almacen:",                                                             style: "entrada_title"},
                {text: entrada.almacen?.nombre,                                                style: "entrada_datos", colSpan: 3 },
                {text: ""},
                {text: ""},
                {text: "N° Entrada:",                                                           style: "entrada_title"},
                {text: entrada.folio,                                                           style: "entrada_datos"},
              ],
              [
                {text: "Programa:",                                                             style: "entrada_title"},
                {text: entrada.programa?.nombre,                                                style: "entrada_datos", colSpan: 3 },
                {text: ""},
                {text: ""},
                {text: "Pedido:",                                                           style: "entrada_title"},
                {text: "GHT-1212",                                                           style: "entrada_datos"},
              ],
              [
                {text: "N° Referencia:",                                                        style: "entrada_title" },
                {text: "",                                                                      style: "entrada_datos" },
                {text: "Fecha Referencia:",                                                     style: "entrada_title" },
                {text: fecha_entrada,                                                           style: "entrada_datos" },
                {text: "Fecha Entrada:",                                                        style: "entrada_title" },
                {text: fecha_entrada,                                                           style: "entrada_datos" },
              ],
              [
                {text: "Observaciones:",                                                        style: "entrada_title"},
                {text: entrada.observaciones,                                                   style: "entrada_datos", colSpan: 5 },
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


        // datos.content.push({
        //   table: {
        //     headerRows:1,
        //     dontBreakRows: true,
        //     keepWithHeaderRows: 1,
        //     widths: [ 10, 45, '*', 30],
        //     margin: [0,0,0,0],
        //     body: [
        //       [
        //         {text: "#",               style: 'cabecera'},
        //         {text: "CLAVE",           style: 'cabecera'},
        //         {text: "DESCRIPCION",     style: 'cabecera'},
        //         {text: "CANTIDAD",        style: 'cabecera'},
        //       ]
        //     ]
        //   }
        // });

        // let total_pedido = 0;
        // for(let i = 0; i < reportData.lista_articulos.length; i++){
        //   let item = reportData.lista_articulos[i];
        //   datos.content[1].table.body.push([  
        //     { text: (i+1),                                                                          style: 'tabla_datos_center'},
        //     { text: (item.articulo.clave_cubs)?item.articulo.clave_cubs:item.articulo.clave_local,  style: 'tabla_datos'},
        //     { text: item.articulo.especificaciones,                                                 style: 'tabla_datos'},
        //     { text: item.cantidad,                                                                  style: 'tabla_datos_center'},
        //   ]);
        //   total_pedido += item.cantidad;
        // }

        // datos.content[1].table.body.push([  
        //   { text: '', colSpan: 2, border: [false, false, false, false]},
        //   { text: ''},
        //   { text: 'Total:',         style: 'subcabecera'},
        //   { text: total_pedido,   style: 'tabla_datos_center'},
        // ]);

        return datos;
    }
}