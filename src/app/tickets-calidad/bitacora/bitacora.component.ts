import { Comentario, Ticket } from 'src/app/shared/entidades';
import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ComentarioService } from 'src/app/shared/servicios';
import { Constantes } from 'src/app/shared/constantes';
import { TicketStatus } from 'src/app/shared/enumerados';

@Component({
  selector: 'app-bitacora',
  templateUrl: './bitacora.component.html',
  styleUrls: ['./bitacora.component.css'],
})
export class BitacoraComponent implements OnInit {
  ticket: Ticket;
  comentarios: Comentario[] = [];

  //Estados
  estadoCreated = TicketStatus.CREATED;
  estadoAssignedToAfterSales = TicketStatus.ASSIGNEDAFTERSALES;
  estadoRequestForCustomerInformation = TicketStatus.WATINGFORCUSTOMER;
  estadoAssignedToSupport = TicketStatus.ASSIGNEDTOSUPPORT;
  estadoSuppliersFeedback = TicketStatus.SUPPLIERS;
  estadoResolved = TicketStatus.RESOLVED;

  constructor(public bsModalRef: BsModalRef, private servicioComentarios: ComentarioService) {}

  ngOnInit(): void {
    this.cargarComentarios();
  }

  public async cargarComentarios(): Promise<void> {
    this.limpiarComentarios();
    this.comentarios = await this.servicioComentarios.Obtener(
      this.ticket.id,
      Constantes.listaTicket
    );
  }

  limpiarComentarios(): void {
    this.comentarios = [];
  }

}
