import { LOGOS } from "../../logos";
export class ReporteRecepcionPedido{
    getDocumentDefinition(reportData:any) {
        
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
                    text: 'SECRETARÍA DE SALUD\n RECEPCIÓN DE PEDIDO',
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
              alignment:"center"
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
            tabla_datos_center:{
              fontSize: 5,
              alignment: "center"
            }
          }
        };

        datos.content.push({
          table: {
            margin: [0,0,0,0],
            widths: [ 60, '*', 40, '*', 50, 50],
            body: [
              [
                {text: "Folio Pedido:",                                                     style: "pedido_title" },
                {text: reportData.folio,                                                    style: "pedido_datos" },
                {text: "Almacen:",                                                          style: "pedido_title" },
                {text: (reportData.almacen_id)?reportData.almacen.nombre:'Sin Almacen',     style: "pedido_datos" },
                {text: "Fecha:",                                                            style: "pedido_title" },
                {text: reportData.fecha_movimiento,                                         style: "pedido_datos" },
              ],
              [
                {text: "Proveedor:",                                                            style: "pedido_title"},
                {text: (reportData.proveedor_id)?reportData.proveedor.nombre:'Sin Proveedor',   style: "pedido_datos", colSpan: 3 },
                {text: ""},
                {text: ""},
                {text: "Total Claves:",                                                         style: "pedido_title"},
                {text: reportData.total_claves,                                                 style: "pedido_datos"},
              ],
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
            widths: [ 10, 45, '*', 40, 30, 30],
            margin: [0,0,0,0],
            body: [
              [
                {text: "#",               style: 'cabecera'},
                {text: "CLAVE",           style: 'cabecera'},
                {text: "DESCRIPCION",     style: 'cabecera'},
                {text: "LOTE",            style: 'cabecera'},
                {text: "FECHA CADUCIDAD", style: 'cabecera'},
                {text: "CANTIDAD",        style: 'cabecera'},
              ]
            ]
          }
        });

        let total_recibido = 0;
        for(let i = 0; i < reportData.lista_articulos.length; i++){
          let item = reportData.lista_articulos[i];
          datos.content[1].table.body.push([  
            { text: (i+1),                                                                          style: 'tabla_datos_center'},
            { text: (item.articulo.clave_cubs)?item.articulo.clave_cubs:item.articulo.clave_local,  style: 'tabla_datos'},
            { text: item.articulo.especificaciones,                                                 style: 'tabla_datos'},
            { text: item.stock.lote,                                                                style: 'tabla_datos'},
            { text: item.stock.fecha_caducidad,                                                     style: 'tabla_datos'},
            { text: item.cantidad,                                                                  style: 'tabla_datos_center'},
          ]);
          total_recibido += item.cantidad;
        }

        datos.content[1].table.body.push([  
          { text: '', colSpan: 4, border: [false, false, false, false]},
          { text: ''},
          { text: ''},
          { text: ''},
          { text: 'Total:',         style: 'subcabecera'},
          { text: total_recibido,   style: 'tabla_datos_center'},
        ]);

        return datos;
      }
}