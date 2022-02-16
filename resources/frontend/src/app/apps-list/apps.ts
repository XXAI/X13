export class App {
    name:string;
    route: string;
    icon: string;
    permission?: string; //Si tiene permisos se motrara/oculatara dependiendo de los permisos que el usuario tenga asignado
    hideHome?:boolean; //Si es verdadero ocultara el elemento que dirige a raiz, en la lista que aparece en los modulos con hijos (la raiz es la ruta de la aplicación padre)
    isHub?:boolean; //Si es verdadero solo mostrara la aplicación en el HUB cuando tenga al menos un hijo activo, de lo contario se ocultara, si es falso siempre estara presente en el HUB (tomando encuenta los permisos asignados) sin importar si tiene hijos o no activos
    children?:App[]; //Lista de modulos y componentes hijos de la aplicación
    apps?:App[]; //Hub secundario de apps
}

export const APPS:App [] = [
    { name:"Usuarios",  route: "usuarios",      icon: "assets/icons/users.svg",              permission:"nTSk4Y4SFKMyQmRD4ku0UCiNWIDe8OEt" },
    { name:'Permisos',  route: "permisos",      icon: "assets/icons/security-shield.svg",    permission:"RGMUpFAiRuv7UFoJroHP6CtvmpoFlQXl" },
    { name:'Roles',     route: "roles",         icon: "assets/icons/users-roles.svg",        permission:"nrPqEhq2TX0mI7qT7glaOCJ7Iqx2QtPs" },
    { name:'Almacen',   route: "almacen",       icon: "assets/icons/almacen.svg", 
      apps:[
        { name:'Entradas',        route: "almacen/entradas",        icon: "assets/icons/entrada-almacen.svg", permission:"snyR2BzbSqXJHVQCgjnWqgseP0pqLnhe"  },
        { name:'Salidas',         route: "almacen/salidas",         icon: "assets/icons/salida-almacen.svg",  permission:"q6iwrTdBPOSA7ivxWzs21oiEqtWSUVXb"  },
        { name:'Ajustes',         route: "almacen/ajustes",         icon: "assets/icons/ajustes.svg",         permission:"JG3XhY37bRwqzbpO7bHHSUYosM02NduK"  },
        { name:'Existencias',     route: "almacen/existencias",     icon: "assets/icons/existencias.svg",     permission:"zFdj3x3UfqRsp5DeAGBVm5elqvkvnIr1"  },
        { name:'Transferencias',  route: "almacen/transferencias",  icon: "assets/icons/transferencia.svg",   permission:"JG3XhY37bRwqzbpO7bHHSUYosM02NduK"  },
        { name:'Inventario',      route: "almacen/inventario",      icon: "assets/icons/inventario.svg",      permission:"JG3XhY37bRwqzbpO7bHHSUYosM02NduK"  },
        { name:'Importar datos',  route: "almacen/importar",      icon: "assets/icons/subir.svg",             permission:"8Az68Smo3I75X4FlfZSwtyRy790CN2Sz"  },
      ]
    },
    { name:'Pedidos',   route: "pedidos",       icon: "assets/icons/pedidos-hub.svg",
      apps:[
        { name:'Pedidos Ordinarios',        route: "pedidos/pedidos-ordinarios",     icon: "assets/icons/pedidos.svg",           permission:"ibafSHvu8BUE5lc4FO0xvl4ZvFFvHcJZ" },
        { name:'Recepción de Pedidos',      route: "pedidos/recepcion-pedidos",      icon: "assets/icons/recepcion-pedidos.svg", permission:"5ZbNLsYUWx6w6mTY4wcJlcaBrrNYr85D" },
      ]
    },
    { name:'Captura Semanal: Abasto y Surtimiento',  route: "captura-reporte-semanal",      icon: "assets/icons/captura-reporte.svg",    permission:"BA4rXXfPIcaePRspIOTl88I4HH00INQa" },
    { name:'Admin Captura: Abasto y Surtimiento',    route: "admin-captura-reporte-semanal",      icon: "assets/icons/admin-captura-reporte.svg",    permission:"BjvroJXhbaJvcKrBnxHpRRBq2u6BovUN" },
    { name:'Catalogos',       route: "catalogos",             icon: "assets/icons/catalogos.svg", permission:"JG3XhY37bRwqzbpO7bHHSUYosM02NduK",
      apps:[
        { name:'Almacenes',   route: "catalogos/almacenes",   icon: "assets/icons/catalogo-almacenes.svg", permission:"JG3XhY37bRwqzbpO7bHHSUYosM02NduK" },
      ]
    },
    { name:'Configuración Sistema',   route: "configuracion",  icon: "assets/icons/configuracion-sistema.svg", permission:"JG3XhY37bRwqzbpO7bHHSUYosM02NduK",
      apps:[
        { name:'Grupos de Unidades',   route: "configuracion/grupos",           icon: "assets/icons/catalogo-grupos.svg", permission:"JG3XhY37bRwqzbpO7bHHSUYosM02NduK" },
        { name:'Tipos de Pedidos',     route: "configuracion/tipos-pedidos",    icon: "assets/icons/tipos-pedidos.svg", permission:"JG3XhY37bRwqzbpO7bHHSUYosM02NduK" },
      ]
    },
    { name:'Configuración Unidad',   route: "configuracion-unidad",     icon: "assets/icons/configuracion-unidad.svg", isHub:true, hideHome:true,
      children:[
        {name:'Catalogo de Articulos',  route:'configuracion-unidad/catalogo-articulos',  icon:'format_list_bulleted',  permission:"5IGo0daq6vkWxyfesewdq4eBL2aexpCO"},
        {name:'Almacenes',              route:'configuracion-unidad/almacenes',           icon:'inventory',             permission:"g3ZLa9MK5dl0ozpR4zU0pN8l0j7ENgBe"}
      ],
    },
    { name:'Herramientas Dev', route: "dev-tools",  icon: "assets/icons/toolbox.svg", isHub:true, hideHome:true, 
      children:[
        {name:'Reportes MySQL', route:'dev-tools/mysql-reportes', icon:'insert_drive_file', permission:"6ARHQGj1N8YPkr02DY04K1Zy7HjIdDcj"},
        {name:'JSON a Excel',   route:'dev-tools/json-excel',     icon:'text_snippet',      permission:"6ARHQGj1N8YPkr02DY04K1Zy7HjIdDcj"}
      ],
    },
    /*
    { name: "Seguridad", route: "seguridad", icon: "assets/icons/security-shield.svg", 
        children: [
            {name:'Permisos',route:'permisos',icon:'lock', permission:"RGMUpFAiRuv7UFoJroHP6CtvmpoFlQXl"},
            {name:'Roles',route:'roles',icon:'people_alt', permission:"nrPqEhq2TX0mI7qT7glaOCJ7Iqx2QtPs"}
        ] 
    },*/
    //{ name: "Viáticos", route: "configuracion", icon: "assets/icons/travel-expenses.png" },
    //{ name: "Herramientas", route: "herramientas", icon: "assets/icons/toolbox.svg" },    
    //{ name: "Configuración", route: "configuracion", icon: "assets/icons/settings.svg" },8QnE1cYkjjNAmM7qHSf1CSlPMJiQeqr5
]