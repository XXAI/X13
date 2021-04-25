<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class FamiliasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $list = [
            ['nombre'=>"Abatelenguas"],
            ['nombre'=>"Analgésicos"],
            ['nombre'=>"Anestésicos"],
            ['nombre'=>"Antiácidos y demulcentes (digestivos)"],
            ['nombre'=>"Antibióticos"],
            ['nombre'=>"Antidiarréicos"],
            ['nombre'=>"Antiespasmodicos (espasmoliticos)"],
            ['nombre'=>"Antihistamínicos"],
            ['nombre'=>"Antiinflamatorios"],
            ['nombre'=>"Antiparasitarios"],
            ['nombre'=>"Antiséptico"],
            ['nombre'=>"Antivirales"],
            ['nombre'=>"Apositos"],
            ['nombre'=>"Cepillos dentales"],
            ['nombre'=>"Cintas adhesivas"],
            ['nombre'=>"Cubrebocas"],
            ['nombre'=>"Dermatologia"],
            ['nombre'=>"Descongestionantes"],
            ['nombre'=>"Enfermedades Infecciosas y Parasitarias"],
            ['nombre'=>"Equipo de venoset"],
            ['nombre'=>"Gasas"],
            ['nombre'=>"Gastroenterología"],
            ['nombre'=>"Gel"],
            ['nombre'=>"Guantes"],
            ['nombre'=>"Guata"],
            ['nombre'=>"Hojas para bisturi"],
            ['nombre'=>"Jabón"],
            ['nombre'=>"Jeringas hipodérmicas"],
            ['nombre'=>"Laxantes (purgantes y colinergicos)"],
            ['nombre'=>"Neumología"],
            ['nombre'=>"Otros"],
            ['nombre'=>"Soluciones Antisepticas"],
            ['nombre'=>"Sueros y vacunas"],
            ['nombre'=>"Sutura sintetica"],
            ['nombre'=>"Termómetros"],
            ['nombre'=>"Tiras reactivas"],
            ['nombre'=>"Vendas"],
            ['nombre'=>"Vitaminas"],
        ];

        foreach ($list as $item) {
            \App\Models\Familia::create($item);
        }
    }
}
