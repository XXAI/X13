import { LOGOS } from "../../logos";
export class ReportePedido{
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
                    text: 'SECRETARÍA DE SALUD\n PEDIDO',
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
            tabla_datos_center:{
              fontSize: 5,
              alignment: "center"
            }
          }
        };

        datos.content.push({
          table: {
            margin: [0,0,0,0],
            widths: [ 60, '*', 40, '*', 50, 65],
            body: [
              [
                {text: "Folio:",                                                                style: "pedido_title" },
                {text: reportData.folio,                                                        style: "pedido_datos" },
                {text: "Programa:",                                                             style: "pedido_title" },
                {text: (reportData.programa_id)?reportData.programa.descripcion:'Sin Programa', style: "pedido_datos" },
                {text: "Mes/Año:",                                                              style: "pedido_title" },
                {text: catalogo_meses[reportData.mes] + ' - ' + reportData.anio,                style: "pedido_datos" },
              ],
              [
                {text: "Unidad Medica:",                                                        style: "pedido_title"},
                {text: reportData.unidad_medica.nombre,                                         style: "pedido_datos", colSpan: 3 },
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
            widths: [ 10, 45, '*', 30],
            margin: [0,0,0,0],
            body: [
              [
                {text: "#",               style: 'cabecera'},
                {text: "CLAVE",           style: 'cabecera'},
                {text: "DESCRIPCION",     style: 'cabecera'},
                {text: "CANTIDAD",        style: 'cabecera'},
              ]
            ]
          }
        });

        let total_pedido = 0;
        for(let i = 0; i < reportData.lista_articulos.length; i++){
          let item = reportData.lista_articulos[i];
          datos.content[1].table.body.push([  
            { text: (i+1),                                                                          style: 'tabla_datos_center'},
            { text: (item.articulo.clave_cubs)?item.articulo.clave_cubs:item.articulo.clave_local,  style: 'tabla_datos'},
            { text: item.articulo.especificaciones,                                                 style: 'tabla_datos'},
            { text: item.cantidad,                                                                  style: 'tabla_datos_center'},
          ]);
          total_pedido += item.cantidad;
        }

        datos.content[1].table.body.push([  
          { text: '', colSpan: 2, border: [false, false, false, false]},
          { text: ''},
          { text: 'Total:',         style: 'subcabecera'},
          { text: total_pedido,   style: 'tabla_datos_center'},
        ]);

        return datos;
      }
}