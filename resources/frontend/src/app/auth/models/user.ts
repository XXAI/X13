export class User {
    id?: number;
    username?: string;
    email?: string;
    password?: string;
    access_token?: string;
    name?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    avatar?: string;
    unidad_medica_asginada?:Object;
    unidad_medica_asignada_id?:number;
    is_superuser?: boolean;
  }