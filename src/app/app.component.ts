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
  public title = 'ummotorcycles-trancing-tickets';
  public usuarioActual: Usuario;
  public nombreUsuario: string;

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
