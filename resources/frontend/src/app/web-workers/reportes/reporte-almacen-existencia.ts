import { LOGOS } from "../../logos";
export class ReporteAlmacenExistencia{

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
                    text: 'SECRETARÍA DE SALUD\n EXISTENCIAS DE ALMACÉN\n',
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
                      text: reportData.unidad_medica?.direccion,
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
            detalles_title:{
              alignment:"right",
              fillColor:"#DEDEDE",
              fontSize: 6,
              bold:true
            },
            detalles_title_center:{
              alignment:"center",
              fillColor:"#DEDEDE",
              fontSize: 6,
              bold:true
            },
            detalles_datos:{
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

        function numberFormat(num, prices:boolean = false) {
          //return '$' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
          var str = num.toString().split(".");
          str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          if(prices){
            return '$ ' +str.join(".");
          }else{
            return str.join(".");
          }
        }

        let label_titulo:string = 'Existencias agrupadas por Articulo';
        if(reportData.config.agrupado_lote){
            label_titulo = 'Existencias agrupadas por Lote';
        }

        datos.content.push({
          table: {
            margin: [0,0,0,0],
            widths: [ 'auto','*','auto','*','auto','*','auto','*' ],
            body: [
              [
                {text: label_titulo, colSpan: 8, style:'detalles_title_center'},
                {text: ""},
                {text: ""},
                {text: ""},
                {text: ""},
                {text: ""},
                {text: "" },
                {text: "" },
              ],
              [
                {text: "Unidad :",                               style: "detalles_title"},
                {text: reportData.encabezado.unidad_medica?.nombre+' [ '+reportData.encabezado.unidad_medica?.clues+' ]',           style: "detalles_datos", colSpan: 7 },
                {text: ""},
                {text: ""},
                {text: ""},
                {text: ""},
                {text: "" },
                {text: "" },
              ],
              [
                {text: "Almacen"+((reportData.encabezado.almacenes.length > 1)?'es':'')+" :",                                style: "detalles_title"},
                {text: reportData.encabezado.almacenes.join(' | '),  style: "detalles_datos", colSpan: 7 },
                {text: ""},
                {text: ""},
                {text: ""},
                {text: ""},
                {text: "" },
                {text: "" },
              ],
            ]
          }
        });

        if(reportData.encabezado.parametros_busqueda){
          datos.content[0].table.body.push(
              [
                  {text: "Parametros de Busqueda :",                  style: "detalles_title" },
                  {text: reportData.encabezado.parametros_busqueda,   style: "detalles_datos", colSpan: 7 },
                  {text: "" },
                  {text: "" },
                  {text: "" },
                  {text: "" },
                  {text: "" },
                  {text: "" },
              ],
          );
        }

        if(reportData.encabezado.filtros){
          let filtros:string[] = [];
          if(reportData.encabezado.filtros.tipo_articulo != 'Todos'){
            filtros.push('Tipos de Articulos: ' + reportData.encabezado.filtros.tipo_articulo);
          }
          
          if(reportData.encabezado.filtros.existencias != 'Todos'){
            filtros.push('Existencias: ' + reportData.encabezado.filtros.existencias);
          }
          
          if(reportData.encabezado.filtros.caducidades != 'Todos'){
            filtros.push('Caducidades: ' + reportData.encabezado.filtros.caducidades);
          }
          
          if(reportData.encabezado.filtros.catalogo_unidad != 'Todos'){
            filtros.push('Catalogo: ' + reportData.encabezado.filtros.catalogo_unidad);
          }
          
          if(reportData.encabezado.filtros.con_resguardo){
            filtros.push('Con Resguardo');
          }
          
          datos.content[0].table.body.push(
              [
                  {text: "Filtros Aplicados :",                  style: "detalles_title" },
                  {text: filtros.join(' | '),   style: "detalles_datos", colSpan: 7 },
                  {text: "" },
                  {text: "" },
                  {text: "" },
                  {text: "" },
                  {text: "" },
                  {text: "" },
              ],
          );
        }

        let encabezado_lista = [
            {text: "#",                       style: 'cabecera'},
            {text: "NORMATIVO",               style: 'cabecera'},
            {text: "TIPO",                    style: 'cabecera'},
            {text: "CLAVE",                   style: 'cabecera'},
            {text: "ARTICULO",                style: 'cabecera'},
        ];

        let table_widths = [14, 29, 53, '*', 'auto', 35, 40, 40];
        if(reportData.config.agrupado_lote){
          table_widths = [14, 29, 53, '*', 'auto', 35, 45, 40, 40];
          encabezado_lista.push(
                {text: "LOTE",                    style: 'cabecera'},
                {text: "CADUCIDAD",               style: 'cabecera'},
                {text: "EXISTENCIA",              style: 'cabecera'},
                {text: "EXISTENCIA-PIEZAS",       style: 'cabecera'},
            );
        }else{
            encabezado_lista.push(
                {text: "TOTAL LOTES",             style: 'cabecera'},
                {text: "EXISTENCIA",              style: 'cabecera'},
                {text: "EXISTENCIA-PIEZAS",       style: 'cabecera'},
            );
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
        let index_table = datos.content.length-1;

        let existencias:any[] = reportData.items;
        let control_claves_agregadas:any = {};
        let total_claves:number = 0;
        let total_normativos:number = 0;
        let total_no_normativos:number = 0;
        let total_fuera_catalogo:number = 0;

        for(let i = 0; i < existencias.length; i++){
            let item  = existencias[i];

            if(!item.es_almacen_propio){
              continue;
            }

            if(!control_claves_agregadas[item.clave]){
              control_claves_agregadas[item.clave] = true;
              total_claves++;
              if(!item.en_catalogo_unidad){
                total_fuera_catalogo++;
              }else if(item.es_normativo){
                total_normativos++;
              }else{
                total_no_normativos++;
              }
            }

            let normativo_label = '-';
            if(item.en_catalogo_unidad){
                normativo_label = (item.es_normativo)?'SI':'NO';
            }

            let row_fill_color = (!item.es_almacen_propio)?"#E0F6F7":"";

            let item_pdf = [
                { text: (i+1),                      style: 'tabla_datos_center', fillColor: row_fill_color},
                { text: normativo_label,            style: 'tabla_datos_center', fillColor: row_fill_color},
                { text: item.tipo_bien_servicio,    style: 'tabla_datos',        fillColor: row_fill_color},
                { text: item.clave,                 style: 'tabla_datos',        fillColor: row_fill_color},
                { text: item.especificaciones,      style: 'tabla_datos',        fillColor: row_fill_color},
            ];

            if(reportData.config.agrupado_lote){
                let fecha_caducidad = (item.fecha_caducidad)?item.fecha_caducidad:'S/F/C';
                item_pdf.push(
                    { text: item.lote,                                          style: 'tabla_datos_center', fillColor: row_fill_color},
                    { text: fecha_caducidad,                                    style: 'tabla_datos_center', fillColor: row_fill_color},
                    { text: numberFormat(parseInt(item.existencia)),            style: 'tabla_datos_center', fillColor: row_fill_color},
                    { text: numberFormat(parseInt(item.existencia_fraccion)),   style: 'tabla_datos_center', fillColor: row_fill_color},
                );
            }else{
                item_pdf.push(
                    { text: item.total_lotes,                                   style: 'tabla_datos_center', fillColor: row_fill_color},
                    { text: numberFormat(parseInt(item.existencia)),            style: 'tabla_datos_center', fillColor: row_fill_color},
                    { text: numberFormat(parseInt(item.existencia_fraccion)),   style: 'tabla_datos_center', fillColor: row_fill_color},
                );
            }
            datos.content[index_table].table.body.push(item_pdf);
        }

        datos.content[0].table.body.push(
          [
              {text: "Total de Claves :",                        style: "detalles_title" },
              {text: numberFormat(total_claves),   style: "detalles_datos" },
              {text: "Normativos :",                               style: "detalles_title" },
              {text: numberFormat(total_normativos),     style: "detalles_datos" },
              {text: "No Normativos :",                               style: "detalles_title" },
              {text: numberFormat(total_no_normativos),     style: "detalles_datos" },
              {text: "Fuera del Catalogo :",                                  style: "detalles_title" },
              {text: numberFormat(total_fuera_catalogo), style: "detalles_datos" },
          ],
        );
        datos.content[0].table.body.push([{text:'', colSpan:8, border: [false, false, false, false]}]);
        
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