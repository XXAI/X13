import { LOGOS } from "../../logos";
export class ReportePersonalActivo{
    getDocumentDefinition(reportData:any) {
        //console.log(reportData);
        let contadorLineasHorizontalesV = 0;
        let fecha_hoy =  Date.now();
      console.log(LOGOS);
        let datos = {
          pageOrientation: 'landscape',
          pageSize: 'LEGAL',
          /*pageSize: {
            width: 612,
            height: 396
          },*/
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
                    text: 'SECRETARÍA DE SALUD\n'+reportData.config.title,
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
            //return 'Página ' + currentPage.toString() + ' de ' + pageCount; 
            return {
              margin: [30, 20, 30, 0],
              columns: [
                  {
                      text:'http://sirh.saludchiapas.gob.mx/',
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
          content: [
            /*layout: {
                  paddingTop: function(i, node) { return 0; },
                  paddingBottom: function(i, node) { return 0; },
                  paddingLeft: function(i, node) { return 0; },
                  paddingRight: function(i, node) { return 0; },
                  hLineWidth: function(i, node) {
                      if (i < 3) { return 0; } else {
                          return 0.25
                      }
                      return (i === 0 || i === node.table.body.length) ? 0.5 : 0.5;
                  },
                  vLineWidth: function(i, node) {
                      if (i == 0) {
                          contadorLineasHorizontalesV += 1
                      }
                      if (contadorLineasHorizontalesV > 5) {
                          return 0.5
                      } else {
                          return 0
                      }
                  },
              }
              
            }*/
            ],
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
              datos:
              {
                fontSize: 10
              },
              tabla_datos:
              {
                fontSize: 5
              }
            }
        };
      
        //console.log(datos.content[0].table.body);
        //console.log(data);
        let clues = '';
        let cr = '';
        let indice_actual;//(datos.content.length -1);

        //console.log('for(let i = 0; i < ; i++){');
        for(let i = 0; i < reportData.items.length; i++){
          let empleado = reportData.items[i];

          if(cr != empleado.cr_id){
            cr = empleado.cr_id;
            if(clues != empleado.clues){
              clues = empleado.clues;
              
              datos.content.push({
                //layout: 'lightHorizontalLines',
                table: {
                  headerRows:2,
                  dontBreakRows: true,
                  keepWithHeaderRows: 1,
                  widths: [ 43, 60, 110, 30,'*', 40, 30, 50, 35, 29,'*', 80,'*' ],
                  margin: [0,0,0,0],
                  body: [
                    [{text: "["+empleado.clues+"] "+empleado.clues_descripcion, colSpan: 13, style: 'cabecera'},{},{},{},{},{},{},{},{},{},{},{},{}],
                    [{text: "RFC", style: 'cabecera'},
                      {text: "CURP", style: 'cabecera'},
                      {text: "NOMBRE", style: 'cabecera'},
                      {text: "CODIGO", style: 'cabecera'},
                      {text: "PROFESIÓN", style: 'cabecera'},
                      {text: "CLUE FÍSICA", style: 'cabecera'},
                      {text: "CR FÍSICO", style: 'cabecera'},
                      {text: "TURNO", style: 'cabecera'},
                      {text: "H / ENTRADA", style: 'cabecera'},
                      {text: "H / SALIDA", style: 'cabecera'},
                      {text: "ÁREA DE SERVICIO", style: 'cabecera'},
                      {text: "FUNCIÓN", style: 'cabecera'},
                      {text: "OBSERVACIONES", style: 'cabecera'}]
                  ]
                }
              });

              indice_actual = datos.content.length -1;
            }
            datos.content[indice_actual].table.body.push(
              [{text: "["+empleado.cr_id+"] "+empleado.cr_descripcion, colSpan: 13, style: 'subcabecera'},{},{},{},{},{},{},{},{},{},{},{},{}],
            );
          }

          datos.content[indice_actual].table.body.push([  
            { text: empleado.rfc, style: 'tabla_datos' },
            { text: empleado.curp , style: 'tabla_datos'},
            { text: empleado.nombre , style: 'tabla_datos'},
            { text: empleado.codigo_id , style: 'tabla_datos'},
            { text: empleado.profesion , style: 'tabla_datos'},
            { text: empleado.clues , style: 'tabla_datos'},
            { text: empleado.cr_id , style: 'tabla_datos'},
            { text: empleado.turno , style: 'tabla_datos'},
            { text: empleado.hora_entrada , style: 'tabla_datos'},
            { text: empleado.hora_salida , style: 'tabla_datos'},
            { text: empleado.area_servicio , style: 'tabla_datos'},
            { text: empleado.funcion , style: 'tabla_datos'},
            { text: empleado.observaciones , style: 'tabla_datos'}
          ]);
        }

        if(reportData.config.showSigns){
          
          
          //Se agregan los firmantes a la hoja
          let num_firmantes = reportData.firmantes.length;
          if(num_firmantes > 0)
          {
            let espacios:any[] = [];
            let arreglo_firmantes:any[] = [];
            let arreglo_espacios:any[] = [];
            let obj_espacios:any = { text: " \n\n\n\n"};
            for(let i = 0; i < num_firmantes; i++){
              
              if(i!=0)
              {
                arreglo_firmantes.push("");
                if(num_firmantes > 4)
                  espacios.push(5);
                else  
                  espacios.push("*");
                arreglo_espacios.push({text: "",rowSpan: 2});
              }
              
              if(num_firmantes > 4)
                espacios.push("*");
              else if(num_firmantes >1 && num_firmantes <5)
                espacios.push(200);
              else if(num_firmantes == 1)
                espacios.push("*");
              

              arreglo_espacios.push(obj_espacios);
              arreglo_firmantes.push({text: reportData.firmantes[i].empleado.nombre+ "\n"+reportData.firmantes[i].cargo, style: 'datos'});
            }
            datos.content.push(
              {
                table: {
                    dontBreakRows: true,
                    widths: espacios ,
                    body: [  arreglo_espacios, arreglo_firmantes ]
                },
                layout: {
                    hLineWidth: function(i, node) {
                        if (i === 0 || i == 2){
                            return 0;
                        }
                        return 0.5;
                    },
                    vLineWidth: function(i, node) { 
                      return 0;
                    },
                },
                margin: [0,20,0,0], ///left-top-right-bottom
                alignment: "center"
              }
            );
          }
          //Finaliza los firmantes
        }

        return datos;
      }
}