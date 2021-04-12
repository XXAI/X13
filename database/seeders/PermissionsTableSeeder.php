<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;

class PermissionsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $basic_permissions = [
            ['id'=>'1z9Sv2fC1ALXdM80L0QHs9c3HLDoAOO8','description'=>'Crear Roles',          'group'=>'SEGURIDAD/ROLES',      'is_super'=>false ],
            ['id'=>'G8aCoYYCgE8fAwegn0MvWjxMXhxIIrhy','description'=>'Seleccionar Permiso',  'group'=>'SEGURIDAD/PERMISOS',   'is_super'=>false ],
            ['id'=>'lJFsnYJCnFcVPVBBUOQrmlv3b6Y2X2ZE','description'=>'Crear Usuarios',       'group'=>'ADMIN/USUARIOS',       'is_super'=>false ],
            ['id'=>'m0D4LIsO7V79aDueMDjgWGOmp8mPW6c0','description'=>'Seleccionar Rol',      'group'=>'SEGURIDAD/ROLES',      'is_super'=>false ],
            ['id'=>'n5TraVIrRoioG1kqdHsIaZLYDvxO8MFD','description'=>'Eliminar Usuarios',    'group'=>'ADMIN/USUARIOS',       'is_super'=>false ],
            ['id'=>'nrPqEhq2TX0mI7qT7glaOCJ7Iqx2QtPs','description'=>'Ver Roles',            'group'=>'SEGURIDAD/ROLES',      'is_super'=>false ],
            ['id'=>'nTSk4Y4SFKMyQmRD4ku0UCiNWIDe8OEt','description'=>'Ver Usuarios',         'group'=>'ADMIN/USUARIOS',       'is_super'=>false ],
            ['id'=>'QpKVz00WUbZVJMPFu3iBNGBTdMFYubQ2','description'=>'Eliminar Roles',       'group'=>'SEGURIDAD/ROLES',      'is_super'=>false ],
            ['id'=>'RGMUpFAiRuv7UFoJroHP6CtvmpoFlQXl','description'=>'CRUD Permisos',        'group'=>'SEGURIDAD/PERMISOS',   'is_super'=>true  ],
            ['id'=>'v216XcAzgbt4mIjj6gZP2rdRTupXz0AO','description'=>'Editar Roles',         'group'=>'SEGURIDAD/ROLES',      'is_super'=>false ],
            ['id'=>'W8Xmv3hiIyIpkZfJMaL9MsRxxuSIiO5R','description'=>'Editar Usuarios',      'group'=>'ADMIN/USUARIOS',       'is_super'=>false ],
            ['id'=>'6ARHQGj1N8YPkr02DY04K1Zy7HjIdDcj','description'=>'Herramientas Dev',     'group'=>'DEV-TOOLS',            'is_super'=>false ],
        ];

        foreach ($basic_permissions as $permission) {
            \App\Models\Permission::create($permission);
        }
    }
}
