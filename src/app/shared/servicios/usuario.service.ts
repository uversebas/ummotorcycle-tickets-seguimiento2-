import { RegionSetting } from './../entidades/regionSetting';
import { RegionSettingService } from './region-setting.service';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { ISiteGroupInfo } from '@pnp/sp/site-groups';
import { ISiteUserInfo } from '@pnp/sp/site-users/types';
import { from, Observable } from 'rxjs';
import { Constantes } from '../constantes';
import { Usuario } from '../entidades';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  public regiones: RegionSetting[] = [];

  constructor(private servicioRegiones: RegionSettingService) {}

  public async ObtenerUsuarioActual(): Promise<any> {
    return await from(
      Constantes.getConfig(environment.web).web.currentUser.get()
    ).toPromise();
  }

  public ObtenerUsuarioEnGrupo(
    nombreGrupo: string
  ): Observable<ISiteGroupInfo> {
    const respuesta = from(
      Constantes.getConfig(environment.web)
        .web.currentUser.groups.getByName(nombreGrupo)
        .get()
    );
    return respuesta;
  }

  public async ObtenerGruposPorUsuario(usuario: Usuario): Promise<any> {
    return await from(
      Constantes.getConfig(environment.web)
        .web.siteUsers.getById(usuario.id)
        .groups.get()
    ).toPromise();
  }

  public ObtenerUsuariosSitioActual(): Observable<ISiteUserInfo[]> {
    const respuesta = from(
      Constantes.getConfig(environment.web).web.siteUsers.get()
    );
    return respuesta;
  }

  public async ObtenerPorId(id: number): Promise<any> {
    return await from(
      Constantes.getConfig(environment.web).web.siteUsers.getById(id).get()
    ).toPromise();
  }

  public async ObtenerUsuario(): Promise<void> {
    let usuarioActual: Usuario = JSON.parse(
      localStorage.getItem(Constantes.cookieUsuarioActual)
    );
    const respuestaUsuario = await this.ObtenerUsuarioActual();
    usuarioActual = Usuario.fromJson(respuestaUsuario);
    await this.asignacionRolesUsuario(usuarioActual);
    this.GuardarUsuarioLocalStorage(usuarioActual);
  }
  
  public ObtenerUsuariosEnGrupo(
    nombreGrupo: string
  ): Observable<any> {
    const respuesta = from(
      Constantes.getConfig(environment.web)
        .web.siteGroups.getByName(nombreGrupo).users.get()
    );
    return respuesta;
  } 

  private async asignacionRolesUsuario(usuarioActual: Usuario): Promise<void> {
    this.regiones = await this.servicioRegiones.obtenerTodos();
    const grupos = await this.ObtenerGruposPorUsuario(usuarioActual);
    Usuario.asignarGrupo(grupos, usuarioActual);
    Usuario.asignacionRolesUsuario(usuarioActual, this.regiones);
  }

  private GuardarUsuarioLocalStorage(usuarioActual: Usuario): void {
    localStorage.setItem(
      Constantes.cookieUsuarioActual,
      JSON.stringify(usuarioActual)
    );
  }
}
