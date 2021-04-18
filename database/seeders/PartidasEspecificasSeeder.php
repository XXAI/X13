<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class PartidasEspecificasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $list = [
            ['clave'=>11101,'clave_partida_generica'=>111,"descripcion"=>"Dietas", "anio"=>2021],

            ['clave'=>11302,'clave_partida_generica'=>113,"descripcion"=>"Sueldo al Personal Docente", "anio"=>2021],
            ['clave'=>11303,'clave_partida_generica'=>113,"descripcion"=>"Sueldo al Personal de Séptimas Partes", "anio"=>2021],
            ['clave'=>11304,'clave_partida_generica'=>113,"descripcion"=>"Sueldo al Personal de Confianza", "anio"=>2021],
            ['clave'=>11305,'clave_partida_generica'=>113,"descripcion"=>"Sueldo al Personal Docente con Carrera Magistral", "anio"=>2021],
            ['clave'=>11311,'clave_partida_generica'=>113,"descripcion"=>"Sueldo al Personal Sindicalizado", "anio"=>2021],
            ['clave'=>11312,'clave_partida_generica'=>113,"descripcion"=>"Sueldo al Personal de Base en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>11313,'clave_partida_generica'=>113,"descripcion"=>"Sueldo al Personal de Base en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>11314,'clave_partida_generica'=>113,"descripcion"=>"Sueldo al Personal de Confianza en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>11315,'clave_partida_generica'=>113,"descripcion"=>"Sueldo al Personal de Confianza en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>11316,'clave_partida_generica'=>113,"descripcion"=>"Sueldo al Personal de Confianza (Policías de Seguridad Pública)", "anio"=>2021],            

            ['clave'=>12101,'clave_partida_generica'=>121,"descripcion"=>"Honorarios", "anio"=>2021],
            ['clave'=>12106,'clave_partida_generica'=>121,"descripcion"=>"Honorarios en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>12107,'clave_partida_generica'=>121,"descripcion"=>"Honorarios en Área Administrativa en Salud", "anio"=>2021],

            ['clave'=>12201,'clave_partida_generica'=>122,"descripcion"=>"Sueldo al Personal Eventual", "anio"=>2021],
            ['clave'=>12202,'clave_partida_generica'=>122,"descripcion"=>"Compensaciones a Sustitutos de Profesores", "anio"=>2021],
            ['clave'=>12203,'clave_partida_generica'=>122,"descripcion"=>"Sueldo al Personal Docente Interino", "anio"=>2021],
            ['clave'=>12204,'clave_partida_generica'=>122,"descripcion"=>"Sueldo al Personal Interino", "anio"=>2021],
            ['clave'=>12205,'clave_partida_generica'=>122,"descripcion"=>"Sueldo al Personal Eventual en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>12206,'clave_partida_generica'=>122,"descripcion"=>"Sueldo al Personal Eventual en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>12207,'clave_partida_generica'=>122,"descripcion"=>"Sueldo al Personal Interino en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>12208,'clave_partida_generica'=>122,"descripcion"=>"Sueldo al Personal Interino en Área Administrativa en Salud", "anio"=>2021],

            ['clave'=>12306,'clave_partida_generica'=>123,"descripcion"=>"Ayudas para Servicio Social", "anio"=>2021],

            ['clave'=>13101,'clave_partida_generica'=>131,"descripcion"=>"Prima Quincenal por Años de Servicios Efectivos Prestados", "anio"=>2021],
            ['clave'=>13102,'clave_partida_generica'=>131,"descripcion"=>"Acreditación por Años de Servicio en la Docencia de las Instituciones de Educación Superior", "anio"=>2021],
            ['clave'=>13109,'clave_partida_generica'=>131,"descripcion"=>"Prima Quincenal por Años de Servicio Prestado (Docente)", "anio"=>2021],
            ['clave'=>13110,'clave_partida_generica'=>131,"descripcion"=>"Prima Quincenal por Años de Servicios Efectivos Prestados en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>13111,'clave_partida_generica'=>131,"descripcion"=>"Prima Quincenal por Años de Servicios Efectivos Prestados en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>13112,'clave_partida_generica'=>131,"descripcion"=>"Acreditación por Años de Servicio al Personal Administrativo de las Instituciones de Educación Superior", "anio"=>2021],
            
            ['clave'=>13201,'clave_partida_generica'=>132,"descripcion"=>"Primas Vacacionales y Dominical", "anio"=>2021],
            ['clave'=>13202,'clave_partida_generica'=>132,"descripcion"=>"Aguinaldo o Gratificación de Fin de Año", "anio"=>2021],
            ['clave'=>13203,'clave_partida_generica'=>132,"descripcion"=>"Ajuste de Fin de Año", "anio"=>2021],
            ['clave'=>13204,'clave_partida_generica'=>132,"descripcion"=>"Prima Dominical (Docente)", "anio"=>2021],
            ['clave'=>13205,'clave_partida_generica'=>132,"descripcion"=>"Primas de Vacaciones y Dominical (Docente)", "anio"=>2021],
            ['clave'=>13206,'clave_partida_generica'=>132,"descripcion"=>"Aguinaldo o Gratificación de Fin de Año (Docente)", "anio"=>2021],
            ['clave'=>13207,'clave_partida_generica'=>132,"descripcion"=>"Prima de Vacaciones y Dominical (Docente Carrera Magisterial)", "anio"=>2021],
            ['clave'=>13208,'clave_partida_generica'=>132,"descripcion"=>"Aguinaldo o Gratificación de Fin de Año (Docente Carrera Magisterial)", "anio"=>2021],
            ['clave'=>13209,'clave_partida_generica'=>132,"descripcion"=>"Primas de Vacaciones y Dominical en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>13210,'clave_partida_generica'=>132,"descripcion"=>"Primas de Vacaciones y Dominical en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>13211,'clave_partida_generica'=>132,"descripcion"=>"Aguinaldo o Gratificación de Fin de Año en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>13212,'clave_partida_generica'=>132,"descripcion"=>"Aguinaldo o Gratificación de Fin de Año en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>13213,'clave_partida_generica'=>132,"descripcion"=>"Primas de Vacaciones y Dominical (Policías de Seguridad Pública)", "anio"=>2021],
            ['clave'=>13214,'clave_partida_generica'=>132,"descripcion"=>"Aguinaldo o Gratificación de Fin de Año (Policías de Seguridad Pública)", "anio"=>2021],
            
            ['clave'=>13301,'clave_partida_generica'=>133,"descripcion"=>"Remuneraciones por Horas Extraordinarias", "anio"=>2021],

            ['clave'=>13401,'clave_partida_generica'=>134,"descripcion"=>"Acreditación por Titulación en la Docencia", "anio"=>2021],
            ['clave'=>13402,'clave_partida_generica'=>134,"descripcion"=>"Acreditación al Personal Docente por Años de Estudio de Licenciatura", "anio"=>2021],
            ['clave'=>13403,'clave_partida_generica'=>134,"descripcion"=>"Compensaciones por Servicios Especiales (Poder Legislativo)", "anio"=>2021],
            ['clave'=>13404,'clave_partida_generica'=>134,"descripcion"=>"Compensaciones por Servicios Eventuales (Educación Federalizada)", "anio"=>2021],
            ['clave'=>13407,'clave_partida_generica'=>134,"descripcion"=>"Compensaciones Adicionales por Servicios Especiales (Docente Educación Federalizada)", "anio"=>2021],
            ['clave'=>13409,'clave_partida_generica'=>134,"descripcion"=>"Compensación por Adquisición de Material Didáctico", "anio"=>2021],
            ['clave'=>13420,'clave_partida_generica'=>134,"descripcion"=>"Compensaciones por Servicios Especiales", "anio"=>2021],
            ['clave'=>13421,'clave_partida_generica'=>134,"descripcion"=>"Compensación, Esquema Básico (Docente)", "anio"=>2021],
            ['clave'=>13422,'clave_partida_generica'=>134,"descripcion"=>"Compensación Fija", "anio"=>2021],
            ['clave'=>13423,'clave_partida_generica'=>134,"descripcion"=>"Compensación por Zonas Marginadas", "anio"=>2021],
            ['clave'=>13424,'clave_partida_generica'=>134,"descripcion"=>"Compensación Provisional Compactable (Docente)", "anio"=>2021],
            ['clave'=>13425,'clave_partida_generica'=>134,"descripcion"=>"Ajuste de Calendario (Docente)", "anio"=>2021],
            ['clave'=>13426,'clave_partida_generica'=>134,"descripcion"=>"Compensación Adicional para Supervisores", "anio"=>2021],
            ['clave'=>13427,'clave_partida_generica'=>134,"descripcion"=>"Compensación por Actuación y Productividad (CAP)", "anio"=>2021],
            ['clave'=>13428,'clave_partida_generica'=>134,"descripcion"=>"Compensación al Desempeño Docente.", "anio"=>2021],
            ['clave'=>13429,'clave_partida_generica'=>134,"descripcion"=>"Compensación Atención a Grupos Multigrado", "anio"=>2021],
            ['clave'=>13430,'clave_partida_generica'=>134,"descripcion"=>"Compensación por Atención a Grupos de Telesecundaria", "anio"=>2021],
            ['clave'=>13431,'clave_partida_generica'=>134,"descripcion"=>"Compensación por Indemnización, Enfermedad o Riesgo Laboral", "anio"=>2021],
            ['clave'=>13432,'clave_partida_generica'=>134,"descripcion"=>"Compensación a Trabajadores en Escuelas de Tiempo Completo", "anio"=>2021],
            ['clave'=>13433,'clave_partida_generica'=>134,"descripcion"=>"Compensación Provisional Compactable (Carrera Magisterial)", "anio"=>2021],
            ['clave'=>13434,'clave_partida_generica'=>134,"descripcion"=>"Compensación Complementaria por Servicios Especiales", "anio"=>2021],
            ['clave'=>13435,'clave_partida_generica'=>134,"descripcion"=>"Compensación Nacional Única", "anio"=>2021],
            ['clave'=>13436,'clave_partida_generica'=>134,"descripcion"=>"Compensaciones por Servicios Especiales en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>13437,'clave_partida_generica'=>134,"descripcion"=>"Compensaciones por Servicios Especiales en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>13438,'clave_partida_generica'=>134,"descripcion"=>"Compensación Fija al Personal Administrativo en Educación Federalizada", "anio"=>2021],
            ['clave'=>13439,'clave_partida_generica'=>134,"descripcion"=>"Compensación Provisional Compactable al Personal Administrativo en Educación Federalizada", "anio"=>2021],
            ['clave'=>13440,'clave_partida_generica'=>134,"descripcion"=>"Compensación Nacional Única al Personal Administrativo en Educación Federalizada", "anio"=>2021],
            ['clave'=>13441,'clave_partida_generica'=>134,"descripcion"=>"Compensación al Personal Policial", "anio"=>2021],
            ['clave'=>13442,'clave_partida_generica'=>134,"descripcion"=>"Ajuste de Calendario", "anio"=>2021],
            ['clave'=>13443,'clave_partida_generica'=>134,"descripcion"=>"Compensación Complementaria por Servicios Especiales (Policías de Seguridad Pública)", "anio"=>2021],

            ['clave'=>13701,'clave_partida_generica'=>137,"descripcion"=>"Honorarios Especiales", "anio"=>2021],

            ['clave'=>14101,'clave_partida_generica'=>141,"descripcion"=>"Aportaciones al ISSSTE", "anio"=>2021],
            ['clave'=>14103,'clave_partida_generica'=>141,"descripcion"=>"Aportaciones al IMSS", "anio"=>2021],
            ['clave'=>14105,'clave_partida_generica'=>141,"descripcion"=>"Aportaciones al Seguro de Cesantía en Edad Avanzada y Vejez", "anio"=>2021],
            ['clave'=>14111,'clave_partida_generica'=>141,"descripcion"=>"Aportaciones al ISSTECH (Docente Carrera Magisterial)", "anio"=>2021],
            ['clave'=>14114,'clave_partida_generica'=>141,"descripcion"=>"Aportaciones al ISSTECH", "anio"=>2021],
            ['clave'=>14115,'clave_partida_generica'=>141,"descripcion"=>"Aportaciones al ISSTECH (Docente)", "anio"=>2021],
            ['clave'=>14118,'clave_partida_generica'=>141,"descripcion"=>"Prestaciones de Seguridad Social al Sector Policial Operativo", "anio"=>2021],
            ['clave'=>14119,'clave_partida_generica'=>141,"descripcion"=>"Aportaciones al ISSSTE (Docente Carrera Magisterial)", "anio"=>2021],
            ['clave'=>14120,'clave_partida_generica'=>141,"descripcion"=>"Aportaciones al ISSSTE en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>14121,'clave_partida_generica'=>141,"descripcion"=>"Aportaciones al ISSSTE en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>14122,'clave_partida_generica'=>141,"descripcion"=>"Aportaciones al Seguro de Cesantía en Edad Avanzada y Vejez en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>14123,'clave_partida_generica'=>141,"descripcion"=>"Aportaciones al Seguro de Cesantía en Edad Avanzada y Vejez en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>14124,'clave_partida_generica'=>141,"descripcion"=>"Aportaciones al ISSSTE (Docente)", "anio"=>2021],
            ['clave'=>14125,'clave_partida_generica'=>141,"descripcion"=>"Aportaciones al Seguro de Cesantía en Edad Avanzada y Vejez (Docente)", "anio"=>2021],
            ['clave'=>14126,'clave_partida_generica'=>141,"descripcion"=>"Aportaciones al IMSS en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>14127,'clave_partida_generica'=>141,"descripcion"=>"Aportaciones al IMSS en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>14128,'clave_partida_generica'=>141,"descripcion"=>"Prestaciones de Seguridad Social (Policías de Seguridad Pública)", "anio"=>2021],
            ['clave'=>14130,'clave_partida_generica'=>141,"descripcion"=>"Aportaciones al IMSS (Policías de Seguridad Pública)", "anio"=>2021],
            ['clave'=>14131,'clave_partida_generica'=>141,"descripcion"=>"Prestaciones de Seguridad Social al Personal Administrativo en Seguridad Pública", "anio"=>2021],

            ['clave'=>14201,'clave_partida_generica'=>142,"descripcion"=>"Aportaciones al FOVISSSTE", "anio"=>2021],
            ['clave'=>14202,'clave_partida_generica'=>142,"descripcion"=>"Aportaciones al INFONAVIT", "anio"=>2021],
            ['clave'=>14203,'clave_partida_generica'=>142,"descripcion"=>"Aportaciones al FOVISSSTE (Docente Carrera Magisterial)", "anio"=>2021],
            ['clave'=>14204,'clave_partida_generica'=>142,"descripcion"=>"Aportaciones al FOVISSSTE en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>14205,'clave_partida_generica'=>142,"descripcion"=>"Aportaciones al FOVISSSTE en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>14206,'clave_partida_generica'=>142,"descripcion"=>"Aportaciones al FOVISSSTE (Docente)", "anio"=>2021],
            
            ['clave'=>14301,'clave_partida_generica'=>143,"descripcion"=>"Aportaciones al Sistema de Ahorro para el Retiro", "anio"=>2021],
            ['clave'=>14302,'clave_partida_generica'=>143,"descripcion"=>"Depósitos para el Ahorro Solidario", "anio"=>2021],
            ['clave'=>14305,'clave_partida_generica'=>143,"descripcion"=>"Aportaciones al Sistema de Ahorro para el Retiro (Docente Carrera Magisterial)", "anio"=>2021],
            ['clave'=>14306,'clave_partida_generica'=>143,"descripcion"=>"Aportaciones al Sistema de Ahorro para el Retiro en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>14307,'clave_partida_generica'=>143,"descripcion"=>"Aportaciones al Sistema de Ahorro para el Retiro en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>14308,'clave_partida_generica'=>143,"descripcion"=>"Depósitos para el Ahorro Solidario en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>14309,'clave_partida_generica'=>143,"descripcion"=>"Depósitos para el Ahorro Solidario en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>14310,'clave_partida_generica'=>143,"descripcion"=>"Aportaciones al Sistema de Ahorro para el Retiro (Docente)", "anio"=>2021],
                        
            ['clave'=>14401,'clave_partida_generica'=>144,"descripcion"=>"Cuotas para el Seguro de Vida", "anio"=>2021],
            ['clave'=>14412,'clave_partida_generica'=>144,"descripcion"=>"Cuotas para el Seguro de Vida (Docente Carrera Magisterial)", "anio"=>2021],
            ['clave'=>14413,'clave_partida_generica'=>144,"descripcion"=>"Cuotas para el Seguro de Vida en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>14414,'clave_partida_generica'=>144,"descripcion"=>"Cuotas para el Seguro de Vida en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>14415,'clave_partida_generica'=>144,"descripcion"=>"Cuotas para el Seguro de Vida en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>14416,'clave_partida_generica'=>144,"descripcion"=>"Cuotas para el Seguro de Vida (Policías de Seguridad Pública)", "anio"=>2021],
            
            ['clave'=>15206,'clave_partida_generica'=>152,"descripcion"=>"Liquidaciones por Indemnizaciones y por Sueldos y Salarios Caídos", "anio"=>2021],
            ['clave'=>15207,'clave_partida_generica'=>152,"descripcion"=>"Liquidaciones e Indemnizaciones", "anio"=>2021],
            ['clave'=>15208,'clave_partida_generica'=>152,"descripcion"=>"Liquidaciones e Indemnizaciones en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>15209,'clave_partida_generica'=>152,"descripcion"=>"Liquidaciones e Indemnizaciones en Área Administrativa en Salud", "anio"=>2021],

            ['clave'=>15301,'clave_partida_generica'=>153,"descripcion"=>"Prestaciones de Retiro", "anio"=>2021],
            
            ['clave'=>15406,'clave_partida_generica'=>154,"descripcion"=>"Ajuste Salarial Regularizable", "anio"=>2021],
            ['clave'=>15407,'clave_partida_generica'=>154,"descripcion"=>"Material de Apoyo Académico", "anio"=>2021],
            ['clave'=>15408,'clave_partida_generica'=>154,"descripcion"=>"Bono de Fin de Año (Docente)", "anio"=>2021],
            ['clave'=>15409,'clave_partida_generica'=>154,"descripcion"=>"Pago por Días Económicos No Disfrutados (Docente)", "anio"=>2021],
            ['clave'=>15410,'clave_partida_generica'=>154,"descripcion"=>"Canastilla Maternal", "anio"=>2021],
            ['clave'=>15411,'clave_partida_generica'=>154,"descripcion"=>"Ayuda para la Adquisición de Libros por el Día del Maestro", "anio"=>2021],
            ['clave'=>15412,'clave_partida_generica'=>154,"descripcion"=>"Ayuda para la Impresión de Tesis", "anio"=>2021],
            ['clave'=>15413,'clave_partida_generica'=>154,"descripcion"=>"Pago por Días de Descanso Obligatorio (Docente)", "anio"=>2021],
            ['clave'=>15414,'clave_partida_generica'=>154,"descripcion"=>"Paquete Navideño", "anio"=>2021],
            ['clave'=>15415,'clave_partida_generica'=>154,"descripcion"=>"Bono Anual de Participación en la Profesionalización de Docentes", "anio"=>2021],
            ['clave'=>15416,'clave_partida_generica'=>154,"descripcion"=>"Integración Educativa", "anio"=>2021],
            ['clave'=>15417,'clave_partida_generica'=>154,"descripcion"=>"Asignación Docente (Carrera Magisterial)", "anio"=>2021],
            ['clave'=>15418,'clave_partida_generica'=>154,"descripcion"=>"Bono Transitorio a Maestros de Telebachillerato", "anio"=>2021],
            ['clave'=>15419,'clave_partida_generica'=>154,"descripcion"=>"Otras Prestaciones (Docente)", "anio"=>2021],
            ['clave'=>15420,'clave_partida_generica'=>154,"descripcion"=>"Prestaciones en Dinero (Docente Educación Física)", "anio"=>2021],
            ['clave'=>15421,'clave_partida_generica'=>154,"descripcion"=>"Prestaciones en Dinero (Docente)", "anio"=>2021],
            ['clave'=>15422,'clave_partida_generica'=>154,"descripcion"=>"Otras Prestaciones (Exclusivo CONALEP CHIAPAS)", "anio"=>2021],
            ['clave'=>15423,'clave_partida_generica'=>154,"descripcion"=>"Desarrollo Profesional de Carrera (Carrera Administrativa)", "anio"=>2021],
            ['clave'=>15424,'clave_partida_generica'=>154,"descripcion"=>"Asignación Docente", "anio"=>2021],
            ['clave'=>15425,'clave_partida_generica'=>154,"descripcion"=>"Fomento a la Educación", "anio"=>2021],
            ['clave'=>15426,'clave_partida_generica'=>154,"descripcion"=>"Asignaciones Docente y Pedagógica Específicas", "anio"=>2021],
            ['clave'=>15427,'clave_partida_generica'=>154,"descripcion"=>"Asignación Pedagógica", "anio"=>2021],
            ['clave'=>15428,'clave_partida_generica'=>154,"descripcion"=>"Viáticos Fijos (Docente)", "anio"=>2021],
            ['clave'=>15429,'clave_partida_generica'=>154,"descripcion"=>"Diferencial Carrera Magisterial", "anio"=>2021],
            ['clave'=>15430,'clave_partida_generica'=>154,"descripcion"=>"Bono Anual de Participación en la Formación y Profesionalización al Personal Administrativo en Educación Federalizada", "anio"=>2021],
            ['clave'=>15431,'clave_partida_generica'=>154,"descripcion"=>"Ajuste Salarial Regularizable (Docente)", "anio"=>2021],
            ['clave'=>15432,'clave_partida_generica'=>154,"descripcion"=>"Pago por Días Económicos No Disfrutados", "anio"=>2021],
            ['clave'=>15433,'clave_partida_generica'=>154,"descripcion"=>"Pago por Días de Descanso Obligatorio", "anio"=>2021],
            ['clave'=>15434,'clave_partida_generica'=>154,"descripcion"=>"Ajuste Salarial Regularizable (Policías de Seguridad Pública)", "anio"=>2021],
            
            ['clave'=>15906,'clave_partida_generica'=>159,"descripcion"=>"Previsión Social Múltiple", "anio"=>2021],
            ['clave'=>15907,'clave_partida_generica'=>159,"descripcion"=>"Despensa", "anio"=>2021],
            ['clave'=>15908,'clave_partida_generica'=>159,"descripcion"=>"Previsión Social Múltiple (Docente)", "anio"=>2021],
            ['clave'=>15909,'clave_partida_generica'=>159,"descripcion"=>"Despensa (Docente)", "anio"=>2021],
            ['clave'=>15910,'clave_partida_generica'=>159,"descripcion"=>"Previsión Social Múltiple en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>15911,'clave_partida_generica'=>159,"descripcion"=>"Previsión Social Múltiple en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>15912,'clave_partida_generica'=>159,"descripcion"=>"Despensa en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>15913,'clave_partida_generica'=>159,"descripcion"=>"Despensa en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>15914,'clave_partida_generica'=>159,"descripcion"=>"Previsión Social Múltiple (Policías de Seguridad Pública)", "anio"=>2021],
            
            ['clave'=>16101,'clave_partida_generica'=>161,"descripcion"=>"Incrementos a las Percepciones", "anio"=>2021],

            ['clave'=>17102,'clave_partida_generica'=>171,"descripcion"=>"Estímulos al Personal", "anio"=>2021],
            ['clave'=>17103,'clave_partida_generica'=>171,"descripcion"=>"Incentivo al Personal", "anio"=>2021],
            ['clave'=>17104,'clave_partida_generica'=>171,"descripcion"=>"Estímulo por Productividad al Trabajo (Exclusivo Personal Docente)", "anio"=>2021],
            ['clave'=>17105,'clave_partida_generica'=>171,"descripcion"=>"Incentivo al Trabajo (Exclusivo Personal Policial)", "anio"=>2021],
            ['clave'=>17106,'clave_partida_generica'=>171,"descripcion"=>"Bono por Productividad", "anio"=>2021],
            ['clave'=>17107,'clave_partida_generica'=>171,"descripcion"=>"Incentivo al Personal (Docente)", "anio"=>2021],
            ['clave'=>17108,'clave_partida_generica'=>171,"descripcion"=>"Apoyo para la Superación Académica", "anio"=>2021],
            ['clave'=>17110,'clave_partida_generica'=>171,"descripcion"=>"Estímulo por Antigüedad (Docente)", "anio"=>2021],
            ['clave'=>17111,'clave_partida_generica'=>171,"descripcion"=>"Estímulos por Asistencia y Puntualidad (Docente)", "anio"=>2021],
            ['clave'=>17112,'clave_partida_generica'=>171,"descripcion"=>"Estímulo para Directores de las Escuelas de Educación Media y Superior", "anio"=>2021],
            ['clave'=>17113,'clave_partida_generica'=>171,"descripcion"=>"Estímulos al Personal en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>17114,'clave_partida_generica'=>171,"descripcion"=>"Estímulos al Personal en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>17115,'clave_partida_generica'=>171,"descripcion"=>"Estímulos por Asistencia y Puntualidad en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>17116,'clave_partida_generica'=>171,"descripcion"=>"Estímulos por Asistencia y Puntualidad en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>17117,'clave_partida_generica'=>171,"descripcion"=>"Bono por Productividad en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>17118,'clave_partida_generica'=>171,"descripcion"=>"Bono por Productividad en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>17119,'clave_partida_generica'=>171,"descripcion"=>"Incentivo al Personal Eventual en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>17120,'clave_partida_generica'=>171,"descripcion"=>"Incentivo al Personal Eventual en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>17121,'clave_partida_generica'=>171,"descripcion"=>"Promoción en la Función por Incentivos en Educación Básica", "anio"=>2021],
            ['clave'=>17122,'clave_partida_generica'=>171,"descripcion"=>"Promoción en la Función por Incentivos en Educación Media Superior", "anio"=>2021],
            ['clave'=>17123,'clave_partida_generica'=>171,"descripcion"=>"Bono por Productividad al Personal Administrativo en Educación", "anio"=>2021],
            ['clave'=>17124,'clave_partida_generica'=>171,"descripcion"=>"Incentivo al Personal en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>17125,'clave_partida_generica'=>171,"descripcion"=>"Incentivo al Personal en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>17126,'clave_partida_generica'=>171,"descripcion"=>"Estímulos al Personal (Policías de Seguridad Pública)", "anio"=>2021],
            ['clave'=>17127,'clave_partida_generica'=>171,"descripcion"=>"Incentivos al Personal (Policías de Seguridad Pública)", "anio"=>2021],
            ['clave'=>17128,'clave_partida_generica'=>171,"descripcion"=>"Incentivo al Trabajo Operativo (Policías de Seguridad Pública)", "anio"=>2021],
            ['clave'=>17129,'clave_partida_generica'=>171,"descripcion"=>"Incentivo al Trabajo para el Personal de Ayudantía", "anio"=>2021],

            ['clave'=>21101,'clave_partida_generica'=>211,"descripcion"=>"Materiales y Útiles de Oficina", "anio"=>2021],
            
            ['clave'=>21201,'clave_partida_generica'=>212,"descripcion"=>"Materiales y Útiles de Impresión y Reproducción", "anio"=>2021],
            ['clave'=>21202,'clave_partida_generica'=>212,"descripcion"=>"Materiales Fotográficos", "anio"=>2021],
            ['clave'=>21203,'clave_partida_generica'=>212,"descripcion"=>"Materiales Heliográficos", "anio"=>2021],
            
            ['clave'=>21301,'clave_partida_generica'=>213,"descripcion"=>"Material Estadístico y Geográfico", "anio"=>2021],

            ['clave'=>21401,'clave_partida_generica'=>214,"descripcion"=>"Materiales y Útiles Consumibles para el Procesamiento en Equipos y Bienes Informáticos", "anio"=>2021],

            ['clave'=>21506,'clave_partida_generica'=>215,"descripcion"=>"Material para el Desarrollo de la Información.", "anio"=>2021],
            ['clave'=>21507,'clave_partida_generica'=>215,"descripcion"=>"Servicios de Suscripción e Información", "anio"=>2021],
            
            ['clave'=>21601,'clave_partida_generica'=>216,"descripcion"=>"Material de Limpieza", "anio"=>2021],

            ['clave'=>21701,'clave_partida_generica'=>217,"descripcion"=>"Materiales Didácticos para Planteles Educativos.", "anio"=>2021],
            ['clave'=>21706,'clave_partida_generica'=>217,"descripcion"=>"Material para Información en Actividades de Investigación Científica y Tecnológica", "anio"=>2021],

            ['clave'=>22111,'clave_partida_generica'=>221,"descripcion"=>"Productos Alimenticios para Personas", "anio"=>2021],
            ['clave'=>22112,'clave_partida_generica'=>221,"descripcion"=>"Productos Alimenticios para Personas Recluidas en los Centros de Readaptación Social", "anio"=>2021],            

            ['clave'=>22201,'clave_partida_generica'=>222,"descripcion"=>"Productos Alimenticios para Animales", "anio"=>2021],

            ['clave'=>22301,'clave_partida_generica'=>223,"descripcion"=>"Utensilios para el Servicio de Alimentación", "anio"=>2021],            

            ['clave'=>23101,'clave_partida_generica'=>231,"descripcion"=>"Productos Alimenticios, Agropecuarios y Forestales Adquiridos como Materia Prima", "anio"=>2021],
            
            ['clave'=>23201,'clave_partida_generica'=>232,"descripcion"=>"Insumos Textiles Adquiridos como Materia Prima", "anio"=>2021],
            
            ['clave'=>23301,'clave_partida_generica'=>233,"descripcion"=>"Productos de Papel, Cartón e Impresos Adquiridos como Materia Prima", "anio"=>2021],
            
            ['clave'=>23401,'clave_partida_generica'=>234,"descripcion"=>"Combustibles, Lubricantes, Aditivos, Carbón y sus Derivados Adquiridos como Materia Prima", "anio"=>2021],
            
            ['clave'=>23501,'clave_partida_generica'=>235,"descripcion"=>"Productos Químicos, Farmacéuticos y de Laboratorio Adquiridos como Materia Prima", "anio"=>2021],
            
            ['clave'=>23601,'clave_partida_generica'=>236,"descripcion"=>"Productos Metálicos y a Base de Minerales no Metálicos Adquiridos como Materia Prima", "anio"=>2021],
            
            ['clave'=>23701,'clave_partida_generica'=>237,"descripcion"=>"Productos de Cuero, Piel, Plástico y Hule Adquiridos como Materia Prima", "anio"=>2021],
            
            ['clave'=>23801,'clave_partida_generica'=>238,"descripcion"=>"Mercancías para su Comercialización en Tiendas del Sector Público", "anio"=>2021],

            ['clave'=>23901,'clave_partida_generica'=>239,"descripcion"=>"Otros Productos Adquiridos como Materia Prima", "anio"=>2021],
            
            ['clave'=>24101,'clave_partida_generica'=>241,"descripcion"=>"Productos Minerales no Metálicos", "anio"=>2021],
            
            ['clave'=>24201,'clave_partida_generica'=>242,"descripcion"=>"Cemento y Productos de Concreto", "anio"=>2021],
            
            ['clave'=>24301,'clave_partida_generica'=>243,"descripcion"=>"Cal, Yeso y Productos de Yeso", "anio"=>2021],

            ['clave'=>24401,'clave_partida_generica'=>244,"descripcion"=>"Madera y Productos de Madera", "anio"=>2021],

            ['clave'=>24501,'clave_partida_generica'=>245,"descripcion"=>"Vidrio y Productos de Vidrio", "anio"=>2021],

            ['clave'=>24601,'clave_partida_generica'=>246,"descripcion"=>"Material Eléctrico y Electrónico", "anio"=>2021],

            ['clave'=>24701,'clave_partida_generica'=>247,"descripcion"=>"Artículos Metálicos para la Construcción", "anio"=>2021],

            ['clave'=>24801,'clave_partida_generica'=>248,"descripcion"=>"Materiales Complementarios", "anio"=>2021],

            ['clave'=>24901,'clave_partida_generica'=>249,"descripcion"=>"Otros Materiales y Artículos de Construcción y Reparación", "anio"=>2021],

            ['clave'=>25101,'clave_partida_generica'=>251,"descripcion"=>"Productos Químicos Básicos", "anio"=>2021],

            ['clave'=>25201,'clave_partida_generica'=>252,"descripcion"=>"Plaguicidas, Abonos y Fertilizantes", "anio"=>2021],
            
            ['clave'=>25301,'clave_partida_generica'=>253,"descripcion"=>"Medicinas y Productos Farmacéuticos", "anio"=>2021],

            ['clave'=>25401,'clave_partida_generica'=>254,"descripcion"=>"Materiales, Accesorios y Suministros Médicos", "anio"=>2021],

            ['clave'=>25501,'clave_partida_generica'=>255,"descripcion"=>"Materiales, Accesorios y Suministros de Laboratorio", "anio"=>2021],

            ['clave'=>25601,'clave_partida_generica'=>256,"descripcion"=>"Fibras Sintéticas, Hules, Plásticos y Derivados", "anio"=>2021],

            ['clave'=>25901,'clave_partida_generica'=>259,"descripcion"=>"Otros Productos Químicos", "anio"=>2021],

            ['clave'=>26111,'clave_partida_generica'=>261,"descripcion"=>"Combustibles", "anio"=>2021],
            ['clave'=>26112,'clave_partida_generica'=>261,"descripcion"=>"Lubricantes y Aditivos", "anio"=>2021],

            ['clave'=>26201,'clave_partida_generica'=>262,"descripcion"=>"Carbón y sus Derivados", "anio"=>2021],

            ['clave'=>27101,'clave_partida_generica'=>271,"descripcion"=>"Vestuario y Uniformes", "anio"=>2021],

            ['clave'=>27201,'clave_partida_generica'=>272,"descripcion"=>"Prendas de Protección Personal", "anio"=>2021],

            ['clave'=>27301,'clave_partida_generica'=>273,"descripcion"=>"Artículos Deportivos", "anio"=>2021],

            ['clave'=>27401,'clave_partida_generica'=>274,"descripcion"=>"Productos Textiles", "anio"=>2021],

            ['clave'=>27501,'clave_partida_generica'=>275,"descripcion"=>"Blancos y Otros Productos Textiles, Excepto Prendas de Vestir", "anio"=>2021],

            ['clave'=>28101,'clave_partida_generica'=>281,"descripcion"=>"Sustancias y Materiales Explosivos", "anio"=>2021],
            
            ['clave'=>28201,'clave_partida_generica'=>282,"descripcion"=>"Materiales de Seguridad Pública", "anio"=>2021],
            
            ['clave'=>28301,'clave_partida_generica'=>283,"descripcion"=>"Prendas de Protección para Seguridad Pública y Nacional", "anio"=>2021],

            ['clave'=>29101,'clave_partida_generica'=>291,"descripcion"=>"Herramientas Menores", "anio"=>2021],

            ['clave'=>29201,'clave_partida_generica'=>292,"descripcion"=>"Refacciones y Accesorios Menores de Edificios", "anio"=>2021],

            ['clave'=>29301,'clave_partida_generica'=>293,"descripcion"=>"Refacciones y Accesorios Menores de Mobiliario y Equipo de Administración, Educacional y Recreativo", "anio"=>2021],

            ['clave'=>29401,'clave_partida_generica'=>294,"descripcion"=>"Refacciones y Accesorios para Equipo de Cómputo y Telecomunicaciones", "anio"=>2021],
            
            ['clave'=>29501,'clave_partida_generica'=>295,"descripcion"=>"Refacciones y Accesorios Menores de Equipo e Instrumental Médico y de Laboratorio", "anio"=>2021],

            ['clave'=>29601,'clave_partida_generica'=>296,"descripcion"=>"Refacciones y Accesorios Menores de Equipo de Transporte", "anio"=>2021],

            ['clave'=>29701,'clave_partida_generica'=>297,"descripcion"=>"Refacciones y Accesorios Menores de Equipo de Defensa y Seguridad", "anio"=>2021],
            
            ['clave'=>29801,'clave_partida_generica'=>298,"descripcion"=>"Refacciones y Accesorios Menores de Maquinaria y Otros Equipos", "anio"=>2021],
            
            ['clave'=>29901,'clave_partida_generica'=>299,"descripcion"=>"Refacciones y Accesorios Menores Otros Bienes Muebles", "anio"=>2021],

            ['clave'=>31101,'clave_partida_generica'=>311,"descripcion"=>"Servicio de Energía Eléctrica", "anio"=>2021],
            ['clave'=>31102,'clave_partida_generica'=>311,"descripcion"=>"Servicio de Energía Eléctrica a Escuelas de Educación Básica", "anio"=>2021],

            ['clave'=>31201,'clave_partida_generica'=>312,"descripcion"=>"Servicio de Gas", "anio"=>2021],

            ['clave'=>31301,'clave_partida_generica'=>313,"descripcion"=>"Servicio de Agua", "anio"=>2021],
            ['clave'=>31302,'clave_partida_generica'=>313,"descripcion"=>"Servicio de Agua a Escuelas de Educación Básica", "anio"=>2021],

            ['clave'=>31401,'clave_partida_generica'=>314,"descripcion"=>"Servicio Telefónico Convencional", "anio"=>2021],
            
            ['clave'=>31501,'clave_partida_generica'=>315,"descripcion"=>"Servicio de Telefonía Celular", "anio"=>2021],

            ['clave'=>31601,'clave_partida_generica'=>316,"descripcion"=>"Servicio de Radiolocalización", "anio"=>2021],
            ['clave'=>31602,'clave_partida_generica'=>316,"descripcion"=>"Servicio de Telecomunicaciones", "anio"=>2021],

            ['clave'=>31701,'clave_partida_generica'=>317,"descripcion"=>"Servicio de Conducción de Señales Analógicas y Digitales", "anio"=>2021],
            ['clave'=>31706,'clave_partida_generica'=>317,"descripcion"=>"Servicios de Internet", "anio"=>2021],

            ['clave'=>31801,'clave_partida_generica'=>318,"descripcion"=>"Servicio Postal", "anio"=>2021],
            ['clave'=>31802,'clave_partida_generica'=>318,"descripcion"=>"Servicio Telegráfico", "anio"=>2021],

            ['clave'=>31901,'clave_partida_generica'=>319,"descripcion"=>"Servicios Integrales", "anio"=>2021],
            ['clave'=>31902,'clave_partida_generica'=>319,"descripcion"=>"Contratación de Otros Servicios", "anio"=>2021],

            ['clave'=>32101,'clave_partida_generica'=>321,"descripcion"=>"Arrendamiento de Terrenos", "anio"=>2021],

            ['clave'=>32201,'clave_partida_generica'=>322,"descripcion"=>"Arrendamiento de Edificios y Locales", "anio"=>2021],

            ['clave'=>32301,'clave_partida_generica'=>323,"descripcion"=>"Arrendamiento de Equipo y Bienes Informáticos", "anio"=>2021],
            ['clave'=>32302,'clave_partida_generica'=>323,"descripcion"=>"Arrendamiento de Mobiliario", "anio"=>2021],
            ['clave'=>32303,'clave_partida_generica'=>323,"descripcion"=>"Arrendamiento de Equipo de Telecomunicaciones", "anio"=>2021],
            ['clave'=>32304,'clave_partida_generica'=>323,"descripcion"=>"Arrendamiento de Equipo de Administración", "anio"=>2021],

            ['clave'=>32401,'clave_partida_generica'=>324,"descripcion"=>"Arrendamiento de Equipo e Instrumental Médico y de Laboratorio", "anio"=>2021],

            ['clave'=>32511,'clave_partida_generica'=>325,"descripcion"=>"Arrendamiento de Vehículos", "anio"=>2021],

            ['clave'=>32601,'clave_partida_generica'=>326,"descripcion"=>"Arrendamiento de Maquinaria y Equipo", "anio"=>2021],
            
            ['clave'=>32701,'clave_partida_generica'=>327,"descripcion"=>"Patentes, Derechos de Autor, Regalías y Otros", "anio"=>2021],
            
            ['clave'=>32801,'clave_partida_generica'=>328,"descripcion"=>"Arrendamiento Financiero", "anio"=>2021],

            ['clave'=>32903,'clave_partida_generica'=>329,"descripcion"=>"Otros Arrendamientos", "anio"=>2021],
            ['clave'=>32904,'clave_partida_generica'=>329,"descripcion"=>"Depositaría Productiva", "anio"=>2021],

            ['clave'=>33101,'clave_partida_generica'=>331,"descripcion"=>"Asesorías Asociadas a Convenios, Tratados o Acuerdos", "anio"=>2021],
            ['clave'=>33102,'clave_partida_generica'=>331,"descripcion"=>"Asesorías por Controversias en el Marco de los Tratados Internacionales", "anio"=>2021],
            ['clave'=>33103,'clave_partida_generica'=>331,"descripcion"=>"Consultorías para Programas o Proyectos Financiados por Organismos Internacionales", "anio"=>2021],
            ['clave'=>33104,'clave_partida_generica'=>331,"descripcion"=>"Otras Asesorías para la Operación de Programas", "anio"=>2021],
            ['clave'=>33105,'clave_partida_generica'=>331,"descripcion"=>"Servicios Relacionados con Procedimientos Jurisdiccionales", "anio"=>2021],
            ['clave'=>33111,'clave_partida_generica'=>331,"descripcion"=>"Asesorías", "anio"=>2021],
            ['clave'=>33113,'clave_partida_generica'=>331,"descripcion"=>"Servicios de Dictaminación", "anio"=>2021],

            ['clave'=>33201,'clave_partida_generica'=>332,"descripcion"=>"Servicios de Diseño, Arquitectura, Ingeniería y Actividades Relacionadas", "anio"=>2021],
            ['clave'=>33202,'clave_partida_generica'=>332,"descripcion"=>"Otros Servicios Especializados", "anio"=>2021],

            ['clave'=>33301,'clave_partida_generica'=>333,"descripcion"=>"Servicios de Desarrollo de Aplicaciones Informáticas", "anio"=>2021],
            ['clave'=>33302,'clave_partida_generica'=>333,"descripcion"=>"Servicios Estadísticos y Geográficos", "anio"=>2021],
            ['clave'=>33303,'clave_partida_generica'=>333,"descripcion"=>"Servicios Relacionados con Certificación de Procesos", "anio"=>2021],
            ['clave'=>33304,'clave_partida_generica'=>333,"descripcion"=>"Servicios de Mantenimiento de Aplicaciones Informáticas", "anio"=>2021],

            ['clave'=>33401,'clave_partida_generica'=>334,"descripcion"=>"Servicios para Capacitación a Servidores Públicos", "anio"=>2021],
            ['clave'=>33402,'clave_partida_generica'=>334,"descripcion"=>"Servicios para Capacitación Social y Productiva", "anio"=>2021],

            ['clave'=>33501,'clave_partida_generica'=>335,"descripcion"=>"Estudios e Investigaciones", "anio"=>2021],
            
            ['clave'=>33601,'clave_partida_generica'=>336,"descripcion"=>"Servicios Relacionados con Traducciones", "anio"=>2021],
            ['clave'=>33602,'clave_partida_generica'=>336,"descripcion"=>"Servicios de Apoyo Administrativo, Fotocopiado e Impresión", "anio"=>2021],
            ['clave'=>33603,'clave_partida_generica'=>336,"descripcion"=>"Impresiones Oficiales", "anio"=>2021],
            ['clave'=>33606,'clave_partida_generica'=>336,"descripcion"=>"Servicios de Digitalización", "anio"=>2021],
            
            ['clave'=>33701,'clave_partida_generica'=>337,"descripcion"=>"Servicios de Acopio de Información para la Procuración de Justicia.", "anio"=>2021],

            ['clave'=>33801,'clave_partida_generica'=>338,"descripcion"=>"Servicios de Vigilancia", "anio"=>2021],

            ['clave'=>33901,'clave_partida_generica'=>339,"descripcion"=>"Subcontratación de Servicios con Terceros", "anio"=>2021],
            ['clave'=>33903,'clave_partida_generica'=>339,"descripcion"=>"Servicios Integrales", "anio"=>2021],
            ['clave'=>33904,'clave_partida_generica'=>339,"descripcion"=>"Asignaciones derivadas de Proyectos de Asociación Público Privada", "anio"=>2021],
            ['clave'=>33905,'clave_partida_generica'=>339,"descripcion"=>"Servicios Integrales en Materia de Seguridad Pública", "anio"=>2021],
            ['clave'=>33906,'clave_partida_generica'=>339,"descripcion"=>"Asignaciones para Cubrir el Pago de Obligaciones Derivadas de Títulos de Concesión o de Asignación", "anio"=>2021],
            ['clave'=>33911,'clave_partida_generica'=>339,"descripcion"=>"Estudios y Análisis Bioquímicos", "anio"=>2021],
            ['clave'=>33912,'clave_partida_generica'=>339,"descripcion"=>"Estudios y Análisis Bioquímicos (Animales)", "anio"=>2021],
            ['clave'=>33913,'clave_partida_generica'=>339,"descripcion"=>"Subrogaciones", "anio"=>2021],
            ['clave'=>33914,'clave_partida_generica'=>339,"descripcion"=>"Servicios Médicos", "anio"=>2021],
            ['clave'=>33915,'clave_partida_generica'=>339,"descripcion"=>"Servicios Hospitalarios", "anio"=>2021],
            ['clave'=>33916,'clave_partida_generica'=>339,"descripcion"=>"Servicios de Análisis y Farmacéuticos", "anio"=>2021],

            ['clave'=>34101,'clave_partida_generica'=>341,"descripcion"=>"Servicios Bancarios y Financieros", "anio"=>2021],
            ['clave'=>34102,'clave_partida_generica'=>341,"descripcion"=>"Servicios de Valoración", "anio"=>2021],
                        
            ['clave'=>34301,'clave_partida_generica'=>343,"descripcion"=>"Servicios de Recaudación, Traslado y Custodia de Valores", "anio"=>2021],
            
            ['clave'=>34401,'clave_partida_generica'=>344,"descripcion"=>"Seguros de Responsabilidad Patrimonial del Estado", "anio"=>2021],
            
            ['clave'=>34501,'clave_partida_generica'=>345,"descripcion"=>"Seguro de Bienes Patrimoniales", "anio"=>2021],
            
            ['clave'=>34601,'clave_partida_generica'=>346,"descripcion"=>"Almacenaje, Envase y Embalaje", "anio"=>2021],
            
            ['clave'=>34701,'clave_partida_generica'=>347,"descripcion"=>"Fletes y Maniobras", "anio"=>2021],
            
            ['clave'=>34801,'clave_partida_generica'=>348,"descripcion"=>"Comisiones por Ventas", "anio"=>2021],

            ['clave'=>35106,'clave_partida_generica'=>351,"descripcion"=>"Conservación y Mantenimiento Menor de Inmuebles", "anio"=>2021],
            
            ['clave'=>35201,'clave_partida_generica'=>352,"descripcion"=>"Mantenimiento y Conservación de Mobiliario y Equipo de Administración", "anio"=>2021],
            
            ['clave'=>35301,'clave_partida_generica'=>353,"descripcion"=>"Mantenimiento y Conservación de Bienes Informáticos", "anio"=>2021],
            
            ['clave'=>35401,'clave_partida_generica'=>354,"descripcion"=>"Instalación, Reparación y Mantenimiento de Equipo e Instrumental Médico y de Laboratorio", "anio"=>2021],
            
            ['clave'=>35501,'clave_partida_generica'=>355,"descripcion"=>"Mantenimiento, Conservación y Reparación de Vehículos Terrestres, Aéreos, Marítimos, Lacustres y Fluviales", "anio"=>2021],
            
            ['clave'=>35601,'clave_partida_generica'=>356,"descripcion"=>"Reparación y Mantenimiento de Equipo de Defensa y Seguridad", "anio"=>2021],

            ['clave'=>35701,'clave_partida_generica'=>357,"descripcion"=>"Mantenimiento y Conservación de Maquinaria y Equipo", "anio"=>2021],
            ['clave'=>35706,'clave_partida_generica'=>357,"descripcion"=>"Instalaciones", "anio"=>2021],
            
            ['clave'=>35801,'clave_partida_generica'=>358,"descripcion"=>"Servicios de Lavandería, Limpieza, Higiene y Fumigación", "anio"=>2021],
            
            ['clave'=>35901,'clave_partida_generica'=>359,"descripcion"=>"Servicios de Jardinería y Fumigación", "anio"=>2021],

            ['clave'=>36102,'clave_partida_generica'=>361,"descripcion"=>"Publicaciones Oficiales", "anio"=>2021],
            ['clave'=>36103,'clave_partida_generica'=>361,"descripcion"=>"Otros Gastos de Difusión e Información", "anio"=>2021],
            ['clave'=>36104,'clave_partida_generica'=>361,"descripcion"=>"Gastos de Propaganda", "anio"=>2021],
            
            ['clave'=>36201,'clave_partida_generica'=>362,"descripcion"=>"Difusión por Radio, Televisión y Otros Medios de Mensajes Comerciales para Promover la Venta de Bienes o Servicios", "anio"=>2021],
            
            ['clave'=>36301,'clave_partida_generica'=>363,"descripcion"=>"Servicios de Creatividad, Preproducción y Producción de Publicidad, Excepto Internet", "anio"=>2021],
            
            ['clave'=>36401,'clave_partida_generica'=>364,"descripcion"=>"Servicios de Revelado de Fotografías", "anio"=>2021],
           
            ['clave'=>36501,'clave_partida_generica'=>365,"descripcion"=>"Servicios de la Industria Fílmica, del Sonido y del Video", "anio"=>2021],
           
            ['clave'=>37111,'clave_partida_generica'=>371,"descripcion"=>"Pasajes Nacionales Aéreos", "anio"=>2021],
            ['clave'=>37112,'clave_partida_generica'=>371,"descripcion"=>"Pasajes Internacionales Aéreos", "anio"=>2021],
            
            ['clave'=>37211,'clave_partida_generica'=>372,"descripcion"=>"Pasajes Nacionales Terrestres", "anio"=>2021],
            ['clave'=>37212,'clave_partida_generica'=>372,"descripcion"=>"Pasajes Internacionales Terrestres", "anio"=>2021],
            ['clave'=>37213,'clave_partida_generica'=>372,"descripcion"=>"Otros Pasajes", "anio"=>2021],

            ['clave'=>37311,'clave_partida_generica'=>373,"descripcion"=>"Pasajes Nacionales Marítimos, Lacustres y Fluviales", "anio"=>2021],
            ['clave'=>37312,'clave_partida_generica'=>373,"descripcion"=>"Pasajes Internacionales Marítimos, Lacustres y Fluviales", "anio"=>2021],
            
            ['clave'=>37401,'clave_partida_generica'=>374,"descripcion"=>"Autotransporte", "anio"=>2021],

            ['clave'=>37511,'clave_partida_generica'=>375,"descripcion"=>"Viáticos Nacionales", "anio"=>2021],

            ['clave'=>37602,'clave_partida_generica'=>376,"descripcion"=>"Viáticos en el Extranjero", "anio"=>2021],

            ['clave'=>37806,'clave_partida_generica'=>378,"descripcion"=>"Servicios Integrales de Traslado y Viáticos", "anio"=>2021],
            
            ['clave'=>37901,'clave_partida_generica'=>379,"descripcion"=>"Gastos para Operativos y Trabajos de Campo en Áreas Rurales", "anio"=>2021],
            ['clave'=>37902,'clave_partida_generica'=>379,"descripcion"=>"Hospedaje", "anio"=>2021],

            ['clave'=>38101,'clave_partida_generica'=>381,"descripcion"=>"Gastos de Ceremonial", "anio"=>2021],

            ['clave'=>38201,'clave_partida_generica'=>382,"descripcion"=>"Gastos de Orden Social", "anio"=>2021],
            ['clave'=>38202,'clave_partida_generica'=>382,"descripcion"=>"Gastos de Orden Cultural", "anio"=>2021],

            ['clave'=>38301,'clave_partida_generica'=>383,"descripcion"=>"Congresos y Convenciones", "anio"=>2021],

            ['clave'=>38401,'clave_partida_generica'=>384,"descripcion"=>"Exposiciones", "anio"=>2021],

            ['clave'=>39101,'clave_partida_generica'=>391,"descripcion"=>"Funerales y Pagas de Defunción", "anio"=>2021],
            ['clave'=>39103,'clave_partida_generica'=>391,"descripcion"=>"Pagas de Defunción (Docente)", "anio"=>2021],

            ['clave'=>39201,'clave_partida_generica'=>392,"descripcion"=>"Impuestos y Derechos de Exportación", "anio"=>2021],
            ['clave'=>39202,'clave_partida_generica'=>392,"descripcion"=>"Otros Impuestos y Derechos.", "anio"=>2021],
            ['clave'=>39203,'clave_partida_generica'=>392,"descripcion"=>"Otras Contribuciones", "anio"=>2021],

            ['clave'=>39301,'clave_partida_generica'=>393,"descripcion"=>"Impuestos y Derechos de Importación", "anio"=>2021],

            ['clave'=>39401,'clave_partida_generica'=>394,"descripcion"=>"Erogaciones por Sentencias y Resoluciones por Autoridad Competente", "anio"=>2021],
            ['clave'=>39402,'clave_partida_generica'=>394,"descripcion"=>"Indemnizaciones por Expropiación de Predios", "anio"=>2021],
            ['clave'=>39403,'clave_partida_generica'=>394,"descripcion"=>"Otras Asignaciones Derivadas de Resoluciones de Ley", "anio"=>2021],
            
            ['clave'=>39501,'clave_partida_generica'=>395,"descripcion"=>"Penas, Multas, Accesorios y Actualizaciones", "anio"=>2021],

            ['clave'=>39601,'clave_partida_generica'=>396,"descripcion"=>"Pérdidas del Erario Estatal", "anio"=>2021],
            ['clave'=>39602,'clave_partida_generica'=>396,"descripcion"=>"Otros Gastos por Responsabilidades", "anio"=>2021],
            ['clave'=>39603,'clave_partida_generica'=>396,"descripcion"=>"Gastos para Equilibrar el Ingreso", "anio"=>2021],

            ['clave'=>39701,'clave_partida_generica'=>397,"descripcion"=>"Erogaciones por Pago de Utilidades", "anio"=>2021],

            ['clave'=>39801,'clave_partida_generica'=>398,"descripcion"=>"Impuesto Sobre Nóminas y Otros que se Deriven de una Relación Laboral", "anio"=>2021],
            ['clave'=>39802,'clave_partida_generica'=>398,"descripcion"=>"Impuesto Sobre Nóminas y Otros que se Deriven de una Relación Laboral en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>39803,'clave_partida_generica'=>398,"descripcion"=>"Impuesto Sobre Nóminas y Otros que se Deriven de una Relación Laboral en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>39804,'clave_partida_generica'=>398,"descripcion"=>"Impuesto Sobre Nóminas y Otros que se Deriven de una Relación Laboral (Docente)", "anio"=>2021],
            ['clave'=>39805,'clave_partida_generica'=>398,"descripcion"=>"Impuesto Sobre Nóminas y Otros que se Deriven de una Relación Laboral (Policías de Seguridad Pública)", "anio"=>2021],
            
            ['clave'=>39905,'clave_partida_generica'=>399,"descripcion"=>"Actividades de Enlace, Entrega y Recepción de la Administración Pública Estatal", "anio"=>2021],
            ['clave'=>39916,'clave_partida_generica'=>399,"descripcion"=>"Seguro Agropecuario Catastrófico", "anio"=>2021],
            

            ['clave'=>41101,'clave_partida_generica'=>411,"descripcion"=>"Transferencias para Servicios Personales", "anio"=>2021],
            ['clave'=>41102,'clave_partida_generica'=>411,"descripcion"=>"Transferencias para Materiales y Suministros", "anio"=>2021],
            ['clave'=>41103,'clave_partida_generica'=>411,"descripcion"=>"Transferencias para Servicios Generales", "anio"=>2021],
            ['clave'=>41104,'clave_partida_generica'=>411,"descripcion"=>"Transferencias para Adquisición para Bienes Muebles, Inmuebles e Intangibles", "anio"=>2021],
            ['clave'=>41105,'clave_partida_generica'=>411,"descripcion"=>"Transferencias para Subsidios y Ayudas", "anio"=>2021],
            ['clave'=>41106,'clave_partida_generica'=>411,"descripcion"=>"Transferencias para Inversión Pública", "anio"=>2021],
            ['clave'=>41107,'clave_partida_generica'=>411,"descripcion"=>"Transferencias para Inversiones Financieras (Exclusivo Secretaría de Educación)", "anio"=>2021],
            ['clave'=>41108,'clave_partida_generica'=>411,"descripcion"=>"Aportaciones Públicas", "anio"=>2021],
            ['clave'=>41109,'clave_partida_generica'=>411,"descripcion"=>"Transferencias para Servicios Personales en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>41110,'clave_partida_generica'=>411,"descripcion"=>"Transferencias para Servicios Personales en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>41111,'clave_partida_generica'=>411,"descripcion"=>"Transferencias para Servicios Personales (Docente)", "anio"=>2021],
            
            ['clave'=>41301,'clave_partida_generica'=>413,"descripcion"=>"Transferencias para Administración de Justicia", "anio"=>2021],
            
            ['clave'=>41501,'clave_partida_generica'=>415,"descripcion"=>"Transferencias para Servicios Personales", "anio"=>2021],
            ['clave'=>41502,'clave_partida_generica'=>415,"descripcion"=>"Transferencias para Materiales y Suministros", "anio"=>2021],
            ['clave'=>41503,'clave_partida_generica'=>415,"descripcion"=>"Transferencias para Servicios Generales", "anio"=>2021],
            ['clave'=>41504,'clave_partida_generica'=>415,"descripcion"=>"Transferencias para Subsidios y Ayudas", "anio"=>2021],
            ['clave'=>41505,'clave_partida_generica'=>415,"descripcion"=>"Transferencias para Adquisición de Bienes Muebles, Inmuebles e Intangibles", "anio"=>2021],
            ['clave'=>41506,'clave_partida_generica'=>415,"descripcion"=>"Transferencias para Inversión Pública", "anio"=>2021],
            ['clave'=>41507,'clave_partida_generica'=>415,"descripcion"=>"Transferencias para Servicios Personales en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>41508,'clave_partida_generica'=>415,"descripcion"=>"Transferencias para Servicios Personales en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>41509,'clave_partida_generica'=>415,"descripcion"=>"Transferencias para Servicios Personales (Docente)", "anio"=>2021],
            ['clave'=>41510,'clave_partida_generica'=>415,"descripcion"=>"Transferencias para Servicios Generales (Impuesto Sobre Nóminas y Otros que se Deriven de una Relación Laboral, Docente)", "anio"=>2021],
            ['clave'=>41511,'clave_partida_generica'=>415,"descripcion"=>"Transferencias para Servicios Generales (Impuesto Sobre Nóminas y Otros que se Deriven de una Relación Laboral, Personal Administrativo)", "anio"=>2021],
            ['clave'=>41512,'clave_partida_generica'=>415,"descripcion"=>"Transferencias para Subsidios y Ayudas (Subsidios por Otras Medidas Económicas, Docente)", "anio"=>2021],
            ['clave'=>41513,'clave_partida_generica'=>415,"descripcion"=>"Transferencias para Subsidios y Ayudas (Subsidios por Otras Medidas Económicas, Personal Administrativo)", "anio"=>2021],
            ['clave'=>41514,'clave_partida_generica'=>415,"descripcion"=>"Transferencias para Subsidios y Ayudas (Subsidio al Impuesto Sobre Sueldos y Salarios, Docente)", "anio"=>2021],
            ['clave'=>41515,'clave_partida_generica'=>415,"descripcion"=>"Transferencias para Subsidios y Ayudas (Subsidio al Impuesto Sobre Sueldos y Salarios, Personal Administrativo)", "anio"=>2021],
            
            ['clave'=>42401,'clave_partida_generica'=>424,"descripcion"=>"Transferencias de Recursos a Municipios", "anio"=>2021],
            
            ['clave'=>42501,'clave_partida_generica'=>425,"descripcion"=>"Transferencias a Fideicomisos a Municipios", "anio"=>2021],

            ['clave'=>43101,'clave_partida_generica'=>431,"descripcion"=>"Subsidios a la Producción", "anio"=>2021],
            
            ['clave'=>43201,'clave_partida_generica'=>431,"descripcion"=>"Subsidios a la Distribución", "anio"=>2021],
            
            ['clave'=>43301,'clave_partida_generica'=>433,"descripcion"=>"Subsidios a la Inversión", "anio"=>2021],
            
            ['clave'=>43501,'clave_partida_generica'=>435,"descripcion"=>"Subsidios para Cubrir Diferenciales de Tasas de Interés", "anio"=>2021],
            
            ['clave'=>43601,'clave_partida_generica'=>436,"descripcion"=>"Subsidios para la Adquisición de Vivienda de Interés Social", "anio"=>2021],
            ['clave'=>43606,'clave_partida_generica'=>436,"descripcion"=>"Subsidios a la Vivienda", "anio"=>2021],
            
            ['clave'=>43701,'clave_partida_generica'=>437,"descripcion"=>"Subsidios al Consumo", "anio"=>2021],

            ['clave'=>43801,'clave_partida_generica'=>438,"descripcion"=>"Subsidios a Municipios", "anio"=>2021],
            
            ['clave'=>43905,'clave_partida_generica'=>439,"descripcion"=>"Subsidios a Organismos y Empresas Públicas", "anio"=>2021],
            ['clave'=>43906,'clave_partida_generica'=>439,"descripcion"=>"Subsidios para Servicios Personales", "anio"=>2021],
            ['clave'=>43907,'clave_partida_generica'=>439,"descripcion"=>"Subsidios para Gastos de Operación", "anio"=>2021],
            ['clave'=>43908,'clave_partida_generica'=>439,"descripcion"=>"Subsidios para Adquisición de Bienes Muebles, Inmuebles e Intangibles", "anio"=>2021],
            ['clave'=>43909,'clave_partida_generica'=>439,"descripcion"=>"Subsidios por Otras Medidas Económicas", "anio"=>2021],
            ['clave'=>43910,'clave_partida_generica'=>439,"descripcion"=>"Subsidio al Impuesto Sobre Sueldos y Salarios", "anio"=>2021],
            ['clave'=>43911,'clave_partida_generica'=>439,"descripcion"=>"Otros Subsidios", "anio"=>2021],
            ['clave'=>43912,'clave_partida_generica'=>439,"descripcion"=>"Subsidios para Servicios Personales en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>43913,'clave_partida_generica'=>439,"descripcion"=>"Subsidios para Servicios Personales en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>43914,'clave_partida_generica'=>439,"descripcion"=>"Subsidios para Servicios Personales (Docente)", "anio"=>2021],
            ['clave'=>43915,'clave_partida_generica'=>439,"descripcion"=>"Subsidio al Impuesto Sobre Sueldos y Salarios (Docente)", "anio"=>2021],
            ['clave'=>43916,'clave_partida_generica'=>439,"descripcion"=>"Subsidio al Impuesto Sobre Sueldos y Salarios en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>43917,'clave_partida_generica'=>439,"descripcion"=>"Subsidio al Impuesto Sobre Sueldos y Salarios en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>43918,'clave_partida_generica'=>439,"descripcion"=>"Subsidios por Otras Medidas Económicas (Docente)", "anio"=>2021],
            ['clave'=>43919,'clave_partida_generica'=>439,"descripcion"=>"Subsidios por Otras Medidas Económicas en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>43920,'clave_partida_generica'=>439,"descripcion"=>"Subsidios por Otras Medidas Económicas en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>43921,'clave_partida_generica'=>439,"descripcion"=>"Subsidios para Servicios Personales (Policías de Seguridad Pública)", "anio"=>2021],
            ['clave'=>43922,'clave_partida_generica'=>439,"descripcion"=>"Subsidios por Otras Medidas Económicas (Policías de Seguridad Pública)", "anio"=>2021],
            ['clave'=>43923,'clave_partida_generica'=>439,"descripcion"=>"Subsidio al Impuesto Sobre Sueldos y Salarios (Policías de Seguridad Pública)", "anio"=>2021],

            ['clave'=>44101,'clave_partida_generica'=>441,"descripcion"=>"Ayudas a Organizaciones y Personas (Ayudas Culturales y Sociales)", "anio"=>2021],
            ['clave'=>44102,'clave_partida_generica'=>441,"descripcion"=>"Traslado de Personas", "anio"=>2021],
            ['clave'=>44103,'clave_partida_generica'=>441,"descripcion"=>"Premios", "anio"=>2021],
            ['clave'=>44104,'clave_partida_generica'=>441,"descripcion"=>"Premios, Estímulos, Recompensas, Becas y Seguros a Deportistas", "anio"=>2021],
            ['clave'=>44105,'clave_partida_generica'=>441,"descripcion"=>"Apoyo a Voluntarios que Participan en Diversos Programas", "anio"=>2021],
            ['clave'=>44107,'clave_partida_generica'=>441,"descripcion"=>"Becas", "anio"=>2021],
            ['clave'=>44108,'clave_partida_generica'=>441,"descripcion"=>"Ayudas para Expropiación de Predios", "anio"=>2021],
            ['clave'=>44109,'clave_partida_generica'=>441,"descripcion"=>"Seguro Escolar (Exclusivo Educación Básica)", "anio"=>2021],
            ['clave'=>44110,'clave_partida_generica'=>441,"descripcion"=>"Pensiones de Gracia", "anio"=>2021],
            ['clave'=>44111,'clave_partida_generica'=>441,"descripcion"=>"Ayudas a Organizaciones y Personas (Policías de Seguridad Pública)", "anio"=>2021],
            ['clave'=>44112,'clave_partida_generica'=>441,"descripcion"=>"Ayudas por Afectaciones Derivados de Desastres Naturales", "anio"=>2021],
            
            ['clave'=>44202,'clave_partida_generica'=>442,"descripcion"=>"Becas para Aspirantes en Cursos de Formación Inicial (Exclusivo Seguridad Pública)", "anio"=>2021],
            
            ['clave'=>44301,'clave_partida_generica'=>443,"descripcion"=>"Ayudas a la Educación", "anio"=>2021],
            ['clave'=>44302,'clave_partida_generica'=>443,"descripcion"=>"Ayuda para Arrendamiento de Inmuebles de las Supervisorías Escolares (Exclusivo Educación Básica)", "anio"=>2021],
            ['clave'=>44303,'clave_partida_generica'=>443,"descripcion"=>"Ayudas a Voluntarios que Participan en Programas Especiales de Educación", "anio"=>2021],
                        
            ['clave'=>44501,'clave_partida_generica'=>445,"descripcion"=>"Ayudas a Instituciones Sin Fines de Lucro", "anio"=>2021],
                        
            ['clave'=>44702,'clave_partida_generica'=>447,"descripcion"=>"Financiamiento Público a Partidos Políticos y Agrupaciones Políticas con Registro Autorizado", "anio"=>2021],
            
            ['clave'=>44801,'clave_partida_generica'=>448,"descripcion"=>"Mercancías para su Distribución a la Población", "anio"=>2021],
            ['clave'=>44802,'clave_partida_generica'=>448,"descripcion"=>"Ayudas a Instituciones Educativas Afectadas por Fenómenos Naturales", "anio"=>2021],

            ['clave'=>45201,'clave_partida_generica'=>452,"descripcion"=>"Pago de Pensiones y Jubilaciones", "anio"=>2021],

            ['clave'=>46101,'clave_partida_generica'=>461,"descripcion"=>"Aportaciones a Fideicomisos Públicos", "anio"=>2021],
            ['clave'=>46102,'clave_partida_generica'=>461,"descripcion"=>"Aportaciones a Mandatos Públicos", "anio"=>2021],
            
            ['clave'=>51101,'clave_partida_generica'=>511,"descripcion"=>"Mobiliario", "anio"=>2021],
            ['clave'=>51106,'clave_partida_generica'=>511,"descripcion"=>"Mobiliario Menor", "anio"=>2021],
            
            ['clave'=>51201,'clave_partida_generica'=>512,"descripcion"=>"Muebles, Excepto de Oficina y Estantería", "anio"=>2021],
            ['clave'=>51206,'clave_partida_generica'=>512,"descripcion"=>"Muebles, Excepto de Oficina y Estantería Menor", "anio"=>2021],
            
            ['clave'=>51301,'clave_partida_generica'=>513,"descripcion"=>"Bienes Artísticos y Culturales", "anio"=>2021],
            ['clave'=>51306,'clave_partida_generica'=>513,"descripcion"=>"Bienes Artísticos y Culturales Menores", "anio"=>2021],

            ['clave'=>51501,'clave_partida_generica'=>515,"descripcion"=>"Bienes Informáticos", "anio"=>2021],
            ['clave'=>51506,'clave_partida_generica'=>515,"descripcion"=>"Bienes Informáticos Menores", "anio"=>2021],
            
            ['clave'=>51901,'clave_partida_generica'=>519,"descripcion"=>"Equipo de Administración", "anio"=>2021],
            ['clave'=>51902,'clave_partida_generica'=>519,"descripcion"=>"Adjudicaciones, Expropiaciones e Indemnizaciones de Bienes Muebles", "anio"=>2021],
            ['clave'=>51907,'clave_partida_generica'=>519,"descripcion"=>"Equipo de Administración Menor", "anio"=>2021],

            ['clave'=>52101,'clave_partida_generica'=>521,"descripcion"=>"Equipos y Aparatos Audiovisuales", "anio"=>2021],
            ['clave'=>52106,'clave_partida_generica'=>521,"descripcion"=>"Equipos y Aparatos Audiovisuales Menores", "anio"=>2021],
            
            ['clave'=>52201,'clave_partida_generica'=>522,"descripcion"=>"Aparatos Deportivos", "anio"=>2021],
            ['clave'=>52206,'clave_partida_generica'=>522,"descripcion"=>"Aparatos Deportivos Menores", "anio"=>2021],

            ['clave'=>52301,'clave_partida_generica'=>523,"descripcion"=>"Cámaras Fotográficas y de Video", "anio"=>2021],
            ['clave'=>52306,'clave_partida_generica'=>523,"descripcion"=>"Cámaras Fotográficas y de Video Menores", "anio"=>2021],
            
            ['clave'=>52901,'clave_partida_generica'=>529,"descripcion"=>"Otro Mobiliario y Equipo Educacional y Recreativo", "anio"=>2021],
            ['clave'=>52906,'clave_partida_generica'=>529,"descripcion"=>"Otro Mobiliario y Equipo Educacional y Recreativo Menor", "anio"=>2021],

            ['clave'=>53101,'clave_partida_generica'=>531,"descripcion"=>"Equipo Médico y de Laboratorio", "anio"=>2021],
            ['clave'=>53106,'clave_partida_generica'=>531,"descripcion"=>"Equipo Médico y de Laboratorio Menor", "anio"=>2021],

            ['clave'=>53201,'clave_partida_generica'=>532,"descripcion"=>"Instrumental Médico y de Laboratorio", "anio"=>2021],
            ['clave'=>53206,'clave_partida_generica'=>532,"descripcion"=>"Instrumental Médico y de Laboratorio Menor", "anio"=>2021],

            ['clave'=>54111,'clave_partida_generica'=>541,"descripcion"=>"Vehículos y Equipo Terrestre", "anio"=>2021],

            ['clave'=>54201,'clave_partida_generica'=>542,"descripcion"=>"Carrocerías y Remolques", "anio"=>2021],

            ['clave'=>54311,'clave_partida_generica'=>543,"descripcion"=>"Vehículos y Equipo Aéreos", "anio"=>2021],
            
            ['clave'=>54511,'clave_partida_generica'=>545,"descripcion"=>"Vehículos y Equipo Marítimo, Lacustre y Fluvial", "anio"=>2021],

            ['clave'=>54901,'clave_partida_generica'=>549,"descripcion"=>"Otros Equipos de Transporte", "anio"=>2021],
            ['clave'=>54902,'clave_partida_generica'=>549,"descripcion"=>"Vehículos y Equipo Auxiliar de Transporte", "anio"=>2021],

            ['clave'=>55101,'clave_partida_generica'=>551,"descripcion"=>"Maquinaria y Equipo de Defensa y Seguridad Pública", "anio"=>2021],
            ['clave'=>55102,'clave_partida_generica'=>551,"descripcion"=>"Equipo de Seguridad Pública", "anio"=>2021],

            ['clave'=>56101,'clave_partida_generica'=>561,"descripcion"=>"Maquinaria y Equipo Agropecuario", "anio"=>2021],
            ['clave'=>56106,'clave_partida_generica'=>561,"descripcion"=>"Maquinaria y Equipo Agropecuario Menor", "anio"=>2021],

            ['clave'=>56201,'clave_partida_generica'=>562,"descripcion"=>"Maquinaria y Equipo Industrial", "anio"=>2021],

            ['clave'=>56301,'clave_partida_generica'=>563,"descripcion"=>"Maquinaria y Equipo de Construcción", "anio"=>2021],

            ['clave'=>56401,'clave_partida_generica'=>564,"descripcion"=>"Sistemas de Aire Acondicionado, Calefacción y de Refrigeración Industrial y Comercial", "anio"=>2021],
            
            ['clave'=>56501,'clave_partida_generica'=>565,"descripcion"=>"Equipos y Aparatos de Comunicaciones y Telecomunicaciones", "anio"=>2021],
            ['clave'=>56506,'clave_partida_generica'=>565,"descripcion"=>"Equipos y Aparatos Menores de Comunicaciones y Telecomunicaciones", "anio"=>2021],
            
            ['clave'=>56601,'clave_partida_generica'=>566,"descripcion"=>"Maquinaria y Equipo Eléctrico y Electrónico", "anio"=>2021],
            ['clave'=>56602,'clave_partida_generica'=>566,"descripcion"=>"Maquinaria y Equipo Diverso", "anio"=>2021],
            ['clave'=>56607,'clave_partida_generica'=>566,"descripcion"=>"Maquinaria y Equipo Eléctrico y Electrónico Menor", "anio"=>2021],
            
            ['clave'=>56701,'clave_partida_generica'=>567,"descripcion"=>"Herramientas y Máquinas-Herramienta", "anio"=>2021],
            ['clave'=>56702,'clave_partida_generica'=>567,"descripcion"=>"Refacciones y Accesorios Mayores", "anio"=>2021],
            
            ['clave'=>56901,'clave_partida_generica'=>569,"descripcion"=>"Bienes Muebles por Arrendamiento Financiero", "anio"=>2021],
            ['clave'=>56902,'clave_partida_generica'=>569,"descripcion"=>"Otros Equipos y Bienes Muebles", "anio"=>2021],
            ['clave'=>56907,'clave_partida_generica'=>569,"descripcion"=>"Otros Equipos y Bienes Muebles Menores", "anio"=>2021],

            ['clave'=>57101,'clave_partida_generica'=>571,"descripcion"=>"Animales de Reproducción", "anio"=>2021],
            ['clave'=>57102,'clave_partida_generica'=>571,"descripcion"=>"Animales de Trabajo", "anio"=>2021],

            ['clave'=>57201,'clave_partida_generica'=>572,"descripcion"=>"Porcinos", "anio"=>2021],

            ['clave'=>57301,'clave_partida_generica'=>573,"descripcion"=>"Aves", "anio"=>2021],

            ['clave'=>57401,'clave_partida_generica'=>574,"descripcion"=>"Ovinos y Caprinos", "anio"=>2021],
            ['clave'=>57402,'clave_partida_generica'=>574,"descripcion"=>"Animales de Trabajo", "anio"=>2021],

            ['clave'=>57501,'clave_partida_generica'=>575,"descripcion"=>"Peces y Acuicultura", "anio"=>2021],

            ['clave'=>57601,'clave_partida_generica'=>576,"descripcion"=>"Animales de Trabajo", "anio"=>2021],
            ['clave'=>57602,'clave_partida_generica'=>576,"descripcion"=>"Animales de Reproducción", "anio"=>2021],

            ['clave'=>57701,'clave_partida_generica'=>577,"descripcion"=>"Animales de Custodia y Vigilancia", "anio"=>2021],
            ['clave'=>57702,'clave_partida_generica'=>577,"descripcion"=>"Especies Menores y de Zoológico", "anio"=>2021],

            ['clave'=>57801,'clave_partida_generica'=>578,"descripcion"=>"Árboles y Plantas", "anio"=>2021],

            ['clave'=>57901,'clave_partida_generica'=>579,"descripcion"=>"Otros Activos Biológicos", "anio"=>2021],

            ['clave'=>58101,'clave_partida_generica'=>581,"descripcion"=>"Terrenos", "anio"=>2021],

            ['clave'=>58201,'clave_partida_generica'=>582,"descripcion"=>"Viviendas", "anio"=>2021],

            ['clave'=>58301,'clave_partida_generica'=>583,"descripcion"=>"Edificios y Locales", "anio"=>2021],

            ['clave'=>58901,'clave_partida_generica'=>589,"descripcion"=>"Adjudicaciones, Expropiaciones e Indemnizaciones de Inmuebles", "anio"=>2021],
            ['clave'=>58903,'clave_partida_generica'=>589,"descripcion"=>"Bienes Inmuebles por Arrendamiento Financiero", "anio"=>2021],
            ['clave'=>58904,'clave_partida_generica'=>589,"descripcion"=>"Otros Bienes Inmuebles", "anio"=>2021],

            ['clave'=>59101,'clave_partida_generica'=>591,"descripcion"=>"Software", "anio"=>2021],

            ['clave'=>59201,'clave_partida_generica'=>592,"descripcion"=>"Patentes", "anio"=>2021],

            ['clave'=>59301,'clave_partida_generica'=>593,"descripcion"=>"Marcas", "anio"=>2021],

            ['clave'=>59701,'clave_partida_generica'=>597,"descripcion"=>"Licencias Informáticas e Intelectuales", "anio"=>2021],
            
            ['clave'=>59901,'clave_partida_generica'=>599,"descripcion"=>"Otros Activos Intangibles", "anio"=>2021],
            
            ['clave'=>61301,'clave_partida_generica'=>613,"descripcion"=>"Construcción de Obras para el Abastecimiento de Agua, Gas, Electricidad y Telecomunicaciones", "anio"=>2021],
            ['clave'=>61302,'clave_partida_generica'=>613,"descripcion"=>"Mantenimiento y Rehabilitación de Obras para el Abastecimiento de Agua, Gas, Electricidad y Telecomunicaciones", "anio"=>2021],
            ['clave'=>61303,'clave_partida_generica'=>613,"descripcion"=>"Indirectos para Obras por Contrato de Obras para el Abastecimiento de Agua, Gas, Electricidad y Telecomunicaciones", "anio"=>2021],
            ['clave'=>61304,'clave_partida_generica'=>613,"descripcion"=>"Obras Normales del Gobierno para el Abastecimiento de Agua, Gas, Electricidad y Telecomunicaciones", "anio"=>2021],
            ['clave'=>61305,'clave_partida_generica'=>613,"descripcion"=>"Servicios Relacionados con Obra Pública para el Abastecimiento de Agua, Gas, Electricidad y Telecomunicaciones", "anio"=>2021],
            ['clave'=>61306,'clave_partida_generica'=>613,"descripcion"=>"Estudios de Pre-inversión, Programa Normal de Gobierno del Estado (PNGE), para el Abastecimiento de Agua, Gas, Electricidad y Telecomunicaciones", "anio"=>2021],
            
            ['clave'=>61401,'clave_partida_generica'=>614,"descripcion"=>"División de Terrenos y Construcción de Obras de Urbanización", "anio"=>2021],
            ['clave'=>61402,'clave_partida_generica'=>614,"descripcion"=>"Mantenimiento y Rehabilitación de Obras de Urbanización", "anio"=>2021],
            ['clave'=>61403,'clave_partida_generica'=>614,"descripcion"=>"Indirectos para Obras por Contrato de División de Terrenos y Construcción de Obras de Urbanización", "anio"=>2021],
            ['clave'=>61404,'clave_partida_generica'=>614,"descripcion"=>"Obras Normales del Gobierno de División de Terrenos y Construcción de Obras de Urbanización", "anio"=>2021],
            ['clave'=>61405,'clave_partida_generica'=>614,"descripcion"=>"Servicios Relacionados con Obra Pública de División de Terrenos y Construcción de Obras de Urbanización", "anio"=>2021],
            ['clave'=>61406,'clave_partida_generica'=>614,"descripcion"=>"Estudios de Pre-inversión, Programa Normal de Gobierno del Estado (PNGE), de División de Terrenos y Construcción de Obras de Urbanización", "anio"=>2021],
            ['clave'=>61407,'clave_partida_generica'=>614,"descripcion"=>"Obras de Pre-Edificación en Terrenos de Construcción", "anio"=>2021],
            
            ['clave'=>61501,'clave_partida_generica'=>615,"descripcion"=>"Construcción de Vías de Comunicación", "anio"=>2021],
            ['clave'=>61502,'clave_partida_generica'=>615,"descripcion"=>"Mantenimiento y Rehabilitación de Obras de Vías de Comunicación", "anio"=>2021],
            ['clave'=>61503,'clave_partida_generica'=>615,"descripcion"=>"Indirectos para Obras por Contrato de Vías de Comunicación", "anio"=>2021],
            ['clave'=>61504,'clave_partida_generica'=>615,"descripcion"=>"Obras Normales del Gobierno de Vías de Comunicación", "anio"=>2021],
            ['clave'=>61505,'clave_partida_generica'=>615,"descripcion"=>"Servicios Relacionados con Obra Pública de Vías de Comunicación", "anio"=>2021],
            ['clave'=>61506,'clave_partida_generica'=>615,"descripcion"=>"Estudios de Pre-inversión, Programa Normal de Gobierno del Estado (PNGE), de Vías de Comunicación", "anio"=>2021],

            ['clave'=>61601,'clave_partida_generica'=>616,"descripcion"=>"Otras Construcciones de Ingeniería Civil u Obra Pesada.", "anio"=>2021],
            ['clave'=>61602,'clave_partida_generica'=>616,"descripcion"=>"Mantenimiento y Rehabilitación de Otras Construcciones de Ingeniería Civil u Obra Pesada", "anio"=>2021],
            ['clave'=>61603,'clave_partida_generica'=>616,"descripcion"=>"Indirectos para Obras por Contrato de Otras Construcciones de Ingeniería Civil u Obra Pesada", "anio"=>2021],
            ['clave'=>61604,'clave_partida_generica'=>616,"descripcion"=>"Obras Normales del Gobierno de Otras Construcciones de Ingeniería Civil u Obra Pesada", "anio"=>2021],
            ['clave'=>61605,'clave_partida_generica'=>616,"descripcion"=>"Servicios Relacionados con Obra Pública de Otras Construcciones de Ingeniería Civil u Obra Pesada", "anio"=>2021],
            ['clave'=>61606,'clave_partida_generica'=>616,"descripcion"=>"Estudios de Pre-inversión, Programa Normal de Gobierno del 61606 Estado (PNGE), de Otras Construcciones de Ingeniería Civil u Obra Pesada", "anio"=>2021],
            ['clave'=>61609,'clave_partida_generica'=>616,"descripcion"=>"Servicios para la Liberación de Derechos de Vía", "anio"=>2021],
            
            ['clave'=>61701,'clave_partida_generica'=>617,"descripcion"=>"Instalaciones y Equipamiento en Construcciones", "anio"=>2021],
            ['clave'=>61702,'clave_partida_generica'=>617,"descripcion"=>"Estudios de Pre-inversión, Programa Normal de Gobierno del Estado (PNGE), para Instalaciones y Equipamiento en Construcciones", "anio"=>2021],
            
            ['clave'=>62101,'clave_partida_generica'=>621,"descripcion"=>"Obras de Construcción para Edificios Habitacionales", "anio"=>2021],
            ['clave'=>62102,'clave_partida_generica'=>621,"descripcion"=>"Mantenimiento y Rehabilitación de Edificaciones Habitacionales", "anio"=>2021],
            ['clave'=>62103,'clave_partida_generica'=>621,"descripcion"=>"Indirectos para Obras por Contrato para Edificios Habitacionales", "anio"=>2021],
            ['clave'=>62104,'clave_partida_generica'=>621,"descripcion"=>"Obras Normales del Gobierno para Edificios Habitacionales", "anio"=>2021],
            ['clave'=>62105,'clave_partida_generica'=>621,"descripcion"=>"Servicios Relacionados con Obra Pública para Edificios Habitacionales", "anio"=>2021],
            ['clave'=>62106,'clave_partida_generica'=>621,"descripcion"=>"Estudios de Pre-inversión, Programa Normal de Gobierno del Estado (PNGE), para Edificios Habitacionales", "anio"=>2021],
            
            ['clave'=>62201,'clave_partida_generica'=>622,"descripcion"=>"Obras de Construcción para Edificios no Habitacionales", "anio"=>2021],
            ['clave'=>62202,'clave_partida_generica'=>622,"descripcion"=>"Mantenimiento y Rehabilitación para Edificios no Habitacionales", "anio"=>2021],
            ['clave'=>62204,'clave_partida_generica'=>622,"descripcion"=>"Indirectos para Obras por Contrato para Edificios no Habitacionales", "anio"=>2021],
            ['clave'=>62205,'clave_partida_generica'=>622,"descripcion"=>"Obras Normales del Gobierno para Edificios no Habitacionales", "anio"=>2021],
            ['clave'=>62206,'clave_partida_generica'=>622,"descripcion"=>"Servicios Relacionados con Obra Pública para Edificios no Habitacionales", "anio"=>2021],
            ['clave'=>62207,'clave_partida_generica'=>622,"descripcion"=>"Estudios de Pre-inversión, Programa Normal de Gobierno del Estado (PNGE), para Edificios no Habitacionales", "anio"=>2021],
            
            ['clave'=>62401,'clave_partida_generica'=>624,"descripcion"=>"Obras de Pre-Edificación en Terrenos de Construcción", "anio"=>2021],
            
            ['clave'=>62701,'clave_partida_generica'=>627,"descripcion"=>"Instalaciones Mayores y Obras de Construcción Especializada", "anio"=>2021],
            ['clave'=>62703,'clave_partida_generica'=>627,"descripcion"=>"Mantenimiento y Rehabilitación de Instalaciones y Equipamiento en Construcciones", "anio"=>2021],
            ['clave'=>62704,'clave_partida_generica'=>627,"descripcion"=>"Indirectos para Obras por Contrato de Instalaciones y Equipamiento en Construcciones", "anio"=>2021],
            ['clave'=>62705,'clave_partida_generica'=>627,"descripcion"=>"Obras Normales del Gobierno de Instalaciones y Equipamiento en Construcciones", "anio"=>2021],
            ['clave'=>62706,'clave_partida_generica'=>627,"descripcion"=>"Servicios Relacionados con Obra Pública de Instalaciones y Equipamiento en Construcciones", "anio"=>2021],
            ['clave'=>62707,'clave_partida_generica'=>627,"descripcion"=>"Estudios de Pre-inversión, Programa Normal de Gobierno del Estado (PNGE), de Instalaciones y Equipamiento en Construcciones", "anio"=>2021],
            
            ['clave'=>62901,'clave_partida_generica'=>629,"descripcion"=>"Ensamble y Edificación de Construcciones Prefabricadas", "anio"=>2021],
            ['clave'=>62902,'clave_partida_generica'=>629,"descripcion"=>"Obras de Terminación y Acabado de Edificios", "anio"=>2021],
            ['clave'=>62903,'clave_partida_generica'=>629,"descripcion"=>"Indirectos para Obras por Contrato de Ensamble y Edificación de Construcciones Prefabricadas y Obras de Terminación y Acabado de Edificios", "anio"=>2021],
            ['clave'=>62905,'clave_partida_generica'=>629,"descripcion"=>"Otros Servicios Relacionados con Obras Públicas", "anio"=>2021],
            ['clave'=>62911,'clave_partida_generica'=>629,"descripcion"=>"Servicios Relacionados con Obra Pública de Ensamble y Edificación de Construcciones Prefabricadas y Obras de Terminación y Acabado de Edificios", "anio"=>2021],
            ['clave'=>62912,'clave_partida_generica'=>629,"descripcion"=>"Estudios de Pre-inversión, Programa Normal de Gobierno del Estado (PNGE), de Ensamble y Edificación de Construcciones Prefabricadas y Obras de Terminación y Acabado de Edificios", "anio"=>2021],

            ['clave'=>63201,'clave_partida_generica'=>632,"descripcion"=>"Productivos", "anio"=>2021],

            ['clave'=>71101,'clave_partida_generica'=>711,"descripcion"=>"Créditos Directos para Actividades Productivas", "anio"=>2021],
            ['clave'=>71102,'clave_partida_generica'=>711,"descripcion"=>"Créditos y Financiamientos Directos a la Población", "anio"=>2021],
            ['clave'=>71103,'clave_partida_generica'=>711,"descripcion"=>"Bonos Directos para el Financiamiento de Viviendas", "anio"=>2021],
                        
            ['clave'=>72201,'clave_partida_generica'=>722,"descripcion"=>"Acciones y Participaciones de Capital en Entidades Paraestatales Empresariales y no Financieras con Fines de Política Económica", "anio"=>2021],
            
            ['clave'=>72401,'clave_partida_generica'=>724,"descripcion"=>"Adquisición de Acciones o Aumento en la Participación Estatal de Capital en el Sector Privado con Fines de Política Económica", "anio"=>2021],
            
            ['clave'=>73101,'clave_partida_generica'=>731,"descripcion"=>"Adquisición de Bonos", "anio"=>2021],
            
            ['clave'=>73501,'clave_partida_generica'=>735,"descripcion"=>"Adquisición de Obligaciones", "anio"=>2021],
            
            ['clave'=>73901,'clave_partida_generica'=>739,"descripcion"=>"Fideicomisos para Adquisición de Títulos de Crédito", "anio"=>2021],
            ['clave'=>73902,'clave_partida_generica'=>739,"descripcion"=>"Adquisición de Acciones", "anio"=>2021],
            ['clave'=>73903,'clave_partida_generica'=>739,"descripcion"=>"Adquisición de Otros Valores", "anio"=>2021],

            ['clave'=>75101,'clave_partida_generica'=>751,"descripcion"=>"Aportaciones a Fideicomisos Públicos", "anio"=>2021],
            ['clave'=>75102,'clave_partida_generica'=>751,"descripcion"=>"Fideicomisos para el Fomento y Financiamiento de la Educación", "anio"=>2021],
            ['clave'=>75103,'clave_partida_generica'=>751,"descripcion"=>"Fideicomisos Agrarios", "anio"=>2021],
            ['clave'=>75104,'clave_partida_generica'=>751,"descripcion"=>"Fondos Comprometidos de Inversión Pública", "anio"=>2021],
            ['clave'=>75105,'clave_partida_generica'=>751,"descripcion"=>"Fondos al Sector Productivo", "anio"=>2021],
            ['clave'=>75106,'clave_partida_generica'=>751,"descripcion"=>"Fideicomiso para la Instrumentación Financiera", "anio"=>2021],
            
            ['clave'=>75501,'clave_partida_generica'=>755,"descripcion"=>"Inversiones en Fideicomisos Públicos Empresariales y no Financieros Considerados Entidades Paraestatales", "anio"=>2021],
            
            ['clave'=>75611,'clave_partida_generica'=>756,"descripcion"=>"Fideicomisos para Financiamiento de Obras", "anio"=>2021],
            ['clave'=>75612,'clave_partida_generica'=>756,"descripcion"=>"Fideicomisos para el Fomento y Financiamiento Agropecuario", "anio"=>2021],
            ['clave'=>75613,'clave_partida_generica'=>756,"descripcion"=>"Fideicomisos para el Fomento y Financiamiento Industrial", "anio"=>2021],
            ['clave'=>75614,'clave_partida_generica'=>756,"descripcion"=>"Fideicomisos para el Fomento y Financiamiento al Comercio y Otros Servicios", "anio"=>2021],
            
            ['clave'=>79101,'clave_partida_generica'=>791,"descripcion"=>"Erogaciones Contingentes por Fenómenos Naturales", "anio"=>2021],
            
            ['clave'=>79201,'clave_partida_generica'=>792,"descripcion"=>"Contingencias Socioeconómicas", "anio"=>2021],
            
            ['clave'=>79902,'clave_partida_generica'=>799,"descripcion"=>"Provisiones para Erogaciones Especiales", "anio"=>2021],
            ['clave'=>79911,'clave_partida_generica'=>799,"descripcion"=>"Erogaciones Complementarias", "anio"=>2021],
            ['clave'=>79912,'clave_partida_generica'=>799,"descripcion"=>"Fondos Comprometidos de Gasto Corriente", "anio"=>2021],
            ['clave'=>79913,'clave_partida_generica'=>799,"descripcion"=>"Fondos al Sector Social", "anio"=>2021],
            ['clave'=>79914,'clave_partida_generica'=>799,"descripcion"=>"Fondo de Ahorro (Poder Legislativo)", "anio"=>2021],
            ['clave'=>79915,'clave_partida_generica'=>799,"descripcion"=>"Erogaciones Complementarias para Servicios Personales", "anio"=>2021],
            ['clave'=>79916,'clave_partida_generica'=>799,"descripcion"=>"Erogaciones Complementarias para Servicios Personales (Docente)", "anio"=>2021],
            ['clave'=>79917,'clave_partida_generica'=>799,"descripcion"=>"Erogaciones Complementarias para Servicios Personales en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>79918,'clave_partida_generica'=>799,"descripcion"=>"Erogaciones Complementarias para Servicios Personales en Área Médico, Paramédico y Afín", "anio"=>2021],

            ['clave'=>81101,'clave_partida_generica'=>811,"descripcion"=>"Fondo General de Participaciones", "anio"=>2021],
            ['clave'=>81136,'clave_partida_generica'=>811,"descripcion"=>"Fondo de Participación de Impuestos Especiales", "anio"=>2021],
            
            ['clave'=>81201,'clave_partida_generica'=>812,"descripcion"=>"Fondo de Fomento Municipal", "anio"=>2021],

            ['clave'=>81301,'clave_partida_generica'=>813,"descripcion"=>"Otras Participaciones", "anio"=>2021],
           
            ['clave'=>81436,'clave_partida_generica'=>814,"descripcion"=>"Fondo de Fiscalización y Recaudación", "anio"=>2021],
            ['clave'=>81437,'clave_partida_generica'=>814,"descripcion"=>"Fondo de Compensación", "anio"=>2021],
            ['clave'=>81438,'clave_partida_generica'=>814,"descripcion"=>"Fondo de Extracción de Hidrocarburos", "anio"=>2021],
            ['clave'=>81439,'clave_partida_generica'=>814,"descripcion"=>"Incentivo Derivado de la Coordinación Fiscal", "anio"=>2021],
            ['clave'=>81440,'clave_partida_generica'=>814,"descripcion"=>"Impuesto sobre Tenencia o Uso de Vehículos", "anio"=>2021],
            ['clave'=>81441,'clave_partida_generica'=>814,"descripcion"=>"Impuesto Sobre Automóviles Nuevos", "anio"=>2021],
            ['clave'=>81442,'clave_partida_generica'=>814,"descripcion"=>"Fondo de Compensación del Impuesto Sobre Automóviles Nuevos (ISAN)", "anio"=>2021],
            ['clave'=>81443,'clave_partida_generica'=>814,"descripcion"=>"Impuesto a la Venta Final de Gasolinas y Diésel", "anio"=>2021],
            ['clave'=>81444,'clave_partida_generica'=>814,"descripcion"=>"Impuestos Administrados", "anio"=>2021],
            
            ['clave'=>81501,'clave_partida_generica'=>815,"descripcion"=>"Otros Conceptos Participables de la Federación a Municipios", "anio"=>2021],
            
            ['clave'=>81601,'clave_partida_generica'=>816,"descripcion"=>"Convenios de Colaboración Administrativa", "anio"=>2021],

            ['clave'=>83121,'clave_partida_generica'=>831,"descripcion"=>"Fondo de Aportaciones para la Nómina Educativa y Gasto Operativo (FONE)", "anio"=>2021],
            ['clave'=>83122,'clave_partida_generica'=>831,"descripcion"=>"Fondo de Aportaciones para los Servicios de Salud (FASSA)", "anio"=>2021],
            ['clave'=>83123,'clave_partida_generica'=>831,"descripcion"=>"Fondo de Aportaciones para la Infraestructura Social Estatal (FAISE)", "anio"=>2021],
            ['clave'=>83124,'clave_partida_generica'=>831,"descripcion"=>"Fondo de Aportaciones Múltiples (FAM)", "anio"=>2021],
            ['clave'=>83125,'clave_partida_generica'=>831,"descripcion"=>"Fondo de Aportaciones para la Educación Tecnológica y de Adultos (FAETA)", "anio"=>2021],
            ['clave'=>83126,'clave_partida_generica'=>831,"descripcion"=>"Fondo de Aportaciones para la Seguridad Pública (FASP)", "anio"=>2021],
            ['clave'=>83127,'clave_partida_generica'=>831,"descripcion"=>"Fondo de Aportaciones para el Fortalecimiento de las Entidades Federativas (FAFEF)", "anio"=>2021],
            ['clave'=>83128,'clave_partida_generica'=>831,"descripcion"=>"Otras Aportaciones de la Federación al Estado", "anio"=>2021],
            
            ['clave'=>83201,'clave_partida_generica'=>832,"descripcion"=>"Fondo de Aportaciones para la Infraestructura Social Municipal (FAISM)", "anio"=>2021],
            ['clave'=>83202,'clave_partida_generica'=>832,"descripcion"=>"Fondo de Aportaciones para el Fortalecimiento de los Municipios (FORTAMUN)", "anio"=>2021],
            ['clave'=>83203,'clave_partida_generica'=>832,"descripcion"=>"Otras Aportaciones de la Federación a Municipios", "anio"=>2021],
            
            ['clave'=>83401,'clave_partida_generica'=>834,"descripcion"=>"Aportaciones Previstas en Leyes y Decretos al Sistema de Protección Social", "anio"=>2021],

            ['clave'=>83501,'clave_partida_generica'=>835,"descripcion"=>"Asignaciones Compensatorias al Estado y Municipios", "anio"=>2021],

            ['clave'=>85101,'clave_partida_generica'=>851,"descripcion"=>"Convenios de Reasignación", "anio"=>2021],
            
            ['clave'=>85201,'clave_partida_generica'=>852,"descripcion"=>"Convenios de Descentralización", "anio"=>2021],
            
            ['clave'=>85301,'clave_partida_generica'=>853,"descripcion"=>"Otros Convenios", "anio"=>2021],

            ['clave'=>91101,'clave_partida_generica'=>911,"descripcion"=>"Amortización de la Deuda Interna con Instituciones de Crédito", "anio"=>2021],
            
            ['clave'=>91201,'clave_partida_generica'=>912,"descripcion"=>"Amortización de la Deuda por Emisión de Valores Gubernamentales", "anio"=>2021],
            
            ['clave'=>91301,'clave_partida_generica'=>913,"descripcion"=>"Amortización de Arrendamientos Financieros Nacionales", "anio"=>2021],
            ['clave'=>91302,'clave_partida_generica'=>913,"descripcion"=>"Amortización de Arrendamientos Financieros Especiales", "anio"=>2021],
            
            ['clave'=>92101,'clave_partida_generica'=>921,"descripcion"=>"Intereses de la Deuda Interna con Instituciones de Crédito", "anio"=>2021],
            
            ['clave'=>92201,'clave_partida_generica'=>922,"descripcion"=>"Intereses Derivados de la Colocación de Valores Gubernamentales", "anio"=>2021],
            
            ['clave'=>92301,'clave_partida_generica'=>923,"descripcion"=>"Intereses por Arrendamientos Financieros Nacionales", "anio"=>2021],
            ['clave'=>92302,'clave_partida_generica'=>923,"descripcion"=>"Intereses por Arrendamientos Financieros Especiales", "anio"=>2021],
            
            ['clave'=>93101,'clave_partida_generica'=>931,"descripcion"=>"Comisiones de la Deuda Interna", "anio"=>2021],
            
            ['clave'=>94101,'clave_partida_generica'=>941,"descripcion"=>"Gastos de la Deuda Interna", "anio"=>2021],

            ['clave'=>95101,'clave_partida_generica'=>951,"descripcion"=>"Costos por Coberturas", "anio"=>2021],
            
            ['clave'=>96201,'clave_partida_generica'=>962,"descripcion"=>"Apoyos a Ahorradores y Deudores de la Banca", "anio"=>2021],

            ['clave'=>99106,'clave_partida_generica'=>991,"descripcion"=>"Adeudos de Ejercicios Fiscales Anteriores por Servicios Personales", "anio"=>2021],
            ['clave'=>99107,'clave_partida_generica'=>991,"descripcion"=>"Adeudos de Ejercicios Fiscales Anteriores por Materiales y Suministros", "anio"=>2021],
            ['clave'=>99108,'clave_partida_generica'=>991,"descripcion"=>"Adeudos de Ejercicios Fiscales Anteriores por Servicios Generales", "anio"=>2021],
            ['clave'=>99109,'clave_partida_generica'=>991,"descripcion"=>"Adeudos de Ejercicios Fiscales Anteriores por Conceptos Distintos de Servicios Personales, Materiales y Suministros y por Servicios Generales", "anio"=>2021],
            ['clave'=>99110,'clave_partida_generica'=>991,"descripcion"=>"Adeudos de Ejercicios Fiscales Anteriores por Servicios Personales en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>99111,'clave_partida_generica'=>991,"descripcion"=>"Adeudos de Ejercicios Fiscales Anteriores por Servicios Personales en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>99112,'clave_partida_generica'=>991,"descripcion"=>"Adeudos de Ejercicios Fiscales Anteriores por Servicios Personales (Docente)", "anio"=>2021],
            ['clave'=>99113,'clave_partida_generica'=>991,"descripcion"=>"Adeudos de Ejercicios Fiscales Anteriores por Servicios Personales (Policías de Seguridad Pública)", "anio"=>2021],
            ['clave'=>99114,'clave_partida_generica'=>991,"descripcion"=>"Adeudos de Ejercicios Fiscales Anteriores por Impuesto sobre Nóminas y Otros que se Deriven de una Relación Laboral", "anio"=>2021],
            ['clave'=>99115,'clave_partida_generica'=>991,"descripcion"=>"Adeudos de Ejercicios Fiscales Anteriores por Impuesto sobre Nóminas y Otros que se Deriven de una Relación Laboral en Área Médica, Paramédica y Afín", "anio"=>2021],
            ['clave'=>99116,'clave_partida_generica'=>991,"descripcion"=>"Adeudos de Ejercicios Fiscales Anteriores por Impuesto sobre Nóminas y Otros que se Deriven de una Relación Laboral en Área Administrativa en Salud", "anio"=>2021],
            ['clave'=>99117,'clave_partida_generica'=>991,"descripcion"=>"Adeudos de Ejercicios Fiscales Anteriores por Impuesto sobre Nóminas y Otros que se Deriven de una Relación Laboral (Docente)", "anio"=>2021],
            ['clave'=>99118,'clave_partida_generica'=>991,"descripcion"=>"Adeudos de Ejercicios Fiscales Anteriores por Impuesto sobre Nóminas y Otros que se Deriven de una Relación Laboral (Policías de Seguridad Pública)", "anio"=>2021],
            ['clave'=>99119,'clave_partida_generica'=>991,"descripcion"=>"Adeudos de Ejercicios Fiscales Anteriores por Subsidios por Otras Medidas Económicas", "anio"=>2021],

        ];

        foreach ($list as $item) {
            \App\Models\PartidaEspecifica::create($item);
        }
    }
}
