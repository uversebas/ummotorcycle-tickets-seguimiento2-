import { RegionSetting } from './shared/entidades/regionSetting';
import { Component, OnInit } from '@angular/core';
import { Constantes } from './shared/constantes';
import { Usuario } from './shared/entidades';
import { UsuarioService } from './shared/servicios';
declare var $: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public title = 'ummotorcycles-tickets-calidad';
  public regiones: RegionSetting[] = [];
  public usuarioActual: Usuario;
  public nombreUsuario: string;
  public esAdministrador: boolean = false;
  public esCliente: boolean = false;
  public esPostVenta: boolean = false;
  public esSoporte: boolean = false;

  constructor(private servicioUsuario: UsuarioService) {}

  ngOnInit(): void {
    this.abrirCerrarMenuDesktop();
    this.abrirCerrarMenuMobile();
    this.obtenerUsuarioActual();
  }

  private async obtenerUsuarioActual(): Promise<void> {
    await this.servicioUsuario.ObtenerUsuario();
    this.usuarioActual = JSON.parse(
      localStorage.getItem(Constantes.cookieUsuarioActual)
    );
    this.nombreUsuario = this.usuarioActual.nombre;
    this.rolesMenu();
  }

  private rolesMenu(): void {
    this.esAdministrador = this.usuarioActual.esAdministrador;
    this.esCliente =
      this.usuarioActual.roles.filter((r) => r.esCliente === true).length > 0;
    this.esPostVenta =
      this.usuarioActual.roles.filter((r) => r.esPostVenta === true).length > 0;
    this.esSoporte =
      this.usuarioActual.roles.filter((r) => r.esSoporte === true).length > 0;
  }

  private abrirCerrarMenuDesktop(): void {
    $(document).ready(function () {
      $('#sidebarToggle').click(function () {
        $('#accordionSidebar').toggleClass('toggled');
      });
    });
  }

  private abrirCerrarMenuMobile(): void {
    $(document).ready(function () {
      $('#sidebarToggleTop').click(function () {
        $('#accordionSidebar').toggleClass('toggled');
      });
    });
  }

  salir(): void {
    location.href = "https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=http://portal.office.com";
  }

}
