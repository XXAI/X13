<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ConceptosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $list = [
            ['clave'=>1100,'clave_capitulo'=>1000,"descripcion"=>"REMUNERACIONES AL PERSONAL DE CARÁCTER PERMANENTE", "anio"=>2021],
            ['clave'=>1200,'clave_capitulo'=>1000,"descripcion"=>"REMUNERACIONES AL PERSONAL DE CARÁCTER TRANSITORIO", "anio"=>2021],
            ['clave'=>1300,'clave_capitulo'=>1000,"descripcion"=>"REMUNERACIONES ADICIONALES Y ESPECIALES", "anio"=>2021],
            ['clave'=>1400,'clave_capitulo'=>1000,"descripcion"=>"SEGURIDAD SOCIAL", "anio"=>2021],
            ['clave'=>1500,'clave_capitulo'=>1000,"descripcion"=>"OTRAS PRESTACIONES SOCIALES Y ECONÓMICAS", "anio"=>2021],
            ['clave'=>1600,'clave_capitulo'=>1000,"descripcion"=>"PREVISIONES", "anio"=>2021],
            ['clave'=>1700,'clave_capitulo'=>1000,"descripcion"=>"PAGO DE ESTÍMULOS A SERVIDORES PÚBLICOS", "anio"=>2021],          

            ['clave'=>2100,'clave_capitulo'=>2000,"descripcion"=>"MATERIALES DE ADMINISTRACIÓN, EMISIÓN DE DOCUMENTOS Y ARTÍCULOS OFICIALES", "anio"=>2021],
            ['clave'=>2200,'clave_capitulo'=>2000,"descripcion"=>"ALIMENTOS Y UTENSILIOS", "anio"=>2021],
            ['clave'=>2300,'clave_capitulo'=>2000,"descripcion"=>"MATERIAS PRIMAS Y MATERIALES DE PRODUCCIÓN Y COMERCIALIZACIÓN", "anio"=>2021],
            ['clave'=>2400,'clave_capitulo'=>2000,"descripcion"=>"MATERIALES Y ARTÍCULOS DE CONSTRUCCIÓN Y DE REPARACIÓN", "anio"=>2021],
            ['clave'=>2500,'clave_capitulo'=>2000,"descripcion"=>"PRODUCTOS QUÍMICOS, FARMACÉUTICOS Y DE LABORATORIO", "anio"=>2021],
            ['clave'=>2600,'clave_capitulo'=>2000,"descripcion"=>"COMBUSTIBLES, LUBRICANTES Y ADITIVOS", "anio"=>2021],
            ['clave'=>2700,'clave_capitulo'=>2000,"descripcion"=>"VESTUARIO, BLANCOS, PRENDAS DE PROTECCIÓN Y ARTÍCULOS DEPORTIVOS", "anio"=>2021],
            ['clave'=>2800,'clave_capitulo'=>2000,"descripcion"=>"MATERIALES Y SUMINISTROS PARA SEGURIDAD", "anio"=>2021],
            ['clave'=>2900,'clave_capitulo'=>2000,"descripcion"=>"HERRAMIENTAS, REFACCIONES Y ACCESORIOS MENORES", "anio"=>2021],

            ['clave'=>3100, 'clave_capitulo'=>3000,"descripcion"=>"SERVICIOS BÁSICOS", "anio"=>2021],
            ['clave'=>3200, 'clave_capitulo'=>3000,"descripcion"=>"SERVICIOS DE ARRENDAMIENTO", "anio"=>2021],
            ['clave'=>3300, 'clave_capitulo'=>3000,"descripcion"=>"SERVICIOS PROFESIONALES, CIENTÍFICOS, TÉCNICOS Y OTROS SERVICIOS", "anio"=>2021],
            ['clave'=>3400, 'clave_capitulo'=>3000,"descripcion"=>"SERVICIOS FINANCIEROS, BANCARIOS Y COMERCIALES", "anio"=>2021],
            ['clave'=>3500, 'clave_capitulo'=>3000,"descripcion"=>"SERVICIOS DE INSTALACIÓN, REPARACIÓN, MANTENIMIENTO Y CONSERVACIÓN", "anio"=>2021],
            ['clave'=>3600, 'clave_capitulo'=>3000,"descripcion"=>"SERVICIOS DE COMUNICACIÓN SOCIAL Y PUBLICIDAD", "anio"=>2021],
            ['clave'=>3700, 'clave_capitulo'=>3000,"descripcion"=>"SERVICIO DE TRASLADO Y VIÁTICOS", "anio"=>2021],
            ['clave'=>3800, 'clave_capitulo'=>3000,"descripcion"=>"SERVICIOS OFICIALES", "anio"=>2021],
            ['clave'=>3900, 'clave_capitulo'=>3000,"descripcion"=>"OTROS SERVICIOS GENERALES", "anio"=>2021],


            ['clave'=>4100, 'clave_capitulo'=>4000,"descripcion"=>"TRANSFERENCIAS INTERNAS Y ASIGNACIONES AL SECTOR PÚBLICO", "anio"=>2021],
            ['clave'=>4200, 'clave_capitulo'=>4000,"descripcion"=>"TRANSFERENCIAS AL RESTO DEL SECTOR PÚBLICO", "anio"=>2021],
            ['clave'=>4300, 'clave_capitulo'=>4000,"descripcion"=>"SUBSIDIOS Y SUBVENCIONES", "anio"=>2021],
            ['clave'=>4400, 'clave_capitulo'=>4000,"descripcion"=>"AYUDAS SOCIALES", "anio"=>2021],
            ['clave'=>4500, 'clave_capitulo'=>4000,"descripcion"=>"PENSIONES Y JUBILACIONES", "anio"=>2021],
            ['clave'=>4600, 'clave_capitulo'=>4000,"descripcion"=>"TRANSFERENCIAS A FIDEICOMISOS, MANDATOS Y OTROS ANÁLOGOS", "anio"=>2021],
            ['clave'=>4700, 'clave_capitulo'=>4000,"descripcion"=>"TRANSFERENCIAS A LA SEGURIDAD SOCIAL", "anio"=>2021],
            ['clave'=>4800, 'clave_capitulo'=>4000,"descripcion"=>"DONATIVOS", "anio"=>2021],
            ['clave'=>4900, 'clave_capitulo'=>4000,"descripcion"=>"TRANSFERENCIAS AL EXTERIOR", "anio"=>2021],

            ['clave'=>5100, 'clave_capitulo'=>5000,"descripcion"=>"MOBILIARIO Y EQUIPO DE ADMINISTRACIÓN", "anio"=>2021],
            ['clave'=>5200, 'clave_capitulo'=>5000,"descripcion"=>"MOBILIARIO Y EQUIPO EDUCACIONAL Y RECREATIVO", "anio"=>2021],
            ['clave'=>5300, 'clave_capitulo'=>5000,"descripcion"=>"EQUIPO E INSTRUMENTAL MÉDICO Y DE LABORATORIO", "anio"=>2021],
            ['clave'=>5400, 'clave_capitulo'=>5000,"descripcion"=>"VEHÍCULOS Y EQUIPO DE TRANSPORTE", "anio"=>2021],
            ['clave'=>5500, 'clave_capitulo'=>5000,"descripcion"=>"EQUIPO DE DEFENSA Y SEGURIDAD", "anio"=>2021],
            ['clave'=>5600, 'clave_capitulo'=>5000,"descripcion"=>"MAQUINARIA, OTROS EQUIPOS Y HERRAMIENTAS", "anio"=>2021],
            ['clave'=>5700, 'clave_capitulo'=>5000,"descripcion"=>"ACTIVOS BIOLÓGICOS", "anio"=>2021],
            ['clave'=>5800, 'clave_capitulo'=>5000,"descripcion"=>"BIENES INMUEBLES", "anio"=>2021],
            ['clave'=>5900, 'clave_capitulo'=>5000,"descripcion"=>"ACTIVOS INTANGIBLES", "anio"=>2021],


            ['clave'=>6100, 'clave_capitulo'=>6000,"descripcion"=>"OBRA PÚBLICA EN BIENES DE DOMINIO PÚBLICO", "anio"=>2021],
            ['clave'=>6200, 'clave_capitulo'=>6000,"descripcion"=>"OBRA PÚBLICA EN BIENES PROPIOS", "anio"=>2021],
            ['clave'=>6300, 'clave_capitulo'=>6000,"descripcion"=>"PROYECTOS PRODUCTIVOS Y ACCIONES DE FOMENTO", "anio"=>2021],

            ['clave'=>7100, 'clave_capitulo'=>7000,"descripcion"=>"INVERSIONES PARA EL FOMENTO DE ACTIVIDADES PRODUCTIVAS", "anio"=>2021],
            ['clave'=>7200, 'clave_capitulo'=>7000,"descripcion"=>"ACCIONES Y PARTICIPACIONES DE CAPITAL", "anio"=>2021],
            ['clave'=>7300, 'clave_capitulo'=>7000,"descripcion"=>"COMPRA DE TÍTULOS Y VALORES", "anio"=>2021],
            ['clave'=>7400, 'clave_capitulo'=>7000,"descripcion"=>"CONCESIÓN DE PRÉSTAMOS", "anio"=>2021],
            ['clave'=>7500, 'clave_capitulo'=>7000,"descripcion"=>"INVERSIONES EN FIDEICOMISOS, MANDATOS Y OTROS ANÁLOGOS", "anio"=>2021],
            ['clave'=>7600, 'clave_capitulo'=>7000,"descripcion"=>"OTRAS INVERSIONES FINANCIERAS", "anio"=>2021],
            ['clave'=>7900, 'clave_capitulo'=>7000,"descripcion"=>"PROVISIONES PARA CONTINGENCIAS Y OTRAS EROGACIONES ESPECIALES", "anio"=>2021],

            ['clave'=>8100, 'clave_capitulo'=>8000,"descripcion"=>"PARTICIPACIONES", "anio"=>2021],
            ['clave'=>8300, 'clave_capitulo'=>8000,"descripcion"=>"APORTACIONES", "anio"=>2021],
            ['clave'=>8500, 'clave_capitulo'=>8000,"descripcion"=>"CONVENIOS", "anio"=>2021],

            ['clave'=>9100, 'clave_capitulo'=>9000,"descripcion"=>"AMORTIZACIÓN DE LA DEUDA PÚBLICA", "anio"=>2021],
            ['clave'=>9200, 'clave_capitulo'=>9000,"descripcion"=>"INTERESES DE LA DEUDA PÚBLICA", "anio"=>2021],
            ['clave'=>9300, 'clave_capitulo'=>9000,"descripcion"=>"COMISIONES DE LA DEUDA PÚBLICA", "anio"=>2021],
            ['clave'=>9400, 'clave_capitulo'=>9000,"descripcion"=>"GASTOS DE LA DEUDA PÚBLICA", "anio"=>2021],
            ['clave'=>9500, 'clave_capitulo'=>9000,"descripcion"=>"COSTO POR COBERTURAS", "anio"=>2021],
            ['clave'=>9600, 'clave_capitulo'=>9000,"descripcion"=>"APOYOS FINANCIEROS", "anio"=>2021],
            ['clave'=>9900, 'clave_capitulo'=>9000,"descripcion"=>"ADEUDOS DE EJERCICIOS FISCALES ANTERIORES (ADEFAS)", "anio"=>2021],            
        ];

        foreach ($list as $item) {
            \App\Models\Concepto::create($item);
        }
    }
}
