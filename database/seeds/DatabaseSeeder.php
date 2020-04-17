<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        \App\Models\User::create([
            'name' => 'Usuario Root',
            'username' => 'root',
            'password' => Hash::make('ssa.plataforma'),
            'email' => 'root@localhost',
            'is_superuser' => 1,
            'avatar' => '/assets/avatars/50-king.svg'
        ]);
        
        //Carga de archivos CSV
        $lista_csv = [
            'permissions',
            'roles',
            'role_user',
            'permission_role'
        ];

        //DB::beginTransaction();
        foreach($lista_csv as $csv){
            $archivo_csv = storage_path().'/app/seeds/'.$csv.'.csv';

            $query = sprintf("
                LOAD DATA local INFILE '%s' 
                INTO TABLE $csv 
                FIELDS TERMINATED BY ',' 
                OPTIONALLY ENCLOSED BY '\"' 
                ESCAPED BY '\"' 
                LINES TERMINATED BY '\\n' 
                IGNORE 1 LINES", addslashes($archivo_csv));
            echo $query;
            DB::connection()->getpdo()->exec($query);
        }
    }
}
