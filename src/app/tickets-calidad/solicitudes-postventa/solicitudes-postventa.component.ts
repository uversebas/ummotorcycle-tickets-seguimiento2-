import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { AppSettings, Constantes, handleError } from 'src/app/shared/constantes';
import { Ticket, Usuario } from 'src/app/shared/entidades';
import { TicketService, UsuarioService } from 'src/app/shared/servicios';

@Component({
  selector: 'app-solicitudes-postventa',
  templateUrl: './solicitudes-postventa.component.html'
})
export class SolicitudesPostventaComponent implements OnInit {
  public usuarioActual: Usuario;
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();

  solicitudes: Ticket[] = [];

  constructor(    
    private spinner: NgxSpinnerService,
    private servicioUsuario: UsuarioService,
    private servicioTicket: TicketService,
    private router: Router) { }

  async ngOnInit() {
    const ingreso = await this.validarIngreso();
    if (ingreso) {
      this.spinner.show();
      this.configurarDataTable();
      this.consultarSolicitudes();
    } else {
      this.cancelar();
    }
  }

  private async validarIngreso(): Promise<boolean> {
    this.usuarioActual =
      localStorage.getItem(Constantes.cookieUsuarioActual) != null
        ? JSON.parse(localStorage.getItem(Constantes.cookieUsuarioActual))
        : await this.servicioUsuario.ObtenerUsuario();
    const esAdministrador = this.usuarioActual.esAdministrador;
    const esPostVenta =
      this.usuarioActual.roles.filter((r) => r.esPostVenta === true).length > 0;
    return esAdministrador || esPostVenta;
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  private configurarDataTable(): void {
    this.dtOptions = AppSettings.obtenerConfiguracionTablaGeneral();
  }

  private consultarSolicitudes(): void {
    this.servicioTicket.obtenerTicketsPostVentas().subscribe(
      (respuesta) => {
        this.solicitudes = Ticket.fromJsonList(respuesta);
        this.dtTrigger.next();
        this.spinner.hide();
      },
      (error) => this.mostrarErroryTerminar(error)
    );
  }

  private mostrarErroryTerminar(error: any): void {
    this.spinner.hide();
    handleError(error);
  }

  cancelar(): void {
    this.router.navigate([Constantes.routerInicio]);
  }

}
