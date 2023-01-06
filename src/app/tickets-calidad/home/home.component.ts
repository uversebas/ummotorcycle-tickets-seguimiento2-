import { UsuarioService } from './../../shared/servicios/usuario.service';
import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Constantes } from 'src/app/shared/constantes';
import { RegionSetting, Usuario } from 'src/app/shared/entidades';
import { RegionSettingService } from 'src/app/shared/servicios';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  public usuarioActual: Usuario;
  public esAdministrador: boolean;
  public esCliente: boolean;
  public esPostVenta: boolean;
  public esSoporte: boolean;
  public regiones: RegionSetting[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    private servicioRegiones: RegionSettingService,
    private servicioUsuario: UsuarioService
  ) {}

  ngOnInit(): void {
    this.spinner.show();
    this.obtenerUsuarioCookie();
    this.obtenerRolesUsuario();
    this.spinner.hide();
  }

  private obtenerUsuarioCookie(): void {
    this.usuarioActual = JSON.parse(
      localStorage.getItem(Constantes.cookieUsuarioActual)
    );
  }

  public async obtenerRolesUsuario(): Promise<void> {
    this.esAdministrador = this.usuarioActual.esAdministrador;
    if (this.usuarioActual.roles) {
      this.definirRolesUsuario();
    } else {
      await this.asignacionRolesUsuario(this.usuarioActual);
      this.definirRolesUsuario();
    }
  }

  private async asignacionRolesUsuario(usuarioActual: Usuario): Promise<void> {
    this.regiones = await this.servicioRegiones.obtenerTodos();
    const grupos = await this.servicioUsuario.ObtenerGruposPorUsuario(usuarioActual);
    Usuario.asignarGrupo(grupos, usuarioActual);
    Usuario.asignacionRolesUsuario(usuarioActual, this.regiones);
  }

  private definirRolesUsuario() {
    this.esCliente =
      this.usuarioActual.roles.filter((r) => r.esCliente === true).length > 0;
    this.esPostVenta =
      this.usuarioActual.roles.filter((r) => r.esPostVenta === true).length > 0;
    this.esSoporte =
      this.usuarioActual.roles.filter((r) => r.esSoporte === true).length > 0;
  }
}
