<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class CapitulosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $list = [
            ['clave'=>1000,"descripcion"=>"SERVICIOS PERSONALES", "anio"=>2021],
            ['clave'=>2000,"descripcion"=>"MATERIALES Y SUMINISTROS", "anio"=>2021],
            ['clave'=>3000,"descripcion"=>"SERVICIOS GENERALES", "anio"=>2021],
            ['clave'=>4000,"descripcion"=>"TRANSFERENCIAS, ASIGNACIONES, SUBSIDIOS Y OTRAS AYUDAS", "anio"=>2021],
            ['clave'=>5000,"descripcion"=>"BIENES MUEBLES, INMUEBLES E INTANGIBLES", "anio"=>2021],
            ['clave'=>6000,"descripcion"=>"INVERSIÓN PÚBLICA", "anio"=>2021],
            ['clave'=>7000,"descripcion"=>"INVERSIONES FINANCIERAS Y OTRAS PREVISIONES", "anio"=>2021],
            ['clave'=>8000,"descripcion"=>"PARTICIPACIONES Y APORTACIONES", "anio"=>2021],
            ['clave'=>9000,"descripcion"=>"DEUDA PÚBLICA", "anio"=>2021],
        ];

        foreach ($list as $item) {
            \App\Models\Capitulo::create($item);
        }
    }
}
