import { Ticket } from './../../../shared/entidades/ticket';
import { Component, OnInit } from '@angular/core';
import { TicketService } from 'src/app/shared/servicios';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-modal-tickets-por-estado',
  templateUrl: './modal-tickets-por-estado.component.html'
})
export class ModalTicketsPorEstadoComponent implements OnInit {
  public nombreRegion: string;
  public estado: string;
  public ticketsByStatus: Ticket[] = [];
  public mostrarProgreso: boolean;

  //Paginador
  p = 1;

  constructor(
    public bsModalRef: BsModalRef,
    private servicioTicket: TicketService
  ) {}

  ngOnInit(): void {
    this.mostrarProgreso = true;
    this.obtenerTicketsPorRegionYEstado(this.nombreRegion, this.estado);
  }

  obtenerTicketsPorRegionYEstado(nombreRegion: string, estado: string): void {
    this.servicioTicket
      .ObtenerPorRegionYEstado(nombreRegion, estado)
      .subscribe((respuesta) => {
        this.ticketsByStatus = Ticket.fromJsonList(respuesta);
        this.mostrarProgreso = false;
      });
  }
}
