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
  public mostrarHome = false;

  constructor(
    private spinner: NgxSpinnerService,
    private servicioUsuario: UsuarioService
  ) {}

  ngOnInit(): void {
    this.spinner.show();
    this.obtenerUsuarioActual();
    this.spinner.hide();
  }

  private async obtenerUsuarioActual(): Promise<void> {
    await this.servicioUsuario.ObtenerUsuario();
    this.usuarioActual = JSON.parse(
      localStorage.getItem(Constantes.cookieUsuarioActual)
    );
    this.mostrarHome = true;
  }
}
