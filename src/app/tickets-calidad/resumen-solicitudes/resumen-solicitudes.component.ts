import { UsuarioService } from './../../shared/servicios/usuario.service';
import { ModalTicketsPorEstadoComponent } from './modal-tickets-por-estado/modal-tickets-por-estado.component';
import { TicketStatus } from './../../shared/enumerados/ticketStatus';
import { TotalPorRegion } from './../../shared/entidades/totalPorRegion';
import { Utilidades } from './../../shared/utilidades/utilidades';
import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RegionSetting, Ticket, Usuario } from 'src/app/shared/entidades';
import { TicketService } from 'src/app/shared/servicios';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Constantes } from 'src/app/shared/constantes';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resumen-solicitudes',
  templateUrl: './resumen-solicitudes.component.html',
  styleUrls: ['./resumen-solicitudes.component.css'],
})
export class ResumenSolicitudesComponent implements OnInit {
  public usuarioActual: Usuario;
  public tickets: Ticket[] = [];
  public totalesPorRegion: TotalPorRegion[] = [];
  public esPostVenta: boolean;
  public esSoporte: boolean;
  public bsModalRef: BsModalRef;

  constructor(
    private servicioUsuario: UsuarioService,
    private servicioTicket: TicketService,
    private servicioModal: BsModalService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    const ingreso = await this.validarIngreso();
    if (ingreso) {
      this.consultarTickets();
    } else {
      this.cancelar();
    }
  }

  private async validarIngreso(): Promise<boolean> {
    this.usuarioActual =
      localStorage.getItem(Constantes.cookieUsuarioActual) != null
        ? JSON.parse(localStorage.getItem(Constantes.cookieUsuarioActual))
        : await this.servicioUsuario.ObtenerUsuario();
    this.definirRolesUsuario();
    const puedeIngresarAlResumen =
      this.usuarioActual.esAdministrador || this.esPostVenta || this.esSoporte;
    return puedeIngresarAlResumen;
  }

  private definirRolesUsuario() {
    this.esPostVenta =
      this.usuarioActual.roles.filter((r) => r.esPostVenta === true).length > 0;
    this.esSoporte =
      this.usuarioActual.roles.filter((r) => r.esSoporte === true).length > 0;
  }

  public consultarTickets(): void {
    this.spinner.show();
    this.servicioTicket.ObtenerTodos().subscribe((respuesta) => {
      this.tickets = Ticket.fromJsonList(respuesta);
      this.establecerTotalesPorRegion();
    });
  }

  private establecerTotalesPorRegion() {
    let ticketsAgrupadosPorRegion = Utilidades.agruparPor(
      this.tickets,
      (t) => t.region.nombre
    );
    for (const [
      nombreRegion,
      valoresPorRegion,
    ] of ticketsAgrupadosPorRegion.entries()) {
      const totalPorRegion = new TotalPorRegion(
        nombreRegion,
        valoresPorRegion.length,
        valoresPorRegion
      );
      this.totalesPorRegion.push(totalPorRegion);
    }
    this.spinner.hide();
  }

  public obtenerTotalPorRegionyEstado(
    nombreRegion: string,
    estado: TicketStatus
  ): number {
    return this.totalesPorRegion
      .find((t) => t.nombreRegion === nombreRegion)
      .tickets.filter((t) => t.estado === estado).length;
  }

  public abrirModalTicketsPorEstado(
    nombreRegion: string,
    estado: TicketStatus
  ): void {
    const opcionesModal: ModalOptions = {
      initialState: {
        nombreRegion: nombreRegion,
        estado: estado,
      },
      class: 'modal-xl',
    };
    this.bsModalRef = this.servicioModal.show(
      ModalTicketsPorEstadoComponent,
      opcionesModal
    );
  }

  cancelar(): void {
    this.router.navigate([Constantes.routerInicio]);
  }
}
