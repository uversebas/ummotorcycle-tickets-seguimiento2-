
import { Constantes } from '../constantes';
import { RegionSetting } from './regionSetting';
import { RolUsuario } from './rolUsuario';

export class Usuario {
  public nombre: string;
  public id?: number;
  public email?: string;
  public esAdministrador?: boolean;
  public grupos: string[] = [];
  public roles?: RolUsuario[] = [];

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
    if (usuario.grupos.includes(Constantes.grupoAdministrador)) {
      usuario.esAdministrador = true;
    }
    usuario.grupos.sort((one, two) => (one > two ? -1 : 1));
  }

  public static asignacionRolesUsuario(
    usuario: Usuario,
    regiones: RegionSetting[]
  ): void {
    regiones.forEach((region) => {
      const esCliente: boolean =
        usuario.grupos.indexOf(region.grupoCliente) > -1;
      const esPostVenta: boolean =
        usuario.grupos.indexOf(region.grupoPostVenta) > -1;
      const esSoporte: boolean =
        usuario.grupos.indexOf(region.grupoSoporte) > -1;
      const rolUsuario: RolUsuario = new RolUsuario(
        region,
        esCliente,
        esPostVenta,
        esSoporte
      );
      usuario.roles.push(rolUsuario);
    });
  }
}
