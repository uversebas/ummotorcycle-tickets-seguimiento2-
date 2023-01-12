
import { Constantes } from '../constantes';

export class Usuario {
  public nombre: string;
  public id?: number;
  public email?: string;
  public esAdministrador?: boolean;
  public esComercial?: boolean;
  public esMarketing?: boolean;
  public esSoporteLogistica?: boolean;
  public esCalidad?: boolean;
  public grupos: string[] = [];

  constructor(
    nombre: string,
    id?: number,
    email?: string,
    esAdministrador?: boolean
  ) {
    this.nombre = nombre;
    this.email = email;
    this.esAdministrador = esAdministrador;
    this.id = id;
  }

  public static fromJson(element: any): Usuario {
    if (element.Id) {
      const usuario = new Usuario(element.Title, element.Id, element.Email);
      usuario.esAdministrador = element.IsSiteAdmin;
      return usuario;
    }
    return new Usuario(element.Title, element.ID, element.Email);
  }

  public static fromJsonList(elements: any): any[] {
    const list = [];
    elements.forEach((element: any) => {
      list.push(this.fromJson(element));
    });
    return list;
  }

  public static asignarGrupo(elements: any, usuario: Usuario): void {
    usuario.grupos = new Array();
    elements.forEach((element: any) => {
      usuario.grupos.push(element.LoginName);
    });
    usuario.esAdministrador = usuario.grupos.includes(Constantes.grupoAdministrador);
    usuario.esComercial = usuario.grupos.includes(Constantes.grupoComercial);
    usuario.esCalidad = usuario.grupos.includes(Constantes.grupoCalidad);
    usuario.esSoporteLogistica = usuario.grupos.includes(Constantes.grupoSoporteLogistica);
    usuario.esMarketing = usuario.grupos.includes(Constantes.grupoMarketing);
    usuario.grupos.sort((one, two) => (one > two ? -1 : 1));
  }
}
