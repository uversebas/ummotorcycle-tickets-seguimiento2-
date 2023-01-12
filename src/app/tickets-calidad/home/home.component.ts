import { UsuarioService } from './../../shared/servicios/usuario.service';
import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Constantes } from 'src/app/shared/constantes';
import { Usuario } from 'src/app/shared/entidades';

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

  constructor(
    private spinner: NgxSpinnerService,
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
  }

  private async asignacionRolesUsuario(usuarioActual: Usuario): Promise<void> {
    const grupos = await this.servicioUsuario.ObtenerGruposPorUsuario(usuarioActual);
    Usuario.asignarGrupo(grupos, usuarioActual);
  }
}
