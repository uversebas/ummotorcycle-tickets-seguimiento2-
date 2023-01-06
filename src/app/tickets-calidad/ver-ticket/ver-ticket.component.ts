import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Parte, Ticket, Vin } from 'src/app/shared/entidades';
import { TicketStatus } from 'src/app/shared/enumerados/ticketStatus';
import { PartesService, TicketService, VinService } from 'src/app/shared/servicios';
import { Utilidades } from 'src/app/shared/utilidades/utilidades';

@Component({
  selector: 'app-ver-ticket',
  templateUrl: './ver-ticket.component.html'
})
export class VerTicketComponent implements OnInit {

  public imagenes: string[] = [];
  public partes: Parte[] = [];
  public vins: Vin[] = [];
  public ticket: Ticket;
  public avance: number = 0;
  public mostrarSolucionCliente = false;

  constructor(
    private servicioTicket: TicketService,
    private servicioPartes: PartesService,
    private servicionVins: VinService,
    private activeRoute: ActivatedRoute,
    private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.spinner.show();
    this.obtenerTicket();
  }

  private obtenerTicket(): void {
    this.activeRoute.params.subscribe(parametros => {
      let id = 0;
      if (parametros && parametros.id) {
        id = parametros.id;
      }
      if (id > 0) {
        this.servicioTicket.ObtenerPorId(id).subscribe(respuesta => {
          if (respuesta.length > 0) {
            this.ticket = Ticket.fromJson(respuesta[0]);
            this.avance = Utilidades.calcularAvanceTicket(this.ticket.estado);
            this.mostrarSolucionCliente = this.ticket.estado === TicketStatus.RESOLVED;
            this.obtenerPartes();
            this.obtenerVins();
            this.spinner.hide();  
          } else {

          }
        });
      } else {

      }
    });
  }

  private obtenerPartes(): void {
    this.servicioPartes.obtenerPorTicket(this.ticket.id).subscribe(respuesta => {
      this.partes = Parte.fromJsonList(respuesta);
    });
  }

  private obtenerVins(): void {
    this.servicionVins.obtenerPorTicket(this.ticket.id).subscribe(respuesta => {
      this.vins = Vin.fromJsonList(respuesta);
    });
  }

}
