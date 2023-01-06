import { BitacoraComponent } from './../bitacora/bitacora.component';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { Constantes } from 'src/app/shared/constantes';
import { PlantillaEmail, Ticket, Usuario } from 'src/app/shared/entidades';
import { TicketStatus } from 'src/app/shared/enumerados/ticketStatus';
import {
  CorreoService,
  ModalService,
  TicketService,
  UsuarioService,
} from 'src/app/shared/servicios';
import { AsignarPosventaComponent } from './asignar-posventa/asignar-posventa.component';
import { AgregarComentarioComponent } from './agregar-comentario/agregar-comentario.component';

@Component({
  selector: 'app-gestionar-ticket',
  templateUrl: './gestionar-ticket.component.html',
})
export class GestionarTicketComponent implements OnInit {
  public ticket: Ticket;
  public usuarioActual: Usuario;
  public mostrarAsignarPostVentas = false;
  public mostrarRevisionAprobacion = false;
  public mostrarFeedbackProveedores = false;
  public mostrarSolucion = false;
  public emailsTemplate: PlantillaEmail[] = [];

  bsModalRef: BsModalRef;

  constructor(
    private activeRoute: ActivatedRoute,
    private servicioTicket: TicketService,
    private spinner: NgxSpinnerService,
    private servicioModal: BsModalService,
    private servicioNotificacion: ModalService,
    private servicioUsuario: UsuarioService,
    private servicioCorreo: CorreoService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.spinner.show();
    await this.servicioUsuario.ObtenerUsuario().then(() => {
      this.usuarioActual = JSON.parse(
        localStorage.getItem(Constantes.cookieUsuarioActual)
      );
      this.obtenerTicket();
      this.obtenerPlantillasEmail();
    });
  }

  public asignarPostVentas(): void {
    this.bsModalRef = this.servicioModal.show(AsignarPosventaComponent);
    this.bsModalRef.content.ticket = this.ticket;
    this.bsModalRef.content.emailsTemplate = this.emailsTemplate;
    this.bsModalRef.content.usuarioActual = this.usuarioActual;
    this.bsModalRef.content.onClose.subscribe(
      (resultadoTransaccion: boolean) => {
        if (resultadoTransaccion) {
          this.spinner.hide();
          this.servicioNotificacion.Exito(
            'Great!',
            'your request has been sent successfully',
            () => this.router.navigate([Constantes.routerTodosLosTickets])
          );
        }
      }
    );
  }

  public enviarComentario(): void {
    this.bsModalRef = this.servicioModal.show(AgregarComentarioComponent);
    this.bsModalRef.content.ticket = this.ticket;
    this.bsModalRef.content.emailsTemplate = this.emailsTemplate;
  }

  private obtenerTicket(): void {
    this.activeRoute.params.subscribe((parametros) => {
      let id = 0;
      if (parametros && parametros.id) {
        id = parametros.id;
      }
      if (id > 0) {
        this.servicioTicket.ObtenerPorId(id).subscribe((respuesta) => {
          if (respuesta.length > 0) {
            this.ticket = Ticket.fromJson(respuesta[0]);
            this.validarAcciones();
            this.spinner.hide();
          } else {
          }
        });
      } else {
      }
    });
  }

  private obtenerPlantillasEmail(): void {
    this.servicioCorreo.obtenerEmails().subscribe((respuesta) => {
      this.emailsTemplate = PlantillaEmail.fromJsonList(respuesta);
    });
  }

  private validarAcciones(): void {
    this.mostrarAsignarPostVentas =
      this.usuarioActual.esAdministrador &&
      this.ticket.estado === TicketStatus.CREATED;
    this.mostrarRevisionAprobacion =
      this.ticket.estado === TicketStatus.ASSIGNEDAFTERSALES ||
      this.ticket.estado === TicketStatus.WATINGFORCUSTOMER ||
      this.ticket.estado === TicketStatus.ASSIGNEDTOSUPPORT ||
      this.ticket.estado === TicketStatus.SUPPLIERS ||
      this.ticket.estado === TicketStatus.RESOLVED;
    this.mostrarFeedbackProveedores =
      this.ticket.estado === TicketStatus.ASSIGNEDTOSUPPORT ||
      this.ticket.estado === TicketStatus.SUPPLIERS ||
      this.ticket.estado === TicketStatus.RESOLVED;
    this.mostrarSolucion =
      this.ticket.estado === TicketStatus.SUPPLIERS ||
      this.ticket.estado === TicketStatus.RESOLVED;
  }

  public mostrarBitacora(): void {
    const opcionesModal: ModalOptions = {
      initialState: {
        ticket: this.ticket,
      },
      class: 'modal-lg',
    };
    this.bsModalRef = this.servicioModal.show(BitacoraComponent, opcionesModal);
  }
}
